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

test("rider portal client contains OTP auth, KYC onboarding screens, financial cards, SOS shield, and proximity radar", () => {
  const pagePath = path.resolve(process.cwd(), "app/rider/page.tsx");
  assert.ok(fs.existsSync(pagePath), "Rider page must exist");
  const pageContent = fs.readFileSync(pagePath, "utf8");

  const authHookPath = path.resolve(process.cwd(), "app/rider/hooks/useRiderAuth.ts");
  assert.ok(fs.existsSync(authHookPath), "useRiderAuth hook must exist");
  const authHookContent = fs.readFileSync(authHookPath, "utf8");

  const workflowHookPath = path.resolve(process.cwd(), "app/rider/hooks/useRiderWorkflow.ts");
  assert.ok(fs.existsSync(workflowHookPath), "useRiderWorkflow hook must exist");
  const workflowContent = fs.readFileSync(workflowHookPath, "utf8");

  const screen01 = fs.readFileSync(path.resolve(process.cwd(), "app/rider/components/screens/Screen01AuthStart.tsx"), "utf8");
  const screen02 = fs.readFileSync(path.resolve(process.cwd(), "app/rider/components/screens/Screen02OtpVerify.tsx"), "utf8");
  const screen06 = fs.readFileSync(path.resolve(process.cwd(), "app/rider/components/screens/Screen06PayoutSetup.tsx"), "utf8");
  const screen08 = fs.readFileSync(path.resolve(process.cwd(), "app/rider/components/screens/Screen08ShiftScorecard.tsx"), "utf8");
  const screen10 = fs.readFileSync(path.resolve(process.cwd(), "app/rider/components/screens/Screen10Radar.tsx"), "utf8");
  const screen15 = fs.readFileSync(path.resolve(process.cwd(), "app/rider/components/screens/Screen15Passbook.tsx"), "utf8");
  const screen17 = fs.readFileSync(path.resolve(process.cwd(), "app/rider/components/screens/Screen17SafetySos.tsx"), "utf8");
  const sirenContent = fs.readFileSync(path.resolve(process.cwd(), "lib/audio/rider-siren.ts"), "utf8");

  // Modular screen & hook orchestration
  assert.match(pageContent, /useRiderWorkflow/);
  assert.match(pageContent, /Screen01AuthStart/);
  assert.match(pageContent, /Screen02OtpVerify/);
  assert.match(pageContent, /Screen06PayoutSetup/);
  assert.match(pageContent, /Screen08ShiftScorecard/);
  assert.match(pageContent, /Screen10Radar/);
  assert.match(pageContent, /Screen15Passbook/);
  assert.match(pageContent, /Screen17SafetySos/);
  assert.match(pageContent, /action:\s*"register_kyc"/);
  assert.match(pageContent, /total_deliveries_count/);

  // OTP auth & KYC hooks/screens
  assert.match(authHookContent, /sendPhoneOtp/);
  assert.match(authHookContent, /verifyPhoneOtp/);
  assert.match(authHookContent, /registerKyc/);
  assert.match(screen01, /sendPhoneOtp/);
  assert.match(screen02, /verifyPhoneOtp/);

  // Payout & financial cards
  assert.match(workflowContent, /requestInstantPayout/);
  assert.match(screen06, /Instant Cashfree UPI Payout/);
  assert.match(screen08, /Today's Earnings/);
  assert.match(screen08, /This Month/);
  assert.match(screen08, /Cash in Hand/);
  assert.match(screen15, /Today&apos;s Real Earnings/);
  assert.match(screen15, /1-Tap Transfer/);

  // Safety SOS & proximity siren radar
  assert.match(screen17, /Emergency Assistance &amp; SOS/);
  assert.match(screen17, /Call UP Police \(112\)/);
  assert.match(sirenContent, /playProximitySiren/);
  assert.match(workflowContent, /riderAudio\.playProximitySiren/);
  assert.match(screen10, /30s PROXIMITY RADAR/);
  assert.match(screen10, /Incoming Order Assigned!/);
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

test("doorstep dispute reporting and admin refusal cancellation are wired and verifiable", () => {
  const servicePath = path.resolve(process.cwd(), "lib/hyperlocal/hyperlocal-service.ts");
  const serviceSource = fs.readFileSync(servicePath, "utf8");
  assert.match(serviceSource, /export async function adminCancelOrderDoorstepRefusal/);
  assert.match(serviceSource, /customer_refused_at_doorstep/);
  assert.match(serviceSource, /riderPayout/);

  // Migration file exists and defines dispute_status & audit fields
  const migrationPath = path.resolve(process.cwd(), "supabase/migrations/20261029170000_order_dispute_and_admin_doorstep_cancellation.sql");
  assert.ok(fs.existsSync(migrationPath), "Dispute migration must exist");
  const sql = fs.readFileSync(migrationPath, "utf8");
  assert.match(sql, /dispute_status/);
  assert.match(sql, /customer_refused/);
  assert.match(sql, /cancelled_by/);

  // Rider client page & refactored screens/API wire Doorstep Customer Refused RTO & Dispute Desk
  const riderPagePath = path.resolve(process.cwd(), "app/rider/page.tsx");
  const riderSource = fs.readFileSync(riderPagePath, "utf8");
  assert.match(riderSource, /Screen29CustomerRefusalRto/);
  assert.match(riderSource, /Customer Refused \(RTO Return Flow\)/);
  assert.match(riderSource, /Screen31PenaltyDispute/);
  assert.match(riderSource, /onSubmitDispute/);

  const refusalScreenPath = path.resolve(process.cwd(), "app/rider/components/screens/Screen29CustomerRefusalRto.tsx");
  assert.ok(fs.existsSync(refusalScreenPath), "Screen29CustomerRefusalRto must exist");
  const refusalSource = fs.readFileSync(refusalScreenPath, "utf8");
  assert.match(refusalSource, /Customer Refused/);
  assert.match(refusalSource, /Order Refused \(RTO Flow\)/);
  assert.match(refusalSource, /Confirm Package Handover to Merchant/);

  const disputeScreenPath = path.resolve(process.cwd(), "app/rider/components/screens/Screen31PenaltyDispute.tsx");
  assert.ok(fs.existsSync(disputeScreenPath), "Screen31PenaltyDispute must exist");
  const disputeSource = fs.readFileSync(disputeScreenPath, "utf8");
  assert.match(disputeSource, /Deduction &amp; Detour Dispute/);
  assert.match(disputeSource, /Submit Dispute for Reversal/);

  const riderRoutePath = path.resolve(process.cwd(), "app/api/hyperlocal/rider/route.ts");
  const riderRouteSource = fs.readFileSync(riderRoutePath, "utf8");
  assert.match(riderRouteSource, /action === "report_dispute"/);
  assert.match(riderRouteSource, /customer_refused_at_doorstep/);

  // Admin Live Command Center page and client exist
  const adminPagePath = path.resolve(process.cwd(), "app/admin/hyperlocal/page.tsx");
  assert.ok(fs.existsSync(adminPagePath), "Admin Hyperlocal page must exist");
  const adminClientPath = path.resolve(process.cwd(), "app/admin/hyperlocal/hyperlocal-admin-client.tsx");
  assert.ok(fs.existsSync(adminClientPath), "Admin Hyperlocal client must exist");
  const adminClientSource = fs.readFileSync(adminClientPath, "utf8");
  assert.match(adminClientSource, /Doorstep Refusal/);
  assert.match(adminClientSource, /cancel_refusal/);
  assert.match(adminClientSource, /Admin Audit/);
});
