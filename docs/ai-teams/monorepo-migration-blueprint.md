# Trustit Modularization & Monorepo Migration Blueprint

- **Author:** Team 2 (`architecture` — Core Architecture & Cleanup)
- **Baseline Date:** 2026-11-12
- **Status:** Wave 1 Blueprint Complete (Zero `lib/` files mass-moved yet to avoid import churn during parallel Wave 1 Security/Android work)

---

## 1. Current Codebase Inventory & Architectural Baseline

Verified across the live repository (`pnpm typecheck` passes with exit code `0`):

| Metric | Observed Value | Notes |
| :--- | :--- | :--- |
| **`lib/` Total Files** | **161 files** | **136** non-test source/declaration files + **25** `*.test.mjs` test suites |
| **Existing `lib/modules/`** | **25 files** | Early scaffold (`admin`, `customer`, `merchant`, `rider`, `shared`, `index.ts`, `modules-architecture.test.mjs`). `lib/modules/index.ts` currently has **0 inbound imports** from `app/`. |
| **Top Coupling Hotspot** | `lib/supabase-admin.ts` (**62 inbound imports**) | Imported directly by `app/admin`, `app/api`, `app/merchant`, `app/merchants`, `app/r`, `app/register`, and multiple `lib/` domains. |
| **Second Coupling Hotspot** | `lib/merchant-auth.ts` (**34 inbound imports**) | Uses `next/*` + `react` (`server,next,react`), tightly coupling Next.js runtime to merchant domain logic. |
| **Largest Monolithic Files** | `lib/cashfree.ts` (1,091 lines), `lib/auth/email-service.ts` (955 lines), `lib/config/business-catalog.ts` (773 lines), `lib/creative-canvas.ts` (692 lines), `lib/bank-payouts-service.ts` (686 lines), `lib/hyperlocal/hyperlocal-service.ts` (677 lines), `lib/product-orders/product-order-service.ts` (612 lines) | Prime candidates for cohesive sub-module splitting before package extraction. |
| **TypeScript Config** | `strict: true`, `allowJs: false`, `@/* -> ./*` | `next.config.ts` still has `typescript: { ignoreBuildErrors: true }` (Wave 2 target: set to `false`). |
| **Workspace Config** | `pnpm-workspace.yaml` exists at root | Currently only holds `allowBuilds`; ready to declare `packages: ["apps/*", "packages/*"]`. |
| **Legacy Root Clutter** | 11 static `.html`/`data.js` files archived to `archive/legacy-static/` | Verified 0 references in `app/`, `lib/`, `extension/`, `components/`, and `scripts/`. Leftover root file: `data-supabase-ready.js.txt` (pending user confirmation). |

---

## 2. Complete File-by-File Domain & Package Mapping (All 161 `lib/` Files)

Every file currently in `lib/` is mapped below to:
1. **Wave 2 Modular Monolith target** (`lib/modules/<domain>/...`)
2. **Wave 3+ Monorepo package target** (`packages/*`)
3. **Runtime boundary** (`pure/shared`, `client`, `server`, `server+next`, `test`)

### 2.1 Auth, Session, Security & Supabase Infrastructure (`19` non-test + `1` test)

| Current Path | Lines | Runtime | Inbound Areas | Wave 2 (`lib/modules/...`) | Wave 3+ Package |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `lib/supabase-config.ts` | 16 | shared | `lib/supabase-*`, `proxy.ts` | `lib/modules/shared/db/config.ts` | `packages/db` |
| `lib/supabase.ts` | 8 | client/shared | `app/logout-button.tsx`, `app/r`, `lib/data.ts` | `lib/modules/shared/db/browser.ts` | `packages/db` |
| `lib/supabase-admin.ts` | 24 | server | 62 callers (`app/*`, `lib/*`) | `lib/modules/shared/db/admin.ts` | `packages/db` |
| `lib/supabase-server.ts` | 75 | server+next | 23 callers (`app/*`, `lib/*`) | `lib/modules/shared/db/server.ts` | `packages/db` |
| `lib/supabase-merchant-server.ts` | 43 | server+next | 20 callers (`app/merchant`, `app/register`, `lib/*`) | `lib/modules/auth/merchant-supabase-server.ts` | `packages/db` |
| `lib/supabase-merchant-browser.ts` | 21 | client | 0 (audit before prune) | `lib/modules/auth/merchant-supabase-browser.ts` | `packages/db` |
| `lib/supabase-proxy.ts` | 77 | server+next | `proxy.ts` | `lib/modules/auth/supabase-proxy.ts` | `packages/auth` |
| `lib/rate-limiter.ts` | 77 | server/shared | `app/r`, `lib/auth` | `lib/modules/auth/rate-limiter.ts` | `packages/auth` |
| `lib/auth/customer-unified-auth.ts` | 428 | server+node | `app/api`, `lib/auth` | `lib/modules/auth/customer-unified-auth.ts` | `packages/auth` |
| `lib/auth/merchant-unified-auth.ts` | 444 | server+node | `app/api` | `lib/modules/auth/merchant-unified-auth.ts` | `packages/auth` |
| `lib/auth/phone-otp-service.ts` | 260 | server+node | `app/merchant`, `app/register` | `lib/modules/auth/phone-otp-service.ts` | `packages/auth` |
| `lib/auth/email-service.ts` | 955 | server+node | `app/api`, `app/merchant`, `app/register`, `lib/auth` | `lib/modules/auth/email-service.ts` *(split templates to `messaging`)* | `packages/auth` + `packages/messaging` |
| `lib/merchant-auth.ts` | 153 | server+next+react | 34 callers (`app/api`, `app/merchant`, `app/register`, `lib/modules`) | `lib/modules/auth/merchant-session.ts` | `packages/auth` |
| `lib/merchant-identity.ts` | 11 | server+node | `app/businesses`, `app/merchant`, `app/register` | `lib/modules/auth/merchant-identity.ts` | `packages/auth` |
| `lib/hyperlocal/rider-session.ts` | 46 | server+node | `app/api` | `lib/modules/auth/rider-session.ts` | `packages/auth` |
| `lib/modules/admin/auth.ts` | 14 | server | `lib/modules/admin` | `lib/modules/admin/auth.ts` *(keep)* | `packages/auth` |
| `lib/modules/customer/auth.ts` | 52 | server | `lib/modules/customer` | `lib/modules/customer/auth.ts` *(keep)* | `packages/auth` |
| `lib/modules/merchant/auth.ts` | 22 | server | `lib/modules/merchant` | `lib/modules/merchant/auth.ts` *(keep)* | `packages/auth` |
| `lib/modules/rider/auth.ts` | 45 | server | `lib/modules/rider` | `lib/modules/rider/auth.ts` *(keep)* | `packages/auth` |
| `lib/customer-auth.test.mjs` | 86 | test | — | `lib/modules/auth/__tests__/customer-auth.test.mjs` | `packages/auth` |

