-- ============================================================
-- Cardom — Enable Supabase Realtime for Ride Booking & Assignments
-- Migration: 20261001_enable_realtime.sql
-- ============================================================

-- Add tables to the supabase_realtime publication
alter publication supabase_realtime add table public.ride_bookings;
alter publication supabase_realtime add table public.ride_assignments;

-- Set replica identity to FULL so UPDATE events include all fields
alter table public.ride_bookings replica identity full;
alter table public.ride_assignments replica identity full;
