-- ============================================================================
-- Trustit Production SQL Setup & Test Orders Cleanup Script
-- Run this once in Supabase SQL Editor:
--   1) Applies verified merchant & customer reward_points columns/ledger
--   2) Removes all stale test/seed orders, parchas, tokens & payout rows
--      so live customer/admin screens only show real new orders.
-- ============================================================================

begin;

-- A. Schema readiness (safe / idempotent)
alter table public.businesses
  add column if not exists is_verified boolean not null default false,
  add column if not exists verified_at timestamptz;

create index if not exists businesses_is_verified_idx
  on public.businesses (is_verified);

alter table public.customers
  add column if not exists reward_points integer not null default 0;

update public.customers
  set reward_points = 0
  where reward_points is null;

create table if not exists public.customer_points_ledger (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  points_delta integer not null,
  balance_after integer not null,
  reason text not null default 'Admin Top-Up',
  admin_email text,
  created_at timestamptz not null default now()
);

create index if not exists customer_points_ledger_customer_idx
  on public.customer_points_ledger (customer_id, created_at desc);

alter table public.customer_points_ledger enable row level security;

drop policy if exists "service_role_all_customer_points_ledger" on public.customer_points_ledger;
create policy "service_role_all_customer_points_ledger"
  on public.customer_points_ledger
  for all
  to service_role
  using (true)
  with check (true);

grant all on table public.customer_points_ledger to postgres, service_role;

-- Ensure all merchants start unverified unless explicitly approved in Admin Panel
-- (Uncomment the next line only if you want to reset every merchant back to false)
-- update public.businesses set is_verified = false, verified_at = null;

-- B. Remove old test/seed live orders, parchas, tokens & linked ledger rows
do $$
begin
  if to_regclass('public.merchant_payout_ledger') is not null then
    delete from public.merchant_payout_ledger where order_id is not null;
  end if;

  if to_regclass('public.rider_payout_ledger') is not null then
    delete from public.rider_payout_ledger where order_id is not null;
  end if;

  if to_regclass('public.rider_passbook_transactions') is not null then
    delete from public.rider_passbook_transactions where order_id is not null;
  end if;

  if to_regclass('public.rider_road_incidents') is not null then
    delete from public.rider_road_incidents where order_id is not null;
  end if;

  if to_regclass('public.hyperlocal_payout_splits') is not null then
    delete from public.hyperlocal_payout_splits;
  end if;

  if to_regclass('public.hyperlocal_order_disputes') is not null then
    delete from public.hyperlocal_order_disputes;
  end if;

  if to_regclass('public.grocery_parcha_orders') is not null then
    delete from public.grocery_parcha_orders;
  end if;

  if to_regclass('public.hyperlocal_parchas') is not null then
    delete from public.hyperlocal_parchas;
  end if;

  if to_regclass('public.service_tokens_and_slots') is not null then
    delete from public.service_tokens_and_slots;
  end if;

  if to_regclass('public.hyperlocal_order_items') is not null then
    delete from public.hyperlocal_order_items;
  end if;

  if to_regclass('public.hyperlocal_orders') is not null then
    delete from public.hyperlocal_orders;
  end if;
end $$;

commit;

-- Verify cleanup counts & schema columns:
select
  (select count(*) from public.hyperlocal_orders) as remaining_orders,
  (select count(*) from public.hyperlocal_order_items) as remaining_order_items,
  (select count(*) from public.grocery_parcha_orders) as remaining_parchas,
  (select count(*) from public.hyperlocal_payout_splits) as remaining_payout_splits,
  (select count(*) from public.service_tokens_and_slots) as remaining_tokens,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='businesses' and column_name='is_verified') as has_is_verified,
  exists(select 1 from information_schema.columns where table_schema='public' and table_name='customers' and column_name='reward_points') as has_reward_points;