### 2.2 Payments, Cashfree, Wallets & Bank Payouts (`13` non-test + `4` tests)

| Current Path | Lines | Runtime | Inbound Areas | Wave 2 (`lib/modules/...`) | Wave 3+ Package |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `lib/cashfree.ts` | 1091 | server+node | `app/api`, `app/merchant`, `app/register`, `lib/hyperlocal`, `lib/modules`, `lib/product-orders`, `lib/wallet` | `lib/modules/payments/cashfree-client.ts` *(split subscription vs core)* | `packages/payments` |
| `lib/cashfree-config.ts` | 21 | shared | `lib/cashfree-config.test.mjs` | `lib/modules/payments/cashfree-config.ts` | `packages/payments` |
| `lib/cashfree-environment.ts` | 53 | shared | `lib/cashfree-config.ts`, `lib/cashfree.ts` | `lib/modules/payments/cashfree-environment.ts` | `packages/payments` |
| `lib/cashfree-signature.ts` | 19 | server+node | `lib/cashfree.ts`, tests | `lib/modules/payments/cashfree-signature.ts` | `packages/payments` |
| `lib/cashfree-payment-guard.ts` | 13 | shared | `lib/cashfree-webhook-handler.ts`, tests | `lib/modules/payments/cashfree-payment-guard.ts` | `packages/payments` |
| `lib/cashfree-payment-attempts.mjs` | 21 | shared | `lib/cashfree.ts`, tests | `lib/modules/payments/cashfree-payment-attempts.ts` *(convert `.mjs` -> `.ts`)* | `packages/payments` |
| `lib/cashfree-payment-attempts.d.mts` | 7 | types | — | *(merge into `.ts` above)* | `packages/payments` |
| `lib/cashfree-webhook-handler.ts` | 194 | server | `app/api`, tests | `lib/modules/payments/cashfree-webhook-handler.ts` | `packages/payments` |
| `lib/hyperlocal/cashfree-hyperlocal-service.ts` | 381 | server+node | `app/api`, `lib/modules` | `lib/modules/payments/hyperlocal-cashfree.ts` | `packages/payments` |
| `lib/hyperlocal/cashfree-payouts-service.ts` | 254 | server | `app/api`, `lib/hyperlocal` | `lib/modules/payments/cashfree-payouts.ts` | `packages/payments` |
| `lib/product-orders/cashfree-product-service.ts` | 297 | server+node | `app/merchant`, `lib/product-orders` | `lib/modules/payments/product-cashfree.ts` | `packages/payments` |
| `lib/wallet/cashfree-wallet-service.ts` | 171 | server+node | `app/api` | `lib/modules/payments/wallet-cashfree.ts` | `packages/payments` |
| `lib/bank-payouts-service.ts` | 686 | server | `app/merchant`, `app/merchants`, `lib/hyperlocal` | `lib/modules/payments/bank-payouts.ts` | `packages/payments` |
| `lib/cashfree-config.test.mjs` | 23 | test | — | `lib/modules/payments/__tests__/cashfree-config.test.mjs` | `packages/payments` |
| `lib/cashfree-production-readiness.test.mjs` | 155 | test | — | `lib/modules/payments/__tests__/cashfree-production-readiness.test.mjs` | `packages/payments` |
| `lib/cashfree-webhook-handler.test.mjs` | 239 | test | — | `lib/modules/payments/__tests__/cashfree-webhook-handler.test.mjs` | `packages/payments` |
| `lib/hyperlocal/hyperlocal-payment.test.mjs` | 53 | test | — | `lib/modules/payments/__tests__/hyperlocal-payment.test.mjs` | `packages/payments` |

