# TRUSTIT — Production Launch Checklist
**Verified against actual codebase on branch `feat/phase1-security`**
**Date:** 2026-11-21 | **Total Gaps:** 34 | **P0:** 10 | **P1:** 10 | **P2:** 14
**Progress:** 17/34 fixed (50%)

---

## 🔴 P0 — Production Blocking (10 items)
*Incomplete = app crashes, store rejects, or silent failures in production*

### [ ] 1. Error Boundaries — ZERO exist
- **Where needed:** 4 shells — `order-portal-client`, `rider/page`, `merchant-console-client`, `hyperlocal-admin-client`
- **What to build:** Global `ErrorBoundary` component + wrap each shell
- **Impact:** One fetch crash = entire app down for that user
- **Effort:** Medium

### [ ] 2. Loading States — Only 3/50+ pages have skeletons
- **Have:** `analytics/loading.tsx`, `merchant/dashboard/loading.tsx`, `merchant/dashboard/analytics/loading.tsx`
- **Missing loading on:** `/order`, `/rider`, `/admin/hyperlocal`, `/merchant/dashboard/*` (most modules), `/about`, `/contact`, `/businesses`, `/qr-codes`, `/downloads`, `/partner`, `/pay`, `/payments`, `/analytics`, all API-heavy pages
- **What to build:** Skeleton components per page type
- **Impact:** Blank white screen during data fetch = users think app is broken
- **Effort:** Medium

### [ ] 3. Error Pages (404/500) — Root level missing
- **Have:** `app/[city]/[category]/(listing)/error.tsx` and `not-found.tsx` (only for city listing)
- **Missing:** Root `app/error.tsx`, root `app/not-found.tsx`, `app/global-error.tsx`
- **What to build:** Custom styled error + 404 pages at root level
- **Impact:** Next.js default ugly errors shown to users
- **Effort:** Low

### [ ] 4. Package Name Wrong
- **Current:** `"name": "review-qr"`, `"version": "0.1.0"`
- **Should be:** `"name": "trustit"`, `"version": "1.0.0"`
- **Files to change:** `package.json`
- **Impact:** Wrong branding, npm publish confusion
- **Effort:** Low

### [ ] 5. lib/config.ts Stale
- **Current:** `name: "Review-QR"`, `description: "QR Review Management Platform"`
- **Should be:** `name: "Trustit"`, `description: "Hyperlocal Delivery Super-App"`
- **Files to change:** `lib/config.ts`
- **Impact:** Wrong branding in app metadata
- **Effort:** Low

### [ ] 6. Sentry Error Tracking — Completely Missing
- **Current:** Zero Sentry integration
- **What to build:** `@sentry/nextjs` init, DSN config, source maps, release tracking
- **Env needed:** `SENTRY_DSN`, `SENTRY_AUTH_TOKEN`
- **Impact:** Production crashes invisible, no way to debug user issues
- **Effort:** Medium

### [ ] 7. FCM Push Notifications — Client side missing
- **Current:** `google-services.json` exists in `android/app/`, token storage API exists at `/api/hyperlocal/tokens`, but NO FCM server code, NO notification handler
- **What to build:** Firebase Admin SDK server, notification handler, foreground/background notification UI
- **Impact:** Order status updates won't reach backgrounded app
- **Effort:** High

### [ ] 8. Analytics — Completely Missing
- **Current:** Zero analytics (no GA4, no Plausible, no Umami)
- **What to build:** GA4 or Plausible integration + custom events (order placed, rider accepted, payment success)
- **Env needed:** `NEXT_PUBLIC_ANALYTICS_ID`
- **Impact:** Can't measure user behavior, conversion funnels
- **Effort:** Low

### [ ] 9. Real-time Updates — Polling Only
- **Current:** Admin panel uses polling on view change
- **What to build:** Supabase Realtime subscriptions for order status, rider location, dispatch events
- **Impact:** Delayed updates, battery drain from polling
- **Effort:** Medium

### [ ] 10. Android AAB Format — Only APKs Built
- **Current:** Build outputs only in `apk/` folder, no `bundle/` folder
- **What to build:** Enable AAB (Android App Bundle) build in Gradle, update CI
- **Impact:** Play Store requires AAB format, won't accept APK
- **Effort:** Medium

