# Team 1 Plan: Security & Auth Hardening (`team-1-security-auth`)

- **Role:** Security & Backend Auth Engineer
- **Chat Mode:** Isolated chat / subagent (`workspace: "share"`)
- **Primary Goal:** Hacking vectors band karna — CORS, CSP, central route guards, API RBAC/IDOR protection, rate limiting, aur payment/webhook integrity.
- **Owned Files:** `proxy.ts`, `next.config.ts` (security headers/CORS/CSP section), `app/api/**/route.ts`, `lib/*auth*`, `lib/rate-limiter.ts`, `lib/cashfree*`, `supabase/migrations/*` (new security migrations only).
- **Do Not Touch:** `android/**`, `scripts/build_*`, `app/rider/components/**`, root legacy `.html` files.

---

## Startup & Memory Rules (Har Session Mein Follow Karein)
1. Kaam shuru karne se pehle is file ka **Session Memory & Handoff Log** padhein.
2. Sirf niche diye gaye checkboxes ke scope mein kaam karein.
3. Har task complete hone par `[ ]` ko `[x]` karein aur neeche **Handoff Log** update karein.

---

## Task Checklist

### Milestone 1.1 — HTTP Headers, CORS & CSP (`next.config.ts` + `proxy.ts`)
- [x] `next.config.ts` se `/api/:path*` par wildcard `Access-Control-Allow-Origin: *` hatayein.
- [x] Origin-allowlist helper banayein jo sirf trusted origins allow kare:
  - `https://trustitreview.com`, `https://www.trustitreview.com`
  - Capacitor WebView origins: `capacitor://localhost`, `http://localhost`, `https://localhost`
  - Local dev origins sirf `NODE_ENV !== "production"` mein.
- [x] `Permissions-Policy` ko tighten karein (`camera=(), microphone=(), geolocation=(self)` default, `/rider/:path*` & `/merchant/:path*` par `camera=(self)` scoped).
- [x] Nonce-aware `Content-Security-Policy` (pehle Report-Only ya Cashfree SDK `https://sdk.cashfree.com` + Supabase `*.supabase.co` whitelist ke saath verified) implement karein.

### Milestone 1.2 — Central Gatekeeper (`proxy.ts`)
- [x] `proxy.ts` mein fail-closed session gate lagayein:
  - `/admin` & `/api/hyperlocal/admin/*` -> valid authenticated session required
  - `/merchant` & `/api/merchant/*` (public login/auth chhod kar) -> merchant session required
  - `/api/cron/*` -> `CRON_SECRET` Bearer verification

### Milestone 1.3 — Full 31 API Routes Auth, IDOR & Validation Audit (`app/api/**/route.ts`)
Har route par check karein aur fix karein: (1) Auth guard, (2) Role check, (3) Ownership/IDOR check, (4) Rate limiting, (5) Server-side calculation:
- [x] **Admin APIs:**
  - `app/api/hyperlocal/admin/customer-points/route.ts`
  - `app/api/hyperlocal/admin/orders/route.ts`
  - `app/api/hyperlocal/admin/riders/route.ts`
  - `app/api/hyperlocal/admin/settlements/route.ts`
- [x] **Merchant APIs:**
  - `app/api/merchant/auth/route.ts`
  - `app/api/merchant/orders/route.ts`
  - `app/api/merchant/outlet-status/route.ts`
  - `app/api/merchant/app-operations/route.ts`
  - `app/api/merchant/save-blueprints/route.ts`
  - `app/api/merchant/wallet/cashfree-order/route.ts`
  - `app/api/merchant/wallet/verify-payment/route.ts`
- [x] **Customer & Auth OTP APIs (Rate-limit & OTP brute-force check):**
  - `app/api/customer/auth/send-otp/route.ts`
  - `app/api/customer/auth/verify-otp/route.ts`
  - `app/api/customer/addresses/route.ts`
  - `app/api/customer/points/route.ts`
