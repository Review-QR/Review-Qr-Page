import { createHash } from "node:crypto";
import {
  cashfreeApiBaseUrlMatchesEnvironment,
  cashfreeLivePaymentsEnabled,
} from "./cashfree-environment.ts";
import { isPinnedPreviewSupabaseUrl } from "./cashfree-webhook-url.ts";

export const PREVIEW_ORDER_ONLY_MERCHANT_ENV = "CASHFREE_PREVIEW_ORDER_ONLY_MERCHANT_ID";
export const PREVIEW_ORDER_ONLY_PLAN_ID = "basic" as const;
const EXPECTED_VERCEL_PROJECT_ID = "prj_mKkYk1wDcdwzQzWw2JUNBsAiuhRS";
const EXPECTED_BRANCH = "codex/cashfree-sandbox-preview";
const EXPECTED_BRANCH_HOST = "review-qr-page-git-codex-cashfree-sandbox-preview-review-qr.vercel.app";
const EXPECTED_SUPABASE_URL = "https://piqwsyzktzjhafkcstjl.supabase.co";
const ORDER_ID_NAMESPACE = "trustit-cashfree-preview-order-only:v1:";
const IDEMPOTENCY_NAMESPACE = "trustit-cashfree-preview-order-only-idempotency:v1:";

export type PreviewOrderOnlyEnvironment = Record<string, string | undefined>;

export type PreviewOrderOnlyResult =
  | { success: true; orderId: string }
  | { success: false; reason: "unavailable" | "unauthorized" | "rate_limited" };

export type PreviewOrderOnlyMerchant = {
  businessId: string;
  plan: string | null;
};

export type PreviewOrderOnlyOrderInput = {
  planId: typeof PREVIEW_ORDER_ONLY_PLAN_ID;
  businessId: string;
  orderId: string;
  idempotencyKey: string;
};

export function isPreviewOrderOnlyAuthorized(
  env: PreviewOrderOnlyEnvironment,
  businessId: string | undefined,
): boolean {
  return Boolean(
    businessId?.trim() &&
      env.VERCEL_PROJECT_ID === EXPECTED_VERCEL_PROJECT_ID &&
      env.VERCEL_ENV === "preview" &&
      env.VERCEL_GIT_COMMIT_REF === EXPECTED_BRANCH &&
      env.VERCEL_BRANCH_URL === EXPECTED_BRANCH_HOST &&
      isPinnedPreviewSupabaseUrl(env.NEXT_PUBLIC_SUPABASE_URL) &&
      env.NEXT_PUBLIC_SUPABASE_URL?.trim() === EXPECTED_SUPABASE_URL &&
      env.CASHFREE_ENVIRONMENT?.trim() === "sandbox" &&
      cashfreeApiBaseUrlMatchesEnvironment(env.CASHFREE_API_BASE_URL, "sandbox") &&
      Boolean(env.CASHFREE_CLIENT_ID?.trim() && env.CASHFREE_CLIENT_SECRET?.trim()) &&
      !cashfreeLivePaymentsEnabled(env) &&
      env[PREVIEW_ORDER_ONLY_MERCHANT_ENV]?.trim() === businessId.trim(),
  );
}

export function previewOrderOnlyOrderId(businessId: string): string {
  const digest = createHash("sha256").update(`${ORDER_ID_NAMESPACE}${businessId}`).digest("hex");
  return `rqr_${digest.slice(0, 32)}`;
}

export function previewOrderOnlyIdempotencyKey(orderId: string): string {
  const hex = createHash("sha256").update(`${IDEMPOTENCY_NAMESPACE}${orderId}`).digest("hex").slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
}

export function createPreviewOrderOnlyRateLimiter(windowMs = 60_000) {
  const lastAttemptByMerchant = new Map<string, number>();

  return (merchantId: string, now = Date.now()): boolean => {
    const previousAttempt = lastAttemptByMerchant.get(merchantId);
    if (previousAttempt !== undefined && now - previousAttempt < windowMs) return false;

    lastAttemptByMerchant.set(merchantId, now);
    if (lastAttemptByMerchant.size > 1_000) {
      for (const [key, attemptedAt] of lastAttemptByMerchant) {
        if (now - attemptedAt >= windowMs) lastAttemptByMerchant.delete(key);
      }
    }
    return true;
  };
}

export async function createPreviewSandboxOrderOnly(input: {
  env: PreviewOrderOnlyEnvironment;
  merchant: PreviewOrderOnlyMerchant | null;
  allowAttempt: (merchantId: string) => boolean;
  createOrder: (order: PreviewOrderOnlyOrderInput) => Promise<{ success: boolean; orderId?: string }>;
}): Promise<PreviewOrderOnlyResult> {
  if (!input.merchant) return { success: false, reason: "unauthorized" };
  const businessId = input.merchant.businessId;
  if (!isPreviewOrderOnlyAuthorized(input.env, businessId)) {
    return { success: false, reason: "unavailable" };
  }
  if (!input.allowAttempt(businessId)) return { success: false, reason: "rate_limited" };

  const orderId = previewOrderOnlyOrderId(businessId);
  try {
    const result = await input.createOrder({
      planId: PREVIEW_ORDER_ONLY_PLAN_ID,
      businessId,
      orderId,
      idempotencyKey: previewOrderOnlyIdempotencyKey(orderId),
    });
    if (!result.success || result.orderId !== orderId) {
      return { success: false, reason: "unavailable" };
    }
    return { success: true, orderId };
  } catch {
    return { success: false, reason: "unavailable" };
  }
}
