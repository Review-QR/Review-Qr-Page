# TRUSTIT Super App — Final Engineering Decision Register & Architectural Governance (v2.0)

**Target Ecosystem**: TRUSTIT — India's Hyper-Local Multi-Service Super App  
**Baseline Tech Stack**: Next.js, Supabase (Auth, PostgreSQL, Realtime, Storage), Cashfree Payments, Vercel  
**Design System**: Kinetic Trust (`Plus Jakarta Sans`, `#0d47a1`, Light Surface Palette, 8px Roundness)  
**Date**: October 2026 / Active Engineering Milestone  
**Document Classification**: Architectural Governance, Technical Decision Register & Implementation Roadmap  
**Companion Documents**: 
- `{{DATA:DOCUMENT:DOCUMENT_3}}` (Frontend Developer Handoff Specification v2.0)
- `{{DATA:DOCUMENT:DOCUMENT_2}}` (Technical Compatibility Review & Risk Register v2.0)

---

## 1. Executive Summary & Architectural Governance Framework

This **Final Engineering Decision Register** establishes binding technical contracts for the TRUSTIT engineering team prior to sprint execution and codebase modification.

### Core Architectural Principles
1. **Empirical Codebase Primacy**: Design specifications, wireframes, and handoff guides articulate desired product behavior and visual contracts. However, **the live production codebase and database schema remain the single source of truth**. Under no circumstances should live database schemas, deployed API routes, or payment webhooks be rewritten to conform to frontend naming conventions without verifiable justification.
2. **Pragmatic Risk Mitigation**: Every recommendation is classified into a strict operational decision taxonomy:
   - **`ACCEPT`**: Technical approach is confirmed compatible, low-risk, verified by concrete artifacts, or represents necessary frontend isolation.
   - **`MODIFY`**: Proposed architecture requires pragmatic adjustment to prevent breaking production changes, performance bottlenecks, or security vulnerabilities.
   - **`DEFER`**: Architecture requires unconfirmed infrastructure changes or schema rewrites; execution must pause until explicit codebase evidence is extracted.
3. **Defense-in-Depth Security**: Strict isolation of customer PII (DPDP Act 2023), cryptographic protection of Doorstep Handover PINs (`4821`), and signed time-limited URLs for CDSCO Schedule H pharmaceuticals.

---

## 2. Comprehensive Engineering Decision Register (EDR)

---

### EDR-01: Multi-App Monorepo vs. Existing Repository Structure

* **Current Known Information**:
  The project inventory contains 18 fully rendered mobile screens for the Customer App (`C-01` to `C-18`), associated design tokens (`Kinetic Trust`), and documented specifications for Merchant (`M-01` to `M-04`), Admin (`A-01` to `A-03`), and Rider (`R-01` to `R-03`) interfaces. The root repository structure (single polyrepo, standalone Next.js app, or existing Turborepo/Nx workspace) is not empirically confirmed from code inspection.
* **Proposed Solution**:
  Adopt a unified monorepo architecture managed via Turborepo and pnpm workspaces:
  - `apps/web-customer`: Mobile Customer App (390px viewport container).
  - `apps/web-merchant`: Merchant KDS & store catalog dashboard.
  - `apps/web-admin`: Platform Ops, FSSAI verification & Grievance desk.
  - `apps/web-rider`: Rider duty & doorstep handover mobile app.
  - `packages/ui`: Shared design tokens, Tailwind preset, and reusable UI components.
  - `packages/types`: Shared TypeScript interfaces and Supabase database schemas.
* **Technical Justification**:
  Monorepos eliminate duplicate TypeScript types across client applications, standardize `Kinetic Trust` design tokens in a single source of truth, and ensure atomic CI/CD testing across shared libraries.
* **Risk If Implemented Incorrectly**:
  Migrating an active, deployed polyrepo into a Turborepo monorepo mid-milestone can freeze deployments, invalidate Vercel build root settings, introduce circular workspace dependencies, and delay Customer App launch by weeks.
