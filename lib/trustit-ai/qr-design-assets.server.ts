import "server-only";

import { qrTemplateIds } from "../../app/merchant/dashboard/qr/templates";
import { QR_DESIGN_PROMPT_VERSION, resolveBusinessTheme } from "./qr-design-theme";
import { createAIImageProvider } from "./provider-config";
import { MockAssetStorageProvider } from "./mock-storage";
import { qrThemeGenerator } from "./theme-generator";
import type { QrDesignAssets, TrustitAI } from "./provider-contracts";

const mockStorage = new MockAssetStorageProvider();
const cachedAssets = new Map<string, Promise<QrDesignAssets>>();

function createTrustitAI(): TrustitAI {
  return { text: {}, image: createAIImageProvider(process.env.TRUSTIT_AI_IMAGE_PROVIDER) };
}

export async function getBusinessQrDesignAssets(businessId: string, businessType: string | null, revision = 0): Promise<QrDesignAssets> {
  if (!/^[a-zA-Z0-9_-]{1,120}$/.test(businessId)) throw new Error("Invalid business for QR design assets.");
  const safeRevision = Number.isInteger(revision) && revision >= 0 && revision < 5 ? revision : 0;
  const theme = resolveBusinessTheme(businessType);
  const cacheKey = `${businessId}:${theme.id}:${safeRevision}:${QR_DESIGN_PROMPT_VERSION}`;
  const existing = cachedAssets.get(cacheKey);
  if (existing) return existing;

  const generation = (async () => {
    const engine = createTrustitAI();
    const prompts = qrThemeGenerator.promptsFor(businessType);
    const entries = await Promise.all(prompts.map(async (prompt) => {
      const image = await engine.image.generateImage({ prompt, width: 1200, height: 620, revision: safeRevision });
      const asset = await mockStorage.save({
        image,
        businessType,
        businessId,
        themeId: theme.id,
        templateId: prompt.templateId,
        promptVersion: prompt.promptVersion,
        revision: safeRevision,
      });
      return [prompt.templateId, asset] as const;
    }));
    return Object.fromEntries(entries) as QrDesignAssets;
  })();

  cachedAssets.set(cacheKey, generation);
  if (cachedAssets.size > 64) cachedAssets.delete(cachedAssets.keys().next().value!);
  try {
    return await generation;
  } catch (error) {
    cachedAssets.delete(cacheKey);
    throw error;
  }
}

export { qrTemplateIds };
