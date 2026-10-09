"use server";

import { allowedPlanIds, appConfig, type PlanId } from "@/lib/config";
import {
  createCashfreeMerchantCheckoutOrder,
  verifyCashfreeMerchantOrderBySignedContext,
  verifyCashfreeMerchantCheckoutOrder,
} from "@/lib/cashfree";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type CheckoutOrderActionResult =
  | {
      success: true;
      orderId: string;
      paymentSessionId: string;
      verificationToken: string;
      checkoutMode: "sandbox" | "production";
    }
  | { success: false; message: string };

export type CheckoutVerificationActionResult =
  | { status: "VERIFIED_SUCCESS"; applied: boolean }
  | { status: "NOT_SUCCESS"; httpStatus: number }
  | { status: "VERIFICATION_ERROR"; httpStatus: number | null };

function isPlanId(value: unknown): value is PlanId {
  return value === "basic" || value === "standard" || value === "premium";
}

export async function createMerchantCheckoutOrder(
  submittedPlanId: unknown,
): Promise<CheckoutOrderActionResult> {
  if (!isPlanId(submittedPlanId)) {
    return { success: false, message: "Select an available plan to continue." };
  }

  const merchant = await requireActiveMerchant();
  const allowedPlans = allowedPlanIds(merchant.plan);
  if (!allowedPlans.includes(submittedPlanId)) {
    return {
      success: false,
      message: "That plan is not available for your current subscription.",
    };
  }

  try {
    const order = await createCashfreeMerchantCheckoutOrder({
      planId: submittedPlanId,
      businessId: merchant.businessId,
    });

    if (!order.success || !order.verificationToken) {
      return {
        success: false,
        message: "Payment service is temporarily unavailable. Please try again.",
      };
    }

    return {
      success: true,
      orderId: order.orderId,
      paymentSessionId: order.paymentSessionId,
      verificationToken: order.verificationToken,
      checkoutMode: order.environment,
    };
  } catch {
    return {
      success: false,
      message: "Payment service is temporarily unavailable. Please try again.",
    };
  }
}

export async function verifyMerchantCheckoutOrder(
  submittedOrderId: unknown,
  submittedVerificationToken: unknown,
): Promise<CheckoutVerificationActionResult> {
  const merchant = await requireActiveMerchant();
  if (
    typeof submittedOrderId !== "string" ||
    typeof submittedVerificationToken !== "string"
  ) {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }

  try {
    const verification = submittedVerificationToken.length > 0
      ? await verifyCashfreeMerchantCheckoutOrder({
          orderId: submittedOrderId,
          verificationToken: submittedVerificationToken,
          authenticatedBusinessId: merchant.businessId,
        })
      : await verifyCashfreeMerchantOrderBySignedContext({
          orderId: submittedOrderId,
          authenticatedBusinessId: merchant.businessId,
        });

    if (verification.status !== "VERIFIED_SUCCESS") return verification;

    const admin = createSupabaseAdminClient();
    const { data, error } = await admin.rpc("apply_verified_cashfree_payment", {
      p_business_id: merchant.businessId,
      p_cashfree_order_id: submittedOrderId,
      p_plan: appConfig.plans[verification.planId].name,
      p_amount: verification.amount,
      p_currency: verification.currency,
      p_paid_at: verification.paidAt,
    });
    if (error || !Array.isArray(data) || !data[0]) {
      return { status: "VERIFICATION_ERROR", httpStatus: verification.httpStatus };
    }

    const applicationResult = (data[0] as { result?: unknown }).result;
    if (applicationResult === "applied") {
      return { status: "VERIFIED_SUCCESS", applied: true };
    }
    if (applicationResult === "already_applied") {
      return { status: "VERIFIED_SUCCESS", applied: false };
    }

    return { status: "VERIFICATION_ERROR", httpStatus: verification.httpStatus };
  } catch {
    return { status: "VERIFICATION_ERROR", httpStatus: null };
  }
}
