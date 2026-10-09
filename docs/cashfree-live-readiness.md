# Cashfree Sandbox and Live configuration

The application uses Cashfree's hosted Web Checkout v3 (`https://sdk.cashfree.com/js/v3/cashfree.js`) and server-side Payment Gateway REST calls. The REST API version remains `2026-01-01`. The browser receives only the checkout environment, order ID, and payment session; credentials remain server-side.

## Vercel environment variables

Configure these variables in Vercel **Project Settings → Environment Variables**. None may use a `NEXT_PUBLIC_` prefix.

| Variable | Preview (Sandbox) | Production (Live) |
| --- | --- | --- |
| `CASHFREE_CLIENT_ID` | Cashfree Sandbox App ID | Cashfree Live App ID issued by Cashfree after Live approval |
| `CASHFREE_CLIENT_SECRET` | Cashfree Sandbox Secret Key | Cashfree Live Secret Key issued by Cashfree after Live approval |
| `CASHFREE_ENVIRONMENT` | `sandbox` | `production` |
| `CASHFREE_API_BASE_URL` | `https://sandbox.cashfree.com/pg` | `https://api.cashfree.com/pg` |
| `CASHFREE_WEBHOOK_URL` | `https://<preview-host>/api/cashfree/webhook` | `https://trustitreview.com/api/cashfree/webhook` |
| `CASHFREE_LIVE_PAYMENTS_ENABLED` | `false` | `false` until account and credentials are confirmed; set `true` only after the checklist below |

Set Preview and Development scopes to Sandbox credentials only. Do not copy Sandbox credentials into the Production scope as Live credentials. Keep the Production live switch false or unset until Cashfree has approved the merchant account for Live processing and issued Live credentials. This switch blocks new Production orders; server-side status verification and webhook processing still use the selected environment's credentials.

The server rejects endpoints that do not exactly match the selected environment. Production is pinned to Cashfree's official `api.cashfree.com` host. The payment pages get the matching Checkout SDK `mode` from the server-created order response.

## Before enabling live payments

1. Complete Cashfree's merchant onboarding and obtain confirmation that Payment Gateway Live processing is enabled.
2. Create/use the distinct Live App ID and Secret Key in the Cashfree merchant dashboard. Never reuse Sandbox keys.
3. Set the Production-only Vercel variables above, confirm the production webhook URL is registered for payment success/failure events in Cashfree, then redeploy the Production environment.
4. Confirm Vercel has the intended variables by checking names and deployment scope only; do not paste values into tickets, logs, source control, or browser-visible variables.
5. Set `CASHFREE_LIVE_PAYMENTS_ENABLED=true` only after those checks. No real-money test should be run without explicit authorization.

Subscriptions retain the application's current one-time 30-day payment rules. This integration does not enable Cashfree AutoPay or recurring debits.

## Verification and activation

The return from hosted checkout is not proof of payment. The server fetches the Cashfree order and payment status, validates the signed order context and expected server-side INR amount/plan, and only then invokes the existing service-role Supabase activation RPC. Webhooks are checked against the raw body and Cashfree timestamp/signature HMAC before an independent server-side Cashfree status lookup. Database RPCs protect duplicate applications. Failed, dropped, pending, mismatched, unsigned, and unverified payments do not activate or renew a plan.

The implementation requires no new database migration. Do not run or apply migrations as part of payment provider setup.
