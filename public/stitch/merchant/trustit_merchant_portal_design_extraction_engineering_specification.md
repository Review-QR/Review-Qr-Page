# TRUSTIT MERCHANT PARTNER PORTAL
## Engineering Handoff & Complete Design System Specification

**Target Platform:** Web Desktop SaaS (1440px target baseline)  
**Design System Identifier:** `{{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}}` (Hyperlocal Commerce Merchant Design System / Kinetic Trust)  
**Total Screens Cataloged:** 70 Unique Screens across 15 Design Iterations  
**Audit & Extraction Date:** October 2024 / Engineering Handoff Baseline  
**Document Classification:** Engineering Master Specification (Frontend / Backend / QA / Product)

---

## 1. Design System Tokens & Foundations Extraction

All screens consistently implement the **Kinetic Trust** visual design language governed by `{{DATA:DESIGN_SYSTEM:DESIGN_SYSTEM_1}}`.

### 1.1 Typography
* **Primary Typeface:** `Plus Jakarta Sans` (Google Fonts / Variable WebFont)
* **Font Weights In Use:**
  * `400` (Regular) — Table body cells, explanatory descriptions, meta timestamps
  * `500` (Medium) — Navigation menu links, form helper text, tab labels
  * `600` (Semi-Bold) — Card titles, subheadings, table column headers, form labels, button labels
  * `700` (Bold) — Primary page titles (`h1`), high-level KPI metrics, monetary amounts
  * `800` (Extra-Bold) — Critical alert callouts, numeric currency amounts on hero banners
* **Type Scale Baseline:**
  * Page Title (`h1`): `24px` / `line-height: 32px` / `font-weight: 700`
  * Section Title (`h2`): `18px` / `line-height: 24px` / `font-weight: 600`
  * Card Header (`h3`): `15px` / `line-height: 20px` / `font-weight: 600`
  * Body Text: `13px` / `line-height: 18px` / `font-weight: 400`
  * Caption / Meta: `11px` / `line-height: 14px` / `font-weight: 500`
  * Metric Super-Heading: `32px` / `line-height: 40px` / `font-weight: 700`

### 1.2 Color Palette Tokens
* **Brand & Surface Colors:**
  * `Primary (Trust Navy)`: `#0d47a1` (Primary CTAs, active navigation items, brand mark)
  * `Primary Dark`: `#082b66` (Hover states, pressed buttons)
  * `Accent / Interactive (Electric Cyan)`: `#00e5ff` / `#00b4d8` (Instant Settle trigger, active telemetry pills)
  * `Success / Compliant (Emerald)`: `#00875a` / `#10b981` (Verified badges, penny-drop success, live status dots)
  * `Success Light`: `#e8f5e9` / `#d1fae5` (Status badge background)
  * `Warning / Alert (Amber / Orange)`: `#f59e0b` / `#d97706` (Expiring licenses, review disputes, pending approval)
  * `Warning Light`: `#fffbeb` / `#fef3c7` (Warning callout backgrounds)
  * `Danger / Destructive (Alert Crimson)`: `#ba1a1a` / `#dc2626` (P1 Critical tickets, failed logins, emergency kill switch)
  * `Danger Light`: `#fef2f2` / `#fee2e2` (P1 alert background)
* **Backgrounds & Containers:**
  * `App Background (`surface`)`: `#faf8ff` / `#f8fafc`
  * `Card Surface Container Lowest`: `#ffffff` (White container cards, data table rows)
  * `Card Surface Container Low`: `#f1f5f9` (Nested info blocks, code callouts, read-only fields)
  * `Border Subdued`: `#e2e8f0` (1px subtle border across all cards, table row dividers)
  * `Border Focused / Active`: `#0d47a1` or `#93c5fd`

### 1.3 Radii & Elevation Elevation
* **Corner Radius (`roundness`):** `ROUND_EIGHT` (`rounded-lg` / `8px` strict across cards, buttons, modals, input fields, badges)
* **Badge / Pill Radius:** `9999px` (`rounded-full` for status indicators, counter badges)
* **Shadow System:**
  * `Elevation 1 (Card default)`: `0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)`
  * `Elevation 2 (Dropdown / Modal)`: `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`

---

## 2. Complete Screen Inventory by Module & Design Iteration

The project contains **70 screens** across 15 historical iterations (Sessions 0 to 14):

