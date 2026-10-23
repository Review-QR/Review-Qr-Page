import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { businessAddressSchema, discoveryMetadata, serializeJsonLd, TRUSTIT_SITE_URL } from "./public-discovery-seo.ts";
import { buildSitemapIndexXml, buildSitemapUrlsetXml, PUBLIC_SITEMAP_CACHE_CONTROL, SITEMAP_PAGE_SIZE, sitemapShardCount } from "./public-discovery-sitemap.ts";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("SEO metadata uses production canonical URLs and real supplied content", () => {
  const metadata = discoveryMetadata({
    title: "Sweet Shops in Bahraich | Trustit",
    description: "Explore 1 eligible sweet shop business in Bahraich.",
    canonicalPath: "/bahraich/sweet-shops",
  });
  assert.equal(metadata.alternates.canonical, `${TRUSTIT_SITE_URL}/bahraich/sweet-shops`);
  assert.equal(metadata.title, "Sweet Shops in Bahraich | Trustit");
  assert.equal(metadata.description, "Explore 1 eligible sweet shop business in Bahraich.");
  assert.equal(metadata.openGraph.url, metadata.alternates.canonical);
  assert.equal(metadata.openGraph.title, metadata.title);
  assert.equal(metadata.openGraph.description, metadata.description);
  assert.equal(metadata.twitter.card, "summary");
  assert.equal(metadata.twitter.title, metadata.title);
  assert.equal(metadata.twitter.description, metadata.description);
});

test("root metadata keeps all Google Search Console ownership tokens", async () => {
  const layout = await read("../app/layout.tsx");
  assert.match(layout, /google:\s*\[[\s\S]*?"3cr4sgr9Sb9KUXCZw-XkxgFRA4ogFDear6fbfMFsAGk"[\s\S]*?"KeQuu8AC8YzT9yIZv_scLYEMSYA4TL8YEnuwUlm4Fq4"[\s\S]*?"8HE1HSedt2c2hDcf3pOeEhXHMH-NSSEoWZA0KpTORwU"[\s\S]*?\]/);
});

test("business JSON-LD contains only present public location values and escapes script-breaking input", () => {
  const item = {
    businessId: "internal-id", name: "Deepak </script><script>alert(1)</script>", type: "Sweet Shop", slug: "deepak-sweets-bahraich",
    address: "Pani Tanki", locality: "Pipal Chauraha", city: "Bahraich", district: "Bahraich", state: "Uttar Pradesh", pincode: "271801",
    latitude: 27.5, longitude: 81.5, googleReviewUrl: null, reviewCount: 9, ratingAverage: 4, latestReviewAt: null,
  };
  const schema = businessAddressSchema(item, "/bahraich/sweet-shops/deepak-sweets-bahraich");
  assert.equal(schema.url, `${TRUSTIT_SITE_URL}/bahraich/sweet-shops/deepak-sweets-bahraich`);
  assert.equal(schema.geo.latitude, 27.5);
  assert.equal(schema.address.postalCode, "271801");
  assert.equal("telephone" in schema, false);
  assert.equal("aggregateRating" in schema, false);
  const serialized = serializeJsonLd(schema);
  const parsed = JSON.parse(serialized);
  assert.equal(parsed["@type"], "LocalBusiness");
  assert.equal(parsed.name, item.name);
  assert.doesNotMatch(serialized, /<\/script>/i);
  assert.match(serialized, /\\u003c/);
  assert.doesNotMatch(serialized, /internal-id|reviewCount|customer|mobile/i);
});

