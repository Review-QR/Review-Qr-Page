import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import {
  createCashfreePreviewWebhookHandler,
  readSignedOrderContext,
  verifyCashfreeSandboxOrder,
} from "./cashfree-preview-webhook.ts";

const secret = "preview-test-secret";
const orderId = `rqr_${"a".repeat(32)}`;
const environment = {
  supabaseUrl: "https://piqwsyzktzjhafkcstjl.supabase.co",
  apiBaseUrl: "https://sandbox.cashfree.com/pg",
  clientId: "preview-test-id",
  clientSecret: secret,
};
const verified = {
  orderId,
  context: { businessId: "test-business", planId: "standard", amount: 49 },
  amount: 49,
  paidAt: "2026-10-13T00:00:00.000Z",
};
const success = () => ({
  type: "PAYMENT_SUCCESS_WEBHOOK",
  data: {
    order: { order_id: orderId, order_amount: 49, order_currency: "INR" },
    payment: { payment_status: "SUCCESS", payment_amount: 49, payment_currency: "INR" },
  },
});

function signedRequest(body, timestamp = "1791849600") {
  const signature = createHmac("sha256", secret).update(`${timestamp}${body}`).digest("base64");
  return new Request("https://piqwsyzktzjhafkcstjl.supabase.co/functions/v1/trustit-cashfree-preview-webhook", {
    method: "POST",
    headers: { "x-webhook-timestamp": timestamp, "x-webhook-signature": signature },
    body,
  });
}

function harness({ env = environment, apply } = {}) {
  const calls = { order: 0, onboarding: 0, apply: 0, finalize: 0 };
  const handler = createCashfreePreviewWebhookHandler({
    environment: env,
    verifySignature: (body, timestamp, signature) => {
      const expected = createHmac("sha256", secret).update(`${timestamp}${body}`).digest("base64");
      return signature === expected;
    },
    verifyOrder: async () => { calls.order += 1; return verified; },
    createAdminGateway: () => ({
      findOnboarding: async () => { calls.onboarding += 1; return { data: null, error: null }; },
      finalizeOneTimePayment: async () => { calls.finalize += 1; return { data: [{ result: "applied" }], error: null }; },
      applyPayment: async () => {
        calls.apply += 1;
        return { data: [{ result: apply?.(calls.apply) ?? "applied" }], error: null };
      },
    }),
  });
  return { handler, calls };
}

test("valid signed success verifies server-side and applies one payment", async () => {
  const { handler, calls } = harness();
  const response = await handler(signedRequest(JSON.stringify(success())));
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { result: "applied" });
  assert.deepEqual(calls, { order: 1, onboarding: 1, apply: 1, finalize: 0 });
});

test("invalid signatures and malformed signed payloads never reach payment verification", async () => {
  const { handler, calls } = harness();
  const invalid = new Request("https://edge.test", { method: "POST", headers: {
    "x-webhook-timestamp": "1791849600", "x-webhook-signature": "invalid",
  }, body: JSON.stringify(success()) });
  assert.equal((await handler(invalid)).status, 401);
  assert.equal((await handler(signedRequest("{"))).status, 400);
  assert.equal(calls.order, 0);
  assert.equal(calls.apply, 0);
});

test("amount, currency, order and payment context mismatches cannot activate", async () => {
  for (const mutate of [
    (event) => { event.data.order.order_amount = 99; },
    (event) => { event.data.payment.payment_currency = "USD"; },
    (event) => { event.data.payment.payment_amount = 29; },
    (event) => { event.data.order.order_currency = "USD"; },
  ]) {
    const event = success(); mutate(event);
    const { handler, calls } = harness();
    assert.equal((await handler(signedRequest(JSON.stringify(event))).then((r) => r.status)), 400);
    assert.equal(calls.apply, 0);
  }
});

