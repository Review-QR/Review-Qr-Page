-- Migration: 20261029100000_customer_email_auth_and_saved_addresses.sql
-- Customer Identity, Modular Verification Codes, Multiple Saved Addresses, and Order Linkage

-- 1. Customers Table
create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  full_name text not null default 'Trustit Customer',
  phone text,
  is_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customers_email_idx on public.customers(email);
create index if not exists customers_phone_idx on public.customers(phone);

-- 2. Customer Saved Addresses
create table if not exists public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null default 'Home', -- 'Home', 'Work', 'Other'
  street text not null,
  landmark text,
  city text not null default 'Bahraich',
  pincode text,
  latitude double precision,
  longitude double precision,
  is_default boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists customer_addresses_customer_idx on public.customer_addresses(customer_id);

-- 3. Customer Modular Auth Codes (Email OTP / SMS OTP)
create table if not exists public.customer_auth_codes (
  id uuid primary key default gen_random_uuid(),
  destination text not null, -- email or phone
  code_hash text not null,
  attempts integer not null default 0,
  expires_at timestamptz not null,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists customer_auth_codes_dest_idx on public.customer_auth_codes(destination);
create index if not exists customer_auth_codes_expiry_idx on public.customer_auth_codes(expires_at);

-- 4. Enable RLS, grant permissions, and configure permissive policies
grant all on table public.customers to postgres, service_role, authenticated, anon;
grant all on table public.customer_addresses to postgres, service_role, authenticated, anon;
grant all on table public.customer_auth_codes to postgres, service_role, authenticated, anon;

alter table public.customers enable row level security;
alter table public.customer_addresses enable row level security;
alter table public.customer_auth_codes enable row level security;

-- Permissive service role access
create policy "service_role_all_customers" on public.customers
  for all using (true) with check (true);

create policy "service_role_all_addresses" on public.customer_addresses
  for all using (true) with check (true);

create policy "service_role_all_auth_codes" on public.customer_auth_codes
  for all using (true) with check (true);

-- 5. Link hyperlocal_orders customer_id to public.customers
alter table public.hyperlocal_orders drop constraint if exists hyperlocal_orders_customer_id_fkey;
alter table public.hyperlocal_orders
  add constraint hyperlocal_orders_customer_id_fkey
  foreign key (customer_id) references public.customers(id) on delete set null;
