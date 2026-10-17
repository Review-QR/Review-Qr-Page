"use server";

import { createCashfreeMerchantCheckoutOrder } from "@/lib/cashfree";
import {
  createPreviewOrderOnlyRateLimiter,
  createPreviewSandboxOrderOnly,
  type PreviewOrderOnlyResult,
} from "@/lib/cashfree-preview-order-only";
import { getActiveMerchant } from "@/lib/merchant-auth";

const allowPreviewSandboxOrderAttempt = createPreviewOrderOnlyRateLimiter();

export async function createPreviewSandboxOrder(): Promise<PreviewOrderOnlyResult> {
  const merchant = await getActiveMerchant();
  return createPreviewSandboxOrderOnly({
    env: process.env,
    merchant: merchant ? { businessId: merchant.businessId, plan: merchant.plan } : null,
    allowAttempt: allowPreviewSandboxOrderAttempt,
    createOrder: async (order) => {
      const result = await createCashfreeMerchantCheckoutOrder({
        planId: order.planId,
        businessId: order.businessId,
        orderId: order.orderId,
        idempotencyKey: order.idempotencyKey,
      });
      if (!result.success) return { success: false };
      return { success: true, orderId: result.orderId };
    },
  });
}