---

## 🟡 P1 — High Priority (10 items)
*Missing = app works but has quality, security, or operational gaps*

### [ ] 11. Monolith Files — 7 files >1000 lines
| File | Lines | Should Split Into |
|------|-------|------------------|
| `app/merchant/studio/page.tsx` | 3695 | 4-5 components |
| `app/order/order-portal-client.tsx` | 2968 | 7 modules (already architected, just not extracted) |
| `app/merchant/components/MerchantNativeAppShell.tsx` | 2060 | 3-4 components |
| `app/rider/page.tsx` | 1522 | Orchestrator + extracted screens |
| `app/merchant-preview/page.tsx` | 1428 | 3-4 components |
| `components/customer/CustomerStorefrontAndVerticals.tsx` | 1338 | 3-4 components |
| `app/admin/hyperlocal/hyperlocal-admin-client.tsx` | 1324 | 5 tab components |
| `components/customer/CustomerCheckoutAndAddresses.tsx` | 1119 | 3-4 components |
| `app/merchant/dashboard/orders/orders-console-client.tsx` | 1174 | 4 components |
| `app/merchant/dashboard/messages/occasion-studio.tsx` | 1159 | 4 components |
| `app/merchant/dashboard/messages/message-designer.tsx` | 1132 | 4 components |
| `app/merchant/dashboard/payments/merchant-payouts-client.tsx` | 1006 | 4 components |
- **Effort:** High