| Iteration | Module Code | Screen ID | Canonical Screen Name | Shell Archetype |
|:---:|:---:|:---:|---|---|
| **0** | **MOD-01** | `{{DATA:SCREEN:SCREEN_139}}` | Merchant Registration Welcome | `web_blank` |
| **0** | **MOD-02** | `{{DATA:SCREEN:SCREEN_141}}` | Merchant Dashboard Overview | `web_dashboard` |
| **1** | **MOD-01** | `{{DATA:SCREEN:SCREEN_137}}` | Step 3: PAN, GST & Regulatory Licenses | `web_blank` |
| **1** | **MOD-01** | `{{DATA:SCREEN:SCREEN_135}}` | Step 4: Bank Details & Settlement Policy | `web_blank` |
| **1** | **MOD-01** | `{{DATA:SCREEN:SCREEN_133}}` | Step 2: Business Type & Category | `web_blank` |
| **1** | **MOD-01** | `{{DATA:SCREEN:SCREEN_131}}` | Step 5: Store Setup & Geofence | `web_blank` |
| **1** | **MOD-01** | `{{DATA:SCREEN:SCREEN_129}}` | Step 6: QR Kit & Final Review | `web_blank` |
| **2** | **MOD-01** | `{{DATA:SCREEN:SCREEN_127}}` | Step 1 – Basic Business Details & Mobile Verification | `web_blank` |
| **2** | **MOD-01** | `{{DATA:SCREEN:SCREEN_125}}` | Application Successfully Submitted | `web_blank` |
| **2** | **MOD-01** | `{{DATA:SCREEN:SCREEN_123}}` | Verification Pending Dashboard | `web_dashboard` |
| **2** | **MOD-01** | `{{DATA:SCREEN:SCREEN_121}}` | Admin Requests Additional Documents | `web_blank` |
| **2** | **MOD-01** | `{{DATA:SCREEN:SCREEN_119}}` | Application Approved & Onboarding Completed | `web_blank` |
| **2** | **MOD-01** | `{{DATA:SCREEN:SCREEN_117}}` | Application Rejected with Reason | `web_blank` |
| **2** | **MOD-01** | `{{DATA:SCREEN:SCREEN_115}}` | Bank Change Request Pending Admin Approval | `web_dashboard` |
| **2** | **MOD-01** | `{{DATA:SCREEN:SCREEN_113}}` | Bank Details Change Request | `web_dashboard` |
| **3** | **MOD-03** | `{{DATA:SCREEN:SCREEN_111}}` | Product Catalogue Management | `web_dashboard` |
| **3** | **MOD-03** | `{{DATA:SCREEN:SCREEN_109}}` | Inventory Management & Stock Ledger | `web_dashboard` |
| **3** | **MOD-03** | `{{DATA:SCREEN:SCREEN_107}}` | Store Management & Operations Profile | `web_dashboard` |
| **3** | **MOD-03** | `{{DATA:SCREEN:SCREEN_105}}` | Add & Edit Product Workflow with Live Preview | `web_dashboard` |
| **4** | **MOD-04** | `{{DATA:SCREEN:SCREEN_103}}` | Live Orders Command & Multi-Category Pipeline | `web_dashboard` |
| **4** | **MOD-04** | `{{DATA:SCREEN:SCREEN_101}}` | Order Details & Restaurant Kitchen SLA Execution | `web_dashboard` |
| **4** | **MOD-04** | `{{DATA:SCREEN:SCREEN_99}}` | Specialized Category Fulfilment Desk: Pharmacy Rx & Grocery Picking | `web_dashboard` |
| **4** | **MOD-04** | `{{DATA:SCREEN:SCREEN_97}}` | Order History, Cancellation Audit & Dispute Ledger | `web_dashboard` |
| **5** | **MOD-05** | `{{DATA:SCREEN:SCREEN_95}}` | Delivery Management & Dispatch Operations | `web_dashboard` |
| **5** | **MOD-05** | `{{DATA:SCREEN:SCREEN_93}}` | Live Delivery Tracking & Handover Verification | `web_dashboard` |
| **5** | **MOD-05** | `{{DATA:SCREEN:SCREEN_91}}` | Merchant-Owned Rider Management & Roster | `web_dashboard` |
| **5** | **MOD-05** | `{{DATA:SCREEN:SCREEN_89}}` | Specialized Category Dispatch & Service Appointments | `web_dashboard` |
| **6** | **MOD-05** | `{{DATA:SCREEN:SCREEN_87}}` | TRUSTIT Fleet Rider Assignment & Broadcast Desk | `web_dashboard` |
| **6** | **MOD-05** | `{{DATA:SCREEN:SCREEN_85}}` | Delivery Exception Management & Reassignment Desk | `web_dashboard` |
| **7** | **MOD-06** | `{{DATA:SCREEN:SCREEN_83}}` | Financial Overview & Settlement Command Desk | `web_dashboard` |
| **7** | **MOD-06** | `{{DATA:SCREEN:SCREEN_81}}` | Order Payment Transactions & Net Payable Ledger | `web_dashboard` |
| **7** | **MOD-06** | `{{DATA:SCREEN:SCREEN_79}}` | Settlement History & Bank Disbursal Ledger | `web_dashboard` |
| **7** | **MOD-06** | `{{DATA:SCREEN:SCREEN_77}}` | Subscriptions & Store Merchandise Billing Hub | `web_dashboard` |
| **8** | **MOD-07** | `{{DATA:SCREEN:SCREEN_75}}` | Store QR Code Management & Scan Analytics Hub | `web_dashboard` |
| **8** | **MOD-07** | `{{DATA:SCREEN:SCREEN_73}}` | Verified Customer Reviews & Multi-Channel Feedback Command Desk | `web_dashboard` |
| **8** | **MOD-07** | `{{DATA:SCREEN:SCREEN_71}}` | Merchant Reputation Analytics, Campaigns & Google Integration | `web_dashboard` |
| **8** | **MOD-07** | `{{DATA:SCREEN:SCREEN_69}}` | Customer Visit Verification & Review Dispute Moderation Desk | `web_dashboard` |
| **9** | **MOD-02** | `{{DATA:SCREEN:SCREEN_67}}` | Merchant Business Overview & Revenue Analytics | `web_dashboard` |
| **9** | **MOD-02** | `{{DATA:SCREEN:SCREEN_65}}` | Product & Category Performance Analytics | `web_dashboard` |
| **9** | **MOD-02** | `{{DATA:SCREEN:SCREEN_63}}` | Customer Retention & Cohort Analytics | `web_dashboard` |
| **9** | **MOD-02** | `{{DATA:SCREEN:SCREEN_61}}` | Delivery Operations & Fleet SLA Analytics | `web_dashboard` |
| **10** | **MOD-08** | `{{DATA:SCREEN:SCREEN_59}}` | Notification Center Overview & Priority Alert Feed | `web_dashboard` |
| **10** | **MOD-08** | `{{DATA:SCREEN:SCREEN_57}}` | Communication Preferences & Multi-Channel Notification Matrix | `web_dashboard` |
| **10** | **MOD-08** | `{{DATA:SCREEN:SCREEN_55}}` | Announcements, Platform Updates & Delivery Audit History | `web_dashboard` |
| **11** | **MOD-09** | `{{DATA:SCREEN:SCREEN_53}}` | Help & Support Dashboard & Knowledge Base | `web_dashboard` |
| **11** | **MOD-09** | `{{DATA:SCREEN:SCREEN_51}}` | Create New Support Ticket & Complaint Studio | `web_dashboard` |
| **11** | **MOD-09** | `{{DATA:SCREEN:SCREEN_49}}` | Ticket Details, Live Chat & Conversation Desk | `web_dashboard` |
| **11** | **MOD-09** | `{{DATA:SCREEN:SCREEN_47}}` | Escalation & Grievance Management Desk | `web_dashboard` |
| **12** | **MOD-09** | `{{DATA:SCREEN:SCREEN_45}}` | My Support Tickets – Complete Ticket History & Audit Ledger | `web_dashboard` |
| **12** | **MOD-09** | `{{DATA:SCREEN:SCREEN_43}}` | Order-Related Complaint Management & Kitchen SLA Desk | `web_dashboard` |
| **12** | **MOD-09** | `{{DATA:SCREEN:SCREEN_41}}` | Payment & Settlement Dispute Center | `web_dashboard` |
| **12** | **MOD-09** | `{{DATA:SCREEN:SCREEN_39}}` | Delivery Partner & 3PL Fleet Complaint Center | `web_dashboard` |
| **13** | **MOD-09** | `{{DATA:SCREEN:SCREEN_37}}` | Subscription & Billing Assistance | `web_dashboard` |
| **13** | **MOD-09** | `{{DATA:SCREEN:SCREEN_35}}` | QR Code & Physical Merchandise Support Desk | `web_dashboard` |
| **13** | **MOD-09** | `{{DATA:SCREEN:SCREEN_33}}` | KYC & Merchant Verification Support | `web_dashboard` |
| **13** | **MOD-09** | `{{DATA:SCREEN:SCREEN_31}}` | Refund & Cancellation Assistance | `web_dashboard` |
| **13** | **MOD-09** | `{{DATA:SCREEN:SCREEN_29}}` | FAQ & Knowledge Base Hub | `web_dashboard` |
| **13** | **MOD-09** | `{{DATA:SCREEN:SCREEN_27}}` | Ticket Resolution Confirmation & Merchant Feedback | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_25}}` | Merchant Account Settings & Business Profile | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_23}}` | Role-Based Access Control & Permissions | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_21}}` | Personal Profile & Authorized Users | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_19}}` | Login Security & Multi-Factor Authentication | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_17}}` | Password Management & Active Sessions | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_15}}` | Bank Account Details & Change Request Management | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_13}}` | Settlement Account Verification & Audit Trail | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_11}}` | Notification Preferences & Communication Settings | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_9}}` | Privacy, Data Protection & Consent Management | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_7}}` | API Keys, Webhooks & Developer Integrations | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_5}}` | Connected Applications & Third-Party Integrations | `web_dashboard` |
| **14** | **MOD-10** | `{{DATA:SCREEN:SCREEN_3}}` | Account Activity, Security Logs & Device History | `web_dashboard` |

---

## 3. Duplicate & Overlapping Screens Matrix

The modular creation process generated specific points of workflow redundancy that require routing deduplication in engineering:

| Issue | Conflicting Screens | Identified Conflict & Functional Overlap | Recommended Frontend Route Consolidation |
|---|---|---|---|
| **DUP-01** | `SCREEN_113`, `SCREEN_115` vs `SCREEN_15`, `SCREEN_13` | `SCREEN_113` & `SCREEN_115` (Session 2) represent early onboarding bank change requests. `SCREEN_15` & `SCREEN_13` (Session 14) represent the production Settings bank change workflow with 2FA reveal, dual-signatory verification, and cooling-off timers. | **Deprecate** `SCREEN_113` & `SCREEN_115` from the live app. Anchor all bank account views and modification requests at `/settings/bank` (`SCREEN_15`), linking `/settings/bank/audit` (`SCREEN_13`) as a sub-tab. |
| **DUP-02** | `SCREEN_57` vs `SCREEN_11` | `SCREEN_57` (Session 10: *Notifications Matrix*) and `SCREEN_11` (Session 14: *Notification Preferences*) render nearly identical grids for SoundBox 4G, WABA, DLT SMS, and Email channel dispatch rules. | **Consolidate** into `SCREEN_11` under `/settings/notifications`. Set `/notifications` in the sidebar to strictly route to the live notification feed (`SCREEN_59`) and broadcast updates (`SCREEN_55`). |
| **DUP-03** | `SCREEN_43` vs `SCREEN_97` | `SCREEN_43` (*Order Incident & Kitchen SLA Desk*) and `SCREEN_97` (*Order History & Cancellation Audit*) both provide dispute filing mechanisms for missing items and delayed prep. | Boundary definition: `SCREEN_97` handles historical order searching and 1-click incident reporting; clicking "Dispute" deep-links directly into the evidence dossier desk of `SCREEN_43`. |
| **DUP-04** | `SCREEN_39` vs `SCREEN_85` | `SCREEN_39` (*3PL Fleet Complaint Center*) and `SCREEN_85` (*Delivery Exception Management Desk*) both handle rider mechanical breakdowns and Dunzo/Shadowfax failovers. | Boundary definition: `SCREEN_85` is an active dispatch tool (live reassignment in <100s). `SCREEN_39` handles post-dispatch financial reimbursement claims and rider blacklisting. |
| **DUP-05** | `SCREEN_77` vs `SCREEN_37` | `SCREEN_77` (*Subscriptions & Merchandise Billing Hub*) and `SCREEN_37` (*Subscription & Billing Assistance*) both display the ₹29/₹49/₹99 plan switcher and tax invoice downloads. | Keep plan upgrades and standard tax invoices on `SCREEN_77` (`/subscriptions`). Keep `SCREEN_37` strictly for disputing e-Mandate auto-debit failures and missing GSTR-2B Input Tax Credit. |

---

## 4. Navigation Architecture & Screen Hierarchy

### 4.1 Shell Navigation Tree
The production persistent shell (`web_dashboard`) enforces a 3-tier taxonomy in the left sidebar:

```
├── OPERATIONS
│   ├── Overview ➔ SCREEN_141 (Dashboard)
│   ├── Orders ➔ SCREEN_103 (Live Orders) | SCREEN_101 (KOT) | SCREEN_99 (Rx/Grocery) | SCREEN_97 (History)
│   ├── Products & Inventory ➔ SCREEN_111 (Catalogue) | SCREEN_109 (Stock) | SCREEN_105 (Editor)
│   ├── Store Management ➔ SCREEN_107 (Store Ops) | SCREEN_25 (Business Profile)
│   └── Delivery ➔ SCREEN_95 (Dispatch) | SCREEN_93 (Live GPS) | SCREEN_91 (Fleet Roster) | SCREEN_87 (Broadcast) | SCREEN_85 (Failover)
├── FINANCE & GROWTH
│   ├── Payments & Settlements ➔ SCREEN_83 (Overview) | SCREEN_81 (Ledger) | SCREEN_79 (Disbursals)
│   ├── Subscriptions ➔ SCREEN_77 (Plan Switcher & Invoices)
│   ├── QR & Reviews ➔ SCREEN_75 (QR Hub) | SCREEN_73 (Reviews) | SCREEN_71 (Reputation) | SCREEN_69 (Disputes)
│   ├── Physical Products ➔ SCREEN_35 (Standee & Merchandise Desk)
│   └── Analytics ➔ SCREEN_67 (Revenue) | SCREEN_65 (Products) | SCREEN_63 (Cohorts) | SCREEN_61 (Fleet SLA)
└── SYSTEM
    ├── Notifications ➔ SCREEN_59 (Alert Feed) | SCREEN_55 (Announcements & Audit)
    ├── Support ➔ SCREEN_53 (Help Hub) | SCREEN_51 (Create Ticket) | SCREEN_49 (Live Chat) | SCREEN_45 (All Tickets) | SCREEN_47 (Grievance Ombudsman)
    └── Settings ➔ SCREEN_25 (Profile) | SCREEN_21 (Team) | SCREEN_23 (RBAC) | SCREEN_19 (MFA) | SCREEN_17 (Sessions) | SCREEN_15 (Bank) | SCREEN_13 (Audit) | SCREEN_11 (Notifications) | SCREEN_9 (DPDP) | SCREEN_7 (API Keys) | SCREEN_5 (Apps) | SCREEN_3 (WORM Logs)
