"use server";

import { requireActiveMerchant } from "@/lib/merchant-auth";
import {
  createPhysicalProductOrder,
  getMerchantProductOrders,
} from "@/lib/product-orders/product-order-service";
import { verifyCashfreeProductPayment } from "@/lib/product-orders/cashfree-product-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ShippingAddress } from "@/lib/product-orders/types";

export interface CreateOrderPayload {
  items: Array<{
    productId: string;
    variantId: string;
    quantity: number;
    personalization: {
      business_name: string;
      category?: string;
      tagline?: string;
      logo_url?: string;
      qr_target_url: string;
      qr_code_identifier?: string;
      template_id?: string;
      approved_preview_svg?: string;
      approved_at: string;
    };
  }>;
  shippingAddress: ShippingAddress;
  merchantNotes?: string;
}

export async function createProductOrderAction(payload: CreateOrderPayload) {
  const merchant = await requireActiveMerchant();

  if (!payload.items || payload.items.length === 0) {
    return { success: false, error: "Please select at least one item to order." };
  }

  if (!payload.shippingAddress.fullName || !payload.shippingAddress.phone || !payload.shippingAddress.addressLine1 || !payload.shippingAddress.pinCode) {
    return { success: false, error: "Please fill in all required shipping address fields." };
  }

  const cleanPhone = payload.shippingAddress.phone.replace(/\D/g, "");
  if (cleanPhone.length !== 10) {
    return { success: false, error: "Please provide a valid 10-digit mobile number for courier delivery." };
  }

  const cleanPin = payload.shippingAddress.pinCode.trim();
  if (!/^[1-9][0-9]{5}$/.test(cleanPin)) {
    return { success: false, error: "Please enter a valid 6-digit Indian PIN code." };
  }

  try {
    const returnUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://trustitreview.com"}/merchant/dashboard/products?order_id={order_id}&status=returned`;

    const result = await createPhysicalProductOrder({
      businessId: merchant.businessId,
      merchantUserId: null,
      items: payload.items,
      shippingAddress: {
        ...payload.shippingAddress,
        phone: cleanPhone,
        pinCode: cleanPin,
      },
      merchantNotes: payload.merchantNotes,
      returnUrl,
    });

    return {
      success: true,
      orderId: result.orderId,
      paymentSessionId: result.paymentSessionId,
      totalAmount: result.totalAmount,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unable to place order. Please try again.",
    };
  }
}

export async function verifyProductOrderStatusAction(orderId: string) {
  const merchant = await requireActiveMerchant();
  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("product_orders")
    .select("id, status, business_id, total_amount")
    .eq("id", orderId)
    .eq("business_id", merchant.businessId)
    .maybeSingle();

  if (!order) {
    return { success: false, error: "Order not found." };
  }

  if (order.status !== "awaiting_payment" && order.status !== "draft") {
    return { success: true, status: order.status, isPaid: true };
  }

  // Verify directly with gateway
  const verification = await verifyCashfreeProductPayment(orderId);
  if (verification.status === "VERIFIED_SUCCESS") {
    const paidAt = verification.paidAt || new Date().toISOString();

    await admin
      .from("product_orders")
      .update({
        status: "paid",
        paid_at: paidAt,
        updated_at: paidAt,
      })
      .eq("id", orderId);

    await admin.from("product_payments").upsert({
      order_id: orderId,
      cashfree_order_id: orderId,
      cashfree_payment_id: verification.paymentId,
      amount: verification.amount,
      currency: "INR",
      payment_status: "SUCCESS",
      payment_method: verification.paymentMethod || "online",
      verified_at: paidAt,
      raw_payload: (verification.rawPayload || {}) as unknown as Record<string, unknown>,
      updated_at: paidAt,
    }, { onConflict: "cashfree_order_id" });

    await admin.from("product_order_audit_logs").insert({
      order_id: orderId,
      actor_type: "merchant",
      action: "payment_verified_on_return",
      details: { amount: verification.amount, payment_id: verification.paymentId },
    });

    return { success: true, status: "paid", isPaid: true };
  }

  return { success: true, status: order.status, isPaid: false };
}

export async function submitProductComplaintAction(formData: {
  orderId: string;
  reason: "damaged_in_transit" | "defective_print" | "wrong_item_received" | "qr_scan_failure" | "delayed_delivery" | "other";
  description: string;
  photoUrls?: string[];
}) {
  const merchant = await requireActiveMerchant();
  const admin = createSupabaseAdminClient();

  const { data: order } = await admin
    .from("product_orders")
    .select("id, business_id")
    .eq("id", formData.orderId)
    .eq("business_id", merchant.businessId)
    .maybeSingle();

  if (!order) {
    return { success: false, error: "Order not found or does not belong to your business." };
  }

  const { error } = await admin.from("product_order_complaints").insert({
    order_id: formData.orderId,
    business_id: merchant.businessId,
    reason: formData.reason,
    description: formData.description.trim(),
    photo_urls: formData.photoUrls || [],
    status: "open",
  });

  if (error) {
    return { success: false, error: `Failed to submit report: ${error.message}` };
  }

  await admin.from("product_order_audit_logs").insert({
    order_id: formData.orderId,
    actor_type: "merchant",
    action: "complaint_submitted",
    details: { reason: formData.reason, description: formData.description },
  });

  return { success: true };
}
