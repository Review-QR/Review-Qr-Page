# TRUSTIT Super App — Master UI/UX Architecture & Development Specification (v1.0 Final)

**Product**: TRUSTIT — India's Hyper-Local Multi-Service Super App  
**Design System**: Kinetic Trust (Plus Jakarta Sans, `#0d47a1` Primary, Light Palette, 8px Roundness)  
**Target Viewport**: Mobile First (390px × 844px)  
**Date**: November 2024  

---

## 1. Executive Summary & Design System Foundation

TRUSTIT bridges high-velocity hyper-local convenience (Food, Groceries, Pharmacy, Doorstep Services) with uncompromising regulatory compliance and cryptographic trust. The app is engineered around three pillars:
1. **Verifiable Proof of Commerce**: Zero fake reviews. Ratings and feedback unlock only upon completed digital transactions or physical in-store QR scans.
2. **Indian Statutory & Regulatory Guardrails**: Explicit adherence to CDSCO / Schedule H/H1 Drugs & Cosmetics rules, NPCI UPI intent guidelines, RBI card tokenization, and DPDP Act 2023 consent protocols.
3. **Escrow & Frictionless Recovery**: Real-time transparency with bank UTR numbers, zero-penalty cancellations for merchant faults, and instant reverse gateway settlement.

### Design System Tokens (Kinetic Trust)
- **Primary Color**: Deep Trust Navy (`#0d47a1`)
- **Accent & Status Colors**: 
  - Electric Cyan (`#00e5ff` / `#00b4d8`) — SpeedPass & live tracking
  - Verified Emerald (`#00875a` / `#10b981`) — KYC, genuine badges, success states
  - Alert Crimson (`#dc2626` / `#b91c1c`) — Transaction decline, out of stock, cancellation
  - Amber / Saffron (`#f59e0b` / `#d97706`) — Fast-filling slots, prep stage, warnings
- **Surfaces**: Ultra-light cool canvas (`#faf8ff`), pristine white containers (`#ffffff`), and subtle slate borders (`#e2e8f0`).
- **Typography Scale**: Plus Jakarta Sans (`800` Extrabold headings, `700` Bold subheads, `600` SemiBold actions, `400/500` Body text).

---

## 2. Complete Master Screen Inventory (18 Core Screens)

