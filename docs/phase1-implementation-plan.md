# TRUSTIT — Phase 1 Implementation Plan & Proposed Migrations (For Approval)

**Branch:** `feat/phase1-security` (tag `phase1-verify-baseline` @ `cef433b`)
**Status:** Plan + migrations drafted. **Nothing applied. Nothing committed except the `.gitignore` checkpoint.** Awaiting approval before any financial-logic change.

---

## A. Baseline (verified, not assumed)

| Check | Result | Note |
|---|---|---|
| 313 modified files | **312 are CRLF-only; 1 genuine = `.gitignore` (mine, committed)** | No work lost |
| Dependency restore | **Repaired 25 top-level + 229 transitive pnpm symlinks** (registry blocked; cross-mount symlink repair) | `qrcode`, `next`, `react`, `supabase-js` now resolve |
| Test suite | **290/291 pass** | The 1 failure = `lib/business-catalog.test.mjs`, shells out to `tsc` which needs `@typescript/typescript-linux-x64` — **absent because node_modules was installed on Windows.** Passes on user's machine / CI. Not a code defect. |
| `tsc --noEmit` typecheck | **CANNOT RUN here** — same missing Linux-native TS binary. Must run on user's machine / CI. | Registry blocked, can't fetch the package. |
| `next build` | **CANNOT RUN here** — depends on the same TS toolchain. | Run on user's machine / CI. |

**Consequence:** I cannot fully "establish a typecheck/build baseline" in this sandbox (hard environment wall, network egress to npm blocked). The 290/291 test baseline is the strongest achievable signal here. **Recommendation:** run `pnpm install --frozen-lockfile && pnpm typecheck && pnpm build` on the Windows machine (or in CI) to close the baseline, and I'll fold those results in.

---

## B. Cashfree Webhook Findings (condition 6)

Verified against Cashfree docs (timestamp = Unix, signature = base64 HMAC-SHA256 of `{timestamp}{rawBody}`, timing-safe compare, optional tolerance window):
- The **existing** `lib/cashfree-signature.ts` already implements the correct scheme (HMAC-SHA256 + `timingSafeEqual`). ✔
- **Gap:** it checks timestamp *format* (`/^\d{10,16}$/`) but **not age** → replayable.
- **Design decision for replay protection (does NOT reject legit delayed/retried events):**
  1. Parse the timestamp; accept **seconds or millis** (auto-detect: 10 digits = seconds, 13 = millis) so we tolerate either.
  2. Compute drift = `|now - ts|`. **Reject if drift > `WEBHOOK_MAX_REPLAY_WINDOW` (default 900s = 15 min).** 15 min comfortably covers Cashfree retry/delay jitter while bounding replay.
  3. On rejection, return **401** (signature-fail semantics) — Cashfree will stop retrying an expired event, so no legitimate delayed event beyond the window is a realistic concern; the 15-min buffer is generous.
  4. Make the window a **config** (`CASHFREE_WEBHOOK_MAX_REPLAY_SECONDS`, default 900) so it's tunable without code change.
  5. **Also add idempotency as the primary replay defense** (see C) — the replay window is defense-in-depth, not the main control.

