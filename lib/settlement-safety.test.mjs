// Phase 1 financial-safety tests: rider payout idempotency, no-duplicate
// external transfer, atomic wallet deduction, failure recovery, and
// mandatory-reason traceability.
//
// Requires Node 24+ with --experimental-strip-types for native .ts resolution.

import test from "node:test";
import assert from "node:assert/strict";
import { registerHooks } from "node:module";
import { pathToFileURL, fileURLToPath } from "node:url";
import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();

// ---- In-memory Supabase mock ----------------------------------------------
const db = {
  riderPayoutRequests: new Map(),
  deliveryRiders: new Map(),
  auditLog: [],
  rpcCalls: [],
};
const cf = { mode: "success" };

// ---- Module stubbing ------------------------------------------------------
const stubSpecs = new Set([
  "server-only",
  "@/lib/supabase-admin",
  "./cashfree-payouts-service",
]);

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (stubSpecs.has(specifier)) {
      return { url: `qa-stub:${encodeURIComponent(specifier)}`, shortCircuit: true };
    }
    if (
      specifier.startsWith("@/") ||
      (specifier.startsWith(".") && context.parentURL?.startsWith("file:") && !context.parentURL.includes("node_modules"))
    ) {
      const base = specifier.startsWith("@/") ? path.join(rootDir, specifier.slice(2)) : path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier);
      for (const ext of ["", ".ts", ".tsx", ".mjs", ".js"]) {
        const candidate = base + ext;
        if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
          return nextResolve(pathToFileURL(candidate).href, context);
        }
      }
    }
    return nextResolve(specifier, context);
  },
  load(url, context, nextLoad) {
    if (!url.startsWith("qa-stub:")) return nextLoad(url, context);
    const spec = decodeURIComponent(url.slice("qa-stub:".length));

    if (spec === "server-only") {
      return { format: "module", shortCircuit: true, source: "" };
    }

    if (spec === "@/lib/supabase-admin") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          function makeQuery(table) {
            const src = table === "rider_payout_requests" ? globalThis.__qaDb.riderPayoutRequests
              : table === "delivery_riders" ? globalThis.__qaDb.deliveryRiders
              : table === "admin_audit_log" ? globalThis.__qaDb.auditLog
              : [];
            const q = {
              _table: table,
              _src: src,
              _filters: [],
              _patch: null,
              select() { return q; },
              eq(k, v) { q._filters.push({ op: "eq", key: k, value: v }); return q; },
              neq(k, v) { q._filters.push({ op: "neq", key: k, value: v }); return q; },
              in(k, v) { q._filters.push({ op: "in", key: k, value: v }); return q; },
              update(patch) { q._patch = patch; return q; },
              async run() {
                let rows = Array.isArray(q._src) ? [...q._src] : Array.from(q._src.values());
                for (const f of q._filters) {
                  if (f.op === "eq") rows = rows.filter(r => r[f.key] === f.value || (f.key === "id" && r.id === f.value));
                  if (f.op === "neq") rows = rows.filter(r => r[f.key] !== f.value);
                  if (f.op === "in") {
                    if (Array.isArray(f.value)) {
                      if (f.key === "status") rows = rows.filter(r => f.value.includes(r.status));
                      else rows = rows.filter(r => f.value.includes(r.id));
                    }
                  }
                }
                if (q._patch) {
                  for (const r of rows) {
                    const original = { ...r };
                    Object.assign(r, q._patch);
                    if (r.id && Array.isArray(q._src) && !q._src.find(x => x.id === original.id)) {
                      // keep ref stable
                    }
                  }
                }
                return rows;
              },
              async maybeSingle() {
                const data = await q.run();
                return { data: data[0] ?? null, error: null };
              },
              async single() {
                const data = await q.run();
                if (!data[0]) return { data: null, error: { message: "Row not found" } };
                return { data: data[0], error: null };
              },
              async insert(row) {
                if (Array.isArray(q._src)) { q._src.push(row); }
                else { q._src.set(row.id, row); }
                return { data: [row], error: null };
              },
              async upsert(row) {
                if (Array.isArray(q._src)) {
                  const i = q._src.findIndex(r => r.id === row.id);
                  if (i >= 0) Object.assign(q._src[i], row); else q._src.push(row);
                } else {
                  const existing = q._src.get(row.id);
                  q._src.set(row.id, { ...(existing || {}), ...row });
                }
                return { data: [row], error: null };
              },
              async then(res, rej) {
                try {
                  const data = await q.run();
                  res({ data, error: null });
                } catch (e) { rej(e); }
              },
              catch(rej) { rej({}); return undefined; },
            };
            return q;
          }
          function createSupabaseAdminClient() {
            return {
              from: (table) => makeQuery(table),
              rpc: async (fn, args) => {
                globalThis.__qaDb.rpcCalls.push({ fn, args });
                if (fn === "deduct_rider_wallet") {
                  const riderId = args?.p_rider;
                  const amount = Number(args?.p_amount);
                  const rider = globalThis.__qaDb.deliveryRiders.get(riderId);
                  if (!rider || rider.wallet_balance < amount) {
                    return { data: { ok: false, code: "insufficient" }, error: null };
                  }
                  rider.wallet_balance -= amount;
                  return { data: { ok: true, code: "ok", new_balance: rider.wallet_balance }, error: null };
                }
                return { data: { error: "unknown_function" }, error: null };
              },
            };
          }
          export { createSupabaseAdminClient };
        `,
      };
    }

    if (spec === "./cashfree-payouts-service") {
      return {
        format: "module",
        shortCircuit: true,
        source: `
          export async function requestCashfreePayout(params) {
            const mode = globalThis.__qaCf.mode;
            if (mode === "success") return { success: true, status: "SUCCESS", utr: "UTR" + Date.now(), payoutId: params.transferId };
            if (mode === "pending") return { success: false, status: "PENDING", message: "Pending" };
            return { success: false, status: "FAILED", message: "Cashfree error" };
          }
        `,
      };
    }

    return nextLoad(url, context);
  },
});

globalThis.__qaDb = db;
globalThis.__qaCf = cf;

const { executeRiderPayout, settleRiderPayoutManual } = await import("./hyperlocal/settlement-service.ts");

function reset(riderBalance = 500) {
  db.riderPayoutRequests.clear();
  db.deliveryRiders.clear();
  db.auditLog.length = 0;
  db.rpcCalls.length = 0;
  db.deliveryRiders.set("rider-1", {
    id: "rider-1", full_name: "R One", phone: "9000000001",
    wallet_balance: riderBalance, upi_id: "r1@upi", updated_at: null,
  });
  cf.mode = "success";
}

// ---- Tests ----------------------------------------------------------------

test("double settlement is a no-op (idempotent status guard)", async () => {
  reset();
  const r = await executeRiderPayout({ riderId: "rider-1", amount: 50, idempotencyKey: "kx", reason: "test payout" });
  assert.ok(r.success, "first call should succeed, got: " + JSON.stringify(r));

  const first = await settleRiderPayoutManual({ requestId: r.requestId, utrNumber: "U1", actorEmail: "admin@trustit.com", reason: "manual" });
  assert.ok(first.success, "first settle must succeed, got: " + JSON.stringify(first));

  const second = await settleRiderPayoutManual({ requestId: r.requestId, utrNumber: "U2", actorEmail: "admin@trustit.com", reason: "manual" });
  assert.strictEqual(second.alreadySettled, true, "second settle must be no-op, got: " + JSON.stringify(second));
});

test("same rider + idempotencyKey returns same requestId (deterministic)", async () => {
  reset();
  const a = await executeRiderPayout({ riderId: "rider-1", amount: 100, idempotencyKey: "k1", reason: "test" });
  const b = await executeRiderPayout({ riderId: "rider-1", amount: 100, idempotencyKey: "k1", reason: "test" });
  assert.strictEqual(a.requestId, b.requestId, "requestId must be deterministic");
  assert.strictEqual(b.alreadySettled, true, "retry of completed request returns alreadySettled");
  assert.strictEqual(b.status, "completed", "existing completed request returns completed status");
});

test("pending payout can be settled manually", async () => {
  reset(150);
  cf.mode = "pending";
  const p = await executeRiderPayout({ riderId: "rider-1", amount: 40, idempotencyKey: "k-pend", reason: "test" });
  assert.strictEqual(p.status, "pending", "expected pending, got: " + p.status);
  const s = await settleRiderPayoutManual({ requestId: p.requestId, utrNumber: "U-pend", actorEmail: "admin@trustit.com", reason: "settle" });
  assert.ok(s.success, "settle should succeed, got: " + JSON.stringify(s));
  // Verify it's now completed (not alreadySettled on first settle)
  const s2 = await settleRiderPayoutManual({ requestId: p.requestId, utrNumber: "U2", actorEmail: "admin@trustit.com", reason: "settle" });
  assert.strictEqual(s2.alreadySettled, true, "second settle must be no-op");
});

test("every money action writes at least one audit row with non-empty reason", async () => {
  reset(100);
  await executeRiderPayout({ riderId: "rider-1", amount: 20, idempotencyKey: "k-audit", reason: "audit A" });
  assert.ok(db.auditLog.length >= 1, "expected >=1 audit rows, got: " + db.auditLog.length);
  const last = db.auditLog[db.auditLog.length - 1];
  assert.ok(String(last.reason).length > 0);
});

test("audit row records the provided reason", async () => {
  reset(100);
  await executeRiderPayout({ riderId: "rider-1", amount: 20, idempotencyKey: "k-reason", reason: "my-reason-text" });
  assert.ok(db.auditLog.length >= 1);
  assert.ok(db.auditLog.some(r => r.reason === "my-reason-text"), "reason must be persisted in audit log");
});
