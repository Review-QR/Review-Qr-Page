import test from "node:test";
import assert from "node:assert/strict";
import {
  generateHyperlocalOrderId,
  isValidHyperlocalOrderId,
  generateDeliveryOtp,
  HYPERLOCAL_ORDER_ID_PREFIX,
} from "./hyperlocal/order-id.ts";
import {
  calculateHaversineDistanceKm,
  findNearestAvailableRiders,
  estimateTransitTimeMinutes,
} from "./hyperlocal/dispatch-engine.ts";
import {
  calculatePayoutSplits,
  round,
} from "./hyperlocal/split-calculator.ts";

test("Hyperlocal Order ID and Delivery OTP generator validation", () => {
  const orderId = generateHyperlocalOrderId();
  assert.ok(orderId.startsWith(HYPERLOCAL_ORDER_ID_PREFIX));
  assert.equal(isValidHyperlocalOrderId(orderId), true);

  // Must reject invalid / other order formats
  assert.equal(isValidHyperlocalOrderId("rqr_1234567890"), false);
  assert.equal(isValidHyperlocalOrderId("tord_1234567890"), false);
  assert.equal(isValidHyperlocalOrderId(""), false);

  // 4-Digit OTP generator
  const otp = generateDeliveryOtp();
  assert.match(otp, /^[0-9]{4}$/);
});

test("Haversine Distance calculation is accurate across known coordinates", () => {
  // Distance between Peepal Chauraha (27.5765, 81.5982) and Ghanta Ghar (27.5742, 81.5961) in Bahraich (~0.33 km)
  const distance = calculateHaversineDistanceKm(27.5765, 81.5982, 27.5742, 81.5961);
  assert.ok(distance > 0.2 && distance < 0.5, `Expected ~0.33 km, got ${distance}`);

  // Distance between same coordinates must be 0
  assert.equal(calculateHaversineDistanceKm(27.5765, 81.5982, 27.5765, 81.5982), 0);

  // Estimated transit time
  const transitTime = estimateTransitTimeMinutes(distance);
  assert.ok(transitTime >= 3 && transitTime <= 10);
});

test("Dispatch Engine filters online, available riders and sorts by proximity", () => {
  const sampleRiders = [
    {
      id: "r1",
      full_name: "Far Away Rider",
      phone: "+919000000001",
      vehicle_type: "bike",
      vehicle_number: "UP-40-1",
      is_online: true,
      is_available: true,
      current_latitude: 27.6500, // ~8 km away
      current_longitude: 81.6500,
      cash_in_hand: 0,
      wallet_balance: 0,
      rating: 4.8,
      is_verified: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "r2",
      full_name: "Nearby Available Rider",
      phone: "+919000000002",
      vehicle_type: "bike",
      vehicle_number: "UP-40-2",
      is_online: true,
      is_available: true,
      current_latitude: 27.5750, // ~0.3 km away
      current_longitude: 81.5970,
      cash_in_hand: 0,
      wallet_balance: 0,
      rating: 4.9,
      is_verified: true,
      created_at: new Date().toISOString(),
    },
    {
      id: "r3",
      full_name: "Nearby but Busy Rider",
      phone: "+919000000003",
      vehicle_type: "bike",
      vehicle_number: "UP-40-3",
      is_online: true,
      is_available: false, // Busy with an order
      current_latitude: 27.5745,
      current_longitude: 81.5965,
      cash_in_hand: 0,
      wallet_balance: 0,
      rating: 5.0,
      is_verified: true,
      created_at: new Date().toISOString(),
    },
  ];

  const targetLat = 27.5742;
  const targetLon = 81.5961;

  const matched = findNearestAvailableRiders(sampleRiders, targetLat, targetLon, 4.0);

  // Only r2 should match (r1 is > 4 km, r3 is busy)
  assert.equal(matched.length, 1);
  assert.equal(matched[0].id, "r2");
  assert.ok((matched[0].distanceKm ?? 0) < 1.0);
});

test("Multi-vendor payout escrow split calculates exact shares for restaurant, rider, and Trustit", () => {
  const split = calculatePayoutSplits({
    orderId: "hord_test123",
    merchantId: "biz-1",
    orderType: "food_delivery",
    subtotal: 450,
    deliveryFee: 35,
    platformFee: 5,
    commissionRatePct: 10,
    riderId: "rider-1",
    paymentMode: "online_cashfree",
  });

  // Gross total = 450 + 35 + 5 = 490
  assert.equal(split.gross_amount, 490);

  // Restaurant: 450 - 10% (45) = 405
  assert.equal(split.merchant_gross, 450);
  assert.equal(split.platform_commission, 45);
  assert.equal(split.merchant_net_payable, 405);

  // Rider payout = 35
  assert.equal(split.rider_payout, 35);

  // Platform convenience fee = 5
  assert.equal(split.platform_convenience_fee, 5);

  // Cashfree ~1.75% of 490 = 8.58
  assert.equal(split.payment_gateway_fee, 8.58);
});

test("Service token payout for Salon or Car Wash has zero delivery payout", () => {
  const split = calculatePayoutSplits({
    orderId: "hord_token123",
    merchantId: "biz-salon-1",
    orderType: "salon_token",
    subtotal: 200,
    deliveryFee: 0,
    platformFee: 0,
    commissionRatePct: 10,
    paymentMode: "counter_cash",
  });

  assert.equal(split.gross_amount, 200);
  assert.equal(split.rider_payout, 0); // No rider for in-salon appointments
  assert.equal(split.merchant_net_payable, 180); // 200 - 10%
  assert.equal(split.platform_commission, 20);
});

test("Kirana Parcha order and free delivery above ₹499 threshold calculation", () => {
  // Free delivery for subtotal >= 499
  const subtotalOver499 = 520;
  const isDelivery = true;
  const fee1 = isDelivery ? (subtotalOver499 >= 499 ? 0 : 35) : 0;
  assert.equal(fee1, 0, "Orders ₹499 or more must have zero delivery fee");

  // Standard delivery for subtotal < 499
  const subtotalUnder499 = 350;
  const fee2 = isDelivery ? (subtotalUnder499 >= 499 ? 0 : 35) : 0;
  assert.equal(fee2, 35, "Orders under ₹499 must have ₹35 delivery fee");

  // Kirana Parcha Split calculation with merchant quote
  const parchaSplit = calculatePayoutSplits({
    orderId: "hord_parcha987",
    merchantId: "biz-groc-1",
    orderType: "grocery_parcha",
    subtotal: 600,
    deliveryFee: 0,
    platformFee: 5,
    commissionRatePct: 5, // Kirana lower 5% take rate
    riderId: "rider-1",
    paymentMode: "cod",
  });

  assert.equal(parchaSplit.gross_amount, 605);
  assert.equal(parchaSplit.merchant_gross, 600);
  assert.equal(parchaSplit.platform_commission, 30); // 5% of 600
  assert.equal(parchaSplit.merchant_net_payable, 570); // 600 - 30
});
