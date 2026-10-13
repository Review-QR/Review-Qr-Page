import test from "node:test";
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { createCashfreeWebhookHandler } from "./cashfree-webhook-handler.ts";
import { verifyCashfreeSignature } from "./cashfree-signature.ts";

const secret = "cashfree-sandbox-handler-test-secret";
const orderId = `rqr_${"a".repeat(32)}`;
const verifiedOrder = {
  status: "VERIFIED_SUCCESS",
  orderId,
  businessId: "biz-sandbox-fixture",
  planId: "standard",
  amount: 49,
  paidAt: "2026-10-13T00:00:00.000Z",
};

function paymentEvent(type = "PAYMENT_SUCCESS_WEBHOOK", status = "SUCCESS", overrides = {}) {
  return {
    type,
    data: {
      order: { order_id: orderId, order_amount: 49, order_currency: "INR" },
      payment: { payment_status: status, payment_amount: 49, payment_currency: "INR" },
      ...overrides,
    },
  };
}

function signedRequest(rawBody, { signingSecret = secret, timestamp = "1791849600", signature } = {}) {
  const computedSignature = signature ?? createHmac("sha256", signingSecret)
    .update(`${timestamp}${rawBody}`).digest("base64");
  return new Request("https://trustitreview.com/api/cashfree/webhook", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-webhook-timestamp": timestamp,
      "x-webhook-signature": computedSignature,
    },
    body: rawBody,
  });
}

function createHarness(options = {}) {
  const calls = { verifyOrder: [], onboarding: [], finalize: [], apply: [] };
  const deps = {
    verifySignature: (input) => verifyCashfreeSignature({ ...input, secret }),
    verifyOrder: async (id) => {
      calls.verifyOrder.push(id);
      return options.verifyOrder ? options.verifyOrder(id, calls) : verifiedOrder;
    },
    getPlanName: (id) => ({ basic: "Basic", standard: "Standard", premium: "Premium" })[id],
    createAdminGateway: () => ({
      findOnboarding: async (id, businessId) => {
        calls.onboarding.push({ id, businessId });
        return { data: options.onboarding ?? null, error: options.onboardingError ?? null };
      },
      finalizeOneTimePayment: async (input) => {
        calls.finalize.push(input);
        return options.finalize ? options.finalize(input, calls) : { data: [{ result: "applied" }], error: null };
      },
      applyPayment: async (input) => {
        calls.apply.push(input);
        return options.apply ? options.apply(input, calls) : { data: [{ result: "applied" }], error: null };
      },
    }),
  };
  return { POST: createCashfreeWebhookHandler(deps), calls };
}

async function send(POST, event, options) {
  return POST(signedRequest(JSON.stringify(event), options));
}

test("valid success verifies the order and applies the matching INR payment once", async () => {
  const { POST, calls } = createHarness();
  const response = await send(POST, paymentEvent());
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { result: "applied" });
  assert.deepEqual(calls.verifyOrder, [orderId]);
  assert.equal(calls.apply.length, 1);
  assert.equal(calls.apply[0].businessId, verifiedOrder.businessId);
  assert.equal(calls.apply[0].plan, "Standard");
  assert.equal(calls.finalize.length, 0);
});

test("failed, pending, cancelled, and user-dropped events never verify or activate", async () => {
  const events = [
    paymentEvent("PAYMENT_FAILED_WEBHOOK", "FAILED"),
    paymentEvent("PAYMENT_PENDING_WEBHOOK", "PENDING"),
    paymentEvent("PAYMENT_CANCELLED_WEBHOOK", "CANCELLED"),
    paymentEvent("PAYMENT_USER_DROPPED_WEBHOOK", "USER_DROPPED"),
  ];
  for (const event of events) {
    const { POST, calls } = createHarness();
    const response = await send(POST, event);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: "acknowledged" });
    assert.equal(calls.verifyOrder.length, 0);
    assert.equal(calls.apply.length + calls.finalize.length, 0);
  }
});

test("missing headers, wrong secret, invalid signature, and a changed raw body are rejected", async () => {
  const event = paymentEvent();
  const rawBody = JSON.stringify(event);
  const { POST, calls } = createHarness();
  const missing = await POST(new Request("https://local.test/api/cashfree/webhook", {
    method: "POST", headers: { "content-type": "application/json" }, body: rawBody,
  }));
  const wrongSecret = await POST(signedRequest(rawBody, { signingSecret: "wrong-sandbox-secret" }));
  const invalid = await POST(signedRequest(rawBody, { signature: "not-a-valid-signature" }));
  const original = signedRequest(rawBody);
  const changed = await POST(new Request("https://trustitreview.com/api/cashfree/webhook", {
    method: "POST",
    headers: original.headers,
    body: `${rawBody} `,
  }));
  for (const response of [missing, wrongSecret, invalid, changed]) assert.equal(response.status, 401);
  assert.equal(calls.verifyOrder.length, 0);
  assert.equal(calls.apply.length, 0);
});

test("malformed JSON with a valid signature is rejected before any payment lookup", async () => {
  const { POST, calls } = createHarness();
  const response = await POST(signedRequest("{"));
  assert.equal(response.status, 400);
  assert.equal(calls.verifyOrder.length, 0);
});