* **Existing Project Compatibility**:
  Customer UI is 100% complete and isolated. Merchant, Admin, and Rider apps currently exist only as inventory specifications and backend contracts, meaning an immediate monorepo migration is premature if the existing codebase is a single Next.js application.
* **Required Verification Evidence**:
  - Run `ls -la` in repository root to inspect `turbo.json`, `pnpm-workspace.yaml`, or `lerna.json`.
  - Check whether multiple separate Git repositories currently exist for internal portals.
* **Recommended Decision**: **`MODIFY`**
  - **Action**: Implement Phase 1 Customer App inside the existing Next.js application structure (using route grouping or clean directory isolation `/app/(customer)`).
  - **Refactor Gate**: Defer physical repository partitioning into Turborepo until Phase 2, when Merchant and Rider frontends begin active implementation.

---

### EDR-02: Shared vs. Separate Application Routing (Next.js Paradigm)

* **Current Known Information**:
  The handoff specification maps all four portals into App Router route groups (`app/(customer)/*`, `app/(merchant)/*`, `app/(admin)/*`, `app/(rider)/*`). The actual Next.js router version (`Pages Router` in `pages/` vs `App Router` in `app/`, and Next 14 vs Next 15) in the current repository is unconfirmed.
* **Proposed Solution**:
  Isolate portal routing while preserving the router paradigm of the active codebase. If on App Router, utilize route groups with distinct root layout boundaries (`(customer)/layout.tsx`, `(merchant)/layout.tsx`) to avoid bundle leakage and shared state collisions.
* **Technical Justification**:
  Admin tables and data grids require heavy dependencies (e.g., TanStack Table, charting libraries) that must never be bundled into the lightweight mobile Customer or Rider bundles (target LCP < 1.8s on 4G).
* **Risk If Implemented Incorrectly**:
  Attempting to force an App Router migration on a live Pages Router application introduces breaking hydration errors, changes cookie handling paradigms (`cookies()` vs `req.cookies`), and can corrupt production SSR auth middleware.
* **Existing Project Compatibility**:
  The 18 Customer screens are self-contained HTML/CSS views styled with `Kinetic Trust` tokens, compatible with either App Router or Pages Router.
* **Required Verification Evidence**:
  - Inspect `package.json` for `"next": "^14.x.x"` vs `"next": "^15.x.x"`.
  - Check directory tree: `ls src/app src/pages`.
* **Recommended Decision**: **`ACCEPT` (with Router Preservation Clause)**
  - If `app/` exists: Implement Route Groups `(customer)` with dedicated root layout.
  - If `pages/` exists: Do not migrate to App Router; mount customer screens under `pages/` (e.g., `pages/customer/*` or root) to maintain zero production disruption.

---

### EDR-03: Authentication & Role Management (RBAC)

* **Current Known Information**:
  The production stack uses Supabase Auth. Customer authentication relies on Indian Mobile OTP (`+91 98765 43210`) with DPDP Act 2023 compliance. Privileged roles include `merchant_admin`, `rider_partner`, `super_admin`, and `compliance_auditor`.
* **Proposed Solution**:
  - Implement Supabase native Phone OTP for Customer and Rider logins.
  - Enforce privileged roles through Supabase **Custom Access Token (Auth) Hook** (`custom_access_token_hook`) or dedicated protected database table `public.user_roles` secured by Row Level Security (RLS).
  - Inject role claims directly into the decrypted JWT under `app_metadata.role` and `app_metadata.merchant_id`.
  - **Zero Trust Rule**: Never allow role claims to be set or read from mutable `user_metadata`.
* **Technical Justification**:
  Clients can update their own `user_metadata` via `supabase.auth.updateUser()`. Storing roles in `user_metadata` would allow any tech-savvy customer to escalate privileges to `merchant_admin` or `super_admin`. Storing roles in `app_metadata` or Postgres RLS prevents privilege escalation at the database engine level.
