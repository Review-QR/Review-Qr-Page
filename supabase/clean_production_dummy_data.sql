-- Production Clean Slate Script for Trustit SuperApp
-- Removes seeded/dummy businesses (`bhr-*`), seeded demo riders (`33333333-*`),
-- and test orders, parchas, tokens, payout splits, ledger entries, and disputes
-- while preserving real registered accounts (e.g., Golden Blossom Cafe / Supriya),
-- real customer profiles, and physical QR product catalog rows.
-- Run inside Supabase SQL Editor when promoting a database from staging/test to live production.

begin;

-- 1. Remove seeded demo businesses (`bhr-*` and sample showcase entries), preserving real registered stores
do $$
declare
  dummy_ids text[] := array[
    'bhr-dairy-01',
    'bhr-groc-01',
    'bhr-pharm-01',
    'bhr-auto-03',
    'bhr-salon-01',
    'bhr-clinic-03',
    'bhr-hotel-01',
    'bhr-cloth-01',
    'bhr-hard-01',
    'bhr-elec-01'
  ];
begin
  if to_regclass('public.merchant_payout_ledger') is not null then
    delete from public.merchant_payout_ledger
    where business_id = any(dummy_ids)
       or business_id like 'bhr-%'
       or order_id is not null;
  end if;

  if to_regclass('public.rider_payout_ledger') is not null then
    delete from public.rider_payout_ledger
    where order_id is not null
       or rider_id in (
         '33333333-3333-4333-a333-333333333301',
         '33333333-3333-4333-a333-333333333302',
         '33333333-3333-4333-a333-333333333303'
       );
  end if;

  if to_regclass('public.rider_passbook_transactions') is not null then
    delete from public.rider_passbook_transactions
    where order_id is not null
       or rider_id in (
         '33333333-3333-4333-a333-333333333301',
         '33333333-3333-4333-a333-333333333302',
         '33333333-3333-4333-a333-333333333303'
       );
  end if;

  if to_regclass('public.rider_road_incidents') is not null then
    delete from public.rider_road_incidents
    where order_id is not null
       or rider_id in (
         '33333333-3333-4333-a333-333333333301',
         '33333333-3333-4333-a333-333333333302',
         '33333333-3333-4333-a333-333333333303'
       );
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

  if to_regclass('public.hyperlocal_menu_items') is not null then
    delete from public.hyperlocal_menu_items
    where business_id in (
      select id from public.businesses
      where (id = any(dummy_ids) or id like 'bhr-%')
        and coalesce(name, '') not ilike '%Golden Blossom%'
    );
  end if;

  if to_regclass('public.merchant_qr_settings') is not null then
    delete from public.merchant_qr_settings
    where business_id in (
      select id from public.businesses
      where (id = any(dummy_ids) or id like 'bhr-%')
        and coalesce(name, '') not ilike '%Golden Blossom%'
    );
  end if;

  delete from public.businesses
  where (id = any(dummy_ids) or id like 'bhr-%')
    and coalesce(name, '') not ilike '%Golden Blossom%';

  if to_regclass('public.delivery_riders') is not null then
    delete from public.delivery_riders
    where id in (
      '33333333-3333-4333-a333-333333333301',
      '33333333-3333-4333-a333-333333333302',
      '33333333-3333-4333-a333-333333333303'
    )
    or phone in ('+919415011111', '+919415022222', '+919415033333');
  end if;
end $$;

-- 2. Remove stale non-real standalone payouts if any exist
do $$
begin
  if to_regclass('public.payouts') is not null then
    delete from public.payouts
    where coalesce(utr, '') like 'TEST_%'
       or coalesce(utr, '') like 'SIM_%'
       or business_id like 'bhr-%';
  end if;
end $$;

commit;

-- 3. Post-clean production verification summary
select
  (select count(*) from public.businesses) as live_businesses,
  (select count(*) from public.delivery_riders) as live_riders,
  (select count(*) from public.customers) as live_customers,
  (select count(*) from public.hyperlocal_orders) as remaining_orders,
  (select count(*) from public.hyperlocal_payout_splits) as remaining_payout_splits;
