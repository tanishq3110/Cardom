-- ============================================================
-- Migration: 20260929_partner_lead_operations.sql
-- Cardom Partner — Phase 3: Lead Assignment Layer
--
-- What this does:
--   1. Creates public.partner_lead_assignments (new table, additive only)
--   2. Adds SELECT-only RLS policies on existing lead tables for assigned partners
--   3. Does NOT modify insurance_leads / finance_leads / service_requests / inquiries columns
--   4. Partners can SELECT and UPDATE their own assignments ONLY — no INSERT, no DELETE
--   5. Assignment creation is reserved for admin/SQL Editor context
--
-- DEPENDENCY: public.partner_profiles must exist before running this.
-- Apply 20260928_partner_profiles.sql first if not already done.
-- ============================================================


-- ── 1. partner_lead_assignments ───────────────────────────────────────────────

create table if not exists public.partner_lead_assignments (
  id              uuid primary key default gen_random_uuid(),
  partner_id      uuid not null references auth.users(id) on delete cascade,
  lead_type       text not null check (lead_type in ('insurance', 'finance', 'service')),
  lead_id         uuid not null,
  partner_status  text not null default 'new'
                  check (partner_status in ('new', 'contacted', 'in_progress', 'completed', 'cancelled')),
  notes           text,
  assigned_at     timestamptz not null default now(),
  updated_at      timestamptz not null default now(),

  unique (partner_id, lead_type, lead_id)
);

alter table public.partner_lead_assignments enable row level security;

-- Partners can read ONLY their own assignments
drop policy if exists "Partners can view own assignments" on public.partner_lead_assignments;
create policy "Partners can view own assignments"
  on public.partner_lead_assignments
  for select
  to authenticated
  using (auth.uid() = partner_id);

-- Partners can update ONLY their own assignments (partner_status, notes)
drop policy if exists "Partners can update own assignments" on public.partner_lead_assignments;
create policy "Partners can update own assignments"
  on public.partner_lead_assignments
  for update
  to authenticated
  using (auth.uid() = partner_id)
  with check (auth.uid() = partner_id);

-- NO INSERT policy for authenticated role — assignments created via admin/SQL Editor only
-- NO DELETE policy for authenticated role

-- Grant privileges: SELECT and UPDATE only (no INSERT, no DELETE for authenticated)
grant select, update on public.partner_lead_assignments to authenticated;
grant all on public.partner_lead_assignments to service_role;


-- ── 2. Indexes ────────────────────────────────────────────────────────────────

create index if not exists idx_pla_partner_id
  on public.partner_lead_assignments(partner_id);

create index if not exists idx_pla_lead_type_id
  on public.partner_lead_assignments(lead_type, lead_id);

create index if not exists idx_pla_partner_status
  on public.partner_lead_assignments(partner_status);


-- ── 3. updated_at trigger ────────────────────────────────────────────────────
-- Reuses handle_updated_at() created in 20260928_partner_profiles.sql

drop trigger if exists set_pla_updated_at on public.partner_lead_assignments;
create trigger set_pla_updated_at
  before update on public.partner_lead_assignments
  for each row execute function public.handle_updated_at();


-- ── 4. RLS policies on existing lead tables (additive — does NOT drop User App policies) ──

-- Insurance partners: read insurance_leads only when assigned AND category matches
drop policy if exists "insurance_leads: assigned partners can select" on public.insurance_leads;
create policy "insurance_leads: assigned partners can select"
  on public.insurance_leads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.partner_lead_assignments pla
      join public.partner_profiles pp on pp.id = auth.uid()
      where pla.partner_id = auth.uid()
        and pla.lead_type = 'insurance'
        and pla.lead_id = public.insurance_leads.id
        and pp.partner_category = 'insurance'
    )
  );

-- Finance partners: read finance_leads only when assigned AND category matches
drop policy if exists "finance_leads: assigned partners can select" on public.finance_leads;
create policy "finance_leads: assigned partners can select"
  on public.finance_leads
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.partner_lead_assignments pla
      join public.partner_profiles pp on pp.id = auth.uid()
      where pla.partner_id = auth.uid()
        and pla.lead_type = 'finance'
        and pla.lead_id = public.finance_leads.id
        and pp.partner_category = 'finance'
    )
  );

-- Service center partners: read service_requests only when assigned AND category matches
drop policy if exists "service_requests: assigned partners can select" on public.service_requests;
create policy "service_requests: assigned partners can select"
  on public.service_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.partner_lead_assignments pla
      join public.partner_profiles pp on pp.id = auth.uid()
      where pla.partner_id = auth.uid()
        and pla.lead_type = 'service'
        and pla.lead_id = public.service_requests.id
        and pp.partner_category = 'service_center'
    )
  );
