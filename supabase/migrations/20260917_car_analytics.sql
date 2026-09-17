-- ==============================================================================
-- Cardom Marketplace: Car Analytics & Trust Foundation Migration (Step 9A)
-- Hardened Security Revision
-- ==============================================================================

-- 1. Create the car_views table (Strictly privacy-first: No IP addresses stored)
create table if not exists public.car_views (
  id uuid primary key default gen_random_uuid(),
  car_id uuid not null references public.cars(id) on delete cascade,
  viewer_id uuid references auth.users(id) on delete set null,
  session_id text,
  created_at timestamptz not null default now()
);

-- 2. Indexes for efficient lookup, deduplication, and aggregation
create index if not exists idx_car_views_car_id
  on public.car_views(car_id);

create index if not exists idx_car_views_created_at
  on public.car_views(created_at desc);

create index if not exists idx_car_views_dedup_auth
  on public.car_views(car_id, viewer_id, created_at desc)
  where viewer_id is not null;

create index if not exists idx_car_views_dedup_anon
  on public.car_views(car_id, session_id, created_at desc)
  where session_id is not null;

-- 3. Enable Row-Level Security
alter table public.car_views enable row level security;

-- 4. RLS & Permissions on public.car_views
-- Drop old policies if existing
drop policy if exists "Sellers can view views of their own cars" on public.car_views;
drop policy if exists "Users can view their own view history" on public.car_views;

-- Revoke all direct table access from client roles (anon, authenticated).
-- Raw records in public.car_views cannot be queried, inserted, updated, or deleted directly.
-- View recording and analytics are exclusively accessed through hardened SECURITY DEFINER RPCs.
revoke all on table public.car_views from anon, authenticated;

-- 5. Stored Procedures / RPC Functions

-- 5.1 Deduplicated View Recording (30-minute window)
-- Available to anon and authenticated callers
create or replace function public.record_car_view(
  p_car_id uuid,
  p_session_id text default null
)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_viewer_id uuid;
  v_recent_exists boolean;
begin
  v_viewer_id := auth.uid();
  
  -- Check if vehicle exists
  if not exists (select 1 from public.cars where id = p_car_id) then
    return false;
  end if;

  -- Enforce 30-minute deduplication window
  if v_viewer_id is not null then
    select exists (
      select 1 from public.car_views
      where car_id = p_car_id
        and viewer_id = v_viewer_id
        and created_at > now() - interval '30 minutes'
    ) into v_recent_exists;
  elsif p_session_id is not null and trim(p_session_id) <> '' then
    select exists (
      select 1 from public.car_views
      where car_id = p_car_id
        and session_id = p_session_id
        and created_at > now() - interval '30 minutes'
    ) into v_recent_exists;
  else
    return false;
  end if;

  if v_recent_exists then
    return false;
  end if;

  -- Insert deduplicated view record (IP is never captured or stored)
  insert into public.car_views (car_id, viewer_id, session_id, created_at)
  values (
    p_car_id,
    v_viewer_id,
    case when v_viewer_id is null then p_session_id else null end,
    now()
  );

  return true;
end;
$$;

grant execute on function public.record_car_view(uuid, text) to anon, authenticated;

