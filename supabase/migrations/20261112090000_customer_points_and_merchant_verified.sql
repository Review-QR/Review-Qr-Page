-- ============================================================================
-- Trustit Super-App: Merchant Admin Verification & Customer Reward Points
-- Ratio rule enforced in UI/API: 350 Points = INR 100
-- ============================================================================

-- 1. Businesses: explicit admin-controlled verification flag (default false;
-- never auto-verified).
alter table public.businesses
  add column if not exists is_verified boolean not null default false,
  add column if not exists verified_at timestamptz;

create index if not exists businesses_is_verified_idx
  on public.businesses (is_verified);

-- 2. Customers: reward points balance (350 points = INR 100).
alter table public.customers
  add column if not exists reward_points integer not null default 0;

-- Ensure existing NULL values (if any) default cleanly to 0
update public.customers
  set reward_points = 0
  where reward_points is null;

-- 3. Customer Points Ledger: full audit trail for admin top-ups / add-ons.
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
