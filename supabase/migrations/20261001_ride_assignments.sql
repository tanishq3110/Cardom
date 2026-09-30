-- ============================================================
-- Cardom Partner App — Ride Booking Phase 2
-- Migration: 20261001_ride_assignments.sql
-- ============================================================
-- Run this in Supabase SQL Editor AFTER 20261001_ride_booking.sql
-- from the User App has been applied.
-- ============================================================

-- ── 1. ride_assignments table ─────────────────────────────────

create table if not exists public.ride_assignments (
  id               uuid primary key default gen_random_uuid(),
  ride_id          uuid not null references public.ride_bookings(id) on delete cascade,
  partner_id       uuid not null references auth.users(id) on delete cascade,
  partner_status   text not null default 'new'
                   check (partner_status in ('new','accepted','started','completed','cancelled','rejected')),
  assigned_at      timestamptz not null default now(),
  accepted_at      timestamptz,
  started_at       timestamptz,
  completed_at     timestamptz,
  updated_at       timestamptz not null default now(),
  unique(ride_id, partner_id)
);

create index if not exists ride_assignments_partner_id_idx on public.ride_assignments (partner_id);
create index if not exists ride_assignments_ride_id_idx    on public.ride_assignments (ride_id);

-- ── 2. updated_at trigger ─────────────────────────────────────

-- Reuse existing set_updated_at function (already created by ride_booking migration)
-- or re-create it safely:
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ride_assignments_set_updated_at on public.ride_assignments;
create trigger ride_assignments_set_updated_at
  before update on public.ride_assignments
  for each row execute function public.set_updated_at();

-- ── 3. RLS on ride_assignments ────────────────────────────────

alter table public.ride_assignments enable row level security;

-- Partner can read their own assignments
drop policy if exists "ride_assignments_select_own" on public.ride_assignments;
create policy "ride_assignments_select_own"
  on public.ride_assignments for select
  using (auth.uid() = partner_id);

-- Partner can update their own assignments (e.g. cancel from their side)
-- Status transitions via RPCs are preferred for atomic safety.
drop policy if exists "ride_assignments_update_own" on public.ride_assignments;
create policy "ride_assignments_update_own"
  on public.ride_assignments for update
  using (auth.uid() = partner_id)
  with check (auth.uid() = partner_id);

-- NO INSERT policy for partners — inserts only via security definer RPC
-- NO DELETE policy

-- ── 4. New RLS policies on ride_bookings for partners ─────────

-- Partners can SELECT ride_bookings rows they are assigned to
-- (via ride_assignments). This is safe: uses subquery on ride_assignments
-- which is also RLS-protected.
drop policy if exists "ride_bookings_select_assigned_partner" on public.ride_bookings;
create policy "ride_bookings_select_assigned_partner"
  on public.ride_bookings for select
  using (
    exists (
      select 1
      from public.ride_assignments ra
      where ra.ride_id = public.ride_bookings.id
        and ra.partner_id = auth.uid()
    )
  );

-- Partners can UPDATE ride_bookings rows they have accepted/started
-- Actual updates go through RPCs, but this grants the DB-level permission.
drop policy if exists "ride_bookings_update_assigned_partner" on public.ride_bookings;
create policy "ride_bookings_update_assigned_partner"
  on public.ride_bookings for update
  using (
    exists (
      select 1
      from public.ride_assignments ra
      where ra.ride_id = public.ride_bookings.id
        and ra.partner_id = auth.uid()
        and ra.partner_status in ('accepted', 'started')
    )
  );

-- ── 5. RPC: get_available_rides ───────────────────────────────
-- Security definer: returns only safe fields from searching rides.
-- Partners never get user_id or personal user data through this.