| # | Screen Name | Screen Ref ID | Navigation Archetype | Primary Role & Features | Entry Points | Next Destinations | Completion Status |
|---|---|---|---|---|---|---|---|
| **01** | **Customer Home Hub** | `{{DATA:SCREEN:SCREEN_36}}` | Tab (Tab 1: Home) | Super-grid across 6 verticals, SpeedPass Gold banner, instant re-order tray, verified merchant spotlights. | App Open / Splash | Explore (`SCREEN_24`), Storefront (`SCREEN_30`), Notifications (`SCREEN_2`) | **Complete** |
| **02** | **Mobile Login & OTP Verification** | `{{DATA:SCREEN:SCREEN_18}}` | Modal / Stack | Phone entry (`+91 98765 43210`), auto-reading SMS passkey simulator, WhatsApp fallback, DPDP Act 2023 compliance. | App First Launch | Customer Home Hub (`SCREEN_36`) | **Complete** |
| **03** | **Explore & Search Hub** | `{{DATA:SCREEN:SCREEN_24}}` | Tab (Tab 2: Explore) | Multi-vertical search, voice & QR input, distance/rating filters, SubzFresh, Apollo, UrbanGlide listings. | Tab 2 / Search icon | Storefront (`SCREEN_30`), Pharmacy (`SCREEN_26`), Auto Care (`SCREEN_20`) | **Complete** |
| **04** | **Merchant Storefront & Menu** | `{{DATA:SCREEN:SCREEN_30}}` | Stack | Meghana Foods storefront, FSSAI verification license, category pills, food items with add/stepper, live cart floating bar. | Home / Explore | Customization (`SCREEN_16`), Cart (`SCREEN_34`) | **Complete** |
| **05** | **Product Customization & Add-ons** | `{{DATA:SCREEN:SCREEN_16}}` | Bottom Sheet / Stack | Portion sizing (Regular / Jumbo Feast), spice slider, multi-select accompaniments (Mirchi ka Salan, Raita, Eggs), chef notes. | Storefront (`SCREEN_30`) | Cart & Checkout (`SCREEN_34`) | **Complete** |
| **06** | **Pharmacy & Prescription Hub** | `{{DATA:SCREEN:SCREEN_26}}` | Stack | Schedule H/H1 warning, Rx photo/PDF upload desk, Doctor Ramesh Rao verification badge, OTC catalog vs Rx locked items. | Home / Explore | Cart & Checkout (`SCREEN_34`) | **Complete** |
| **07** | **Service Booking & Slot Selection** | `{{DATA:SCREEN:SCREEN_20}}` | Stack | Hatchback/Sedan/SUV picker, water/power toggle, 3-day time slot grid, Suresh K. police-cleared technician badge, ₹10,000 warranty. | Home / Explore | Cart & Checkout (`SCREEN_34`) | **Complete** |
| **08** | **Cart & Checkout** | `{{DATA:SCREEN:SCREEN_34}}` | Stack | 3-step checkout stepper, geocoded destination, itemized GST + packaging bill, driver tip, native UPI & tokenized cards. | Cart bar / Storefront | Success (`SCREEN_12`), Failed (`SCREEN_10`), Addresses (`SCREEN_8`) | **Complete** |
| **09** | **Order Placed & Payment Success** | `{{DATA:SCREEN:SCREEN_12}}` | Stack | Confirmed green banner, Doorstep Handover PIN (`4821`), prep tracker, 100% on-time guarantee, tax invoice action. | Successful Checkout | Live Tracking (`SCREEN_32`), GST Invoice | **Complete** |
| **10** | **Payment Failed & Retry** | `{{DATA:SCREEN:SCREEN_10}}` | Stack | NPCI error diagnostic (`ERR_NPCI_TIMEOUT_104`), 08:42 min inventory lock, RBI escrow note, 1-tap failover UPI selector. | Declined Checkout | Order Success (`SCREEN_12`), Support (`SCREEN_4`) | **Complete** |
| **11** | **Live Order Tracking** | `{{DATA:SCREEN:SCREEN_32}}` | Stack | Live interactive Bengaluru route map, rider Rajesh Kumar profile, hygiene/vaccine badges, direct call/chat, doorstep OTP lock. | Success screen / Orders | Handover OTP, Reviews (`SCREEN_28`), Support (`SCREEN_4`) | **Complete** |
| **12** | **Cancellation & Instant Refund Tracker** | `{{DATA:SCREEN:SCREEN_14}}` | Stack | Merchant out-of-stock trigger, 3-stage reversal timeline, NPCI UTR (`3291884102`), ₹0 fee policy, ₹50 TrustCash goodwill credit. | Orders Hub (`SCREEN_22`) | Orders Hub (`SCREEN_22`), Support (`SCREEN_4`) | **Complete** |
| **13** | **Trustit Verified Reviews & Visits** | `{{DATA:SCREEN:SCREEN_28}}` | Tab (Tab 4: Activity) | Proof-of-commerce gatekeeping, pending verified review card, in-store QR scanner trigger, blockchain anchor hash, past reviews log. | Tab 4 / Post-delivery | Profile (`SCREEN_6`), Storefront (`SCREEN_30`) | **Complete** |
| **14** | **Orders & Account Hub** | `{{DATA:SCREEN:SCREEN_22}}` | Tab (Tab 3: Orders) | Active food delivery card, scheduled car spa card with cancel/reschedule actions, fulfilled Apollo order, cancelled SubzFresh refund. | Tab 3 | Live Tracking (`SCREEN_32`), Refund (`SCREEN_14`) | **Complete** |
| **15** | **Saved Addresses Management** | `{{DATA:SCREEN:SCREEN_8}}` | Stack | Live coverage Indiranagar map, Home / Work / Parents labeled cards, gate entry notes, default address toggles. | Checkout / Profile | Checkout (`SCREEN_34`), Profile (`SCREEN_6`) | **Complete** |
| **16** | **Customer Profile & Settings** | `{{DATA:SCREEN:SCREEN_6}}` | Tab (Tab 5: Profile) | Aditya Sharma profile, DigiLocker KYC verified badge, SpeedPass Gold savings, TrustCash balance (`₹280.00`), biometric lock, DPDP export. | Tab 5 | Addresses (`SCREEN_8`), Support (`SCREEN_4`), Logout | **Complete** |
| **17** | **24x7 Help & Support Center** | `{{DATA:SCREEN:SCREEN_4}}` | Stack | Indiranagar order triage card, self-service UTR/Rx tools, expandable FAQs, priority chat button, statutory Grievance Officer details. | Profile / Orders | Priority Chat, Callback desk | **Complete** |
| **18** | **Notification Centre & Alerts** | `{{DATA:SCREEN:SCREEN_2}}` | Stack | Segmented filter pills (All, Orders & Live, Offers), live delivery ETA alert, review unlocked notification, pharmacist Rx approved alert. | Home Bell / Profile | Map (`SCREEN_32`), Reviews (`SCREEN_28`), Pharmacy (`SCREEN_26`) | **Complete** |