* **Risk If Implemented Incorrectly**:
  - Privilege escalation vulnerability permitting unauthorized order tampering or settlement diversion.
  - Indian SMS gateway failure if TRAI Distributed Ledger Technology (DLT) entity IDs and approved PE-TM SMS message templates are misconfigured in Supabase.
* **Existing Project Compatibility**:
  Customer Auth screen (`C-02` / `SCREEN_21`) is already designed with Indian phone prefix `+91`, 6-digit OTP matrix, timer countdown, and WhatsApp fallback UI.
* **Required Verification Evidence**:
  - Audit Supabase Dashboard under `Authentication -> Providers -> Phone` to verify configured SMS vendor (Twilio, MessageBird, Exotel).
  - Verify DLT registration status with Indian telecom operators for SMS template headers.
  - Check if `custom_access_token_hook` is active in `supabase/config.toml` or SQL extensions.
* **Recommended Decision**: **`MODIFY`**
  - Use `user_roles` relational table lookup with RLS policies as the primary RBAC baseline; do not assume custom Auth Hooks are enabled on the Supabase project tier until verified.

---

### EDR-04: Supabase Database, RLS Policies & Data Isolation

* **Current Known Information**:
  Handoff v2.0 references business tables: `merchants`, `menu_items`, `orders`, `order_items`, `prescriptions`, `service_slots`, `user_addresses`, `user_profiles`, `refunds`, and `merchant_settlements`. The existing database schema may use different naming conventions (e.g., `stores`, `products`, `bookings`).
* **Proposed Solution**:
  - **Zero-Rewrite Mandate**: Maintain the live database schema exactly as deployed.
  - Create a TypeScript **Frontend Adapter Layer** (`/lib/adapters/`) that maps live database table records to the standardized UI component props.
  - Apply strict Row Level Security (RLS) policies:
    * `orders`: Customers can `SELECT` only where `user_id = auth.uid()`.
    * `merchants`: Public can `SELECT` where `is_active = true`; Merchants can `UPDATE` only where `id = (auth.jwt() -> 'app_metadata' ->> 'merchant_id')`.
    * `prescriptions`: Strictly private. Only owning `user_id` and authorized pharmacists (`role = 'compliance_auditor'`) can read signed URLs.
* **Technical Justification**:
  Refactoring or renaming database tables in a live PostgreSQL instance breaks existing API queries, foreign key cascades, and data warehouse ETL pipelines. An adapter layer isolates UI changes from database realities.
* **Risk If Implemented Incorrectly**:
  - Silent query failures: In Supabase, queries that violate RLS return empty arrays `[]` rather than throwing HTTP 403 errors, leading to confusing empty screens on the client.
  - Data leakage: Missing RLS on `prescriptions` or `user_addresses` creates immediate non-compliance with the Digital Personal Data Protection (DPDP) Act 2023.
* **Existing Project Compatibility**:
  UI is fully designed with empty/loading states (`EmptySearchPerimeterCard`, skeleton shimmers) capable of handling adapter responses cleanly.
* **Required Verification Evidence**:
  - Execute `supabase db dump --schema-only` or query `information_schema.tables` in Supabase SQL editor to inspect all live table names, primary keys, and column types.
  - Query `pg_policies` to review existing active RLS rules.
* **Recommended Decision**: **`ACCEPT` (with Frontend Adapter Mandate)**
  - Do not execute DDL migrations renaming database entities. Implement data adapter mappings immediately upon schema extraction.

---

### EDR-05: Existing Order Management & State Machine Alignment

