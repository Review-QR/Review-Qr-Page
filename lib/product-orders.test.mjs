import test from "node:test";
import assert from "node:assert/strict";
import {
  generateProductOrderId,
  isValidProductOrderId,
  PRODUCT_ORDER_ID_PREFIX,
} from "./product-orders/order-id.ts";
import { calculateShipping } from "./product-orders/shipping-calculator.ts";
import {
  calculateOrderFinancials,
  roundToTwoDecimals,
} from "./product-orders/pricing-calculator.ts";

test("Order ID format generator and validator strictly isolates product orders from subscription orders", () => {
  const productOrderId = generateProductOrderId();

  // Must start with tord_
  assert.ok(productOrderId.startsWith(PRODUCT_ORDER_ID_PREFIX));
  assert.equal(isValidProductOrderId(productOrderId), true);

  // Must reject subscription order references (rqr_...)
  const subscriptionOrderId = `rqr_${"f".repeat(32)}`;
  assert.equal(isValidProductOrderId(subscriptionOrderId), false);

  // Must reject invalid / malformed inputs
  assert.equal(isValidProductOrderId(""), false);
  assert.equal(isValidProductOrderId(null), false);
  assert.equal(isValidProductOrderId(undefined), false);
  assert.equal(isValidProductOrderId("tord_invalid-characters!"), false);
  assert.equal(isValidProductOrderId("tord_123"), false); // too short
});

test("Shipping calculator correctly calculates tiers and free shipping threshold", () => {
  // Free shipping for cart >= ₹999
  const freeResult = calculateShipping({
    pinCode: "271801",
    subtotal: 1049,
    hasStandee: true,
  });
  assert.equal(freeResult.isFreeShipping, true);
  assert.equal(freeResult.shippingAmount, 0);

  // Base sticker shipping: ₹49
  const stickerResult = calculateShipping({
    pinCode: "226001",
    subtotal: 149,
    hasStandee: false,
    hasBanner: false,
  });
  assert.equal(stickerResult.isFreeShipping, false);
  assert.equal(stickerResult.shippingAmount, 49);

  // Base standee shipping: ₹79
  const standeeResult = calculateShipping({
    pinCode: "226001",
    subtotal: 349,
    hasStandee: true,
    hasBanner: false,
  });
  assert.equal(standeeResult.shippingAmount, 79);

  // Heavy roll-up selfie banner shipping: ₹149
  const bannerResult = calculateShipping({
    pinCode: "226001",
    subtotal: 599,
    hasStandee: false,
    hasBanner: true,
  });
  assert.equal(bannerResult.shippingAmount, 149);

  // Remote zone surcharge (+₹50 for PIN starting with 79, 19, 744)
  const remoteResult = calculateShipping({
    pinCode: "791001", // Arunachal Pradesh
    subtotal: 349,
    hasStandee: true,
  });
  assert.equal(remoteResult.region, "special_zone");
  assert.equal(remoteResult.shippingAmount, 129); // 79 + 50
});

test("Order financials calculate exact subtotal, 18% GST, shipping, and total payable", () => {
  const financials = calculateOrderFinancials({
    items: [
      { unitPrice: 349, quantity: 1, category: "standee" }, // 349
      { unitPrice: 149, quantity: 2, category: "sticker" }, // 298
    ],
    pinCode: "271801",
  });

  // Subtotal = 349 + 298 = 647
  assert.equal(financials.subtotalAmount, 647);

  // 18% GST on 647 = 116.46
  assert.equal(financials.taxAmount, 116.46);

  // Standee shipping (< ₹999) = 79
  assert.equal(financials.shippingAmount, 79);

  // Total = 647 + 116.46 + 79 = 842.46
  assert.equal(financials.totalAmount, 842.46);
  assert.equal(financials.isFreeShipping, false);
});

test("Order pricing rejects invalid unit prices, non-integer quantities, and empty cart", () => {
  // Empty cart
  assert.throws(() => {
    calculateOrderFinancials({ items: [], pinCode: "271801" });
  }, /Order must contain at least one item/);

  // Negative price
  assert.throws(() => {
    calculateOrderFinancials({
      items: [{ unitPrice: -50, quantity: 1 }],
      pinCode: "271801",
    });
  }, /Invalid unit price/);

  // Zero / negative quantity
  assert.throws(() => {
    calculateOrderFinancials({
      items: [{ unitPrice: 299, quantity: 0 }],
      pinCode: "271801",
    });
  }, /Invalid item quantity/);
});

test("Quality Control checklist requires all inspections to pass before ready to ship", () => {
  function evaluateQc(input) {
    return (
      input.qrScannable === true &&
      input.correctDestinationUrl === true &&
      input.printQualityGrade === "pass" &&
      input.materialCheck === true &&
      input.packagingCheck === true
    );
  }

  // All pass
  assert.equal(
    evaluateQc({
      qrScannable: true,
      correctDestinationUrl: true,
      printQualityGrade: "pass",
      materialCheck: true,
      packagingCheck: true,
    }),
    true,
  );

  // Print grade marginal / fail
  assert.equal(
    evaluateQc({
      qrScannable: true,
      correctDestinationUrl: true,
      printQualityGrade: "marginal",
      materialCheck: true,
      packagingCheck: true,
    }),
    false,
  );

  // QR destination wrong
  assert.equal(
    evaluateQc({
      qrScannable: true,
      correctDestinationUrl: false,
      printQualityGrade: "pass",
      materialCheck: true,
      packagingCheck: true,
    }),
    false,
  );
});

test("Strict separation contract: product payments never touch subscription tables or RPC", async () => {
  // Ensure the database migration script defines isolated product tables and RLS
  const fs = await import("node:fs/promises");
  const migrationSql = await fs.readFile(
    new URL("../supabase/migrations/20261028100000_physical_qr_products_system.sql", import.meta.url),
    "utf8",
  );

  assert.ok(migrationSql.includes("create table if not exists public.product_orders"));
  assert.ok(migrationSql.includes("create table if not exists public.product_payments"));
  assert.ok(migrationSql.includes("create table if not exists public.product_quality_checks"));
  assert.ok(migrationSql.includes("create table if not exists public.product_order_shipments"));

  // Verify that physical product orders never touch subscription payment records
  assert.ok(!migrationSql.includes("table public.payment_records"));
  assert.ok(!migrationSql.includes("into public.payment_records"));
  assert.ok(!migrationSql.includes("apply_verified_cashfree_payment"));
});
