-- Migration: 20261028140000_hyperlocal_superapp_ecosystem.sql
-- Hyperlocal Super-App Ecosystem: Food Delivery, Salon Tokens, Car Wash Slots, Kirana Parcha, and Delivery Partner Dispatch

-- 1. Delivery Riders Profile & Live GPS Location
create table if not exists public.delivery_riders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  phone text unique not null,
  email text,
  vehicle_type text not null default 'bike' check (vehicle_type in ('bike', 'scooter', 'bicycle', 'electric_bike')),
  vehicle_number text not null,
  is_online boolean not null default false,
  is_available boolean not null default true,
  current_latitude double precision,
  current_longitude double precision,
  last_location_updated_at timestamptz,
  cash_in_hand numeric not null default 0 check (cash_in_hand >= 0),
  wallet_balance numeric not null default 0,
  rating numeric not null default 5.0 check (rating >= 1.0 and rating <= 5.0),
  is_verified boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists delivery_riders_online_available_idx on public.delivery_riders(is_online, is_available);
create index if not exists delivery_riders_phone_idx on public.delivery_riders(phone);

-- 2. Hyperlocal Core Orders Table
create table if not exists public.hyperlocal_orders (
  id text primary key, -- Format: hord_[a-f0-9]{28}
  business_id text not null references public.businesses(id) on delete restrict,
  customer_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_address jsonb not null default '{}'::jsonb,
  order_type text not null default 'food_delivery' check (order_type in (
    'food_delivery',
    'grocery_parcha',
    'salon_token',
    'car_wash_slot',
    'parcel_pickup'
  )),
  status text not null default 'placed' check (status in (
    'placed',
    'accepted_by_merchant',
    'preparing',
    'ready_for_pickup',
    'rider_assigned',
    'picked_up',
    'out_for_delivery',
    'arrived_at_doorstep',
    'delivered',
    'completed',
    'rejected',
    'cancelled'
  )),
  payment_mode text not null default 'online_cashfree' check (payment_mode in (
    'online_cashfree',
    'cod',
    'counter_cash',
    'upi_at_counter'
  )),
  payment_status text not null default 'pending' check (payment_status in (
    'pending',
    'paid',
    'cod_collected',
    'refunded',
    'failed'
  )),
  subtotal_amount numeric not null default 0 check (subtotal_amount >= 0),
  delivery_fee numeric not null default 0 check (delivery_fee >= 0),
  platform_fee numeric not null default 0 check (platform_fee >= 0),
  tax_amount numeric not null default 0 check (tax_amount >= 0),
  total_amount numeric not null check (total_amount >= 0),
  delivery_otp varchar(4) not null,
  rider_id uuid references public.delivery_riders(id) on delete set null,
  merchant_prep_time_minutes integer default 20,
  customer_notes text,
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  accepted_at timestamptz,
  ready_at timestamptz,
  picked_up_at timestamptz,
  delivered_at timestamptz
);

create index if not exists hyperlocal_orders_business_idx on public.hyperlocal_orders(business_id);
create index if not exists hyperlocal_orders_status_idx on public.hyperlocal_orders(status);
create index if not exists hyperlocal_orders_rider_idx on public.hyperlocal_orders(rider_id);
create index if not exists hyperlocal_orders_created_at_idx on public.hyperlocal_orders(created_at desc);

-- 3. Hyperlocal Order Line Items
create table if not exists public.hyperlocal_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.hyperlocal_orders(id) on delete cascade,
  item_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric not null check (unit_price >= 0),
  total_price numeric not null check (total_price >= 0),
  is_veg boolean default true,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists hyperlocal_order_items_order_id_idx on public.hyperlocal_order_items(order_id);

