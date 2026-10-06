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
    return { ok: true as const, revision: nextRevision, assets };
  } catch {
    return { ok: false as const, error: "We could not prepare the mock designs. Please try again." };
  }
}