test("replayed signed event is safe because finalization uses the idempotent database result", async () => {
  const { handler, calls } = harness({ apply: (count) => count === 1 ? "applied" : "already_applied" });
  const body = JSON.stringify(success());
  const first = await handler(signedRequest(body));
  const replay = await handler(signedRequest(body));
  assert.deepEqual(await first.json(), { result: "applied" });
  assert.deepEqual(await replay.json(), { result: "already_applied" });
  assert.equal(calls.apply, 2);
});

test("failed, pending and dropped events acknowledge without activating", async () => {
  for (const [type, status] of [["PAYMENT_FAILED_WEBHOOK", "FAILED"], ["PAYMENT_PENDING_WEBHOOK", "PENDING"], ["PAYMENT_USER_DROPPED_WEBHOOK", "USER_DROPPED"]]) {
    const { handler, calls } = harness();
    const event = success(); event.type = type; event.data.payment.payment_status = status;
    assert.equal((await handler(signedRequest(JSON.stringify(event)))).status, 200);
    assert.equal(calls.order + calls.apply, 0);
  }
});

test("Preview function refuses a non-Preview Supabase target", async () => {
  const { handler, calls } = harness({ env: { ...environment, supabaseUrl: "https://production.supabase.co" } });
  assert.equal((await handler(signedRequest(JSON.stringify(success())))).status, 503);
  assert.equal(calls.order + calls.apply, 0);
});

test("Cashfree credentialed verification refuses redirects without forwarding credentials", async () => {
  const requests = [];
  const result = await verifyCashfreeSandboxOrder({
    orderId, clientId: "id-secret-test", clientSecret: "secret-test",
    fetcher: async (url, init) => {
      requests.push({ url, init });
      return new Response(null, { status: 302, headers: { location: "https://attacker.example/collect" } });
    },
  });
  assert.equal(result, "error");
  assert.equal(requests.length, 1);
  assert.equal(requests[0].init.redirect, "manual");
  assert.match(requests[0].url, /^https:\/\/sandbox\.cashfree\.com\/pg\//);
});

test("Sandbox order lookup verifies signed Trustit context and authoritative successful payment", async () => {
  const claims = { version: 1, orderId, businessId: "test-business", planId: "standard", amount: 49, currency: "INR" };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const contextKey = createHmac("sha256", secret).update("Review-QR:Cashfree:OrderContext:v1").digest();
  const signedContext = `${payload}.${createHmac("sha256", contextKey).update(payload).digest("base64url")}`;
  const requests = [];
  const result = await verifyCashfreeSandboxOrder({
    orderId, clientId: "preview-test-id", clientSecret: secret,
    fetcher: async (url, init) => {
      requests.push({ url, init });
      if (requests.length === 1) return Response.json({
        order_id: orderId, order_amount: 49, order_currency: "INR", order_tags: { review_qr_context: signedContext },
      });
      return Response.json([{ payment_status: "SUCCESS", payment_amount: 49, payment_currency: "INR", payment_completion_time: "2026-10-13T00:00:00.000Z" }]);
    },
  });
  assert.equal(result.orderId, orderId);
  assert.equal(result.context.businessId, "test-business");
  assert.equal(result.amount, 49);
  assert.equal(requests.length, 2);
  assert.ok(requests.every(({ init }) => init.redirect === "manual"));
  assert.ok(requests[0].url.endsWith(`/orders/${orderId}`));
  assert.ok(requests[1].url.endsWith(`/orders/${orderId}/payments`));
});

test("signed context rejects unrecognized plan names, including prototype properties", async () => {
  const claims = { version: 1, orderId, businessId: "test-business", planId: "toString", amount: 49, currency: "INR" };
  const payload = Buffer.from(JSON.stringify(claims)).toString("base64url");
  const contextKey = createHmac("sha256", secret).update("Review-QR:Cashfree:OrderContext:v1").digest();
  const signedContext = `${payload}.${createHmac("sha256", contextKey).update(payload).digest("base64url")}`;
  assert.equal(await readSignedOrderContext(secret, signedContext, orderId), null);
});