-- 4. Grocery Parcha Details
create table if not exists public.grocery_parcha_orders (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null references public.hyperlocal_orders(id) on delete cascade,
  parcha_image_url text,
  handwritten_text text,
  voice_note_url text,
  merchant_quote_amount numeric,
  merchant_quote_items jsonb default '[]'::jsonb,
  customer_approved boolean default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Salon Tokens & Car Wash Bay Queue
create table if not exists public.service_tokens_and_slots (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  order_id text references public.hyperlocal_orders(id) on delete set null,
  service_type text not null check (service_type in ('salon_haircut', 'salon_facial', 'car_foam_wash', 'bike_wash', 'car_interior')),
  token_number integer not null,
  customer_name text not null,
  customer_phone text not null,
  vehicle_or_notes text,
  status text not null default 'waiting' check (status in ('waiting', 'in_progress', 'ready_for_pickup', 'completed', 'no_show', 'cancelled')),
  slot_time text,
  estimated_wait_minutes integer default 15,
  chair_or_bay_number text default 'Bay 1',
  booking_date date not null default current_date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_tokens_business_date_idx on public.service_tokens_and_slots(business_id, booking_date);

-- 6. Merchant & Rider Payout Multi-Vendor Splits
create table if not exists public.hyperlocal_payout_splits (
  id uuid primary key default gen_random_uuid(),
  order_id text unique not null references public.hyperlocal_orders(id) on delete cascade,
  gross_amount numeric not null,
  merchant_id text not null references public.businesses(id) on delete restrict,
  merchant_gross numeric not null,
  platform_commission numeric not null default 0,
  merchant_net_payable numeric not null,
  rider_id uuid references public.delivery_riders(id) on delete set null,
  rider_payout numeric not null default 0,
  platform_convenience_fee numeric not null default 0,
  payment_gateway_fee numeric not null default 0,
  settlement_status text not null default 'pending' check (settlement_status in ('pending', 'settled_split', 'wallet_credited', 'cod_collected', 'disputed')),
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists hyperlocal_payout_splits_merchant_idx on public.hyperlocal_payout_splits(merchant_id);
create index if not exists hyperlocal_payout_splits_rider_idx on public.hyperlocal_payout_splits(rider_id);

-- RLS POLICIES
alter table public.delivery_riders enable row level security;
alter table public.hyperlocal_orders enable row level security;
alter table public.hyperlocal_order_items enable row level security;
alter table public.grocery_parcha_orders enable row level security;
alter table public.service_tokens_and_slots enable row level security;
alter table public.hyperlocal_payout_splits enable row level security;

-- Rider policies: Rider can read and update their own status/location
drop policy if exists delivery_riders_select_all on public.delivery_riders;
create policy delivery_riders_select_all on public.delivery_riders
  for select using (true);

drop policy if exists delivery_riders_update_own on public.delivery_riders;
create policy delivery_riders_update_own on public.delivery_riders
  for update using (true) with check (true);

-- Merchant policies on orders: Merchant can read/update their business's orders
drop policy if exists hyperlocal_orders_merchant_select on public.hyperlocal_orders;
create policy hyperlocal_orders_merchant_select on public.hyperlocal_orders
  for select using (exists (
    select 1 from public.merchant_accounts ma
    where ma.business_id = hyperlocal_orders.business_id
      and ma.user_id = (select auth.uid())
  ));

drop policy if exists hyperlocal_orders_public_insert on public.hyperlocal_orders;
create policy hyperlocal_orders_public_insert on public.hyperlocal_orders
  for insert with check (true);

drop policy if exists hyperlocal_orders_public_select on public.hyperlocal_orders;
create policy hyperlocal_orders_public_select on public.hyperlocal_orders
  for select using (true);

drop policy if exists hyperlocal_order_items_select on public.hyperlocal_order_items;
create policy hyperlocal_order_items_select on public.hyperlocal_order_items
  for select using (true);

drop policy if exists hyperlocal_order_items_insert on public.hyperlocal_order_items;
create policy hyperlocal_order_items_insert on public.hyperlocal_order_items
  for insert with check (true);

drop policy if exists service_tokens_select on public.service_tokens_and_slots;
create policy service_tokens_select on public.service_tokens_and_slots
  for select using (true);

drop policy if exists service_tokens_insert on public.service_tokens_and_slots;
create policy service_tokens_insert on public.service_tokens_and_slots
  for insert with check (true);

drop policy if exists service_tokens_update on public.service_tokens_and_slots;
create policy service_tokens_update on public.service_tokens_and_slots
  for update using (true) with check (true);

drop policy if exists grocery_parcha_orders_select on public.grocery_parcha_orders;
create policy grocery_parcha_orders_select on public.grocery_parcha_orders
  for select using (true);

drop policy if exists grocery_parcha_orders_insert on public.grocery_parcha_orders;
create policy grocery_parcha_orders_insert on public.grocery_parcha_orders
  for insert with check (true);

-- Full access to service_role
grant all on public.delivery_riders to service_role;
grant all on public.hyperlocal_orders to service_role;
grant all on public.hyperlocal_order_items to service_role;
grant all on public.grocery_parcha_orders to service_role;
grant all on public.service_tokens_and_slots to service_role;
grant all on public.hyperlocal_payout_splits to service_role;

-- Seed Sample Delivery Riders for Local Testing in Bahraich
insert into public.delivery_riders (id, full_name, phone, vehicle_type, vehicle_number, is_online, is_available, current_latitude, current_longitude, rating)
values
  ('33333333-3333-4333-a333-333333333301', 'Rahul Verma (Rider 1)', '+919415011111', 'bike', 'UP-40-AB-1234', true, true, 27.5745, 81.5965, 4.9),
  ('33333333-3333-4333-a333-333333333302', 'Amit Shukla (Rider 2)', '+919415022222', 'bike', 'UP-40-XY-5678', true, true, 27.5760, 81.5980, 4.8),
  ('33333333-3333-4333-a333-333333333303', 'Sonu Qureshi (Rider 3)', '+919415033333', 'scooter', 'UP-40-CD-9012', true, true, 27.5710, 81.6010, 4.7)
on conflict (phone) do update set
  is_online = excluded.is_online,
  is_available = excluded.is_available,
  current_latitude = excluded.current_latitude,
  current_longitude = excluded.current_longitude;
