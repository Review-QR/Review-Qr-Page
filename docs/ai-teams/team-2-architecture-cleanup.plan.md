# Team 2 Plan: Core Architecture, TypeScript & Cleanup (`team-2-architecture-cleanup`)

- **Role:** Principal Refactoring & Architecture Engineer
- **Chat Mode:** Isolated chat / subagent (`workspace: "share"`)
- **Primary Goal:** Codebase ko clean Modular Monolith banana, `ignoreBuildErrors: false` enforce karna, root directory clutter hatana, aur future Monorepo split ke liye clean boundaries taiyar karna.
- **Owned Files:** `next.config.ts` (`typescript.ignoreBuildErrors`), `tsconfig.json`, `lib/modules/**`, `app/**` (structural cleanup, non-security), root directory cleanup.
- **Do Not Touch:** `android/**`, `proxy.ts`, `app/api/cashfree/**`, `lib/cashfree*`.

---

## Startup & Memory Rules (Har Session Mein Follow Karein)
1. Kaam shuru karne se pehle is file ka **Session Memory & Handoff Log** padhein.
2. Root cleanup karne se pehle hamesha grep/search se confirm karein ki koi code us file ko import/fetch to nahi kar raha.
3. Har task complete hone par `[ ]` ko `[x]` karein aur neeche **Handoff Log** update karein.

---

## Task Checklist

### Milestone 2.1 — TypeScript Strictness Enforcement
- [x] `pnpm typecheck` aur `npx next typegen` run karke verify karein ki zero TS errors hain.
- [x] `next.config.ts` se `typescript: { ignoreBuildErrors: true }` ko `false` karein (ya hata dein).
- [x] `pnpm build` run karke confirm karein ki production build bina type errors ke pass hota hai.

### Milestone 2.2 — Root Directory Clutter Cleanup
- [x] Confirm karein ki root ki purani static HTML/JS files active Next.js App Router ya extension se referenced nahi hain:
  - `index.html`, `activity-logs.html`, `admin-users.html`, `analytics.html`, `businesses.html`, `notifications.html`, `payments.html`, `qr-codes.html`, `renewals.html`, `settings.html`, `data.js`
- [x] Unused legacy static files ko delete ya `archive/legacy-static/` mein clean karein (`git mv` -> `archive/legacy-static/` completed in Wave 1).
- [ ] Root mein padi scratch/video dump files (`loom*`, `loom2*`, `loom3*`) ko safe cleanup karein (Wave 1 check: no `loom*` files found in worktree; `data-supabase-ready.js.txt` left untouched pending owner confirmation).
- [ ] `scripts/` folder ko clean subfolders mein organize karein (`scripts/build/`, `scripts/seed/`, `scripts/audit/`, `scripts/utils/`) aur `package.json` scripts paths update karein (mapped in blueprint, deferred to Wave 2).

### Milestone 2.3 — Clean Modularization (`lib/` -> Domain Boundaries)
- [x] `lib/` ke 70+ flat files (actual: **161 files** = 136 non-test + 25 test) ko clear domain modules ke under map/document karein (`docs/ai-teams/monorepo-migration-blueprint.md` — mass-move deferred to Wave 2 so Wave 1 Security/Android imports stay intact):
  - `lib/modules/auth/` (merchant auth, customer auth, admin guards)
  - `lib/modules/orders/` (hyperlocal, product-orders, dispatch)
  - `lib/modules/payments/` (cashfree, wallet, bank-payouts)
  - `lib/modules/merchant/` (crm, social, qr, onboarding, catalog)
  - `lib/modules/discovery/` (public-discovery, location, seo, sitemap)
- [ ] Shared input validation layer (`zod` ya lightweight typed validators) define karein taaki UI aur API ek hi contract share karein.

### Milestone 2.4 — Monorepo Readiness Blueprint (Future Multi-Coded Shift)
- [x] `docs/ai-teams/monorepo-migration-blueprint.md` banayein:
  - `apps/web` (Customer + Public SEO)
  - `apps/admin` (Isolated Admin)
  - `apps/api` (Dedicated Backend API)
  - `packages/core` (Shared types, validation, business rules)

---

