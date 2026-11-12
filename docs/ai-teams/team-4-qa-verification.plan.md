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
- [ ] Full `pnpm test` suite ko 100% green banayein (currently `278/279` pass — sirf `app/merchant/dashboard/profile/profile.test.mjs:109` fail hai kyunki `next.config.ts` mein `Permissions-Policy` abhi Team 1 `@security` ke Wave 1 edit ka wait kar raha hai).

### Milestone 4.2 — Security & Auth Regression Tests (Verify Team 1)
- [ ] Naye unit/integration tests add karein:
  - CORS allowlist test (trusted origins allowed, random `https://evil.com` blocked).
  - Unauthenticated requests to `/api/hyperlocal/admin/*` and `/api/merchant/*` return `401`/`403`.
  - Cross-merchant IDOR test (Merchant A cannot access/modify Merchant B data).
  - Cashfree webhook signature mismatch returns `401`/`403` + duplicate webhook is idempotent.
  - Rate-limiter test for OTP endpoints.

### Milestone 4.3 — CI/CD Quality Gate (`.github/workflows/ci.yml`)
- [x] GitHub Actions workflow banayein jo har PR aur push par chalega:
  1. `pnpm typecheck`
  2. `pnpm test` (+ `pnpm test:cashfree`)
  3. `pnpm audit:public-indexability`
  4. `pnpm build` (safe fallback env vars ke saath; Team 2 ke `ignoreBuildErrors: false` ke baad strict TS build enforce karega)
  5. Secret-scan check (JWTs, private keys, AWS keys, hardcoded secret env vars, hardcoded Android keystore passwords).

### Milestone 4.4 — Release Sign-Off Matrix (Per Merge)
Har Wave merge hone se pehle ye sab PASS hona chahiye:
- [ ] `pnpm typecheck` -> `0` errors
- [ ] `pnpm test` -> `0` failures
- [ ] `pnpm test:cashfree` -> `0` failures
- [ ] `pnpm build` -> clean exit `0`
- [ ] `node scripts/verify_compiled_apk.mjs` (after Team 3 changes)

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
- **Current Status:** `WAVE_1_PARTIAL_WAITING_TEAM1_TEAM3`
- **Next Exact Step:** Wait for `@security` and `@android` Wave 1 reports on the board, review their diffs, implement Milestone 4.2 security/auth regression tests, and re-run `pnpm typecheck`, `pnpm test`, `pnpm test:cashfree`, `pnpm build`, and `node scripts/verify_compiled_apk.mjs`.
