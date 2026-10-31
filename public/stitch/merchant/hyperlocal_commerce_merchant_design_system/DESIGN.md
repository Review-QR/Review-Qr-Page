---
name: Hyperlocal Commerce Merchant Design System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#434652'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#737783'
  outline-variant: '#c3c6d4'
  surface-tint: '#2b5bb5'
  primary: '#003178'
  on-primary: '#ffffff'
  primary-container: '#0d47a1'
  on-primary-container: '#a1bbff'
  inverse-primary: '#b0c6ff'
  secondary: '#006875'
  on-secondary: '#ffffff'
  secondary-container: '#00e3fd'
  on-secondary-container: '#00616d'
  tertiary: '#003d27'
  on-tertiary: '#ffffff'
  tertiary-container: '#005739'
  on-tertiary-container: '#66d09c'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d9e2ff'
  primary-fixed-dim: '#b0c6ff'
  on-primary-fixed: '#001945'
  on-primary-fixed-variant: '#00429c'
  secondary-fixed: '#9cf0ff'
  secondary-fixed-dim: '#00daf3'
  on-secondary-fixed: '#001f24'
  on-secondary-fixed-variant: '#004f58'
  tertiary-fixed: '#8df7c1'
  tertiary-fixed-dim: '#71dba6'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005235'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '400'
    lineHeight: 22px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.04em
  code-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
---

## Brand & Style

The design system powers an enterprise-grade merchant partner portal tailored for Indian multi-service hyperlocal commerce—spanning Kirana stores, pharmacies, restaurants, retail outlets, and on-demand home services. 

The visual style blends modern corporate SaaS efficiency with high-density data utility. The interface projects financial reliability, regulatory rigor, and digital enablement for micro, small, and medium enterprises (MSMEs). The design prioritizes instant operational clarity: verification statuses (GSTIN, FSSAI, PAN, UPI) are prominent, daily reconciliation metrics are readily parseable, and high-frequency order processing requires minimal cognitive load. Crisp geometry, controlled contrasts, and tactile state feedback establish institutional credibility while remaining welcoming to everyday business operators.

## Colors

The palette uses a crisp, high-trust foundation engineered for intensive operational workflows in light mode.

- **Primary (`#0D47A1` - Trust Navy):** Anchors primary actions, navigation rails, data visualization primaries, and active states. Reflects financial integrity and institutional stability.
- **Secondary / Accent (`#00E5FF` - Electric Cyan):** Used sparingly as an energetic accent for real-time order pings, active metrics, audio-visual triggers, and subtle linear highlights on dark hero surfaces. Never used for raw body text.
- **Tertiary / Success (`#00875A` - Emerald):** Drives trust verification signifiers (GSTIN active, FSSAI compliant, UPI settlement confirmed) and positive revenue metrics.
- **Warning / Alert (`#F59E0B` - Amber):** Indicates regulatory review states, document expiry warnings, low stock thresholds, and delayed delivery alerts.
- **Neutral Surfaces:**
  - Base canvas: `#F8FAFC`
  - Subtle cards and table headers: `#F1F5F9`
  - High-elevation cards and floating panels: `#FFFFFF`
  - Borders and structural dividers: `#E2E8F0`
- **Neutral Content:**
  - Headers and high-emphasis labels: `#0F172A`
  - Secondary labels and table metadata: `#334155`
  - Subdued hints and placeholder text: `#64748B`

## Typography

The type scale relies entirely on Plus Jakarta Sans to maintain a geometric yet friendly modern tone across complex dense interfaces. 

- **Display & Headlines:** Used for daily GMV counters, settlement figures, and onboarding milestones. Tight negative letter-spacing ensures optical firmness.
- **Body:** Calibrated at 14px (`body-md`) and 13px (`body-sm`) for compact administrative tables, multi-item order slips, and verification notes.
- **Labels & Badges:** `label-sm` utilizes uppercase casing and expanded tracking (`0.04em`) to ensure legibility when rendering regulatory acronyms like GSTIN, FSSAI, IFSC, and UPI.
- **Tabular Data:** Numeric figures for currency (₹) and volumes utilize standard lining figures with proportional tabular alignment to guarantee scan-ability across financial ledgers.

## Layout & Spacing

The portal is built upon an 8pt architectural grid optimized for responsive high-density dashboard layouts:

- **Desktop (≥1280px):** 12-column fluid grid, 24px (`1.5rem`) gutters, 32px (`2rem`) outer canvas margins. Features a persistent 260px navigation sidebar alongside modular card grids.
- **Tablet (768px - 1279px):** 8-column layout, 16px (`1rem`) gutters, 24px (`1.5rem`) margins. Navigation condenses to an icon-rail or top bar.
- **Mobile (<768px):** 4-column layout, 12px gutters, 16px (`1rem`) screen margins. Critical for store managers running incoming orders via handheld POS or phones.

