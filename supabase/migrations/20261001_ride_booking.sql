-- ============================================================
-- Cardom Ride Booking Phase 1
-- Migration: 20261001_ride_booking.sql
-- ============================================================

-- Create ride_bookings table
create table if not exists public.ride_bookings (
  id                        uuid primary key default gen_random_uuid(),
  user_id                   uuid not null references auth.users(id) on delete cascade,
  booking_reference         text unique not null,
  pickup_address            text not null,
  pickup_latitude           double precision,
  pickup_longitude          double precision,
  drop_address              text not null,
  drop_latitude             double precision,
  drop_longitude            double precision,
  ride_type                 text not null check (ride_type in ('economy', 'comfort', 'xl')),
  estimated_fare            numeric(10,2) not null,
  estimated_distance_km     numeric(10,2),
  estimated_duration_minutes integer,
  status                    text not null default 'searching' check (status in ('searching','driver_assigned','arriving','started','completed','cancelled')),
  driver_id                 uuid,
  driver_name               text,
  driver_phone              text,
  vehicle_name              text,
  vehicle_number            text,
  payment_method            text default 'upi',
  payment_status            text not null default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  notes                     text,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- Index for fast user lookups
create index if not exists ride_bookings_user_id_idx on public.ride_bookings (user_id);
create index if not exists ride_bookings_status_idx  on public.ride_bookings (status);

-- Auto-update updated_at on row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists ride_bookings_set_updated_at on public.ride_bookings;
create trigger ride_bookings_set_updated_at
  before update on public.ride_bookings
  for each row execute function public.set_updated_at();

-- ── Row Level Security ────────────────────────────────────────
alter table public.ride_bookings enable row level security;

-- SELECT: user can only see their own bookings
drop policy if exists "ride_bookings_select_own" on public.ride_bookings;
create policy "ride_bookings_select_own"
  on public.ride_bookings for select
  using (auth.uid() = user_id);

-- INSERT: authenticated user can only insert their own booking
drop policy if exists "ride_bookings_insert_own" on public.ride_bookings;
create policy "ride_bookings_insert_own"
  on public.ride_bookings for insert
  with check (auth.uid() = user_id);

-- UPDATE: user can update only their own booking
-- (cancel only — front-end limits which fields can be updated)
drop policy if exists "ride_bookings_update_own" on public.ride_bookings;
create policy "ride_bookings_update_own"
  on public.ride_bookings for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- No DELETE allowed — keep audit history

-- Grants
grant select, insert, update on public.ride_bookings to authenticated;
