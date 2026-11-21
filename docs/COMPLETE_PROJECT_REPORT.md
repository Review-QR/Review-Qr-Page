# Trustit — Complete Project Report

**Project:** Trustit Hyperlocal Super-App & Delivery Network
**Location:** Bahraich (primary), India
**Branch:** `feat/phase1-security`
**Date:** 2026-11-21
**Status:** Active development — Phase 1 security hardening in progress

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Technology Stack](#2-technology-stack)
3. [Application Architecture](#3-application-architecture)
4. [Customer App (Mobile + Web PWA)](#4-customer-app-mobile--web-pwa)
5. [Merchant Dashboard (Web)](#5-merchant-dashboard-web)
6. [Rider App (48 Screens, Mobile PWA)](#6-rider-app-48-screens-mobile-pwa)
7. [Admin Panel](#7-admin-panel)
8. [API Routes & Backend Services](#8-api-routes--backend-services)
9. [Database Schema & Migrations](#9-database-schema--migrations)
10. [Payment System (Cashfree)](#10-payment-system-cashfree)
11. [Security & Authentication](#11-security--authentication)
12. [Settlement & Wallet System](#12-settlement--wallet-system)
13. [AI & Smart Features](#13-ai--smart-features)
14. [Native Mobile (Android/Capacitor)](#14-native-mobile-androidcapacitor)
15. [Testing & Quality](#15-testing--quality)
16. [Current Work (Phase 1 Security)](#16-current-work-phase-1-security)
17. [Deployment & Infrastructure](#17-deployment--infrastructure)

---

## 1. Project Overview

**Trustit** is a **hyperlocal super-app and delivery network** serving Bahraich, India. It's a multi-sided platform connecting:

- **Customers** — who browse businesses, place orders, and get home delivery
- **Merchants** — who manage their stores, products, QR codes, orders, and payouts
- **Riders** — who pick up orders from stores and deliver to customers
- **Admins** — who oversee the entire platform, settlements, and rider management

The project is built on **Next.js 16** with **Supabase** as the backend (PostgreSQL + Auth + Storage). It uses **Capacitor** to build native Android APKs from the web codebase. **Cashfree** is the payment gateway for online payments, UPI, and rider payouts.

### Key Stats

| Metric | Value |
|--------|-------|
| Total Screen Components | 48 (rider) + 7 (customer) + 13 (merchant) + 5 (admin tabs) |
| API Route Files | 30+ |
| Database Migrations | 67 |
| Business Categories | 12 (Grocery, Sweets, Restaurants, Pharmacies, Salons, Clinics, Mobile Shops, Auto Services, Hardware, Clothing, Hotels, and more) |
| Test Files | 43 .test.mjs files |
| Current Branch | `feat/phase1-security` (off `main`) |

---

## 2. Technology Stack

### Frontend
| Technology | Version | Usage |
|------------|---------|-------|
| Next.js | 16.3.6 | React framework (SSR, App Router, API routes) |
| React | 19.3.0 | UI library |
| TypeScript | 7.0.2 | Language |
| Tailwind CSS | 4.3.3 | Styling |
| Lucide React | 1.52.0 | Icons |
| QRCode | 1.5.4 | QR generation |
| jsPDF | 4.2.1 | PDF generation |
| modern-screenshot | 4.7.0 | Screenshot capture |

### Backend / Database
| Technology | Version | Usage |
|------------|---------|-------|
| Supabase | 2.117.1 | PostgreSQL database, Auth, Storage, Realtime |
| @supabase/ssr | 0.12.7 | Server-side Supabase client for Next.js |

### Payments
| Technology | Usage |
|------------|-------|
| Cashfree SDK | v3 — Online payments (UPI, cards, wallets, net banking) |
| Cashfree Payouts | IMPS/bank transfers to riders and merchants |
| Cashfree Drop Checkout | Simplified checkout (Online vs COD) |
| Cashfree QR | Dynamic QR codes for COD payments |

### Mobile (Native Builds)
| Technology | Version | Usage |
|------------|---------|-------|
| Capacitor | 6.2.0 | Web-to-native bridge (3 Android builds) |
| Android Gradle | Standard | Native APK builds |

### Infrastructure
| Technology | Usage |
|------------|-------|
| Vercel | Hosting (`.vercel` folder present) |
| Supabase | Database + Auth + Storage + Edge Functions |
| OpenStreetMap / OSRM | Maps, routing, geocoding |
| Google Maps API | Maps, routing (optional) |
| Nominatim | Reverse geocoding |

---

## 3. Application Architecture

### Directory Structure

```
E:\Project-Trustit/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Public home (business discovery)
│   ├── layout.tsx                # Root layout (fonts, CSP, service workers)
│   ├── order/                    # Customer app (PWA)
│   │   └── order-portal-client.tsx  # ⚠️ 114KB monolith (2,968 lines)
│   ├── rider/                    # Rider app (48 screens)
│   │   ├── page.tsx              # ⚠️ 64KB orchestrator (1,522 lines)
│   │   ├── components/screens/   # 48 screen components
│   │   └── hooks/                # 3 rider hooks
│   ├── merchant/                 # Merchant web dashboard
│   │   ├── dashboard/            # 13+ dashboard modules
│   │   ├── login/                # Merchant login
│   │   ├── register/             # Merchant registration
│   │   ├── app/                  # Merchant app shell
│   │   └── flow/                 # Merchant flow pages
│   ├── admin/                    # Admin panel
│   │   └── hyperlocal/           # Hyperlocal admin client
│   ├── api/                      # API routes (30+ route files)
│   │   └── hyperlocal/           # Core hyperlocal APIs
│   │       ├── rider/            # Rider API
│   │       ├── orders/           # Order management
│   │       ├── admin/            # Admin routes
│   │       ├── payment/          # Payment sessions
│   │       ├── directions/       # Turn-by-turn routing
│   │       ├── parcha/           # Smart Parcha OCR
│   │       └── ...
│   ├── [city]/                   # City-based business discovery pages
│   ├── merchant-preview/         # Public merchant preview pages
│   ├── rider-preview/            # Public rider app preview
│   ├── qr-codes/                 # QR code scanning pages
│   ├── downloads/                # APK download pages
│   └── partner/                  # Partner pages
├── lib/                          # Core business logic
│   ├── hyperlocal/               # 15+ engine files (dispatch, settlement, fleet)
│   ├── cashfree.ts               # Payment orchestration
│   ├── cashfree-signature.ts     # Webhook security
│   ├── cashfree-webhook-handler.ts # Webhook processing
│   ├── bank-payouts-service.ts   # Bank payout processing
│   ├── auth/                     # Authentication guards
│   ├── customer/                 # Customer CRM & points
│   ├── merchant/                 # Merchant services
│   ├── native/                   # Capacitor native bridge
│   ├── audio/                    # Rider audio/siren
│   ├── wallet/                   # Wallet services
│   ├── messaging/                # SMS/notification messaging
│   └── trustit-ai/               # AI features
├── supabase/
│   └── migrations/               # 67 database migration files
├── android/                      # Capacitor Android project (3 builds)
│   ├── android-customer-bundle/  # Customer app APK
│   ├── android-embedded-bundle/  # Embedded merchant app APK
│   └── android-rider-bundle/     # Rider app APK
├── components/                   # Shared React components
├── docs/                         # Project documentation
├── public/                       # Static assets
├── proxy.ts                      # Next.js proxy (auth, CORS, CSP)
├── capacitor.config.json         # Capacitor config (Customer app)
├── package.json                  # Dependencies
└── next.config.ts                # Next.js configuration
```

### Three Separate Android Builds

The project builds **three separate Android APKs** from the same web codebase using Capacitor:

| Build | App ID | Purpose |
|-------|--------|---------|
| `android-customer-bundle` | `com.trustit.customer` | Customer ordering app |
| `android-embedded-bundle` | (embedded merchant) | Merchant management app |
| `android-rider-bundle` | (rider app) | Rider delivery app |

Each has its own `capacitor.config.json` (or equivalent configuration) and is built with `./gradlew assembleCustomerRelease` / `assembleRiderRelease`.

---

## 4. Customer App (Mobile + Web PWA)

### Overview
The customer app is accessible at `/order` and is a **PWA (Progressive Web App)** that also builds to a native Android APK via Capacitor.

### Architecture
- **Main orchestrator:** `app/order/order-portal-client.tsx` (114KB — 2,968 lines)
- **7 dedicated component modules:**
  1. `CustomerHomeAndDiscovery` — Home screen, search, city/category discovery
  2. `CustomerStorefrontAndVerticals` — Business listings, store cards, verticals
  3. `CustomerCheckoutAndAddresses` — Cart, checkout, address management
  4. `CustomerOrdersAndSupport` — Order tracking, support, returns
  5. `CustomerOnboardingModals` — Login/register modals, consent
  6. `CustomerProfileAndSettings` — Profile, settings, preferences
  7. `BahraichInteractiveMap` — Interactive city map with business locations

### Customer Features

#### Discovery & Browsing
- City-based business search (slugified URLs: `/bahraich/grocery-stores?q=...`)
- 12 business categories (Grocery, Sweets, Restaurants, Pharmacies, Salons, Clinics, Mobile Shops, Auto Services, Hardware, Clothing, Hotels)
- Popular search suggestions (rotating every 2.8s)
- Search with auto-category resolution
- Public business discovery with SEO optimization
- Structured business location with verified addresses

#### Onboarding & Auth
- Phone + OTP login
- Google 1-tap sign-in
- Email + OTP login
- Profile creation with verified-account overwrite protection
- Rate limiting (25 attempts per 10 minutes)
- httpOnly cookie + session token
- Bilingual UI (English + Hindi via `t(lang, en, hi)` helper)

#### Ordering & Checkout
- **Single-store cart** with conflict guard (can't mix stores)
- Out-of-stock rules
- 4-digit handover PIN for delivery verification
- **Saved address book** with GPS pin-drop
- **Delivery scheduling** with time slots
- Rider tip option
- Promo/coupon codes
- **3 payment choices:** UPI/Online, Cash on Delivery (COD), Wallet
- Payment retry with stock-hold mechanism
- Stock-hold timeout handling

#### Order Management
- Live order tracking
- Order status updates
- Customer support / helpdesk
- Legal policies view
- Order history

#### Loyalty & Rewards
- **Points card** in header
- Live INR value conversion (e.g., 350 points = ₹100)
- `/api/customer/points` endpoint with session-identity verification
- OnRequestLogin CTA when unauthenticated

#### Map Features
- Interactive Bahraich city map
- Business location markers
- GPS pin-drop for address selection
- OpenStreetMap tile integration

#### PWA Features
- Service worker registration
- OTA update banner
- Install prompt
- Offline-aware caching

---

## 5. Merchant Dashboard (Web)

### Overview
A comprehensive web dashboard for merchants to manage their businesses, available at `/merchant/dashboard`.

### Architecture
- **Shell:** `merchant-console-client.tsx` (672 lines) — tab-based client-side routing
- **13+ Dashboard Modules:**
  1. **Dashboard** — Overview, KPIs, daily stats
  2. **Business** — Profile, settings, outlet management
  3. **Products** — Product catalog, inventory, pricing
  4. **Orders** — Full lifecycle (fetch, accept, prepare, dispatch)
  5. **QR Codes** — QR generation, sharing, printing, PNG download
  6. **Reviews** — Review management, AI-generated review drafts
  7. **Messages** — Customer messaging, message designer
  8. **Analytics** — Business analytics, scan analytics
  9. **Payments** — Settlements, payouts, bank KYC, passbook, CSV export
  10. **Subscription** — Plan management, plan-gated features
  11. **Profile** — Merchant profile, settings
  12. **Support** — Helpdesk
  13. **Menu** — Menu management (Standard/Premium only)

### Merchant Features

#### Onboarding & Auth
- Registration with invite token system
- Multi-step registration form
- KYC document upload
- Bank account linking (penny-drop verification)
- Google verification
- Merchant invite system (email-based)
- Invite revocation

#### Business Management
- Business profile with logo, location, description
- Multiple outlet management
- Outlet status toggles (open/closed/taking orders)
- Business category assignment
- Catalog items with pricing
- Occasion CRM (festival/holiday specials)
- Merchant social studio (social media content)

#### Product Management
- Product catalog with categories
- Price management
- Stock/inventory tracking
- Catalog templates
- Physical QR product system (QR-linked products)

#### Order Management
- Full order lifecycle: new → accepted → preparing → ready → dispatched → delivered
- 7 distinct API calls for order operations
- Push notification tokens for rider alerts
- Auto-status transitions
- Order dispute handling
- Admin doorstep cancellation support

#### QR Code System
- Dynamic QR code generation per business
- QR design customization (templates)
- QR analytics (scan counts, timestamps)
- Multiple QR templates (plan-gated: Basic 2, Standard 5, Premium 8)
- QR sharing via `navigator.share`
- PNG download, printing support

#### Review Management
- Smart Parcha OCR integration (real OCR, not mock)
- Review generation with AI (Gemini-powered)
- Review drafts with validation
- Google review link integration
- Review display on public pages
- Review data architecture with ledger

#### Payment & Settlement
- Daily settlement batch processing
- Payment history with passbook
- Bank payout setup (penny-drop verification)
- CSV export for bank statements
- Print settlement reports
- Plan-gated payouts
- Payout ledger tracking

#### Plan System
| Plan | QR Templates | Features |
|------|-------------|----------|
| Basic | 2 | Core features, no menu/messages/orders |
| Standard | 5 | + Orders, messages |
| Premium | 8 | + Full access, menu management |

#### Analytics
- Scan analytics (QR code scans)
- Business dashboard KPIs
- Order analytics
- Daily/weekly/monthly reports

#### Marketing
- Standee/stylish generator (print-ready marketing materials)
- Occasion-based promotions
- Merchant social studio
- Referral invite system

---

## 6. Rider App (48 Screens, Mobile PWA)

### Overview
The rider app is a **48-screen PWA** for gig delivery riders, also building to a native Android APK via Capacitor. It's the most feature-rich part of the application.

### Architecture
- **Main orchestrator:** `app/rider/page.tsx` (64KB — 1,522 lines)
- **State manager:** `useRiderWorkflow` hook (master state orchestrator)
- **3 Hooks:**
  - `useRiderWorkflow` — All screen transitions, rider state, order lifecycle, earnings, duty toggle
  - `useRiderAuth` — Phone/OTP/Google login
  - `useRiderCamera` — Camera for selfies, helmet photos, delivery photos
- **5 Bottom Tabs:** Cockpit, Orders, Earnings, Navigation, Profile

### All 48 Rider Screens

#### Core Screens (01-18)
| # | Screen | Features |
|---|--------|----------|
| 01 | `Screen01AuthStart` | Login entry (phone + OTP) |
| 02 | `Screen02OtpVerify` | OTP verification |
| 02B | `Screen02BasicProfile` | Basic rider profile setup |
| 03 | `Screen03Consent` | Consent/agreement screen |
| 04 | `Screen04SelfieKyc` | KYC selfie capture |
| 05 | `Screen05VehicleDl` | Vehicle + driving license upload |
| 06 | `Screen06PayoutSetup` | Payout/bank account setup |
| 07 | `Screen07DutyCockpit` | **Main duty dashboard** (go online/offline) |
| 08 | `Screen08ShiftScorecard` | Shift performance scorecard |
| 09 | `Screen09CashCeiling` | Cash ceiling/cash-in-hand limits |
| 10 | `Screen10Radar` | **Incoming order radar animation** (order offer popup) |
| 11 | `Screen11SlideAccept` | Slide-to-accept order gesture |
| 12 | `Screen12StorePickup` | Store/merchant pickup confirmation |
| 13 | `Screen13Doorstep` | Doorstep delivery confirmation |
| 14 | `Screen14DynamicQr` | Dynamic QR code for COD payment |
| 15 | `Screen15Passbook` | Earnings passbook/transaction history |
| 16 | `Screen16Milestones` | Milestone/achievement badges |
| 17 | `Screen17SafetySos` | **SOS/Safety emergency button** |
| 18 | `Screen18Profile` | Rider profile settings |

#### Extended Screens (19-39)
| # | Screen | Features |
|---|--------|----------|
| 19 | `Screen19VerificationPending` | Waiting for KYC/verification approval |
| 20 | `Screen20TrainingAcademy` | In-app rider training/academy |
| 21 | `Screen21LockscreenOrderPop` | **Lockscreen order popup** (push → accept) |
| 22 | `Screen22MultiOrderBatch` | Multi-order batch assignment |
| 23 | `Screen23MerchantDelay` | Merchant delay handling |
| 24 | `Screen24CustomerUnreachable` | Customer unreachable escalation |
| 25 | `Screen25ShiftBookingMg` | Shift booking management |
| 26 | `Screen26CashRemittanceHubs` | Cash remittance at hubs |
| 27 | `Screen27MorningHelmetSelfie` | **Morning helmet selfie check** (attendance) |
| 28 | `Screen28BreakdownRescue` | Vehicle breakdown rescue request |
| 29 | `Screen29CustomerRefusalRto` | Customer refusal / RTO (return to origin) |
| 30 | `Screen30ContactlessPhotoPod` | Contactless photo-proof delivery |
| 31 | `Screen31PenaltyDispute` | Penalty/fine dispute filing |
| 32 | `Screen32AccidentInsurance` | Accident insurance claims |
| 33 | `Screen33HeatmapSurge` | **Live heatmap + surge pricing zones** |
| 34 | `Screen34ReferAndBadges` | Referral program + badges |
| 35 | `Screen35PharmacyRxPickup` | **Pharmacy/Prescription pickup** (special category) |
| 36 | `Screen36HeavyGroceryCrate` | **Heavy grocery/crate handling** (special category) |
| 37 | `Screen37P2pGenieCourier` | **P2P Genie courier** (parcel/peer-to-peer) |
| 38 | `Screen38FragileCakeGuard` | **Fragile/cake special handling** (special category) |
| 39 | `Screen39CategoryToggles` | Category preference toggles |

#### Navigation & On-Road Screens (40-44)
| # | Screen | Features |
|---|--------|----------|
| 40 | `Screen40TurnByTurnNav` | **Turn-by-turn in-app navigation** |
| 41 | `Screen41Last100mLandmark` | Last 100m landmark-based guidance |
| 42 | `Screen42TrafficReroute` | **Live traffic reroute suggestions** |
| 43 | `Screen43DigitalFleetIdPass` | Digital fleet ID/pass card |
| 44 | `Screen44InAppMaskedChat` | **In-app masked calling/chat** with customer/merchant |

#### Emergency & Edge Cases (45-48)
| # | Screen | Features |
|---|--------|----------|
| 45 | `Screen45DoorstepChangeWallet` | Digital wallet for doorstep change |
| 46 | `Screen46MidTripCancellation` | Mid-trip cancellation handling |
| 47 | `Screen47ParkingTollClaim` | Parking/toll expense claims |
| 48 | `Screen48LowBatterySafeMode` | **Low-battery safe mode** (conserves phone for rider) |

### Rider Engine Files (`lib/hyperlocal/`)
| File | Purpose |
|------|---------|
| `dispatch-engine.ts` | **Core dispatch** — matches orders to riders with cascading radar + timeout/decline handoff |
| `rider-fleet-engine.ts` | **Rider fleet management** — rider state, availability, assignment, wait-comp, doorstep refund, parking toll, GPS heartbeat, passbook |
| `settlement-service.ts` | **Settlement engine** — payouts, earnings calculation, bank CSV generation |
| `rider-session.ts` | Rider session management with signed/verified tokens |
| `location-resolver.ts` | GPS/location resolution and geocoding |

### Rider Backend Engines (`lib/hyperlocal/`)
| File | Engine/Purpose |
|------|----------------|
| `hyperlocal-service.ts` | Core hyperlocal service orchestration |
| `cashfree-hyperlocal-service.ts` | Cashfree payment integration for hyperlocal |
| `cashfree-payouts-service.ts` | Cashfree rider payout processing |
| `cashfree-pg-qr-refund.ts` | Payment gateway QR refund handling |
| `address-format.ts` | Address formatting utilities |
| `remote-config.ts` | Remote config / feature flags |
| `master-catalog-templates.ts` | Catalog templates for merchants |
| `order-id.ts` | Order ID generation |
| `split-calculator.ts` | Order splitting logic |
| `bank-csv-generator.ts` | Bank statement CSV generation |
| `types.ts` | Shared TypeScript types |

### Unique Rider Features
1. **Morning Helmet Selfie** — Unique attendance verification
2. **Low-Battery Safe Mode** — Conserves rider's phone battery
3. **Lockscreen Order Popup** — Order offer appears on lockscreen
4. **Category-Specific Flows** — Pharmacy Rx, fragile cakes, heavy crates, P2P courier each have dedicated screens
5. **Cash Remittance Hubs** — Physical cash collection points
6. **Digital Fleet ID Pass** — In-app ID card
7. **Masked in-app chat/call** — Privacy between rider and customer
8. **PWA with Wake Lock** — Keeps screen on during duty
9. **Background telemetry** — GPS heartbeat + battery + offline detection

---

## 7. Admin Panel

### Overview
Admin panel at `/admin/hyperlocal` with server-side auth (`requireActiveAdmin` + `createSupabaseServerClient`).

### Architecture
- **Shell:** `app/admin/hyperlocal/hyperlocal-admin-client.tsx`
- **5 Admin Tabs:**
  1. **Orders** — Order management, status updates, admin cancellation/refund
  2. **Settlements** — Merchant batch settlements, rider payout approvals
  3. **Riders** — Rider management, KYC verification, fleet oversight
  4. **Points** — Customer loyalty points management
  5. **View Mode** — Business/rider data viewing

### Admin Features
- Server-rendered with proper auth (no client-side leakage)
- 25+ action buttons, all wired to real endpoints
- Sub-app routing: `/admin/riders` redirects to `/admin/hyperlocal?tab=riders`
- Polling on view change
- Search input sanitization (`.replace(/[%_,()]/g, "")`)
- Migration-availability checks with clear error messages
- Hyperlocal admin with full order lifecycle control

### Admin API Routes (`app/api/hyperlocal/admin/`)
| Route | Purpose |
|-------|---------|
| `riders/route.ts` | Rider management, approval |
| `orders/route.ts` | Order admin management, cancellation, refund |
| `settlements/route.ts` | Settlement processing, payouts |
| `customer-points/route.ts` | Customer loyalty points management |

---

## 8. API Routes & Backend Services

### Customer APIs (`app/api/customer/`)
| Route | Purpose |
|-------|---------|
| Auth routes | OTP verification, session management |
| Points | Customer loyalty points |

### Hyperlocal APIs (`app/api/hyperlocal/`)
| Route | Purpose |
|-------|---------|
| `rider/route.ts` | **Main rider API** — profile, duty state, earnings, wallet |
| `rider/cod-qr/route.ts` | COD QR code generation/validation |
| `orders/route.ts` | Order CRUD, assignment, lifecycle |
| `directions/route.ts` | Turn-by-turn directions (OSRM/Google Maps) |
| `reverse-geocode/route.ts` | GPS coordinate → address |
| `ota/route.ts` | Over-the-air config for mobile apps |
| `tokens/route.ts` | Push notification tokens |
| `payment/session/route.ts` | Payment session creation (Cashfree) |
| `payment/verify/route.ts` | Payment verification |
| `businesses/route.ts` | Business/merchant discovery |
| `parcha/route.ts` | **Smart Parcha OCR** — order verification via image recognition |
| `remote-config/route.ts` | Remote config / feature flags |
| `admin/riders/route.ts` | Rider admin management |
| `admin/orders/route.ts` | Order admin management |
| `admin/settlements/route.ts` | Settlement admin, payouts |
| `admin/customer-points/route.ts` | Customer loyalty points admin |

### Cashfree APIs (`app/api/cashfree/`)
| Route | Purpose |
|-------|---------|
| `webhook/route.ts` | Cashfree payment webhook handler |

### Other APIs
| Route | Purpose |
|-------|---------|
| `cron/` | Scheduled tasks (settlements, cleanup) |
| `merchant/auth` | Merchant authentication |
| `manifest` | PWA manifest generation |

### Key Backend Libraries (`lib/`)
| File | Engine/Purpose |
|------|----------------|
| `cashfree.ts` | Full payment orchestration (37KB) |
| `cashfree-signature.ts` | HMAC-SHA256 webhook verification + replay window |
| `cashfree-webhook-handler.ts` | Webhook processing, idempotency |
| `cashfree-webhook-replay.test.mjs` | Replay window tests |
| `bank-payouts-service.ts` | Bank payout processing (22KB) |
| `bank-csv-generator.ts` | Bank statement CSV generation |
| `settlement-service.ts` | Settlement engine — payouts, earnings (actively developed) |
| `settlement-safety.test.mjs` | Settlement safety tests (13KB) |
| `dispatch-engine.ts` | Core order dispatch to riders |
| `rider-fleet-engine.ts` | Rider fleet management |
| `hyperlocal-service.ts` | Core service orchestration |
| `customer-crm-service.ts` | Customer CRM |
| `customer-crm-analytics.ts` | Customer analytics |
| `review-draft-provider.ts` | AI review generation |
| `public-discovery-domain.ts` | Business discovery domain logic |
| `public-discovery-seo.ts` | SEO for public pages |
| `plan-rules.ts` | Subscription plan enforcement |
| `creative-canvas.ts` | AI image/design generation |
| `thermal-printer.ts` | Thermal printer integration |
| `rate-limiter.ts` | API rate limiting |
| `auth-api-guards.ts` | API authentication guards |
| `security-hardening.test.mjs` | Security test suite (29KB) |

---

## 9. Database Schema & Migrations

### Total Migrations: 67 files

### Schema Evolution Timeline

| Phase | Migrations | Key Tables Added |
|-------|------------|-----------------|
| Sep 2026 | `add_business_scan`, `add_admin_auth`, `merchant_accounts` | `businesses`, `admin_auth`, `merchant_accounts` |
| Sep 2026 | `payment_records_atomic_renewal`, `secure_business_access` | `payment_records`, RLS hardening |
| Sep 2026 | `trustit_self_registration` | Self-registration flow, business finalization |
| Sep 2026 | `trustit_review_data_architecture` | `trustit_reviews`, review generation |
| Sep 2026 | `submit_trustit_review`, `two_stage_merchant_deletion` | Review submission, soft delete |
| Sep 2026 | `merchant_dashboard_analytics`, `merchant_qr_template_preference` | Analytics tables |
| Sep 2026 | `merchant_invites`, `merchant_profile_location` | Invite system, structured location |
| Oct 2026 | `business_catalog_items`, `merchant_social_studio` | Product catalog, social content |
| Oct 2026 | `physical_qr_products_system`, `plan_tiers_and_scan_analytics` | QR product system, plan tiers |
| Oct 2026 | `hyperlocal_superapp_ecosystem` | **Core hyperlocal schema** — orders, riders, settlements |
| Oct 2026 | `merchant_onboarding_kyc_and_bank_payouts` | KYC, bank accounts, payouts |
| Oct 2026 | `customer_email_auth_and_saved_addresses` | Customer email auth, addresses |
| Oct 2026 | `delivery_riders_kyc_and_earnings` | Rider KYC, earnings, wallet |
| Oct 2026 | `order_dispute_and_admin_doorstep_cancellation` | Disputes, admin cancellation |
| Oct 2026 | `payout_ledger_and_rider_settlements` | Payout ledger, rider settlements |
| Oct 2026 | `security_hardening_rls_and_otp_protection` | RLS hardening, OTP protection |
| Nov 2026 | `rider_super_fleet_48_screens_engine` | **48-screen rider engine schema** (7.9KB) |
| Nov 2026 | `customer_points_and_merchant_verified` | Customer points, verified merchant |
| Nov 2026 | `hyperlocal_checkout_drafts` | Checkout draft system |
| **Nov 16** | **`admin_audit_log`** | **Immutable admin audit trail** (Phase 1) |
| **Nov 16** | **`settlement_reason_actor_columns`** | **Actor/reason on settlement tables** (Phase 1) |
| **Nov 16** | **`deduct_rider_wallet`** | **Atomic wallet deduction RPC** (Phase 1) |
| **Nov 16** | **`payout_idempotency`** | **Idempotent payout guards** (Phase 1) |

### Key Database Tables (inferred from migrations)

| Table | Purpose |
|-------|---------|
| `businesses` | Merchant businesses with RLS |
| `merchant_accounts` | Merchant login accounts |
| `merchant_account_status` | Account status tracking |
| `payment_records` | Payment transaction records |
| `trustit_reviews` | Customer reviews |
| `customer_points` | Loyalty points balances |
| `customer_points_ledger` | **Immutable points transaction ledger** |
| `product_order_audit_logs` | Product order audit trail |
| `hyperlocal_orders` | Delivery orders |
| `hyperlocal_payout_splits` | Order payout splits (RLS-locked) |
| `delivery_riders` | Rider profiles, KYC, wallet |
| `merchant_settlement_batches` | Merchant settlement batches |
| `rider_payout_requests` | Rider payout requests |
| `admin_audit_log` | **NEW: Immutable admin action log** |
| `business_catalog_items` | Product catalog items |
| `merchant_invites` | Registration invite tokens |
| `merchant_qr_templates` | QR design templates |
| `scan_analytics` | QR scan tracking |
| `plan_tiers` | Subscription plan definitions |
| `delivery_addresses` | Customer saved addresses |
| `parcha_orders` | Parcha OCR verification orders |

### Security Architecture
- **Row Level Security (RLS)** on all sensitive tables
- Service role for admin operations
- Authenticated/anonymous access properly scoped
- No public SELECT on sensitive tables
- RLS auto-enable protection
- QR function authentication restrictions

---

## 10. Payment System (Cashfree)

### Overview
**Cashfree** is the sole payment gateway, handling:
- Online payments (UPI, cards, wallets, net banking, BNPL)
- Cash on Delivery (COD) via dynamic QR codes
- IMPS/bank transfers to merchants and riders

### Payment Flow
```
Customer → Cashfree Drop Checkout → Webhook → Order Confirmed
```

### Cashfree Integration Features
| Feature | Implementation |
|---------|---------------|
| **Drop Checkout** | Simplified checkout (Online vs COD choice) |
| **Payment Sessions** | Created server-side with order details |
| **Webhook Verification** | HMAC-SHA256 + timestamp validation + replay window (900s) |
| **Idempotency** | Two-layer: orderId + 120s same-amount/phone guard |
| **QR for COD** | Dynamic QR codes with Cashfree QR refund handling |
| **Payouts** | Cashfree IMPS to riders and merchants |
| **Deterministic transferId** | SHA1 hash for idempotent retries |
| **Environment switching** | Sandbox/Production via `cashfree-environment.ts` |
| **Diagnostics** | Checkout stage logging (`trustit-checkout-diagnostics.ts`) |

### Payment Security
- HMAC-SHA256 signature verification (`timingSafeEqual`)
- Timestamp format validation + replay window (900 seconds)
- Amount anti-tamper (webhook amount vs stored order amount)
- Idempotency on both order creation and webhook processing
- Production readiness tests (`cashfree-production-readiness.test.mjs`)

---

## 11. Security & Authentication

### Authentication Methods
| Method | Implementation |
|--------|---------------|
| **Phone + OTP** | SMS-based OTP with rate limiting |
| **Google 1-Tap** | OAuth integration |
| **Email + OTP** | Email-based OTP |
| **Merchant Auth** | Separate merchant login with invites |
| **Admin Auth** | `requireActiveAdmin()` with Supabase auth |
| **Rider Auth** | Phone + OTP + selfie KYC |

### Security Guards
- **httpOnly cookies** for session tokens
- **Rate limiting** (25 attempts per 10 minutes on sensitive routes)
- **CORS headers** with proper origin validation
- **CSP (Content Security Policy)** via proxy.ts
- **Service worker isolation** — unregistered on rider/partner/merchant pages
- **Cache isolation** — caches deleted on rider/partner/merchant pages
- **SQL injection protection** — Input sanitization before PostgREST queries
- **Timing-safe comparisons** — `constantTimeEqual` for secrets
- **RLS policies** on all database tables
- **Secret scanning** via `scripts/git-guard.mjs`

### What's Already Secured
- ✅ All 33 API routes referenced by UI
- ✅ No dead buttons (200+ buttons scanned)
- ✅ No orphaned API routes
- ✅ No `href="#"` dead links
- ✅ Auth guards consistent across all surfaces
- ✅ Smart Parcha has real PII guards
- ✅ Suspended merchants blocked from QR/payments

---

## 12. Settlement & Wallet System

### Settlement Flow
```
Order Delivered → Payout Split Created → Batch Settlements → Bank Transfer
```

### Components
| Component | Purpose |
|-----------|---------|
| `settlement-service.ts` | Core settlement logic (merchant + rider) |
| `bank-payouts-service.ts` | IMPS payout processing (22KB) |
| `bank-csv-generator.ts` | Bulk CSV for bank transfers |
| `cashfree-payouts-service.ts` | Cashfree payout integration |
| `stablePayoutId()` | Deterministic payout IDs for idempotency |
| `writeAdminAuditRecord()` | Immutable audit trail (Phase 1) |
| `rpcDeductRiderWallet()` | Atomic wallet deduction RPC (Phase 1) |

### Wallet Features
- Rider wallet balance tracking
- Cash-in-hand ceiling management
- Cash remittance at hubs
- Doorstep change digital wallet
- Atomic wallet deduction (no overdraw)
- Parking/toll expense claims

### Settlement Features
- Daily batch settlements for merchants
- Individual rider payout requests
- Admin manual settlement approval
- Settlement ledger with passbook
- CSV export for bulk bank transfers
- Penny-drop bank verification

---

## 13. AI & Smart Features

### AI Components (`lib/trustit-ai/`, `lib/`)
| Feature | Implementation |
|---------|---------------|
| **Smart Parcha OCR** | Real OCR for order verification from images |
| **AI Review Generation** | Gemini-powered review drafts for merchants |
| **Review Validation** | Trustit review validation system |
| **Creative Canvas** | AI image/design generation (23KB) |
| **Review Draft Provider** | AI-assisted review creation (25KB) |
| **Synthetic Review Evaluation** | Review quality evaluation |
| **Gemini Review Provider** | Google Gemini integration for reviews |

### AI Flow
```
Merchant → Request Review Draft → AI Generates → Merchant Edits → Publishes
```

---

## 14. Native Mobile (Android/Capacitor)

### Three Android Builds

| Build | Config | Purpose |
|-------|--------|---------|
| `android-customer-bundle` | `com.trustit.customer` | Customer ordering |
| `android-embedded-bundle` | (embedded) | Merchant management |
| `android-rider-bundle` | (rider) | Rider delivery |

### Android Configuration
- **Capacitor 6.2.0** — Web-to-native bridge
- **Splash screen** — Custom branded splash (1.2s, immersive)
- **Mixed content** — Disabled (security)
- **Background color** — `#1E3A8A` (Trustit blue)
- **HTTP plugin** — Enabled for API calls
- **Keystore** — `trustit-production.keystore` for signing

### Build Commands
```
./gradlew assembleCustomerRelease   # Customer APK
./gradlew assembleRiderRelease      # Rider APK
```

### OTA Updates
- OTA versioning system (current: v2.8.3)
- OTA update banner in app
- `app/api/hyperlocal/ota/route.ts` for OTA config

---

## 15. Testing & Quality

### Test Suite
| Category | Count | Status |
|----------|-------|--------|
| Total test files | 43 `.test.mjs` files | |
| Passing | 290/291 | ✅ |
| Failing | 1 | ⚠️ Environmental (missing Linux TS binary on Windows) |
| Security tests | `security-hardening.test.mjs` (29KB) | ✅ |
| Settlement tests | `settlement-safety.test.mjs` (13KB) | ✅ |
| Cashfree tests | `cashfree-production-readiness.test.mjs`, `cashfree-webhook-handler.test.mjs` | ✅ |
| Rider tests | `rider-ecosystem.test.mjs` (12KB) | ✅ |
| Public routing tests | `public-routing.test.mjs` | ✅ |

### Test Commands
```
pnpm test                    # Run all tests (single-threaded)
pnpm test:cashfree           # Cashfree-specific tests
pnpm typecheck               # TypeScript type checking
pnpm build                   # Production build
```

### Security Audits
| Audit | Date | Status |
|-------|------|--------|
| UI/UX & Wiring Audit | 2026-11-16 | Complete |
| Phase 1 Security Verification | 2026-11-16 | Complete |
| Public Indexability | Ongoing | Script available |
| Secret Scanning | Ongoing | `scripts/git-guard.mjs` |

---

## 16. Current Work (Phase 1 Security)

### Branch: `feat/phase1-security`

### Phase 1 Goal
Harden the financial safety and security posture of the platform, specifically:
1. Immutable admin audit trail for all money movements
2. Webhook replay attack prevention
3. Atomic wallet operations (no race conditions)
4. Idempotent payout processing

### Implemented Changes (on this branch)

| Change | File | Description |
|--------|------|-------------|
| **M1: Audit table** | `supabase/migrations/20261114090000_admin_audit_log.sql` | New immutable `admin_audit_log` table with RLS |
| **M2: Reason columns** | `supabase/migrations/20261114090001_settlement_reason_actor_columns.sql` | `settled_by_email` + `reason` columns on settlement tables |
| **M3: Atomic wallet RPC** | `supabase/migrations/20261114090002_deduct_rider_wallet.sql` | `deduct_rider_wallet` RPC for overdraw-safe deduction |
| **M4: Payout idempotency** | `supabase/migrations/20261114090003_payout_idempotency.sql` | Idempotent payout guard indexes |
| **C2: Replay window** | `lib/cashfree-signature.ts` | Added `verifyCashfreeWebhookReplayWindow()` (900s default) |
| **C1: Audit writes** | `lib/hyperlocal/settlement-service.ts` | Added `writeAdminAuditRecord()` function |
| **C3: Atomic wallet** | `lib/hyperlocal/settlement-service.ts` | Added `rpcDeductRiderWallet()` using M3 RPC |
| **C1+C2: Route hardening** | `app/api/hyperlocal/admin/settlements/route.ts` | Require `reason`, capture actor, write audit |
| **C1: Order admin** | `app/api/hyperlocal/admin/orders/route.ts` | Same audit pattern for order actions |
| **Signature updates** | `lib/cashfree.ts` | Integrated replay window verification |
| **New tests** | `lib/cashfree-webhook-replay.test.mjs`, `lib/settlement-safety.test.mjs` | Test coverage for new security features |

### Phase 1 Verification Results
| Audit Claim | Verification Result |
|-------------|---------------------|
| "No admin audit log" | ✅ **FIXED** — `admin_audit_log` table + `writeAdminAuditRecord()` |
| "Webhook replay vulnerability" | ✅ **FIXED** — 900s replay window added |
| "Duplicate payment protection" | ✅ Already good — two-layer idempotency |
| "Data isolation & RLS" | ✅ Already good — hardened RLS |
| "Settlement consistency" | ✅ **FIXED** — Atomic wallet RPC + idempotent guards |

---

## 17. Deployment & Infrastructure

### Hosting
| Component | Platform |
|-----------|----------|
| Web App (Next.js) | Vercel |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Storage | Supabase Storage |
| Maps | OpenStreetMap + OSRM |
| Payments | Cashfree |

### Environment Configuration
- `.env.example` — Template for environment variables
- `.env.local` — Local development config
- `.env.production.local` — Production config

### Key Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Public Supabase key
- `SUPABASE_SERVICE_ROLE_KEY` — Server-side admin key
- `CASHFREE_APP_ID` — Cashfree merchant ID
- `CASHFREE_SECRET_KEY` — Cashfree secret for webhooks
- `CASHFREE_WEBHOOK_SECRET` — Webhook verification secret
- `GOOGLE_MAPS_API_KEY` — Optional Google Maps
- `CRON_SECRET` — Cron endpoint authentication

### CI/CD
- GitHub Actions (`.github/workflows/`)
- Runs: typecheck + tests + secret-scan + build
- Uses `pnpm install --frozen-lockfile`

### Security in Production
- CSP headers via Next.js proxy
- httpOnly cookies
- Rate limiting on all sensitive routes
- Service worker isolation per app type
- Secret scanning in CI
- No service-role keys in client bundles

---

## Summary: What's Working & What's Being Built

### ✅ Fully Working
- **Customer App** — Full ordering flow with checkout, delivery scheduling, loyalty points, bilingual UI
- **Merchant Dashboard** — 13 modules covering business management, orders, products, QR codes, reviews, payments, analytics
- **Rider App** — 48 screens covering every delivery scenario from onboarding to emergency
- **Payment System** — Cashfree integration with online payments, COD QR, payouts
- **Smart Parcha** — Real OCR-based order verification
- **AI Reviews** — Gemini-powered review generation
- **3 Android APKs** — Customer, Merchant, Rider builds
- **Admin Panel** — Full oversight of orders, settlements, riders, points
- **Security** — RLS, auth guards, rate limiting, CSP, secret scanning

### 🔨 Currently Being Built (Phase 1)
- Immutable admin audit trail for financial actions
- Webhook replay attack prevention
- Atomic wallet operations
- Idempotent payout processing

### 📋 Planned (from audits)
- Component monolith refactoring (order-portal-client, rider/page, merchant forms)
- Error boundaries on all shells
- Empty/loading states on customer side
- GPS accuracy warnings on rider app
- Package rename (review-qr → trustit)

---

*Report generated from codebase analysis on 2026-11-21*
