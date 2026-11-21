-- Migration: 20261114090003_payout_idempotency.sql
-- Phase 1: Prevent duplicate external Cashfree payouts.
--
-- 1) cf_transfer_id unique index
--    Cashfree's requestTransfer is idempotent by transferId: re-sending the
--    SAME transferId returns the existing transfer, never a new one. We make a
--    transferId deterministic (stable per payout request) so a retry / timeout /
--    duplicate-click cannot produce a second transfer. Enforce it in the DB:
--    a partial UNIQUE index on the non-null cf_transfer_id values.
--
--    (Intentionally NOT a rider_id + amount partial index: that would block a
--    rider's legitimate second, separate payout of the same amount.)
--
-- 2) One open payout per request id
--    The request id is already the PK. The guard that matters is that the
--    settlement transition (pending/processing -> completed) is applied by the
--    service with a status guard, and the transfer id is persisted BEFORE the
--    external call so a duplicate request is already in-flight and cannot be
--    re-initiated. The unique cf_transfer_id index above is the DB-level
--    backstop for that flow.
--
-- Compatibility / rollback:
--   * Index is partial (WHERE cf_transfer_id is not null) so existing NULL
--     rows are unaffected.
--   * If any legacy duplicate non-null cf_transfer_id values exist in a
--     production DB, the index build would fail; the app is to reconcile
--     first (dedupe by keeping the most recent). In the current schema the
--     column was unconstrained and populated only by the (now-deterministic)
--     service, so no seeded duplicates exist in tracked data.
--   Rollback:
--     drop index if exists rider_payout_requests_cf_transfer_id_uq;

create unique index if not exists rider_payout_requests_cf_transfer_id_uq
  on public.rider_payout_requests (cf_transfer_id)
  where cf_transfer_id is not null;

-- Same protection for merchant settlement batches (their batch id is already
-- the PK and the transfer id is the UTR / batch reference); add a partial
-- unique on any non-null cashfree transfer id column if present. The
-- merchant batch table currently stores bank_utr_number, not a CF transfer
-- id, so no index is required there — batch id (PK) already enforces
-- one-record-per-batch.