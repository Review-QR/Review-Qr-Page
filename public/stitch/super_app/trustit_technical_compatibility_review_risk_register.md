# TRUSTIT Super App — Technical Compatibility Review & Risk Register (v2.0 Handoff Audit)

**Target Artifact**: TRUSTIT Super App Frontend Developer Handoff Specification (v2.0)  
**Review Target Stack**: Next.js (App Router), Supabase (Auth/DB/Realtime), Cashfree Payments, Vercel  
**Design System Baseline**: Kinetic Trust (`Plus Jakarta Sans`, `#0d47a1`, Light Palette)  
**Date**: October 2026 / Active Milestone Audit  
**Document Status**: Engineering Architecture Review & Gap Analysis  

---

## 1. Executive Summary & Assessment Methodology

This review audits the architectural assumptions made in the **Frontend Developer Handoff Specification (v2.0)** against real-world engineering constraints of the TRUSTIT production system. 

The primary objective is to separate what is **VERIFIED** by concrete project artifacts (the 18 rendered mobile screens, the `Kinetic Trust` design tokens, and the baseline stack declaration), what is **PROPOSED** as sound frontend architecture, and what strictly **NEEDS CODEBASE VERIFICATION** before any developer writes code or initiates schema migrations.

### Verification Classification Taxonomy
- **`[VERIFIED]`**: Confirmed by tangible UI screens, tokens, or explicit user-supplied stack constraints (Next.js, Supabase, Cashfree, Vercel).
- **`[PROPOSED]`**: Recommended design/frontend pattern that represents best practice but has not yet been codified or committed in source code.
- **`[NEEDS CODEBASE VERIFICATION]`**: Backend endpoint, database table/column, RPC routine, gateway webhook, package version, or repository structure that cannot be confirmed from design artifacts alone.

> **Zero-Rewrite Mandate**: Under no circumstances should backend schemas, active database migrations, or deployed API services be modified solely to fit UI naming conventions without empirical codebase audit.

---

## 2. Deep-Dive Architecture Review by Domain

### 2.1 Proposed Architecture vs. Existing Architecture

| Dimension | Specification (v2.0 Handoff) | Existing Codebase Reality / Evidence | Technical Classification | Required Engineering Verification |
|---|---|---|---|---|
| **Frontend Framework** | Next.js 15+ App Router with Turbopack & React Server Components | Production stack uses Next.js, but version (Pages vs App Router, v14 vs v15) is unspecified | `[NEEDS CODEBASE VERIFICATION]` | Inspect root `package.json` for `"next": "^14.x"` vs `"^15.x"` and determine if existing codebase uses `/app` or `/pages`. |
| **Backend & Persistence** | Supabase PostgreSQL + Auth + Realtime + Storage | Confirmed in stack baseline, but table schemas, RLS rules, and extension versions are uncommitted | `[NEEDS CODEBASE VERIFICATION]` | Audit existing Supabase project dashboard, migrations folder (`supabase/migrations`), and active schema extensions (`pgvector`, `postgis`). |
| **Payment Gateway** | Cashfree Payments Web SDK / UPI Intent + FastRail Instant Webhooks | Confirmed in stack baseline, but integration mode (Hosted Checkout vs Embedded Component vs PG React SDK) is unknown | `[NEEDS CODEBASE VERIFICATION]` | Inspect existing payment helper libraries (`cashfree-sdk` or `@cashfreepayments/cashfree-js`) and active Cashfree API version (v2023-08-01). |
| **Hosting & Edge Infrastructure** | Vercel Edge Middleware + Turbopack + Vercel Blob | Confirmed Vercel deployment; middleware usage for auth/geo-routing is hypothetical | `[PROPOSED]` | Verify whether middleware already exists in `middleware.ts` or if edge compute limits (1MB bundle size on free/pro tiers) are impacted. |

---

### 2.2 Multi-App Monorepo vs. Existing Repository Structure