### 2.3 Orders, Hyperlocal Dispatch, Fleet & Settlements (`19` non-test + `4` tests)

| Current Path | Lines | Runtime | Inbound Areas | Wave 2 (`lib/modules/...`) | Wave 3+ Package |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `lib/hyperlocal/types.ts` | 288 | shared | `app/admin`, `app/merchant`, `app/rider`, `lib/hyperlocal` | `lib/modules/orders/hyperlocal/types.ts` | `packages/core` |
| `lib/hyperlocal/order-id.ts` | 64 | server+node | `app/admin`, `app/merchant`, `app/order`, `components/customer`, `lib/modules`, tests | `lib/modules/orders/hyperlocal/order-id.ts` | `packages/core` |
| `lib/hyperlocal/address-format.ts` | 24 | shared | `app/api`, `app/order`, `components/customer`, `lib/customer` | `lib/modules/orders/hyperlocal/address-format.ts` | `packages/core` |
| `lib/hyperlocal/location-resolver.ts` | 82 | shared | `lib/modules`, tests | `lib/modules/orders/hyperlocal/location-resolver.ts` | `packages/core` |
| `lib/hyperlocal/split-calculator.ts` | 56 | shared | `lib/hyperlocal`, tests | `lib/modules/orders/hyperlocal/split-calculator.ts` | `packages/core` |
| `lib/hyperlocal/bank-csv-generator.ts` | 86 | shared | `lib/hyperlocal` | `lib/modules/orders/hyperlocal/bank-csv-generator.ts` | `packages/orders` |
| `lib/hyperlocal/dispatch-engine.ts` | 285 | server | `app/api`, `lib/hyperlocal`, tests | `lib/modules/orders/hyperlocal/dispatch-engine.ts` | `packages/orders` |
| `lib/hyperlocal/hyperlocal-service.ts` | 677 | server | `app/api` | `lib/modules/orders/hyperlocal/service.ts` | `packages/orders` |
| `lib/hyperlocal/rider-fleet-engine.ts` | 273 | server | `app/api` | `lib/modules/rider/fleet-engine.ts` | `packages/orders` |
| `lib/hyperlocal/settlement-service.ts` | 514 | server | `app/api` | `lib/modules/orders/hyperlocal/settlement-service.ts` | `packages/payments` |
| `lib/hyperlocal/master-catalog-templates.ts` | 103 | shared | `app/merchant` | `lib/modules/merchant/master-catalog-templates.ts` | `packages/core` |
| `lib/hyperlocal/remote-config.ts` | 101 | shared | `app/api`, `app/rider` | `lib/modules/rider/remote-config.ts` | `packages/core` |
| `lib/product-orders/types.ts` | 186 | shared | `app/admin`, `app/merchant`, `lib/product-orders` | `lib/modules/orders/product/types.ts` | `packages/core` |
| `lib/product-orders/order-id.ts` | 23 | server+node | `lib/product-orders`, tests | `lib/modules/orders/product/order-id.ts` | `packages/core` |
| `lib/product-orders/pricing-calculator.ts` | 92 | shared | `lib/product-orders`, tests | `lib/modules/orders/product/pricing-calculator.ts` | `packages/core` |
| `lib/product-orders/shipping-calculator.ts` | 63 | shared | `lib/product-orders`, tests | `lib/modules/orders/product/shipping-calculator.ts` | `packages/core` |
| `lib/product-orders/product-order-service.ts` | 612 | server | `app/admin`, `app/api`, `app/merchant` | `lib/modules/orders/product/service.ts` | `packages/orders` |
| `lib/product-orders/webhook-handler.ts` | 134 | server | `app/api` | `lib/modules/orders/product/webhook-handler.ts` | `packages/orders` |
| `lib/trustit-checkout-diagnostics.ts` | 40 | shared | `app/register`, `lib/cashfree.ts` | `lib/modules/orders/checkout-diagnostics.ts` | `packages/payments` |
| `lib/hyperlocal.test.mjs` | 228 | test | — | `lib/modules/orders/__tests__/hyperlocal.test.mjs` | `packages/orders` |
| `lib/hyperlocal/settlements.test.mjs` | 96 | test | — | `lib/modules/orders/__tests__/settlements.test.mjs` | `packages/payments` |
| `lib/product-orders.test.mjs` | 193 | test | — | `lib/modules/orders/__tests__/product-orders.test.mjs` | `packages/orders` |
| `lib/rider-ecosystem.test.mjs` | 168 | test | — | `lib/modules/rider/__tests__/rider-ecosystem.test.mjs` | `packages/orders` |

### 2.4 Merchant Domain (CRM, Onboarding, Plans, Social, Messaging, QR Canvas) (`21` non-test + `5` tests)