```

### 4.2 Top Navigation Header Contract
All dashboard screens require the standardized top header:
1. **Outlet Selector:** Brand dropdown displaying currently active location (`Sri Krishna Gourmet - Indiranagar BLR`) + operational indicator dot.
2. **GSTIN Tag:** Active verified GSTIN badge (`29AABCS1429B1ZB`).
3. **Omni-Search Bar:** Universal input supporting `Order ID`, `Customer Mobile`, `SKU Barcode`, and `Ticket #` with shortcut indicator (`Ctrl/Cmd + K`).
4. **Instant Settle CTA:** Electric Cyan button (`⚡ Instant Settle`) displaying available nodal escrow balance.
5. **Notification Bell:** Notification center launcher with real-time unread count badge.
6. **User Account Profile:** Master Admin avatar pill displaying name (`Raghavendra Rao`) and RBAC role tag.

---

## 5. End-to-End User Journeys & Workflows

### 5.1 Journey 1: Merchant Registration & Regulatory KYC
1. `SCREEN_139` (Welcome) ➔ User initiates registration.
2. `SCREEN_127` (Step 1) ➔ Mobile verification via OTP and basic business metadata.
3. `SCREEN_133` (Step 2) ➔ Business classification (Restaurant, QSR, Grocery, FMCG).
4. `SCREEN_137` (Step 3) ➔ NSDL PAN extraction, GSTIN validation, FSSAI Food License / CDSCO upload.
5. `SCREEN_135` (Step 4) ➔ Bank IFSC, account number input, and instant ₹1.00 Penny-Drop execution.
6. `SCREEN_131` (Step 5) ➔ Physical storefront geo-pinning, dispatch counter address, 150m strict fence.
7. `SCREEN_129` (Step 6) ➔ Merchandise standee selection, SoundBox 4G tier review, Aadhaar e-sign.
8. `SCREEN_125` (Submitted) ➔ Handoff to compliance admin.
9. **Branching Approval States:**
   - Approved: `SCREEN_119` ➔ Redirect to live dashboard (`SCREEN_141`).
   - Under Review: `SCREEN_123` ➔ Verification pending dashboard.
   - Additional Docs Requested: `SCREEN_121` ➔ Targeted document re-upload drawer.
   - Rejected: `SCREEN_117` ➔ Formal statutory rejection explanation with re-appeal option.

