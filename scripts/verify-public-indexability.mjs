import assert from "node:assert/strict";

const base = new URL(process.env.TRUSTIT_AUDIT_BASE_URL ?? "https://trustitreview.com");
const privateMarkers = /customer_mobile|customer_name|birthday|anniversary|family_member|service_role|trustit_reviews|business_id|\b[a-f0-9]{8}-[a-f0-9]{4}-[1-5][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}\b/i;
const xmlUnescape = (value) => value.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&apos;/g, "'");

function attributes(tag) {
  return Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*(["'])(.*?)\2/g)].map((match) => [match[1].toLowerCase(), match[3]]));
}

function metaValue(html, key, expected) {
  for (const tag of html.matchAll(/<meta\b[^>]*>/gi)) {
    const values = attributes(tag[0]);
    if (values[key]?.toLowerCase() === expected.toLowerCase()) return values.content ?? "";
  }
  return "";
}

function canonicalValue(html) {
  for (const tag of html.matchAll(/<link\b[^>]*>/gi)) {
    const values = attributes(tag[0]);
    if (values.rel?.split(/\s+/).includes("canonical")) return values.href ?? "";
  }
  return "";
}

async function get(path, { userAgent = "Trustit-SEO-Indexability-Audit/1.0", method = "GET" } = {}) {
  let url = new URL(path, base);
  const redirects = [];
  for (let count = 0; count <= 5; count += 1) {
    const response = await fetch(url, { method, redirect: "manual", headers: { "user-agent": userAgent } });
    if (![301, 302, 303, 307, 308].includes(response.status)) {
      return { response, body: method === "HEAD" ? "" : await response.text(), redirects, finalUrl: url };
    }
    const location = response.headers.get("location");
    assert.ok(location, `${path}: redirect has no Location header`);
    redirects.push(url.href);
    url = new URL(location, url);
  }
  assert.fail(`${path}: exceeded five redirects`);
}

function assertNoindex(page, label) {
  const robots = metaValue(page.body, "name", "robots").toLowerCase();
  const header = page.response.headers.get("x-robots-tag")?.toLowerCase() ?? "";
  assert.match(`${robots},${header}`, /noindex/, `${label}: expected a noindex directive`);
}

function assertIndexablePage(page, path) {
  assert.equal(page.response.status, 200, `${path}: expected HTTP 200`);
  assert.deepEqual(page.redirects, [], `${path}: canonical URL should not redirect`);
  assert.equal(page.finalUrl.href, new URL(path, base).href, `${path}: request URL changed`);
  assert.equal(canonicalValue(page.body), new URL(path, base).href, `${path}: canonical mismatch`);
  const robots = metaValue(page.body, "name", "robots").toLowerCase();
  assert.match(robots, /(?:^|[,\s])index(?:$|[,\s])/, `${path}: page is not indexable`);
  assert.doesNotMatch(robots, /noindex|nofollow/, `${path}: unexpected robots directive`);
  assert.doesNotMatch(page.response.headers.get("x-robots-tag") ?? "", /noindex|nofollow/i, `${path}: X-Robots-Tag blocks crawling`);
  assert.ok(/<title>[^<]+<\/title>/i.test(page.body), `${path}: title missing`);
  assert.ok(metaValue(page.body, "name", "description").length >= 40, `${path}: description missing or too short`);
  assert.ok(metaValue(page.body, "property", "og:title"), `${path}: OpenGraph title missing`);
  assert.ok(metaValue(page.body, "property", "og:description"), `${path}: OpenGraph description missing`);
  assert.equal(metaValue(page.body, "property", "og:url"), new URL(path, base).href, `${path}: OpenGraph URL mismatch`);
  assert.equal(metaValue(page.body, "name", "twitter:card"), "summary", `${path}: Twitter card missing`);
  assert.ok(metaValue(page.body, "name", "twitter:title"), `${path}: Twitter title missing`);
  assert.ok(metaValue(page.body, "name", "twitter:description"), `${path}: Twitter description missing`);
  assert.ok(!privateMarkers.test(page.body), `${path}: private data marker found in public HTML`);
  const htmlWithoutComments = page.body.replace(/<!--[\s\S]*?-->/g, "");
  const heading = htmlWithoutComments.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]*>/g, "").trim();
  assert.ok(heading, `${path}: H1 missing`);
}

const checkedCanonicals = new Set();
const root = await get("/");
assert.equal(root.response.status, 200, "/: expected HTTP 200");
assertIndexablePage(root, "/");
assert.match(root.body, /Search local businesses/i, "/: public discovery homepage is missing");

const admin = await get("/admin");
assertNoindex(admin, "/admin");
assert.ok(admin.response.status < 500, "/admin: protected route should render or redirect safely");