* **Current Known Information**:
  The Customer App defines a multi-vertical lifecycle spanning Food, Groceries, Pharmacy, and Services. Key states: `PLACED`, `ACCEPTED`, `PREPARING`, `READY_FOR_PICKUP`, `OUT_FOR_DELIVERY`, `DELIVERED`, `CANCELLED`. A 4-digit Doorstep Handover PIN (`4821`) is displayed on Order Success (`C-09`) and Live Tracking (`C-11`), while masked in notifications (`C-18`).
* **Proposed Solution**:
  - Normalize order state transitions through a strict backend state machine.
  - Implement atomic order state transitions via PostgreSQL functions or Next.js Route Handlers.
  - Handover PIN verification: Generate a SHA-256 hash of the 4-digit PIN upon order creation (`handover_pin_hash`). Verify PIN via database RPC `verify_delivery_handover_otp(order_id, pin)` where only successful hash matching transitions status to `DELIVERED`.
* **Technical Justification**:
  Client-side status mutations allow malicious actors or unreliable mobile network retries to prematurely mark orders as completed or trigger unauthorized refunds.
* **Risk If Implemented Incorrectly**:
  - Double fulfillment or inventory stock desynchronization.
  - PIN leakage in open API responses allowing premature order completion without physical doorstep delivery.
* **Existing Project Compatibility**:
  Verified in UI: Screens `C-09` (`SCREEN_15`) and `C-11` (`SCREEN_35`) render the PIN and status timeline, while `C-18` (`SCREEN_5`) displays the masked advisory.
* **Required Verification Evidence**:
  - Inspect current `orders` table column definitions for status enum values (`status::text` vs `order_status_enum`).
  - Check whether order state transitions are handled via direct Supabase client updates or dedicated server endpoints.
* **Recommended Decision**: **`ACCEPT`**
  - Standardize frontend state display against documented state machine while verifying exact status enum string values in database.

---

### EDR-06: Cashfree Payments, Idempotency & Settlements

* **Current Known Information**:
  The stack uses Cashfree Payments. The handoff specifies Cashfree PG Web/React SDK Drop-in, UPI Intent, instant reverse IMPS webhooks (FastRail), and an 08:42 min inventory lock on drop-off (`C-10` / `SCREEN_13`).
* **Proposed Solution**:
  - **Idempotent Order Creation**: Server Action `/api/checkout/create-order` creates Cashfree order session using idempotency key `idempotency_key = sha256(user_id + cart_checksum + session_id)`.
  - **Web Checkout Handshake**: On mobile web (responsive Next.js), initialize Cashfree Drop-in JS SDK (`@cashfreepayments/cashfree-js`). Handle native UPI deep links (`gpay://`, `phonepe://`) via Cashfree SDK standard intent wrappers.
  - **Webhook Security**: All state updates (`PAID`, `FAILED`, `USER_DROPPED`) must occur in an asynchronous webhook handler `/api/webhooks/cashfree` verifying cryptographic signature (`x-webhook-signature`) using the raw request body. Never trust client-reported payment success.
  - **Inventory Hold**: Use database TTL or Redis key with 08:42 minute expiration to hold items during payment retry.
* **Technical Justification**:
  Network fluctuations in India frequently disconnect users during UPI app transitions. Webhooks are the only reliable mechanism for payment reconciliation. Client-side idempotency keys prevent duplicate credit card or bank debits when users tap "Pay" multiple times.
* **Risk If Implemented Incorrectly**:
  - Duplicate merchant orders created for a single bank debit.
  - Man-in-the-middle payment spoofing if client callbacks update the database without signature validation.
  - Inventory locked permanently if stock reservation has no automated TTL release worker.
* **Existing Project Compatibility**:
  - `C-08` (`SCREEN_37`): Cart & Checkout with itemized GST and UPI option.
  - `C-10` (`SCREEN_13`): Payment Failed with 08:42 countdown timer and `ERR_NPCI_TIMEOUT_104` diagnostic card.
  - `C-12` (`SCREEN_17`): Instant Refund Tracker displaying NPCI UTR `3291884102`.
