import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  getAllowedTemplatesCount,
  getTemplatesForPlan,
  isRouteAllowedForPlan,
  calculateRenewalExpiry,
  normalizePlanTier,
  RESTRICTED_ROUTES_FOR_BASIC,
  BASIC_PLAN_NAV_ITEMS,
} from "./plan-rules.ts";
import { qrTemplates, qrTemplateIds } from "../app/merchant/dashboard/qr/templates.ts";

test("Basic plan sees only 2 templates and restricted routes", async () => {
  // 1. Template count
  assert.equal(getAllowedTemplatesCount("Basic"), 2);
  assert.equal(getAllowedTemplatesCount("basic"), 2);
  assert.equal(getAllowedTemplatesCount(null), 2);
  assert.equal(getAllowedTemplatesCount(undefined), 2);

  const basicTemplates = getTemplatesForPlan(qrTemplates, "Basic");
  assert.equal(basicTemplates.length, 2);
  assert.deepEqual(basicTemplates.map((t) => t.id), ["template_1", "template_2"]);

  // 2. Restricted routes for Basic plan
  assert.equal(isRouteAllowedForPlan("/merchant/dashboard/menu", "Basic"), false);
  assert.equal(isRouteAllowedForPlan("/merchant/dashboard/menu/add", "Basic"), false);
  assert.equal(isRouteAllowedForPlan("/merchant/dashboard/messages", "Basic"), false);
  assert.equal(isRouteAllowedForPlan("/merchant/dashboard/messages/new", "Basic"), false);

  // 3. Allowed routes for Basic plan
  for (const route of BASIC_PLAN_NAV_ITEMS) {
    assert.equal(isRouteAllowedForPlan(route, "Basic"), true, `Basic plan must allow ${route}`);
  }

  // 4. Verify navigation component hides Menu & Items and Message Designer for Basic
  const navSource = await readFile(new URL("../app/merchant/dashboard/merchant-navigation.tsx", import.meta.url), "utf8");
  assert.match(navSource, /isBasic\s*\?\s*items\.filter/);
  assert.match(navSource, /item\.href !== "\/merchant\/dashboard\/menu"/);
  assert.match(navSource, /item\.href !== "\/merchant\/dashboard\/messages"/);

  // 5. Verify menu and messages pages show upgrade prompts on Basic plan
  const menuPage = await readFile(new URL("../app/merchant/dashboard/menu/page.tsx", import.meta.url), "utf8");
  assert.match(menuPage, /planTier === "basic"/);
  assert.match(menuPage, /Upgrade to Standard Plan/);

  const messagesPage = await readFile(new URL("../app/merchant/dashboard/messages/page.tsx", import.meta.url), "utf8");
  assert.match(messagesPage, /planTier === "basic"/);
  assert.match(messagesPage, /Upgrade to Unlock Message Designer/);
});

test("Standard plan sees 5 templates", () => {
  assert.equal(getAllowedTemplatesCount("Standard"), 5);
  assert.equal(getAllowedTemplatesCount("standard"), 5);

  const standardTemplates = getTemplatesForPlan(qrTemplates, "Standard");
  assert.equal(standardTemplates.length, 5);
  assert.deepEqual(standardTemplates.map((t) => t.id), [
    "template_1",
    "template_2",
    "template_3",
    "template_4",
    "template_5",
  ]);

  // Standard plan unlocks Menu & Items and Message Designer
  assert.equal(isRouteAllowedForPlan("/merchant/dashboard/menu", "Standard"), true);
  assert.equal(isRouteAllowedForPlan("/merchant/dashboard/messages", "Standard"), true);
});

test("Premium plan sees 8 templates", () => {
  assert.equal(getAllowedTemplatesCount("Premium"), 8);
  assert.equal(getAllowedTemplatesCount("premium"), 8);

  const premiumTemplates = getTemplatesForPlan(qrTemplates, "Premium");
  assert.equal(premiumTemplates.length, 8);
  assert.deepEqual(premiumTemplates.map((t) => t.id), [
    "template_1",
    "template_2",
    "template_3",
    "template_4",
    "template_5",
    "template_6",
    "template_7",
    "template_8",
  ]);

  assert.equal(isRouteAllowedForPlan("/merchant/dashboard/menu", "Premium"), true);
  assert.equal(isRouteAllowedForPlan("/merchant/dashboard/messages", "Premium"), true);
});

test("Renewal adds strictly 30 days from today", async () => {
  // Test calculateRenewalExpiry: strictly 30 days from renewal date
  assert.equal(calculateRenewalExpiry("2026-10-28"), "2026-11-27");
  assert.equal(calculateRenewalExpiry("2026-01-01"), "2026-01-31");
  assert.equal(calculateRenewalExpiry("2026-12-01"), "2026-12-31");

  // Verify database migration file logic:
  const migration = await readFile(
    new URL("../supabase/migrations/20261028120000_plan_tiers_and_scan_analytics_fix.sql", import.meta.url),
    "utf8"
  );

  // Expiry calculation must strictly be v_today + 30 without carrying over remaining days
  assert.match(migration, /v_today := \(pg_catalog\.now\(\) at time zone 'UTC'\)::date;/);
  assert.match(migration, /v_new_expiry := v_today \+ 30;/);
  assert.doesNotMatch(migration, /v_new_expiry := v_current_expiry \+ 30;/);

  // Scan analytics fix: business_scan_events row insert in increment_business_scan
  assert.match(migration, /create or replace function public\.increment_business_scan/);
  assert.match(migration, /insert into public\.business_scan_events \(business_id\) values \(v_business_id\);/);
  assert.match(migration, /language plpgsql/);
  assert.match(migration, /security definer/);
  assert.match(migration, /grant execute on function public\.increment_business_scan\(text\) to anon;/);
});

test("Premium plan (₹99) VIP styling renders royal gold & obsidian accents and gold crown", async () => {
  const layout = await readFile(new URL("../app/merchant/dashboard/layout.tsx", import.meta.url), "utf8");
  const page = await readFile(new URL("../app/merchant/dashboard/page.tsx", import.meta.url), "utf8");
  const css = await readFile(new URL("../app/merchant/dashboard/dashboard.css", import.meta.url), "utf8");

  // Crown next to business name in layout identity and page hero
  assert.match(layout, /isPremium && \([\s\S]*?👑/);
  assert.match(page, /isPremium && \([\s\S]*?👑/);
  assert.match(page, /VIP Merchant/);

  // VIP styling classes
  assert.match(layout, /is-premium-vip/);
  assert.match(page, /merchant-hero--premium/);

  // CSS royal gold & obsidian definitions
  assert.match(css, /\.trustit-merchant-app\.is-premium-vip/);
  assert.match(css, /\.merchant-hero\.merchant-hero--premium/);
  assert.match(css, /rgba\(245, 158, 11/); // Gold accent
});