for (const path of ["/login", "/merchant/login", "/merchant/dashboard"]) {
  const page = await get(path);
  assert.ok(page.response.status < 400, `${path}: private route is unexpectedly unavailable`);
  assertNoindex(page, path);
  assert.doesNotMatch(page.response.headers.get("x-robots-tag") ?? "", /(?:^|[,;\s])(?:index|follow)(?:$|[,;\s])/i, `${path}: X-Robots-Tag allows indexing or following`);
}

const listingPath = "/bahraich/sweet-shops";
const listing = await get(listingPath);
assertIndexablePage(listing, listingPath);
checkedCanonicals.add(canonicalValue(listing.body));
assert.ok(/Deepak Sweets Bahraich/.test(listing.body), "eligible live business is missing from the listing");

const trustitPath = "/trustit";
const trustit = await get(trustitPath);
assertIndexablePage(trustit, trustitPath);
assert.equal(checkedCanonicals.has(canonicalValue(trustit.body)), false, "Trustit landing page shares a canonical URL");
checkedCanonicals.add(canonicalValue(trustit.body));

const filtered = await get(`${listingPath}?q=deepak&page=1`);
assert.equal(filtered.response.status, 200, "filtered listing should remain usable");
assertNoindex(filtered, "filtered listing");

const emptyPath = "/bahraich/restaurants";
const empty = await get(emptyPath);
assert.equal(empty.response.status, 200, "known city with an empty category should return 200");
const emptyCategoryHasNoResults = /No businesses are currently listed in this location/i.test(empty.body);
if (emptyCategoryHasNoResults) assertNoindex(empty, "empty category");
else {
  assertIndexablePage(empty, emptyPath);
  checkedCanonicals.add(canonicalValue(empty.body));
}

const profilePath = "/bahraich/sweet-shops/deepak-sweets-bahraich";
const profile = await get(profilePath);
assertIndexablePage(profile, profilePath);
assert.equal(checkedCanonicals.has(canonicalValue(profile.body)), false, "public pages share a canonical URL");
checkedCanonicals.add(canonicalValue(profile.body));
assert.ok(/Deepak Sweets Bahraich/.test(profile.body));
const jsonLdMatch = profile.body.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
assert.ok(jsonLdMatch, "eligible business profile JSON-LD is missing");
const jsonLd = JSON.parse(jsonLdMatch[1]);
assert.equal(jsonLd["@type"], "LocalBusiness");
assert.equal(jsonLd.name, "Deepak Sweets Bahraich");
assert.ok(!privateMarkers.test(JSON.stringify(jsonLd)), "private data marker found in JSON-LD");

for (const path of [
  "/trustit-phase5-invalid-city/sweet-shops",
  "/bahraich/phase5-invalid-category",
  "/bahraich/sweet-shops/phase5-business-does-not-exist",
  "/bahraich/restaurants/deepak-sweets-bahraich",
]) {
  const page = await get(path);
  assert.equal(page.response.status, 404, `${path}: expected a real HTTP 404`);
  assertNoindex(page, path);
}

const robotsResponse = await get("/robots.txt");
assert.equal(robotsResponse.response.status, 200, "/robots.txt: expected HTTP 200");
assert.match(robotsResponse.response.headers.get("content-type") ?? "", /^text\/plain(?:;|$)/i, "/robots.txt: unexpected Content-Type");
assert.match(robotsResponse.body, /Sitemap:\s*https:\/\/trustitreview\.com\/sitemap\.xml/i);
assert.equal([...robotsResponse.body.matchAll(/^Sitemap:\s*(.+)$/gim)].length, 1, "/robots.txt: expected one sitemap reference");
assert.doesNotMatch(robotsResponse.body, /^Disallow:\s*\/(?:sitemap\.xml|sitemaps)(?:\/|\s|$)/im, "/robots.txt blocks the public sitemap");
for (const privatePath of ["/admin", "/merchant", "/businesses", "/login", "/api/"]) {
  assert.match(robotsResponse.body, new RegExp(`Disallow:\\s*${privatePath.replaceAll("/", "\\/")}`, "i"), `/robots.txt: ${privatePath} is not blocked`);
}

