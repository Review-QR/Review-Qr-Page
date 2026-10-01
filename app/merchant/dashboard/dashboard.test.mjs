import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("merchant dashboard requires the authenticated active merchant context", async () => {
  const page = await read("./page.tsx");
  const layout = await read("./layout.tsx");
  const auth = await read("../../../lib/merchant-auth.ts");
  assert.match(page, /await requireActiveMerchant\(\)/);
  assert.match(layout, /await requireActiveMerchant\(\)/);
  assert.match(auth, /\.eq\("merchant_status", "active"\)/);
  assert.match(auth, /\.is\("deleted_at", null\)/);
  assert.match(auth, /if \(!merchant\) redirect\("\/merchant\/login"\)/);
});

test("merchant dashboard scopes all RPCs and database reads to the authorized business ID", async () => {
  const page = await read("./page.tsx");
  assert.match(page, /p_business_id: merchant\.businessId/);
  assert.match(page, /\.eq\("business_id", merchant\.businessId\)/g);
  assert.match(page, /get_merchant_dashboard_stats/);
  assert.match(page, /get_merchant_scan_activity/);
  assert.match(page, /get_merchant_trustit_reviews/);
});

test("dashboard presents exactly the requested four primary statistics and no today metric", async () => {
  const page = await read("./page.tsx");
  const primary = page.slice(page.indexOf("aria-label=\"Merchant statistics\""), page.indexOf("!statsResult.error"));
  for (const label of ["Total Scans", "This Month's Scans", "Total Reviews", "Average Rating"]) assert.ok(primary.includes(label));
  assert.doesNotMatch(primary, /Today's Scans|Today’s Scans/i);
  assert.match(primary, /— \/ 5/);
});

test("review analytics aggregate only submitted reviews for the authenticated business", async () => {
  const migration = await read("../../../supabase/migrations/20261001150000_merchant_dashboard_analytics.sql");
  assert.match(migration, /function public\.get_merchant_dashboard_stats/);
  assert.match(migration, /business\.id = p_business_id/);
  assert.match(migration, /merchant\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(migration, /business\.deleted_at is null/);
  assert.match(migration, /review\.status = 'submitted'/);
  for (const rating of [1, 2, 3, 4, 5]) assert.match(migration, new RegExp(`rating = ${rating}\\)::bigint as rating_${rating}_count`));
  assert.match(migration, /avg\(review\.rating\)/);
});

test("experience metrics use the stored selected labels and order counts descending", async () => {
  const migration = await read("../../../supabase/migrations/20261001150000_merchant_dashboard_analytics.sql");
  assert.match(migration, /review_session_experiences as experience/);
  assert.match(migration, /experience\.category_label_snapshot as label/);
  assert.match(migration, /order by counts\.selection_count desc/);
  assert.match(migration, /'\[\]'::jsonb/);
});

test("recent dashboard reviews use the existing secure RPC and show only a small preview", async () => {
  const page = await read("./page.tsx");
  assert.match(page, /rpc\("get_merchant_trustit_reviews"/);
  assert.match(page, /\.limit\(5\)/);
  assert.doesNotMatch(page, /\.from\("trustit_reviews"\)/);
  assert.match(page, /Customer: \{review\.customer_name/);
  assert.match(page, /selected_experiences\.map\(\(point\) => `• \$\{point\}`\)\.join\(" "\)/);
  assert.match(page, /View All Reviews/);
  assert.doesNotMatch(page, /customer_mobile|family_members|special_occasions/i);
});

test("scan analytics uses real timestamped scan events and supports the required ranges", async () => {
  const migration = await read("../../../supabase/migrations/20261001150000_merchant_dashboard_analytics.sql");
  const component = await read("./scan-analytics.tsx");
  assert.match(migration, /create table public\.business_scan_events/);
  assert.match(migration, /insert into public\.business_scan_events/);
  assert.match(migration, /event\.scanned_at/);
  assert.match(migration, /merchant\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(component, /\[7, 30, 90\]/);
  assert.match(component, /No scan data yet/);
  assert.match(component, /range === 90/);
  assert.match(component, /Array\.from\(\{ length: 13 \}, \(_, week\)/);
});

test("scan event rows are private and scan writes preserve existing active QR semantics", async () => {
  const migration = await read("../../../supabase/migrations/20261001150000_merchant_dashboard_analytics.sql");
  assert.match(migration, /alter table public\.business_scan_events enable row level security/);
  assert.match(migration, /revoke all on table public\.business_scan_events from public, anon, authenticated, service_role/);
  assert.match(migration, /business\.qr_status, 'disabled'\)\) = 'active'/);
  assert.match(migration, /business\.expiry is null or business\.expiry >= current_date/);
  assert.match(migration, /business\.deleted_at is null/);
});

test("subscription and payment summary use existing records scoped to the authenticated business", async () => {
  const page = await read("./page.tsx");
  assert.match(page, /from\("subscriptions"\)[\s\S]*?\.eq\("business_id", merchant\.businessId\)/);
  assert.match(page, /from\("payment_records"\)[\s\S]*?\.eq\("business_id", merchant\.businessId\)[\s\S]*?\.limit\(5\)/);
  assert.match(page, /Renew Plan/);
  assert.match(page, /View All Payments/);
});

test("QR card reuses the existing business scan identity and exposes view, download, and test actions", async () => {
  const page = await read("./page.tsx");
  const qr = await read("./my-qr-code.tsx");
  assert.match(page, /<MyQrCode[\s\S]*?businessId=\{merchant\.businessId\}/);
  assert.match(qr, /\/r\/\$\{encodeURIComponent\(businessId\)\}/);
  assert.match(qr, /Download QR/);
  assert.match(qr, /Test Scan/);
  assert.match(page, /\/merchant\/dashboard\/qr/);
});

test("dashboard empty states avoid invalid numeric output and preserve existing product pages", async () => {
  const page = await read("./page.tsx");
  assert.match(page, /Number\.isFinite/);
  assert.match(page, /No reviews yet/);
  assert.match(page, /No customer feedback yet/);
  assert.match(page, /No payments yet/);
  assert.match(await read("./reviews/page.tsx"), /get_merchant_trustit_reviews/);
  assert.match(await read("./business/page.tsx"), /requireActiveMerchant/);
  assert.match(await read("./qr/page.tsx"), /requireActiveMerchant/);
});

test("dashboard is responsive and navigation keeps existing merchant routes", async () => {
  const page = await read("./page.tsx");
  const layout = await read("./layout.tsx");
  assert.match(page, /sm:grid-cols-2/);
  assert.match(page, /xl:grid-cols/);
  for (const path of ["business", "qr", "reviews", "subscription", "payments"]) assert.ok(layout.includes(`/merchant/dashboard/${path}`));
  assert.match(layout, /label: "Analytics"/);
});
