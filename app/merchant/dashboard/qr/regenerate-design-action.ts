"use server";

import { getActiveMerchant } from "@/lib/merchant-auth";
import { getBusinessQrDesignAssets } from "@/lib/trustit-ai/qr-design-assets.server";

export async function regenerateQrDesignAction(currentRevision: number) {
  const merchant = await getActiveMerchant();
  if (!merchant) return { ok: false as const, error: "Sign in to an active merchant account to regenerate designs." };
  if (!Number.isInteger(currentRevision) || currentRevision < 0 || currentRevision > 4) {
    return { ok: false as const, error: "The requested design version is invalid." };
  }

  const nextRevision = (currentRevision + 1) % 5;
  try {
    const assets = await getBusinessQrDesignAssets(merchant.businessId, merchant.businessType, nextRevision);
    const provider = process.env.TRUSTIT_AI_IMAGE_PROVIDER === "openai" ? "AI" : "mock";
    return { ok: true as const, revision: nextRevision, assets, provider };
  } catch (error) {
    console.error("Trustit QR design regeneration failed", error);
    return {
      ok: false as const,
      error: process.env.TRUSTIT_AI_IMAGE_PROVIDER === "openai"
        ? "AI design generation is temporarily unavailable. Please try again."
        : "We could not prepare the mock designs. Please try again.",
    };
  }
}
