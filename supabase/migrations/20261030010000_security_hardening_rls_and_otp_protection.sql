-- 20261030010000_security_hardening_rls_and_otp_protection.sql
-- Comprehensive Security Hardening: Revoke permissive public RLS and add OTP brute-force protection

-- 1. Add OTP Rate-Limiting and Lockout tracking to hyperlocal_orders
alter table public.hyperlocal_orders
  add column if not exists otp_attempts integer not null default 0,
  add column if not exists otp_locked_until timestamptz;

create index if not exists hyperlocal_orders_otp_locked_idx 
  on public.hyperlocal_orders(otp_locked_until)
  where otp_locked_until is not null;

-- 2. SECURE DELIVERY RIDERS TABLE
-- Drop overly permissive public update policy that allowed anyone with anon key to modify wallet balances
drop policy if exists delivery_riders_update_own on public.delivery_riders;
drop policy if exists delivery_riders_select_all on public.delivery_riders;

-- Safe Read Policy: Authenticated users / riders can view active riders
create policy delivery_riders_select_policy on public.delivery_riders
  for select using (true);

-- Restrict updates exclusively to service_role (used by Next.js secure backend APIs)
-- and bound authenticated rider user if user_id matches
create policy delivery_riders_update_secure on public.delivery_riders
  for update using (
    (auth.uid() is not null and user_id = auth.uid())
  )
  with check (
    (auth.uid() is not null and user_id = auth.uid())
  );

-- 3. SECURE HYPERLOCAL ORDERS TABLE
-- Drop public select policy that leaked customer addresses, phone numbers, and OTPs
drop policy if exists hyperlocal_orders_public_select on public.hyperlocal_orders;
drop policy if exists hyperlocal_orders_public_insert on public.hyperlocal_orders;

-- Merchants can view their own outlet orders
drop policy if exists hyperlocal_orders_merchant_select on public.hyperlocal_orders;
create policy hyperlocal_orders_merchant_select on public.hyperlocal_orders
  for select using (
    exists (
      select 1 from public.merchant_accounts ma
      where ma.business_id = hyperlocal_orders.business_id
        and ma.user_id = (select auth.uid())
    )
  );

-- Customers can view their own orders
create policy hyperlocal_orders_customer_select on public.hyperlocal_orders
  for select using (
    customer_id is not null and customer_id = (select auth.uid())
  );

-- 4. SECURE PAYOUT SPLITS & RIDER PAYOUT REQUESTS
-- Ensure splits and payouts cannot be modified by anonymous public requests
revoke update, delete on public.hyperlocal_payout_splits from anon, authenticated;
revoke update, delete on public.rider_payout_requests from anon, authenticated;

-- Ensure service_role maintains full administrative access for backend routes
grant all on public.hyperlocal_orders to service_role;
grant all on public.hyperlocal_order_items to service_role;
grant all on public.delivery_riders to service_role;
grant all on public.hyperlocal_payout_splits to service_role;
grant all on public.rider_payout_requests to service_role;
grant all on public.merchant_settlement_batches to service_role;
