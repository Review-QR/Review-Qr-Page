import assert from "node:assert/strict";
import test from "node:test";
import { BUSINESS_TYPES } from "../business-types.ts";
import { qrTemplateIds } from "../../app/merchant/dashboard/qr/templates.ts";
import { businessThemes, getThemeVisualPrompts, QR_DESIGN_PROMPT_VERSION, resolveBusinessTheme } from "./qr-design-theme.ts";
import { MockAIImageProvider } from "./mock-image-provider.ts";
import { MockAssetStorageProvider } from "./mock-storage.ts";
import { createAIImageProvider, resolveAIImageProviderMode } from "./provider-config.ts";
import { createScopedQrDesignPath, isScopedQrDesignPath, createPrivateQrDesignAssetPath, isPrivateQrDesignAssetPath } from "./supabase-storage-path.ts";

const gallerySource = await (await import("node:fs/promises")).readFile(new URL("../../app/merchant/dashboard/qr/qr-template-gallery.tsx", import.meta.url), "utf8");
const regenerationActionSource = await (await import("node:fs/promises")).readFile(new URL("../../app/merchant/dashboard/qr/regenerate-design-action.ts", import.meta.url), "utf8");
const registrationActionSource = await (await import("node:fs/promises")).readFile(new URL("../../app/register/actions.ts", import.meta.url), "utf8");
const qrPageSource = await (await import("node:fs/promises")).readFile(new URL("../../app/merchant/dashboard/qr/page.tsx", import.meta.url), "utf8");
const assetsServerSource = await (await import("node:fs/promises")).readFile(new URL("./qr-design-assets.server.ts", import.meta.url), "utf8");
const supabaseStorageSource = await (await import("node:fs/promises")).readFile(new URL("./supabase-storage.server.ts", import.meta.url), "utf8");
const providerConfigSource = await (await import("node:fs/promises")).readFile(new URL("./provider-config.ts", import.meta.url), "utf8");
const privateStorageSource = await (await import("node:fs/promises")).readFile(new URL("./supabase-storage.ts", import.meta.url), "utf8");
const openAIProviderSource = await (await import("node:fs/promises")).readFile(new URL("./openai-image-provider.ts", import.meta.url), "utf8");
const openAIRequestSource = await (await import("node:fs/promises")).readFile(new URL("./openai-image-request.ts", import.meta.url), "utf8");

test("theme resolver supports every existing business type and preserves canonical QR templates", () => {
  assert.equal(businessThemes.length, 21);
  for (const businessType of BUSINESS_TYPES) {
    const resolved = resolveBusinessTheme(businessType);
    assert.ok(businessThemes.some((theme) => theme.id === resolved.id), businessType);
    assert.ok(resolved.id, `Every catalog value must resolve: ${businessType}`);
  }
  assert.deepEqual(BUSINESS_TYPES.filter((businessType) => resolveBusinessTheme(businessType).id === "universal"), ["Other"]);
  for (const [businessType, themeId] of [["Sweet Shop", "bakery-sweets"], ["Fast Food", "fast-food"], ["Restaurant", "restaurant"], ["Hotel", "hospitality"], ["Salon", "beauty"], ["Retail", "retail"], ["Medical", "healthcare"], ["Library", "library"]]) {
    assert.equal(resolveBusinessTheme(businessType).id, themeId);
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
    assert.equal(new Set(prompts.map((prompt) => `${prompt.themeId}:${prompt.templateId}:${prompt.promptVersion}`)).size, 5);
    assert.ok(prompts.every((prompt) => /do not draw a QR code/i.test(prompt.prompt) && /no logos/i.test(prompt.prompt)));
  }
});

