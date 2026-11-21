# Trustit — Complete Development Master Plan
**Zero to Production + Play Store Launch**
**Created:** 2026-11-21
**Status:** Planning phase — awaiting execution

---

## Overview
This document captures every missing/incomplete item found during deep audit, organized by priority, with a week-by-week execution plan from emergency fixes through Play Store launch.

---

## Section 1: Complete Audit — What's Missing

### RED FLAGS (Production blocking — P0)

| # | Item | Severity | Why Critical |
|---|------|----------|--------------|
| 1 | Error Boundaries | CRITICAL | Zero ErrorBoundary components — one crash = entire app down |
| 2 | Loading States | CRITICAL | Only 3 loading.tsx files — 95% pages show blank screen on data fetch |
| 3 | Error Pages (404/500) | CRITICAL | No error.tsx or not-found.tsx — Next.js default ugly errors |
| 4 | Package Name | HIGH | `package.json` = "review-qr" v0.1.0 — wrong name for delivery app |
| 5 | .env.example Incomplete | HIGH | 21 vars listed, 15+ missing — deployment will fail |
| 6 | Push Notifications | HIGH | No FCM — order status updates won't reach backgrounded app |
| 7 | Error Tracking | HIGH | No Sentry — production crashes invisible |
| 8 | Analytics | HIGH | No GA/Plausible — can't measure user behavior |
| 9 | PWA Manifest | HIGH | manifest.webmanifest referenced but file missing |
| 10 | Real-time Updates | HIGH | Polling only — no WebSocket/Realtime for order dispatch |
| 11 | i18n Framework | MEDIUM | Hardcoded English — can't serve Hindi-speaking market properly |
| 12 | Image Upload/Compression | MEDIUM | No validation, no compression, no format conversion |
| 13 | Cron Jobs | MEDIUM | Only 1 cron job — settlements, auto-cancel, payouts missing |
| 14 | Staging Environment | MEDIUM | No staging — direct production deployment |
| 15 | Backup Strategy | MEDIUM | No documented backup/recovery plan |
| 16 | Customer Reviews Flow | MEDIUM | No customer-facing review submission |
| 17 | Refund UI | MEDIUM | Webhook handles refunds but no merchant-initiated UI |
| 18 | Offline Support | MEDIUM | Minimal service worker — no offline data persistence |
| 19 | Feature Flags | MEDIUM | No way to enable/disable features gradually |
| 20 | SMS Token in Code | MEDIUM | FAST2SMS_BACKUP_TOKEN hardcoded (base64) in source |
| 21 | About Page Content | LOW | Placeholder "not yet configured" messages |
| 22 | Contact Form | LOW | No functional contact form |
| 23 | Help/FAQ Pages | LOW | No help center |
| 24 | Onboarding Tutorial | LOW | No first-launch tutorial |
| 25 | Dark Mode | LOW | Light mode only |
| 26 | RBAC | LOW | Admin all-or-nothing, no viewer/operator/super roles |
| 27 | Customer Profile Edit | LOW | No customer-facing profile edit |
| 28 | Customer Wallet | LOW | No stored balance, no UPI autopay |
| 29 | Order Scheduling | LOW | Immediate delivery only |
| 30 | Rider Rating | LOW | No customer rating for riders |
| 31 | Return/Exchange Flow | LOW | No return request mechanism |
| 32 | ProGuard/R8 | HIGH | Android build missing minification config |
| 33 | AAB Format | HIGH | Play Store requires AAB, only APKs built |
| 34 | Play Store Assets | HIGH | No screenshots, feature graphic, store listing |
| 35 | Firebase Config | HIGH | google-services.json missing for FCM |
| 36 | Structured Logging | MEDIUM | Only console.log — no production logging |
| 37 | Input Sanitization Lib | MEDIUM | No DOMPurify for rich text |
| 38 | Duplicate Migrations | MEDIUM | 2 duplicate migration files in supabase/migrations/ |
| 39 | Monolith Files (5 files) | HIGH | 3000+ lines in single files |
| 40 | Global Rate Limiting | MEDIUM | Per-route only, no global middleware |
| 41 | Hardcoded City Defaults | LOW | Only Bahraich — multi-city expansion blocked |
| 42 | Sitemap Incomplete | LOW | Some pages missing from sitemap |
| 43 | manifest.webmanifest | HIGH | File missing — PWA install broken |

---

## Section 2: Execution Plan — 20 Weeks

### WEEK 1: Emergency Fixes (P0)

**Goal:** Fix everything that blocks production deployment

- [ ] Package rename: review-qr → trustit
- [ ] lib/config.ts: correct name + description
- [ ] .env.example: add all missing variables
- [ ] FAST2SMS_BACKUP_TOKEN: remove from code, move to env
- [ ] ErrorBoundary component (global + per-section)
- [ ] error.tsx, not-found.tsx, global-error.tsx
- [ ] Loading skeletons (at least 10 pages)
- [ ] About page: real content
- [ ] Contact page: functional form

