# Team 3 Plan: Android & Build Pipeline Hardening (`team-3-android-build`)

- **Role:** Mobile / Capacitor / Android Build Engineer
- **Chat Mode:** Isolated chat / subagent (`workspace: "share"`)
- **Primary Goal:** Android release signing ko secure banana, APK reverse-engineering/MITM risk kam karna, aur `android/` folder overwrite hack ko clean Gradle Product Flavors mein convert karna.
- **Owned Files:** `android/**`, `capacitor.config.json`, `scripts/build_all_three_apps.mjs`, `scripts/prepare_embedded_bundle.mjs`, `scripts/build_customer_native_apk.mjs`, `scripts/build_partner_native_apk.mjs`, `scripts/build_rider_native_apk.mjs`.
- **Do Not Touch:** `app/api/**`, `proxy.ts`, `supabase/migrations/*`, `next.config.ts`.

---

## Startup & Memory Rules (Har Session Mein Follow Karein)
1. Kaam shuru karne se pehle is file ka **Session Memory & Handoff Log** padhein.
2. Capacitor plugins aur native bridge (`TrustitNativeBridge`) ki compatibility check kiye bina ProGuard/minify rules apply na karein.
3. Har task complete hone par `[ ]` ko `[x]` karein aur neeche **Handoff Log** update karein.

---

## Task Checklist