Compact 12px (`space-md`) and 8px (`space-sm`) gaps maintain strict information grouping within operational cards, reducing unnecessary scrolling during active fulfillment windows.

## Elevation & Depth

Visual hierarchy is maintained through subtle, cool-toned structural borders combined with soft ambient light elevation:

- **Flat / Base (`Elevation 0`):** `#FFFFFF` surfaces inset against the `#F8FAFC` canvas, defined entirely by an explicit 1px stroke of `#E2E8F0`. Used for data tables, form containers, and static metric modules.
- **Resting Cards (`Elevation 1`):** `0px 1px 3px rgba(15, 23, 42, 0.06), 0px 1px 2px rgba(15, 23, 42, 0.04)` surrounded by a 1px border of `#E2E8F0`. Used for interactive order cards, catalogue items, and onboarding steps.
- **Interactive Hover (`Elevation 2`):** `0px 4px 6px -1px rgba(15, 23, 42, 0.08), 0px 2px 4px -2px rgba(15, 23, 42, 0.04)`. Applied to active cards, row selections, and button hovers.
- **Overlays & Drawers (`Elevation 3`):** `0px 10px 15px -3px rgba(15, 23, 42, 0.08), 0px 4px 6px -4px rgba(15, 23, 42, 0.03)` with a neutral backdrop scrim (`#0F172A` at 40% opacity). Used for quick-edit catalogue sidebars, GSTIN capture drawers, and settlement details.
- **Critical Alerts & Banners:** Inset styling with a solid 3px left-accent border matching semantic states (Navy, Emerald, Amber, or Crimson) instead of heavy float shadows.

## Shapes

The design system enforces a strict 8px (`0.5rem`) baseline radius across all primary structural components.

- **Standard Elements (8px / `rounded-md`):** Buttons, inputs, search bars, metric tiles, document preview windows, and modal containers. This radius achieves an optimal balance between modern softness and clean data grid alignment.
- **Compact Chips & Verification Pills (4px / `rounded-sm` to 9999px / `rounded-full`):** 
  - Compliance badges (e.g., `GSTIN VERIFIED`, `FSSAI ACTIVE`) use a tailored 4px radius for a clean, formal document stamp look.
  - Live status indicators (e.g., `Online`, `Accepting Orders`) use full circular pill treatment (9999px) to convey real-time availability.

## Components

### Buttons
- **Primary:** Filled `#0D47A1` with crisp white text, 8px corner radius, 40px standard height (desktop), 48px height on mobile. On hover, background shifts to `#0A3880`.
- **Secondary / Subtle:** White surface with 1px border in `#E2E8F0`, `#0F172A` text. Hover transitions to `#F1F5F9`.
- **Accent Action:** `#00E5FF` background with `#0F172A` text, reserved strictly for live incoming dispatch actions or "Go Live" toggles.

### Verification & Compliance Badges
- High-visibility status chips with a 4px corner radius and `label-sm` uppercase styling.
- **Verified State:** `#00875A` text on `#ECFDF5` background with a subtle `#A7F3D0` outline. Accompanied by a verified check icon.
- **Pending/Review State:** `#B45309` text on `#FFFBEB` background with `#FDE68A` outline.
- Specific layouts for **GSTIN**, **FSSAI**, **PAN**, and **UPI VPA** strings, displaying verified checkmarks inline with copy-to-clipboard interactions.

### Input Fields & Selectors
- Background: `#FFFFFF`, 8px corner radius, 1px border `#CBD5E1`.
- Focused state: Border transitions to `#0D47A1` with a 2px outer ring in `rgba(13, 71, 161, 0.15)`.
- Input fields for Indian business formats (IFSC code, GSTIN, 10-digit mobile) feature integrated input masks, uppercase auto-transformation, and trailing verification validation loaders.

### Cards & Dashboards Tiles
- Default background: `#FFFFFF`, border: 1px `#E2E8F0`, 8px corner radius.
- Standard card header includes category indicators (e.g., Grocery, Restaurant, Pharmacy, Hyperlocal Services) with color-coded category labels.
- Metric cards display numeric values in `headline-md` alongside trend pills (+12.4% in `#00875A`).

### Lists & Tables
- Dense presentation with 44px row heights. Alternating hover state of `#F8FAFC`.
- Pinned freeze-columns for merchant action controls (Accept, Reject, Pack, Print KOT/Invoice).
- Clean 1px `#E2E8F0` horizontal borders without vertical separators to preserve horizontal readability.

### Category Switcher (Multi-Service Support)
- Segmented pill controls allowing merchants managing multiple storefronts (e.g., Kirana + Pharmacy or Salon + Care) to toggle inventory and operational configurations effortlessly.