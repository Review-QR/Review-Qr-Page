-- Rider Rating System
-- Allows customers to rate riders after delivery

-- 1. Rider ratings table
create table if not exists public.rider_ratings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.hyperlocal_orders(id) on delete cascade,
  rider_id uuid not null references public.delivery_riders(id) on delete cascade,
  customer_id uuid not null references auth.users(id) on delete cascade,
  rating int not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint rider_ratings_unique_order_rider unique (order_id, rider_id)
);

-- 2. Indexes
create index if not exists idx_rider_ratings_rider on public.rider_ratings (rider_id, created_at desc);
create index if not exists idx_rider_ratings_order on public.rider_ratings (order_id);
create index if not exists idx_rider_ratings_created on public.rider_ratings (created_at desc);

-- 3. RLS
alter table public.rider_ratings enable row level security;

-- Customers can insert their own ratings
create policy "rider_ratings_customer_insert" on public.rider_ratings
  for insert to authenticated
  with check (customer_id = auth.uid());

-- Customers can view ratings for orders they placed
create policy "rider_ratings_customer_select" on public.rider_ratings
  for select to authenticated
  using (customer_id = auth.uid());

-- Service role can do everything
grant all on public.rider_ratings to service_role;
revoke all on public.rider_ratings from anon, public;

-- 4. RPC: submit rider rating
create or replace function public.submit_rider_rating(
  p_order_id uuid,
  p_rider_id uuid,
  p_rating int,
  p_comment text default null
)
returns uuid
language plpgsql
security definer
as $$
declare
  v_rider_rating uuid;
begin
  -- Verify the order exists and belongs to the current customer
  if not exists (
    select 1 from public.hyperlocal_orders
    where id = p_order_id and customer_id = auth.uid()
  ) then
    raise exception 'Order not found or not owned by current user';
  end if;

  -- Verify rider exists
  if not exists (
    select 1 from public.delivery_riders where id = p_rider_id
  ) then
    raise exception 'Rider not found';
  end if;

  -- Validate rating range
  if p_rating < 1 or p_rating > 5 then
    raise exception 'Rating must be between 1 and 5';
  end if;

  -- Insert rating
  insert into public.rider_ratings (order_id, rider_id, customer_id, rating, comment)
  values (p_order_id, p_rider_id, auth.uid(), p_rating, p_comment)
  on conflict (order_id, rider_id) do nothing
  returning id into v_rider_rating;

  return v_rider_rating;
end;
$$;

grant execute on function public.submit_rider_rating(uuid, uuid, int, text) to authenticated;
revoke execute on function public.submit_rider_rating(uuid, uuid, int, text) from anon, public;

-- 5. RPC: get rider average rating
create or replace function public.get_rider_avg_rating(p_rider_id uuid)
returns numeric
language sql
security definer
stable
as $$
  select coalesce(round(avg(rating)::numeric, 1), 0)
  from public.rider_ratings
  where rider_id = p_rider_id
$$;

grant execute on function public.get_rider_avg_rating(uuid) to authenticated, service_role;
revoke execute on function public.get_rider_avg_rating(uuid) from anon, public;
