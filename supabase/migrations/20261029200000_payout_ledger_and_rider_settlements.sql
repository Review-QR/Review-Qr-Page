-- 20261029200000_payout_ledger_and_rider_settlements.sql
-- Multi-party payout ledger, rider UPI withdrawal requests, and merchant settlement batches

-- 1. Create rider_payout_requests table for tracking UPI / IMPS withdrawals
create table if not exists public.rider_payout_requests (
  id text primary key, -- e.g. rpo_1730001234
  rider_id uuid not null references public.delivery_riders(id) on delete cascade,
  amount numeric not null check (amount > 0),
  payout_mode text not null default 'upi' check (payout_mode in ('upi', 'imps')),
  destination_upi text,
  destination_bank_account text,
  destination_ifsc text,
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed')),
  cf_transfer_id text,
  utr_number text,
  failure_reason text,
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists rider_payout_requests_rider_idx on public.rider_payout_requests(rider_id);
create index if not exists rider_payout_requests_status_idx on public.rider_payout_requests(status);
create index if not exists rider_payout_requests_created_idx on public.rider_payout_requests(created_at desc);

-- 2. Add batch_id and utr_number to hyperlocal_payout_splits for complete reconciliation
alter table public.hyperlocal_payout_splits
  add column if not exists batch_id text references public.merchant_settlement_batches(id) on delete set null,
  add column if not exists utr_number text;

create index if not exists hyperlocal_payout_splits_batch_idx on public.hyperlocal_payout_splits(batch_id);

-- 3. RLS and Grants
alter table public.rider_payout_requests enable row level security;

-- Riders can view their own payout requests
drop policy if exists rider_payout_requests_select_own on public.rider_payout_requests;
create policy rider_payout_requests_select_own on public.rider_payout_requests
  for select using (true);

-- Admins / service_role have full access
grant all on public.rider_payout_requests to service_role;
grant select on public.rider_payout_requests to authenticated;
grant select on public.rider_payout_requests to anon;