### 5.2 Journey 2: Live In-Store Order Fulfilment & Kitchen SLAs
1. `SCREEN_103` (Live Orders Pipeline) ➔ Inbound order triggers Web Audio chime and SoundBox voice alert.
2. `SCREEN_101` (KOT SLA Execution) ➔ Kitchen expediter accepts order; 15-minute countdown starts; ESC/POS thermal printer emits KOT.
3. Packing verification: Packer enters biometric ID; IoT weigh scale logs payload gross weight (`1,284g` vs `1,280g` target).
4. `SCREEN_93` (Handover) ➔ Delivery partner arrives; merchant inputs rider's 4-digit Handshake OTP (`4821`); liability transfers.
5. In case of exception: `SCREEN_97` or `SCREEN_43` ➔ Instant dispute opened with pre-attached CCTV timecode and digital weight slip.

### 5.3 Journey 3: Hyperlocal Dispatch & Multi-Carrier Failover
1. `SCREEN_95` (Delivery Operations) ➔ Order dispatched to delivery pool.
2. `SCREEN_87` (Broadcast Desk) ➔ System evaluates rider availability across In-House Fleet, Dunzo, and Shadowfax.
3. Exception trigger: Courier stalls for >10 mins outside geofence (`SCREEN_85`).
4. Automatic failover: Autonomous engine drops stalled rider and assigns nearest backup courier in 78 seconds (`SCREEN_39`).
5. Real-time telemetry: Live GPS coordinates stream to map (`SCREEN_49`). Merchant payout protected by Zero-Penalty Escrow.

