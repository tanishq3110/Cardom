-- ============================================================
-- Cardom: Service Lead Persistence
-- Migration: 20260923_service_leads.sql
-- Tables: insurance_leads, finance_leads, service_requests
-- ============================================================

-- ── 1. insurance_leads ───────────────────────────────────────────────────────

create table if not exists public.insurance_leads (
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid references auth.users(id) on delete set null,
  car_brand             text not null,
  car_model             text not null,
  registration_year     text,
  fuel_type             text,
  city                  text,
  previous_policy_status text,
  contact_name          text,
  contact_phone         text,
  contact_email         text,
  status                text not null default 'new'
                          check (status in ('new', 'contacted', 'quoted', 'closed')),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);

alter table public.insurance_leads enable row level security;

-- Allow anyone (guest or authenticated) to insert; user_id is set by the client
drop policy if exists "insurance_leads: anyone can insert" on public.insurance_leads;
create policy "insurance_leads: anyone can insert"
  on public.insurance_leads
  for insert
  with check (true);

-- Authenticated owners can read their own leads
drop policy if exists "insurance_leads: owners can select" on public.insurance_leads;
create policy "insurance_leads: owners can select"
  on public.insurance_leads
  for select
  using (user_id = auth.uid());

-- Authenticated owners can update their own leads
drop policy if exists "insurance_leads: owners can update" on public.insurance_leads;
create policy "insurance_leads: owners can update"
  on public.insurance_leads
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.insurance_leads to authenticated;
grant insert on public.insurance_leads to anon;

create index if not exists insurance_leads_user_id_idx on public.insurance_leads(user_id);
create index if not exists insurance_leads_created_at_idx on public.insurance_leads(created_at desc);

-- ── 2. finance_leads ─────────────────────────────────────────────────────────

create table if not exists public.finance_leads (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid references auth.users(id) on delete set null,
  car_price         numeric not null,
  down_payment      numeric not null,
  loan_amount       numeric not null,
  interest_rate     numeric not null,
  tenure_years      integer not null,
  monthly_emi       numeric not null,
  employment_type   text,
  annual_income     text,
  contact_name      text,
  contact_phone     text,
  contact_email     text,
  status            text not null default 'new'
                      check (status in ('new', 'contacted', 'approved', 'rejected', 'closed')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

alter table public.finance_leads enable row level security;

drop policy if exists "finance_leads: anyone can insert" on public.finance_leads;
create policy "finance_leads: anyone can insert"
  on public.finance_leads
  for insert
  with check (true);

drop policy if exists "finance_leads: owners can select" on public.finance_leads;
create policy "finance_leads: owners can select"
  on public.finance_leads
  for select
  using (user_id = auth.uid());

drop policy if exists "finance_leads: owners can update" on public.finance_leads;
create policy "finance_leads: owners can update"
  on public.finance_leads
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.finance_leads to authenticated;
grant insert on public.finance_leads to anon;

create index if not exists finance_leads_user_id_idx on public.finance_leads(user_id);
create index if not exists finance_leads_created_at_idx on public.finance_leads(created_at desc);

-- ── 3. service_requests ──────────────────────────────────────────────────────

create table if not exists public.service_requests (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references auth.users(id) on delete set null,
  booking_reference   text not null unique,
  vehicle_name        text not null,
  vehicle_fuel        text,
  service_packages    jsonb not null default '[]'::jsonb,
  service_center_name text not null,
  service_center_city text,
  scheduled_date      text not null,
  scheduled_time      text not null,
  doorstep_valet      boolean not null default false,
  base_cost           numeric not null default 0,
  valet_fee           numeric not null default 0,
  tax_amount          numeric not null default 0,
  total_amount        numeric not null default 0,
  status              text not null default 'scheduled'
                        check (status in ('scheduled', 'in_progress', 'completed', 'cancelled')),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

alter table public.service_requests enable row level security;

drop policy if exists "service_requests: anyone can insert" on public.service_requests;
create policy "service_requests: anyone can insert"
  on public.service_requests
  for insert
  with check (true);

drop policy if exists "service_requests: owners can select" on public.service_requests;
create policy "service_requests: owners can select"
  on public.service_requests
  for select
  using (user_id = auth.uid());

drop policy if exists "service_requests: owners can update" on public.service_requests;
create policy "service_requests: owners can update"
  on public.service_requests
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update on public.service_requests to authenticated;
grant insert on public.service_requests to anon;

create index if not exists service_requests_user_id_idx on public.service_requests(user_id);
create index if not exists service_requests_booking_ref_idx on public.service_requests(booking_reference);
create index if not exists service_requests_created_at_idx on public.service_requests(created_at desc);

