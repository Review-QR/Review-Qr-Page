"use server";

import { requireActiveAdmin } from "@/lib/supabase-server";
import {
  updateAdminOrderStatus,
  recordQualityCheck,
  dispatchShipment,
} from "@/lib/product-orders/product-order-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { ProductOrderStatus } from "@/lib/product-orders/types";

export async function updateAdminOrderStatusAction(input: {
  orderId: string;
  status: ProductOrderStatus;
  vendorId?: string;
  vendorName?: string;
  vendorCost?: number;
  internalNotes?: string;
}) {
  await requireActiveAdmin();
  try {
    const res = await updateAdminOrderStatus({
      ...input,
      actorId: "admin",
    });
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to update order status.",
    };
  }
}

export async function recordAdminQualityCheckAction(input: {
  orderId: string;
  inspectorName: string;
  qrScannable: boolean;
  correctDestinationUrl: boolean;
  scannedTargetUrl?: string;
  printQualityGrade: "pass" | "marginal" | "fail";
  materialCheck: boolean;
  packagingCheck: boolean;
  notes?: string;
}) {
  await requireActiveAdmin();
  try {
    const res = await recordQualityCheck({
      ...input,
      actorId: "admin",
    });
    return { success: true, passed: res.passed };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record quality check.",
    };
  }
}

export async function dispatchAdminShipmentAction(input: {
  orderId: string;
  carrierCode: "delhivery" | "bluedart" | "dtdc" | "indiapost" | "shadowfax" | "other";
  carrierName: string;
  trackingNumber: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}) {
  await requireActiveAdmin();
  try {
    const res = await dispatchShipment({
      ...input,
      actorId: "admin",
    });
    return { success: true, trackingUrl: res.trackingUrl };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to record shipment.",
    };
  }
}

export async function resolveAdminComplaintAction(input: {
  complaintId: string;
  orderId: string;
  status: "open" | "under_review" | "replacement_approved" | "refund_approved" | "rejected" | "resolved";
  adminNotes?: string;
  resolution?: string;
}) {
  await requireActiveAdmin();
  const admin = createSupabaseAdminClient();

  const resolvedAt = ["replacement_approved", "refund_approved", "resolved", "rejected"].includes(input.status)
    ? new Date().toISOString()
    : null;

  const { error } = await admin
    .from("product_order_complaints")
    .update({
      status: input.status,
      admin_notes: input.adminNotes || null,
      resolution: input.resolution || null,
      resolved_at: resolvedAt,
      updated_at: new Date().toISOString(),
    })
    .eq("id", input.complaintId);

  if (error) {
    return { success: false, error: error.message };
  }

  await admin.from("product_order_audit_logs").insert({
    order_id: input.orderId,
    actor_type: "admin",
    actor_id: "admin",
    action: `complaint_status_${input.status}`,
    details: { complaint_id: input.complaintId, resolution: input.resolution },
  });

  return { success: true };
}
