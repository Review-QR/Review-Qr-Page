-- 20261029170000_order_dispute_and_admin_doorstep_cancellation.sql
-- Add dispute tracking and doorstep cancellation metadata to hyperlocal_orders

alter table public.hyperlocal_orders
  add column if not exists dispute_status text default 'none' check (dispute_status in ('none', 'customer_refused', 'customer_unreachable', 'wrong_address', 'resolved')),
  add column if not exists dispute_reported_at timestamptz,
  add column if not exists dispute_notes text,
  add column if not exists cancelled_by text,
  add column if not exists admin_notes text;

create index if not exists hyperlocal_orders_dispute_status_idx
  on public.hyperlocal_orders(dispute_status);