| Current Path | Lines | Runtime | Inbound Areas | Wave 2 (`lib/modules/...`) | Wave 3+ Package |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `lib/config/business-catalog.ts` | 773 | shared | `app/business-categories`, `app/merchant`, `lib/*` | `lib/modules/merchant/catalog/business-catalog.ts` | `packages/core` |
| `lib/business-category-catalog.ts` | 105 | shared | `app/business-categories`, `app/components`, `app/merchant`, `app/register`, `lib/*` | `lib/modules/merchant/catalog/category-catalog.ts` | `packages/core` |
| `lib/business-category-admin.server.ts` | 79 | server | `app/business-categories`, `app/businesses`, `app/merchant`, `app/register` | `lib/modules/admin/business-category-admin.server.ts` | `packages/orders` / `apps/admin` |
| `lib/business-types.ts` | 79 | shared | `app/businesses`, `app/r`, `lib/*` | `lib/modules/merchant/business-types.ts` | `packages/core` |
| `lib/business-location.ts` | 73 | shared | `app/merchant`, tests | `lib/modules/merchant/business-location.ts` | `packages/core` |
| `lib/plan-rules.ts` | 64 | shared | `app/merchant`, tests | `lib/modules/merchant/plan-rules.ts` | `packages/core` |
| `lib/plan-specifications.ts` | 76 | shared | `app/merchant`, `app/pricing`, `app/register` | `lib/modules/merchant/plan-specifications.ts` | `packages/core` |
| `lib/trustit-onboarding.ts` | 79 | server | `app/merchant`, `app/register`, `lib/auth` | `lib/modules/merchant/onboarding.ts` | `packages/auth` / `packages/orders` |
| `lib/merchant-invite-completion.mjs` | 60 | shared | `app/merchant`, `app/merchants` | `lib/modules/merchant/invite-completion.ts` *(convert `.mjs` -> `.ts`)* | `packages/core` |
| `lib/merchant-invite-completion.d.mts` | 18 | types | — | *(merge into `.ts` above)* | `packages/core` |
| `lib/merchant-profile-completion.ts` | 38 | shared | `app/merchant` | `lib/modules/merchant/profile-completion.ts` | `packages/core` |
| `lib/merchant-social.ts` | 100 | shared | `app/merchant`, tests | `lib/modules/merchant/social.ts` | `packages/core` |
| `lib/merchant/merchant-remote-config.ts` | 180 | server+node | `app/api`, `lib/auth` | `lib/modules/merchant/remote-config.ts` | `packages/core` |
| `lib/merchant-message-safety.ts` | 7 | shared | `app/merchant`, tests | `lib/modules/merchant/message-safety.ts` | `packages/core` |
| `lib/merchant-message-templates.ts` | 32 | shared | `app/merchant`, tests | `lib/modules/merchant/message-templates.ts` | `packages/core` |
| `lib/customer-crm-service.ts` | 387 | server | `app/api`, `app/merchant`, `lib/messaging`, `lib/wallet` | `lib/modules/merchant/crm-service.ts` | `packages/orders` |
| `lib/customer-crm-analytics.ts` | 120 | server | `app/merchant` | `lib/modules/merchant/crm-analytics.ts` | `packages/orders` |
| `lib/messaging/fast2sms-dispatch.ts` | 464 | server | `app/api`, `app/merchant` | `lib/modules/messaging/fast2sms-dispatch.ts` | `packages/messaging` |
| `lib/messaging/whatsapp-cloud-api.ts` | 97 | server | `lib/messaging` | `lib/modules/messaging/whatsapp-cloud-api.ts` | `packages/messaging` |
| `lib/creative-canvas.ts` | 692 | client/shared | `app/merchant` | `lib/modules/merchant/creative-canvas.ts` | `packages/ui` |
| `lib/standee-stylish-generator.ts` | 177 | client/shared | `app/admin` | `lib/modules/merchant/standee-generator.ts` | `packages/ui` |
| `lib/business-catalog.test.mjs` | 140 | test | — | `lib/modules/merchant/__tests__/business-catalog.test.mjs` | `packages/core` |
| `lib/business-location.test.mjs` | 127 | test | — | `lib/modules/merchant/__tests__/business-location.test.mjs` | `packages/core` |
| `lib/business-types.test.mjs` | 41 | test | — | `lib/modules/merchant/__tests__/business-types.test.mjs` | `packages/core` |
| `lib/merchant-social.test.mjs` | 36 | test | — | `lib/modules/merchant/__tests__/merchant-social.test.mjs` | `packages/core` |
| `lib/plan-rules.test.mjs` | 137 | test | — | `lib/modules/merchant/__tests__/plan-rules.test.mjs` | `packages/core` |

*(Note: 26 entries above = 21 non-test + 5 tests in Merchant/Catalog/Messaging.)*

### 2.5 Public Discovery, SEO, Customer Points & Reviews (`15` non-test + `8` tests)

