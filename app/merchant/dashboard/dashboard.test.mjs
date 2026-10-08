test("dashboard keeps rendering with built-in QR designs and only reads optional saved artwork", async () => {
  const page = await read("./page.tsx");
  assert.match(page, /let designAssets:[\s\S]*?try \{[\s\S]*?getPersistedBusinessQrDesignAssets\(merchant\.businessId, merchant\.businessType\)[\s\S]*?catch \(error\)/);
  assert.doesNotMatch(page, /getBusinessQrDesignAssets\(/);
  assert.match(page, /Custom artwork is temporarily unavailable\. Your QR code and standard poster designs are still ready\./);
  assert.match(page, /initialDesignError=\{designAssetError\}/);
  assert.match(page, /designAssets=\{designAssets\}/);
  assert.match(page, /requireActiveMerchant\(\)/);
  assert.match(page, /<MyQrCode/);
  assert.match(page, /Trustit QR artwork unavailable while rendering merchant dashboard/);
  assert.doesNotMatch(page, /console\.error\([^\n]*error\.message/);
});

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
  for (const label of ["Total Scans", "This Month’s Scans", "Total Reviews", "Average Rating"]) assert.ok(primary.includes(label));
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
  const reviewCard = await read("./review-card.tsx");
  assert.match(page, /rpc\("get_merchant_trustit_reviews"/);
  assert.match(page, /\.limit\(5\)/);
  assert.doesNotMatch(page, /\.from\("trustit_reviews"\)/);
  assert.match(page, /<ReviewCard[\s\S]*?review=\{review\}/);
  assert.match(reviewCard, /Customer review/);
  assert.match(reviewCard, /Customer highlighted points/);
  assert.match(reviewCard, /review\.selected_experiences\.map/);
  assert.match(reviewCard, /const tone = review\.rating <= 2 \? "negative" : review\.rating === 3 \? "mixed" : "positive"/);
  assert.match(page, /View All Reviews/);
  assert.doesNotMatch(reviewCard, /customer_mobile|family_members|special_occasions/i);
});

test("scan analytics uses real timestamped scan events and supports the required ranges", async () => {
  const migration = await read("../../../supabase/migrations/20261001150000_merchant_dashboard_analytics.sql");
  const component = await read("./scan-analytics.tsx");
  assert.match(migration, /create table public\.business_scan_events/);
  assert.match(migration, /insert into public\.business_scan_events/);
  assert.match(migration, /event\.scanned_at/);
  assert.match(migration, /merchant\.user_id = \(select auth\.uid\(\)\)/);
  assert.match(component, /\[7, 30, 90\]/);
  assert.match(component, /Not enough scan history yet/);
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
  assert.match(page, /View all →/);
});

test("QR card reuses the existing business scan identity and exposes view, download, and test actions", async () => {
  const page = await read("./page.tsx");
  const qr = await read("./my-qr-code.tsx");
  const qrUtility = await read("../../../lib/trustit-qr.ts");
  assert.match(page, /<MyQrCode[\s\S]*?businessId=\{merchant\.businessId\}/);
  assert.match(qr, /buildTrustitReviewUrl\(origin, businessId\)/);
  assert.match(qrUtility, /new URL\(`\/r\/\$\{encodeURIComponent\(businessId\)\}`/);
  assert.match(qrUtility, /api\.qrserver\.com\/v1\/create-qr-code/);
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
  const dashboardCss = await read("./dashboard.css");
  const navigation = await read("./merchant-navigation.tsx");
  assert.match(page, /sm:grid-cols-2/);
  assert.match(dashboardCss, /merchant-analytics-grid\s*\{\s*display:\s*grid/);
  assert.match(page, /<MyQrCode[\s\S]*?templateName=\{currentTemplate\.name\}/);
  assert.ok(page.indexOf("<MyQrCode") < page.indexOf("<ScanAnalytics"), "the merchant QR appears near the top of the dashboard");
  assert.match(await read("./my-qr-code.tsx"), /Change Template/);
  assert.doesNotMatch(page, /min-w-\[400px\]/, "dashboard tables must not force a phone-width overflow");
  for (const path of ["business", "qr", "reviews", "subscription", "payments", "profile"]) assert.ok(navigation.includes(`/merchant/dashboard/${path}`));
  assert.match(navigation, /label: "Analytics"/);
  assert.match(navigation, /pathname === "\/merchant\/dashboard" && hash === "#scan-analytics"/);
  assert.match(navigation, /pathname === item\.href && hash !== "#scan-analytics"/);
  assert.match(navigation, /onClick=\{\(\) => setHash\(item\.href\.endsWith\("#scan-analytics"\)/);
});

test("My QR page uses the authenticated merchant identity and loads the saved template preference", async () => {
  const page = await read("./qr/page.tsx");
  const auth = await read("../../../lib/merchant-auth.ts");
  assert.match(page, /await requireActiveMerchant\(\)/);
  assert.match(page, /businessId=\{merchant\.businessId\}/);
  assert.match(page, /businessName=\{merchant\.businessName\}/);
  assert.match(page, /initialTemplate=\{merchant\.qrTemplate\}/);
  assert.match(auth, /qr_template/);
  assert.match(auth, /qrTemplate: business\.qr_template \|\| "template_1"/);
});

test("five Trustit print designs use the required dimensions and one merchant QR", async () => {
  const gallery = await read("./qr/qr-template-gallery.tsx");
  const definitions = await read("./qr/templates.ts");
  const themes = await read("../../../lib/trustit-ai/qr-design-theme.ts");
  const qrUtility = await read("../../../lib/trustit-qr.ts");
  assert.equal((definitions.match(/id: "template_[1-5]"/g) ?? []).length, 5);
  for (const [name, size, orientation, ratio] of [
    ["Classic Portrait", "4 × 6 in", "Portrait", "2 / 3"],
    ["Elegant Portrait", "4 × 6 in", "Portrait", "2 / 3"],
    ["Fresh Portrait", "4 × 6 in", "Portrait", "2 / 3"],
    ["Local Landscape", "6 × 4 in", "Landscape", "3 / 2"],
    ["Modern Landscape", "6 × 4 in", "Landscape", "3 / 2"],
  ]) {
    const row = definitions.slice(definitions.indexOf(`name: "${name}"`)).split("\n", 1)[0];
    assert.ok(row.includes(`printSize: "${size}"`), `${name} print size`);
    assert.ok(row.includes(`orientation: "${orientation}"`), `${name} orientation`);
    assert.ok(row.includes(`ratio: "${ratio}"`), `${name} ratio`);
  }
  assert.match(gallery, /buildTrustitReviewUrl\(origin, businessId\)/);
  assert.match(gallery, /buildTrustitQrImageUrl\(reviewRoute\)/);
  assert.match(qrUtility, /\/r\/\$\{encodeURIComponent\(businessId\)\}/);
  assert.match(gallery, /flex snap-x snap-mandatory gap-4 overflow-x-auto/);
  assert.match(gallery, /onTouch|overflow-x-auto/);
  assert.match(gallery, /Preview/);
  assert.match(gallery, /Choose Your QR Template/);
  assert.match(gallery, /Merchant-specific \{outputFormat\} preview/);
  assert.match(gallery, /data-print-size=\{template\.printSize\}/);
  assert.match(gallery, /data-orientation=\{template\.orientation\}/);
  assert.match(gallery, /data-ratio=\{template\.ratio\}/);
  const trustitMarks = gallery.slice(gallery.indexOf("function TrustitMark"), gallery.indexOf("function GoogleReviewMark"));
  assert.equal((trustitMarks.match(/templateId === "template_[1-5]"/g) ?? []).length, 5);
  for (const component of ["RestaurantPoster", "HotelPoster", "LaundryPoster", "RetailPoster", "SalonPoster"]) {
    assert.match(gallery, new RegExp(`function ${component}\\(`));
  }
  assert.equal((gallery.match(/<CategoryArt iconName=\{category\.iconName\} designFamily=\{category\.designFamily\} designAsset=\{designAsset\} experiences=\{category\.experiences\}/g) ?? []).length, 5);
  assert.match(gallery, /experiences\.slice\(0, 3\)/);
  assert.match(gallery, /Digital · 1080×1350/);
  assert.equal((gallery.match(/<FooterMessage message=\{footer\}/g) ?? []).length, 5);
  for (const kind of ["food", "hotel", "laundry", "retail", "salon", "universal"]) assert.match(themes, new RegExp(`artKind: "${kind}"`), `${kind} business art`);
  assert.equal((gallery.match(/<TrustitMark templateId=/g) ?? []).length, 5);
  assert.equal((gallery.match(/<GoogleMessage/g) ?? []).length, 5);
  assert.match(gallery, /SCAN TO REVIEW/);
  assert.match(gallery, /aria-label="Five stars"/);
  assert.doesNotMatch(gallery, /merchantInitials|logo placeholder|Add Logo|Merchant Logo|merchant_logo|logo_url/i);
  assert.match(qrUtility, /api\.qrserver\.com\/v1\/create-qr-code/);
  assert.match(gallery, /object-contain/);
  assert.match(gallery, /relative z-30 isolate inline-flex shrink-0[^`]*bg-white/);
  assert.match(gallery, /qrStatus, expiry/);
  assert.match(gallery, /status\?\.trim\(\)\.toLowerCase\(\) === "active"/);
});

test("template preference save is authenticated, validated, and bound to the session merchant", async () => {
  const action = await read("./qr/actions.ts");
  const migration = await read("../../../supabase/migrations/20261001170000_merchant_qr_template_preference.sql");
  assert.match(action, /getActiveMerchant\(\)/);
  assert.match(action, /isQrTemplateId\(templateId\)/);
  assert.match(action, /rpc\("set_merchant_qr_template", \{ p_template_id: templateId \}\)/);
  assert.doesNotMatch(action, /businessId\s*:/);
  assert.match(migration, /qr_template text not null default 'template_1'/i);
  assert.match(migration, /business\.id = account\.business_id/i);
  assert.match(migration, /account\.user_id = \(select auth\.uid\(\)\)/i);
  assert.match(migration, /business\.merchant_status = 'active'/i);
  assert.match(migration, /business\.deleted_at is null/i);
  assert.match(migration, /set search_path = ''/i);
  assert.match(migration, /revoke all on function public\.set_merchant_qr_template\(text\)\s+from public, anon, authenticated, service_role/i);
  assert.match(migration, /grant execute on function public\.set_merchant_qr_template\(text\) to authenticated/i);
  assert.doesNotMatch(migration, /enable row level security|create policy|grant .* to anon/i);
});