### WEEK 2-4: Code Refactoring (P0)

**Goal:** Split monoliths into maintainable components

- [ ] order-portal-client.tsx (2,968 → 150 lines orchestrator)
- [ ] rider/page.tsx (1,522 → 150 lines orchestrator)
- [ ] business-profile-form.tsx (1,217 → 5 components)
- [ ] orders-console-client.tsx (1,174 → 4 components)
- [ ] occasion-studio.tsx (1,159 → 4 components)
- [ ] message-designer.tsx (1,132 → 4 components)
- [ ] merchant-payouts-client.tsx (1,006 → 4 components)

### WEEK 5-6: Critical Infrastructure (P0)

- [ ] Sentry error tracking setup
- [ ] FCM push notifications (FCM server + client)
- [ ] Vercal Analytics + UptimeRobot
- [ ] Structured logging (Pino)
- [ ] 5 new cron jobs (settlements, auto-cancel, payouts, cleanup, OTA)

### WEEK 7: Security Hardening (P0)

- [ ] Global rate limiting middleware
- [ ] Zod validation on all API routes
- [ ] Security headers audit
- [ ] Dependency audit (pnpm audit)
- [ ] Duplicate migrations cleanup

### WEEK 8-10: UX Polish (P1)

- [ ] Customer onboarding tutorial
- [ ] Merchant onboarding wizard
- [ ] Rider onboarding guide
- [ ] Empty states everywhere
- [ ] Error states everywhere
- [ ] Help center (/help, /faq)
- [ ] Image upload/compression service
- [ ] Customer profile edit screen

### WEEK 11: Feature Flags + Remote Config (P1)

- [ ] Feature flag service
- [ ] Remote config expansion
- [ ] Kill switch (maintenance mode)

### WEEK 12: Database + Backup (P1)

- [ ] Missing indexes
- [ ] Constraints verification
- [ ] Backup strategy + testing
- [ ] Database health checks

### WEEK 13-14: Testing (P1)

- [ ] E2E tests (customer, merchant, rider flows)
- [ ] Integration tests (payment, webhook, settlement)
- [ ] Security tests (auth bypass, SQL injection, XSS)
- [ ] Load tests (100 concurrent, 1000 orders peak)

### WEEK 15: Staging + CI/CD (P1)

- [ ] Staging environment (Vercel + Supabase + Cashfree sandbox)
- [ ] Deployment pipeline (feature → staging, main → prod)
- [ ] Branch protection rules
- [ ] Rollback mechanism

### WEEK 16-18: Android / Play Store Ready (P0)

- [ ] 3 AAB builds (customer, merchant, rider)
- [ ] ProGuard/R8 minification
- [ ] Firebase config (google-services.json)
- [ ] App signing verification
- [ ] Deep linking
- [ ] App icons (all sizes)
- [ ] Screenshots (2-8 per app)
- [ ] Feature graphic (1024x500)
- [ ] Store listing content
- [ ] Privacy Policy URL live
- [ ] Data safety form
- [ ] Content rating
- [ ] Permissions justification

### WEEK 19-20: Launch (P0)

- [ ] Internal testing (10-50 users)
- [ ] Closed testing (100-500 users)
- [ ] Open testing (public beta)
- [ ] Staged rollout (5% → 25% → 50% → 100%)
- [ ] Marketing launch

---

## Section 3: Post-Launch Roadmap

### Month 2: Stabilize
- Bug fixes from user feedback
- Performance optimization
- Crash fixes
- Server scaling

### Month 3: Enhance
- Customer: Wishlist, reorder, voice search
- Merchant: Bulk CSV import, advanced analytics
- Rider: Heatmap, surge pricing
- Admin: RBAC, advanced reports

### Month 4: Scale
- New city expansion
- More payment methods (Paytm, PhonePe)
- Subscription auto-renewal
- Loyalty expansion

### Month 5: Advanced
- AI recommendations
- Dynamic pricing
- Route optimization
- Inventory prediction

### Month 6: Ecosystem
- Customer wallet
- Credit/EMI options
- Insurance
- Partnerships

---

## Section 4: Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| Monoliths cause bugs | HIGH | HIGH | Refactor in Week 2-4 |
| App crashes in production | HIGH | HIGH | Error boundaries Week 1 |
| No monitoring → silent failures | HIGH | HIGH | Sentry + uptime Week 5 |
| Payment sandbox not flipped | HIGH | CRITICAL | Week 1 checklist |
| Play Store rejection | MEDIUM | HIGH | Compliance Week 18 |
| Database performance | MEDIUM | HIGH | Indexes Week 12 |
| Rider GPS latency | MEDIUM | MEDIUM | Realtime Week 5 |

---

*This document is the single source of truth for Trustit's development roadmap.*
