# Cashfree Preview webhook ingress

## Decision and scope

Cashfree's webhook signature authenticates the raw request body and timestamp, but Cashfree does not document a facility for attaching Vercel Trusted Sources OIDC headers to webhook deliveries. Putting Vercel's automation-bypass secret in the callback URL would expose a project-wide Deployment Protection credential to Cashfree and its request/logging chain. Vercel domain exceptions would make an entire deployment domain public, rather than just the callback route. The Vercel native mechanisms are therefore not used for Cashfree delivery.

The selected design is an isolated, public Supabase Edge Function deployed only to the Preview project `piqwsyzktzjhafkcstjl`. It does not relay requests to Vercel and does not use a Vercel bypass secret. Cashfree's signature is checked over the untouched body and timestamp; then the function checks the order and payment attempts directly against the fixed Cashfree Sandbox API, verifies a Trustit HMAC-signed order context, checks order ID, amount, INR currency, success status, business and onboarding context, and calls only the existing idempotent payment RPCs in the Preview Supabase database. Database uniqueness/idempotency protects repeated deliveries. All credentialed outbound requests use `redirect: "manual"` and fixed provider/project origins.

The function is configured with `verify_jwt = false` because Cashfree cannot provide a Supabase JWT. This makes the handler reachable without a Supabase JWT; it is safe only because the handler independently enforces Cashfree's cryptographic signature and authoritative Sandbox order/payment verification before database activation. It must not be deployed without those checks. There is no relay-to-Preview secret because the function itself is the Cashfree ingress and commits to the exact Preview database.

## Closed-by-default Vercel order flow

The Next.js Preview app selects the fixed Preview Edge Function URL only when all of these hold: Vercel environment is `preview`, Git branch is exactly `codex/cashfree-sandbox-preview`, `CASHFREE_ENVIRONMENT` is `sandbox`, `CASHFREE_PREVIEW_WEBHOOK_INGRESS_ENABLED` is exactly `true`, and `NEXT_PUBLIC_SUPABASE_URL` is the exact Preview project URL. Until the function is deployed and configured, leave the enable flag unset/false; order creation cannot silently fall back to the protected Vercel callback or Production.

Browser return URLs are resolved separately from the webhook ingress and remain on the Preview branch deployment host. This preserves the authenticated Vercel Preview app while allowing Cashfree to reach only the purpose-built Preview callback.

## Required Preview-only infrastructure setup (not performed here)

1. Deploy `supabase/functions/trustit-cashfree-preview-webhook` and `supabase/config.toml` to the **Preview** Supabase project `piqwsyzktzjhafkcstjl`; do not deploy this function to the Production project.
2. In that Preview project's Edge Function secrets, configure `CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET` with the matching Cashfree **Test App** pair. The Edge Runtime's Supabase URL and server-side admin key must resolve to the same Preview project. Never copy Production credentials or keys.
3. Verify function deployment and its safe negative cases (unsigned/malformed request, wrong amount/currency, and sandbox API verification failure) without creating a payment.
4. Only after that verification, set the non-secret Vercel Preview variable `CASHFREE_PREVIEW_WEBHOOK_INGRESS_ENABLED=true` for the exact branch. Keep Production variables and `CASHFREE_LIVE_PAYMENTS_ENABLED` unchanged/false.
5. The app sends this fixed URL as each Sandbox order's `order_meta.notify_url`; Cashfree's Create Order API documents `notify_url` in `order_meta`. No separate account-wide webhook registration is required for this per-order callback path. Do not change the Production webhook configuration.

Steps 1–5 require authorized Supabase, Vercel, and Cashfree dashboard access; they have not been performed by this code change. No order/payment is enabled while step 4 is absent. A genuine Sandbox payment test remains a separate, explicit step after the infrastructure is verified and user-approved.

## Verification boundaries

Automated tests exercise signature rejection, malformed payloads, amount/currency mismatches, failed/pending events, retry/replay idempotency and redirect refusal. They do not prove the Preview function is deployed, its secrets are configured, Cashfree can reach it, or a real Sandbox webhook is delivered. Production Supabase, Vercel Production settings, Production Cashfree credentials, and migration history are outside this change.

## Official behavior references

- [Vercel deployment-protection methods](https://vercel.com/docs/deployment-protection/methods-to-bypass-deployment-protection) explain that automation bypass applies to protected deployments and exceptions expose domains.
- [Vercel Trusted Sources](https://vercel.com/changelog/trusted-sources-for-deployment-protection) requires a caller-supplied OIDC header; Cashfree does not document a webhook custom-header setting.
- [Cashfree Create Order](https://www.cashfree.com/docs/api-reference/payments/latest/orders/create-order) documents the Sandbox endpoint, `order_meta.notify_url`, and current API version.
- [Cashfree webhook verification](https://www.cashfree.com/devstudio/preview/pg/tools/webhookVerification) verifies the raw body with the webhook timestamp and signature.
- [Supabase function configuration](https://supabase.com/docs/guides/functions/function-configuration) documents `verify_jwt = false` for external webhook handlers; the function must supply its own request authentication.
