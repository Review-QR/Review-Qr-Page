# TRUSTIT MERCHANT PARTNER PORTAL
## Complete Architecture & Design System Audit Report

**Target Platform:** TRUSTIT Merchant Partner Web Application (Desktop SaaS)  
**Document Classification:** Engineering & Product Architecture Specification  
**Design System Baseline:** Kinetic Trust (`PLUS_JAKARTA_SANS`, `#0d47a1` Trust Navy, `#00e5ff` Electric Cyan, `#00875a` Emerald, 8px Corner Radius)  
**Statutory & Regulatory Baseline:** RBI Payment Aggregator Directions (PA/PG 2020 & 2021 Update), PSS Act 2007, DPDP Act 2023, IT Act 2000 Section 67C, TRAI DLT Mandates, FSSAI Food Safety Act, and ONDC Protocol Specs.

---

## 1. Executive Summary & Audit Scope

This document provides a comprehensive technical, functional, and design architecture audit across all **70 unique screens** developed across 15 design iterations for the **TRUSTIT Merchant Partner Portal**. 

The portal serves as the primary operational console for Indian hyperlocal retail, QSR/food, pharmacy, and grocery merchants. It unifies high-frequency in-store operations (SoundBox 4G, KOT printing, POS terminals), complex multi-carrier logistics dispatch (merchant fleet, Dunzo, Shadowfax, Borzo), instant T+0 / T+1 escrow settlement rails (Cashfree/NPCI), and multi-channel customer communications.

### Core Objectives of this Audit:
1. **Screen & Module Inventorying:** Categorize every screen into its definitive operational module and layout archetype.
2. **Duplication & Functional Overlap Detection:** Identify redundant UI surfaces, duplicated workflows, and consolidate fragmented user journeys.
3. **Missing Critical Workflows:** Pinpoint unaddressed edge cases, error states, offline fallbacks, and regulatory dead-ends.
4. **Information Architecture & Navigation Integrity:** Standardize global shell navigation, breadcrumb hierarchies, and state indicators.
5. **Security, RBAC & Regulatory Rigor:** Validate Separation of Duties (SoD), PII tokenization, WORM immutability, and 2FA step-up enforcement.
6. **System Dependencies & Engineering Handoff:** Map data schemas, cross-actor interactions (Customer, Merchant, Rider, Compliance Admin), and explicit REST/WebSocket API endpoints.

---

## 2. Complete Screen Inventory by Module

The TRUSTIT Merchant Portal consists of **70 screens** organized into **8 core operational domains**:

| Module ID | Operational Domain | Total Screens | Primary Shell Archetype | Key Functions |
|---|---|---|---|---|
| **MOD-01** | **Merchant Registration & Onboarding Lifecycle** | 12 Screens | `web_blank` (Centered Stepper / Modal) & `web_dashboard` | Self-serve signup, KYC upload, geo-fencing, bank penny-drop, admin review states, resubmission, approval/rejection. |
| **MOD-02** | **Core Dashboard & Executive Analytics** | 5 Screens | `web_dashboard` | High-level GMV/Revenue overview, product velocity, customer cohort retention, delivery fleet SLA analytics. |
| **MOD-03** | **Store, Catalogue & Inventory Operations** | 4 Screens | `web_dashboard` | Storefront trading profiles, category/menu management, stock ledgers, low-stock threshold triggers, live product editor. |
| **MOD-04** | **Multi-Category Order Fulfilment & Kitchen SLA** | 4 Screens | `web_dashboard` | Live order pipeline (QSR, Grocery, Rx), KOT prep timers, biometric packer sign-off, digital weight verification, cancellation ledgers. |
| **MOD-05** | **Hyperlocal Dispatch & Fleet Management** | 6 Screens | `web_dashboard` | Multi-pool courier assignment, live GPS telemetry, merchant-owned roster, specialized medical/appointment dispatch, 3PL failover. |
| **MOD-06** | **Payments, Settlements & Financial Ledgers** | 4 Screens | `web_dashboard` | Cashfree Nodal escrow, T+0 Instant Settle triggers, order transaction splits, bank disbursal history, billing subscriptions. |
| **MOD-07** | **Store QR, Verified Reviews & Reputation** | 4 Screens | `web_dashboard` | Dynamic UPI QR hubs, scan rate analytics, verified review verification, Google Business profile sync, defamatory dispute moderation. |
| **MOD-08** | **Merchant Notifications & Delivery Telemetry** | 3 Screens | `web_dashboard` | Priority triage feed, multi-channel dispatch matrix (SoundBox 4G, WABA, DLT SMS), regulatory circulars, cryptographic transmission ledger. |
| **MOD-09** | **Help Desk, Operational Support & Disputes** | 14 Screens | `web_dashboard` | Unified ticketing, live agent chat, specialized complaint centers (Order, Delivery, Payment, Hardware, Subscriptions, KYC, Refunds), statutory grievance ombudsman. |
| **MOD-10** | **Settings, Governance, Security & Developers** | 14 Screens | `web_dashboard` | Business entity lock, authorized users, RBAC SoD matrix, FIDO2/Passkey auth, bank modification workflows, DPDP 2023 privacy vault, API keys, webhooks, WORM security logs. |