| Dimension | Specification (v2.0 Handoff) | Existing Codebase Reality / Evidence | Technical Classification | Required Engineering Verification |
|---|---|---|---|---|
| **Repository Topology** | Unified Monorepo (Turborepo / pnpm workspaces) housing Customer, Merchant, Admin, and Rider apps | Unconfirmed whether repository is a single polyrepo, a legacy standalone app, or an existing monorepo | `[NEEDS CODEBASE VERIFICATION]` | Check root folder structure for `turbo.json`, `pnpm-workspace.yaml`, or separate Git repositories per application. |
| **Application Split** | Four distinct apps sharing a `/packages/ui` design system package | Customer UI is fully designed (18 screens); Merchant, Admin, and Rider screens exist only as inventory specs | `[PROPOSED]` | Determine whether Merchant, Admin, and Rider apps should live as sub-routes (`/merchant`, `/admin`, `/rider`) within a single Next.js app or as isolated workspace apps (`apps/web-customer`, `apps/web-merchant`, etc.). |
| **Shared Code Distribution** | Shared types (`@trustit/types`), shared UI (`@trustit/ui`), shared config (`@trustit/tailwind-config`) | Design tokens exist in `DESIGN.md`; npm package linking not yet verified | `[PROPOSED]` | Confirm if shared package bundling via tsup or direct TypeScript source transpile (`transpilePackages`) is supported in build tooling. |

---

### 2.3 Next.js Version Compatibility & App Router Feasibility

| Dimension | Specification (v2.0 Handoff) | Technical Reality & Friction Points | Technical Classification | Required Engineering Verification |
|---|---|---|---|---|
| **App Router Migration** | All routes mapped to App Router nested directories (`app/(customer)/(tabs)/...`) | If existing codebase runs on Pages Router (`pages/*`), moving to App Router introduces breaking layout & hydration shifts | `[NEEDS CODEBASE VERIFICATION]` | Run `ls src/app src/pages` to determine current router paradigm. Do not force App Router migration if live production is stable on Pages Router. |
| **React 19 / Next 15 Server Actions** | Heavy reliance on Server Actions for checkout (`/api/checkout/create-order`) and Cashfree session init | Next 15 breaking changes (asynchronous `cookies()`, `headers()`, and `params`) can break existing API handlers if migrated prematurely | `[PROPOSED]` | Audit async route handler signatures across existing Next.js API endpoints. |
| **Dynamic Device Viewports** | Mobile Customer App rendered at 390px viewport inside responsive Next.js web container | Confirmed 18 screens designed for 390px mobile viewport (`Kinetic Trust` system) | `[VERIFIED]` | Ensure wrapper containers apply `max-w-md mx-auto min-h-screen` when rendered on standard desktop browser viewports. |

---

### 2.4 Shared Authentication Strategy

| Dimension | Specification (v2.0 Handoff) | Technical Reality & Security Risks | Technical Classification | Required Engineering Verification |
|---|---|---|---|---|
| **Customer Phone Auth (OTP)** | `supabase.auth.signInWithOtp({ phone: '+91...' })` with Indian SMS gateway & WhatsApp fallback | Supabase native phone auth requires third-party SMS providers (Twilio, MessageBird, or Exotel). Native Indian DLT registration is mandatory | `[NEEDS CODEBASE VERIFICATION]` | Verify configured SMS provider in Supabase Dashboard (Auth -> SMS Providers) and check if DLT entity IDs / SMS templates are approved by TRAI in India. |
| **Cross-Interface Session Cookies** | Single auth domain sharing session cookies across Customer, Merchant, Admin, and Rider portals | If interfaces are deployed to subdomains (`admin.trustit.in`, `app.trustit.in`), standard cookies are isolated unless `Cookie domain=.trustit.in` is configured | `[PROPOSED]` | Check cookie domain configuration in `createServerClient` from `@supabase/ssr`. |
| **Hardware MFA for Admin Portal** | Privileged TOTP / Hardware WebAuthn for Admin Super Users (`A-01` to `A-03`) | Supabase MFA supports TOTP, but hardware security keys (FIDO2/WebAuthn) require enterprise custom auth hooks | `[PROPOSED]` | Verify whether Supabase project plan supports custom MFA factors or if Google Workspace SSO is preferred for internal corporate admin auth. |

---

### 2.5 Supabase Database & RLS Compatibility

