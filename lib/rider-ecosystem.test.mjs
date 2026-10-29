import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { calculateHaversineDistanceKm, CASCADING_RADII_METERS } from "./hyperlocal/dispatch-engine.ts";
import { formatDisplayOrderNumber } from "./hyperlocal/order-id.ts";

test("formatDisplayOrderNumber generates deterministic 4-digit order numbers between #1000 and #9999", () => {
  const num1 = formatDisplayOrderNumber("hord_16a5b36639cf4eec94f43112c5b0123f");
  assert.match(num1, /^#[0-9]{4}$/);
  assert.equal(num1, "#5671");

  const num2 = formatDisplayOrderNumber("hord_2fbf012d1c1f434786fccac81d0cc523");
  assert.match(num2, /^#[0-9]{4}$/);
  assert.equal(num2, "#6467");

  // Same order always yields identical 4-digit number
  assert.equal(formatDisplayOrderNumber("hord_16a5b36639cf4eec94f43112c5b0123f"), num1);
});

test("rider database migration extends delivery_riders with KYC, banking, and earnings columns", () => {
  const migrationPath = path.resolve(
    process.cwd(),
    "supabase/migrations/20261029130000_delivery_riders_kyc_and_earnings.sql"
  );
  assert.ok(fs.existsSync(migrationPath), "Rider migration file must exist");
  const sql = fs.readFileSync(migrationPath, "utf8");

  assert.match(sql, /add column if not exists email text/i);
  assert.match(sql, /add column if not exists profile_image_url text/i);
  assert.match(sql, /add column if not exists residential_address text/i);
  assert.match(sql, /add column if not exists driving_license_number text/i);
  assert.match(sql, /add column if not exists bank_account_holder_name text/i);
  assert.match(sql, /add column if not exists bank_account_number text/i);
  assert.match(sql, /add column if not exists bank_ifsc_code text/i);
  assert.match(sql, /add column if not exists bank_name text/i);
  assert.match(sql, /add column if not exists upi_id text/i);
  assert.match(sql, /add column if not exists total_deliveries_count integer/i);
  assert.match(sql, /add column if not exists total_earnings numeric/i);
});

test("rider API route supports email OTP, KYC registration, scorecard metrics, and instant UPI payouts", () => {
  const routePath = path.resolve(process.cwd(), "app/api/hyperlocal/rider/route.ts");
  assert.ok(fs.existsSync(routePath), "Rider API route must exist");
  const content = fs.readFileSync(routePath, "utf8");

  assert.match(content, /action === "send_otp"/);
  assert.match(content, /action === "verify_otp"/);
  assert.match(content, /action === "register_kyc"/);
  assert.match(content, /action === "request_payout"/);
  assert.match(content, /scorecard/);
  assert.match(content, /todayEarnings/);
  assert.match(content, /monthEarnings/);
  assert.match(content, /totalDeliveries/);
  assert.match(content, /recentTrips/);
});

test("rider portal client contains Email OTP auth, KYC onboarding modal, financial cards, and cascading alert", () => {
  const pagePath = path.resolve(process.cwd(), "app/rider/page.tsx");
  assert.ok(fs.existsSync(pagePath), "Rider page must exist");
  const content = fs.readFileSync(pagePath, "utf8");

  assert.match(content, /handleSendEmailOtp/);
  assert.match(content, /handleVerifyEmailOtp/);
  assert.match(content, /handleSubmitKyc/);
  assert.match(content, /handleInstantPayout/);
  assert.match(content, /playAlertBuzzer/);
  assert.match(content, /Today's Earned/);
  assert.match(content, /This Month/);
  assert.match(content, /COD Cash in Hand/);
  assert.match(content, /All-Time Deliveries/);
  assert.match(content, /Instant UPI Payout/);
  assert.match(content, /Emergency & Safety SOS/);
  assert.match(content, /INCOMING (ORDER|DISPATCH)/);
});

test("cascading proximity dispatch calculates spherical distance and defines outward escalation radii", () => {
  // Merchant at Bahraich center (27.5742, 81.5961)
  const merchantLat = 27.5742;
  const merchantLon = 81.5961;

  // Rider 1 located ~800 meters away (27.5790, 81.6010)
  const dist1 = calculateHaversineDistanceKm(merchantLat, merchantLon, 27.5790, 81.6010);
  assert.ok(dist1 > 0.5 && dist1 < 1.2, `Distance should be ~0.7-0.9km, got ${dist1}`);

  // Rider 2 located ~2.5 km away (27.5900, 81.6150)
  const dist2 = calculateHaversineDistanceKm(merchantLat, merchantLon, 27.5900, 81.6150);
  assert.ok(dist2 > dist1, "Farther rider must have higher distance");

  // Cascading radii steps: 1000m -> 1100m -> 1300m -> 1500m -> 2000m -> 3000m
  assert.deepEqual(CASCADING_RADII_METERS, [1000, 1100, 1300, 1500, 2000, 3000]);
});

test("unified order code and outlet extractor provide brand-consistent, cashfree-traceable IDs", async () => {
  const { getOutletCode, formatUnifiedOrderCode } = await import("./hyperlocal/order-id.ts");
  assert.equal(getOutletCode("Deliciated Cafe"), "DEL");
  assert.equal(getOutletCode("Apna Super Bazaar"), "APN");
  assert.equal(getOutletCode(null), "DEL");

  const code1 = formatUnifiedOrderCode("hord_16a5b36639cf4eec94f43112c5b0123f", "Deliciated Cafe");
  assert.equal(code1, "#TR-DEL-5671");

  const code2 = formatUnifiedOrderCode("hord_2fbf012d1c1f434786fccac81d0cc523", "Apna Super Bazaar");
  assert.equal(code2, "#TR-APN-6467");
});

test("location resolver translates GPS coordinates into familiar Bahraich landmarks without exposing raw numbers", async () => {
  const { resolveBahraichArea } = await import("./hyperlocal/location-resolver.ts");
  // Coordinates from Screenshot 3: 27.5655, 81.5785
  const area1 = resolveBahraichArea(27.5655, 81.5785);
  assert.equal(area1, "Lucknow Road / Banjari Road, Bahraich");

  // Dargah area
  const area2 = resolveBahraichArea(27.5742, 81.5961);
  assert.equal(area2, "Dargah Sharif / Galla Mandi, Bahraich");

  // Never returns raw numbers or decimal coordinates
  assert.doesNotMatch(area1, /\d+\.\d+/);
  assert.doesNotMatch(area2, /\d+\.\d+/);
});

test("Digital Asset Links file links trustitreview.com to all 3 native Android package names", () => {
  const assetLinksPath = path.resolve(process.cwd(), "public/.well-known/assetlinks.json");
  assert.ok(fs.existsSync(assetLinksPath), "assetlinks.json must exist in public/.well-known");
  const data = JSON.parse(fs.readFileSync(assetLinksPath, "utf8"));
  assert.ok(Array.isArray(data));
  assert.equal(data.length, 3);

  const packages = data.map((entry) => entry.target.package_name);
  assert.ok(packages.includes("com.trustitreview.rider"));
  assert.ok(packages.includes("com.trustitreview.merchant"));
  assert.ok(packages.includes("com.trustitreview.customer"));
});