test("sitemap and robots are bounded and use the secure service-side discovery path", async () => {
  const [sitemap, sitemapShard, sitemapBuilder, robots, dataAccess, migration, correction, scalableMigration, profile, listing] = await Promise.all([
    read("../app/sitemap.xml/route.ts"), read("../app/sitemaps/[shard]/route.ts"), read("./public-discovery-sitemap.ts"), read("../app/robots.ts"), read("./public-discovery.ts"),
    read("../supabase/migrations/20261007140000_public_discovery_sitemap_rpc.sql"),
    read("../supabase/migrations/20261007143000_fix_public_discovery_sitemap_rpc.sql"),
    read("../supabase/migrations/20261007160000_scalable_public_discovery.sql"),
    read("../app/[city]/[category]/[businessSlug]/page.tsx"), read("../app/[city]/[category]/(listing)/page.tsx"),
  ]);
  assert.match(sitemap, /getPublicSitemapEntryCount/);
  assert.match(sitemap, /PUBLIC_SITEMAP_CACHE_CONTROL/);
  assert.match(sitemapShard, /getPublicSitemapEntries/);
  assert.match(sitemapShard, /PUBLIC_SITEMAP_CACHE_CONTROL/);
  assert.match(sitemapBuilder, /buildSitemapUrlsetXml/);
  assert.match(sitemapBuilder, /public, max-age=0, s-maxage=300, stale-while-revalidate=600/);
  assert.match(sitemap + sitemapShard, /status:\s*503/);
  assert.match(sitemap + sitemapShard, /Cache-Control[^\n]*no-store/);
  assert.match(dataAccess, /get_public_trustit_sitemap_entries_page/);
  assert.match(dataAccess, /p_limit: limit/);
  assert.equal(SITEMAP_PAGE_SIZE, 20000);
  assert.equal(sitemapShardCount(0), 1);
  assert.equal(sitemapShardCount(20000), 1);
  assert.equal(sitemapShardCount(20001), 2);
  const xml = buildSitemapUrlsetXml([
    { citySlug: "bahraich", categorySlug: "sweet-shops", businessSlug: "deepak-sweets", primaryCategorySlug: "sweet-shops", categoryFirst: true },
    { citySlug: "bahraich", categorySlug: "restaurants", businessSlug: "another", primaryCategorySlug: "sweet-shops", categoryFirst: false },
  ]);
  assert.equal((xml.match(/<url>/g) ?? []).length, 2);
  const trustitOnlyXml = buildSitemapUrlsetXml([], true);
  assert.match(trustitOnlyXml, /https:\/\/trustitreview\.com\/trustit/);
  assert.equal((trustitOnlyXml.match(/<url>/g) ?? []).length, 8);
  for (const path of ["", "pricing", "privacy-policy", "terms", "refund-policy", "contact", "about"]) {
    assert.match(trustitOnlyXml, new RegExp(`https://trustitreview\\.com/${path}`));
  }
  assert.match(trustitOnlyXml, /^<\?xml version="1\.0" encoding="UTF-8"\?><urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">[\s\S]*<\/urlset>$/);
  const indexXml = buildSitemapIndexXml(20001);
  assert.match(indexXml, /^<\?xml version="1\.0" encoding="UTF-8"\?><sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">[\s\S]*<\/sitemapindex>$/);
  assert.match(indexXml, /\/sitemaps\/1\.xml/);
  assert.equal((indexXml.match(/<sitemap>/g) ?? []).length, 2);
  assert.match(PUBLIC_SITEMAP_CACHE_CONTROL, /s-maxage=300/);
  assert.match(PUBLIC_SITEMAP_CACHE_CONTROL, /stale-while-revalidate=600/);
  assert.doesNotMatch(xml, /\/admin|business_id|internal-id/);
  assert.match(migration, /security definer[\s\S]*?set search_path = ''/i);
  assert.match(migration, /grant execute[\s\S]*to service_role/i);
  assert.match(migration, /revoke all[\s\S]*from public, anon, authenticated/i);
  assert.match(correction, /generate_subscripts\(p_business_types, 1\)/i);
  assert.match(correction, /grant execute[\s\S]*to service_role/i);
  assert.match(scalableMigration, /get_public_trustit_sitemap_entries_page/i);
  assert.match(scalableMigration, /p_limit > 20000/i);
  assert.match(scalableMigration, /revoke all on function public\.get_public_trustit_sitemap_entries_page[\s\S]*from public, anon, authenticated/i);
  assert.match(robots, /sitemap\.xml/);
  assert.match(robots, /"\/admin"/);
  assert.doesNotMatch(robots, /disallow:\s*\[\s*"\/"/);
  assert.match(profile, /businessAddressSchema/);
  assert.match(profile, /serializeJsonLd/);
  assert.match(profile, /discoveryMetadata/);
  assert.match(profile, /if \(!business\) notFound\(\)/);
  assert.match(listing, /discoveryMetadata/);
  assert.match(listing, /permanentRedirect/);
});

test("discovery 404s are not streamed through a loading boundary", async () => {
  await assert.rejects(read("../app/[city]/[category]/(listing)/loading.tsx"), { code: "ENOENT" });
  const notFound = await read("../app/[city]/[category]/not-found.tsx");
  assert.match(notFound, /This Trustit discovery page is unavailable/);
});

test("private routes default to noindex and filtered listing URLs are noindex", async () => {
  const [layout, listing, trustit, sitemapShard] = await Promise.all([
    read("../app/layout.tsx"),
    read("../app/[city]/[category]/(listing)/page.tsx"),
    read("../app/trustit/page.tsx"),
    read("../app/sitemaps/[shard]/route.ts"),
  ]);
  assert.match(layout, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/);
  assert.match(listing, /Object\.keys\(query\)\.length === 0/);
  assert.match(listing, /focus-visible:outline/);
  const controls = await read("../app/[city]/[category]/discovery-controls.tsx");
  assert.match(controls, /<label[^>]*>Search this area/);
  assert.match(controls, /<button[^>]*type="submit">Apply/);
  assert.match(controls, /focus-visible:outline/);
  const profile = await read("../app/[city]/[category]/[businessSlug]/page.tsx");
  assert.match(profile, /id="google-review-page"/);
  assert.match(profile, /Trustit · \{business\.reviewCount\}/);
  assert.match(profile, /focus-visible:outline/);
  assert.match(trustit, /robots:\s*\{ index: true, follow: true \}/);
  assert.match(trustit, /alternates:\s*\{ canonical: trustitCanonical \}/);
  assert.match(trustit, /openGraph:/);
  assert.match(trustit, /twitter:/);
  const home = await read("../app/page.tsx");
  assert.match(home, /canonicalPath:\s*"\/"/);
  assert.match(home, /robots:\s*\{ index: true, follow: true \}/);
  assert.match(home, /name="city"/);
  assert.match(home, /name="category"/);
  assert.match(home, /Search local businesses/i);
  assert.match(sitemapShard, /shardId === 0/);
  assert.match(await read("./public-discovery-sitemap.ts"), /includeTrustitLandingPage/);
});

test("root metadata preserves each verified Google Search Console token exactly once", async () => {
  const layout = await read("../app/layout.tsx");
  const tokens = [
    "3cr4sgr9Sb9KUXCZw-XkxgFRA4ogFDear6fbfMFsAGk",
    "KeQuu8AC8YzT9yIZv_scLYEMSYA4TL8YEnuwUlm4Fq4",
    "8HE1HSedt2c2hDcf3pOeEhXHMH-NSSEoWZA0KpTORwU",
  ];
  for (const token of tokens) {
    assert.equal((layout.match(new RegExp(`"${token}"`, "g")) ?? []).length, 1, `expected exactly one GSC token: ${token}`);
  }
});

test("sitemap shards remain bounded and duplicate-free at 100-city, 33-category scale", () => {
  const entries = [];
  for (let city = 0; city < 100; city += 1) {
    for (let category = 0; category < 33; category += 1) {
      for (let business = 0; business < 10; business += 1) {
        const citySlug = `city-${city}`;
        const categorySlug = `category-${category}`;
        entries.push({
          citySlug,
          categorySlug,
          businessSlug: `business-${business}`,
          primaryCategorySlug: categorySlug,
          categoryFirst: business === 0,
        });
      }
    }
  }
  assert.equal(entries.length, 33000);
  assert.equal(sitemapShardCount(entries.length), 2);
  const sitemapUrls = new Set();
  for (let offset = 0; offset < entries.length; offset += SITEMAP_PAGE_SIZE) {
    const pageEntries = entries.slice(offset, offset + SITEMAP_PAGE_SIZE);
    const xml = buildSitemapUrlsetXml(pageEntries);
    const urls = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
    assert.ok(urls.length <= 40000);
    for (const url of urls) {
      assert.equal(sitemapUrls.has(url), false, `duplicate URL: ${url}`);
      sitemapUrls.add(url);
    }
  }
  assert.equal(sitemapUrls.size, 36300);
  assert.equal((buildSitemapIndexXml(entries.length).match(/<sitemap>/g) ?? []).length, 2);
});
