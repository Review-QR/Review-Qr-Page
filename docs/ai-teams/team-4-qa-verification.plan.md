# Team 4 Plan: QA, Testing & Verification (`team-4-qa-verification`)

- **Role:** Independent QA, Security Tester & Release Gatekeeper
- **Chat Mode:** Isolated chat / subagent (Verifier mode)
- **Primary Goal:** Koi bhi change bina automated tests, typecheck, production build, aur security verification ke main branch mein merge na ho.
- **Owned Files:** `**/*.test.mjs`, `app/*.test.mjs`, `lib/*.test.mjs`, `scripts/verify*.mjs`, `.github/workflows/*`.
- **Do Not Touch:** Production business logic (`app/api/**`, `lib/*.ts`, `android/app/src/**`) — bugs milne par responsible team ko exact report & failing test dein.

---

## Startup & Memory Rules (Har Session Mein Follow Karein)
1. Kaam shuru karne se pehle is file ka **Session Memory & Handoff Log** padhein.
2. Kisi bhi team ka kaam "Done" tabhi mark karein jab aap khud fresh commands run karke exact output dekh lein (no skipped/relaxed assertions).
3. Har verification run ke baad neeche **Handoff Log** mein date, commit/branch, aur exact counts record karein.

---

## Task Checklist

### Milestone 4.1 — Fix Broken Baseline Test Suite
- [x] `lib/rider-ecosystem.test.mjs` (line 58-75 aur line 135-167) ko inspect aur fix karein:
  - `app/rider/page.tsx` refactored screens (`Screen01AuthStart`, `Screen02OtpVerify`, `Screen06PayoutSetup`, `Screen08ShiftScorecard`, `Screen10Radar`, `Screen15Passbook`, `Screen17SafetySos`, `Screen29CustomerRefusalRto`, `Screen31PenaltyDispute`), hooks (`useRiderAuth.ts`, `useRiderWorkflow.ts`), `lib/audio/rider-siren.ts`, aur `app/api/hyperlocal/rider/route.ts` ke real symbols/wiring ke against assertions update kiye (bina checks relax kiye).
  - Bonus baseline fix: `lib/review-draft-provider.test.mjs:226` ko `app/r/[id]/review-experience.tsx` ke `setError(result.message || "We couldn’t prepare a review suggestion. Please try again.")` ke saath align kiya (34/34 pass).
- [x] Full `pnpm test` suite ko 100% green banayein (`285/285` pass after Wave 1 merge + `lib/security-hardening.test.mjs`).

### Milestone 4.2 — Security & Auth Regression Tests (Verify Team 1)
- [x] Naye unit/integration tests (`lib/security-hardening.test.mjs`) add aur verify kiye:
  - CORS allowlist test (`https://trustitreview.com`, `capacitor://localhost`, `http://localhost` allowed; `https://evil.com`, `null` blocked without wildcard `*`).
  - `proxy.ts` fail-closed gates (`/api/cron/*`, `/admin*`, `/api/hyperlocal/admin/*`, protected `/merchant/*` & `/api/merchant/*`) + unauthenticated API routes returning `401`/`403`.
  - Cross-merchant & cross-customer IDOR tests (`/api/merchant/app-operations`, `/api/hyperlocal/orders`).
  - Cashfree `hord_*` webhook signature mismatch (`401`), tampered amount (`400 tampered_amount_rejected`), aur duplicate paid delivery idempotency (`200 idempotent: true`).
  - Rate-limiter sliding-window `429 Retry-After` enforcement + `MAX_RATE_LIMIT_KEYS` (`20,000`) eviction (`lib/rate-limiter.ts`, `enforceRateLimit`).
  - Android release hardening invariants (`android/app/build.gradle`, `capacitor.config.json`, `scripts/build_*_native_apk.mjs`, `AndroidManifest.xml`).

### Milestone 4.3 — CI/CD Quality Gate (`.github/workflows/ci.yml`)
- [x] GitHub Actions workflow banayein jo har PR aur push par chalega:
  1. `pnpm typecheck`
  2. `pnpm test` (+ `pnpm test:cashfree`)
  3. `pnpm audit:public-indexability`
  4. `pnpm build` (safe fallback env vars ke saath; Team 2 ke `ignoreBuildErrors: false` ke baad strict TS build enforce karega)
  5. Secret-scan check (JWTs, private keys, AWS keys, hardcoded secret env vars, hardcoded Android keystore passwords).

### Milestone 4.4 — Release Sign-Off Matrix (Per Merge)
Har Wave merge hone se pehle ye sab PASS hona chahiye:
- [x] `pnpm typecheck` -> `0` errors
- [x] `pnpm test` -> `0` failures (`291/291`)
- [x] `pnpm test:cashfree` -> `0` failures (`23/23`)
- [x] `pnpm build` -> clean exit `0` (`36/36` static pages, strict TS `ignoreBuildErrors: false`)
- [ ] `node scripts/verify_compiled_apk.mjs` (pending full Capacitor/Gradle signed APK build into `public/downloads/Trustit-Merchant-Partner.apk`)

---

## Session Memory & Handoff Log
- **2026-11-12 (Coordinator Initialized):** Baseline check results:
  - `pnpm typecheck`: PASSED (exit 0)
  - `pnpm test`: FAILED at `lib/rider-ecosystem.test.mjs:154` (`app/rider/page.tsx` does not match `/report_dispute/` after screen split into `app/rider/components/screens/`).