-- 5.2 Single Car View Count (Intentionally public for vehicle detail displays)
create or replace function public.get_car_view_count(p_car_id uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::bigint from public.car_views where car_id = p_car_id;
$$;

grant execute on function public.get_car_view_count(uuid) to anon, authenticated;

-- 5.3 Single Car Favorite Count (Intentionally public for aggregate engagement display)
create or replace function public.get_car_favorite_count(p_car_id uuid)
returns bigint
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::bigint from public.favorites where car_id = p_car_id;
$$;

grant execute on function public.get_car_favorite_count(uuid) to anon, authenticated;

-- 5.4 Batch Car Stats (Views, Favorites, Inquiries for seller dashboard)
-- Hardened: Authenticated only, verifies EVERY requested car belongs to auth.uid()
create or replace function public.get_batch_car_stats(p_car_ids uuid[])
returns table (
  car_id uuid,
  view_count bigint,
  favorite_count bigint,
  inquiry_count bigint
)
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_seller_id uuid;
begin
  v_seller_id := auth.uid();

  -- 1. Must be authenticated
  if v_seller_id is null then
    raise exception 'Authentication required';
  end if;

  -- 2. Handle empty or null array input gracefully
  if p_car_ids is null or array_length(p_car_ids, 1) is null then
    return;
  end if;

  -- 3. Ensure every requested car belongs to the authenticated seller
  if exists (
    select 1
    from unnest(p_car_ids) as req(id)
    left join public.cars c on c.id = req.id and c.seller_id = v_seller_id
    where c.id is null
  ) then
    raise exception 'Unauthorized: all requested listings must belong to the authenticated seller';
  end if;

  -- 4. Return aggregate metrics for the verified seller cars
  return query
  select
    c.id as car_id,
    coalesce(v.views, 0)::bigint as view_count,
    coalesce(f.favs, 0)::bigint as favorite_count,
    coalesce(i.inqs, 0)::bigint as inquiry_count
  from unnest(p_car_ids) as req(id)
  join public.cars c on c.id = req.id and c.seller_id = v_seller_id
  left join (
    select cv.car_id, count(*)::bigint as views
    from public.car_views cv
    where cv.car_id = any(p_car_ids)
    group by cv.car_id
  ) v on v.car_id = c.id
  left join (
    select fav.car_id, count(*)::bigint as favs
    from public.favorites fav
    where fav.car_id = any(p_car_ids)
    group by fav.car_id
  ) f on f.car_id = c.id
  left join (
    select inq.car_id, count(*)::bigint as inqs
    from public.inquiries inq
    where inq.car_id = any(p_car_ids)
    group by inq.car_id
  ) i on i.car_id = c.id;
end;
$$;

revoke all on function public.get_batch_car_stats(uuid[]) from public, anon;
grant execute on function public.get_batch_car_stats(uuid[]) to authenticated;

-- 5.5 Seller Overview Analytics (Hardened to auth.uid() only)
-- Primary parameterless version (callers can only retrieve metrics for auth.uid())
create or replace function public.get_seller_overview_stats()
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
declare
  v_seller_id uuid;
  v_active_count int;
  v_sold_count int;
  v_total_views bigint;
  v_total_favorites bigint;
  v_total_inquiries bigint;
begin
  -- Strictly enforce caller identity to authenticated user
  v_seller_id := auth.uid();
  if v_seller_id is null then
    return json_build_object(
      'activeListings', 0,
      'soldListings', 0,
      'totalViews', 0,
      'totalFavorites', 0,
      'totalInquiries', 0
    );
  end if;

  select
    count(*) filter (where status = 'active'),
    count(*) filter (where status = 'sold')
  into v_active_count, v_sold_count
  from public.cars
  where seller_id = v_seller_id;

  select coalesce(count(*), 0)::bigint
  into v_total_views
  from public.car_views cv
  join public.cars c on c.id = cv.car_id
  where c.seller_id = v_seller_id;

  select coalesce(count(*), 0)::bigint
  into v_total_favorites
  from public.favorites f
  join public.cars c on c.id = f.car_id
  where c.seller_id = v_seller_id;

  select coalesce(count(*), 0)::bigint
  into v_total_inquiries
  from public.inquiries
  where seller_id = v_seller_id;

  return json_build_object(
    'activeListings', coalesce(v_active_count, 0),
    'soldListings', coalesce(v_sold_count, 0),
    'totalViews', coalesce(v_total_views, 0),
    'totalFavorites', coalesce(v_total_favorites, 0),
    'totalInquiries', coalesce(v_total_inquiries, 0)
  );
end;
$$;

revoke all on function public.get_seller_overview_stats() from public, anon;
grant execute on function public.get_seller_overview_stats() to authenticated;

-- Overload for backwards compatibility with callers sending { p_seller_id: ... }
-- Ignores any supplied argument and strictly delegates to the parameterless auth.uid() function
create or replace function public.get_seller_overview_stats(p_seller_id uuid)
returns json
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  -- Strictly ignore p_seller_id; always execute for the authenticated caller
  return public.get_seller_overview_stats();
end;
$$;

revoke all on function public.get_seller_overview_stats(uuid) from public, anon;
grant execute on function public.get_seller_overview_stats(uuid) to authenticated;
