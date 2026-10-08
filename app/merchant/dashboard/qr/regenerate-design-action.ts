"use server";

import { getActiveMerchant } from "@/lib/merchant-auth";
import { getBusinessQrDesignAssets, getLatestBusinessQrDesignRevision } from "@/lib/trustit-ai/qr-design-assets.server";
import { resolveAIImageProviderMode } from "@/lib/trustit-ai/provider-config";

export async function regenerateQrDesignAction(currentRevision: number) {
  const merchant = await getActiveMerchant();
  if (!merchant) return { ok: false as const, error: "Sign in to an active merchant account to regenerate designs." };
  if (!Number.isInteger(currentRevision) || currentRevision < 0 || currentRevision > 4) {
    return { ok: false as const, error: "The requested design version is invalid." };
  }

  try {
    const mode = resolveAIImageProviderMode(process.env.TRUSTIT_AI_IMAGE_PROVIDER);
    const latestRevision = mode === "openai"
      ? await getLatestBusinessQrDesignRevision(merchant.businessId, merchant.businessType)
      : currentRevision;
    if (latestRevision >= 4) {
      return { ok: false as const, error: "All five design versions have been used. Your existing QR artwork remains available." };
    }

    const nextRevision = latestRevision + 1;
    const assets = await getBusinessQrDesignAssets(merchant.businessId, merchant.businessType, nextRevision);
    const provider = mode === "openai" ? "AI" : "mock";
    return { ok: true as const, revision: nextRevision, assets, provider };
  } catch (error) {
    console.error("Trustit QR design regeneration failed", error instanceof Error ? error.name : "UnknownError");
    return {
      ok: false as const,
      error: process.env.TRUSTIT_AI_IMAGE_PROVIDER === "openai"
        ? "AI design generation is temporarily unavailable. Please try again."
        : "We could not prepare the mock designs. Please try again.",
    };
  }
}
