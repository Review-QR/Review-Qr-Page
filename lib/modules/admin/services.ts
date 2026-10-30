/**
 * Admin Domain Services
 */

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * Resolves live operational running orders and disputes
 */
export async function getLiveCommandOverview() {
  const admin = createSupabaseAdminClient();
  const [ordersRes, ridersRes] = await Promise.all([
    admin
      .from("hyperlocal_orders")
      .select("id, business_id, customer_name, customer_phone, status, total_amount, payment_mode, delivery_otp, created_at")
      .in("status", ["placed", "accepted_by_merchant", "preparing", "ready_for_pickup", "rider_assigned", "picked_up", "out_for_delivery", "arrived_at_doorstep"])
      .order("created_at", { ascending: false }),
    admin
      .from("delivery_riders")
      .select("id, full_name, phone, is_online, is_available")
      .eq("is_online", true),
  ]);

  return {
    runningOrders: ordersRes.data || [],
    onlineRiders: ridersRes.data || [],
    activeOrdersCount: ordersRes.data?.length || 0,
    onlineRidersCount: ridersRes.data?.length || 0,
  };
}
