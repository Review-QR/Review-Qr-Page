-- Migration: 20261028160000_merchant_onboarding_kyc_and_bank_payouts.sql
-- All-Type Merchant Onboarding, KYC Document Verification, Bank Accounts, Bank Change Requests, and Settlement Batches

-- 1. Merchant Bank Accounts Table
create table if not exists public.merchant_bank_accounts (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  account_holder_name text not null,
  bank_account_number text not null,
  ifsc_code text not null,
  bank_name text not null,
  branch_name text,
  account_type text not null default 'current' check (account_type in ('current', 'savings')),
  upi_id text,
  passbook_or_cheque_url text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verification_method text default 'admin_manual' check (verification_method in ('penny_drop', 'admin_manual', 'none')),
  penny_drop_reference text,
  verified_at timestamptz,
  verified_by text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_merchant_bank_account_business unique (business_id)
);

create index if not exists merchant_bank_accounts_business_idx on public.merchant_bank_accounts(business_id);
create index if not exists merchant_bank_accounts_status_idx on public.merchant_bank_accounts(verification_status);

-- 2. Merchant Category-Wise KYC Documents Table
create table if not exists public.merchant_kyc_documents (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  document_type text not null check (document_type in (
    'pan_card',
    'aadhaar_card',
    'fssai_license',
    'drug_license',
    'trade_license',
    'gst_certificate',
    'shop_photo'
  )),
  document_number text,
  document_url text,
  verification_status text not null default 'pending' check (verification_status in ('pending', 'verified', 'rejected')),
  verified_at timestamptz,
  verified_by text,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists merchant_kyc_docs_business_idx on public.merchant_kyc_documents(business_id);
create index if not exists merchant_kyc_docs_type_idx on public.merchant_kyc_documents(document_type);

-- 3. Merchant Bank Account Change Requests (Anti-Fraud Protocol)
create table if not exists public.merchant_bank_change_requests (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  current_account_number text not null,
  current_ifsc text not null,
  new_account_holder_name text not null,
  new_account_number text not null,
  new_ifsc_code text not null,
  new_bank_name text not null,
  new_passbook_or_cheque_url text,
  otp_verified boolean not null default false,
  cooling_off_until timestamptz,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  admin_notes text,
  verbal_confirmation_completed boolean not null default false,
  reviewed_by text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bank_change_requests_business_idx on public.merchant_bank_change_requests(business_id);
create index if not exists bank_change_requests_status_idx on public.merchant_bank_change_requests(status);

-- 4. Merchant Daily Settlement Batches Table (T+1 Passbook Ledger)
create table if not exists public.merchant_settlement_batches (
  id text primary key, -- e.g. set_20261028_001
  business_id text not null references public.businesses(id) on delete cascade,
  settlement_date date not null default current_date,
  orders_count integer not null default 0,
  gross_sales numeric not null default 0,
  platform_commission numeric not null default 0,
  payment_gateway_fee numeric not null default 0,
  tds_deduction numeric not null default 0,
  net_payout_amount numeric not null default 0,
  bank_utr_number text,
  bank_account_number text,
  ifsc_code text,
  status text not null default 'settled' check (status in ('pending', 'processing', 'settled', 'failed', 'hold')),
  settled_at timestamptz default now(),
  created_at timestamptz not null default now()
);

create index if not exists settlement_batches_business_idx on public.merchant_settlement_batches(business_id);
create index if not exists settlement_batches_date_idx on public.merchant_settlement_batches(settlement_date desc);

-- 5. RLS Policies
alter table public.merchant_bank_accounts enable row level security;
alter table public.merchant_kyc_documents enable row level security;
alter table public.merchant_bank_change_requests enable row level security;
alter table public.merchant_settlement_batches enable row level security;

-- Merchant read their own bank account
create policy merchant_bank_accounts_select_own on public.merchant_bank_accounts
  for select using (exists (
    select 1 from public.merchant_accounts ma
    where ma.business_id = merchant_bank_accounts.business_id
      and ma.user_id = (select auth.uid())
  ));

-- Merchant insert their bank account if none exists
create policy merchant_bank_accounts_insert_own on public.merchant_bank_accounts
  for insert with check (exists (
    select 1 from public.merchant_accounts ma
    where ma.business_id = merchant_bank_accounts.business_id
      and ma.user_id = (select auth.uid())
  ));

-- Service role / Admin full access to bank accounts
create policy merchant_bank_accounts_admin_all on public.merchant_bank_accounts
  for all using (true) with check (true);

-- Merchant KYC documents policies
create policy merchant_kyc_select_own on public.merchant_kyc_documents
  for select using (exists (
    select 1 from public.merchant_accounts ma
    where ma.business_id = merchant_kyc_documents.business_id
      and ma.user_id = (select auth.uid())
  ));

create policy merchant_kyc_insert_own on public.merchant_kyc_documents
  for insert with check (exists (
    select 1 from public.merchant_accounts ma
    where ma.business_id = merchant_kyc_documents.business_id
      and ma.user_id = (select auth.uid())
  ));

create policy merchant_kyc_admin_all on public.merchant_kyc_documents
  for all using (true) with check (true);

-- Bank change requests policies
create policy bank_change_requests_select_own on public.merchant_bank_change_requests
  for select using (exists (
    select 1 from public.merchant_accounts ma
    where ma.business_id = merchant_bank_change_requests.business_id
      and ma.user_id = (select auth.uid())
  ));

create policy bank_change_requests_insert_own on public.merchant_bank_change_requests
  for insert with check (exists (
    select 1 from public.merchant_accounts ma
    where ma.business_id = merchant_bank_change_requests.business_id
      and ma.user_id = (select auth.uid())
  ));

create policy bank_change_requests_admin_all on public.merchant_bank_change_requests
  for all using (true) with check (true);

-- Settlement batches policies
create policy settlement_batches_select_own on public.merchant_settlement_batches
  for select using (exists (
    select 1 from public.merchant_accounts ma
    where ma.business_id = merchant_settlement_batches.business_id
      and ma.user_id = (select auth.uid())
  ));

create policy settlement_batches_admin_all on public.merchant_settlement_batches
  for all using (true) with check (true);