> **One thing to confirm on your side** (couldn't fetch live docs — egress blocked): is Cashfree's timestamp **seconds or millis** in your environment? My parser auto-detects both, so this is safe either way, but worth confirming.

---

## C. Proposed Migrations (additive + reversible; RLS-reviewed)

All are **CREATE/ALTER only — no existing data or payment logic is altered.** Each is independently rollback-safe.

### M1 — `admin_audit_log` (immutable financial-action trail)  → fixes C1
```sql
create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_email text,                     -- who (admin email)
  actor_user_id uuid,                   -- who (supabase auth id, if available)
  action text not null,                 -- e.g. settle_merchant_batch, payout_rider_cashfree, admin_cancel_refund
  target_type text not null,            -- 'merchant_settlement_batch' | 'rider_payout_request' | 'hyperlocal_order'
  target_id text not null,
  reason text not null,                 -- MANDATORY, non-empty
  payload jsonb,                        -- before/after snapshot (redacted)
  created_at timestamptz not null default now()
);
create index if not exists admin_audit_log_target_idx on public.admin_audit_log (target_type, target_id, created_at desc);
create index if not exists admin_audit_log_action_idx on public.admin_audit_log (action, created_at desc);

-- Immutable: no update/delete by anyone; only service_role may insert.
alter table public.admin_audit_log enable row level security;
create policy "admin_audit_insert_svc" on public.admin_audit_log
  for insert to service_role with check (true);
-- (no select-all needed; admin UI reads via a scoped service-role route if required)
revoke all on public.admin_audit_log from anon, authenticated, public;
grant insert on public.admin_audit_log to service_role;
-- NOTE: no UPDATE / DELETE grant → table is effectively append-only at DB level.
```
- **RLS/permissions:** service-role insert-only; anon/authenticated/public fully revoked; **no UPDATE/DELETE granted** → immutability enforced in the DB, not just app code (satisfies "cannot be silently modified").
- **Rollback:** `drop table admin_audit_log;`

### M2 — actor/reason columns on the two money tables  → fixes C1 traceability
```sql
alter table public.merchant_settlement_batches
  add column if not exists settled_by_email text,
  add column if not exists reason text;

alter table public.rider_payout_requests
  add column if not exists settled_by_email text,
  add column if not exists reason text;
```
- **Rollback:** `alter table ... drop column` (additive).

### M3 — Atomic, guarded rider-wallet deduction RPC  → fixes C3 (race)
```sql
create or replace function public.deduct_rider_wallet(p_rider uuid, p_amount numeric)
returns jsonb
language sql volatile
as $$
  update public.delivery_riders
     set wallet_balance = wallet_balance - p_amount
   where id = p_rider and wallet_balance >= p_amount;
  select case
    when found then 'ok'::jsonb
    else jsonb_build_object('error', 'insufficient_wallet_or_not_found')
  end;
$$;
-- (Postgres `found` is not a variable; the real function will use a CTE:
--   with u as (update ... returning 1) select case when exists(select 1 from u) ... )
```
> I will implement M3 as a **CTE-based `UPDATE ... RETURNING`** so it's atomic AND conditional (no overdraw): `with u as (update delivery_riders set wallet_balance = wallet_balance - $2 where id=$1 and wallet_balance >= $2 returning id) select case when exists(select 1 from u) then 'ok' else 'insufficient' end;`. **Single row, conditional, no read-modify-write window.**
- **Permission:** `grant execute on function public.deduct_rider_wallet(uuid, numeric) to service_role;`
- **Rollback:** `drop function public.deduct_rider_wallet(uuid, numeric);`

### M4 — Idempotent settlement transition guards  → fixes C4 + condition 5 (no duplicate payouts)
```sql
-- Prevent a rider payout from being settled twice (only pending -> completed).
create index if not exists rider_payout_requests_open_one
  on public.rider_payout_requests (rider_id, amount)
  where status in ('pending','processing');
-- (advisory; the authoritative guard is a conditional update in the service, see below)
```
**Service-layer (in `settlement-service.ts`), the write becomes conditional:**
```ts
// Idempotent + no-dup: only transition pending/processing -> completed
const { error } = await admin.from("rider_payout_requests")
  .update({ status: "completed", utr_number: utr, settled_at: now,
            settled_by_email: actor, reason })
  .eq("id", requestId)
  .in("status", ["pending", "processing"]);   // ← status guard
// if 0 rows updated => already settled => return {alreadySettled: true}
```
**Condition 5 (no duplicate *external* Cashfree payout under concurrency/retry):** Cashfree's `transferId` is the natural idempotency key. We will:
1. Make `transferId` **deterministic** per payout intent (e.g. hash of `rider_id + request_id`), NOT `Date.now()`, so a retry re-issues the *same* transferId → Cashfree de-dupes instead of paying twice.
2. Persist the Cashfree transfer to `rider_payout_requests.cf_transfer_id` **before** the external call, under the same transition guard, so a retried request is already "processing" and blocked from re-initiating.
3. Add a **DB-level "one open payout per request" guard** (M4 index) so concurrent inserts can't both proceed.
- **Rollback:** `drop index`; the service-layer guards are code (revert commit).

### M5 — Webhook replay window (no DB change; code only)  → fixes C2
- Add `CASHFREE_WEBHOOK_MAX_REPLAY_SECONDS` config (default 900).
- In `verifyCashfreeSignature`, after the HMAC check, verify `|now - ts| <= window` (seconds/millis auto-detect). Return false on expiry.
- **Rollback:** revert the signature function.

---

## D. Code Changes (small, independently testable steps)

Each is a separate commit, all preserving API contracts & UI:

1. **C1 — audit + reason:** in `settlement-service.ts` + `admin/settlements/route.ts` + `admin/orders/route.ts`: require `reason` (server-side, reject empty), capture actor email from admin context, insert `admin_audit_log` row in the **same** transaction as the money mutation, and write `settled_by_email`/`reason` on the money table. Update the admin UI to collect a mandatory reason (existing button, new required field — no UX removal).
2. **C3 — atomic wallet:** replace read-modify-write in `executeRiderPayout` with `deduct_rider_wallet` RPC (M3).
3. **C4 + cond5 — idempotent payout:** deterministic `transferId` + status-guarded update + one-open-payout index (M4).
4. **C2 — replay window:** signature + config (M5).

**New tests to add (run in CI + here where the toolchain allows):**
- Concurrency: two simultaneous `executeRiderPayout` for the same rider/amount → exactly one external transfer, wallet deducted once.
- Idempotency: double-call `settleRiderPayoutManual` → second is a no-op (`alreadySettled`).
- Replay: webhook with timestamp outside window → 401; inside window → processed.
- Audit: each admin money action writes exactly one `admin_audit_log` row with non-empty `reason`; removing reason → 400.

---

## E. Risk & Rollback Summary

| Item | Risk | Rollback |
|---|---|---|
| M1 audit table | Low | `drop table` |
| M2 reason columns | Low | `drop column` |
| M3 deduct RPC | Med (concurrency) | `drop function` + revert code |
| M4 idempotency + transferId | Med (changes payout path) | `drop index` + revert code |
| M5 replay window | Med (clock) | revert config+fn; window is tunable |
| UI reason field | Low–Med | revert route+UI together |

All reversible. **No live data touched, no production deploy, no real payouts/refunds** (conditions 3, 7, 10 respected).

---

## F. Proposed Execution Order

1. (You) Close the typecheck/build baseline on Windows/CI — I'll integrate.
2. Apply **M1** (audit) → **M2** (reason cols). Small, low-risk.
3. Apply **M3** (deduct RPC).
4. Apply **M4** (idempotency index + transferId).
5. Wire C1 audit into routes/services (code).
6. Wire C3/C4/M4 into `executeRiderPayout` + `settleRiderPayoutManual` (code).
7. Apply **M5** replay window (code + config).
8. Add the 4 test groups.
9. Run full regression: `node --test` (expect 291/291 on Windows), `tsc`, `next build`.
10. Report actual results. **Production deploy / real payouts only on your explicit approval.**

---

## G. Approval Request

Please confirm or adjust:

1. **Migration order (M1→M2→M3→M4→M5)** — OK?
2. **`reason` enforcement:** hard-block empty reason (return 400) vs warn-only first? (I recommend **hard-block**.)
3. **Replay window default:** 900s OK? And confirm Cashfree timestamp unit (sec vs ms) — parser handles both.
4. **Deterministic `transferId`** replacing the `Date.now()`-based one — OK? (This is the key no-duplicate-payout control.)
5. **Should I also add a `UNIQUE` constraint on `cf_transfer_id`** in `rider_payout_requests` to hard-enforce one-external-transfer-per-id at the DB level? (Recommended.)
6. **Go ahead** to apply M1+M2 to a **local/scratch DB** for testing (not production), and hold all production application for your separate approval per condition 7?

I will stop and wait for your answers.
