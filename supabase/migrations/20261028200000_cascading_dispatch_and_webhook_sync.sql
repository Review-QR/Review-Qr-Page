-- 20261028200000_cascading_dispatch_and_webhook_sync.sql
-- Add cascading proximity radar dispatch fields and Cashfree payment identifiers to hyperlocal_orders

alter table public.hyperlocal_orders
  add column if not exists dispatch_target_rider_id uuid references public.delivery_riders(id) on delete set null,
  add column if not exists dispatch_expires_at timestamptz,
  add column if not exists dispatch_current_radius_meters integer not null default 1000,
  add column if not exists dispatch_declined_rider_ids uuid[] not null default '{}',
  add column if not exists cashfree_order_id text,
  add column if not exists cashfree_payment_id text;

create index if not exists hyperlocal_orders_dispatch_target_idx
  on public.hyperlocal_orders(dispatch_target_rider_id);

create index if not exists hyperlocal_orders_dispatch_expiry_idx
  on public.hyperlocal_orders(dispatch_expires_at);

create index if not exists hyperlocal_orders_cashfree_order_id_idx
  on public.hyperlocal_orders(cashfree_order_id);