---

## 3. Duplicate Screens & Functional Overlaps

Across the 70 designed screens, several workflows were created in modular batches, resulting in functional duplication, fragmented data entry, and cognitive load for merchants. 

### Issue 1: Bank Account Modification Workflow Fragmentation
* **Screens Involved:**
  * `SCREEN_112`: *Bank Details Change Request* (Module 01 - Early Onboarding)
  * `SCREEN_114`: *Bank Change Request Pending Admin Approval* (Module 01 - Early Onboarding)
  * `SCREEN_14`: *Bank Account Details & Change Request Management* (Module 10 - Settings)
  * `SCREEN_12`: *Settlement Account Verification & Audit Trail* (Module 10 - Settings)
* **Identified Problem:** Three separate interfaces exist for requesting a bank account change. `SCREEN_112` and `SCREEN_114` present an isolated modal/wizard view, while `SCREEN_14` provides a full settings management console with dual-signatory verification, and `SCREEN_12` provides an audit log of the exact same event.
* **Business & Technical Impact:** Disjointed UX; engineering risks building dual API endpoints (`/api/v1/onboarding/bank-change` vs `/api/v1/settings/bank-change`).
* **Recommended Solution (Consolidation):**
  1. Retire `SCREEN_112` and `SCREEN_114` from the post-onboarding route map.
  2. Anchor all post-onboarding bank modifications in `SCREEN_14` (with embedded status tracker and 6-hour cooling countdown).
  3. Treat `SCREEN_12` as the read-only statutory audit trail accessible via an "Audit Ledger" tab directly from `SCREEN_14`.
* **Priority:** **Critical**

### Issue 2: Notification Preferences Redundancy
* **Screens Involved:**
  * `SCREEN_56`: *Communication Preferences & Multi-Channel Notification Matrix* (Module 08 - Notifications)
  * `SCREEN_10`: *Notification Preferences & Communication Settings* (Module 10 - Settings)
* **Identified Problem:** Both screens render nearly identical grids configuring SoundBox 4G, WhatsApp Business API, TRAI DLT SMS, and Email dispatches across operational events, with DND windows and statutory lock notices.
* **Business & Technical Impact:** Confusion regarding navigation hierarchy (`SYSTEM > Notifications > Channels` vs `SYSTEM > Settings > Notifications`). State synchronization race conditions if settings are saved from two distinct screens.
* **Recommended Solution:** Eliminate `SCREEN_56` as an independent page. In the sidebar, have `SYSTEM > Notifications` contain only the **Feed** (`SCREEN_58`) and **Broadcasts/Audit** (`SCREEN_54`). Have the "Preferences" action link directly to `SCREEN_10` under `SYSTEM > Settings`.
* **Priority:** **High**

