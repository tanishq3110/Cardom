-- ==============================================================================
-- Cardom Marketplace - Step 6: Inquiries & Contact Seller System
-- ==============================================================================

-- 1. Create public.inquiries table
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),

  car_id uuid not null
    references public.cars(id)
    on delete cascade,

  buyer_id uuid not null
    references auth.users(id)
    on delete cascade,

  seller_id uuid not null
    references auth.users(id)
    on delete cascade,

  message text not null,

  phone text,

  status text not null default 'unread',

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now(),

  constraint inquiries_status_check
    check (status in ('unread', 'read', 'archived'))
);

-- 2. Indexes for performance
create index if not exists idx_inquiries_car_id
on public.inquiries(car_id);

create index if not exists idx_inquiries_buyer_id
on public.inquiries(buyer_id);

create index if not exists idx_inquiries_seller_id
on public.inquiries(seller_id);

create index if not exists idx_inquiries_created_at
on public.inquiries(created_at desc);

-- 3. Enable Row Level Security
alter table public.inquiries enable row level security;

-- 4. RLS Policies
-- Buyers can view own inquiries
create policy "Buyers can view own inquiries"
on public.inquiries
for select
to authenticated
using (
  auth.uid() = buyer_id
);

-- Sellers can view inquiries for own cars
create policy "Sellers can view inquiries for own cars"
on public.inquiries
for select
to authenticated
using (
  auth.uid() = seller_id
);

-- Buyers can create inquiries with strict validation against public.cars
create policy "Buyers can create inquiries"
on public.inquiries
for insert
to authenticated
with check (
  auth.uid() = buyer_id
  and exists (
    select 1
    from public.cars c
    where c.id = car_id
      and c.seller_id = seller_id
      and c.seller_id is not null
      and c.status = 'active'
  )
);

-- Sellers can update inquiry status for their own received inquiries
create policy "Sellers can update inquiry status"
on public.inquiries
for update
to authenticated
using (
  auth.uid() = seller_id
)
with check (
  auth.uid() = seller_id
);

-- 5. Permissions
grant select, insert, update on public.inquiries to authenticated;

-- 6. Enable Realtime for inquiries (optional / recommended)
do $$
begin
  alter publication supabase_realtime add table public.inquiries;
exception
  when duplicate_object then null;
  when others then null;
end $$;
