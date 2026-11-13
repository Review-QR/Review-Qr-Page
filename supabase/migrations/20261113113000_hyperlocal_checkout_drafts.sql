-- ============================================================================
-- Hyperlocal Checkout Drafts & Zero-Fake-Orders Strict Lifecycle
-- Ensures online Cashfree payments NEVER create an active placed order
-- until payment is officially verified and confirmed as 'PAID'.
-- ============================================================================

begin;

-- 1. Create table for checkout drafts (temporary session hold before payment)
create table if not exists public.hyperlocal_checkout_drafts (
  id text primary key, -- Format: cdraft_[timestamp]_[hex]
  business_id text not null references public.businesses(id) on delete restrict,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address jsonb not null default '{}'::jsonb,
  customer_notes text,
  order_type text not null default 'food_delivery',
  items jsonb not null default '[]'::jsonb,
  subtotal numeric(10, 2) not null default 0,
  delivery_fee numeric(10, 2) not null default 0,
  platform_fee numeric(10, 2) not null default 5,
  total_amount numeric(10, 2) not null default 0,
  cashfree_order_id text,
  cashfree_session_id text,
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'cancelled', 'expired')),
  placed_order_id text references public.hyperlocal_orders(id) on delete set null,
  expires_at timestamptz not null default (now() + interval '30 minutes'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists hyperlocal_checkout_drafts_cashfree_order_idx
  on public.hyperlocal_checkout_drafts (cashfree_order_id);

create index if not exists hyperlocal_checkout_drafts_customer_phone_idx
  on public.hyperlocal_checkout_drafts (customer_phone, created_at desc);

create index if not exists hyperlocal_checkout_drafts_business_idx
  on public.hyperlocal_checkout_drafts (business_id);

-- Enable RLS
alter table public.hyperlocal_checkout_drafts enable row level security;

-- Service role access
drop policy if exists "service_role_all_hyperlocal_checkout_drafts" on public.hyperlocal_checkout_drafts;
create policy "service_role_all_hyperlocal_checkout_drafts"
  on public.hyperlocal_checkout_drafts
  for all
  to service_role
  using (true)
  with check (true);

grant all on table public.hyperlocal_checkout_drafts to postgres, service_role;

-- 2. Clean up any existing stale/fake unpaid online orders so they never show again
update public.hyperlocal_orders
set status = 'cancelled'
where payment_mode = 'online_cashfree'
  and payment_status != 'paid'
  and status = 'placed';

commit;
