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

test("order portal client provides dynamic QR with countdown timer, 1-tap apps, cards modal, and COD", async () => {
  const client = await read("../../app/order/order-portal-client.tsx");

  // Dynamic UPI QR & 5:00 countdown timer
  assert.match(client, /Trustit Dynamic UPI QR/);
  assert.match(client, /secondsRemaining/);
  assert.match(client, /QRCode\.toDataURL/);

  // 1-Tap UPI Apps
  assert.match(client, /PhonePe/);
  assert.match(client, /GPay/);
  assert.match(client, /Paytm/);
  assert.match(client, /BHIM/);

  // Cashfree SDK Modal & Cards
  assert.match(client, /https:\/\/sdk\.cashfree\.com\/js\/v3\/cashfree\.js/);
  assert.match(client, /redirectTarget: "_modal"/);
  assert.match(client, /handleInitiateCashfreeGateway/);

  // Cash on Delivery
  assert.match(client, /handlePlaceCodOrder/);
  assert.match(client, /Cash on Delivery/);
  assert.match(client, /handleCheckoutPayment/);
});
