# Temporary Cashfree Preview diagnostic

This endpoint is temporary and is intended only for PR #46's `codex/cashfree-sandbox-preview` Preview deployment. It returns configuration/authentication status labels only. It does not create orders, read payment records, or activate subscriptions.

## Authorization and safety

- Keep Vercel Deployment Protection enabled and sign in to the protected Preview deployment.
- Sign in to Trustit as an active administrator in the same Preview origin. The route rejects requests without that admin session and rejects cross-origin requests.
- The route additionally requires `VERCEL_ENV=preview`, `VERCEL_GIT_COMMIT_REF=codex/cashfree-sandbox-preview`, a Preview deployment host, and a distinct configured production host. It refuses requests before authentication or any Cashfree request on Production or other branches.
- It makes one read-only `GET /orders/{order_id}` request to the hard-coded official Sandbox host, using a random order ID in the application's normal ID format. A 404 or 2xx indicates the credentials were accepted; 401/403 indicates authentication failure. Other provider/network outcomes are reported as blocked categories. Response bodies are discarded.
- Never add a diagnostic token or Cashfree value to the URL, source, request body, or logs.

## Invoke

On the protected Preview deployment, sign in as an active Trustit administrator. In that same origin's browser developer console, run:

```js
await fetch("/api/cashfree/preview-diagnostic", {
  method: "POST",
  credentials: "same-origin",
  headers: { "content-type": "application/json" },
  body: "{}",
}).then((response) => response.json())
```

Review only the returned status labels and optional sanitized `errorCategory`. Do not copy credentials, headers, cookies, or tokens into the console or report.

After the diagnostic result is obtained, remove `app/api/cashfree/preview-diagnostic/route.ts`, `lib/cashfree-preview-diagnostic.ts`, `lib/cashfree-preview-diagnostic.test.mjs`, and this document. Also remove the diagnostic test file from the `test:cashfree` script. Do not merge the diagnostic route into Production.
