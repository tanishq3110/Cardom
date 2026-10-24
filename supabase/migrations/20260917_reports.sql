-- ==============================================================================
-- Cardom Marketplace: Car Reports Migration
-- Step 8: Marketplace Polish - Listing Reports Table & Security
-- ==============================================================================

-- 1. Create the car_reports table
create table if not exists public.car_reports (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  reporter_id uuid not null references auth.users(id) on delete cascade,
  reason text not null,
  description text,
  status text not null default 'open',
  created_at timestamptz not null default now(),

  constraint car_reports_status_check
    check (status in ('open', 'reviewed', 'resolved')),

  -- Prevent duplicate identical reports from the same user on the same listing
  constraint car_reports_user_car_reason_unique
    unique (car_id, reporter_id, reason)
);

-- 2. Indexes for efficient lookup and filtering
create index if not exists idx_car_reports_car_id
  on public.car_reports(car_id);

create index if not exists idx_car_reports_reporter_id
  on public.car_reports(reporter_id);

create index if not exists idx_car_reports_created_at
  on public.car_reports(created_at desc);

-- 3. Enable Row-Level Security
alter table public.car_reports enable row level security;

-- 4. RLS Policies
-- Users can view only their own submitted reports
drop policy if exists "Users can view their own reports" on public.car_reports;
create policy "Users can view their own reports"
  on public.car_reports
  for select
  to authenticated
  using (auth.uid() = reporter_id);

-- Authenticated users can insert reports where reporter_id is themselves
drop policy if exists "Authenticated users can submit reports" on public.car_reports;
create policy "Authenticated users can submit reports"
  on public.car_reports
  for insert
  to authenticated
  with check (auth.uid() = reporter_id);

-- Note: No UPDATE or DELETE policies are granted to authenticated users.
-- Standard users cannot modify report content, alter report status, or delete reports.

-- 5. Grant permissions to authenticated users
grant select, insert on public.car_reports to authenticated;

