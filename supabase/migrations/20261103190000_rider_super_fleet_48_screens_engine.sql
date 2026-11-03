-- Migration: 20261103190000_rider_super_fleet_48_screens_engine.sql
-- Complete Supabase Schema Engine for Trustit Rider Partner 48-Screen Architecture
-- Powers Multi-Category Dispatches, GPS Heartbeats, Passbook Ledger, Shift Bookings, and Exception Handling

-- 1. Extend Delivery Riders Table with 48-Screen Telemetry & Preference Fields
alter table public.delivery_riders
  add column if not exists cash_ceiling_limit numeric not null default 1500.00,
  add column if not exists tier_status text not null default 'gold' check (tier_status in ('bronze', 'silver', 'gold', 'diamond')),
  add column if not exists acceptance_rate numeric not null default 98.2,
  add column if not exists daily_helmet_verified_at timestamptz,
  add column if not exists training_completed_at timestamptz,
  add column if not exists insurance_policy_number text not null default 'TR-ACKO-BHR-4091',
  add column if not exists active_shift_id text,
  add column if not exists opted_categories jsonb not null default '["food", "grocery", "pharmacy", "genie", "cake"]'::jsonb,
  add column if not exists referral_code text unique,
  add column if not exists referred_by_code text,
  add column if not exists battery_level integer not null default 100,
  add column if not exists is_battery_critical boolean not null default false,
  add column if not exists emergency_contact_name text default 'Ravi Shankar (Fleet Ops)',
  add column if not exists emergency_contact_phone text default '+919415099999';

-- Auto-generate referral codes for existing riders if null
update public.delivery_riders
set referral_code = 'ARJUN' || substr(replace(id::text, '-', ''), 1, 4)
where referral_code is null;

-- 2. Rider High-Frequency GPS Heartbeats & Telemetry
create table if not exists public.rider_gps_heartbeats (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.delivery_riders(id) on delete cascade,
  latitude double precision not null,
  longitude double precision not null,
  speed_kmh numeric not null default 0,
  heading_degrees numeric default 0,
  accuracy_meters numeric not null default 4.0,
  battery_percentage integer not null default 100,
  is_moving boolean not null default true,
  halt_duration_seconds integer not null default 0,
  recorded_at timestamptz not null default now()
);

create index if not exists rider_gps_heartbeats_rider_time_idx 
  on public.rider_gps_heartbeats(rider_id, recorded_at desc);

-- 3. Rider Passbook Ledger & Granular Transaction Stream
create table if not exists public.rider_passbook_transactions (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.delivery_riders(id) on delete cascade,
  order_id text references public.hyperlocal_orders(id) on delete set null,
  transaction_type text not null check (transaction_type in (
    'base_fare',
    'distance_corridor_km',
    'heavy_payload_bonus',
    'wait_time_compensation',
    'customer_tip',
    'surge_rush_bonus',
    'cancellation_travel_pay',
    'parking_toll_reimbursement',
    'penalty_deduction',
    'dispute_refund',
    'minimum_guarantee_topup',
    'cash_remitted_escrow',
    'instant_upi_payout'
  )),
  amount numeric not null, -- Positive for credits, negative for debits/remittance
  running_wallet_balance numeric not null default 0,
  title text not null,
  description text,
  metadata jsonb default '{}'::jsonb,
  status text not null default 'settled' check (status in ('pending', 'settled', 'disputed', 'reversed')),
  created_at timestamptz not null default now()
);

create index if not exists rider_passbook_rider_idx 
  on public.rider_passbook_transactions(rider_id, created_at desc);
create index if not exists rider_passbook_order_idx 
  on public.rider_passbook_transactions(order_id);

-- 4. Rider Shift Bookings & Minimum Guarantee (MG) Engine
create table if not exists public.rider_shift_bookings (
  id uuid primary key default gen_random_uuid(),
  rider_id uuid not null references public.delivery_riders(id) on delete cascade,
  shift_name text not null check (shift_name in ('lunch_rush', 'dinner_peak', 'night_owl')),
  booking_date date not null,
  shift_start_time text not null default '11:30',
  shift_end_time text not null default '15:30',
  minimum_guarantee_amount numeric not null default 400.00,
  min_orders_required integer not null default 4,
  min_acceptance_rate numeric not null default 85.0,
  orders_completed integer not null default 0,
  actual_acceptance_rate numeric not null default 100.0,
  status text not null default 'booked' check (status in ('booked', 'active', 'completed', 'missed', 'cancelled')),
  is_mg_paid boolean not null default false,
  created_at timestamptz not null default now(),
  unique(rider_id, shift_name, booking_date)
);

create index if not exists rider_shift_bookings_lookup_idx 
  on public.rider_shift_bookings(booking_date, shift_name, status);

-- 5. On-Road Incidents, Disputes & Buddy Handover Logs
create table if not exists public.rider_road_incidents (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.hyperlocal_orders(id) on delete cascade,
  original_rider_id uuid not null references public.delivery_riders(id) on delete cascade,
  rescue_rider_id uuid references public.delivery_riders(id) on delete set null,
  incident_type text not null check (incident_type in (
    'puncture_breakdown',
    'accident_injury',
    'customer_unreachable',
    'customer_refused_cod',
    'railway_crossing_halt',
    'no_cash_change_wallet',
    'parking_toll_claim',
    'store_delay_wait'
  )),
  handover_otp text,
  status text not null default 'open' check (status in ('open', 'dispatched', 'resolved', 'closed')),
  proof_photo_url text,
  notes text,
  original_rider_payout numeric not null default 0,
  rescue_rider_payout numeric not null default 0,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists rider_road_incidents_order_idx 
  on public.rider_road_incidents(order_id);
create index if not exists rider_road_incidents_original_rider_idx 
  on public.rider_road_incidents(original_rider_id);

-- 6. Enable Row Level Security (RLS) & Grants
alter table public.rider_gps_heartbeats enable row level security;
alter table public.rider_passbook_transactions enable row level security;
alter table public.rider_shift_bookings enable row level security;
alter table public.rider_road_incidents enable row level security;

-- Policies for Authenticated & Service Role Access
drop policy if exists rider_gps_heartbeats_service_role on public.rider_gps_heartbeats;
create policy rider_gps_heartbeats_service_role on public.rider_gps_heartbeats
  for all using (true) with check (true);

drop policy if exists rider_passbook_transactions_service_role on public.rider_passbook_transactions;
create policy rider_passbook_transactions_service_role on public.rider_passbook_transactions
  for all using (true) with check (true);

drop policy if exists rider_shift_bookings_service_role on public.rider_shift_bookings;
create policy rider_shift_bookings_service_role on public.rider_shift_bookings
  for all using (true) with check (true);

drop policy if exists rider_road_incidents_service_role on public.rider_road_incidents;
create policy rider_road_incidents_service_role on public.rider_road_incidents
  for all using (true) with check (true);

grant all on public.delivery_riders to service_role;
grant all on public.rider_gps_heartbeats to service_role;
grant all on public.rider_passbook_transactions to service_role;
grant all on public.rider_shift_bookings to service_role;
grant all on public.rider_road_incidents to service_role;

grant select on public.delivery_riders to anon, authenticated;
grant select on public.rider_passbook_transactions to authenticated;
grant select on public.rider_shift_bookings to authenticated;
