-- Migration: 20261114090001_settlement_reason_actor_columns.sql
-- Phase 1: Traceability on the money tables.
--
-- Adds WHO (settled_by_email) and WHY (reason) to the two settlement/payout
-- tables so that, in addition to admin_audit_log, the money record itself is
-- self-describing. Both are nullable so existing rows remain valid and the
-- change is fully additive / reversible.
--
-- Rollback:
--   alter table public.merchant_settlement_batches drop column if exists settled_by_email,
--     drop column if exists reason;
--   alter table public.rider_payout_requests drop column if exists settled_by_email,
--     drop column if exists reason;

alter table public.merchant_settlement_batches
  add column if not exists settled_by_email text null,
  add column if not exists reason text null;

alter table public.rider_payout_requests
  add column if not exists settled_by_email text null,
  add column if not exists reason text null;