- [x] **Hyperlocal, Rider & Payment APIs:**
  - `app/api/hyperlocal/orders/route.ts` (server-side total/discount calculation check)
  - `app/api/hyperlocal/payment/session/route.ts`
  - `app/api/hyperlocal/payment/verify/route.ts`
  - `app/api/hyperlocal/rider/route.ts`
  - `app/api/hyperlocal/businesses/route.ts`, `directions/route.ts`, `parcha/route.ts`, `reverse-geocode/route.ts`, `tokens/route.ts`, `ota/route.ts`, `remote-config/route.ts`
- [x] **Webhooks & Cron:**
  - `app/api/cashfree/webhook/route.ts` (HMAC signature + idempotency verification)
  - `app/api/cron/dispatch-occasions/route.ts`

### Milestone 1.4 — Database & Secrets Check
- [x] Verify karein ki `SUPABASE_SERVICE_ROLE_KEY` kisi bhi `"use client"` file ya `NEXT_PUBLIC_*` variable mein use nahi ho raha.
- [x] Wallet/Points/Settlement endpoints par atomic SQL/RPC transaction locks verify karein (no race condition).

---

## Verification Gate (Done Hone Se Pehle Mandatory)
- [x] `pnpm typecheck` passes with 0 errors.
- [x] `pnpm test:cashfree` passes.
- [x] Koi naya regression nahi — Capacitor API calls (`https://trustitreview.com/api/...`) CORS ke baad bhi allowlist par kaam karte hain.

---