| Proposed Entity / Table | Document Assumption | Production Schema Risk | Technical Classification | Required Engineering Verification |
|---|---|---|---|---|
| `orders` | Foreign keys to `merchant_id`, `user_id`, `rider_id`; contains `handover_otp_hash` and `status` | Schema might use differing column names (`customer_id` vs `user_id`, `total_amount` vs `grand_total`) | `[NEEDS CODEBASE VERIFICATION]` | Run `\d orders` via Supabase SQL editor to inspect exact column definitions, foreign keys, and constraints. |
| `prescriptions` | Stores private patient image URLs and CDSCO Schedule H approval status | Health data requires strict HIPAA/DISHA data residency and signed URL expiration (< 15 mins) | `[NEEDS CODEBASE VERIFICATION]` | Verify whether a dedicated private bucket `prescriptions` exists in Supabase Storage with private RLS access only. |
| `refunds` & `merchant_settlements` | Holds 10-digit NPCI Bank UTRs (`3291884102`) and Cashfree reverse transfer batch IDs | Ledger data may currently be logged in a payment events audit table rather than isolated business tables | `[NEEDS CODEBASE VERIFICATION]` | Confirm if financial transaction ledgers exist or if refunds are logged as status transitions on the `payments` table. |
| **Row Level Security (RLS)** | Strict tenant isolation ensuring customers see only own orders, merchants see only own store data | RLS policies can cause silent query failures (empty arrays `[]`) instead of HTTP 403 errors if policies misalign with JWT claims | `[NEEDS CODEBASE VERIFICATION]` | Check existing `pg_policies` for active tables. Ensure `ENABLE ROW LEVEL SECURITY` is applied to all production tables. |

---

### 2.6 Existing API Reuse Requirements

| Area | Proposed API Contract in Handoff | Potential Conflict with Existing Codebase | Technical Classification | Verification Action |
|---|---|---|---|---|
| **RPC Functions** | `get_nearby_categories(lat, lng)`, `search_merchants_and_products()`, `verify_delivery_handover_otp()` | Stored procedures may not exist; backend may execute spatial queries via PostGIS or client-side bounding boxes | `[NEEDS CODEBASE VERIFICATION]` | Inspect Supabase Database -> Functions -> RPC definitions in live staging/production database. |
| **Catalog & Stock Toggles** | Direct mutation on `menu_items` table from Merchant Dashboard | Existing inventory may be synchronized from POS external integrations (Petpooja, UrbanPiper) rather than direct DB writes | `[NEEDS CODEBASE VERIFICATION]` | Confirm whether merchant inventory is managed natively or ingested via omnichannel aggregators. |
| **Realtime Subscriptions** | `supabase.channel('orders:order_id')` listening to driver GPS broadcast | Broadcasting high-frequency GPS coordinates (1-2 Hz) via Postgres Realtime can exhaust database connection pools | `[PROPOSED]` | Evaluate whether driver coordinates should route via Supabase Realtime Broadcast (ephemeral, zero DB writes) rather than row change listener (`postgres_changes`). |

---

### 2.7 Cashfree Integration Compatibility

| Dimension | Specification (v2.0 Handoff) | Technical Compatibility Reality | Technical Classification | Required Engineering Verification |
|---|---|---|---|---|
| **Order Creation Handshake** | Next.js Server Action invoking Cashfree PG Create Order API with idempotency key | Cashfree requires `order_amount`, `order_currency: "INR"`, `customer_details`, and return URLs | `[PROPOSED]` | Inspect existing server route (`/api/payment` or similar) to match expected payload formatting and API version headers. |
| **UPI Intent vs Web Checkout** | Native mobile UPI Intent triggering GPay/PhonePe directly without browser redirect | On mobile web (PWA/responsive Next.js), UPI Intent requires deep linking schemes (`upi://pay?...`) which behave differently on iOS vs Android | `[NEEDS CODEBASE VERIFICATION]` | Test Cashfree JS Web SDK Drop-in component behavior across mobile iOS Safari and Android Chrome for native UPI Intent compatibility. |
| **Webhook Reconciliation** | FastRail reverse IMPS/UPI refund webhook updates UI state in real time | Webhooks are asynchronous and can arrive out of order; Cashfree signature verification (`x-webhook-signature`) is required | `[NEEDS CODEBASE VERIFICATION]` | Verify that existing webhook listener verifies Cashfree cryptographic signatures using raw request body before updating database records. |
| **Inventory Hold Timer** | Strict 08:42 min inventory lock on payment drop-off | If backend doesn't implement a TTL reservation worker (e.g., Redis Upstash or PG cron), inventory may remain locked indefinitely | `[PROPOSED]` | Determine if an existing distributed lock / reservation mechanism exists in the codebase for stock reservation. |

---

### 2.8 Role-Based Access Control (RBAC) Separation