### 5.4 Journey 4: Bank Account Modification & Immutability Guard
1. `SCREEN_15` (Bank Settings) ➔ Merchant views registered HDFC Bank details (masked: `••••••••••••8729`).
2. Merchant clicks "Initiate Change Request" ➔ Step-up 2FA authentication challenge triggered (`SCREEN_19`).
3. Merchant uploads cancelled cheque; system initiates automated ₹1.00 Penny-Drop via NPCI IMPS.
4. Pre-flight cooling notice: Settlements will freeze for 6 hours post-approval.
5. Dual-authorization: Finance Controller drafts request; Master Admin e-signs with Aadhaar OTP.
6. Statutory audit recorded: SHA-256 Merkle root hash logged in `SCREEN_13` and WORM security log `SCREEN_3`.

### 5.5 Journey 5: Operational Dispute Lodgement & Statutory Ombudsman
1. `SCREEN_51` (Create Ticket Studio) ➔ Merchant identifies stalled order or fee deduction.
2. Smart linker attaches live entity (`#TR-90230` / `#SET-1024A`). Priority auto-set to P1 Critical (15-min SLA).
3. Visual evidence attached (`kitchen_pack_photo_tr90230.jpg`).
4. `SCREEN_49` (Live Chat Desk) ➔ Assigned specialist Pooja Verma intervenes via encrypted channel.
5. Resolution: `SCREEN_27` ➔ Resolution certificate generated; merchant submits CSAT feedback.
6. Legal escalation fallback: If merchant disagrees, claim escalates to `SCREEN_47` (Statutory Grievance Ombudsman under IT Intermediary Rules 2021).

