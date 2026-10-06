import assert from "node:assert/strict";
import test from "node:test";
import { BUSINESS_TYPES } from "../business-types.ts";
import { qrTemplateIds } from "../../app/merchant/dashboard/qr/templates.ts";
import { businessThemes, getThemeVisualPrompts, QR_DESIGN_PROMPT_VERSION, resolveBusinessTheme } from "./qr-design-theme.ts";
import { MockAIImageProvider } from "./mock-image-provider.ts";
import { MockAssetStorageProvider } from "./mock-storage.ts";
import { createAIImageProvider, resolveAIImageProviderMode } from "./provider-config.ts";

const gallerySource = await (await import("node:fs/promises")).readFile(new URL("../../app/merchant/dashboard/qr/qr-template-gallery.tsx", import.meta.url), "utf8");
const regenerationActionSource = await (await import("node:fs/promises")).readFile(new URL("../../app/merchant/dashboard/qr/regenerate-design-action.ts", import.meta.url), "utf8");
const registrationActionSource = await (await import("node:fs/promises")).readFile(new URL("../../app/register/actions.ts", import.meta.url), "utf8");

test("theme resolver supports every existing business type and preserves canonical QR templates", () => {
  assert.ok(BUSINESS_TYPES.length > 0);
  for (const businessType of BUSINESS_TYPES) {
    assert.ok(businessThemes.some((theme) => theme.id === resolveBusinessTheme(businessType).id), businessType);
  }
  assert.deepEqual(qrTemplateIds, ["template_1", "template_2", "template_3", "template_4", "template_5"]);
  assert.equal(resolveBusinessTheme("Book Store").id, "retail");
  assert.equal(resolveBusinessTheme("Salon").id, "beauty");
  assert.equal(resolveBusinessTheme("unknown legacy category").id, "universal");
});

test("each theme maps five differentiated, versioned prompts to the existing poster IDs", () => {
  for (const theme of businessThemes) {
    const prompts = getThemeVisualPrompts(theme.id);
    assert.equal(prompts.length, 5);
    assert.deepEqual(prompts.map((prompt) => prompt.templateId), qrTemplateIds);
    assert.equal(new Set(prompts.map((prompt) => prompt.templateId)).size, 5);
    assert.ok(prompts.every((prompt) => prompt.themeId === theme.id && prompt.promptVersion === QR_DESIGN_PROMPT_VERSION));
    assert.equal(new Set(prompts.map((prompt) => prompt.experience)).size, 5);
    assert.ok(prompts.every((prompt) => /do not draw a QR code/i.test(prompt.prompt) && /no logos/i.test(prompt.prompt)));
  }
});

test("mock generation is deterministic, local, distinct, and safe for the QR area", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Unexpected network request"); };
  try {
    const provider = new MockAIImageProvider();
    const prompts = getThemeVisualPrompts("Library");
    const firstRun = await Promise.all(prompts.map((prompt) => provider.generateImage({ prompt, width: 1200, height: 620, revision: 2 })));
    const secondRun = await Promise.all(prompts.map((prompt) => provider.generateImage({ prompt, width: 1200, height: 620, revision: 2 })));
    assert.deepEqual(firstRun, secondRun);
    assert.equal(new Set(firstRun.map((image) => new TextDecoder().decode(image.bytes))).size, 5);
    assert.ok(firstRun.every((image) => image.mimeType === "image/svg+xml"));
    assert.ok(firstRun.every((image) => /clipPath id="artwork"><rect width="820" height="620"/.test(new TextDecoder().decode(image.bytes))));
    const nextRevision = await provider.generateImage({ prompt: prompts[0], width: 1200, height: 620, revision: 3 });
    assert.notDeepEqual(firstRun[0].bytes, nextRevision.bytes);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("mock storage paths are business and revision scoped and deletable", async () => {
  const provider = new MockAssetStorageProvider();
  const image = await new MockAIImageProvider().generateImage({
    prompt: getThemeVisualPrompts("Restaurant")[0], width: 1200, height: 620, revision: 1,
  });
  const input = { image, businessType: "Restaurant", businessId: "business-123", themeId: "restaurant", templateId: "template_1", promptVersion: QR_DESIGN_PROMPT_VERSION, revision: 1 };
  const asset = await provider.save(input);
  assert.match(asset.storagePath, /^mock-assets\/business-123\/restaurant\/template_1\/qr-design-v1-r1\.svg$/);
  assert.match(asset.url, /^data:image\/svg\+xml/);
  assert.equal((await provider.get(asset.storagePath))?.url, asset.url);
  await provider.delete(asset.storagePath);
  assert.equal(await provider.get(asset.storagePath), null);
  assert.throws(() => provider.pathFor({ ...input, businessId: ".." }), /Invalid mock asset path segment/);
});

test("provider configuration defaults to mock and refuses uninstalled paid providers", () => {
  assert.equal(resolveAIImageProviderMode(undefined), "mock");
  assert.equal(createAIImageProvider(undefined).provider, "mock");
  assert.equal(resolveAIImageProviderMode("openai"), "openai");
  assert.throws(() => createAIImageProvider("openai"), /adapter is not installed/);
  assert.throws(() => resolveAIImageProviderMode("unexpected"), /either mock or openai/);
});

test("renderer keeps background art optional and separate from the real QR image", () => {
  assert.match(gallerySource, /designAsset\?\.url && <img[^>]+data-qr-design-background="true"/);
  assert.match(gallerySource, /img\[alt\^="Trustit review QR for "\]/);
  assert.match(gallerySource, /data-qr-design-background/);
});

test("regeneration is authenticated and registration does not call the image provider", () => {
  assert.match(regenerationActionSource, /getActiveMerchant\(\)/);
  assert.match(regenerationActionSource, /merchant\.businessId, merchant\.businessType/);
  assert.doesNotMatch(regenerationActionSource, /storagePath\s*[:,=]/);
  assert.doesNotMatch(registrationActionSource, /getBusinessQrDesignAssets|generateImage|regenerateQrDesignAction/);
});
