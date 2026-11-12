# Project-Trustit — Multi-AI Engineering Operating System

Is folder mein 4 specialized AI teams ke liye isolated `plan.md` files aur unke strict rules define kiye gaye hain. Is system ka goal hai ki har AI apni **alag chat/conversation** mein kaam kare, **ek-dusre ke files par merge conflict na kare**, aur **kabhi apna purana context ya decisions na bhoole**.

---

## 1. Har AI Ki Chat Alag-Alag Kaise Hoti Hai?

1. **Isolated Chats / Workers:**
   - Har team (Team 1, Team 2, Team 3, Team 4) ek **alag conversation / subagent / swarm worker** ke roop mein chalti hai.
   - Har worker ko sirf **uske domain ka kaam** aur **uski `plan.md` file** di jaati hai.
2. **Isolated Workspaces (Code Conflict Rokne Ke Liye):**
   - Authoring teams (Team 1, Team 2, Team 3) ko alag workspace/branch (`share` ya `branch` mode) diya jata hai taaki ek hi samay mein files corrupt na hon.
   - Team 4 (QA & Verification) read-only/verifier mode mein sabhi changes ko validate karti hai.
3. **Strict File Ownership Matrix:**
   Koi bhi team dusri team ki owned files ko bina Coordinator ki permission ke edit nahi karegi:

| Team | Plan File | Strictly Owned Files / Folders | Forbidden (Touch Nahi Karna) |
| :--- | :--- | :--- | :--- |
| **Team 1: Security & Auth** | `team-1-security-auth.plan.md` | `proxy.ts`, `next.config.ts` (headers/CORS/CSP only), `app/api/**/route.ts`, `lib/*auth*`, `lib/rate-limiter.ts`, `lib/cashfree*`, `supabase/migrations/*` (new security/RLS SQL) | `android/`, `scripts/build_*`, `app/rider/components/*`, root legacy HTML |
| **Team 2: Architecture & Cleanup** | `team-2-architecture-cleanup.plan.md` | `next.config.ts` (`ignoreBuildErrors` flag), `tsconfig.json`, `lib/modules/**`, `app/` refactor boundaries, root legacy `.html`/temp cleanup | `android/`, `proxy.ts`, Cashfree signature/webhook logic |
| **Team 3: Android & Build** | `team-3-android-build.plan.md` | `android/**`, `capacitor.config.json`, `scripts/build_all_three_apps.mjs`, `scripts/prepare_embedded_bundle.mjs`, `scripts/build_*_apk.mjs` | `app/api/**`, `proxy.ts`, `supabase/migrations/*` |
| **Team 4: QA & Verification** | `team-4-qa-verification.plan.md` | `**/*.test.mjs`, `scripts/verify*`, CI workflows (`.github/workflows/*`), verification reports | Production business logic directly edit nahi karegi (sirf test files & bug reports) |

> **Shared File Rule (`next.config.ts`):** Team 1 sirf security headers/CORS/CSP section update karegi; Team 2 sirf `ignoreBuildErrors: false` aur build hygiene update karegi — Coordinator dono merge karega.

---

## 2. Koi Bhi AI Apni Purani Chat / Kaam Kabhi Na Bhoole — Memory Protocol

AI chat sessions jab lambe hote hain (context compact hota hai) ya naya session start hota hai, to AI sirf chat history par bharosa karne se details bhool sakti hai. Isliye **Disk-Backed Memory Rule** mandatory hai:

### Mandatory Startup Ritual (Har Chat Turn / Naye Session ke Start par)
Har AI agent kaam shuru karne se pehle ye 2 steps compulsory karegi:
1. Apni assigned `docs/ai-teams/team-X-*.plan.md` file read karegi (`Status`, `Checkboxes`, `Decisions Log`, `Blockers`, `Next Step`).
2. `git status` aur `git diff --stat` check karegi taaki live workspace state confirm ho.

### Mandatory Shutdown / Handoff Ritual (Har Task Complete hone ya Pause karne par)
Koi bhi AI kaam khatam karne se pehle apni `plan.md` ke **Session Memory & Handoff Log** section mein ye 5 cheezein update karegi:
1. **Completed Tasks (`[x]`):** Kaun-kaun se checkboxes complete hue.
2. **Files Changed:** Exact file paths jo edit/create hui.
3. **Key Technical Decisions:** Kyun koi approach chuni gayi (e.g., CORS allowlist mein `capacitor://localhost` kyun rakha).
4. **Verification Evidence:** Kaun sa command run hua (`pnpm typecheck`, `pnpm test`, `next build`) aur exact pass/fail result.
5. **Exact Next Step:** Agle session ya agle agent ko kahan se resume karna hai.

Is tarah **memory chat window mein nahi, Git-tracked `plan.md` files mein rehti hai** — chahe 10 din baad nayi chat khule ya context reset ho, AI 10 seconds mein wahin se continue karegi jahan chhoda tha.

---

## 3. Baseline Snapshot (Verified on 2026-11-12)

- **TypeScript (`pnpm typecheck`):** Exit code `0` (lekin `next.config.ts` mein `ignoreBuildErrors: true` abhi enabled hai).
- **Automated Tests (`pnpm test`):** Failed in `lib/rider-ecosystem.test.mjs` line 154 (`app/rider/page.tsx` refactor ke baad `report_dispute` match nahi ho raha kyunki screens `app/rider/components/screens/` mein move hui hain).
- **API Routes Count:** `31` route files under `app/api/**/route.ts`.
- **Untracked Files in Git:** `android-customer-bundle/`, `android/app/google-services.json`, `supabase/clean_test_orders_setup.sql`.

---

## 4. Execution Order (Kis Sequence Mein Teams Chalengi)

1. **Wave 1 (Parallel Safe):**
   - **Team 1** -> Security audit & fixes (`next.config.ts` CORS/CSP, `proxy.ts`, API auth/IDOR audit).
   - **Team 3** -> Android hardening (`build.gradle` secrets, `minifyEnabled`, `allowMixedContent: false`, Product Flavors).
2. **Wave 2 (After Wave 1 Security Baseline):**
   - **Team 2** -> Root cleanup, `ignoreBuildErrors: false`, `lib/modules/` clean modularization + monorepo readiness.
3. **Wave 3 (Continuous & Final Gate):**
   - **Team 4** -> Fix/update test suite (`rider-ecosystem.test.mjs`), add API security regression tests, run `typecheck` + `test` + `next build` + APK build check.
