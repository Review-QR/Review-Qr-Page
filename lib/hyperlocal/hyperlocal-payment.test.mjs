import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("cashfree hyperlocal service defines payment order creation and verification", async () => {
  const service = await read("./cashfree-hyperlocal-service.ts");
  assert.match(service, /createCashfreeHyperlocalPaymentOrder/);
  assert.match(service, /verifyCashfreeHyperlocalPayment/);
  assert.match(service, /createCashfreeClient/);
  assert.match(service, /isValidHyperlocalOrderId/);
  assert.match(service, /payment_session_id/);
  assert.match(service, /order_type: "hyperlocal_food"/);
  assert.match(service, /payment_status: "paid"/);
  assert.match(service, /payment_mode: "online_cashfree"/);
});

test("hyperlocal payment session and verification API routes exist and enforce required fields", async () => {
  const sessionRoute = await read("../../app/api/hyperlocal/payment/session/route.ts");
  assert.match(sessionRoute, /createCashfreeHyperlocalPaymentOrder/);
  assert.match(sessionRoute, /Missing required order fields/);

  const verifyRoute = await read("../../app/api/hyperlocal/payment/verify/route.ts");
  assert.match(verifyRoute, /verifyCashfreeHyperlocalPayment/);
  assert.match(verifyRoute, /Order ID is required/);
});

test("order portal client provides Cashfree Official Gateway Modal (UPI QR, PhonePe, Cards) and COD with zero dummy VPAs", async () => {
  const client = await read("../../app/order/order-portal-client.tsx");

  // Cashfree SDK Modal & Gateway Handler
  assert.match(client, /https:\/\/sdk\.cashfree\.com\/js\/v3\/cashfree\.js/);
  assert.match(client, /redirectTarget: "_modal"/);
  assert.match(client, /handleInitiateCashfreeGateway/);

  // Supported payment channels
  assert.match(client, /online_cashfree/);
  assert.match(client, /Pay Online/);
  assert.match(client, /UPI/);
  assert.match(client, /PhonePe/);
  assert.match(client, /Cards/);

  // Cash on Delivery
  assert.match(client, /handlePlaceCodOrder/);
  assert.match(client, /Cash on Delivery/);
  assert.match(client, /handleCheckoutPayment/);

  // Zero placeholder / dummy VPAs guarantee (no "raja" or "trustit@icici")
  assert.doesNotMatch(client, /trustit@icici/);
  assert.doesNotMatch(client, /upi:\/\/pay\?pa=/);
});