| Current Path | Lines | Runtime | Inbound Areas | Wave 2 (`lib/modules/...`) | Wave 3+ Package |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `lib/public-discovery-domain.ts` | 412 | shared | `app/[city]`, `app/page.tsx`, `app/home-hero-search.tsx`, `lib/*` | `lib/modules/discovery/domain.ts` | `packages/core` |
| `lib/public-discovery.ts` | 158 | server+react | `app/[city]`, `app/sitemap.xml`, `app/sitemaps`, `lib/*` | `lib/modules/discovery/queries.server.ts` | `packages/orders` / `apps/web` |
| `lib/public-discovery-seo.ts` | 170 | shared | `app/[city]`, `app/layout.tsx`, `app/page.tsx`, `app/robots.ts`, `app/trustit`, `lib/*` | `lib/modules/discovery/seo.ts` | `packages/core` |
| `lib/public-discovery-sitemap.ts` | 34 | shared | `app/sitemap.xml`, `app/sitemaps`, tests | `lib/modules/discovery/sitemap.ts` | `packages/core` |
| `lib/trustit-public-info.ts` | 41 | shared | `app/about`, `app/contact`, `app/pricing`, `app/privacy-policy`, `app/refund-policy`, `app/register`, `app/terms`, `app/trustit`, `app/components` | `lib/modules/discovery/public-info.ts` | `packages/core` |
| `lib/trustit-qr.ts` | 14 | shared | `app/merchant` | `lib/modules/discovery/qr-url.ts` | `packages/core` |
| `lib/safe-review-link.ts` | 23 | shared | 14 callers (`app/*`, `lib/*`) | `lib/modules/discovery/safe-review-link.ts` | `packages/core` |
| `lib/customer-points.ts` | 17 | shared | `app/api`, `components/admin`, `components/customer`, tests | `lib/modules/customer/points.ts` | `packages/core` |
| `lib/gemini-review-provider.ts` | 87 | server/shared | `lib/review-draft-provider.ts` | `lib/modules/ai/gemini-review-provider.ts` | `packages/ai` |
| `lib/review-draft-provider.ts` | 402 | shared/server | `app/r`, `lib/gemini-review-provider.ts`, tests | `lib/modules/ai/review-draft-provider.ts` | `packages/ai` |
| `lib/review-generation-execution.ts` | 43 | shared | `app/r`, tests | `lib/modules/ai/review-generation-execution.ts` | `packages/ai` |
| `lib/review-generation-guards.ts` | 69 | shared | `app/r`, tests | `lib/modules/ai/review-generation-guards.ts` | `packages/ai` |
| `lib/google-review-handoff.ts` | 75 | shared | `app/r`, tests | `lib/modules/customer/google-review-handoff.ts` | `packages/core` |
| `lib/trustit-review-validation.ts` | 51 | shared | `app/r`, tests | `lib/modules/customer/review-validation.ts` | `packages/core` |
| `lib/synthetic-review-evaluation.mjs` | 30 | test-helper | `lib/trustit-three-features.test.mjs` | `lib/modules/ai/__tests__/synthetic-review-evaluation.mjs` | `packages/ai` |
| `lib/public-discovery.test.mjs` | 147 | test | — | `lib/modules/discovery/__tests__/public-discovery.test.mjs` | `packages/core` |
| `lib/public-discovery-seo.test.mjs` | 195 | test | — | `lib/modules/discovery/__tests__/public-discovery-seo.test.mjs` | `packages/core` |
| `lib/review-draft-provider.test.mjs` | 541 | test | — | `lib/modules/ai/__tests__/review-draft-provider.test.mjs` | `packages/ai` |
| `lib/google-verification.test.mjs` | 23 | test | — | `lib/modules/customer/__tests__/google-verification.test.mjs` | `packages/core` |
| `lib/customer-points.test.mjs` | 29 | test | — | `lib/modules/customer/__tests__/customer-points.test.mjs` | `packages/core` |
| `lib/customer-ux-fixes.test.mjs` | 139 | test | — | `lib/modules/customer/__tests__/customer-ux-fixes.test.mjs` | `packages/core` |
| `lib/customer/customer-superapp-32screens.test.mjs` | 102 | test | — | `lib/modules/customer/__tests__/customer-superapp-32screens.test.mjs` | `packages/core` |
| `lib/trustit-three-features.test.mjs` | 113 | test | — | `lib/modules/ai/__tests__/trustit-three-features.test.mjs` | `packages/ai` |

### 2.6 Trustit AI Studio (`lib/trustit-ai/`) (`13` non-test + `2` tests)