| User Role | Token Identity | Proposed Claim in Handoff | Reality & Implementation Feasibility | Classification |
|---|---|---|---|---|
| **Customer** | End-user mobile session | `auth.uid()` mapped to `public.user_profiles` | Standard Supabase user workflow | `[VERIFIED]` |
| **Merchant Admin** | Store manager / Kitchen | Custom claim `app_metadata.merchant_id` | Custom JWT claims in Supabase require Supabase Auth Hooks (`custom_access_token_hook`) | `[NEEDS CODEBASE VERIFICATION]` |
| **Rider Partner** | Delivery executive | Custom claim `role: 'rider_partner'` | Requires verified driver record and device token pairing | `[NEEDS CODEBASE VERIFICATION]` |
| **Platform Ops Admin** | Super admin / Grievance | Custom claim `role: 'super_admin'` | Must be locked down via Supabase service role key or separate internal admin schema | `[NEEDS CODEBASE VERIFICATION]` |

> **Security Rule**: User roles must never be stored in readable `user_metadata` on the client, as users can modify this payload. All privileged roles must reside in `app_metadata` or a protected `user_roles` table secured by RLS.

---

### 2.9 Shared Component Architecture & Design Token Alignment

| Component | Token Contract | UI Fidelity Status | Classification | Engineering Implementation Notes |
|---|---|---|---|---|
| `<TrustBadge />` | `Kinetic Trust` Emerald `#00875a` & Navy `#0d47a1` | Rendered across all 18 mobile screens (`SCREEN_4` through `SCREEN_38`) | `[VERIFIED]` | Ready to extract into reusable React component with SVG shield icon variants. |
| `<IndianCurrencyPrice />` | Plus Jakarta Sans font, INR symbol `₹`, strike-through MRP | Rendered on Storefront, Cart, Customization, and Success screens | `[VERIFIED]` | Standardize with `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`. |
| `<SteppedProgressBar />` | 8px radius, cyan/navy active stepper | Rendered on Checkout, Prep, and Refund screens | `[VERIFIED]` | Extract into shared component supporting arbitrary step stages and status states. |
| `<BottomNavigation5Tab />` | Fixed bottom mobile tab bar with Home, Explore, Orders, Activity, Profile | Present on all 5 persistent tab screens (`SCREEN_38`, `SCREEN_26`, `SCREEN_24`, `SCREEN_30`, `SCREEN_8`) | `[VERIFIED]` | Implemented in Shell components (`SHELL_9`, `SHELL_25`, `SHELL_27`, `SHELL_31`, `SHELL_39`). |

---

### 2.10 Vercel Deployment Strategy

| Dimension | Specification Assumption | Technical Compatibility Consideration | Classification |
|---|---|---|---|
| **Edge Middleware** | Auth verification & geofencing routed via Edge Middleware | Edge runtime has limited Node.js compatibility (no native `crypto` or TCP socket libraries). Supabase SSR client must use Fetch API | `[PROPOSED]` |
| **Static vs Dynamic Rendering** | Server Components with partial prerendering (PPR) | Hyper-local catalogs depend on user location cookies (`lat`, `lng`). Home Hub and Storefront are inherently dynamic (`force-dynamic` or short ISR) | `[PROPOSED]` |
| **Vercel Image Optimization** | Responsive AVIF/WebP conversion for restaurant and dish images | Image source domains (Supabase Storage bucket, CDN) must be explicitly listed in `next.config.js` under `images.remotePatterns` | `[PROPOSED]` |

---

### 2.11 Data Security, Access Boundaries & DPDP Act 2023

| Security Boundary | Specification Guardrail | Engineering Reality & Verification | Classification |
|---|---|---|---|
| **PIN Isolation (`4821`)** | Doorstep Handover PIN must NEVER appear in notification previews or logs | Verified in UI design (`SCREEN_4` notifications show masked PIN advisory; only `SCREEN_14` and `SCREEN_34` display plaintext PIN) | `[VERIFIED]` |
| **Phone Number Masking** | Driver and customer phone numbers routed through telephony bridge | Requires Exotel/Knowlarity or Twilio voice proxy integration `[NEEDS CODEBASE VERIFICATION]` | `[NEEDS CODEBASE VERIFICATION]` |
| **Prescription Access** | Signed URLs with max 15-min expiration for Schedule H drug verification | Supabase Storage `createSignedUrl(path, 900)` must be enforced in backend storage helpers | `[PROPOSED]` |
| **DPDP Compliance** | Account deletion and data export requests in Customer Profile | Requires automated batch deletion cascade across child relational tables (`user_consents`, `user_addresses`) | `[NEEDS CODEBASE VERIFICATION]` |