* **Required Verification Evidence**:
  - Inspect existing Cashfree integration: check API version headers (e.g., `2023-08-01` vs legacy `2022-09-01`).
  - Verify Cashfree App ID and Secret Key configuration in Vercel environment variables.
  - Check whether Cashfree Payouts API is provisioned for merchant daily settlements.
* **Recommended Decision**: **`ACCEPT` (with Server-Side Webhook Verification Requirement)**
  - Client checkout UI is approved; all financial status changes must be strictly webhook-driven.

---

### EDR-07: Rider Location Tracking & High-Frequency GPS Architecture

* **Current Known Information**:
  The Customer Live Tracking screen (`C-11` / `SCREEN_35`) features real-time route visualization across Bengaluru, driver details (Rajesh Kumar), ETA countdown, and phone masking bridge. The handoff proposed listening via Supabase Realtime channel `orders:order_id`.
* **Proposed Solution**:
  - **Supabase Realtime Broadcast**: Utilize Supabase Realtime **Broadcast channels** (WebSocket P2P message passing) for live rider GPS pings (1–2 Hz), rather than Postgres Change Data Capture (`postgres_changes` row listeners).
  - Geolocation coordinates (`lat`, `lng`, `heading`, `speed`) are transmitted ephemerally to the channel without writing every single coordinate ping to the PostgreSQL disk.
  - Milestone coordinates (Store Arrival, Handover Complete) are saved to the persistent `order_tracking_events` table.
* **Technical Justification**:
  Broadcasting GPS coordinates at 1–2 second intervals from hundreds of delivery riders generates thousands of database writes per minute. If routed through PostgreSQL row changes, it rapidly exhausts Supabase connection pools, inflates database WAL logs, and degrades checkout query performance. Realtime Broadcast passes messages through WebSockets at the edge with **zero database load**.
* **Risk If Implemented Incorrectly**:
  Database server CPU saturation, connection pool exhaustion (`Max client connections reached`), and site-wide database latency spikes during peak meal ordering hours (1 PM / 8 PM).
* **Existing Project Compatibility**:
  Screen `C-11` (`SCREEN_35`) is built to receive coordinate updates and update rider polyline and ETA dynamically.
* **Required Verification Evidence**:
  - Check Supabase project plan limits on Realtime concurrent connections.
  - Verify mapping library in codebase (Mapbox GL JS, Google Maps JS API, or Leaflet).
* **Recommended Decision**: **`MODIFY`**
  - **Mandate Realtime Broadcast**: Explicitly prohibit continuous database row writes for driver GPS coordinates. Use ephemeral WebSockets for live movement and database writes only for status milestone transitions.

---

### EDR-08: Realtime Order Status Synchronization

* **Current Known Information**:
  Real-time synchronization is required between Merchant Kitchen Display System (`M-02`), Customer Live Order Tracking (`C-11`), Orders Hub (`C-14`), and Notification Centre (`C-18`).
* **Proposed Solution**:
  - Use Supabase Realtime `postgres_changes` listening specifically for `UPDATE` events on `orders` where `id = eq.{order_id}` and `user_id = eq.{auth.uid()}`.
  - Filter payloads using Supabase Realtime row-level security filters.
  - Update TanStack Query cache optimistically upon receipt of valid event payload.
* **Technical Justification**:
  Order status transitions (`ACCEPTED` -> `PREPARING` -> `OUT_FOR_DELIVERY`) are low-frequency, high-value state changes that require durability and auditability in PostgreSQL.
* **Risk If Implemented Incorrectly**:
  Customers sitting on stale tracking screens requiring manual page refreshes, causing anxiety and repeated inbound support chat tickets to the 24x7 help desk.
* **Existing Project Compatibility**:
  UI components across `SCREEN_35` (Live Tracking) and `SCREEN_5` (Notification Centre) are already built to react to status events with animated steppers.
