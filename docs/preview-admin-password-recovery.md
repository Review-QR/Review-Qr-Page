# Preview admin password recovery

This recovery flow is enabled only when all of these conditions hold:

- `VERCEL_ENV` is `preview`.
- `VERCEL_GIT_COMMIT_REF` is `codex/cashfree-sandbox-preview`.
- `VERCEL_BRANCH_URL` exactly equals `review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app`.
- The request origin exactly matches that HTTPS branch URL.

The recovery request always uses `/auth/callback`; it accepts no caller-provided redirect. The callback exchanges Supabase's PKCE authorization code server-side, verifies the resulting user with Supabase Auth, and checks that user against an active `admin_users` row before establishing the recovery page session. The password update repeats the active-admin session check. Production deployments and other Preview hosts are refused by the guard.

## Preview Supabase Auth URL Configuration

The recovery callback is:

```text
https://review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app/auth/callback
```

The Preview Supabase project must include that exact URL in its allowed redirect URLs. The flow passes it explicitly as Supabase's `redirectTo`; the Site URL is only the default when the code does not supply a redirect target. Recovery does not require changing the existing `http://localhost:3000` Site URL.

The branch URL is used instead of `VERCEL_URL`, which identifies a unique deployment URL and would not match the stable branch callback configured in Supabase. Vercel's `VERCEL_BRANCH_URL` system variable must be exposed to the Preview runtime. The recovery link should be opened in the same browser that requested it so the SSR PKCE verifier cookie is available to the callback.

Supabase Auth settings must be changed only in `Review-QR-Preview` (`piqwsyzktzjhafkcstjl`). Do not change Production Auth settings. This document records configuration requirements; it does not apply them or send a recovery email.