---

## 3. End-to-End Customer Journey Flows

```
[ App Launch ]
      │
      ▼
┌─────────────────────────────────┐
│ SCREEN_18: Mobile Login & OTP    │
└─────────────────────────────────┘
      │ (OTP Verified + DigiLocker KYC)
      ▼
┌─────────────────────────────────┐
│ SCREEN_36: Customer Home Hub     │ ◄────────────────────────┐
└─────────────────────────────────┘                          │
      │                  │                                    │
      │ (Search/Explore) │ (Direct Category)                  │
      ▼                  ▼                                    │
┌─────────────────────────────────┐                          │
│ SCREEN_24: Explore & Search     │                          │
└─────────────────────────────────┘                          │
      │                  │                                    │
      ├──────────────────┼────────────────────────┐           │
      ▼                  ▼                        ▼           │
┌────────────────┐ ┌────────────────┐ ┌────────────────┐      │
│ SCREEN_30:     │ │ SCREEN_26:     │ │ SCREEN_20:     │      │
│ Restaurant     │ │ Pharmacy & Rx  │ │ Service Slot   │      │
│ Storefront     │ │ Hub            │ │ Selection      │      │
└────────────────┘ └────────────────┘ └────────────────┘      │
      │                  │                        │           │
      ▼                  │ (Rx Uploaded/Verified) │ (Slot Picked)
┌────────────────┐       │                        │           │
│ SCREEN_16:     │       │                        │           │
│ Customization  │       │                        │           │
└────────────────┘       │                        │           │
      │                  │                        │           │
      └──────────────────┼────────────────────────┘           │
                         ▼                                    │
               ┌──────────────────┐                           │
               │ SCREEN_34: Cart  │ ◄───────┐                 │
               │ & Checkout       │         │ (Update Address)│
               └──────────────────┘         │                 │
                         │                  │                 │
             ┌───────────┴───────────┐      │                 │
             ▼                       ▼      │                 │
       (Payment Fails)         (Payment OK) │                 │
   ┌────────────────────┐ ┌────────────────────┐ │            │
   │ SCREEN_10: Payment │ │ SCREEN_12: Order   │ │            │
   │ Failed & Retry     │ │ Placed & Success   │ │            │
   └────────────────────┘ └────────────────────┘ │            │
             │ (Failover)            │           │            │
             └───────────┐           ▼           │            │
                         │ ┌────────────────────┐│            │
                         │ │ SCREEN_32: Live    ││            │
                         │ │ Order Tracking     ││            │
                         │ └────────────────────┘│            │
                         │           │           │            │
                         │           ▼ (OTP PIN) │            │
                         │ ┌────────────────────┐│            │
                         │ │ SCREEN_28: Verified││            │
                         │ │ Reviews & Activity ││            │
                         │ └────────────────────┘│            │
                         │           │           │            │
                         ▼           ▼           ▼            │
               ┌───────────────────────────────────────┐      │
               │ SCREEN_22: Orders & Account Hub       │──────┘
               │ SCREEN_08: Saved Addresses            │
               │ SCREEN_06: Profile & Security         │
               │ SCREEN_04: 24x7 Help & Grievance      │
               │ SCREEN_02: Notification Centre        │
               └───────────────────────────────────────┘
```