* **Required Verification Evidence**:
  - Verify that the `orders` table is added to the `supabase_realtime` publication in PostgreSQL: `ALTER PUBLICATION supabase_realtime ADD TABLE orders;`.
* **Recommended Decision**: **`ACCEPT`**
  - Fully compatible with Supabase architecture. Requires publication verification.

---

### EDR-09: Vercel Deployment & Environment Separation

* **Current Known Information**:
  The production application is hosted on Vercel. Handoff v2.0 proposed Edge Middleware for auth verification and geofencing, partial prerendering (PPR), and Vercel Blob storage.
* **Proposed Solution**:
  - **Environment Matrix**: Strict three-tier environment separation:
    * `Development`: Local machines connected to local Supabase CLI (`supabase start`) and Cashfree Sandbox.
    * `Preview`: Vercel preview branch deployments connected to Supabase Staging project and Cashfree Sandbox.
    * `Production`: Main branch deployed to Vercel Production connected to Supabase Production cluster with strict RLS and Cashfree Live API keys.
  - **Middleware Constraints**: Keep Next.js `middleware.ts` lightweight. Restrict middleware to session token verification via `@supabase/ssr` and cookie-based geofence redirects. Do not execute heavy cryptographic operations or large database queries in Edge Middleware (keep runtime bundle < 1MB).
* **Technical Justification**:
  Vercel Edge Middleware runs on Vercel's Edge Network (V8 isolate). Heavy Node.js native dependencies (`crypto`, raw TCP sockets) fail on Edge runtimes. Keeping middleware lean ensures sub-20ms edge latency.
* **Risk If Implemented Incorrectly**:
  - Edge middleware execution timeout (504 gateway errors) blocking all page requests.
  - Accidental leakage of staging test orders into production Cashfree settlement ledgers.
* **Existing Project Compatibility**:
  Standard Next.js on Vercel deployment model. Fully supported.
* **Required Verification Evidence**:
  - Inspect current `middleware.ts` in repository.
  - Verify environment variable namespaces in Vercel Project Settings (`NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CASHFREE_API_KEY`).
* **Recommended Decision**: **`ACCEPT`**
  - Implement three-tier environment separation and enforce lightweight middleware rules.

---

### EDR-10: Backward Compatibility & Zero-Disruption Rollout

* **Current Known Information**:
  A live or staging version of TRUSTIT is currently operational with users and existing database records.
* **Proposed Solution**:
  - **Feature Flagging**: Guard the new Customer Super App interface behind a Next.js feature flag or cookie cookie-based canary rollout (`NEXT_PUBLIC_ENABLE_CUSTOMER_V2=true`).
  - **Non-Destructive Database Additions**: Any new columns or auxiliary tables required by the UI (such as `user_consents` for DPDP Act compliance or `order_tracking_events` for driver GPS milestones) must be added via additive, non-breaking SQL migrations (`ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...`).
  - **API Contract Compatibility**: Existing REST/RPC endpoints used by production clients must not have their parameter signatures or return shapes altered.
* **Technical Justification**:
  Additive migrations ensure that older frontend builds, active background workers, and ongoing transactions continue operating without interruption during deployment.
* **Risk If Implemented Incorrectly**:
  Breaking live user sessions, failing running orders, or causing immediate database downtime.
* **Existing Project Compatibility**:
  The 18 Customer screens can be deployed side-by-side with any existing web surfaces without interference.
* **Required Verification Evidence**:
  - Review live database migration history in `supabase/migrations/`.
  - Confirm whether mobile app or web app users are currently active in production.
* **Recommended Decision**: **`ACCEPT`**
  - Mandate additive migrations and feature-flagged Canary deployment.

---

## 3. Technical Decision Summary Matrix