| Current Path | Lines | Runtime | Inbound Areas | Wave 2 (`lib/modules/...`) | Wave 3+ Package |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `lib/trustit-ai/provider-contracts.ts` | 63 | shared | `app/merchant`, `lib/trustit-ai` | `lib/modules/ai/qr-studio/provider-contracts.ts` | `packages/ai` |
| `lib/trustit-ai/provider-config.ts` | 18 | shared | `app/merchant`, `lib/trustit-ai` | `lib/modules/ai/qr-studio/provider-config.ts` | `packages/ai` |
| `lib/trustit-ai/openai-image-provider.ts` | 25 | server | `lib/trustit-ai` | `lib/modules/ai/qr-studio/openai-image-provider.ts` | `packages/ai` |
| `lib/trustit-ai/openai-image-request.ts` | 44 | shared | `lib/trustit-ai` | `lib/modules/ai/qr-studio/openai-image-request.ts` | `packages/ai` |
| `lib/trustit-ai/openai-image-response.ts` | 31 | shared | `lib/trustit-ai` | `lib/modules/ai/qr-studio/openai-image-response.ts` | `packages/ai` |
| `lib/trustit-ai/mock-image-provider.ts` | 65 | shared | `lib/trustit-ai` | `lib/modules/ai/qr-studio/mock-image-provider.ts` | `packages/ai` |
| `lib/trustit-ai/mock-storage.ts` | 42 | shared | `lib/trustit-ai` | `lib/modules/ai/qr-studio/mock-storage.ts` | `packages/ai` |
| `lib/trustit-ai/qr-design-assets.server.ts` | 180 | server | `app/merchant` | `lib/modules/ai/qr-studio/qr-design-assets.server.ts` | `packages/ai` |
| `lib/trustit-ai/qr-design-theme.ts` | 203 | shared | `app/merchant`, `lib/trustit-ai` | `lib/modules/ai/qr-studio/qr-design-theme.ts` | `packages/ai` |
| `lib/trustit-ai/theme-generator.ts` | 7 | shared | `lib/trustit-ai` | `lib/modules/ai/qr-studio/theme-generator.ts` | `packages/ai` |
| `lib/trustit-ai/supabase-storage-path.ts` | 57 | shared | `lib/trustit-ai` | `lib/modules/ai/qr-studio/supabase-storage-path.ts` | `packages/ai` |
| `lib/trustit-ai/supabase-storage.ts` | 52 | server | `lib/trustit-ai` | `lib/modules/ai/qr-studio/supabase-storage.ts` | `packages/ai` |
| `lib/trustit-ai/supabase-storage.server.ts` | 53 | server+supabase | 0 (audit vs `supabase-storage.ts`) | `lib/modules/ai/qr-studio/supabase-storage.server.ts` | `packages/ai` |
| `lib/trustit-ai/openai-image-provider.test.mjs` | 91 | test | — | `lib/modules/ai/__tests__/openai-image-provider.test.mjs` | `packages/ai` |
| `lib/trustit-ai/trustit-ai.test.mjs` | 230 | test | — | `lib/modules/ai/__tests__/trustit-ai.test.mjs` | `packages/ai` |

### 2.7 Native Bridge, Audio, Hardware & Shared Core (`8` flat + `28` existing `lib/modules/*` + `1` test)

| Current Path | Lines | Runtime | Inbound Areas | Wave 2 (`lib/modules/...`) | Wave 3+ Package |
| :--- | :---: | :--- | :--- | :--- | :--- |
| `lib/native/trustit-native-service.ts` | 448 | client | `app/merchant`, `app/order`, `app/rider` | `lib/modules/shared/native/trustit-native-service.ts` | `packages/native-bridge` |
| `lib/thermal-printer.ts` | 230 | client/shared | `app/test-flight` | `lib/modules/shared/native/thermal-printer.ts` | `packages/native-bridge` |
| `lib/audio/merchant-siren.ts` | 167 | client | `app/merchant`, `lib/native` | `lib/modules/merchant/siren.ts` | `packages/native-bridge` |
| `lib/audio/rider-siren.ts` | 216 | client | `app/rider`, `app/rider-app`, `app/rider-preview`, `app/test-flight` | `lib/modules/rider/siren.ts` | `packages/native-bridge` |
| `lib/audio-chime.ts` | 112 | client | 0 (candidate for deprecation) | Audit & archive/remove in Wave 2 | — |
| `lib/config.ts` | 47 | shared | `app/api`, `app/merchant`, `app/register`, `lib/*` | `lib/modules/shared/config.ts` | `packages/core` |
| `lib/types.ts` | 39 | shared | `app/admin`, `app/businesses`, `app/merchants`, `app/qr-codes`, `lib/data.ts` | `lib/modules/shared/types.ts` | `packages/core` |
| `lib/data.ts` | 32 | shared | `app/businesses`, `app/qr-codes` | `lib/modules/admin/legacy-business-data.ts` | `apps/admin` |
| `lib/modules/index.ts` | 11 | shared | 0 | `lib/modules/index.ts` *(keep)* | `packages/core` |
| `lib/modules/{admin,customer,merchant,rider}/index.ts` (4 files) | 9 ea | shared | `lib/modules` | Keep as domain barrels | `packages/orders` / `packages/auth` |
| `lib/modules/{admin,customer,merchant,rider}/permissions.ts` (4 files) | 22–32 | shared | `lib/modules` | Keep & wire into `app/api/**` | `packages/auth` |
| `lib/modules/{admin,customer,merchant,rider}/services.ts` (4 files) | 31–78 | server | `lib/modules` | Consolidate with legacy `lib/` services | `packages/orders` |
| `lib/modules/{admin,customer,merchant,rider}/types.ts` (4 files) | 17–53 | shared | `lib/modules` | Merge into `packages/core` domain types | `packages/core` |
| `lib/modules/shared/index.ts` + `services/{index,database,location,payment}.ts` (5 files) | 7–20 | mixed | `lib/modules` | Keep as shared service facades | `packages/db`, `packages/payments` |
| `lib/modules/shared/components/{index,currency,currency-format,delivery-chip,status-pill,trust-badge}.tsx/ts` (6 files) | 10–37 | client/shared | `lib/modules` | Keep as shared UI primitives | `packages/ui` |
| `lib/modules/modules-architecture.test.mjs` | 78 | test | — | `lib/modules/modules-architecture.test.mjs` *(keep)* | `packages/core` |

