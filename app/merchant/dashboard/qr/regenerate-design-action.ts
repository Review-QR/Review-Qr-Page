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

  const mode = resolveAIImageProviderMode(process.env.TRUSTIT_AI_IMAGE_PROVIDER);
  let latestRevision = currentRevision;
  if (mode === "openai") {
    try {
      latestRevision = await getLatestBusinessQrDesignRevision(merchant.businessId, merchant.businessType);
    } catch (error) {
      console.error("Trustit QR design revision lookup failed", error instanceof Error ? error.name : "UnknownError");
    }
  }
  if (latestRevision >= 4) {
    return { ok: false as const, error: "All five design versions have been used. Your existing QR artwork remains available." };
  }

  const nextRevision = latestRevision + 1;
  try {
    const assets = await getBusinessQrDesignAssets(merchant.businessId, merchant.businessType, nextRevision);
    const provider = mode === "openai" ? "AI" : "mock";
    return { ok: true as const, revision: nextRevision, assets, provider };
  } catch (error) {
    console.error("Trustit QR design regeneration failed", error instanceof Error ? error.name : "UnknownError");
    if (mode === "openai") {
      return { ok: true as const, revision: nextRevision, assets: {}, provider: "procedural" as const, fallback: true as const };
    }
    return { ok: false as const, error: "We could not prepare the mock designs. Please try again." };
  }
}