- **2026-11-12 (Team 4 Wave 1 — QA & CI Gate):**
  - **Completed Tasks:** Milestone 4.1 test fixes (`lib/rider-ecosystem.test.mjs`, `lib/review-draft-provider.test.mjs`) and Milestone 4.3 (`.github/workflows/ci.yml`).
  - **Files Changed:**
    - `lib/rider-ecosystem.test.mjs`
    - `lib/review-draft-provider.test.mjs`
    - `.github/workflows/ci.yml`
    - `docs/ai-teams/team-4-qa-verification.plan.md`
  - **Key Technical Decisions:**
    - Updated `lib/rider-ecosystem.test.mjs` assertions (both test #4 at lines 58-75 and test #9 at lines 150-156) to verify the real modularized screens (`Screen01AuthStart`, `Screen02OtpVerify`, `Screen06PayoutSetup`, `Screen08ShiftScorecard`, `Screen10Radar`, `Screen15Passbook`, `Screen17SafetySos`, `Screen29CustomerRefusalRto`, `Screen31PenaltyDispute`), hooks (`useRiderAuth.ts`, `useRiderWorkflow.ts`), `lib/audio/rider-siren.ts`, and `app/api/hyperlocal/rider/route.ts` without relaxing checks.
    - Updated `lib/review-draft-provider.test.mjs:226` to allow `result.message || "We couldn’t prepare a review suggestion. Please try again."` matching `app/r/[id]/review-experience.tsx:151`.
    - Left `app/merchant/dashboard/profile/profile.test.mjs:109` untouched (do not relax `Permissions-Policy` check); flagged for Team 1 (`@security`) who owns `next.config.ts` — note that Rider selfie KYC (`Screen04SelfieKyc.tsx`, `Screen27MorningHelmetSelfie.tsx`, `useRiderCamera.ts`) calls `getUserMedia`, so Team 1 + Coordinator should decide between `camera=()` (strictly matching `profile.test.mjs`) vs `camera=(self)` (updating `profile.test.mjs` if camera is required).
    - Created `.github/workflows/ci.yml` with `quality-gate` (secret scan, `pnpm typecheck`, `pnpm test`, `pnpm test:cashfree`, `pnpm build`) and `public-indexability-audit` (`pnpm audit:public-indexability`).
  - **Verification Evidence:**
    - `node --test lib/rider-ecosystem.test.mjs`: PASSED `9/9`
    - `node --test lib/review-draft-provider.test.mjs`: PASSED `34/34`
    - `pnpm test:cashfree`: PASSED `23/23`
    - `pnpm typecheck`: PASSED (exit `0`)
    - `pnpm test`: `278/279` passed, `1` failed (`app/merchant/dashboard/profile/profile.test.mjs:109` due to `next.config.ts` wildcard `Permissions-Policy`, owned by Team 1).
    - `pnpm audit:public-indexability`: FAILED against live `https://trustitreview.com` (`/: canonical mismatch`, actual `'https://trustitreview.com'` vs expected `'https://trustitreview.com/'`).
    - Local secret-scan check against tracked files flagged `android/app/build.gradle` hardcoded keystore passwords (currently being fixed by Team 3 `@android`) and 0 other production secrets.
- **2026-11-12 (Team 4 Wave 2 / Milestone 4.2 — Security & Build Hardening Regression Suite):**
  - **Completed Tasks:** Merged Wave 1 (`main` `f3ee9d8`), verified `@security` (`188c16c` + `f12e230c`) and `@android` (`0e740eb` + `e8f83cb`) fixes, and created `lib/security-hardening.test.mjs` (`6` runtime + invariant test blocks).
  - **Files Changed:**
    - `lib/security-hardening.test.mjs`
    - `docs/ai-teams/team-4-qa-verification.plan.md`
  - **Verification Evidence (after `main` merge + new tests):**
    - `node --test lib/security-hardening.test.mjs`: PASSED `6/6`
    - `pnpm typecheck`: PASSED (exit `0`)
    - `pnpm test`: PASSED `285/285` (`0` failures)
    - `pnpm test:cashfree`: PASSED `23/23` (`0` failures)
- **2026-11-12 (Team 4 Wave 3 / Loom Bugfix Regressions & Milestone 4.4 Release Verification):**
  - **Completed Tasks:** Merged all 3 Loom bug-fix branches (`main` `d03f8bb`), added `lib/loom-bugfix-regressions.test.mjs` (`6` runtime + invariant tests), and ran the full QA verification gate (`typecheck`, `pnpm test`, `pnpm test:cashfree`, `pnpm build`).
  - **Files Changed:**
    - `lib/loom-bugfix-regressions.test.mjs`
    - `docs/ai-teams/team-4-qa-verification.plan.md`
  - **Verification Evidence (after `main` merge `d03f8bb` + new regression suite):**
    - `node --test lib/loom-bugfix-regressions.test.mjs`: PASSED `6/6`
    - `pnpm typecheck`: PASSED (exit `0`)
    - `pnpm test`: PASSED `291/291` (`0` failures, `0` skipped)
    - `pnpm test:cashfree`: PASSED `23/23` (`0` failures)
    - `pnpm build` (with CI placeholder `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` when `.env.local` absent): PASSED (`✓ Compiled successfully in 45s`, `Finished TypeScript in 10.5s`, `36/36` static pages, exit `0`)
- **Current Status:** `LOOM_QA_VERIFICATION_COMPLETE`
- **Next Exact Step:** Commit `lib/loom-bugfix-regressions.test.mjs` and `docs/ai-teams/team-4-qa-verification.plan.md` locally, report to `@coordinator`, and run `node scripts/verify_compiled_apk.mjs` once a signed partner APK is generated into `public/downloads/`.
