# Trustit AI image design foundation

This foundation prepares the QR poster renderer for business-matched artwork while keeping the current experience entirely local and deterministic. **The current provider is mock only. Mock mode performs no paid external AI calls.** It needs no API key, does not send image requests outside the server, and never activates real image generation.

## Current flow

1. The server resolves the merchant's existing business type to a visual theme. Unknown and historical values resolve to the universal theme without changing the saved value.
2. Five versioned visual prompts map in order to the existing `template_1` through `template_5` poster identities.
3. The mock provider creates category-specific, source-controlled SVG illustrations with five composition variations. Its in-memory storage adapter returns local data URLs and business-scoped mock paths. The SVG includes no model-produced text, arbitrary user values, scripts, external references, or remote URLs.
4. The existing QR renderer places the artwork in its decorative art layer. The QR image, destination, selection, print dimensions, PNG/PDF export, and print behavior remain separate and unchanged.
5. Authenticated merchants can regenerate the five mock variations. This does not change the selected template or persist anything to the database. Registration does not invoke this flow.

## Extension points

The provider contracts separate text, image, theme generation, and asset storage. A real image provider is intentionally not installed: explicitly selecting `openai` fails closed until an adapter exists. Future work should add server-only credentials and explicit spending controls before installing any paid provider. Never expose provider keys through `NEXT_PUBLIC_*` variables.

`SupabaseStorageAssetProvider` is a server-only adapter that requires an injected server client, the authenticated merchant's business ID as its tenant scope, and an already configured private bucket. Its generated paths are validated against that business, a known theme, one of the five template IDs, a version slug, and a bounded revision; reads and deletes reject paths outside that scope. The adapter does not create a bucket, change policies, or run a database migration, and it is not connected while mock mode is active. Before using it, configure the bucket as private with matching Storage policies, create persistent metadata separately from the image bytes, choose signed URL expiry/refresh behavior, and authorize each server adapter construction from `requireActiveMerchant()` or a trusted generation job.

Current data URLs and in-memory caching are suitable only for mock previews, not durable production asset storage. The dashboard prepares/reuses mock variations on demand; registration never waits on an image provider. Future real generation should be asynchronous/on-demand, use server-side spending controls, store image bytes in private Supabase Storage, and write metadata to a separate persistence layer.

The prompt version is `qr-design-v1`. Increment it when changing prompt semantics or output requirements. The future OpenAI Image Provider can implement `AIImageProvider` and replace the mock in server-controlled configuration without changing theme mapping or QR business logic. It will need an explicit provider adapter, a server-only API key, provider enablement/spend limits, a private storage bucket and policies, separate metadata persistence, and asynchronous retry/status handling. Do not add the key to `NEXT_PUBLIC_*` variables. Keep all future image compositions free of QR patterns, text, marks, watermarks, and detail in the reserved scan-safe region. Continue to render and export the real QR independently at high contrast.
