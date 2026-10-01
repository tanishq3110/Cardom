-- ============================================================
-- Cardom Phase 4: Maps + GPS Driver Tracking
-- Migration: 20261001_ride_driver_locations.sql
-- ============================================================

-- 1. Create table public.ride_driver_locations
create table if not exists public.ride_driver_locations (
  id                uuid primary key default gen_random_uuid(),
  ride_id           uuid not null references public.ride_bookings(id) on delete cascade,
  partner_id        uuid not null references auth.users(id) on delete cascade,
  latitude          double precision not null,
  longitude         double precision not null,
  accuracy_meters   double precision,
  heading           double precision,
  speed_mps         double precision,
  updated_at        timestamptz not null default now(),
  unique (ride_id)
);

create index if not exists ride_driver_locations_ride_id_idx on public.ride_driver_locations (ride_id);
create index if not exists ride_driver_locations_partner_id_idx on public.ride_driver_locations (partner_id);

-- 2. Auto updated_at trigger
drop trigger if exists ride_driver_locations_set_updated_at on public.ride_driver_locations;
create trigger ride_driver_locations_set_updated_at
  before update on public.ride_driver_locations
  for each row execute function public.set_updated_at();

-- 3. Enable RLS
alter table public.ride_driver_locations enable row level security;

-- 4. User SELECT policy:
-- A user may read a location ONLY when ride_id belongs to a ride where ride_bookings.user_id = auth.uid()
drop policy if exists "ride_driver_locations_select_user" on public.ride_driver_locations;
create policy "ride_driver_locations_select_user"
  on public.ride_driver_locations for select
  using (
    exists (
      select 1
      from public.ride_bookings rb
      where rb.id = public.ride_driver_locations.ride_id
        and rb.user_id = auth.uid()
    )
  );

-- 5. Partner SELECT policy:
-- A partner may read a location ONLY when partner_id = auth.uid() AND has corresponding assignment
drop policy if exists "ride_driver_locations_select_partner" on public.ride_driver_locations;
create policy "ride_driver_locations_select_partner"
  on public.ride_driver_locations for select
  using (
    auth.uid() = partner_id
    and exists (
      select 1
      from public.ride_assignments ra
      where ra.ride_id = public.ride_driver_locations.ride_id
        and ra.partner_id = auth.uid()
    )
  );

-- 6. Partner INSERT policy:
-- Partner may insert ONLY when partner_id = auth.uid() AND has an active assignment ('accepted' or 'started')
drop policy if exists "ride_driver_locations_insert_partner" on public.ride_driver_locations;
create policy "ride_driver_locations_insert_partner"
  on public.ride_driver_locations for insert
  with check (
    auth.uid() = partner_id
    and exists (
      select 1
      from public.ride_assignments ra
      where ra.ride_id = ride_driver_locations.ride_id
        and ra.partner_id = auth.uid()
        and ra.partner_status in ('accepted', 'started')
    )
  );

-- 7. Partner UPDATE policy:
-- Partner may update ONLY when partner_id = auth.uid() AND has an active assignment ('accepted' or 'started')
drop policy if exists "ride_driver_locations_update_partner" on public.ride_driver_locations;
create policy "ride_driver_locations_update_partner"
  on public.ride_driver_locations for update
  using (
    auth.uid() = partner_id
    and exists (
      select 1
      from public.ride_assignments ra
      where ra.ride_id = public.ride_driver_locations.ride_id
        and ra.partner_id = auth.uid()
        and ra.partner_status in ('accepted', 'started')
    )
  )
  with check (
    auth.uid() = partner_id
    and exists (
      select 1
      from public.ride_assignments ra
      where ra.ride_id = ride_driver_locations.ride_id
        and ra.partner_id = auth.uid()
        and ra.partner_status in ('accepted', 'started')
    )
  );

-- 8. Grants
grant select, insert, update on public.ride_driver_locations to authenticated;

-- 9. Realtime support
alter table public.ride_driver_locations replica identity full;
do $$
begin
  alter publication supabase_realtime add table public.ride_driver_locations;
exception
  when duplicate_object then null;
  when others then null;
end;
$$;
