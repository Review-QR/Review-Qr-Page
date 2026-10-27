-- Create business_catalog_items table for merchant digital menu, services, and product catalogs.
create table if not exists public.business_catalog_items (
  id uuid primary key default pg_catalog.gen_random_uuid(),
  business_id text not null references public.businesses (id) on delete cascade,
  name text not null check (length(btrim(name)) between 1 and 160),
  category text not null default 'General' check (length(btrim(category)) between 1 and 80),
  price numeric(10, 2) not null check (price >= 0),
  unit text check (unit is null or length(btrim(unit)) <= 40),
  item_type text not null default 'veg'
    check (item_type in ('veg', 'non_veg', 'egg', 'service', 'product')),
  image_url text check (image_url is null or length(image_url) <= 2048),
  description text check (description is null or length(description) <= 500),
  is_available boolean not null default true,
  display_order integer not null default 0,
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now()
);

create index if not exists idx_catalog_items_business
  on public.business_catalog_items(business_id, display_order);

create index if not exists idx_catalog_items_available
  on public.business_catalog_items(business_id)
  where is_available = true;

alter table public.business_catalog_items enable row level security;

-- Anonymous and Authenticated users can view available catalog items publicly
drop policy if exists catalog_items_select_public on public.business_catalog_items;
create policy catalog_items_select_public
  on public.business_catalog_items for select
  to public
  using (is_available = true);

-- Merchants can view all items (including unavailable) for their authorized business
drop policy if exists catalog_items_select_merchant on public.business_catalog_items;
create policy catalog_items_select_merchant
  on public.business_catalog_items for select
  to authenticated
  using (
    exists (
      select 1 from public.merchant_accounts ma
      join public.businesses b on b.id = ma.business_id
      where ma.user_id = (select auth.uid())
        and b.id = business_catalog_items.business_id
        and b.merchant_status = 'active'
        and b.deleted_at is null
    )
  );

-- Merchants can insert items for their authorized business
drop policy if exists catalog_items_insert_merchant on public.business_catalog_items;
create policy catalog_items_insert_merchant
  on public.business_catalog_items for insert
  to authenticated
  with check (
    exists (
      select 1 from public.merchant_accounts ma
      join public.businesses b on b.id = ma.business_id
      where ma.user_id = (select auth.uid())
        and b.id = business_catalog_items.business_id
        and b.merchant_status = 'active'
        and b.deleted_at is null
    )
  );

-- Merchants can update items for their authorized business
drop policy if exists catalog_items_update_merchant on public.business_catalog_items;
create policy catalog_items_update_merchant
  on public.business_catalog_items for update
  to authenticated
  using (
    exists (
      select 1 from public.merchant_accounts ma
      join public.businesses b on b.id = ma.business_id
      where ma.user_id = (select auth.uid())
        and b.id = business_catalog_items.business_id
        and b.merchant_status = 'active'
        and b.deleted_at is null
    )
  )
  with check (
    exists (
      select 1 from public.merchant_accounts ma
      join public.businesses b on b.id = ma.business_id
      where ma.user_id = (select auth.uid())
        and b.id = business_catalog_items.business_id
        and b.merchant_status = 'active'
        and b.deleted_at is null
    )
  );

-- Merchants can delete items for their authorized business
drop policy if exists catalog_items_delete_merchant on public.business_catalog_items;
create policy catalog_items_delete_merchant
  on public.business_catalog_items for delete
  to authenticated
  using (
    exists (
      select 1 from public.merchant_accounts ma
      join public.businesses b on b.id = ma.business_id
      where ma.user_id = (select auth.uid())
        and b.id = business_catalog_items.business_id
        and b.merchant_status = 'active'
        and b.deleted_at is null
    )
  );

-- Grants
grant select on public.business_catalog_items to anon, authenticated;
grant select, insert, update, delete on public.business_catalog_items to service_role;