---

## 6. Comprehensive UI Components & Actions Inventory

| Category | UI Element / Component | Screen Location Examples | Engineering Functional Contract |
|---|---|---|---|
| **Buttons & CTAs** | `⚡ Instant Settle` | Persistent Top Header (`SCREEN_141`–`SCREEN_3`) | Triggers IMPS instant payout drawdown modal; calls `/api/v1/settlements/instant`. Redacted for non-treasury roles. |
| **Buttons & CTAs** | `Revoke All Other Sessions` | `SCREEN_17` (Password & Sessions) | Emergency kill switch; invalidates all active JWT/OAuth tokens across terminals except current caller. |
| **Buttons & CTAs** | `Initiate Change Request` | `SCREEN_15` (Bank Settings) | Opens multi-signatory modal for bank modification; requires WebAuthn step-up challenge. |
| **Buttons & CTAs** | `+ Raise New Support Ticket` | `SCREEN_53`, `SCREEN_45` | Routes to 6-step guided complaint studio (`SCREEN_51`). |
| **Buttons & CTAs** | `Test Chime` | `SCREEN_11` (Notification Settings) | Emits test payload to SoundBox 4G speaker via WebSocket trigger. |
| **Forms & Inputs** | Universal Search (`Ctrl+K`) | Persistent Top Header | Debounced 300ms autocomplete querying Order IDs, Customer Mobiles, SKU Barcodes, and Ticket IDs. |
| **Forms & Inputs** | Document Drag-and-Drop | `SCREEN_51`, `SCREEN_33`, `SCREEN_31`, `SCREEN_15` | Multi-format uploader (`.pdf`, `.jpg`, `.png`, max 25MB) with client-side mime validation and virus scan check. |
| **Forms & Inputs** | Rich Text Guided Editor | `SCREEN_51` (Create Ticket) | Markdown-supported textarea with structured guidance prompts for incident logging. |
| **Forms & Inputs** | Masking & Toggle Switches | `SCREEN_11`, `SCREEN_9`, `SCREEN_23` | iOS-style toggle components with instantaneous optimistic UI updates and backend PATCH confirmation. |
| **Tables & Grids** | Security Log Audit Table | `SCREEN_3` | Multi-column table with severity filter chips, actor filter, date range picker, pagination, and Merkle hash verification. |
| **Tables & Grids** | Live Orders Queue Cards | `SCREEN_103`, `SCREEN_101` | Kanban-style cards with real-time countdown timers, category tags, KOT acceptance triggers, and rider handover OTP inputs. |
| **Tables & Grids** | Granular RBAC Matrix | `SCREEN_23` | 6x8 permissions grid mapping roles (Master Admin, Finance, Ops, Cashier, Expediter, CA) to binary or scoped rights. |
| **Data Cards & KPIs** | Metric Counter Cards | `SCREEN_141`, `SCREEN_53`, `SCREEN_83`, `SCREEN_3` | 4-column metric cards showing primary numeric value, delta percentage pill, status subtext, and contextual icon. |
| **Modals & Drawers** | Product Editor Drawer | `SCREEN_105` | Right-side sliding drawer with live mobile storefront preview, dietary tag toggles, and inventory threshold inputs. |

