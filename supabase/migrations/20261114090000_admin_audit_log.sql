-- Migration: 20261114090000_admin_audit_log.sql
-- Phase 1 (Security & Financial Safety): Immutable admin audit trail.
--
-- Purpose:
--   Append-only log for every financial/administrative action that mutates
--   money state (merchant settlement, rider payout, admin order cancel-refund,
--   customer-points adjustment). Each record captures WHO (actor email + auth
--   id), WHAT (action + target), WHY (mandatory reason), and a redacted
--   before/after snapshot (payload).
--
-- Immutability (enforced at the DB layer, not just app code):
--   * service_role may INSERT only.
--   * No UPDATE / DELETE is granted to any role (not even service_role), so
--     rows cannot be altered or silently dropped once written.
--   * RLS is enabled; anon/authenticated/public are revoked.
--
-- Rollback:
--   drop table if exists public.admin_audit_log;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text,
  actor_user_id uuid,
  action text not null,
  target_type text not null,
  target_id text not null,
  reason text not null check (reason <> '' and char_length(trim(reason)) > 0),
  payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_audit_log_target_idx
  on public.admin_audit_log (target_type, target_id, created_at desc);
create index if not exists admin_audit_log_action_idx
  on public.admin_audit_log (action, created_at desc);

alter table public.admin_audit_log enable row level security;

drop policy if exists "admin_audit_insert_service_role" on public.admin_audit_log;
create policy "admin_audit_insert_service_role"
  on public.admin_audit_log
  for insert
  to service_role
  with check (true);

-- Revoke all non-service access; explicitly grant only insert to service_role.
revoke all on public.admin_audit_log from anon, authenticated, public, postgres;
grant insert on public.admin_audit_log to service_role;
-- NOTE: intentionally NO update/delete grant on any role => append-only.