test("mock generation is deterministic, local, distinct, and safe for the QR area", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("Unexpected network request"); };
  try {
    const provider = new MockAIImageProvider();
    for (const theme of businessThemes) {
      const prompts = getThemeVisualPrompts(theme.id);
      const firstRun = await Promise.all(prompts.map((prompt) => provider.generateImage({ prompt, width: 1200, height: 620, revision: 2 })));
      const secondRun = await Promise.all(prompts.map((prompt) => provider.generateImage({ prompt, width: 1200, height: 620, revision: 2 })));
      assert.deepEqual(firstRun, secondRun, theme.id);
      const svgs = firstRun.map((image) => new TextDecoder().decode(image.bytes));
      assert.equal(new Set(svgs).size, 5, `${theme.id} outputs must be visually distinct`);
      assert.ok(firstRun.every((image) => image.mimeType === "image/svg+xml"));
      assert.ok(svgs.every((svg) => svg.includes(`data-theme="${theme.id}" data-motif="${theme.motif}"`)));
      assert.ok(svgs.every((svg) => /<svg[^>]+viewBox="0 0 1200 620"/.test(svg)));
      assert.ok(svgs.every((svg) => !/<script\b|<foreignObject\b|\bon[a-z]+\s*=|(?:href|xlink:href)\s*=|url\(\s*https?:/i.test(svg)), `${theme.id} SVG must contain only controlled local vector content`);
      assert.ok(svgs.every((svg) => !/https?:\/\//i.test(svg.replace(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/, ""))));
      assert.ok(svgs.every((svg) => !/<text\b/i.test(svg)), `${theme.id} artwork should not embed text`);
    }
    const prompt = getThemeVisualPrompts("Library")[0];
    const nextRevision = await provider.generateImage({ prompt, width: 1200, height: 620, revision: 3 });
    const currentRevision = await provider.generateImage({ prompt, width: 1200, height: 620, revision: 2 });
    assert.notDeepEqual(currentRevision.bytes, nextRevision.bytes);
    await assert.rejects(provider.generateImage({ prompt, width: 1200, height: 620, revision: 5 }), /revision/);
    await assert.rejects(provider.generateImage({ prompt, width: 0, height: 620, revision: 0 }), /dimensions/);
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

test("provider configuration defaults to mock and selects an injected server-side OpenAI provider", async () => {
  assert.equal(resolveAIImageProviderMode(undefined), "mock");
  const existingOpenAIKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const mockProvider = createAIImageProvider(undefined);
    assert.equal(mockProvider.provider, "mock");
    assert.equal((await mockProvider.generateImage({ prompt: getThemeVisualPrompts("Library")[0], width: 1200, height: 620, revision: 0 })).mimeType, "image/svg+xml");
  } finally {
    if (existingOpenAIKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = existingOpenAIKey;
  }
  assert.equal(resolveAIImageProviderMode("openai"), "openai");
  const openAIProvider = { provider: "openai", generateImage: async () => ({ bytes: new Uint8Array([1]), mimeType: "image/png", width: 1536, height: 1024 }) };
  assert.equal(createAIImageProvider("openai", openAIProvider), openAIProvider);
  assert.throws(() => createAIImageProvider("openai"), /server runtime/);
  assert.throws(() => resolveAIImageProviderMode("unexpected"), /either mock or openai/);
  assert.doesNotMatch(providerConfigSource, /OPENAI_API_KEY|https?:\/\//);
  assert.doesNotMatch(providerConfigSource, /fetch\s*\(/);
  assert.match(openAIProviderSource, /^import "server-only"/);
  assert.match(openAIProviderSource, /process\.env\.OPENAI_API_KEY/);
  assert.match(openAIRequestSource, /https:\/\/api\.openai\.com\/v1\/images\/generations/);
  assert.match(openAIRequestSource, /b64_json/);
  assert.match(openAIRequestSource, /size: "1536x1024"/);
  assert.match(openAIRequestSource, /output_format: "png"/);
  assert.match(openAIRequestSource, /OPENAI_API_KEY is required/);
  assert.doesNotMatch(openAIProviderSource, /NEXT_PUBLIC_OPENAI_API_KEY/);
  assert.doesNotMatch(gallerySource + regenerationActionSource, /OPENAI_API_KEY/);
});

test("renderer keeps background art optional and separate from the real QR image", () => {
  assert.match(gallerySource, /designAsset\?\.url\s*\?\s*<img[^>]+data-qr-design-background="true"/);
  assert.match(gallerySource, /data-qr-design-background="true" className="absolute inset-0 h-full w-full object-cover"/);
  assert.match(gallerySource, /:\s*<CategoryIcon kind=\{kind\}/);
  assert.match(gallerySource, /img\[alt\^="Trustit review QR for "\]/);
  assert.match(gallerySource, /data-qr-design-background/);
  assert.match(gallerySource, /designAsset: designAssets\?\.\[templateId\]/);
  assert.match(gallerySource, /const qrImage = poster\?\.querySelector<HTMLImageElement>\('img\[alt\^="Trustit review QR for "\]'\)/);
  assert.match(gallerySource, /relative z-30 isolate inline-flex[^`]*bg-white/);
  assert.match(gallerySource, /const reviewRoute = buildTrustitReviewUrl\(origin, businessId\)/);
  assert.match(gallerySource, /const qrUrl = buildTrustitQrImageUrl\(reviewRoute\)/);
  assert.equal((gallerySource.match(/<ReviewQr url=\{qrUrl\}/g) ?? []).length, 5, "all five poster templates render the same QR component");
  assert.equal((gallerySource.match(/<CategoryArt kind=\{category\.artKind\} designAsset=\{designAsset\}/g) ?? []).length, 5, "all five poster templates accept only their assigned decorative asset");
});

test("regeneration is authenticated and registration does not call the image provider", () => {
  assert.match(regenerationActionSource, /getActiveMerchant\(\)/);
  assert.match(regenerationActionSource, /merchant\.businessId, merchant\.businessType/);
  assert.doesNotMatch(regenerationActionSource, /businessId\s*:/);
  assert.match(regenerationActionSource, /latestRevision \+ 1/);
  assert.match(regenerationActionSource, /latestRevision >= 4/);
  assert.match(regenerationActionSource, /getLatestBusinessQrDesignRevision\(merchant\.businessId, merchant\.businessType\)/);
  assert.match(regenerationActionSource, /error instanceof Error \? error\.name : "UnknownError"/);
  assert.doesNotMatch(regenerationActionSource, /storagePath\s*[:,=]/);
  assert.match(qrPageSource, /getLatestBusinessQrDesignRevision\(merchant\.businessId, merchant\.businessType\)/);
  assert.match(qrPageSource, /catch \(error\)/);
  assert.match(qrPageSource, /Your QR code and standard poster designs are still ready/);
  assert.match(qrPageSource, /error instanceof Error \? error\.name : "UnknownError"/);
  assert.match(gallerySource, /initialDesignRevision = 0/);
  assert.match(gallerySource, /disabled=\{isPending \|\| designRevision >= 4\}/);
  assert.doesNotMatch(registrationActionSource, /getBusinessQrDesignAssets|generateImage|regenerateQrDesignAction/);
  assert.doesNotMatch(registrationActionSource, /TRUSTIT_AI_IMAGE_PROVIDER|OPENAI_API_KEY/);
});

test("future Supabase storage is server-only and strictly tenant/path scoped", () => {
  const input = { businessId: "biz_123", themeId: "bakery-sweets", templateId: "template_1", promptVersion: "qr-design-v1", revision: 2 };
  const path = createScopedQrDesignPath(input);
  assert.equal(path, "businesses/biz_123/qr-designs/bakery-sweets/template_1/qr-design-v1-r2.svg");
  assert.equal(isScopedQrDesignPath(path, "biz_123"), true);
  assert.equal(isScopedQrDesignPath(path, "other-business"), false);
  for (const unsafePath of ["businesses/biz_123/../../other.svg", "businesses/biz_123/qr-designs/not-a-theme/template_1/qr-design-v1-r2.svg", "businesses/biz_123/qr-designs/bakery-sweets/template_6/qr-design-v1-r2.svg", path.replace("biz_123", "biz_123%2fother")]) {
    assert.equal(isScopedQrDesignPath(unsafePath, "biz_123"), false);
  }
  assert.throws(() => createScopedQrDesignPath({ ...input, businessId: "biz_123/other" }), /business scope/);
  assert.throws(() => createScopedQrDesignPath({ ...input, promptVersion: "../../evil" }), /prompt version/);
  assert.match(supabaseStorageSource, /^import "server-only"/);
  assert.match(supabaseStorageSource, /input\.businessId !== this\.businessId/);
  assert.match(supabaseStorageSource, /isScopedQrDesignPath\(storagePath, this\.businessId\)/);
  assert.doesNotMatch(assetsServerSource, /SupabaseStorageAssetProvider/);
  assert.match(assetsServerSource, /new MockAssetStorageProvider/);
});

test("private PNG storage paths reject malformed IDs, unsafe segments, and cross-business reuse", () => {
  const input = { businessId: "biz_123", themeId: "bakery-sweets", templateId: "template_1", promptVersion: "qr-design-v1", revision: 2 };
  const path = createPrivateQrDesignAssetPath(input);
  assert.equal(path, "businesses/biz_123/bakery-sweets/template_1/qr-design-v1-r2.png");
  assert.equal(isPrivateQrDesignAssetPath(path, "biz_123"), true);
  assert.equal(isPrivateQrDesignAssetPath(path, "other-business"), false);
  for (const businessId of ["", "..", "biz/other", "biz%2fother", "x".repeat(121)]) {
    assert.throws(() => createPrivateQrDesignAssetPath({ ...input, businessId }), /business scope/);
  }
  assert.throws(() => createPrivateQrDesignAssetPath({ ...input, promptVersion: "../../other" }), /prompt version/);
  assert.throws(() => createPrivateQrDesignAssetPath({ ...input, revision: 5 }), /revision/);
  assert.equal(isPrivateQrDesignAssetPath(path.replace(".png", ".svg"), "biz_123"), false);
});

test("persisted OpenAI assets are read only for the current business and a complete matching revision", () => {
  assert.match(assetsServerSource, /\.eq\("business_id", businessId\)/);
  assert.match(assetsServerSource, /\.eq\("theme_id", themeId\)/);
  assert.match(assetsServerSource, /\.eq\("revision", revision\)/);
  assert.match(assetsServerSource, /\.eq\("provider", provider\)/);
  assert.match(assetsServerSource, /\.eq\("prompt_version", QR_DESIGN_PROMPT_VERSION\)/);
  assert.match(assetsServerSource, /isPrivateQrDesignAssetPath\(row\.storage_path, businessId\)/);
  assert.match(assetsServerSource, /select\("business_type,theme_id,template_id,prompt_version,provider,status,storage_path,created_at"\)/);
  assert.match(assetsServerSource, /\^\[a-zA-Z0-9_-]\{1,120\}\$/);
  assert.match(assetsServerSource, /Number\.isInteger\(revision\) && revision >= 0 && revision < 5/);
  assert.match(assetsServerSource, /qrTemplateIds\.every\(\(templateId\) => persisted\[templateId\]\)/);
  assert.match(assetsServerSource, /cachedAssets\.set\(cacheKey, generation\)/);
  assert.match(assetsServerSource, /if \(mode === "openai"\) cachedAssets\.delete\(cacheKey\)/);
  assert.match(assetsServerSource, /export async function getLatestBusinessQrDesignRevision/);
  assert.match(assetsServerSource, /\.eq\("theme_id", theme\.id\)/);
  assert.match(assetsServerSource, /completeRevisions\.add\(revision\)/);
  assert.match(assetsServerSource, /row\.theme_id !== themeId/);
  assert.match(assetsServerSource, /getLatestBusinessQrDesignRevision\(businessId:/);
  assert.match(assetsServerSource, /business_id,theme_id,template_id,prompt_version,revision,provider/);
  assert.match(privateStorageSource, /createPrivateQrDesignAssetPath/);
  assert.match(privateStorageSource, /createSignedUrl\(storagePath, 3600\)/);
  assert.doesNotMatch(privateStorageSource, /getPublicUrl/);
});

test("artwork migration remains private, additive, and isolated from unrelated storage privileges", async () => {
  const migration = await (await import("node:fs/promises")).readFile(new URL("../../supabase/migrations/20261007180000_trustit_qr_design_assets.sql", import.meta.url), "utf8");
  assert.match(migration, /create table if not exists public\.trustit_qr_design_assets/i);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /revoke all on table public\.trustit_qr_design_assets from anon, authenticated/i);
  assert.match(migration, /unique \(business_id, theme_id, template_id, prompt_version, revision, provider\)/i);
  assert.match(migration, /values\s*\('trustit-qr-designs',\s*'trustit-qr-designs',\s*false\)/i);
  assert.doesNotMatch(migration, /\bdrop\b|create policy|alter default privileges|revoke all on all/i);
});
