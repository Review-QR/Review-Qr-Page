# Preview admin password recovery

This recovery flow is enabled only when all of these conditions hold:

- `VERCEL_ENV` is `preview`.
- `VERCEL_GIT_COMMIT_REF` is `codex/cashfree-sandbox-preview`.
- The request origin matches Vercel's `VERCEL_URL` for this `review-qr-page` team deployment.

The recovery request always uses `/auth/callback`; it accepts no caller-provided redirect. The callback exchanges Supabase's PKCE authorization code server-side, verifies the resulting user with Supabase Auth, and checks that user against an active `admin_users` row before establishing the recovery page session. The password update repeats the active-admin session check. Production deployments are refused by the Preview guard.

## Preview Supabase Auth URL Configuration

Current Preview deployment origin:

```text
https://review-qr-page-fkgushtt9-review-qr.vercel.app
```

Required values for that deployment:

- **Site URL:** `https://review-qr-page-fkgushtt9-review-qr.vercel.app`
- **Allowed Redirect URL:** `https://review-qr-page-fkgushtt9-review-qr.vercel.app/auth/callback`

Do not add wildcard redirect patterns. Vercel may issue a different `VERCEL_URL` for a later Preview deployment. Before requesting a recovery email from that deployment, use its exact `https://<VERCEL_URL>/auth/callback` as the allowed redirect and its exact origin as the Site URL for this Preview-only Supabase project. The recovery request page will fail closed if the deployment is not on the named branch or the request origin differs from the current Vercel deployment host.

Supabase Auth settings must be updated only in `Review-QR-Preview` (`piqwsyzktzjhafkcstjl`). Do not change Production Auth settings. This document records the required configuration; it does not apply it or send a recovery email. The recovery link should be opened in the same browser that requested it so the SSR PKCE verifier cookie is available to the callback.