---

## 7. State Coverage Audit & Missing UI Specifications

To ensure zero implementation gaps during frontend development, the following missing system states must be built according to the established design system:

### 7.1 Loading States
* **Current Evidence:** Existing designs showcase fully populated, loaded data states.
* **Engineering Requirement:** 
  * Implement skeleton shimmer loaders (`bg-slate-200 animate-pulse rounded`) matching the exact layout of:
    1. 4-column metric KPI cards.
    2. Table rows in `SCREEN_45` (Tickets), `SCREEN_81` (Payments), and `SCREEN_3` (Security Logs).
    3. Order card queues in `SCREEN_103`.

### 7.2 Empty States
* **Current Evidence:** Zero explicit empty states exist on the canvas.
* **Engineering Requirement:** Build clean, branded empty state patterns (centered icon in Trust Navy `#0d47a1`, bold title, descriptive subtitle, primary action button) for:
  1. `No Orders in Queue` on `SCREEN_103` ("Your kitchen is ready. New orders will chime automatically.").
  2. `No Active Support Tickets` on `SCREEN_45` ("All merchant escalations are resolved. Clean slate!").
  3. `No Disputed Transactions` on `SCREEN_41` ("Zero disputes. All customer settlements are cleared.").

### 7.3 Error States
* **Current Evidence:** Validation error states are illustrated on onboarding (`SCREEN_121`), but runtime operational error states are missing.
* **Engineering Requirement:**
  1. **Network Disconnection / Offline Banner:** Sticky top banner: `⚠️ Offline Mode Active — Local POS queueing enabled (X transactions pending sync)`.
  2. **API 500 / Timeout Fallback:** In-table inline alert row: `Failed to load ledger records. [Retry Connection]`.
  3. **Form Validation Alerts:** Input borders transition to Alert Crimson `#ba1a1a` with 11px helper text below the field.

### 7.4 Restricted / Forbidden States (HTTP 403)
* **Current Evidence:** `SCREEN_23` defines strict RBAC rules (Cashier and Kitchen Expediter have restricted views for Bank Details and Settlements), but lacks the actual visual representation of a restricted screen.
* **Engineering Requirement:** Standardize the `403 Access Restricted Component`:
  * Centered lock illustration in Slate/Navy.
  * Heading: `Access Restricted – Role Elevation Required`.
  * Subtext: `This financial console requires Finance Controller or Master Admin credentials. Your current role is POS Counter Cashier.`
  * CTA: `Request Temporary Permission from Master Admin`.

---

## 8. Viewport Coverage & Responsive Breakpoint Matrix