### Issue 3: Support Dispute Queues vs. Operational Exception Desks
* **Screens Involved:**
  * `SCREEN_42`: *Order Incident & Kitchen Fulfilment Dispute Desk* (Support Module) vs `SCREEN_96`: *Order History, Cancellation Audit & Dispute Ledger* (Order Module)
  * `SCREEN_38`: *Delivery Partner & 3PL Fleet Complaint Desk* (Support Module) vs `SCREEN_84`: *Delivery Exception Management & Reassignment Desk* (Delivery Module)
  * `SCREEN_40`: *Payment & Settlement Dispute Center* (Support Module) vs `SCREEN_80`: *Order Payment Transactions & Net Payable Ledger* (Finance Module)
* **Identified Problem:** Operational screens under Orders, Delivery, and Payments allow dispute flagging, while dedicated support screens handle the exact same dispute resolution dossiers.
* **Business & Technical Impact:** Merchants do not know whether to resolve a 3PL rider stall in `Delivery Management` or in `Support Desk`. Risk of duplicate ticket IDs for the same order exception.
* **Recommended Solution:** Establish strict functional boundaries:
  - **Operational Screens (`Delivery`, `Orders`, `Payments`):** Real-time monitoring and 1-click immediate triage (e.g., "Reassign Rider", "Void KOT", "Request Instant Settle").
  - **Support Screens (`Support Center`):** Post-event arbitration, formal evidence dossier submission, escrow protection payouts, and statutory ombudsman appeals. When an operational action fails (e.g., rider stalls >15 min), auto-route with a linked anchor into the Support Dossier.
* **Priority:** **High**

### Issue 4: Subscription & Merchandise Billing Split
* **Screens Involved:**
  * `SCREEN_76`: *Subscriptions & Store Merchandise Billing Hub* (Finance Module)
  * `SCREEN_36`: *Subscription & Billing Assistance* (Support Module)
  * `SCREEN_34`: *QR Code & Physical Merchandise Support Desk* (Support Module)
* **Identified Problem:** `SCREEN_76` includes plan switching, tax invoices, and merchandise purchases. `SCREEN_36` also includes plan switching and tax invoices under the guise of "Support".
* **Business & Technical Impact:** Billing management is split across "Finance" and "Support", confusing monthly accounting reconciliations.
* **Recommended Solution:** Consolidate active plan selection, card/mandate updating, and tax invoice downloads into `SCREEN_76` (Finance). Reserve `SCREEN_36` strictly for ticketed billing disputes (e.g., missing GSTR-2B Input Tax Credit reconciliation, unauthorized e-mandate debit).
* **Priority:** **Medium**

---

## 4. Missing Business Workflows & Unaddressed States

While the portal covers primary "happy paths" and primary exceptions, several essential production workflows and system states are currently missing:

### Missing Workflow 1: SoundBox 4G Hardware Provisioning, Pairing & Connectivity Faults
* **Identified Problem:** The UI displays SoundBox sync indicators (`SoundBox 4G Live Sync`, volume sliders, test audio), but lacks the setup wizard for initial pairing, QR audio mapping, SIM signal diagnostic, or Wi-Fi captive portal fallback when 4G cellular drops.
* **Business Impact:** Store counter staff will be unable to self-diagnose hardware failure during peak lunch rush, causing missed payment audio receipts and walkout fraud.
* **Recommended Solution:** Design a dedicated modal: `SoundBox 4G Device Provisioning & Network Diagnostics` featuring IMEI scanning, Bluetooth pairing fallback, audio language selector (8 regional languages), and speaker test chime.
* **Priority:** **Critical**

### Missing Workflow 2: Bulk CSV/XLSX Product Catalogue Import with Validation Errors
* **Identified Problem:** Product management (`SCREEN_110`, `SCREEN_104`) currently emphasizes individual item editing with rich previews. Real-world retail and supermarket merchants onboard 500 to 5,000 SKUs via bulk spreadsheet upload.
* **Business Impact:** High onboarding friction for multi-category merchants; manual single-SKU entry is commercially unviable for grocery/pharmacy stores.
* **Recommended Solution:** Introduce `Bulk Product Upload & SKU Mapping Studio` supporting Excel/CSV ingestion, barcode column mapping, FSSAI/CDSCO regulatory validation, and an interactive cell-by-cell error resolution grid.
* **Priority:** **Critical**

