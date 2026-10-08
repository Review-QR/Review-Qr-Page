import "server-only";

import { qrTemplateIds } from "../../app/merchant/dashboard/qr/templates";
import { QR_DESIGN_PROMPT_VERSION, resolveBusinessTheme } from "./qr-design-theme";
import { createAIImageProvider, resolveAIImageProviderMode } from "./provider-config";
import { MockAssetStorageProvider } from "./mock-storage";
import { SupabaseQrDesignStorageProvider } from "./supabase-storage";
import { OpenAIImageProvider } from "./openai-image-provider";
import { qrThemeGenerator } from "./theme-generator";
import { isPrivateQrDesignAssetPath } from "./supabase-storage-path";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { AssetStorageProvider, QrDesignAsset, QrDesignAssets, TrustitAI } from "./provider-contracts";

const mockStorage = new MockAssetStorageProvider();
const cachedAssets = new Map<string, Promise<QrDesignAssets>>();

function createTrustitAI(mode: "mock" | "openai"): TrustitAI {
  const image = mode === "openai" ? new OpenAIImageProvider() : createAIImageProvider("mock");
  return { text: {}, image };
}

function storageFor(mode: "mock" | "openai"): AssetStorageProvider {
  return mode === "openai" ? new SupabaseQrDesignStorageProvider() : mockStorage;
}

async function loadPersistedAssets(
  businessId: string,
  revision: number,
  provider: "mock" | "openai",
  themeId: string,
  businessType: string | null,
  storage: AssetStorageProvider,
): Promise<QrDesignAssets> {
  if (provider === "mock") return {};

  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trustit_qr_design_assets")
    .select("business_type,theme_id,template_id,prompt_version,provider,status,storage_path,created_at")
    .eq("business_id", businessId)
    .eq("theme_id", themeId)
    .eq("revision", revision)
    .eq("provider", provider)
    .eq("status", "ready")
    .eq("prompt_version", QR_DESIGN_PROMPT_VERSION);

  if (error) throw new Error("Unable to load saved QR design assets.");

  const entries = await Promise.all((data ?? []).map(async (row) => {
    if (row.theme_id !== themeId || !isPrivateQrDesignAssetPath(row.storage_path, businessId)) return null;
    const signed = await storage.get(row.storage_path);
    if (!signed) return null;
    const templateId = row.template_id as (typeof qrTemplateIds)[number];
    if (!qrTemplateIds.includes(templateId)) return null;
    const asset: QrDesignAsset = {
      businessType: row.business_type ?? businessType,
      themeId: row.theme_id as QrDesignAsset["themeId"],
      templateId,
      promptVersion: row.prompt_version,
      provider,
      status: "ready",
      createdAt: row.created_at,
      storagePath: signed.storagePath,
      url: signed.url,
    };
    return [templateId, asset] as const;
  }));

  return Object.fromEntries(entries.filter((entry): entry is readonly [(typeof qrTemplateIds)[number], QrDesignAsset] => Boolean(entry))) as QrDesignAssets;
}

export async function getBusinessQrDesignAssets(businessId: string, businessType: string | null, revision = 0): Promise<QrDesignAssets> {
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(businessId)) throw new Error("Invalid business for QR design assets.");
  const safeRevision = Number.isInteger(revision) && revision >= 0 && revision < 5 ? revision : 0;
  const mode = resolveAIImageProviderMode(process.env.TRUSTIT_AI_IMAGE_PROVIDER);
  const theme = resolveBusinessTheme(businessType);
  const cacheKey = businessId + ":" + theme.id + ":" + safeRevision + ":" + QR_DESIGN_PROMPT_VERSION + ":" + mode;
  const existing = cachedAssets.get(cacheKey);
  if (existing) return existing;

  const generation = (async () => {
    const storage = storageFor(mode);
    if (mode === "openai") {
      const persisted = await loadPersistedAssets(businessId, safeRevision, "openai", theme.id, businessType, storage);
      if (qrTemplateIds.every((templateId) => persisted[templateId])) return persisted;
    }

    const engine = createTrustitAI(mode);
    const prompts = qrThemeGenerator.promptsFor(businessType);
    const entries = await Promise.all(prompts.map(async (prompt) => {
      const image = await engine.image.generateImage({ prompt, width: 1200, height: 620, revision: safeRevision });
      const asset = await storage.save({
        image,
        businessType,
        businessId,
        themeId: theme.id,
        templateId: prompt.templateId,
        promptVersion: prompt.promptVersion,
        revision: safeRevision,
      });

      if (mode === "openai") {
        const supabase = createSupabaseAdminClient();
        const { error } = await supabase.from("trustit_qr_design_assets").upsert({
          business_id: businessId,
          business_type: businessType,
          theme_id: theme.id,
          template_id: prompt.templateId,
          prompt_version: prompt.promptVersion,
          revision: safeRevision,
          provider: "openai",
          status: "ready",
          storage_path: asset.storagePath,
        }, { onConflict: "business_id,theme_id,template_id,prompt_version,revision,provider" });
        if (error) throw new Error("Unable to persist QR design metadata.");
      }

      return [prompt.templateId, asset] as const;
    }));
    return Object.fromEntries(entries) as QrDesignAssets;
  })();

  cachedAssets.set(cacheKey, generation);
  if (cachedAssets.size > 64) cachedAssets.delete(cachedAssets.keys().next().value!);
  try {
    const assets = await generation;
    // Signed URLs expire after one hour. Keep only in-flight OpenAI work cached;
    // persisted assets are re-signed on each later request.
    if (mode === "openai") cachedAssets.delete(cacheKey);
    return assets;
  } catch (error) {
    cachedAssets.delete(cacheKey);
    throw error;
  }
}

export async function getLatestBusinessQrDesignRevision(businessId: string, businessType: string | null): Promise<number> {
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(businessId)) throw new Error("Invalid business for QR design assets.");
  if (resolveAIImageProviderMode(process.env.TRUSTIT_AI_IMAGE_PROVIDER) === "mock") return 0;

  const theme = resolveBusinessTheme(businessType);
  const supabase = createSupabaseAdminClient();
  const { data, error } = await supabase
    .from("trustit_qr_design_assets")
    .select("revision,template_id,storage_path")
    .eq("business_id", businessId)
    .eq("theme_id", theme.id)
    .eq("prompt_version", QR_DESIGN_PROMPT_VERSION)
    .eq("provider", "openai")
    .eq("status", "ready");

  if (error) throw new Error("Unable to load saved QR design revision.");

  const completeRevisions = new Set<number>();
  for (const revision of [4, 3, 2, 1, 0]) {
    const assets = (data ?? []).filter((row) => row.revision === revision);
    const complete = qrTemplateIds.every((templateId) => assets.some((row) =>
      row.template_id === templateId
      && row.storage_path === `businesses/${businessId}/${theme.id}/${templateId}/${QR_DESIGN_PROMPT_VERSION}-r${revision}.png`
      && isPrivateQrDesignAssetPath(row.storage_path, businessId),
    ));
    if (complete) completeRevisions.add(revision);
  }

  return Math.max(0, ...completeRevisions);
}

export { qrTemplateIds };
