import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { cashfreeLivePaymentsEnabled, resolveCashfreeServerConfiguration } from "./cashfree-environment.ts";
import { verifyCashfreeSignature } from "./cashfree-signature.ts";
import { isVerifiedCashfreeSuccess } from "./cashfree-payment-guard.ts";

const sandbox = {
  CASHFREE_CLIENT_ID: "sandbox-id",
  CASHFREE_CLIENT_SECRET: "sandbox-secret",
  CASHFREE_ENVIRONMENT: "sandbox",
  CASHFREE_API_BASE_URL: "https://sandbox.cashfree.com/pg",
};

test("Cashfree server config selects only the official Sandbox endpoint", () => {
  const config = resolveCashfreeServerConfiguration(sandbox);
  assert.equal(config.environment, "sandbox");
  assert.equal(config.apiBaseUrl, "https://sandbox.cashfree.com/pg");
});

test("Cashfree production config selects only the official Production endpoint", () => {
  const config = resolveCashfreeServerConfiguration({
    CASHFREE_CLIENT_ID: "live-id",
    CASHFREE_CLIENT_SECRET: "live-secret",
    CASHFREE_ENVIRONMENT: "production",
    CASHFREE_API_BASE_URL: "https://api.cashfree.com/pg",
  });
  assert.equal(config.environment, "production");
  assert.equal(config.apiBaseUrl, "https://api.cashfree.com/pg");
});

test("production order creation stays disabled unless the explicit live switch is true", () => {
  assert.equal(cashfreeLivePaymentsEnabled({}), false);
  assert.equal(cashfreeLivePaymentsEnabled({ CASHFREE_LIVE_PAYMENTS_ENABLED: "false" }), false);
  assert.equal(cashfreeLivePaymentsEnabled({ CASHFREE_LIVE_PAYMENTS_ENABLED: "true" }), true);
});

test("Cashfree config rejects missing credentials, mismatched hosts, and arbitrary endpoints", () => {
  assert.throws(() => resolveCashfreeServerConfiguration({ ...sandbox, CASHFREE_CLIENT_SECRET: "" }));
  assert.throws(() => resolveCashfreeServerConfiguration({ ...sandbox, CASHFREE_API_BASE_URL: "https://api.cashfree.com/pg" }));
  assert.throws(() => resolveCashfreeServerConfiguration({ ...sandbox, CASHFREE_API_BASE_URL: "https://attacker.example/pg" }));
  assert.throws(() => resolveCashfreeServerConfiguration({ ...sandbox, CASHFREE_ENVIRONMENT: "live" }));
});

test("webhook HMAC accepts the exact raw-body signature and rejects invalid signatures", () => {
  const secret = "test-only-secret";
  const timestamp = "1780000000";
  const rawBody = '{"type":"PAYMENT_SUCCESS_WEBHOOK"}';
  const signature = createHmac("sha256", secret).update(`${timestamp}${rawBody}`).digest("base64");
  assert.equal(verifyCashfreeSignature({ secret, timestamp, rawBody, signature }), true);
  assert.equal(verifyCashfreeSignature({ secret, timestamp, rawBody: `${rawBody} `, signature }), false);
  assert.equal(verifyCashfreeSignature({ secret, timestamp, rawBody, signature: "invalid" }), false);
  assert.equal(verifyCashfreeSignature({ secret, timestamp: null, rawBody, signature }), false);
});

test("only a verified success with matching server amount is eligible for activation", () => {
  const valid = { eventType: "PAYMENT_SUCCESS_WEBHOOK", paymentStatus: "SUCCESS", orderAmount: 49, paymentAmount: 49, verifiedAmount: 49 };
  assert.equal(isVerifiedCashfreeSuccess(valid), true);
  assert.equal(isVerifiedCashfreeSuccess({ ...valid, paymentStatus: "FAILED" }), false);
  assert.equal(isVerifiedCashfreeSuccess({ ...valid, paymentStatus: "USER_DROPPED" }), false);
  assert.equal(isVerifiedCashfreeSuccess({ ...valid, paymentStatus: "PENDING" }), false);
  assert.equal(isVerifiedCashfreeSuccess({ ...valid, eventType: "PAYMENT_FAILED_WEBHOOK" }), false);
  assert.equal(isVerifiedCashfreeSuccess({ ...valid, orderAmount: 99 }), false);
  assert.equal(isVerifiedCashfreeSuccess({ ...valid, paymentAmount: 29 }), false);
});

test("webhook application remains server-verified and duplicate-safe through database RPCs", async () => {
  const { readFile } = await import("node:fs/promises");
  const route = await readFile(new URL("../app/api/cashfree/webhook/route.ts", import.meta.url), "utf8");
  const sql = await readFile(new URL("../supabase/migrations/20260926210000_add_payment_records_atomic_renewal.sql", import.meta.url), "utf8");
  const onboarding = await readFile(new URL("../supabase/migrations/20260929200200_fix_trustit_finalization_result_ambiguity.sql", import.meta.url), "utf8");
  assert.match(route, /verifyCashfreeWebhookSignature/);
  assert.match(route, /verifyCashfreeWebhookOrder/);
  assert.match(route, /finalize_trustit_one_time_payment/);
  assert.match(route, /apply_verified_cashfree_payment/);
  assert.match(route, /already_applied/);
  assert.match(route, /isVerifiedCashfreeSuccess/);
  assert.ok(route.indexOf("!isVerifiedCashfreeSuccess({") < route.indexOf("admin.rpc"), "activation RPC must follow verified success and amount validation");
  // The migrations implementing the RPCs are reviewed separately; this assertion protects their invocation contract.
  assert.match(sql, /already_applied/);
  assert.match(sql, /UNIQUE/i);
  assert.match(onboarding, /already_applied/);
});