### Missing Workflow 3: Multi-Outlet / Store Switching & Consolidated Billing
* **Identified Problem:** The top navigation bar displays a store selector (`Sri Krishna Gourmet - Indiranagar BLR`), but there is no interface for managing brand franchises, adding secondary physical outlets, or viewing consolidated franchise tax summaries.
* **Business Impact:** Enterprise merchants operating 3 to 10 outlets must log in to separate accounts or lack unified multi-outlet inventory views.
* **Recommended Solution:** Introduce an `Enterprise Outlets Management & Multi-Store Aggregator` screen accessible to Master Admin accounts, allowing outlet switching, shared inventory transfers, and consolidated GSTIN reports.
* **Priority:** **High**

### Missing Workflow 4: Offline POS & Network Connectivity Degradation Fallback
* **Identified Problem:** The portal assumes constant high-speed broadband connectivity. There are no UI patterns indicating offline data queueing, stale order cache warnings, or background synchronization retries.
* **Business Impact:** In Indian retail environments where broadband or 4G drops intermittently, cashiers may assume orders failed to sync and double-punch transactions.
* **Recommended Solution:** Define global offline state banners: `Offline Mode Active – Local POS Queueing (X transactions pending sync)` with manual "Force Resync" and indexedDB persistence indicators.
* **Priority:** **High**

### Missing Workflow 5: Tax Holiday, Emergency Closure & Rain Surge Threshold Control
* **Identified Problem:** Store management (`SCREEN_106`) allows setting standard trading hours, but lacks rapid operational controls for sudden disruptions: "Instant Kitchen Pause" (15m, 30m, 1h), "Heavy Rain / Waterlogging Surge Dispatch Lock", or "Dry Day / Festival Menu Blackout".
* **Business Impact:** Kitchens get flooded with online orders during unforeseen in-store power outages or staff shortages, causing severe prep SLA breaches.
* **Recommended Solution:** Add an `Emergency Operational Override` trigger in the global dashboard header allowing one-click temporary store shutdown with auto-resume timers.
* **Priority:** **Medium**

---

## 5. Navigation Consistency & Information Architecture Audit

An audit of the persistent App Shell across all sessions revealed subtle navigational drifts that must be standardized prior to frontend coding:

### 1. Header Metadata Discrepancy
* **Issue:** Earlier screens (e.g., `SCREEN_140`, `SCREEN_82`) used a simplified top header with `GSTIN`, `Search`, `Instant Settle`, and `User Profile`. Later screens (e.g., `SCREEN_58`, `SCREEN_54`, `SCREEN_2`) introduced `SoundBox 4G Live Sync` badge, version tags (`v2.4`), and notification bell badges.
* **Handoff Requirement:** Standardize the persistent desktop header bar across all routes to include:
  1. Store Outlet Selector with Live/Closed status dot.
  2. SoundBox 4G Hardware Sync Pill (Online, Battery %, Signal).
  3. Global Universal Omni-Search (`Ctrl/Cmd + K`) supporting Order IDs, Customer Mobiles, SKU Barcodes, and Ticket Numbers.
  4. Instant Settle T+0 Action CTA (`₹` balance indicator).
  5. Notification Center Bell with unread counter badge.
  6. Master Admin Profile Menu with RBAC role pill and quick logout.

### 2. Sidebar Navigation Grouping Inconsistencies
* **Issue:** In Sessions 0–6, the left sidebar contained a single flat list. In Sessions 7–14, it evolved into structured category groupings:
  - `OPERATIONS`: Overview, Orders, Products & Inventory, Store Management, Delivery.
  - `FINANCE & GROWTH`: Payments & Settlements, Subscriptions, QR & Reviews, Physical Products, Analytics.
  - `SYSTEM`: Notifications, Support, Settings.