| Decision ID | Domain | Architecture Focus | Status | Decision | Primary Engineering Rationale |
|---|---|---|---|---|---|
| **EDR-01** | Repository | Multi-App Monorepo vs. Existing Codebase | `[PROPOSED]` | **`MODIFY`** | Implement Customer UI in existing Next.js repo first; defer Turborepo partition to Phase 2. |
| **EDR-02** | Routing | Next.js Router Paradigm Isolation | `[NEEDS CODEBASE VERIFICATION]` | **`ACCEPT`** | Preserve existing Pages/App router paradigm; do not force breaking router migration. |
| **EDR-03** | Auth & RBAC | Supabase Role Security & SMS Auth | `[NEEDS CODEBASE VERIFICATION]` | **`MODIFY`** | Enforce roles via protected `user_roles` table & RLS; verify TRAI DLT SMS templates. |
| **EDR-04** | Database | Supabase RLS & Table Names | `[NEEDS CODEBASE VERIFICATION]` | **`ACCEPT`** | Zero schema renames. Implement TypeScript adapter layer to map UI to live schema. |
| **EDR-05** | Orders | Order State Machine & PIN Isolation | `[VERIFIED]` | **`ACCEPT`** | Doorstep PIN `4821` verified via server hash RPC; state transitions enforced server-side. |
| **EDR-06** | Payments | Cashfree Idempotency & Webhooks | `[PROPOSED]` | **`ACCEPT`** | Client idempotency keys; all payment updates driven by cryptographically verified webhooks. |
| **EDR-07** | Geolocation | Rider GPS Location Streaming | `[PROPOSED]` | **`MODIFY`** | Mandate Supabase Realtime Broadcast (WebSockets) to eliminate database write saturation. |
| **EDR-08** | Realtime | Order Status Synchronization | `[VERIFIED]` | **`ACCEPT`** | Listen to PostgreSQL change stream for durable order state milestones. |
| **EDR-09** | DevOps | Vercel Deployment & Middleware | `[PROPOSED]` | **`ACCEPT`** | 3-tier Vercel environment isolation; restrict Edge Middleware bundle size (< 1MB). |
| **EDR-10** | Rollout | Backward Compatibility & Migration | `[PROPOSED]` | **`ACCEPT`** | Additive schema migrations only; Canary feature flag rollout for zero user downtime. |

---

## 4. Prioritized Implementation Roadmap

The implementation plan is structured into five sequential phases to ensure zero production disruption and verifiable milestones:

```
[ Phase 1: Codebase Audit & Schema Extraction ]
                     │
                     ▼
[ Phase 2: Design Token & Shared Component Extraction ]
                     │
                     ▼
[ Phase 3: Customer App Integration & Adapter Layer ]
                     │
                     ▼
[ Phase 4: Cashfree & Realtime Backend Wire-Up ]
                     │
                     ▼
[ Phase 5: QA Acceptance, Canary Deployment & Merchant Prep ]
```

### Phase 1: Codebase Audit & Schema Extraction (Week 1)
- **Goal**: Resolve all `[NEEDS CODEBASE VERIFICATION]` unknowns before writing application code.
- **Action Items**:
  1. Inspect root repository: determine Next.js version (`next@14` vs `next@15`) and router paradigm (`pages/` vs `app/`).
  2. Extract live PostgreSQL schema: execute `supabase db dump --schema-only` and generate true TypeScript models using `supabase gen types typescript --project-id <id> > src/types/database.types.ts`.
  3. Inspect live table names: cross-reference `orders`, `merchants`, `menu_items`, `user_addresses`, and `prescriptions` against handoff assumptions.
  4. Verify TRAI DLT registration and SMS vendor in Supabase Auth console for `+91` mobile delivery.
  5. Check Cashfree API keys and test Cashfree SDK version in sandbox mode.