## Verification Gate (Done Hone Se Pehle Mandatory)
- [x] `pnpm typecheck` passes cleanly (Wave 1 & Wave 2 Milestone 2.1 verified: exit code `0`).
- [x] `next build` passes with `ignoreBuildErrors: false` (Wave 2 Milestone 2.1 verified with CI placeholder Supabase env vars: exit code `0`, 36/36 static pages).
- [x] Koi broken import (`@/lib/...`) nahi bacha.

---

## Session Memory & Handoff Log
- **2026-11-12 (Coordinator Initialized):** Baseline `pnpm typecheck` exited with code `0`. Confirmed root legacy `.html` files are not referenced inside `app/` or `lib/`.
- **2026-11-12 (Team 2 — Wave 1 Completed):**
  - **Completed Tasks:** Milestone 2.2 (legacy HTML/JS repo-wide ref check + `archive/legacy-static/` move), Milestone 2.3 (161-file `lib/` inventory & domain mapping), Milestone 2.4 (`docs/ai-teams/monorepo-migration-blueprint.md`), and `pnpm typecheck` verification.
  - **Files Changed:**
    - Moved 11 legacy root files (`index.html`, `activity-logs.html`, `admin-users.html`, `analytics.html`, `businesses.html`, `notifications.html`, `payments.html`, `qr-codes.html`, `renewals.html`, `settings.html`, `data.js`) into `archive/legacy-static/`
    - Created `docs/ai-teams/monorepo-migration-blueprint.md`
    - Updated `docs/ai-teams/team-2-architecture-cleanup.plan.md`
  - **Key Technical Decisions:**
    - Placed legacy static prototypes in `archive/legacy-static/` via `git mv` so Git history stays preserved and reversible.
    - Verified 0 references to all 11 files in `app/`, `lib/`, `extension/`, `components/`, and `scripts/` (matches in `scripts/` are Capacitor bundle-generated `index.html` inside `android-*-bundle/` and `android/app/src/main/assets/public/index.html`, unrelated to root `index.html`).
    - Reported `data-supabase-ready.js.txt` at root (unreferenced, outside Wave 1 ownership) and confirmed 0 `loom*` files exist in this worktree.
    - Mapped all 161 `lib/` files (136 non-test + 25 tests) without mass-moving files yet so Wave 1 Security (`Team 1`) and Android (`Team 3`) suffer zero import conflicts.
  - **Verification Evidence:** `pnpm typecheck` (`tsc --noEmit --incremental false`) exited with code `0`; `verify_blueprint.mjs` confirmed 161/161 `lib/` files mapped.
- **2026-11-12 (Team 2 — Wave 2 Milestone 2.1 Completed):**
  - **Completed Tasks:** Merged `main` (`f3ee9d8`), enabled strict build-time TypeScript checking (`typescript: { ignoreBuildErrors: false }` in `next.config.ts` without touching CORS/CSP/Permissions-Policy headers), and verified `npx next typegen`, `pnpm typecheck`, and `pnpm build`.
  - **Files Changed:** `next.config.ts`, `docs/ai-teams/team-2-architecture-cleanup.plan.md`.
  - **Key Technical Decisions:** Kept `typescript: { ignoreBuildErrors: false }` explicit in `next.config.ts` rather than deleting the block so strict checking remains unmistakable in code review. Noted that `lib/supabase-config.ts` throws at module evaluation during Next page-data collection if `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` are unset (matching `.github/workflows/ci.yml` placeholder env vars resolves it).
  - **Verification Evidence:**
    - `npx next typegen`: `✓ Types generated successfully` (exit `0`).
    - `pnpm typecheck` (`tsc --noEmit --incremental false`): exit `0` (0 TS errors).
    - `pnpm build` (with `NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=placeholder-publishable-key`): exit `0` (`✓ Compiled successfully in 8.2s`, `Finished TypeScript in 2.2s`, `36/36` static pages generated).
- **Current Status:** `WAVE_2_MILESTONE_2_1_COMPLETE`
- **Next Exact Step:** Reorganize `scripts/` into `scripts/{build,seed,audit,utils}/` + update `package.json`, add shared typed validation contracts, and execute Phase 2B `lib/modules/` domain consolidation with transitional shims (Milestone 2.2 remaining + Milestone 2.3).
