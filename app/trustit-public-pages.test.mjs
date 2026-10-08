import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const source = (path) => readFile(new URL(path, import.meta.url), "utf8");
const pages = ["pricing", "privacy-policy", "terms", "refund-policy", "contact", "about"];

test("customer information pages are canonical, indexable routes with visible shared footer", async () => {
  for (const page of pages) {
    const file = await source(`./${page}/page.tsx`);
    assert.match(file, /trustitInformationMetadata\(/);
    assert.match(file, /TrustitPublicPage/);
  }
  const publicInfo = await source("../lib/trustit-public-info.ts");
  assert.match(publicInfo, /alternates:\s*\{\s*canonical\s*\}/);
  assert.match(publicInfo, /openGraph:\s*\{\s*type:\s*"website"/);
  assert.match(publicInfo, /twitter:\s*\{\s*card:\s*"summary"/);
  assert.match(publicInfo, /robots:\s*\{\s*index:\s*true,\s*follow:\s*true\s*\}/);
  for (const page of pages) assert.ok(publicInfo.includes(`href: "/${page}"`), `footer link configuration should include /${page}`);
  for (const path of ["./trustit/page.tsx", "./[city]/[category]/(listing)/page.tsx", "./[city]/[category]/[businessSlug]/page.tsx"]) {
    assert.match(await source(path), /TrustitPublicFooter/);
  }
});

test("public plan information derives from app plan configuration and registration uses the same source", async () => {
  const config = await source("../lib/config.ts");
  const publicInfo = await source("../lib/trustit-public-info.ts");
  assert.match(config, /basic:[\s\S]*?price:\s*29,[\s\S]*?durationDays:\s*30/);
  assert.match(config, /standard:[\s\S]*?price:\s*49,[\s\S]*?durationDays:\s*30/);
  assert.match(config, /premium:[\s\S]*?price:\s*99,[\s\S]*?durationDays:\s*30/);
  assert.match(publicInfo, /Object\.values\(appConfig\.plans\)/);
  assert.match(await source("./register/plan/plan-picker.tsx"), /trustitPublicPlans/);
  assert.match(await source("./register/payment/page.tsx"), /trustitPublicPlans/);
});

test("static customer pages are included in the existing public sitemap shard", async () => {
  const sitemap = await source("../lib/public-discovery-sitemap.ts");
  for (const page of pages) assert.ok(sitemap.includes(`"/${page}"`), `sitemap should include /${page}`);
  assert.match(await source("./sitemap.xml/route.ts"), /buildSitemapIndexXml/);
  assert.match(await source("./sitemaps/[shard]/route.ts"), /buildSitemapUrlsetXml/);
});

test("public contact/legal configuration does not invent operator details", async () => {
  const config = await source("../lib/trustit-public-info.ts");
  assert.match(config, /NEXT_PUBLIC_TRUSTIT_LEGAL_NAME/);
  assert.match(config, /NEXT_PUBLIC_TRUSTIT_SUPPORT_EMAIL/);
  assert.match(config, /NEXT_PUBLIC_TRUSTIT_SUPPORT_PHONE/);
  assert.match(config, /NEXT_PUBLIC_TRUSTIT_BUSINESS_ADDRESS/);
  const contact = await source("./contact/page.tsx");
  assert.match(contact, /Support contact not configured/);
});