create or replace function public.get_available_rides()
returns table (
  id                        uuid,
  booking_reference         text,
  pickup_address            text,
  drop_address              text,
  ride_type                 text,
  estimated_fare            numeric,
  estimated_distance_km     numeric,
  estimated_duration_minutes integer,
  created_at                timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  return query
  select
    rb.id,
    rb.booking_reference,
    rb.pickup_address,
    rb.drop_address,
    rb.ride_type,
    rb.estimated_fare,
    rb.estimated_distance_km,
    rb.estimated_duration_minutes,
    rb.created_at
  from public.ride_bookings rb
  where rb.status = 'searching'
    -- Exclude rides this partner already rejected
    and not exists (
      select 1
      from public.ride_assignments ra
      where ra.ride_id = rb.id
        and ra.partner_id = auth.uid()
        and ra.partner_status = 'rejected'
    )
  order by rb.created_at asc
  limit 50;
end;
$$;

-- ── 6. RPC: assign_ride_to_partner ───────────────────────────
-- Creates or refreshes an assignment record for the calling partner.
-- Does NOT accept the ride — just marks interest.

create or replace function public.assign_ride_to_partner(p_ride_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner_id uuid;
  v_ride       record;
  v_existing   record;
  v_assignment record;
begin
  v_partner_id := auth.uid();
  if v_partner_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Verify ride exists and is still searching
  select * into v_ride
  from public.ride_bookings
  where id = p_ride_id
    and status = 'searching';

  if not found then
    return json_build_object('success', false, 'error', 'Ride not available');
  end if;

  -- Check if already accepted by this partner
  select * into v_existing
  from public.ride_assignments
  where ride_id = p_ride_id and partner_id = v_partner_id;

  if found then
    if v_existing.partner_status = 'accepted' then
      return json_build_object('success', true, 'assignment_id', v_existing.id, 'note', 'Already requested');
    end if;
  end if;

  -- Upsert assignment
  insert into public.ride_assignments (ride_id, partner_id, partner_status)
  values (p_ride_id, v_partner_id, 'new')
  on conflict (ride_id, partner_id) do update
    set partner_status = 'new', updated_at = now()
  returning * into v_assignment;

  return json_build_object('success', true, 'assignment_id', v_assignment.id);
end;
$$;

-- ── 7. RPC: accept_ride ───────────────────────────────────────
-- Atomic accept: locks the ride row, checks status, updates both tables.
-- Handles double-accept scenario safely via FOR UPDATE lock.

create or replace function public.accept_ride(p_ride_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner_id     uuid;
  v_ride           record;
  v_assignment     record;
  v_partner_profile record;
begin
  v_partner_id := auth.uid();
  if v_partner_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Verify partner has a pending assignment
  select * into v_assignment
  from public.ride_assignments
  where ride_id = p_ride_id and partner_id = v_partner_id;

  if not found then
    return json_build_object('success', false, 'error', 'No assignment found. Request ride first.');
  end if;

  if v_assignment.partner_status in ('rejected', 'cancelled') then
    return json_build_object('success', false, 'error', 'Cannot accept this ride');
  end if;

  -- Already accepted by this partner
  if v_assignment.partner_status = 'accepted' then
    return json_build_object('success', true, 'note', 'Already accepted');
  end if;

  -- Lock the ride row atomically to prevent double-accept
  select * into v_ride
  from public.ride_bookings
  where id = p_ride_id
    and status = 'searching'
  for update;

  if not found then
    -- Ride was accepted by another partner
    return json_build_object('success', false, 'error', 'Ride is no longer available');
  end if;

  -- Get partner profile for driver info
  select * into v_partner_profile
  from public.partner_profiles
  where id = v_partner_id;

  -- Update ride_bookings
  update public.ride_bookings
  set
    status       = 'driver_assigned',
    driver_id    = v_partner_id,
    driver_name  = coalesce(
                     nullif(trim(v_partner_profile.authorized_contact_name), ''),
                     nullif(trim(v_partner_profile.business_name), '')
                   ),
    driver_phone = v_partner_profile.phone,
    vehicle_name = v_partner_profile.business_name,
    updated_at   = now()
  where id = p_ride_id;

  -- Update assignment
  update public.ride_assignments
  set
    partner_status = 'accepted',
    accepted_at    = now(),
    updated_at     = now()
  where ride_id = p_ride_id and partner_id = v_partner_id;

  return json_build_object('success', true);
end;
$$;

-- ── 8. RPC: update_ride_status ────────────────────────────────
-- Validates transitions: driver_assigned→started, started→completed

create or replace function public.update_ride_status(p_ride_id uuid, p_new_status text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner_id     uuid;
  v_assignment     record;
  v_current_status text;
begin
  v_partner_id := auth.uid();
  if v_partner_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  -- Verify partner has an accepted or started assignment
  select * into v_assignment
  from public.ride_assignments
  where ride_id = p_ride_id
    and partner_id = v_partner_id
    and partner_status in ('accepted', 'started');

  if not found then
    return json_build_object('success', false, 'error', 'Not authorized to update this ride');
  end if;

  -- Get current ride status
  select status into v_current_status
  from public.ride_bookings
  where id = p_ride_id;

  -- Validate transition
  if p_new_status = 'started' and v_current_status != 'driver_assigned' then
    return json_build_object('success', false, 'error', 'Can only start a driver_assigned ride');
  end if;
  if p_new_status = 'completed' and v_current_status != 'started' then
    return json_build_object('success', false, 'error', 'Can only complete a started ride');
  end if;
  if p_new_status not in ('started', 'completed') then
    return json_build_object('success', false, 'error', 'Invalid status transition');
  end if;

  -- Update ride_bookings
  update public.ride_bookings
  set status = p_new_status, updated_at = now()
  where id = p_ride_id;

  -- Update assignment
  if p_new_status = 'started' then
    update public.ride_assignments
    set partner_status = 'started', started_at = now(), updated_at = now()
    where ride_id = p_ride_id and partner_id = v_partner_id;
  elsif p_new_status = 'completed' then
    update public.ride_assignments
    set partner_status = 'completed', completed_at = now(), updated_at = now()
    where ride_id = p_ride_id and partner_id = v_partner_id;
  end if;

  return json_build_object('success', true);
end;
$$;

-- ── 9. RPC: reject_ride ───────────────────────────────────────
-- Marks partner's assignment as rejected.
-- Does NOT change the main ride status — ride remains 'searching'.

create or replace function public.reject_ride(p_ride_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_partner_id uuid;
begin
  v_partner_id := auth.uid();
  if v_partner_id is null then
    return json_build_object('success', false, 'error', 'Not authenticated');
  end if;

  update public.ride_assignments
  set partner_status = 'rejected', updated_at = now()
  where ride_id = p_ride_id
    and partner_id = v_partner_id
    and partner_status in ('new', 'accepted');

  return json_build_object('success', true);
end;
$$;

-- ── Done ─────────────────────────────────────────────────────
-- Summary of what must be run separately in User App DB:
--   supabase/migrations/20261001_ride_booking.sql (already in Cardom user app)
--
-- Both apps share the same Supabase project/database.
-- The partner app uses the same anon key but different auth sessions.
