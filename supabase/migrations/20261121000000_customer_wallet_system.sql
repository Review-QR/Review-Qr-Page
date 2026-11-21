-- Customer Wallet System
-- Adds stored wallet balance, top-up transactions, and payment tracking

-- 1. Customer wallets table (one row per customer)
create table if not exists public.customer_wallets (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references auth.users(id) on delete cascade,
  balance_inr numeric(10,2) not null default 0.00 check (balance_inr >= 0),
  currency text not null default 'INR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customer_wallets_customer_id_unique unique (customer_id)
);

-- 2. Wallet transaction ledger (immutable)
create table if not exists public.wallet_transactions (
  id uuid primary key default gen_random_uuid(),
  wallet_id uuid not null references public.customer_wallets(id) on delete cascade,
  type text not null check (type in ('credit', 'debit', 'refund', 'bonus', 'topup', 'payment')),
  amount_inr numeric(10,2) not null check (amount_inr > 0),
  balance_after_inr numeric(10,2) not null,
  reference_type text,  -- 'order', 'topup', 'refund', 'promo', etc.
  reference_id text,    -- order_id, payment_id, etc.
  payment_method text,  -- 'upi', 'card', 'netbanking', 'cod', 'cashfree'
  payment_gateway_txn_id text,
  description text,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- 3. Indexes
create index if not exists idx_customer_wallets_customer on public.customer_wallets (customer_id);
create index if not exists idx_wallet_transactions_wallet on public.wallet_transactions (wallet_id, created_at desc);
create index if not exists idx_wallet_transactions_reference on public.wallet_transactions (reference_type, reference_id);
create index if not exists idx_wallet_transactions_created on public.wallet_transactions (created_at desc);

-- 4. RLS
alter table public.customer_wallets enable row level security;
alter table public.wallet_transactions enable row level security;

-- Customers can view their own wallet
create policy "customer_wallets_own_select" on public.customer_wallets
  for select to authenticated
  using (customer_id = auth.uid());

-- Customers can view their own transactions
create policy "wallet_transactions_own_select" on public.wallet_transactions
  for select to authenticated
  using (wallet_id in (select id from public.customer_wallets where customer_id = auth.uid()));

-- Service role can do everything (for API routes)
grant all on public.customer_wallets to service_role;
grant all on public.wallet_transactions to service_role;

-- Revoke from public/anonymous
revoke all on public.customer_wallets from anon, authenticated, public;
revoke all on public.wallet_transactions from anon, authenticated, public;

-- 5. Function to auto-create wallet on customer signup
create or replace function public.ensure_customer_wallet(p_customer uuid)
returns uuid
language plpgsql
security definer
as $$
begin
  insert into public.customer_wallets (customer_id)
  values (p_customer)
  on conflict (customer_id) do nothing
  returning id into result;
  return result;
end;
$$;

grant execute on function public.ensure_customer_wallet(uuid) to service_role;
grant execute on function public.ensure_customer_wallet(uuid) to authenticated;

-- 6. Function to atomically adjust wallet balance
create or replace function public.adjust_wallet_balance(
  p_wallet uuid,
  p_amount numeric,
  p_type text,
  p_description text default '',
  p_reference_type text default null,
  p_reference_id text default null
)
returns jsonb
language plpgsql
as $$
declare
  v_wallet record;
  v_new_balance numeric;
begin
  -- Lock the wallet row
  select * into v_wallet from public.customer_wallets
  where id = p_wallet for update;

  if not found then
    return jsonb_build_object('error', 'wallet_not_found');
  end if;

  if not v_wallet.is_active then
    return jsonb_build_object('error', 'wallet_inactive');
  end if;

  -- Calculate new balance
  if p_type in ('credit', 'refund', 'bonus', 'topup') then
    v_new_balance := v_wallet.balance_inr + p_amount;
  else
    if v_wallet.balance_inr < p_amount then
      return jsonb_build_object('error', 'insufficient_balance', 'current_balance', v_wallet.balance_inr);
    end if;
    v_new_balance := v_wallet.balance_inr - p_amount;
  end if;

  -- Update balance
  update public.customer_wallets
  set balance_inr = v_new_balance, updated_at = now()
  where id = p_wallet;

  -- Insert transaction ledger entry
  insert into public.wallet_transactions
    (wallet_id, type, amount_inr, balance_after_inr, reference_type, reference_id, description)
  values
    (p_wallet, p_type, p_amount, v_new_balance, p_reference_type, p_reference_id, p_description);

  return jsonb_build_object(
    'ok', true,
    'new_balance', v_new_balance,
    'transaction_type', p_type,
    'amount', p_amount
  );
end;
$$;

grant execute on function public.adjust_wallet_balance(uuid, numeric, text, text, text, text) to service_role;
revoke all on function public.adjust_wallet_balance(uuid, numeric, text, text, text, text) from anon, public;
