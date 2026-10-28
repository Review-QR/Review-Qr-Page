import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { cashfreeLivePaymentsEnabled, resolveCashfreeServerConfiguration } from "./cashfree-environment.ts";
import { resolveCashfreeReturnUrl, resolveCashfreeWebhookUrl } from "./cashfree-webhook-url.ts";
import { verifyCashfreeSignature } from "./cashfree-signature.ts";
import { isVerifiedCashfreeSuccess } from "./cashfree-payment-guard.ts";
import { classifyCashfreePaymentAttempts } from "./cashfree-payment-attempts.mjs";

const sandbox = {
  CASHFREE_CLIENT_ID: "sandbox-id",
  CASHFREE_CLIENT_SECRET: "sandbox-secret",
  CASHFREE_ENVIRONMENT: "sandbox",
  CASHFREE_API_BASE_URL: "https://sandbox.cashfree.com/pg",
};

test("Cashfree recovery classifies attempts conservatively", () => {
  assert.equal(classifyCashfreePaymentAttempts([{ payment_status: "SUCCESS" }], "EXPIRED"), "success");
  assert.equal(classifyCashfreePaymentAttempts([{ payment_status: "PENDING" }], "ACTIVE"), "pending");
  assert.equal(classifyCashfreePaymentAttempts([{ payment_status: "FAILED" }], "ACTIVE"), "failed");
  assert.equal(classifyCashfreePaymentAttempts([{ payment_status: "USER_DROPPED" }], "ACTIVE"), "failed");
  assert.equal(classifyCashfreePaymentAttempts([{ payment_status: "CANCELLED" }], "ACTIVE"), "failed");
  assert.equal(classifyCashfreePaymentAttempts([], "EXPIRED"), "expired");
  assert.equal(classifyCashfreePaymentAttempts([], "ACTIVE"), "pending");
  assert.equal(classifyCashfreePaymentAttempts([{ payment_status: "PENDING" }, { payment_status: "FAILED" }], "ACTIVE"), "pending");
  assert.equal(classifyCashfreePaymentAttempts([{ payment_status: "UNKNOWN" }], "ACTIVE"), "unverified");
  assert.equal(classifyCashfreePaymentAttempts([{}], "ACTIVE"), "unverified");
  assert.equal(classifyCashfreePaymentAttempts([null], "ACTIVE"), "unverified");
  assert.equal(classifyCashfreePaymentAttempts(null, "ACTIVE"), "unverified");
});

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

test("current and legacy Cashfree order references pass the UI, verifier, and atomic RPC checks", async () => {
  const { readFile } = await import("node:fs/promises");
  const checkout = await readFile(new URL("../app/merchant/dashboard/subscription-checkout.tsx", import.meta.url), "utf8");
  const cashfree = await readFile(new URL("./cashfree.ts", import.meta.url), "utf8");
  const migration = await readFile(new URL("../supabase/migrations/20261023150000_allow_legacy_cashfree_order_reference_lengths.sql", import.meta.url), "utf8");

  const uiPatternSource = checkout.match(/const ORDER_ID_PATTERN = (\/[^\n]+\/);/)?.[1];
  const verifierPatternSource = cashfree.match(/const ORDER_ID_PATTERN = (\/[^\n]+\/);/)?.[1];
  const sqlPatternSource = migration.match(/p_cashfree_order_id !~ '([^']+)'/)?.[1];
  assert.ok(uiPatternSource, "recovery form must define a bounded reference format");
  assert.ok(verifierPatternSource, "server verifier must define a bounded reference format");
  assert.ok(sqlPatternSource, "atomic application RPC must define a bounded reference format");

  const uiPattern = new RegExp(uiPatternSource.slice(1, uiPatternSource.lastIndexOf("/")));
  const verifierPattern = new RegExp(verifierPatternSource.slice(1, verifierPatternSource.lastIndexOf("/")));
  const sqlPattern = new RegExp(sqlPatternSource);
  for (const suffixLength of [32, 33, 34]) {
    const reference = `rqr_${"a".repeat(suffixLength)}`;
    assert.equal(uiPattern.test(reference), true);
    assert.equal(verifierPattern.test(reference), true);
    assert.equal(sqlPattern.test(reference), true);
  }
  for (const reference of ["rqr_" + "a".repeat(31), "rqr_" + "a".repeat(35), "rqr_" + "A".repeat(33), "other_" + "a".repeat(33)]) {
    assert.equal(uiPattern.test(reference), false);
    assert.equal(verifierPattern.test(reference), false);
    assert.equal(sqlPattern.test(reference), false);
  }

  assert.match(migration, /on conflict \(cashfree_order_id\) do nothing/i);
  assert.match(migration, /v_existing_business_id = p_business_id/);
  assert.match(migration, /security definer/i);
  assert.match(migration, /set search_path = ''/i);
  assert.match(migration, /revoke all on function public\.apply_verified_cashfree_payment/i);
  assert.match(migration, /grant execute on function public\.apply_verified_cashfree_payment[\s\S]*to service_role/i);
});

test("recovery stays read-only until verified success and reports safe outcome-specific messages", async () => {
  const { readFile } = await import("node:fs/promises");
  const action = await readFile(new URL("../app/merchant/dashboard/checkout-actions.ts", import.meta.url), "utf8");
  const cashfree = await readFile(new URL("./cashfree.ts", import.meta.url), "utf8");
  const checkout = await readFile(new URL("../app/merchant/dashboard/subscription-checkout.tsx", import.meta.url), "utf8");
  const recoveryAction = action.slice(action.indexOf("export async function verifyMerchantCheckoutOrder("));

  assert.doesNotMatch(recoveryAction, /createCashfreeMerchantCheckoutOrder/);
  assert.ok(recoveryAction.indexOf('verification.status !== "VERIFIED_SUCCESS"') < recoveryAction.indexOf('rpc("apply_verified_cashfree_payment"'));
  assert.match(cashfree, /status: "ORDER_NOT_FOUND"/);
  assert.match(cashfree, /status: "ORDER_EXPIRED"/);
  assert.match(cashfree, /paymentState: terminalFailure \? "failed" : "pending"/);
  assert.match(checkout, /Payment verification is not configured in this environment/);
  assert.match(checkout, /No order with this reference was found in the configured Cashfree environment/);
  assert.match(checkout, /check your bank statement before starting another checkout/);
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
  const handler = await readFile(new URL("./cashfree-webhook-handler.ts", import.meta.url), "utf8");
  const sql = await readFile(new URL("../supabase/migrations/20260926210000_add_payment_records_atomic_renewal.sql", import.meta.url), "utf8");
  const onboarding = await readFile(new URL("../supabase/migrations/20260929200200_fix_trustit_finalization_result_ambiguity.sql", import.meta.url), "utf8");
  assert.match(route, /verifyCashfreeWebhookSignature/);
  assert.match(route, /verifyCashfreeWebhookOrder/);
  assert.match(route, /finalize_trustit_one_time_payment/);
  assert.match(route, /apply_verified_cashfree_payment/);
  assert.match(handler, /already_applied/);
  assert.match(handler, /isVerifiedCashfreeSuccess/);
  assert.match(handler, /findOnboarding/);
  assert.ok(handler.indexOf("!isVerifiedCashfreeSuccess({") < handler.indexOf("const admin = deps.createAdminGateway()"), "activation gateway must follow verified success and amount validation");
  // The migrations implementing the RPCs are reviewed separately; this assertion protects their invocation contract.
  assert.match(sql, /already_applied/);
  assert.match(sql, /UNIQUE/i);
  assert.match(onboarding, /already_applied/);
});
