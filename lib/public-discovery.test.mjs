import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { canonicalCategorySlug, categorySlugForBusinessType, cityMatches, hasUsablePublicDiscoveryLocation, haversineKm, paginate, publicEligible, rankBusinesses, resolveCategory, slugify, slugifyCity, uniqueBusinessSlug } from "./public-discovery-domain.ts";

const read = (p) => readFile(new URL(p, import.meta.url), "utf8");
const business = (id, ratingAverage, reviewCount, extra = {}) => ({
  businessId: id, name: id, type: "Sweet Shop", slug: id, address: "Main Road", locality: null,
  city: "Bahraich", district: null, state: "Uttar Pradesh", pincode: null, latitude: 27.57,
  longitude: 81.6, googleReviewUrl: null, ratingAverage, reviewCount,
  latestReviewAt: "2026-10-06T00:00:00Z", publicCitySlug: "bahraich", ...extra,
});

test("public eligibility requires each existing active state and rejects deletion/expiry", () => {
  const active = { status: "active", merchantStatus: "active", qrStatus: "active", expiry: null, deletedAt: null };
  assert.equal(publicEligible(active), true);
  assert.equal(publicEligible({ ...active, status: "suspended" }), false);
  assert.equal(publicEligible({ ...active, merchantStatus: "pending" }), false);
  assert.equal(publicEligible({ ...active, qrStatus: "disabled" }), false);
  assert.equal(publicEligible({ ...active, deletedAt: "2026-10-01" }), false);
  assert.equal(publicEligible({ ...active, expiry: "2020-01-01" }), false);
  assert.equal(publicEligible({ ...active, expiry: "2030-01-01" }), true);
});

test("slug candidates normalize accents/special characters and always have a fallback", () => {
  assert.equal(slugify("Crème & Sweets!"), "creme-sweets");
  assert.equal(slugify("!!!"), "business");
  assert.equal(uniqueBusinessSlug("Deepak Sweets", []), "deepak-sweets");
  assert.equal(uniqueBusinessSlug("Deepak Sweets", ["deepak-sweets"]), "deepak-sweets-2");
  assert.equal(uniqueBusinessSlug("Deepak Sweets", ["deepak-sweets", "deepak-sweets-2"]), "deepak-sweets-3");
});

test("category aliases and canonical business types are accepted", () => {
  assert.deepEqual(resolveCategory("sweet-shops"), ["Sweet Shop", "Cake Shop"]);
  assert.ok(resolveCategory("restaurants").includes("Restaurant"));
  assert.deepEqual(resolveCategory("salons"), ["Salon", "Beauty Parlour", "Barber Shop"]);
  assert.deepEqual(resolveCategory("library"), ["Library"]);
  assert.deepEqual(resolveCategory("unknown-category"), []);
  assert.equal(canonicalCategorySlug("sweet-shop"), "sweet-shops");
  assert.equal(canonicalCategorySlug("restaurants"), "restaurants");
  assert.equal(categorySlugForBusinessType("Cake Shop"), "sweet-shops");
  assert.equal(categorySlugForBusinessType("Library"), "libraries");
  assert.equal(canonicalCategorySlug("library"), "libraries");
  assert.equal(canonicalCategorySlug("Furniture Stores"), "furniture-stores");
  assert.equal(canonicalCategorySlug("jewelry-stores"), "jewelry-stores");
  assert.equal(canonicalCategorySlug("unknown-category"), null);
});

test("city matching canonicalizes case and punctuation without matching null locations", () => {
  assert.equal(cityMatches("New Delhi", "new-delhi"), true);
  assert.equal(cityMatches("Bahraich", "BAHRAICH"), true);
  assert.equal(slugifyCity("  Prayagraj  "), "prayagraj");
  assert.equal(slugifyCity("!!!"), "");
  assert.equal(cityMatches(null, "business"), false);
  assert.equal(cityMatches("Lucknow", "bahraich"), false);
});

test("only complete canonical-category city locations enter public listings", () => {
  const valid = business("verified-shop", 4, 2, { pincode: "271801" });
  assert.equal(hasUsablePublicDiscoveryLocation(valid, "bahraich"), true);
  assert.equal(hasUsablePublicDiscoveryLocation({ ...valid, city: null }, "bahraich"), false);
  assert.equal(hasUsablePublicDiscoveryLocation({ ...valid, state: null }, "bahraich"), false);
  assert.equal(hasUsablePublicDiscoveryLocation({ ...valid, pincode: "12345" }, "bahraich"), false);
  assert.equal(hasUsablePublicDiscoveryLocation({ ...valid, type: "Unlisted" }, "bahraich"), false);
  assert.equal(hasUsablePublicDiscoveryLocation({ ...valid, city: "Lucknow" }, "bahraich"), false);
});

test("rating confidence prevents tiny perfect samples dominating supported strong ratings", () => {
  const ranked = rankBusinesses([
    business("tiny-perfect", 5, 1), business("supported-48", 4.8, 100), business("supported-45", 4.5, 40),
  ], { now: Date.parse("2026-10-07T00:00:00Z") });
  assert.deepEqual(ranked.map((item) => item.businessId), ["supported-48", "supported-45", "tiny-perfect"]);
  assert.ok(ranked[0].adjustedRating > ranked[2].adjustedRating);
});

test("zero review businesses rank after rated businesses and receive no fabricated rating", () => {
  const ranked = rankBusinesses([business("none", null, 0), business("one", 5, 1)]);
  assert.equal(ranked.at(-1).businessId, "none");
  assert.equal(ranked.find((item) => item.businessId === "none").adjustedRating, 0);
});

