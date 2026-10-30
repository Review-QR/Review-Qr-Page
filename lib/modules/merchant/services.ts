/**
 * Merchant Domain Services
 */

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { CatalogItemPayload } from "./types";

/**
 * Updates an item's live availability status
 */
export async function toggleItemAvailability(businessId: string, itemId: string, isAvailable: boolean) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("business_catalog_items")
    .update({ is_available: isAvailable, updated_at: new Date().toISOString() })
    .eq("id", itemId)
    .eq("business_id", businessId);

  if (error) throw new Error(`Could not update item availability: ${error.message}`);
  return { success: true, isAvailable };
}

/**
 * Marks a cooking order as Ready for Pickup, triggering immediate loud notification to allocated rider
 */
export async function markMerchantOrderReady(businessId: string, orderId: string) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("hyperlocal_orders")
    .update({
      status: "ready_for_pickup",
      ready_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId)
    .eq("business_id", businessId);

  if (error) throw new Error(`Could not mark order ready: ${error.message}`);
  return { success: true, status: "ready_for_pickup" };
}
