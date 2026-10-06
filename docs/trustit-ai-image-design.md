# Trustit AI image design foundation

This foundation prepares the QR poster renderer for business-matched artwork while keeping the current experience entirely local and deterministic. `TRUSTIT_AI_IMAGE_PROVIDER` defaults to `mock`; mock mode builds SVG illustration data in-process and makes no paid external AI calls. No provider API key is read and no image request leaves the server.

## Current flow

1. The server resolves the merchant's existing business type to a visual theme. Unknown and historical values resolve to the universal theme without changing the saved value.
2. Five versioned visual prompts map in order to the existing `template_1` through `template_5` poster identities.
3. The mock provider creates local SVG variations. An in-memory storage adapter returns data URLs and business-scoped mock paths.
4. The existing QR renderer places the artwork in its decorative art layer. The QR image, destination, selection, print dimensions, PNG/PDF export, and print behavior remain separate and unchanged.
5. Authenticated merchants can regenerate the five mock variations. This does not change the selected template or persist anything to the database. Registration does not invoke this flow.

## Extension points

The provider contracts separate text, image, theme generation, and asset storage. A real image provider is intentionally not installed: explicitly selecting `openai` fails closed until an adapter exists. Future work should add server-only credentials and explicit spending controls before installing any paid provider. Never expose provider keys through `NEXT_PUBLIC_*` variables.

`SupabaseStorageAssetProvider` is a server-only adapter that requires an injected server client and an already configured private bucket; it does not create a bucket, change policies, or run a database migration. Before using it, add persistent metadata and ownership authorization, choose signed URL expiry/refresh behavior, and test private-bucket access. Current data URLs and in-memory caching are suitable only for this local mock foundation, not durable production asset storage.

The prompt version is `qr-design-v1`. Increment it when changing prompt semantics or output requirements. Keep all future image compositions free of QR patterns, text, marks, watermarks, and detail in the reserved scan-safe region. Continue to render and export the real QR independently at high contrast.