*(Inventory reconciliation: §2.1 `19+1`, §2.2 `13+4`, §2.3 `19+4`, §2.4 `21+5`, §2.5 `15+8`, §2.6 `13+2`, §2.7 `36+1` = **136 non-test + 25 test = 161 total files**.)*

---

## 3. Wave 2 Modular Monolith Refactor Strategy (Zero-Breakage Execution)

Moving 100+ files at once causes merge conflicts and breaks tests. Wave 2 will execute in **3 safe, verifiable phases** after Wave 1 Security (`Team 1`) and Android (`Team 3`) PRs merge:

### Phase 2A — Build Hygiene & `ignoreBuildErrors: false`
1. Run `npx next typegen && pnpm typecheck` and fix any generated-route type discrepancies.
2. Coordinate with Team 1 on `next.config.ts` to flip `typescript: { ignoreBuildErrors: false }`.
3. Verify `pnpm build` passes cleanly.
4. Reorganize `scripts/` (28 files) into functional subfolders and update `package.json`:
   - `scripts/build/` (`build_all_three_apps.mjs`, `build_customer_native_apk.mjs`, `build_partner_native_apk.mjs`, `build_rider_native_apk.mjs`, `prepare_embedded_bundle.mjs`, `generate_splash_screens.mjs`, `package-customer-ota.mjs`, `package-rider-ota.mjs`, `publish_partner_ota.mjs`)
   - `scripts/seed/` (`generate-catalog-seed.mjs`, `generate-huge-bahraich-seed.mjs`, `generate-huge-catalog-seed.mjs`, `generate-seed-sql.mjs`, `curate_one_vendor_per_category.mjs`, `seed_bahraich.sql`, `seed_catalog_items.sql`, `seed_huge_dataset.sql`, `new_businesses.json`)
   - `scripts/audit/` (`verify-public-indexability.mjs`, `verify_all_merchant_buttons.mjs`, `verify_compiled_apk.mjs`, `check-fast2sms-whatsapp.mjs`, `check_jwt.mjs`, `capture_corrected_screens.mjs`, `inspect.mjs`, `inspect_db.cjs`)
   - `scripts/utils/` (`generate-stitch-manifest.js`, `merchant_runtime_config.json`)

### Phase 2B — Domain Consolidation + Backward-Compatible Shims
1. For each domain (`payments`, `orders`, `auth`, `merchant`, `discovery`, `ai`, `messaging`, `shared`), move implementation files into `lib/modules/<domain>/`.
2. Leave thin deprecation re-export shims at high-fan-in legacy paths (`lib/supabase-admin.ts`, `lib/merchant-auth.ts`, `lib/cashfree.ts`, `lib/safe-review-link.ts`) during transition so existing imports never break mid-wave.
3. Convert `.mjs` + `.d.mts` pairs (`lib/cashfree-payment-attempts.mjs`, `lib/merchant-invite-completion.mjs`) to native `.ts` modules.
4. Audit and prune verified dead files (`lib/audio-chime.ts`, unused `lib/supabase-merchant-browser.ts`, duplicate `lib/trustit-ai/supabase-storage.server.ts`).
5. **Wire `lib/modules/*/permissions.ts` and shared validation contracts** into `app/api/**/route.ts` and Server Actions so UI forms and API routes validate identical schemas (using lightweight typed validators or `zod` in `lib/modules/shared/validation/`).

### Phase 2C — Boundary Enforcement & Shim Removal
1. Add `import "server-only"` (or ESLint `no-restricted-imports`) on `lib/modules/shared/db/admin.ts`, `lib/modules/payments/*`, and `lib/modules/auth/*-unified-auth.ts` to guarantee zero accidental bundling into Capacitor client shells.
2. Codemod remaining `@/lib/...` imports to `@/lib/modules/...`, remove transitional shims, and re-run `pnpm typecheck`, `pnpm test`, and `pnpm build`.

---

## 4. Target Monorepo Architecture (Wave 3+ Multi-App Split)

Once domain boundaries inside `lib/modules/` have zero cross-layer violations, split into a `pnpm` + Turborepo (`turbo.json`) workspace:

```text
trustit-monorepo/
├── apps/
│   ├── web/               # Next.js: Public SEO (/[city]/[category]), QR Review (/r/[id]), Customer Portal (/order, /app)
│   ├── merchant/          # Next.js: Merchant Dashboard (/merchant/**), Onboarding (/register/**), Checkout (/pay/**)
│   ├── rider/             # Next.js: Rider Partner App (/rider/**, /rider-app, /test-flight)
│   ├── admin/             # Next.js (Isolated Internal Auth): /admin/**, /analytics, /businesses, /merchants/**, /payments
│   ├── api/               # Dedicated Backend API (app/api/**): Cashfree webhooks, Cron, Hyperlocal, Merchant, Customer, Rider
│   ├── mobile-android/    # Capacitor Android Host (android/, capacitor.config.json, Gradle flavors: customer/partner/rider)
│   └── extension/         # Chrome Extension (extension/)
├── packages/
│   ├── core/              # Pure domain types, calculators, business catalog, plan rules, SEO slugs, validators (zero Node/Next deps)
│   ├── db/                # Supabase browser/server/admin/proxy factories + generated DB types
│   ├── auth/              # Unified Customer/Merchant/Rider/Admin session, OTP, rate-limiter, RBAC/IDOR guards
│   ├── payments/          # Cashfree client, webhook verification, wallet, hyperlocal splits, bank payouts
│   ├── orders/            # Hyperlocal service, dispatch engine, rider fleet engine, product orders, CRM
│   ├── ai/                # Gemini review drafts, OpenAI image generation, QR design studio
│   ├── messaging/         # Fast2SMS, WhatsApp Cloud API, Nodemailer templates
│   ├── ui/                # Shared React components (status-pill, trust-badge, currency, ota-update-banner)
│   ├── native-bridge/     # Capacitor TrustitNativeBridge wrapper, thermal printer, merchant/rider sirens
│   └── tsconfig/          # Base tsconfig presets (nextjs, react-library, node-service)
├── archive/
│   └── legacy-static/     # Archived static HTML/JS prototypes
├── pnpm-workspace.yaml
└── turbo.json
```