test("sorting is deterministic, supports count/rating/distance and stable business ID tie breaker", () => {
  const sameA = business("a", 4, 20); const sameB = business("b", 4, 20);
  assert.deepEqual(rankBusinesses([sameB, sameA]).map((item) => item.businessId), ["a", "b"]);
  const nearest = rankBusinesses([business("far", 5, 10, { latitude: 28, longitude: 82 }), business("near", 3, 1)], { sort: "nearest", lat: 27.57, lng: 81.6 });
  assert.equal(nearest[0].businessId, "near");
  const missingLocation = rankBusinesses([business("located", 2, 1), business("unlocated", 5, 2, { latitude: null, longitude: null })], { sort: "nearest", lat: 27.57, lng: 81.6 });
  assert.equal(missingLocation[0].businessId, "located");
  const most = rankBusinesses([business("low", 3, 100), business("high", 5, 2)], { sort: "most-reviewed" });
  assert.equal(most[0].businessId, "low");
  const highest = rankBusinesses([business("low", 3, 100), business("high", 5, 2)], { sort: "highest-rated" });
  assert.equal(highest[0].businessId, "high");
});

test("filters and pagination handle query, rating thresholds, empty data, and bounds", () => {
  const items = [business("sweet-main", 4.5, 12), business("other", 3, 8, { address: "Market" })];
  assert.equal(rankBusinesses(items, { q: "main", minRating: 4 }).length, 1);
  assert.equal(rankBusinesses(items, { q: "missing" }).length, 0);
  assert.deepEqual(paginate([], 20), { items: [], currentPage: 1, totalPages: 1, total: 0 });
  const pages = paginate(items, 99, 1);
  assert.deepEqual({ currentPage: pages.currentPage, totalPages: pages.totalPages, total: pages.total }, { currentPage: 2, totalPages: 2, total: 2 });
});

test("distance uses geographic coordinates and gracefully omits unknown coordinates", () => {
  const km = haversineKm(27.57, 81.6, 27.58, 81.6);
  assert.ok(km > 1 && km < 2);
  const result = rankBusinesses([business("unknown", 4, 1, { latitude: null, longitude: null })], { sort: "nearest", lat: 27.5, lng: 81.5 });
  assert.equal(result[0].distanceKm, null);
});

test("database RPC and server sanitizer preserve security boundary and review semantics", async () => {
  const [migration, locationMigration, dataAccess, profile, listing] = await Promise.all([
    read("../supabase/migrations/20261007100000_public_business_discovery.sql"),
    read("../supabase/migrations/20261007120000_verified_public_discovery_location.sql"),
    read("./public-discovery.ts"), read("../app/[city]/[category]/[businessSlug]/page.tsx"), read("../app/[city]/[category]/(listing)/page.tsx"),
  ]);
  assert.match(migration, /b\.status in \('active', 'expiring soon'\)/i);
  assert.match(migration, /b\.merchant_status = 'active'/i);
  assert.match(migration, /b\.qr_status = 'active'/i);
  assert.match(migration, /b\.deleted_at is null/i);
  assert.match(migration, /b\.expiry is null or b\.expiry >= current_date/i);
  assert.match(locationMigration, /b\.discovery_location_verified_at is not null/i);
  assert.match(locationMigration, /btrim\(coalesce\(b\.city, ''\)\) <> ''/i);
  assert.match(locationMigration, /btrim\(coalesce\(b\.state, ''\)\) <> ''/i);
  assert.match(locationMigration, /b\.pincode ~ '\^\[0-9\]\{6\}\$'/i);
  assert.match(migration, /r\.status = 'submitted'[\s\S]*?rs\.review_status = 'submitted'[\s\S]*?rs\.trustit_status = 'submitted'/i);
  assert.match(migration, /grant execute on function public\.get_public_trustit_businesses\(text, text\) to service_role/i);
  assert.match(migration, /revoke all on function public\.get_public_trustit_businesses\(text, text\) from public, anon, authenticated/i);
  assert.match(migration, /alter table public\.business_public_slugs enable row level security/i);
  assert.match(migration, /on public\.trustit_reviews\(business_id, submitted_at desc\)[\s\S]*?where status = 'submitted'/i);
  assert.match(migration, /create trigger businesses_assign_public_slug[\s\S]*?after insert on public\.businesses/i);
  assert.match(migration, /for r in select id, name from public\.businesses order by id/i);
  assert.doesNotMatch(migration, /grant select .*public\.businesses.*anon/i);
  assert.doesNotMatch(migration, /grant select .*trustit_reviews.*anon/i);
  assert.doesNotMatch(dataAccess, /customer_mobile|customer_name|review_text|birthday|anniversary|owner|plan|subscription/i);
  assert.match(dataAccess, /host === "google\.com" \|\| host\.endsWith\("\.google\.com"\)/);
  assert.match(profile, /business\.name/);
  assert.match(profile, /business\.googleReviewUrl/);
  assert.doesNotMatch(profile, /customer_mobile|customer_name|review_text|business\.owner|business\.plan/);
  assert.match(listing, /page\.total/);
  assert.match(listing, /Get directions/);
  assert.match(listing, /No Trustit reviews yet/);
  assert.match(listing, /No businesses are currently listed in this location\./);
  assert.match(listing, /key=\{business\.slug\}/);
  assert.doesNotMatch(listing, /key=\{business\.businessId\}/);
});