## Session Memory & Handoff Log
- **2026-11-12 (Coordinator Initialized):** Plan created from baseline inspection (`next.config.ts`, `proxy.ts`, `scripts/prepare_embedded_bundle.mjs`, 31 `app/api/**/route.ts` files).
- **2026-11-12 (Team 1 Wave 1 Security & Auth Hardening Completed):**
  - **Files Created:** `lib/auth-cors.ts` (strict origin allowlist + CORS preflight/header helpers + client IP helper), `lib/auth-api-guards.ts` (`requireAdminApi`, `requireMerchantApi`, `enforceRateLimit`, `constantTimeEqual`, `verifyGoogleIdToken`, signed `trustit_customer_session` cookie helpers).
  - **Files Modified:**
    - `next.config.ts`: Replaced wildcard `Access-Control-Allow-Origin: *` on `/api/:path*` with `has`-matched origin allowlist (`https://trustitreview.com`, `https://www.trustitreview.com`, `capacitor://localhost`, `http://localhost`, `https://localhost`, plus dev-only localhost/trycloudflare outside production) + `Vary: Origin` + `Access-Control-Allow-Credentials: true`; added `X-Frame-Options: SAMEORIGIN`; tightened default `Permissions-Policy` to `camera=(), microphone=(), geolocation=(self)` (matching `profile.test.mjs`) with per-route `camera=(self), microphone=(), geolocation=(self), display-capture=()` on `/rider/:path*` and `/merchant/:path*`. Left `ignoreBuildErrors: true` untouched.
    - `proxy.ts`: Added fail-closed `CRON_SECRET` Bearer gate on `/api/cron/*`, fail-closed Supabase `getClaims()` + `admin_users` gate on `/admin*` and `/api/hyperlocal/admin/*`, fail-closed `merchantSessionCookieName` (and API `Authorization: Bearer`) + active `merchant_accounts`/`businesses` gate on protected `/merchant/*` and `/api/merchant/*` (excluding `/merchant`, `/merchant/login*`, `/merchant/register*`, `/merchant/flow*`, `/merchant/app?auth=true|step=*`, `/api/merchant/auth*`), dynamic `/api/*` CORS preflight & response header enforcement, and nonce-aware `Content-Security-Policy-Report-Only` whitelisting `https://sdk.cashfree.com` and `*.supabase.co`.
    - `lib/rate-limiter.ts`: Added `MAX_RATE_LIMIT_KEYS = 20_000` eviction cap.
    - `lib/auth/merchant-unified-auth.ts`: Gated `previewOtp` behind `NODE_ENV !== "production"`, failed closed on WhatsApp gateway errors in production, fixed `fallbackRecords` + `attempts >= 5` OTP brute-force bug, removed `owner` display-name takeover in `authenticateMerchantWithGoogle` + added `idToken` verification requirement in production, and switched `deterministicPassword` to HMAC-SHA256 using server secret.
    - `lib/auth/customer-unified-auth.ts`: Required `idToken` verification on `google_login` in production.
    - `lib/auth/email-service.ts`: Added `checkRateLimit` sliding-window throttling to email OTP generation functions.
    - `app/api/**`: Added `requireAdminApi()` to `hyperlocal/admin/orders`, `hyperlocal/admin/riders`, `hyperlocal/admin/settlements`, and `hyperlocal/remote-config` (`POST`); fail-closed `CRON_SECRET` in `cron/dispatch-occasions`; strict origin CORS + rate limits in `merchant/auth`, `hyperlocal/ota`, `hyperlocal/reverse-geocode`, `hyperlocal/directions`, `hyperlocal/rider`; disabled prod FS writes + required admin in `merchant/save-blueprints`; added server-side wallet tag/credits verification via Cashfree `/orders/{id}` in `merchant/wallet/cashfree-order`, `merchant/wallet/verify-payment`, and `cashfree/webhook` (plus DB order existence + string/number amount & idempotency checks on `hord_` webhook); hardened `merchant/app-operations` with `requireMerchantApi()`, `.eq("business_id", resolvedBizId)` ownership scoping across order/catalog mutations, mandatory `currentPin` match, mandatory `delivery_otp`, and prod disablement of `create_sample_order`; hardened `hyperlocal/orders` with catalog price/stock validation, strict `cod`|`online_cashfree` mode allowlist, merchant/admin session enforcement on accept/ready/reject/cancel, and customer session ownership checks; hardened `hyperlocal/payment/session` & `verify` to enforce DB order amount and disallow mock-paid fallbacks in production; added customer rate limits + signed session cookies in `customer/auth/*`, `customer/addresses`, `customer/points`; scoped `hyperlocal/parcha` and stripped PII (`customer_phone`) from `hyperlocal/tokens` public queue reads; hardened `hyperlocal/rider` (disabled passwordless `action: "login"`, enforced KYC + ₹2,000 cash ceiling on `toggle_online` and `verify_helmet_selfie`, required verified rider session on `request_payout`/`update_upi`, masked sensitive bank/PAN/DL fields on unauthenticated GETs).
  - **Decisions / Cross-Team Notes:**
    - `TrustitNativeBridge.nativeFetch` (Customer/Partner/Rider Android Java `HttpURLConnection`) sends no `Origin` header and drops `Set-Cookie`. Browser/WebView `fetch` flows receive and forward signed `HttpOnly` cookies (`merchantSessionCookieName`, `trustit_customer_session`, `trustit_rider_session`). Team 3 (`@android`) should note `/api/merchant/app-operations` now requires an authenticated merchant cookie or `Authorization: Bearer` token, and rider `request_payout` / `update_upi` require `Authorization: Bearer <riderToken>` or `trustit_rider_session` cookie.
    - `Permissions-Policy` default stays `"camera=(), microphone=(), geolocation=(self)"` to satisfy `app/merchant/dashboard/profile/profile.test.mjs:111`, while `/rider/:path*` and `/merchant/:path*` override with `camera=(self), microphone=(), geolocation=(self), display-capture=()` for Rider KYC selfie capture.
  - **Verification Output:**
    - `pnpm typecheck`: PASSED (`tsc --noEmit --incremental false`, exit `0`).
    - `pnpm test:cashfree`: PASSED (`23/23` tests pass).
    - `node --test app/merchant/dashboard/profile/profile.test.mjs`: PASSED (`9/9` tests pass).
- **Current Status:** `WAVE_1_COMPLETE`
- **Next Exact Step:** `@qa` to review security changes and add Milestone 4.2 regression tests; `@android` to verify native `Authorization` forwarding for Partner/Rider `nativeFetch`.