| Device Form Factor | Viewport Width | Current Design Coverage | Engineering Implementation Specification |
|---|---|:---:|---|
| **Desktop Workstation** | `1440px` and above | **100% (70 / 70 Screens)** | Native designed baseline. Persistent left navigation sidebar (`w-64`), top fixed header (`h-16`), fluid container (`max-w-7xl`). |
| **Tablet / Store Counter POS** | `768px` to `1024px` (iPad, Sunmi POS) | **0% Designed (NOT FOUND)** | **Handoff Remediation Required:**<br>1. Sidebar collapses into an off-canvas drawer toggled via hamburger menu.<br>2. Multi-column tables (`SCREEN_45`, `SCREEN_81`, `SCREEN_3`) convert into expandable card lists.<br>3. Minimum touch target size enforced at `44x44px` for counter touchscreens. |
| **Mobile / Handheld Device** | `375px` to `428px` (Android POS / Manager Mobile) | **0% Designed (NOT FOUND)** | **Handoff Remediation Required:**<br>1. Bottom navigation bar for core operational tabs (Orders, Kitchen, Alerts, Profile).<br>2. Metric cards stack in a 2x2 grid or swipeable carousel.<br>3. Order KOT acceptance cards expand full-width with large thumb-friendly CTAs. |

---

## 9. API Contracts & Backend Integration Dependencies

To connect the 70 UI screens to the production TRUSTIT backend, the following REST and WebSocket endpoints must be implemented:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              API INTEGRATION MATRIX                                    │
├─────────────────────────┬────────┬─────────────────────────────────────────────────────┤
│ Endpoint Path           │ Method │ Primary Screens Supported                           │
├─────────────────────────┼────────┼─────────────────────────────────────────────────────┤
│ /api/v1/auth/login      │ POST   │ SCREEN_139, SCREEN_17                               │
│ /api/v1/auth/webauthn   │ POST   │ SCREEN_19, SCREEN_15                                │
│ /api/v1/orders/live     │ GET    │ SCREEN_103, SCREEN_101                              │
│ /api/v1/orders/{id}/kot │ POST   │ SCREEN_101                                          │
│ /api/v1/orders/handover │ POST   │ SCREEN_93, SCREEN_101                               │
│ /api/v1/fleet/reassign  │ POST   │ SCREEN_85, SCREEN_39                                │
│ /api/v1/settle/instant  │ POST   │ Persistent Top Header, SCREEN_83                    │
│ /api/v1/settings/bank   │ POST   │ SCREEN_15, SCREEN_13                                │
│ /api/v1/support/tickets │ GET/POST│ SCREEN_53, SCREEN_51, SCREEN_45                    │
│ /api/v1/support/chat    │ POST   │ SCREEN_49                                           │
│ /api/v1/security/revoke │ POST   │ SCREEN_17                                           │
│ /api/v1/audit/worm/cert │ GET    │ SCREEN_3                                            │
├─────────────────────────┴────────┴─────────────────────────────────────────────────────┤
│ WebSockets (wss://api.trustit.com/merchant/events):                                    │
│ • order.created ➔ Incoming KOT audio trigger                                          │
│ • rider.telemetry ➔ Live GPS map updates                                              │
│ • soundbox.ping ➔ Hardware heartbeat & volume status                                   │
│ • settlement.cleared ➔ Nodal escrow balance refresh                                    │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Statutory & Regulatory Compliance Baseline

1. **RBI Payment Aggregator Directions (PA/PG 2020 & 2021 Update):**
   * Nodal escrow settlement accounts must be insulated from merchant operational losses.
   * T+0 and T+1 disbursals require automated penny-drop verification and 8-year WORM audit retention (`SCREEN_13`, `SCREEN_3`).
2. **Indian Digital Personal Data Protection (DPDP) Act, 2023:**
   * Patron PII tokenization: customer phone numbers delivered as `+91 98•••• 1234` unless unmasked via audited WebAuthn challenge (`SCREEN_9`, `SCREEN_23`).
   * Mandatory automated purge of customer delivery address GPS coordinates **2 hours post-handover**.
3. **TRAI DLT & IT Intermediary Rules, 2021:**
   * Mandatory transactional SMS headers (`TM-TRUST`) and WhatsApp Business API message templates (`SCREEN_11`).
   * Statutory Grievance Redressal Officer directory with 24h acknowledgment and 15-day resolution mandates (`SCREEN_47`).

---
*Specification Compiled & Published to DataStore as permanent engineering documentation.*  
*Ready for Frontend Engineering, Design System Tokenization, and Backend API Implementation.*