test("a transient Cashfree verification error returns retry, then a redelivery recovers", async () => {
  const { POST, calls } = createHarness({
    verifyOrder: (_id, seen) => seen.verifyOrder.length === 1
      ? { status: "VERIFICATION_ERROR" }
      : verifiedOrder,
  });
  assert.equal((await send(POST, paymentEvent())).status, 503);
  const recovered = await send(POST, paymentEvent());
  assert.equal(recovered.status, 200);
  assert.deepEqual(await recovered.json(), { result: "applied" });
  assert.equal(calls.verifyOrder.length, 2);
  assert.equal(calls.apply.length, 1);
});

test("a transient database error returns retry and a later delivery succeeds", async () => {
  const { POST, calls } = createHarness({
    apply: (_input, seen) => seen.apply.length === 1
      ? { data: null, error: new Error("temporary database failure") }
      : { data: [{ result: "applied" }], error: null },
  });
  assert.equal((await send(POST, paymentEvent())).status, 503);
  assert.equal((await send(POST, paymentEvent())).status, 200);
  assert.equal(calls.apply.length, 2);
});

test("duplicate payment delivery accepts the idempotent already_applied result", async () => {
  const { POST, calls } = createHarness({
    apply: (_input, seen) => ({ data: [{ result: seen.apply.length === 1 ? "applied" : "already_applied" }], error: null }),
  });
  const first = await send(POST, paymentEvent());
  const duplicate = await send(POST, paymentEvent());
  assert.deepEqual(await first.json(), { result: "applied" });
  assert.deepEqual(await duplicate.json(), { result: "already_applied" });
  assert.equal(calls.apply.length, 2);
});

test("one-time onboarding calls its finalizer, including on duplicate delivery", async () => {
  const { POST, calls } = createHarness({
    onboarding: { payment_mode: "one_time", selected_plan: "Standard", user_id: "sandbox-user" },
    finalize: (_input, seen) => ({ data: [{ result: seen.finalize.length === 1 ? "applied" : "already_applied" }], error: null }),
  });
  assert.deepEqual(await (await send(POST, paymentEvent())).json(), { result: "applied" });
  assert.deepEqual(await (await send(POST, paymentEvent())).json(), { result: "already_applied" });
  assert.equal(calls.finalize.length, 2);
  assert.equal(calls.apply.length, 0);
});

test("onboarding plan or user mismatch never falls through to renewal", async () => {
  for (const onboarding of [
    { payment_mode: "one_time", selected_plan: "Premium", user_id: "sandbox-user" },
    { payment_mode: "one_time", selected_plan: "Standard", user_id: null },
  ]) {
    const { POST, calls } = createHarness({ onboarding });
    assert.equal((await send(POST, paymentEvent())).status, 400);
    assert.equal(calls.finalize.length, 0);
    assert.equal(calls.apply.length, 0);
  }
});

test("amount, currency, order, and Cashfree plan context mismatches cannot activate", async () => {
  const wrongAmount = paymentEvent();
  wrongAmount.data.payment.payment_amount = 29;
  const wrongCurrency = paymentEvent();
  wrongCurrency.data.payment.payment_currency = "USD";
  const wrongOrder = paymentEvent();
  wrongOrder.data.order.order_id = "not-a-trustit-order";
  const { POST: amountPOST, calls: amountCalls } = createHarness();
  const { POST: currencyPOST, calls: currencyCalls } = createHarness();
  const { POST: orderPOST, calls: orderCalls } = createHarness();
  const { POST: planPOST, calls: planCalls } = createHarness({
    verifyOrder: async () => ({ ...verifiedOrder, planId: "not-a-plan" }),
  });
  assert.equal((await send(amountPOST, wrongAmount)).status, 400);
  assert.equal((await send(currencyPOST, wrongCurrency)).status, 400);
  assert.equal((await send(orderPOST, wrongOrder)).status, 400);
  assert.equal((await send(planPOST, paymentEvent())).status, 400);
  assert.equal(amountCalls.apply.length + currencyCalls.apply.length + orderCalls.apply.length + planCalls.apply.length, 0);
});

test("Cashfree order mismatch and webhook amount mismatch cannot activate", async () => {
  const { POST, calls } = createHarness({
    verifyOrder: async () => ({ ...verifiedOrder, orderId: `rqr_${"b".repeat(32)}` }),
  });
  const response = await send(POST, paymentEvent());
  assert.equal(response.status, 400);
  assert.equal(calls.apply.length, 0);
});

test("verification API non-success retries; unmapped legacy orders are ignored", async () => {
  const notSuccess = createHarness({ verifyOrder: async () => ({ status: "NOT_SUCCESS" }) });
  const unmapped = createHarness({ verifyOrder: async () => ({ status: "UNMAPPED" }) });
  assert.equal((await send(notSuccess.POST, paymentEvent())).status, 503);
  assert.equal((await send(unmapped.POST, paymentEvent())).status, 200);
  assert.deepEqual(await (await send(unmapped.POST, paymentEvent())).json(), { result: "ignored_unmapped" });
  assert.equal(notSuccess.calls.apply.length + unmapped.calls.apply.length, 0);
});