const sitemapResponse = await get("/sitemap.xml");
assert.equal(sitemapResponse.response.status, 200, "/sitemap.xml: expected HTTP 200");
assert.deepEqual(sitemapResponse.redirects, [], "/sitemap.xml: unexpected redirect");
assert.equal(sitemapResponse.finalUrl.href, new URL("/sitemap.xml", base).href);
assert.match(sitemapResponse.response.headers.get("content-type") ?? "", /^application\/xml(?:;|$)/i, "/sitemap.xml: unexpected Content-Type");
assert.doesNotMatch(sitemapResponse.response.headers.get("cache-control") ?? "", /no-store/i, "/sitemap.xml: response is marked uncacheable");
assert.match(sitemapResponse.body, /^<\?xml version="1\.0" encoding="UTF-8"\?>/i, "/sitemap.xml: XML declaration missing");
assert.match(sitemapResponse.body, /^<\?xml[^>]*\?><sitemapindex xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">[\s\S]*<\/sitemapindex>$/i, "/sitemap.xml: invalid sitemap index root or namespace");
const sitemapLocations = [...sitemapResponse.body.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => xmlUnescape(match[1]));
assert.equal((sitemapResponse.body.match(/<sitemap>/gi) ?? []).length, sitemapLocations.length, "sitemap index contains malformed entries");
assert.ok(sitemapLocations.length > 0, "sitemap index is empty");
assert.ok(sitemapLocations.length <= 50000, "sitemap index exceeds protocol bounds");
assert.equal(new Set(sitemapLocations).size, sitemapLocations.length, "duplicate shard URLs in sitemap index");
for (const location of sitemapLocations) {
  const url = new URL(location);
  assert.equal(url.protocol, "https:", "sitemap shard is not HTTPS");
  assert.equal(url.host, base.host, "sitemap shard uses a non-canonical host");
  assert.match(url.pathname, /^\/sitemaps\/\d+\.xml$/);
}
const googlebotUserAgent = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";
const googlebotIndex = await get("/sitemap.xml", { userAgent: googlebotUserAgent });
assert.equal(googlebotIndex.response.status, 200, "Googlebot-like sitemap GET failed");
assert.equal(googlebotIndex.body, sitemapResponse.body, "Googlebot-like sitemap response differs");
const googlebotHead = await get("/sitemap.xml", { userAgent: googlebotUserAgent, method: "HEAD" });
assert.equal(googlebotHead.response.status, 200, "Googlebot-like sitemap HEAD failed");
assert.match(googlebotHead.response.headers.get("content-type") ?? "", /^application\/xml(?:;|$)/i);

const seenUrls = new Set();
const urlsetPageCounts = [];
for (let index = 0; index < sitemapLocations.length; index += 4) {
  const batch = sitemapLocations.slice(index, index + 4);
  const pages = await Promise.all(batch.map(async (location) => {
    const response = await fetch(location, { headers: { "user-agent": googlebotUserAgent } });
    assert.equal(response.status, 200, `${new URL(location).pathname}: sitemap shard failed`);
    assert.match(response.headers.get("content-type") ?? "", /^application\/xml(?:;|$)/i, `${new URL(location).pathname}: unexpected Content-Type`);
    assert.doesNotMatch(response.headers.get("cache-control") ?? "", /no-store/i, `${new URL(location).pathname}: response is marked uncacheable`);
    const xml = await response.text();
    assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/i, `${new URL(location).pathname}: XML declaration missing`);
    assert.match(xml, /^<\?xml[^>]*\?><urlset xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9">[\s\S]*<\/urlset>$/i, `${new URL(location).pathname}: invalid urlset root or namespace`);
    const entries = [...xml.matchAll(/<loc>(.*?)<\/loc>/gi)].map((match) => xmlUnescape(match[1]));
    assert.equal((xml.match(/<url>/gi) ?? []).length, entries.length, `${new URL(location).pathname}: malformed url entries`);
    assert.ok(entries.length <= 50000, "sitemap shard exceeds protocol bounds");
    return entries;
  }));
  for (const entries of pages) {
    urlsetPageCounts.push(entries.length);
    for (const location of entries) {
      const url = new URL(location);
      assert.equal(url.protocol, "https:", "sitemap URL is not HTTPS");
      assert.equal(url.host, base.host, "sitemap URL uses a non-canonical host");
      const segments = url.pathname.split("/").filter(Boolean);
      assert.ok(url.pathname === "/" || url.pathname === "/trustit" || segments.length === 2 || segments.length === 3, `private or invalid route in sitemap: ${url.pathname}`);
      assert.equal(url.search, "", `query URL in sitemap: ${url.pathname}`);
      assert.equal(url.hash, "", `fragment URL in sitemap: ${url.pathname}`);
      assert.equal(seenUrls.has(url.href), false, `duplicate URL in sitemap: ${url.pathname}`);
      seenUrls.add(url.href);
    }
  }
}
assert.ok(seenUrls.has(new URL(listingPath, base).href), "eligible listing missing from sitemap");
assert.ok(seenUrls.has(new URL(profilePath, base).href), "eligible profile missing from sitemap");
assert.ok(seenUrls.has(new URL(trustitPath, base).href), "public Trustit landing page missing from sitemap");
assert.ok(seenUrls.has(new URL("/", base).href), "public homepage missing from sitemap");
if (emptyCategoryHasNoResults) assert.equal(seenUrls.has(new URL(emptyPath, base).href), false, "empty noindex category was included in sitemap");

console.log(`Production indexability audit passed: ${checkedCanonicals.size} indexable canonical pages, ${sitemapLocations.length} sitemap shards, ${seenUrls.size} unique public URLs.`);
