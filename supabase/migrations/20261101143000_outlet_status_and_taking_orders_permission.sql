-- Migration: 20261101143000_outlet_status_and_taking_orders_permission.sql
-- Adds:
-- 1. is_outlet_open (boolean, default true)
-- 2. allow_taking_orders (boolean, default false - controlled by admin)
-- 3. is_taking_orders (boolean, default false - merchant toggle when allowed)

alter table public.businesses
  add column if not exists is_outlet_open boolean not null default true,
  add column if not exists allow_taking_orders boolean not null default false,
  add column if not exists is_taking_orders boolean not null default false;