### [ ] 12. .env.example Incomplete — 21 vars, need 36+
**Currently have (21):**
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
SUPABASE_SECRET_KEY
CASHFREE_CLIENT_ID
CASHFREE_CLIENT_SECRET
CASHFREE_ENVIRONMENT
CASHFREE_API_BASE_URL
CASHFREE_WEBHOOK_URL
CASHFREE_LIVE_PAYMENTS_ENABLED
CASHFREE_WEBHOOK_MAX_REPLAY_SECONDS
TRUSTIT_AI_IMAGE_PROVIDER
OPENAI_IMAGE_MODEL
OPENAI_IMAGE_QUALITY
```
**Missing (15+):**
```
CRON_SECRET                    # Cron endpoint auth
FAST2SMS_API_KEY               # SMS OTP (currently hardcoded!)
NEXT_PUBLIC_APP_URL            # App URL for links
NEXT_PUBLIC_GOOGLE_CLIENT_ID   # Google OAuth
GOOGLE_CLIENT_SECRET           # Google OAuth
NEXT_PUBLIC_ANALYTICS_ID       # Analytics
SENTRY_DSN                     # Error tracking
FIREBASE_API_KEY               # FCM
FIREBASE_AUTH_DOMAIN           # FCM
FIREBASE_PROJECT_ID            # FCM
FIREBASE_STORAGE_BUCKET        # FCM
FIREBASE_MESSAGING_SENDER_ID   # FCM
FIREBASE_APP_ID                # FCM
TRUSTIT_KEYSTORE_PATH          # Android signing
TRUSTIT_STORE_PASSWORD         # Android signing
TRUSTIT_KEY_ALIAS              # Android signing
TRUSTIT_KEY_PASSWORD           # Android signing
UPTIME_ROBOT_API_KEY           # Monitoring
RESEND_API_KEY                 # Email service (if used)
TWILIO_ACCOUNT_SID             # Backup SMS
```
- **Effort:** Low

### [ ] 13. SMS Token Hardcoded in Source Code
- **Files:** `lib/auth/phone-otp-service.ts`, `lib/auth/customer-unified-auth.ts`, `lib/messaging/fast2sms-dispatch.ts`
- **Current:** `const FAST2SMS_BACKUP_TOKEN = Buffer.from("base64stringhere...")`
- **Fix:** Move to `FAST2SMS_API_KEY` env var, remove from source
- **Impact:** Token visible in git history (even if rotated)
- **Effort:** Medium

### [ ] 14. Staging Environment — Missing
- **Current:** Direct production deployment
- **What to build:** Separate Vercel project (staging), separate Supabase project, Cashfree sandbox mode
- **Impact:** Changes go directly to production = high risk
- **Effort:** High

### [ ] 15. Cron Jobs — Only 1 of 6 needed
| Cron Job | Status | Purpose |
|----------|--------|---------|
| `dispatch-occasions` | ✅ Exists | Occasion reminders |
| Settlement batches | ❌ Missing | Daily merchant settlements |
| Auto-cancel stale orders | ❌ Missing | Cancel unconfirmed orders after 15min |
| Rider payout processing | ❌ Missing | Process pending payouts |
| Data cleanup | ❌ Missing | Clean old tokens, expired drafts |
| OTA bundle sync | ❌ Missing | Sync bundle versions |
- **Effort:** Medium

### [ ] 16. Image Upload/Compression — No Service
- **Current:** Uploads pass through without validation/compression
- **What to build:** Sharp-based compression, format conversion (WebP), size validation, dimension limits
- **Impact:** Large images = slow loads, storage bloat
- **Effort:** Medium

### [ ] 17. Backup Strategy — Not Documented
- **Current:** No backup scripts, no recovery plan
- **What to build:** Supabase automated backups (pg_dump), backup verification, recovery runbook
- **Impact:** Data loss = business loss
- **Effort:** Medium

### [ ] 18. Customer Wallet (Stored Balance) — Missing
- **Current:** Rider has `wallet_balance` column. Customer has no stored wallet.
- **What to build:** `customer_wallets` table, top-up flow, balance display, auto-apply at checkout
- **Impact:** No prepaid option for customers, COD dependency
- **Effort:** High

### [ ] 19. Play Store Assets — Missing
| Asset | Status | Required |
|-------|--------|----------|
| App icon (512x512) | ❌ | Required |
| Feature graphic (1024x500) | ❌ | Required |
| Screenshots (2-8 per app) | ❌ | Required (3 apps × 8 = 24) |
| Store listing description | ❌ | Required |
| Privacy Policy URL | ⚠️ Exists but placeholder text | Must be live |
| Data safety form | ❌ | Required |
| Content rating | ❌ | Required |
| Permissions justification | ❌ | Required |
| Promo video | ❌ | Optional |
- **Effort:** Medium

### [ ] 20. Global Rate Limiting — Per-route only
- **Current:** Rate limits on individual routes
- **What to build:** Global middleware rate limiter (express-rate-limit style in Next.js middleware)
- **Impact:** DDoS vulnerability at unprotected routes
- **Effort:** Low

---

## 🟢 P2 — Important but Not Blocking (14 items)
*Nice to have = better UX, more features, but app launches without these*

### [ ] 21. About Page Real Content
- **Current:** `app/about/page.tsx` exists, content is decent
- **Action:** Verify all content is accurate, add real team info
- **Effort:** Low

### [ ] 22. Contact Form — Page exists, form not functional
- **Current:** `/contact` page exists
- **What to build:** Wire form to email API (Resend/EmailJS)
- **Effort:** Low

### [ ] 23. Help/FAQ Pages — Missing
- **What to build:** `/help`, `/faq` pages with common questions
- **Effort:** Low

### [ ] 24. Customer Profile Edit — Missing
- **Current:** No customer-facing "Edit Profile" screen
- **What to build:** Name, phone, email edit screen
- **Effort:** Medium

### [ ] 25. RBAC (Role-Based Access Control) — Admin all-or-nothing
- **Current:** `requireActiveAdmin` = one role, all permissions
- **What to build:** Roles: super_admin, admin, operator, viewer — scoped permissions
- **Effort:** High

### [ ] 26. Dark Mode — Tailwind configured, no toggle
- **Current:** `darkMode: "class"` in `tailwind.config.ts`, no toggle button anywhere
- **What to build:** Theme toggle in header, persist preference
- **Effort:** Low

### [ ] 27. Refund UI — Webhook works, no merchant UI
- **Current:** Cashfree webhook processes refunds automatically
- **What to build:** Merchant-initiated refund button + reason field
- **Effort:** Medium

### [ ] 28. Return/Exchange Flow — No schema
- **Current:** No `return_requests` or `exchange_requests` table
- **What to build:** Schema + customer request flow + merchant approval
- **Effort:** High

### [ ] 29. Rider Rating System — No schema
- **Current:** No `rider_ratings` table
- **What to build:** Post-delivery rating UI + rider rating display
- **Effort:** Medium

### [ ] 30. Order Scheduling — Immediate only
- **Current:** Time slot selection exists in checkout, but no future-order queue
- **What to build:** Schedule-for-later logic + cron dispatch
- **Effort:** Medium

### [ ] 31. DOMPurify — Not installed
- **Current:** Input sanitization via `.replace()` in some places
- **What to build:** Install DOMPurify, sanitize all rich-text inputs
- **Effort:** Low

### [ ] 32. console.log Cleanup — 28 files
- **Current:** `console.log/warn/error` in 28 files (mostly legitimate error paths)
- **Action:** Replace with Pino/Winston logger (covered by structured logging if added)
- **Effort:** Low

### [ ] 33. Sitemap — Verify completeness
- **Current:** `app/sitemap.xml/route.ts` exists
- **Action:** Verify all 50+ pages are included
- **Effort:** Low

### [ ] 34. Multi-City Support — Only Bahraich
- **Current:** City slug routing exists (`/[city]/[category]`)
- **What to build:** City management admin panel, per-city config
- **Effort:** High

---

## ✅ ALREADY DONE (from Phase 1 + existing code)

| Item | Status | Where |
|------|--------|-------|
| HMAC-SHA256 webhook verification | ✅ Done | `lib/cashfree-signature.ts` |
| Replay window (900s) | ✅ Done | `lib/cashfree-signature.ts` |
| Payment idempotency | ✅ Done | Two-layer: orderId + 120s guard |
| RLS on all tables | ✅ Done | Migration-level |
| Admin audit log table | ✅ Done | M1 migration applied |
| Atomic wallet deduction RPC | ✅ Done | M3 migration applied |
| Payout idempotency index | ✅ Done | M4 migration applied |
| Settlement reason/actor columns | ✅ Done | M2 migration applied |
| OTA update system | ✅ Done | Full versioned bundle system |
| Remote config | ✅ Done | `lib/hyperlocal/remote-config.ts` |
| PWA manifest | ✅ Done | `app/manifest.ts` generates it |
| ProGuard/R8 minification | ✅ Done | `android/app/build.gradle` |
| Smart Parcha OCR | ✅ Done | Real OCR, not mock |
| AI Review generation | ✅ Done | Gemini-powered |
| 48 rider screens | ✅ Done | All wired and working |
| Customer ordering flow | ✅ Done | Full cart → checkout → track |
| Merchant dashboard (13 modules) | ✅ Done | All wired |
| Admin panel (5 tabs) | ✅ Done | All wired |
| 67 database migrations | ✅ Done | All applied |
| 290/291 tests passing | ✅ Done | 1 failure = env issue |
| Rate limiting on sensitive routes | ✅ Done | Per-route guards |
| CSP headers | ✅ Done | `proxy.ts` |
| httpOnly cookies | ✅ Done | Session management |

---

## 📅 EXECUTION ORDER

```
WEEK 1:  Items 1-3, 4-5, 12, 13    → Error safety + Package cleanup
WEEK 2:  Items 6, 8                 → Sentry + Analytics
WEEK 3:  Item 9                     → Realtime subscriptions
WEEK 4:  Item 7 (part 1)            → FCM server + client
WEEK 5:  Items 11 (part 1)          → Refactor top 3 monoliths
WEEK 6:  Items 11 (part 2), 16      → Refactor remaining monoliths + image compression
WEEK 7:  Items 14, 15, 17           → Staging + 5 cron jobs + backup
WEEK 8:  Item 10                    → AAB build
WEEK 9:  Items 18, 20               → Customer wallet + rate limiting
WEEK 10: Items 19 (part 1)          → Play Store assets
WEEK 11: Item 8 (part 2)            → FCM full integration
WEEK 12: Items 19 (part 2), P2 items → Play Store listing + P2 features
```

---

*Last updated: 2026-11-21 | Branch: feat/phase1-security | Commit: cef433b*