* **Handoff Requirement:** Enforce the 3-tier grouping permanently. All routes must align with this sidebar structure:

```
├── OPERATIONS
│   ├── Overview (`/overview`)
│   ├── Orders (`/orders/*`)
│   ├── Products & Inventory (`/catalogue/*`)
│   ├── Store Management (`/store/*`)
│   └── Delivery & Logistics (`/delivery/*`)
├── FINANCE & GROWTH
│   ├── Payments & Settlements (`/settlements/*`)
│   ├── Subscriptions & Plans (`/subscriptions/*`)
│   ├── Store QR & Reviews (`/reputation/*`)
│   └── Business Analytics (`/analytics/*`)
└── SYSTEM
    ├── Notifications (`/notifications/*`)
    ├── Help & Support (`/support/*`)
    └── Settings & Security (`/settings/*`)
```

---

## 6. Detailed Issue Matrix (Developer Handoff Specification)

| # | Screen / Module | Existing Workflow | Identified Problem | Business & Technical Impact | Recommended Solution | Priority |
|---|---|---|---|---|---|---|
| **ISS-01** | `SCREEN_14` / Settings | Merchant clicks "Initiate Change Request" for registered settlement bank. | Lacks clear notification of cooling-off period consequences (e.g., zero disbursals for 6 hours). | Merchant may trigger change during business hours and have daily evening settlement frozen. | Add pre-flight impact banner: "Settlements paused for 6 hours post-approval. Recommend initiating post-EOD." | **Critical** |
| **ISS-02** | `SCREEN_102` / Orders | Live order pipeline allows KOT acceptance. | No automated SoundBox chime trigger verification if counter tablet is muted. | Orders sit unaccepted in kitchen during high-rush noise. | Force Web Audio chime API integration independent of OS volume state; log audio receipt to local indexedDB. | **Critical** |
| **ISS-03** | `SCREEN_86` / Delivery | 3PL rider broadcast auto-allocates to Shadowfax/Dunzo. | No merchant-defined fallback priority rule if 3PL rates exceed order margin. | On low-value orders (e.g., ₹150 snack), a ₹65 surge delivery fee creates negative unit economics. | Implement "Maximum Logistics Fee Ceiling" configuration per delivery tier with merchant confirmation modal. | **High** |
| **ISS-04** | `SCREEN_8` / Settings | DPDP Act Patron PII Masking toggle exists. | Masking is handled purely on frontend client rendering rather than backend API serialization. | Devs might send unmasked customer phone numbers in JSON, exposing raw PII in network tabs. | Enforce backend API response tokenization: customer numbers delivered as `+91 98•••• 1234` unless unmasked via audited WebAuthn challenge. | **Critical** |
| **ISS-05** | `SCREEN_22` / RBAC | POS Cashier role defined with "Restricted" bank view. | No UI state showing how a restricted screen looks when accessed by an unauthorized role (403 state). | Frontend developers lack specifications for forbidden route handling. | Create standard "Access Restricted – Requires Master Admin Elevation" fallback component with "Request Temporary Permission" CTA. | **High** |
| **ISS-06** | `SCREEN_68` / Reviews | Customer review dispute moderation desk allows contest. | No link to ONDC / Google Business Profile API synchronization rules for third-party reviews. | Disputing on TRUSTIT does not propagate removal to Google Maps or ONDC consumer apps. | Add explicit API sync badge: "Local Review Disputed (Syncing to Google Business & ONDC Network)". | **Medium** |
| **ISS-07** | `SCREEN_104` / Products | Product editor has rich preview for food dietary badges. | Missing statutory FSSAI Nutritional Information table & Allergen declaration inputs required by 2024 mandates. | Regulatory non-compliance risks product delisting during food safety inspection audits. | Embed structured FSSAI Allergen checklist (Gluten, Nuts, Dairy) and Nutritional per-100g table in product editor drawer. | **High** |
| **ISS-08** | `SCREEN_2` / Security | WORM Security Logs show Merkle Tree validation path. | No export button for legally certified Section 65B Indian Evidence Act digital certificate. | Logs cannot be directly submitted to Indian cyber courts or banking ombudsman without formal legal hash certificate. | Add "Generate Section 65B Evidentiary Certificate (.PDF + Digital PKI Signature)" action to security log header. | **Medium** |

---

## 7. Role-Based Access Control (RBAC) & Permission Boundaries

The portal defines **6 Standard Roles** with strict Separation of Duties (SoD):

```
                       ┌─────────────────────────────────────────┐
                       │       Master Admin / Proprietor         │
                       │   (Full Root Access + Statutory e-Sign)  │
                       └────────────────────┬────────────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
┌─────────────────────────┐     ┌─────────────────────────┐     ┌─────────────────────────┐
│   Finance Controller    │     │ Store Operations Manager│     │  External Tax Auditor   │
│  (Nodal Ledgers, TDS,   │     │ (Catalogue, Stock, 3PL  │     │  (Read-Only GSTR-1,     │
│   Draft Bank Changes)   │     │  Disputes, Staff Roster)│     │   26AS, Balance Sheet)  │
└─────────────────────────┘     └───────────┬─────────────┘     └─────────────────────────┘
                                            │
                        ┌───────────────────┴───────────────────┐
                        ▼                                       ▼
            ┌─────────────────────────┐             ┌─────────────────────────┐
            │   POS Counter Cashier   │             │    Kitchen Expediter    │
            │(Walk-in Billing, Sound- │             │(KOT Fulfillment, Prep   │
            │  Box, Order Acceptance) │             │ SLA, Dispatch Handover) │
            └─────────────────────────┘             └─────────────────────────┘
```

### Permission Enforcement Rules:
1. **Four-Eyes Principle on Bank Changes:** The `Finance Controller` can initiate and draft bank account modifications, but **only** the `Master Admin` can cryptographically sign and submit via Aadhaar OTP.
2. **Instant Settlement Thresholds:** Cashiers and Store Managers have **zero visibility** into Instant Settlement buttons. Only Finance Controllers (up to ₹50,000/day) and Master Admins (unlimited) can trigger IMPS drawdowns.
3. **PII Masking by Role:** Cashiers and Kitchen Expediters see only masked customer details (e.g. `Rohit S. • +91 ••••• 8912`). Full address is only available to the designated courier.
4. **Emergency Session Revocation:** Master Admin holds the unilateral right to terminate all active store sessions across POS tablets and cashier terminals via `SCREEN_16`.

---

## 8. Cross-Actor Interaction & System Dependencies

The TRUSTIT Merchant Portal does not exist in isolation; it coordinates real-time interactions across four distinct actors and external statutory networks:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 EXTERNAL NETWORKS & RAILS                              │
│       [NPCI / IMPS]        [RBI Escrow / Cashfree]        [ONDC / TRAI DLT / GSTN]     │
└───────────────▲───────────────────────────▲───────────────────────────────▲────────────┘
                │                           │                               │
┌───────────────▼───────────────────────────▼───────────────────────────────▼────────────┐
│                        TRUSTIT BACKEND CORE (Event Bus / WebSockets)                   │
└───────▲───────────────────────────▲───────────────────────────▲──────────────────▲─────┘
        │                           │                           │                  │
        ▼                           ▼                           ▼                  ▼
┌──────────────────┐        ┌──────────────────┐        ┌────────────────┐ ┌─────────────┐
│  MERCHANT PORTAL │        │  CONSUMER APP    │        │  RIDER FLEET   │ │ ADMIN / KYC │
│  (This Platform) │        │ (Buyer Portal)   │        │  (Courier App) │ │ (Compliance)│
│ • Kitchen Prep   │◄──────►│ • Place Order    │◄──────►│ • Accept Order │ │ • Bank Appr │
│ • Dispatch Hand  │        │ • Live Tracking  │        │ • OTP Handover │ │ • FSSAI Chk │
│ • Settle Claims  │        │ • Review / CSAT  │        │ • Geofence Ping│ │ • Disputes  │
└──────────────────┘        └──────────────────┘        └────────────────┘ └─────────────┘
```

### Critical Actor Handshake Protocols:
1. **Order Handover (Merchant ➔ Rider):**
   - Merchant prints KOT with tamper-evident barcode.
   - Rider arrives, scans store geofence.
   - Merchant enters Rider's 4-digit Handshake OTP into `SCREEN_92` to transfer liability.
2. **Doorstep Delivery & Non-Repudiation (Rider ➔ Customer):**
   - Customer provides delivery OTP to Rider.
   - If customer reports missing items, merchant's packing scale weight recorded in `SCREEN_42` (within ±5g tolerance) serves as non-repudiable defense against chargebacks.
3. **Bank Change Compliance (Merchant ➔ TRUSTIT Admin ➔ NPCI):**
   - Merchant submits cancelled cheque in `SCREEN_14`.
   - Backend initiates automated ₹1.00 Penny Drop via NPCI IMPS.
   - TRUSTIT Compliance Officer conducts dual-control review in `SCREEN_32`.
   - Upon admin approval, mandatory 6-hour cooling window begins before funds can be routed to the new account.

---

## 9. API Architecture & Backend Integration Contract

To transition these UI designs into a functional production application, the following REST and WebSocket endpoints must be implemented:

### 1. WebSockets & Real-Time Event Bus (`wss://api.trustit.com/merchant/events`)
* `order.created` ➔ Triggers incoming order banner & SoundBox audio chime on `SCREEN_102`.
* `rider.telemetry` ➔ Streams live GPS latitude/longitude (10s intervals) for map in `SCREEN_92`.
* `soundbox.ping` ➔ Emits heartbeat telemetry every 60s for top-bar status pill.
* `settlement.cleared` ➔ Emits Cashfree UTR confirmation for `SCREEN_82`.

### 2. REST API Endpoints Specification

| Method | Endpoint Path | Associated Screens | Request Body Highlights | Response Attributes |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/login` | `SCREEN_18` | `mobile`, `password`, `fingerprint` | `token`, `mfa_required`, `challenge_type` |
| `POST` | `/api/v1/auth/webauthn/verify` | `SCREEN_18`, `SCREEN_20` | `credential_id`, `clientDataJSON`, `signature` | `session_token`, `rbac_permissions[]` |
| `GET` | `/api/v1/orders/live` | `SCREEN_102` | `?status=prep,ready,dispatch` | `orders[]`, `sla_countdown_seconds`, `kot[]` |
| `POST` | `/api/v1/orders/{id}/handover` | `SCREEN_92`, `SCREEN_100` | `rider_id`, `counter_otp`, `scale_weight_grams` | `handover_status`, `liability_transferred_at` |
| `POST` | `/api/v1/settlements/instant` | `SCREEN_82`, `SCREEN_80` | `amount_inr`, `destination_account_id` | `imps_utr`, `nodal_fee_deducted`, `status` |
| `POST` | `/api/v1/settings/bank/request` | `SCREEN_14` | `ifsc`, `account_num`, `cheque_image_url`, `reason` | `request_id`, `penny_drop_status`, `cooling_end` |
| `GET` | `/api/v1/support/tickets` | `SCREEN_44` | `?priority=P1&status=active` | `tickets[]`, `sla_time_remaining`, `dossier_id` |
| `POST` | `/api/v1/support/disputes/rebuttal` | `SCREEN_30`, `SCREEN_42` | `dispute_id`, `cctv_timecode`, `photo_urls[]` | `rebuttal_status`, `escrow_freeze_lifted` |

---

## 10. Security, Privacy & Compliance Checklist (DPDP & RBI)

1. **Statutory Data Retention (WORM Compliant):**
   - Under Section 67C of the IT Act 2000 and RBI Nodal Directions, all settlement transactions, audit logs, and bank modifications must be stored in immutable Write-Once-Read-Many (WORM) cloud storage for a minimum of **8 continuous calendar years**.
2. **DPDP Act 2023 Enforcement:**
   - Strict 2-hour post-handover customer geolocation and delivery address coordinate purging from merchant-accessible dashboards (`SCREEN_8`).
   - Customer phone number tokenization with encrypted virtual IVR relays for all 3PL drivers.
3. **Session & Cryptographic Integrity:**
   - 90-day mandatory password rotation lifecycle with history hash checks (`SCREEN_16`).
   - Hardware key (FIDO2/YubiKey) step-up authentication required for instant settlement triggers exceeding ₹50,000.
   - Automatic geofence challenge if merchant portal is accessed from IP addresses outside the established metropolitan cluster.

---

## 11. Responsive Design & Accessibility Audit (A11y)

### Current Layout Architecture:
* The current 70 designs are optimized for **Desktop SaaS Workstations** (1440px wide viewport), which is ideal for merchant store managers and back-office accountants.

### Identified Responsive & Accessibility Gaps:
1. **Store Counter Form Factor (iPad / Android POS Terminals - 768px to 1024px):**
   - Multi-column tables (`SCREEN_44`, `SCREEN_80`, `SCREEN_2`) will overflow horizontally on counter tablets.
   - **Remediation:** Implement responsive CSS breakpoints: collapse dense data tables into swipeable card lists on viewports `< 1024px`.
2. **Touch Target Sizing on Touchscreen POS Displays:**
   - Small table action icons (16px to 20px) are difficult for cashier staff wearing food prep gloves.
   - **Remediation:** Minimum touch target size of 44x44px for primary actions (`Accept Order`, `Print KOT`, `Verify Handshake`).
3. **Color Contrast & Lighting in Bright Kitchens:**
   - Light gray badges (`#f1f5f9` with `#64748b` text) wash out under harsh commercial kitchen fluorescent lighting.
   - **Remediation:** Enforce WCAG 2.1 AA compliant contrast ratios (minimum 4.5:1 for body copy and 3:1 for status pills); provide a high-contrast theme toggle.

---

## 12. Developer Handoff Checklist & Phased Roadmap

### Phase 1: Core Foundation & Onboarding (Weeks 1–4)
* Implement persistent Dashboard Shell with standardized header and RBAC navigation router.
* Build merchant signup and KYC document uploader (`SCREEN_126` to `SCREEN_118`).
* Connect NSDL/PAN, GSTIN, and Karza/Perfios bank penny-drop verification APIs.

### Phase 2: Live In-Store Fulfilment & Orders (Weeks 5–8)
* Build Live Order Pipeline (`SCREEN_102`, `SCREEN_100`) with WebSocket listener.
* Integrate Web Audio chimes, POS thermal receipt printer drivers (ESC/POS), and SoundBox 4G sync.
* Implement Courier OTP Handover verification (`SCREEN_92`).

### Phase 3: Financial Settlement & Escrow Engine (Weeks 9–12)
* Implement Cashfree Nodal Account Ledger and T+0 Instant Settle drawdown (`SCREEN_82`, `SCREEN_80`).
* Build Bank Account Modification workflow with dual-signatory verification and 6-hour cooling logic (`SCREEN_14`).
* Connect GSTR-1 and GSTR-2B automated invoice generation (`SCREEN_76`).

### Phase 4: Logistics Failover, Support & Security Hardening (Weeks 13–16)
* Implement 3PL multi-carrier failover engine (Dunzo / Shadowfax) and exception triage (`SCREEN_84`, `SCREEN_38`).
* Build unified Support Ticket Desk & Statutory Ombudsman Docket (`SCREEN_52`, `SCREEN_46`).
* Deploy DPDP 2023 PII tokenization and WORM security audit log export (`SCREEN_8`, `SCREEN_2`).

---
*Report Prepared by: Stitch AI Lead Design & Systems Architect*  
*Status: Ready for Engineering & Product Handoff*