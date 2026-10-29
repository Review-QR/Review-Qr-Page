-- Migration: 20261029130000_delivery_riders_kyc_and_earnings.sql
-- Delivery Riders KYC Onboarding, Vehicle Details, Bank Account/UPI, and Performance Analytics

alter table public.delivery_riders
  add column if not exists email text,
  add column if not exists profile_image_url text,
  add column if not exists residential_address text,
  add column if not exists city text not null default 'Bahraich',
  add column if not exists pincode text not null default '271801',
  add column if not exists driving_license_number text,
  add column if not exists driving_license_image_url text,
  add column if not exists bank_account_holder_name text,
  add column if not exists bank_account_number text,
  add column if not exists bank_ifsc_code text,
  add column if not exists bank_name text,
  add column if not exists upi_id text,
  add column if not exists aadhaar_masked text,
  add column if not exists pan_number text,
  add column if not exists kyc_status text not null default 'approved' check (kyc_status in ('pending', 'approved', 'rejected', 'suspended')),
  add column if not exists total_deliveries_count integer not null default 0,
  add column if not exists total_earnings numeric not null default 0;

create index if not exists delivery_riders_email_idx on public.delivery_riders(email);
create index if not exists delivery_riders_city_idx on public.delivery_riders(city);
create index if not exists delivery_riders_kyc_status_idx on public.delivery_riders(kyc_status);