### Phase 2: Design Token & Shared Component Extraction (Week 2)
- **Goal**: Establish the `Kinetic Trust` component baseline without affecting live pages.
- **Action Items**:
  1. Export `Kinetic Trust` design tokens from `DESIGN.md` into `tailwind.config.ts` (colors `#0d47a1`, surface tokens, Plus Jakarta Sans typography scale).
  2. Build shared core components in isolation (`/components/shared/`):
     - `<TrustBadge />` (DigiLocker, FSSAI, Police Cleared variants).
     - `<IndianCurrencyPrice />` (INR `₹` formatting with strike-through MRP).
     - `<SteppedProgressBar />` (Multi-step checkout, kitchen prep, and refund steppers).
     - `<DeliveryInstructionChip />` (Quick delivery notes).
     - `<NPCIDiagnosticsCard />` (Banking diagnostic & UTR display).
     - `<BottomNavigation5Tab />` (Fixed 5-tab mobile navigation bar).

### Phase 3: Customer App Integration & Adapter Layer (Weeks 3–4)
- **Goal**: Mount the 18 validated customer mobile screens with mocked/adapted data.
- **Action Items**:
  1. Create data adapter layer (`/lib/adapters/`) mapping extracted Supabase types to UI component props.
  2. Scaffold the 18 Customer App routes mapped to the approved navigation map:
     - Onboarding: `/login` (`SCREEN_21`).
     - Tab Shells: `/home` (`SCREEN_39`), `/explore` (`SCREEN_27`), `/orders` (`SCREEN_25`), `/activity` (`SCREEN_31`), `/profile` (`SCREEN_9`).
     - Core Transact: `/storefront/[id]` (`SCREEN_33`), `/customize/[id]` (`SCREEN_19`), `/pharmacy/[id]` (`SCREEN_29`), `/services/[id]` (`SCREEN_23`), `/checkout` (`SCREEN_37`).
     - Lifecycle & Resolution: `/order-success/[id]` (`SCREEN_15`), `/payment-failed/[id]` (`SCREEN_13`), `/order-tracking/[id]` (`SCREEN_35`), `/refund-tracker/[id]` (`SCREEN_17`), `/addresses` (`SCREEN_11`), `/support` (`SCREEN_7`), `/notifications` (`SCREEN_5`).
  3. Connect local Zustand stores for ephemeral state: `useCartStore` and `useLocationStore`.

### Phase 4: Cashfree & Realtime Backend Wire-Up (Weeks 5–6)
- **Goal**: Activate live transaction flows and real-time synchronization.
- **Action Items**:
  1. Implement Next.js Server Action for Cashfree order creation with idempotency hashing.
  2. Implement Cashfree webhook route `/api/webhooks/cashfree` with raw signature validation (`x-webhook-signature`).
  3. Integrate Cashfree Drop-in SDK for web checkout and UPI Intent handling.
  4. Implement Supabase Realtime Broadcast channel subscription for live rider tracking in `SCREEN_35`.
  5. Implement Supabase Realtime database change listener for order status transitions.
  6. Enforce Doorstep Handover PIN (`4821`) server-side verification RPC.

### Phase 5: QA Acceptance, Canary Deployment & Merchant Prep (Weeks 7–8)
- **Goal**: Full testing and phased production rollout.
- **Action Items**:
  1. Execute testing against the **QA Acceptance Checklist** in Handoff v2.0 (idempotency, 08:42 min inventory lock, refund UTR rendering, a11y contrast checks).
  2. Deploy Customer App v2 under canary feature flag `NEXT_PUBLIC_ENABLE_CUSTOMER_V2=true` to 10% of users on Vercel Production.
  3. Monitor error rates, Vercel Edge middleware latency, and Cashfree webhook reconciliation logs.
  4. Begin Phase 2 repository partitioning into Turborepo and scaffold Merchant Dashboard (`M-01` to `M-04`) and Rider App (`R-01` to `R-03`).

---

## 5. Architectural Compliance Sign-Off

This document constitutes the official engineering governance agreement. All engineering pull requests must reference the relevant decision ID (`EDR-01` through `EDR-10`) to ensure strict adherence to safety, security, and backward compatibility standards.
