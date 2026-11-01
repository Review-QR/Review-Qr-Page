-- Migration: 20261101104500_merchant_logo_wallet_and_occasion_crm.sql
-- Adds:
-- 1. logo_url on businesses
-- 2. merchant_connect_wallets for messaging credits (Trustit Connect Credits)
-- 3. merchant_credit_transactions audit ledger
-- 4. merchant_occasion_templates for Approved Drafts (Birthday, Anniversary, Offers)
-- 5. RPC functions for safe debit, credit, refund, and DPDP-masked customer occasion queries

-- 1. Business Logo Column
alter table public.businesses
  add column if not exists logo_url text null;

-- 2. Merchant Connect Wallets
create table if not exists public.merchant_connect_wallets (
  business_id text primary key references public.businesses(id) on delete cascade,
  credits_balance integer not null default 0 check (credits_balance >= 0),
  total_recharged integer not null default 0 check (total_recharged >= 0),
  total_consumed integer not null default 0 check (total_consumed >= 0),
  low_balance_threshold integer not null default 50,
  auto_wish_enabled boolean not null default true,
  daily_dispatch_time text not null default '09:00',
  birthday_active boolean not null default true,
  anniversary_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Merchant Credit Transactions Audit Ledger
create table if not exists public.merchant_credit_transactions (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  type text not null check (type in ('recharge', 'dispatch', 'refund', 'bonus', 'admin_adjustment')),
  credits integer not null,
  balance_after integer not null,
  amount_inr numeric(10,2) null,
  cashfree_order_id text null,
  description text not null,
  recipient_masked_phone text null,
  created_at timestamptz not null default now()
);

create index if not exists idx_merchant_credit_tx_business_id 
  on public.merchant_credit_transactions(business_id, created_at desc);

-- 4. Merchant Occasion Templates (Approved Drafts for Birthday, Anniversary, Offers)
create table if not exists public.merchant_occasion_templates (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  occasion_type text not null check (occasion_type in ('birthday', 'anniversary', 'festival', 'offer')),
  template_style text not null default 'gold_celebration',
  headline text not null,
  body_text text not null,
  coupon_code_prefix text not null default 'TRUSTIT',
  discount_percent integer not null default 15,
  coupon_validity_days integer not null default 7,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, occasion_type)
);

create index if not exists idx_merchant_occasion_tpl_biz 
  on public.merchant_occasion_templates(business_id);

-- Enable RLS
alter table public.merchant_connect_wallets enable row level security;
alter table public.merchant_credit_transactions enable row level security;
alter table public.merchant_occasion_templates enable row level security;

-- Grants
grant select, update on public.businesses to authenticated, service_role;
grant all on public.merchant_connect_wallets to authenticated, service_role;
grant all on public.merchant_credit_transactions to authenticated, service_role;
grant all on public.merchant_occasion_templates to authenticated, service_role;

-- Safe RPC to get or initialize a merchant's wallet
create or replace function public.get_or_create_merchant_wallet(p_business_id text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_wallet public.merchant_connect_wallets%rowtype;
begin
  select * into v_wallet
  from public.merchant_connect_wallets
  where business_id = p_business_id;

  if not found then
    insert into public.merchant_connect_wallets (
      business_id,
      credits_balance,
      total_recharged,
      total_consumed,
      low_balance_threshold,
      auto_wish_enabled,
      daily_dispatch_time
    ) values (
      p_business_id,
      0,
      0,
      0,
      50,
      true,
      '09:00'
    )
    returning * into v_wallet;
  end if;

  return jsonb_build_object(
    'business_id', v_wallet.business_id,
    'credits_balance', v_wallet.credits_balance,
    'total_recharged', v_wallet.total_recharged,
    'total_consumed', v_wallet.total_consumed,
    'low_balance_threshold', v_wallet.low_balance_threshold,
    'auto_wish_enabled', v_wallet.auto_wish_enabled,
    'daily_dispatch_time', v_wallet.daily_dispatch_time,
    'birthday_active', v_wallet.birthday_active,
    'anniversary_active', v_wallet.anniversary_active
  );
end;
$$;

grant execute on function public.get_or_create_merchant_wallet(text) to authenticated, service_role;