---

## 4. Security, Compliance & Critical Business Rules

1. **OTP & Sensitive PIN Masking**:
   - The Doorstep Handover PIN (`4821`) is displayed **only** on the active `Order Placed` (`SCREEN_12`) and `Live Tracking` (`SCREEN_32`) screens.
   - In notifications (`SCREEN_2`), customers see an explicit advisory: *"Please keep your Doorstep Handover PIN ready"* — the PIN code is masked until the customer opens the app.
2. **Preventing Duplicate Orders & Race Conditions**:
   - Checkout button triggers idempotency keys generated via `UUID_v4(user_id + timestamp + cart_checksum)`.
   - On payment gateway drop-off (`SCREEN_10`), cart inventory is reserved for **08:42 minutes**, displaying a synchronized countdown timer to avoid duplicate merchant charges.
3. **Transparent Payment vs. Refund States**:
   - **Payment States**: `INCOMPLETE` (network drop), `PROCESSING` (bank webhook pending), `AUTHORIZED` (escrow locked), `SETTLED` (merchant confirmed).
   - **Refund States**: `INITIATED` (cancellation approved), `REVERSING` (FastRail UPI reverse webhook), `CREDITED` (settled to source bank account with 10-digit NPCI UTR).
4. **Verifiable Review Gatekeeping**:
   - Zero open-submission reviews. The system verifies `order_id` or physical merchant beacon scanning before rendering the star-rating module (`SCREEN_28`).
   - Third-party Google Review sync is kept strictly separate as an optional opt-in toggle compliant with Google's User Contributed Content policies.
5. **DPDP Act 2023 & Indian Consumer Protection Rules**:
   - Phone numbers are masked in transit between delivery partners and merchants.
   - 24x7 Support screen (`SCREEN_4`) features mandated statutory compliance with Rule 5(9) of the Consumer Protection (E-Commerce) Rules, citing the designated Grievance Officer's full name, email, and Bengaluru jurisdiction.
   - Profile settings (`SCREEN_6`) include granular toggles for Biometric Auth, WhatsApp transactional notifications, and account deletion / data export.

---

## 5. Reusable Component Inventory

- `TrustBadge`: Standardized shield icon with verification tags (`DigiLocker KYC Verified`, `100% Halal`, `Police Cleared`, `CDSCO Compliant`).
- `IndianCurrencyPrice`: Formatted currency display with strike-through MRP, percentage discount chips, and itemized fee breakdown.
- `SteppedProgressBar`: Multi-step indicator used across Checkout stages, Food Kitchen preparation, and Bank Refund settlement.
- `DeliveryInstructionChip`: Reusable quick-instruction tags (`Leave at door`, `Don't ring doorbell after 9 PM`, `Gate security handover`).
- `NPCIDiagnosticsCard`: Standardized banking error and UTR settlement card displaying gateway timestamp, error code, and RBI protection mandate.
- `BottomNavigation5Tab`: Persistent 5-item navigation chrome with active indicators (`Home`, `Explore`, `Orders [badge]`, `Activity [PRO]`, `Profile`).

---

## 6. Development Integration Roadmap & Open Items

### Backend Integrations Required
- **Payment Gateway Multiplexer**: Dual-routing UPI switch between Cashfree/Razorpay and direct UPI Intent (GPay, PhonePe, Paytm).
- **NPCI UTR Webhook Listener**: Real-time webhook ingestion for instant reverse IMPS/UPI refunds.
- **DigiLocker API**: Sandbox integration for customer Aadhaar/Driving License KYC verification badge.
- **Hyperlocal Geofencing & Mapping**: Mapbox / Google Maps SDK integration with real-time driver coordinates and geocoded delivery radius checks.

### Business Rules Requiring Stakeholder Sign-Off
1. *SpeedPass Gold Auto-Renewal*: Policy regarding grace periods and automated deduction from TrustCash wallet.
2. *Goodwill TrustCash Expiry*: Standard expiration window (e.g., 90 days) for complimentary ₹50 inconvenience compensation credits.
3. *Schedule H Prescription Retries*: Maximum customer callback attempts before an unverified prescription order is auto-cancelled.