### Milestone 3.1 — Keystore & Secrets Hardening
- [x] `android/app/build.gradle` se hardcoded `storePassword 'trustit2026'` aur `keyPassword 'trustit2026'` hatayein.
- [x] Signing config ko environment variables / `keystore.properties` (`.gitignore`d) se load karein (`TRUSTIT_KEYSTORE_PATH`, `TRUSTIT_STORE_PASSWORD`, `TRUSTIT_KEY_ALIAS`, `TRUSTIT_KEY_PASSWORD`). Safe fallback: when credentials are absent, `release` builds unsigned with a warning and `debug` uses standard Android debug signing (`android/keystore.properties.example` added).
- [x] `.gitignore` mein `*.keystore`, `*.jks`, `android/keystore.properties`, aur `android/app/google-services.json` verify/add karein. *(Note: `android/trustit-production.keystore` is already tracked in git history and was left on disk so existing local builds aren't disrupted; remove via `git rm --cached` + rotate key when migrating secrets out of repo history.)*

### Milestone 3.2 — WebView & Release Binary Hardening
- [x] `capacitor.config.json` aur `scripts/build_all_three_apps.mjs` (plus `build_customer_native_apk.mjs`, `build_partner_native_apk.mjs`, `build_rider_native_apk.mjs`) mein `allowMixedContent: false` set karein. Also set `android:usesCleartextTraffic="false"` in `android/app/src/main/AndroidManifest.xml`.
- [x] `android/app/build.gradle` `release` buildType mein:
  - `minifyEnabled true` aur `shrinkResources true` enable karein.
  - `proguard-rules.pro` mein Capacitor WebView bridge (`@JavascriptInterface`, `TrustitNativeBridge`, `MainActivity`, `@CapacitorPlugin`, `@PluginMethod`) keep rules aur `android/app/src/main/res/raw/keep.xml` add karein taaki native bridge aur splash/launcher resources strip na hon.
- [x] `lint` block mein `checkReleaseBuilds true` aur `abortOnError true` restore karein (`MissingTranslation`/`ExtraTranslation` disabled), aur `TrustitNativeBridge` ke 13 `MissingPermission` lint errors (Bluetooth `BLUETOOTH_CONNECT` runtime checks + `LocationManager.removeUpdates` safe guard) fix karein.

### Milestone 3.3 — 3 APKs ko Clean Gradle Product Flavors Mein Shift Karna
- [x] `android/app/build.gradle` mein `flavorDimensions "app"` ke saath 3 `productFlavors` banayein:
  - `customer` (`com.trustit.customer`, `v2.7.2` / `19`)
  - `partner` (`com.trustit.partner`, `v3.6.0` / `24`)
  - `rider` (`com.trustit.rider`, `v5.3.0` / `26`)
- [x] Har flavor ke liye separate `src/<flavor>/res/` (adaptive vector icons, `strings.xml`, flavor colors) aur `src/<flavor>/AndroidManifest.xml` (Bluetooth thermal printer permissions sirf `partner` flavor mein; `ACCESS_BACKGROUND_LOCATION` sirf `rider` flavor mein; partner Java sources `src/partner/java/com/trustit/partner/` mein isolate kiye; `customer` Java sources `src/main/java/com/trustit/customer/` par rakhe taaki `lib/customer-ux-fixes.test.mjs` break na ho).
- [x] `scripts/build_all_three_apps.mjs` (aur `build_customer_native_apk.mjs`, `build_partner_native_apk.mjs`, `build_rider_native_apk.mjs`) ko update karein taaki wo `build.gradle`, `strings.xml`, ya `src/main/AndroidManifest.xml` overwrite na karein — aur `./gradlew assembleCustomerRelease`, `assemblePartnerRelease`, `assembleRiderRelease` call karein. Also updated `scripts/prepare_embedded_bundle.mjs` to accept `<app> [outDir]` instead of hardcoding `partner.html`.
- [x] Confirm karein ki `android-customer-bundle/`, `android-embedded-bundle/`, aur `android-rider-bundle/` `.gitignore` aur bundle scripts mein consistent hain.

---

## Verification Gate (Done Hone Se Pehle Mandatory)
- [x] Teeno release flavors (`assembleCustomerRelease`, `assemblePartnerRelease`, `assembleRiderRelease`) aur unke full lint checks (`lintCustomerRelease`, `lintPartnerRelease`, `lintRiderRelease`) cleanly pass hote hain bina `build.gradle` ko git-dirty kiye *(unsigned APKs verified without secrets; signed distribution requires `TRUSTIT_*` env vars or `android/keystore.properties`)*.
- [ ] `scripts/verify_compiled_apk.mjs` pass hota hai *(not run yet: requires a `next build` + signed `public/downloads/Trustit-Merchant-Partner.apk` via `node scripts/build_partner_native_apk.mjs` with signing credentials)*.

---

## Session Memory & Handoff Log
- **2026-11-12 (Coordinator Initialized):** Confirmed `android/app/build.gradle` has hardcoded keystore passwords, `minifyEnabled false`, `lintOptions { checkReleaseBuilds false; abortOnError false }`, and `capacitor.config.json` has `allowMixedContent: true`.
- **2026-11-12 (Team 3 Wave 1 Complete):**
  - **Completed Tasks:** Milestones 3.1, 3.2, and 3.3 (`android/` hardening, `allowMixedContent: false`, Gradle Product Flavors `customer`/`partner`/`rider`, and build script cleanup).
  - **Files Changed:** `.gitignore`, `capacitor.config.json`, `android/keystore.properties.example`, `android/app/build.gradle`, `android/app/proguard-rules.pro`, `android/app/src/main/AndroidManifest.xml` (`usesCleartextTraffic="false"`, `allowBackup="false"`), `android/app/src/main/res/values/colors.xml`, `android/app/src/main/res/raw/keep.xml`, `android/app/src/main/java/com/trustit/customer/TrustitNativeBridge.java` (with `CookieManager` cookie bridging in `nativeFetch`), `android/app/src/partner/java/com/trustit/partner/{MainActivity.java,TrustitNativeBridge.java}` (moved from `src/main/java/com/trustit/partner/`, with `CookieManager` cookie bridging in `nativeFetch`), `android/app/src/{customer,partner,rider}/{AndroidManifest.xml,res/...}`, `scripts/build_all_three_apps.mjs`, `scripts/prepare_embedded_bundle.mjs` (multi-app + `headers` forwarding in `nativeFetch`), `scripts/build_customer_native_apk.mjs`, `scripts/build_partner_native_apk.mjs`, `scripts/build_rider_native_apk.mjs`, `docs/ai-teams/team-3-android-build.plan.md`.
  - **Key Technical Decisions & Capacitor Constraint:**
    1. *Capacitor CLI constraint:* `@capacitor/cli` (`npx cap sync android`) only reads a single root `capacitor.config.json` and always writes web assets to `android/app/src/main/assets/public/` + `assets/capacitor.config.json`. Therefore, multi-flavor build scripts still stage `capacitor.config.json` per flavor (with `allowMixedContent: false`), run `npx cap sync android`, and restore the tracked `capacitor.config.json` in a `finally` block. All Android Gradle/manifest/strings/icon files remain completely untouched.
    2. *Java package layout:* Kept `src/main/java/com/trustit/customer/{MainActivity.java,TrustitNativeBridge.java}` in place because `lib/customer-ux-fixes.test.mjs` asserts those exact paths, while moving `partner` Java sources to `src/partner/java/com/trustit/partner/` so `customer`/`rider` APKs don't ship partner-only Bluetooth/siren bridge code and don't trigger `BLUETOOTH_CONNECT` lint errors.
    3. *Signing fallback:* If neither `TRUSTIT_*` env vars nor `android/keystore.properties` exist, `build.gradle` logs a warning and builds an unsigned release APK (`debug` uses standard Android debug signing); APK copy scripts fail fast with a clear message if asked to distribute an unsigned APK.
  - **Verification Evidence:**
    - `.\gradlew.bat lintCustomerRelease lintPartnerRelease lintRiderRelease assembleCustomerRelease assemblePartnerRelease assembleRiderRelease --no-daemon`: `BUILD SUCCESSFUL in 2m 30s` (0 lint errors across all 3 flavors; R8 `minifyEnabled true` + `shrinkResources true` succeeded; verified `mapping.txt` preserves `com.trustit.customer.TrustitNativeBridge`, `com.trustit.partner.TrustitNativeBridge`, and `MainActivity`; produced `app-customer-release-unsigned.apk`, `app-partner-release-unsigned.apk`, `app-rider-release-unsigned.apk`).
    - `node --test lib/customer-ux-fixes.test.mjs`: `6/6` passed.
    - `node --check` passed on all 5 modified `.mjs` scripts.
  - **Current Status:** `WAVE_1_COMPLETE`
  - **Next Exact Step:** When producing distributable signed APKs, supply `android/keystore.properties` (or `TRUSTIT_*` env vars), run `pnpm build`, run `node scripts/build_all_three_apps.mjs`, and verify with `node scripts/verify_compiled_apk.mjs`. Also consider `git rm --cached android/trustit-production.keystore` + key rotation before public repo exposure.
