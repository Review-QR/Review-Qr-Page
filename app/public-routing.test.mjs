import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("root route serves indexable public discovery and search directs to a city category", async () => {
  const [home, admin, layout] = await Promise.all([
    read("./page.tsx"), read("./admin/page.tsx"), read("./layout.tsx"),
  ]);
  assert.match(home, /Search local businesses/);
  assert.match(home, /name="city"/);
  assert.match(home, /name="category"/);
  assert.match(home, /name="q"/);
  assert.match(home, /redirect\(`\/\$\{encodeURIComponent\(city\)\}\/\$\{encodeURIComponent\(category\)\}/);
  assert.match(home, /canonicalPath:\s*"\/"/);
  assert.match(home, /robots:\s*\{ index: true, follow: true \}/);
  assert.match(admin, /await requireActiveAdmin\(\)/);
  assert.ok(admin.indexOf("await requireActiveAdmin()") < admin.indexOf("createSupabaseServerClient()"));
  assert.match(layout, /metadataBase:\s*new URL\(TRUSTIT_SITE_URL\)/);
  assert.match(layout, /robots:\s*\{ index: false, follow: false \}/);
});

test("admin dashboard navigation and successful login use /admin without exposing it", async () => {
  const [navigation, login, robots, routeMetadata] = await Promise.all([
    read("./admin-navigation.tsx"), read("./login/actions.ts"), read("./robots.ts"), read("./admin/page.tsx"),
  ]);
  assert.match(navigation, /label: "Dashboard", href: "\/admin"/);
  assert.match(navigation, /href="\/admin"/);
  assert.match(login, /redirect\("\/admin"\)/);
  assert.match(routeMetadata, /robots:\s*\{ index: false, follow: false \}/);
  assert.match(robots, /"\/admin"/);
  assert.match(robots, /"\/login"/);
  assert.match(robots, /"\/merchant"/);
  assert.match(robots, /"\/api\/"/);
});

test("one custom-domain source feeds canonical metadata, Trustit links and XML routes", async () => {
  const [seo, qr, sitemap, sitemapRoute, shardRoute, listing, detail] = await Promise.all([
    read("../lib/public-discovery-seo.ts"), read("../lib/trustit-qr.ts"), read("../lib/public-discovery-sitemap.ts"),
    read("./sitemap.xml/route.ts"), read("./sitemaps/[shard]/route.ts"),
    read("./[city]/[category]/(listing)/page.tsx"), read("./[city]/[category]/[businessSlug]/page.tsx"),
  ]);
  assert.equal((seo.match(/https:\/\/trustitreview\.com/g) ?? []).length, 1);
  assert.match(qr, /TRUSTIT_SITE_URL/);
  assert.match(sitemap, /TRUSTIT_SITE_URL/);
  assert.match(sitemapRoute, /application\/xml; charset=utf-8/);
  assert.match(sitemapRoute, /PUBLIC_SITEMAP_CACHE_CONTROL/);
  assert.match(shardRoute, /PUBLIC_SITEMAP_CACHE_CONTROL/);
  assert.match(listing, /discoveryMetadata/);
  assert.match(detail, /discoveryMetadata/);
  assert.match(detail, /businessAddressSchema/);
  assert.doesNotMatch(seo + qr + sitemap, /review-qr-page\.vercel\.app/);
});

test("custom sitemap route is the only sitemap implementation and includes public homepage", async () => {
  const { readdir } = await import("node:fs/promises");
  const entries = await readdir(new URL("./", import.meta.url), { recursive: true });
  assert.equal(entries.some((entry) => /(^|[\\/])sitemap\.ts$/.test(entry)), false);
  const [route, builder, robots] = await Promise.all([
    read("./sitemap.xml/route.ts"), read("../lib/public-discovery-sitemap.ts"), read("./robots.ts"),
  ]);
  assert.match(route, /buildSitemapIndexXml/);
  assert.match(builder, /TRUSTIT_STATIC_PUBLIC_PATHS[\s\S]*?TRUSTIT_SITE_URL/);
  assert.match(builder, /sitemaps\/\$\{id\}\.xml/);
  assert.match(robots, /\$\{TRUSTIT_SITE_URL\}\/sitemap\.xml/);
});
