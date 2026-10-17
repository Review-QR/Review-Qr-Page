import test from "node:test";
import assert from "node:assert/strict";
import {
  createPreviewOrderOnlyRateLimiter,
  createPreviewSandboxOrderOnly,
  previewOrderOnlyIdempotencyKey,
  previewOrderOnlyOrderId,
} from "./cashfree-preview-order-only.ts";

const businessId = "preview-test-business-123";
const baseEnv = {
  VERCEL_PROJECT_ID: "prj_mKkYk1wDcdwzQzWw2JUNBsAiuhRS",
  VERCEL_ENV: "preview",
  VERCEL_GIT_COMMIT_REF: "codex/cashfree-sandbox-preview",
  VERCEL_BRANCH_URL: "review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app",
  NEXT_PUBLIC_SUPABASE_URL: "https://piqwsyzktzjhafkcstjl.supabase.co",
  CASHFREE_ENVIRONMENT: "sandbox",
  CASHFREE_API_BASE_URL: "https://sandbox.cashfree.com/pg",
  CASHFREE_CLIENT_ID: "test-client-id-placeholder",
  CASHFREE_CLIENT_SECRET: "test-client-secret-placeholder",
  CASHFREE_PREVIEW_ORDER_ONLY_MERCHANT_ID: businessId,
};

function validCall(overrides = {}) {
  let calls = 0;
  const results = createPreviewSandboxOrderOnly({
    env: baseEnv,
    merchant: { businessId, plan: "Basic" },
    allowAttempt: () => true,
    createOrder: async (order) => {
      calls += 1;
      return { success: true, orderId: order.orderId, paymentSessionId: "sensitive-session" };
    },
    ...overrides,
  });
  return { results, getCalls: () => calls };
}

test("unauthenticated requests are rejected before order creation", async () => {
  let called = false;
  const result = await createPreviewSandboxOrderOnly({
    env: baseEnv,
    merchant: null,
    allowAttempt: () => true,
    createOrder: async () => { called = true; return { success: true }; },
  });
  assert.deepEqual(result, { success: false, reason: "unauthorized" });
  assert.equal(called, false);
});

test("only the explicitly allowlisted active merchant is authorized", async () => {
  const result = await createPreviewSandboxOrderOnly({
    env: baseEnv,
    merchant: { businessId: "another-business", plan: "Basic" },
    allowAttempt: () => true,
    createOrder: async () => { assert.fail("order must not be created"); },
  });
  assert.deepEqual(result, { success: false, reason: "unavailable" });
});

test("deployment, branch, Supabase and Sandbox environment guards fail closed", async (t) => {
  const badEnvironments = [
    ["Production deployment", { VERCEL_ENV: "production" }],
    ["wrong Vercel project", { VERCEL_PROJECT_ID: "another-project" }],
    ["wrong branch", { VERCEL_GIT_COMMIT_REF: "main" }],
    ["wrong branch URL", { VERCEL_BRANCH_URL: "other.vercel.app" }],
    ["wrong Supabase project", { NEXT_PUBLIC_SUPABASE_URL: "https://czzeyhpelwafmoiufhvu.supabase.co" }],
    ["missing Supabase URL", { NEXT_PUBLIC_SUPABASE_URL: "" }],
    ["Production Cashfree mode", { CASHFREE_ENVIRONMENT: "production" }],
    ["Production API host", { CASHFREE_API_BASE_URL: "https://api.cashfree.com/pg" }],
    ["missing API base URL", { CASHFREE_API_BASE_URL: "" }],
    ["missing Cashfree client ID", { CASHFREE_CLIENT_ID: "" }],
    ["missing Cashfree client secret", { CASHFREE_CLIENT_SECRET: "" }],
    ["live switch enabled", { CASHFREE_LIVE_PAYMENTS_ENABLED: "true" }],
    ["missing merchant allowlist", { CASHFREE_PREVIEW_ORDER_ONLY_MERCHANT_ID: "" }],
  ];

  for (const [label, override] of badEnvironments) {
    await t.test(label, async () => {
      const { results, getCalls } = validCall({ env: { ...baseEnv, ...override } });
      assert.deepEqual(await results, { success: false, reason: "unavailable" });
      assert.equal(getCalls(), 0);
    });
  }
});

test("Sandbox order uses the fixed server-selected lowest plan and returns only the order ID", async () => {
  let submitted;
  const result = await createPreviewSandboxOrderOnly({
    env: baseEnv,
    merchant: { businessId, plan: "Premium" },
    allowAttempt: () => true,
    createOrder: async (order) => {
      submitted = order;
      return { success: true, orderId: order.orderId, paymentSessionId: "private-session", providerResponse: "private" };
    },
  });
  assert.deepEqual(result, { success: true, orderId: previewOrderOnlyOrderId(businessId) });
  assert.deepEqual(submitted, {
    planId: "basic",
    businessId,
    orderId: previewOrderOnlyOrderId(businessId),
    idempotencyKey: previewOrderOnlyIdempotencyKey(previewOrderOnlyOrderId(businessId)),
  });
  assert.equal(JSON.stringify(result).includes("private"), false);
});

test("rate limit blocks immediate repeats; stable order and idempotency IDs protect retries", async () => {
  const allowAttempt = createPreviewOrderOnlyRateLimiter(60_000);
  let now = 100_000;
  const submitted = [];
  const input = {
    env: baseEnv,
    merchant: { businessId, plan: "Basic" },
    allowAttempt: (id) => allowAttempt(id, now),
    createOrder: async (order) => {
      submitted.push(order);
      return { success: true, orderId: order.orderId };
    },
  };
  assert.deepEqual(await createPreviewSandboxOrderOnly(input), {
    success: true,
    orderId: previewOrderOnlyOrderId(businessId),
  });
  assert.deepEqual(await createPreviewSandboxOrderOnly(input), { success: false, reason: "rate_limited" });

  now += 60_000;
  assert.deepEqual(await createPreviewSandboxOrderOnly(input), {
    success: true,
    orderId: previewOrderOnlyOrderId(businessId),
  });
  assert.equal(submitted.length, 2);
  assert.deepEqual(submitted[0], submitted[1]);

  const firstOrderId = previewOrderOnlyOrderId(businessId);
  assert.equal(previewOrderOnlyOrderId(businessId), firstOrderId);
  assert.equal(previewOrderOnlyIdempotencyKey(firstOrderId), previewOrderOnlyIdempotencyKey(firstOrderId));
  assert.match(previewOrderOnlyIdempotencyKey(firstOrderId), /^[0-9a-f-]{36}$/);
});

test("provider errors are reduced to a safe category", async () => {
  const secretLike = "provider raw body and credentials";
  const result = await createPreviewSandboxOrderOnly({
    env: baseEnv,
    merchant: { businessId, plan: "Basic" },
    allowAttempt: () => true,
    createOrder: async () => { throw new Error(secretLike); },
  });
  assert.deepEqual(result, { success: false, reason: "unavailable" });
  assert.equal(JSON.stringify(result).includes(secretLike), false);
});

test("production action wiring contains no checkout, payment verification, or finalizer call", async () => {
  const { readFile } = await import("node:fs/promises");
  const source = await readFile(new URL("../app/merchant/dashboard/preview-sandbox-order/actions.ts", import.meta.url), "utf8");
  assert.match(source, /getActiveMerchant/);
  assert.match(source, /createCashfreeMerchantCheckoutOrder/);
  assert.doesNotMatch(source, /window\.Cashfree|\.checkout\(|verifyCashfree|apply_verified|finalize_trustit/);
});
