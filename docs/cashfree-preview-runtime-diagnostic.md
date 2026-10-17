# Temporary Cashfree Preview Runtime Check

This temporary, read-only diagnostic is available at:

`POST /api/admin/cashfree-preview-runtime-check`

It runs only when Vercel's trusted `VERCEL_PROJECT_ID`, `VERCEL_ENV`, branch, and branch URL match the Review-QR Preview deployment, and the configured Supabase URL is pinned to Preview project `piqwsyzktzjhafkcstjl`. A wrong or missing target returns an empty response before the Supabase session client is created.

Every successful response requires the existing Supabase session and active-admin authorization. Call it from the signed-in Preview Admin session using a same-origin browser request:

```js
fetch("/api/admin/cashfree-preview-runtime-check", {
  method: "POST",
  credentials: "same-origin",
}).then((response) => response.json())
```

The JSON contains only fixed check names with `PASS`, `FAIL`, or `NOT VERIFIED` statuses. Credential presence does not prove that the Client ID and Secret belong to the same Cashfree Test App; that check always returns `NOT VERIFIED`. The endpoint makes no Cashfree requests and cannot create an order or payment. Do not use this endpoint as a substitute for a real Sandbox checkout test.

The route uses `private, no-store`, rejects non-same-origin requests, and returns no findings to unauthorized callers. It uses the session-scoped Supabase server client, not a service-role client.

## Removal after verification

After the one-time Preview check, remove the diagnostic route, this document, and its endpoint-specific test. Keep the shared Cashfree configuration predicates and their existing regression coverage. Push the removal through the normal Preview workflow, wait for the replacement Preview deployment, then confirm this path returns `404` before considering the diagnostic retired.
