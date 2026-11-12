import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

const read = (relPath) => fs.readFileSync(path.resolve(process.cwd(), relPath), "utf8");

test("Customer Super-App implements modular 32-screen architecture (N-01 to N-32) with Single-Order & Bahraich rules", () => {
  const types = read("components/customer/customer-types.ts");
  const map = read("components/customer/BahraichInteractiveMap.tsx");
  const onboarding = read("components/customer/CustomerOnboardingModals.tsx");
  const home = read("components/customer/CustomerHomeAndDiscovery.tsx");
  const storefront = read("components/customer/CustomerStorefrontAndVerticals.tsx");
  const checkout = read("components/customer/CustomerCheckoutAndAddresses.tsx");
  const orders = read("components/customer/CustomerOrdersAndSupport.tsx");
  const profile = read("components/customer/CustomerProfileAndSettings.tsx");
  const portal = read("app/order/order-portal-client.tsx");

  // N-01 to N-06 Onboarding & +91 lock
  assert.match(onboarding, /CustomerBrandSplash/);
  assert.match(onboarding, /N-02 • Welcome Back/);
  assert.match(onboarding, /🇮🇳 \+91/);
  assert.match(onboarding, /N-04 • WhatsApp Verification/);
  assert.match(onboarding, /POST_NOTIFICATIONS/);
  assert.match(onboarding, /N-06 • Bahraich GPS Lock/);

  // N-07 to N-12 Home, 12 Categories, Search, Filters, Store Pin Map
  assert.match(home, /N-08 • Bahraich Categories/);
  assert.match(home, /N-10 • Matching Items Across Bahraich/);
  assert.match(home, /N-11 • Multi-Facet Filters/);
  assert.match(home, /N-12 • Tap any store pin/);
  assert.doesNotMatch(types, /title:\s*"Alcohol|title:\s*"Adults Only/i);

  // N-13 to N-19 Storefront, Info/Translate, Verified Reviews, Customizer, Parcha, Rx, Salon/Wash
  assert.match(storefront, /N-14 • Store Options/);
  assert.match(storefront, /English ↔ हिन्दी/);
  assert.match(storefront, /N-15 • Trustit Verified Reviews/);
  assert.match(storefront, /Often Bought Together/);
  assert.match(storefront, /N-17 • Smart Parcha/);
  assert.match(storefront, /N-18 • Pharmacy Prescription/);
  assert.match(storefront, /N-19 • Salon Live Chair Token/);

  // N-20 to N-25 Single-Store Cart Guard, Gate Delivery (No Leave at Door), Dropoff Pin, Retry 08:42, Confirm PIN
  assert.match(checkout, /Replace current cart\?/);
  assert.match(checkout, /Call on Arrival &amp; 4-Digit Handover PIN Required/);
  assert.doesNotMatch(checkout, />\s*Leave( order)? at door/i);
  assert.match(checkout, /N-22 • Adjust Dropoff Gate Pin/);
  assert.match(checkout, /N-24 • Stock Held Safely/);
  assert.match(checkout, /N-25 • Order Confirmed/);
  assert.match(map, /pin_adjust/);
  assert.match(map, /order_route/);

  // N-26 to N-32 Route Map, GST Receipt, Orders, Cancel/UTR/Support, Masked PIN Notifs, Wallet/SpeedPass/DPDP
  assert.match(orders, /N-27 • Digital GST Receipt/);
  assert.match(orders, /N-29 • Cancel, UTR Refund/);
  assert.match(orders, /N-30 • Live Alerts/);
  assert.match(types, /maskHandoverPin/);
  assert.match(profile, /Trustit Money Balance/);
  assert.match(profile, /Trustit SpeedPass/);
  assert.match(profile, /DPDP Act 2023/);

  // No raw GPS 0.0000 fallback in portal
  assert.doesNotMatch(portal, /GPS:\s*\$\{lat/);
});

test("Customer backend enhancements support customer_cancel, switch_to_cod, and Bahraich directions proxy", () => {
  const ordersRoute = read("app/api/hyperlocal/orders/route.ts");
  const directionsRoute = read("app/api/hyperlocal/directions/route.ts");
  const verifyOtpRoute = read("app/api/customer/auth/verify-otp/route.ts");

  assert.match(ordersRoute, /action === "customer_cancel"/);
  assert.match(ordersRoute, /action === "switch_to_cod"/);
  assert.match(ordersRoute, /current_latitude/);
  assert.match(directionsRoute, /decodePolyline/);
  assert.match(directionsRoute, /GOOGLE_MAPS_API_KEY/);
  assert.match(verifyOtpRoute, /@customer\.trustitreview\.com/);
});
