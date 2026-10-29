-- Migration: 20261028100000_physical_qr_products_system.sql
-- Complete Physical QR Products Ordering System for Trustit
-- Strict isolation: Physical product orders never touch subscriptions or subscription ledger tables

-- 1. QR Products Catalogue
create table if not exists public.qr_products (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  name text not null,
  slug text unique not null,
  category text not null check (category in ('standee', 'sticker', 'display', 'marketing_kit', 'custom')),
  description text not null,
  image_url text,
  base_price numeric not null check (base_price >= 0),
  is_active boolean not null default true,
  stock_policy text not null default 'made_to_order' check (stock_policy in ('in_stock', 'made_to_order', 'on_request')),
  estimated_dispatch_days integer not null default 2,
  print_specifications jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. QR Product Variants
create table if not exists public.qr_product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.qr_products(id) on delete cascade,
  variant_sku text unique not null,
  variant_name text not null,
  material text not null,
  size text not null,
  finish text not null default 'Glossy',
  price numeric not null check (price >= 0),
  stock_quantity integer not null default 100,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create index if not exists qr_product_variants_product_id_idx on public.qr_product_variants(product_id);

-- 3. QR Blank Stock Inventory
create table if not exists public.qr_inventory (
  id uuid primary key default gen_random_uuid(),
  sku text unique not null,
  item_name text not null,
  item_type text not null check (item_type in ('blank_acrylic_base', 'blank_wood_base', 'sticker_sheet', 'banner_stand', 'packaging_box', 'bubble_wrap')),
  quantity_on_hand integer not null default 0,
  safety_threshold integer not null default 10,
  unit_cost numeric not null default 0,
  vendor_details text,
  updated_at timestamptz not null default now()
);

-- 4. QR Inventory Logs
create table if not exists public.qr_inventory_logs (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid not null references public.qr_inventory(id) on delete cascade,
  change_type text not null check (change_type in ('restock', 'order_consumption', 'damaged_writeoff', 'reconciliation')),
  quantity_delta integer not null,
  previous_quantity integer not null,
  new_quantity integer not null,
  order_id text,
  notes text,
  logged_by text,
  created_at timestamptz not null default now()
);

-- 5. Product Orders (Dedicated physical orders table, separate from subscriptions)
create table if not exists public.product_orders (
  id text primary key, -- Format: tord_[a-f0-9]{28}
  business_id text not null references public.businesses(id) on delete restrict,
  merchant_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'awaiting_payment' check (status in (
    'draft',
    'awaiting_payment',
    'paid',
    'confirmed',
    'in_production',
    'quality_check',
    'ready_to_ship',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  )),
  subtotal_amount numeric not null default 0 check (subtotal_amount >= 0),
  shipping_amount numeric not null default 0 check (shipping_amount >= 0),
  tax_amount numeric not null default 0 check (tax_amount >= 0),
  discount_amount numeric not null default 0 check (discount_amount >= 0),
  total_amount numeric not null check (total_amount >= 0),
  currency text not null default 'INR',
  shipping_address jsonb not null default '{}'::jsonb,
  merchant_notes text,
  -- Internal operations (Admin only, never sent to merchant)
  vendor_id text,
  vendor_name text,
  vendor_cost numeric check (vendor_cost is null or vendor_cost >= 0),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  paid_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz
);

create index if not exists product_orders_business_id_idx on public.product_orders(business_id);
create index if not exists product_orders_status_idx on public.product_orders(status);
create index if not exists product_orders_created_at_idx on public.product_orders(created_at desc);

-- 6. Product Order Items (Immutable snapshot of approved artwork, items and prices)
create table if not exists public.product_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.product_orders(id) on delete cascade,
  product_id uuid references public.qr_products(id) on delete set null,
  variant_id uuid references public.qr_product_variants(id) on delete set null,
  product_title text not null,
  variant_title text not null,
  sku text not null,
  unit_price numeric not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  total_price numeric not null check (total_price >= 0),
  personalization jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_order_items_order_id_idx on public.product_order_items(order_id);

-- 7. Product Payments (Cashfree isolation from subscriptions)
create table if not exists public.product_payments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.product_orders(id) on delete cascade,
  cashfree_order_id text unique not null,
  cashfree_payment_id text,
  payment_session_id text,
  amount numeric not null,
  currency text not null default 'INR',
  payment_status text not null default 'PENDING' check (payment_status in ('PENDING', 'SUCCESS', 'FAILED', 'USER_DROPPED', 'CANCELLED', 'REFUNDED')),
  payment_method text,
  verified_at timestamptz,
  raw_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_payments_order_id_idx on public.product_payments(order_id);
create index if not exists product_payments_cashfree_order_id_idx on public.product_payments(cashfree_order_id);

-- 8. Product Order Shipments
create table if not exists public.product_order_shipments (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.product_orders(id) on delete cascade,
  carrier_code text not null default 'delhivery' check (carrier_code in ('delhivery', 'bluedart', 'dtdc', 'indiapost', 'shadowfax', 'other')),
  carrier_name text not null,
  tracking_number text not null,
  tracking_url text,
  shipping_label_url text,
  estimated_delivery date,
  actual_delivery date,
  shipment_status text not null default 'label_created' check (shipment_status in ('label_created', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'returned', 'rto')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_order_shipments_order_id_idx on public.product_order_shipments(order_id);

-- 9. Product Quality Checks (Mandatory prior to dispatch)
create table if not exists public.product_quality_checks (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.product_orders(id) on delete cascade,
  inspector_name text not null,
  qr_scannable boolean not null default false,
  correct_destination_url boolean not null default false,
  scanned_target_url text,
  print_quality_grade text not null default 'pass' check (print_quality_grade in ('pass', 'marginal', 'fail')),
  material_check boolean not null default true,
  packaging_check boolean not null default true,
  passed boolean not null default false,
  notes text,
  checked_at timestamptz not null default now()
);

create index if not exists product_quality_checks_order_id_idx on public.product_quality_checks(order_id);

-- 10. Product Order Complaints & Returns
create table if not exists public.product_order_complaints (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.product_orders(id) on delete cascade,
  business_id text not null references public.businesses(id) on delete cascade,
  merchant_user_id uuid references auth.users(id) on delete set null,
  reason text not null check (reason in ('damaged_in_transit', 'defective_print', 'wrong_item_received', 'qr_scan_failure', 'delayed_delivery', 'other')),
  description text not null,
  photo_urls text[] not null default '{}'::text[],
  status text not null default 'open' check (status in ('open', 'under_review', 'replacement_approved', 'refund_approved', 'rejected', 'resolved')),
  admin_notes text,
  resolution text,
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_order_complaints_business_id_idx on public.product_order_complaints(business_id);
create index if not exists product_order_complaints_order_id_idx on public.product_order_complaints(order_id);

-- 11. Immutable Audit Logs
create table if not exists public.product_order_audit_logs (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.product_orders(id) on delete cascade,
  actor_type text not null check (actor_type in ('merchant', 'admin', 'system', 'webhook')),
  actor_id text,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists product_order_audit_logs_order_id_idx on public.product_order_audit_logs(order_id);

-- ROW LEVEL SECURITY (RLS) POLICIES
alter table public.qr_products enable row level security;
alter table public.qr_product_variants enable row level security;
alter table public.qr_inventory enable row level security;
alter table public.qr_inventory_logs enable row level security;
alter table public.product_orders enable row level security;
alter table public.product_order_items enable row level security;
alter table public.product_payments enable row level security;
alter table public.product_order_shipments enable row level security;
alter table public.product_quality_checks enable row level security;
alter table public.product_order_complaints enable row level security;
alter table public.product_order_audit_logs enable row level security;

-- Public & Merchant reads on active catalogue
drop policy if exists qr_products_select_active on public.qr_products;
create policy qr_products_select_active on public.qr_products
  for select using (is_active = true);

drop policy if exists qr_product_variants_select_active on public.qr_product_variants;
create policy qr_product_variants_select_active on public.qr_product_variants
  for select using (is_active = true);

-- Merchant permissions on orders (Strictly scoped to merchant's own business)
drop policy if exists product_orders_select_own on public.product_orders;
create policy product_orders_select_own on public.product_orders
  for select to authenticated using (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = product_orders.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

drop policy if exists product_orders_insert_own on public.product_orders;
create policy product_orders_insert_own on public.product_orders
  for insert to authenticated with check (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = product_orders.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

drop policy if exists product_order_items_select_own on public.product_order_items;
create policy product_order_items_select_own on public.product_order_items
  for select to authenticated using (exists (
    select 1 from public.product_orders o
    join public.merchant_accounts ma on ma.business_id = o.business_id
    join public.businesses b on b.id = ma.business_id
    where o.id = product_order_items.order_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

drop policy if exists product_order_items_insert_own on public.product_order_items;
create policy product_order_items_insert_own on public.product_order_items
  for insert to authenticated with check (exists (
    select 1 from public.product_orders o
    join public.merchant_accounts ma on ma.business_id = o.business_id
    join public.businesses b on b.id = ma.business_id
    where o.id = product_order_items.order_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

drop policy if exists product_order_shipments_select_own on public.product_order_shipments;
create policy product_order_shipments_select_own on public.product_order_shipments
  for select to authenticated using (exists (
    select 1 from public.product_orders o
    join public.merchant_accounts ma on ma.business_id = o.business_id
    join public.businesses b on b.id = ma.business_id
    where o.id = product_order_shipments.order_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

drop policy if exists product_order_complaints_select_own on public.product_order_complaints;
create policy product_order_complaints_select_own on public.product_order_complaints
  for select to authenticated using (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = product_order_complaints.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

drop policy if exists product_order_complaints_insert_own on public.product_order_complaints;
create policy product_order_complaints_insert_own on public.product_order_complaints
  for insert to authenticated with check (exists (
    select 1 from public.merchant_accounts ma
    join public.businesses b on b.id = ma.business_id
    where ma.business_id = product_order_complaints.business_id
      and ma.user_id = (select auth.uid()) and b.merchant_status = 'active'
  ));

-- Grant service_role full management access
grant all on public.qr_products to service_role;
grant all on public.qr_product_variants to service_role;
grant all on public.qr_inventory to service_role;
grant all on public.qr_inventory_logs to service_role;
grant all on public.product_orders to service_role;
grant all on public.product_order_items to service_role;
grant all on public.product_payments to service_role;
grant all on public.product_order_shipments to service_role;
grant all on public.product_quality_checks to service_role;
grant all on public.product_order_complaints to service_role;
grant all on public.product_order_audit_logs to service_role;

-- SEED INITIAL PRODUCT CATALOGUE & VARIANTS
insert into public.qr_products (id, sku, name, slug, category, description, image_url, base_price, is_active, stock_policy, estimated_dispatch_days, print_specifications)
values
  ('11111111-1111-4111-a111-111111111101', 'PRD-ACR-001', 'Tabletop Acrylic Standee', 'tabletop-acrylic-standee', 'standee', 'Premium crystal-clear acrylic display with natural solid wooden base. Waterproof, scratch-resistant, dual-sided high-resolution print showing your Trustit QR & review prompt.', '/images/products/acrylic-standee.png', 349.00, true, 'made_to_order', 2, '{"material": "Cast Acrylic 3mm + Teak Base", "print_dpi": 300, "bleed_mm": 3, "cut_line": true}'::jsonb),
  ('11111111-1111-4111-a111-111111111102', 'PRD-STK-001', 'Waterproof QR Counter Stickers', 'waterproof-qr-counter-stickers', 'sticker', 'Heavy-duty commercial vinyl stickers for billing counters, glass entrance doors, table surfaces, and salon mirrors. UV-resistant laminate, waterproof and oil-resistant.', '/images/products/qr-stickers.png', 149.00, true, 'in_stock', 1, '{"material": "Vinyl 120 Micron Glossy", "print_dpi": 300, "lamination": "glossy_uv"}'::jsonb),
  ('11111111-1111-4111-a111-111111111103', 'PRD-PVC-001', 'Standard Plastic Display Stand', 'standard-plastic-display-stand', 'display', 'Durable, shatterproof PVC standee ideal for high-traffic retail counters, cafes, and chemist shops. Easy to clean and highly stable.', '/images/products/pvc-stand.png', 299.00, true, 'in_stock', 2, '{"material": "Rigid Foam PVC 5mm", "print_dpi": 300}'::jsonb),
  ('11111111-1111-4111-a111-111111111104', 'PRD-WOD-001', 'Premium Wooden QR Block', 'premium-wooden-qr-block', 'standee', 'Luxury handcrafted solid teak wood QR block with gold-foil Trustit seal. Perfect for high-end restaurants, boutiques, clinics, and executive offices.', '/images/products/wooden-stand.png', 499.00, true, 'made_to_order', 3, '{"material": "Solid Teak Wood + Brass Accent", "print_dpi": 600}'::jsonb),
  ('11111111-1111-4111-a111-111111111105', 'PRD-SLF-001', 'Promotional Selfie-Point Banner', 'promotional-selfie-point-banner', 'marketing_kit', 'Full-height 2ft x 5ft retractable roll-up display banner. Encourages happy customers to snap photos, leave reviews, and tag your business.', '/images/products/selfie-banner.png', 1499.00, true, 'made_to_order', 4, '{"material": "Star Flex 440 GSM with Aluminum Cassette", "size": "2x5 ft"}'::jsonb)
on conflict (sku) do update set
  name = excluded.name,
  description = excluded.description,
  base_price = excluded.base_price,
  is_active = excluded.is_active;

insert into public.qr_product_variants (id, product_id, variant_sku, variant_name, material, size, finish, price, stock_quantity, is_active)
values
  -- Tabletop Acrylic variants
  ('22222222-2222-4222-a222-222222222201', '11111111-1111-4111-a111-111111111101', 'VAR-ACR-A5', 'A5 Acrylic with Wooden Base (6" x 8")', 'Clear Acrylic 3mm + Teak Base', 'A5 (148 x 210 mm)', 'Glossy', 349.00, 200, true),
  ('22222222-2222-4222-a222-222222222202', '11111111-1111-4111-a111-111111111101', 'VAR-ACR-A6', 'A6 Compact Acrylic Tabletop (4" x 6")', 'Clear Acrylic 3mm + Teak Base', 'A6 (105 x 148 mm)', 'Glossy', 249.00, 200, true),
  
  -- Stickers variants
  ('22222222-2222-4222-a222-222222222203', '11111111-1111-4111-a111-111111111102', 'VAR-STK-P5', 'Pack of 5 Waterproof Stickers (4" x 4")', 'Heavy-duty Vinyl', '10 x 10 cm', 'Glossy UV-coated', 149.00, 500, true),
  ('22222222-2222-4222-a222-222222222204', '11111111-1111-4111-a111-111111111102', 'VAR-STK-P10', 'Pack of 10 Waterproof Stickers (4" x 4")', 'Heavy-duty Vinyl', '10 x 10 cm', 'Glossy UV-coated', 249.00, 500, true),

  -- Plastic Display Stand
  ('22222222-2222-4222-a222-222222222205', '11111111-1111-4111-a111-111111111103', 'VAR-PVC-A5', 'A5 Shatterproof PVC Stand', 'Rigid Foam PVC 5mm', 'A5 (148 x 210 mm)', 'Matte Smooth', 299.00, 150, true),

  -- Premium Wooden Stand
  ('22222222-2222-4222-a222-222222222206', '11111111-1111-4111-a111-111111111104', 'VAR-WOD-A5', 'A5 Solid Teak Wood Block with Acrylic Slot', 'Handcrafted Teak Wood', 'A5 (148 x 210 mm)', 'Natural Lacquer', 499.00, 80, true),

  -- Selfie Banner
  ('22222222-2222-4222-a222-222222222207', '11111111-1111-4111-a111-111111111105', 'VAR-SLF-2X5', '2ft x 5ft Retractable Roll-up Standee', 'Star Flex 440 GSM + Aluminum Base', '60 x 150 cm', 'Satin Flex', 1499.00, 50, true)
on conflict (variant_sku) do update set
  variant_name = excluded.variant_name,
  price = excluded.price,
  is_active = excluded.is_active;

-- SEED INVENTORY BLANK BASES
insert into public.qr_inventory (sku, item_name, item_type, quantity_on_hand, safety_threshold, unit_cost, vendor_details)
values
  ('INV-ACR-BASE', 'Blank A5 Acrylic Standee Base Stock', 'blank_acrylic_base', 120, 20, 95.00, 'Super Acrylics Pvt Ltd, Delhi'),
  ('INV-WOD-BASE', 'Blank Teak Wood Block Base Stock', 'blank_wood_base', 45, 10, 160.00, 'Saharanpur Craft House'),
  ('INV-STK-SHT', 'Blank Vinyl Glossy Label Rolls (A4)', 'sticker_sheet', 600, 100, 12.00, 'TechPrint Media Kanpur'),
  ('INV-BAN-STND', 'Aluminum 2x5ft Rollup Cassettes', 'banner_stand', 25, 5, 420.00, 'Apex Signage Systems Lucknow')
on conflict (sku) do update set
  quantity_on_hand = excluded.quantity_on_hand,
  unit_cost = excluded.unit_cost;
