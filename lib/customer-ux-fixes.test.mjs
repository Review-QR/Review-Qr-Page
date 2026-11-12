import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  matchesCatalogQuery,
  DEFAULT_BAHRAICH_ITEMS,
  QUICK_COOKING_NOTES,
} from "./../components/customer/customer-types.ts";

const read = (relPath) =>
  fs.readFileSync(path.join(process.cwd(), relPath), "utf8");

test("matchesCatalogQuery resolves English & transliterated pantry queries (Kaju Katli, Karwa Tel, Biryani)", () => {
  const kajuMatches = DEFAULT_BAHRAICH_ITEMS.filter((item) =>
    matchesCatalogQuery(item, "kaju katli"),
  );
  assert.ok(
    kajuMatches.some((item) => item.name.toLowerCase().includes("kaju katli")),
    "Expected kaju katli query to match Kaju Katli item",
  );

  const karwaTelMatches = DEFAULT_BAHRAICH_ITEMS.filter((item) =>
    matchesCatalogQuery(item, "karwa tel"),
  );
  assert.ok(
    karwaTelMatches.some((item) => item.name.toLowerCase().includes("mustard oil")),
    "Expected karwa tel query to match Mustard Oil item",
  );

  const mustardMatches = DEFAULT_BAHRAICH_ITEMS.filter((item) =>
    matchesCatalogQuery(item, "mustard oil"),
  );
  assert.ok(
    mustardMatches.some((item) => item.name.toLowerCase().includes("mustard oil")),
    "Expected mustard oil query to match Mustard Oil item",
  );

  const biryaniMatches = DEFAULT_BAHRAICH_ITEMS.filter((item) =>
    matchesCatalogQuery(item, "biryani"),
  );
  assert.ok(
    biryaniMatches.length > 0,
    "Expected biryani query to match at least one dish",
  );
});

test("English UI strings contain zero unintended Hinglish leaks", () => {
  assert.ok(QUICK_COOKING_NOTES.every((note) => !/Kam Teekha/i.test(note)));

  const filesToCheck = [
    "components/customer/CustomerOrdersAndSupport.tsx",
    "components/customer/CustomerStorefrontAndVerticals.tsx",
    "components/customer/CustomerCheckoutAndAddresses.tsx",
    "components/customer/CustomerOnboardingModals.tsx",
    "components/customer/CustomerHomeAndDiscovery.tsx",
  ];

  for (const f of filesToCheck) {
    const src = read(f);
    assert.doesNotMatch(src, /Dukandar Quote/i);
    assert.doesNotMatch(src, /Packing garam/i);
    assert.doesNotMatch(src, /Hygiene aur quantity/i);
    assert.doesNotMatch(src, /me aapka swagat/i);
    assert.doesNotMatch(src, /Kam teekha/i);
  }
});

test("Onboarding & Address entry uses 4 stacked lines, Auto-Detect Location, and responsive 6-digit OTP", () => {
  const onboardingSrc = read("components/customer/CustomerOnboardingModals.tsx");
  assert.match(onboardingSrc, /House \/ Flat \/ Floor No\./);
  assert.match(onboardingSrc, /Street \/ Mohalla \/ Locality/);
  assert.match(onboardingSrc, /Nearest Landmark \(Optional\)/);
  assert.match(onboardingSrc, /City &amp; Pincode/);
  assert.match(onboardingSrc, /Auto-Detect Location/);
  assert.match(onboardingSrc, /handleAutoDetectProfileAddress/);
  assert.doesNotMatch(onboardingSrc, /grid-cols-3 gap-1\.5">\s*<div>\s*<label[^>]*>\s*Locality/);
  assert.match(onboardingSrc, /maxLength=\{6\}/);
  assert.match(onboardingSrc, /px-3 py-3 text-center font-mono text-xl sm:text-2xl/);

  const checkoutAddrSrc = read("components/customer/CustomerCheckoutAndAddresses.tsx");
  assert.match(checkoutAddrSrc, /handleAutoFillAddForm/);
  assert.match(checkoutAddrSrc, /Auto-Detect Location/);
});

test("Live Orders & Handover puts pixel-accurate street/gali map UP and slim non-dark Delivery OTP DOWN", () => {
  const ordersSrc = read("components/customer/CustomerOrdersAndSupport.tsx");
  assert.doesNotMatch(ordersSrc, /bg-slate-950 text-white px-3 py-2/);
  assert.doesNotMatch(ordersSrc, /text-amber-400 flex items-center justify-center/);
  assert.match(ordersSrc, /Delivery OTP · Share at gate/);
  assert.match(ordersSrc, /bg-emerald-50 border border-emerald-200 px-3 py-1\.5/);

  const mapIdx = ordersSrc.indexOf('mode="order_route"');
  const otpIdx = ordersSrc.indexOf("Delivery OTP · Share at gate");
  assert.ok(mapIdx > 0 && otpIdx > mapIdx, "Map must appear above slim Delivery OTP bar");

  const mapSrc = read("components/customer/BahraichInteractiveMap.tsx");
  assert.match(mapSrc, /TILE_SIZE = 256/);
  assert.match(mapSrc, /projectToPixel/);
  assert.match(mapSrc, /streets-v12\/tiles\/256\/\$\{zoom\}\/\$\{t\.wrappedTx\}\/\$\{t\.ty\}@2x/);
  assert.doesNotMatch(mapSrc, /Peepal Chauraha Marg/);
});

test("Android hardware Back navigation intercepts native OnBackPressedDispatcher and JS nav stack", () => {
  const mainActivitySrc = read("android/app/src/main/java/com/trustit/customer/MainActivity.java");
  assert.match(mainActivitySrc, /OnBackPressedCallback/);
  assert.match(mainActivitySrc, /getOnBackPressedDispatcher\(\)\.addCallback/);
  assert.match(mainActivitySrc, /window\.__handleTrustitBack/);

  const apkScriptSrc = read("scripts/build_customer_native_apk.mjs");
  assert.match(apkScriptSrc, /com\.trustit\.customer\.MainActivity/);

  const portalSrc = read("app/order/order-portal-client.tsx");
  assert.match(portalSrc, /bottomTabHistoryRef/);
  assert.match(portalSrc, /verticalTabHistoryRef/);
  assert.match(portalSrc, /ordersSubBackRef/);
  assert.match(portalSrc, /addressSubBackRef/);
  assert.match(portalSrc, /profileSubBackRef/);
  assert.match(portalSrc, /if \(!q && !matchesVertical\(b\.type \|\| "", activeTab\)\) return false;/);
});

test("OTA sync engine compares semver versions and clears stale cache on APK upgrades", () => {
  const bridgeSrc = read("android/app/src/main/java/com/trustit/customer/TrustitNativeBridge.java");
  assert.match(bridgeSrc, /syncInstalledApkBaseline/);
  assert.match(bridgeSrc, /compareSemver/);
  assert.match(bridgeSrc, /OTA_SYNC_LOCK/);

  const mainSrc = read("android/app/src/main/java/com/trustit/customer/MainActivity.java");
  assert.match(mainSrc, /TrustitNativeBridge\.syncInstalledApkBaseline\(this\)/);

  const otaRouteSrc = read("app/api/hyperlocal/ota/route.ts");
  assert.match(otaRouteSrc, /isNewerSemver/);
  assert.match(otaRouteSrc, /sanitizeAppKind/);

  const apkScriptSrc = read("scripts/build_customer_native_apk.mjs");
  assert.match(apkScriptSrc, /'2\.6\.0'/);
});