---

### 2.12 Migration Risks & Backward Compatibility

| Risk Category | Severity | Description & Potential Impact | Mitigation Strategy |
|---|---|---|---|
| **Schema Name Collision** | High | Handoff assumes table names `merchants`, `menu_items`, `orders`, `user_addresses`. Existing production database may use legacy table names (e.g., `stores`, `products`, `bookings`). | Do not run DDL migrations renaming existing tables. Map frontend React Query hooks to existing table names via an adapter layer. |
| **Cart State Desynchronization** | Medium | Local Zustand cart store may drift from live merchant stock if items sell out during checkout. | Execute a pre-flight cart validation RPC before redirecting to Cashfree checkout. |
| **Realtime Connection Spike** | Medium | Thousands of concurrent customer sessions subscribing to PostgreSQL change streams can saturate Supabase database pooled connections. | Use Supabase Realtime Broadcast channels (P2P routing over WebSockets) for live rider GPS pings instead of database change events. |

---

## 3. Comprehensive Technical Decision & Risk Register

| ID | Domain | Technical Decision / Assumption | Status | Impact Level | Action Required from Engineering Team |
|---|---|---|---|---|---|
| **DEC-01** | UI & Tokens | Use `Kinetic Trust` design tokens (`#0d47a1`, Plus Jakarta Sans, 8px radius) | `[VERIFIED]` | Low | Export CSS variables to `tailwind.config.ts` without alterations. |
| **DEC-02** | Customer Screens | Build exactly the 18 designed mobile screens (C-01 to C-18) | `[VERIFIED]` | Medium | Scaffold page components mapped to Next.js route tree. |
| **DEC-03** | Router Stack | Migrate directly to Next.js 15 App Router | `[NEEDS CODEBASE VERIFICATION]` | High | Check existing repo: if running Pages router, preserve Pages router and implement screens as page views. |
| **DEC-04** | Repository | Multi-app monorepo with 4 isolated applications | `[PROPOSED]` | High | Check if monorepo tooling (Turborepo) is already configured before separating codebases. |
| **DEC-05** | Database Tables | Assume tables `merchants`, `orders`, `prescriptions`, `refunds` | `[NEEDS CODEBASE VERIFICATION]` | Critical | Audit existing database schema before writing queries or Prisma/Kysely/Supabase models. |
| **DEC-06** | Stored Procedures | Assume RPCs `get_nearby_categories`, `verify_delivery_handover_otp` | `[NEEDS CODEBASE VERIFICATION]` | High | Check for existing SQL functions; if absent, implement via standard Next.js Server Actions. |
| **DEC-07** | Payment Flow | Cashfree UPI Intent with 08:42 min reservation lock | `[PROPOSED]` | High | Verify Cashfree PG SDK version and determine if Redis stock locking is available. |
| **DEC-08** | SMS Auth | Native Supabase Phone OTP with +91 Indian format | `[NEEDS CODEBASE VERIFICATION]` | Critical | Confirm TRAI DLT template registration with Indian SMS gateway provider. |
| **DEC-09** | PIN Security | Isolate Doorstep PIN `4821` from push notification payloads | `[VERIFIED]` | High | Enforce server-side notification trigger to exclude PIN field from notification data payload. |
| **DEC-10** | RBAC Auth Hooks | Supabase `custom_access_token_hook` for role claims | `[NEEDS CODEBASE VERIFICATION]` | Medium | Confirm if custom JWT claims hook is enabled or use database query table check. |

---

## 4. Next Steps & Recommended Action Plan

1. **Database Schema Extraction**: Export the live Supabase database schema (`supabase db dump --schema-only`) to generate true TypeScript types (`supabase gen types typescript`).
2. **Package.json Audit**: Run dependency check in the existing repository to lock Next.js, React, Tailwind, and Cashfree SDK versions.
3. **Adapter Layer Creation**: Map frontend data models to verified database table names without destructive schema renaming.
4. **Interactive Prototyping**: Connect the 18 validated mobile screens to mocked Supabase clients for developer sign-off prior to backend wire-up.