### Target `pnpm-workspace.yaml`
```yaml
packages:
  - "apps/*"
  - "packages/*"

allowBuilds:
  core-js: false
```

### Target Package Dependency DAG (Acyclic)
- `packages/core` -> *(no internal workspace deps; pure TS)*
- `packages/db`, `packages/ui`, `packages/native-bridge` -> `packages/core`
- `packages/messaging`, `packages/ai` -> `packages/core`, `packages/db`
- `packages/auth` -> `packages/core`, `packages/db`, `packages/messaging`
- `packages/payments`, `packages/orders` -> `packages/core`, `packages/db`, `packages/auth`, `packages/messaging`
- `apps/api` -> `packages/{core,db,auth,payments,orders,ai,messaging}`
- `apps/{web,merchant,rider,admin}` -> `packages/{core,ui,auth,native-bridge}` (+ typed API client to `apps/api`; `apps/web` & `apps/merchant` & `apps/admin` SSR layers may consume `packages/{orders,payments,ai}` until all mutations route exclusively through `apps/api`)
- `apps/mobile-android` -> consumes static/embedded shells built from `apps/web` (Customer), `apps/merchant` (Partner), and `apps/rider` (Rider), talking strictly to `apps/api` over HTTPS.

---

## 5. Identified Architectural Coupling Risks & Remediation

1. **Service-Role Client Leakage (`lib/supabase-admin.ts` — 62 callers):**
   Currently imported directly by UI route folders (`app/merchant`, `app/admin`, `app/register`, `app/r`) alongside `app/api`. Before splitting `apps/api`, all `createSupabaseAdminClient()` usage must live exclusively in server-only modules/route handlers and never be transitively imported by `"use client"` components.
2. **Monolithic Payment & Email Modules (`lib/cashfree.ts` 1,091 lines, `lib/auth/email-service.ts` 955 lines):**
   `lib/cashfree.ts` mixes pure environment/signature helpers with Cashfree HTTP calls and DB updates. Split pure helpers (`packages/payments/pure`) from server SDK/DB orchestration so `node --test` and browser validation never pull Node `crypto` or server secrets.
3. **Next.js Coupling in Domain Helpers (`lib/merchant-auth.ts`, `lib/public-discovery.ts`):**
   34 files import `lib/merchant-auth.ts`, which directly imports `next/headers` / `next/navigation` / `react` (`cache()`). Extracting cookie/header adapters via dependency injection allows `packages/auth` and `packages/orders` to run cleanly in `apps/api` (even if `apps/api` later moves to Hono/Fastify/Express) and unit tests without Next.js mocks.
4. **Root Static & Scratch Artifacts:**
   - Moved to `archive/legacy-static/`: `index.html`, `activity-logs.html`, `admin-users.html`, `analytics.html`, `businesses.html`, `notifications.html`, `payments.html`, `qr-codes.html`, `renewals.html`, `settings.html`, `data.js`.
   - Remaining root file to review with owner: `data-supabase-ready.js.txt` (unreferenced by `app/`, `lib/`, `extension/`, `scripts/`).
   - No `loom*` untracked files were present in this worktree.

---

## 6. Phased Migration Checklist & Gates

| Phase | Scope | Exit Gate |
| :--- | :--- | :--- |
| **Wave 1 (Done)** | Archive 11 legacy static root files; complete 161-file `lib/` inventory & blueprint | `pnpm typecheck` exits `0`; 0 broken refs |
| **Wave 2** | `ignoreBuildErrors: false`; organize `scripts/`; consolidate `lib/` into `lib/modules/*` with shims & typed validators | `pnpm typecheck`, `pnpm test`, `pnpm build` all pass |
| **Wave 3** | Convert to `pnpm-workspace.yaml` (`apps/*`, `packages/*`) + `turbo.json`; extract `packages/core`, `packages/db`, `packages/auth`, `packages/payments`, `packages/ui` | `turbo run typecheck test build` passes across packages |
| **Wave 4** | Split `apps/api`, `apps/web`, `apps/merchant`, `apps/rider`, `apps/admin`; point Capacitor Android flavors at `apps/api` | Independent CI/deploy pipelines per app + APK smoke verification |
