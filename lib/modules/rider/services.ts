/**
 * Rider Domain Services
 */

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

/**
 * Updates rider's live GPS beacon
 */
export async function updateRiderBeacon(riderId: string, lat: number, lon: number) {
  const admin = createSupabaseAdminClient();
  const { error } = await admin
    .from("delivery_riders")
    .update({
      current_latitude: lat,
      current_longitude: lon,
      last_location_updated_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", riderId);

  if (error) throw new Error(`Could not update rider location: ${error.message}`);
  return { success: true };
}

/**
 * Completes doorstep delivery with customer's 4-digit OTP
 */
export async function completeDoorstepDelivery(riderId: string, orderId: string, enteredOtp: string) {
  const admin = createSupabaseAdminClient();
  const { data: order, error: fetchError } = await admin
    .from("hyperlocal_orders")
    .select("delivery_otp, rider_id, status, total_amount, payment_mode")
    .eq("id", orderId)
    .maybeSingle();

  if (fetchError || !order) throw new Error("Order not found.");
  if (order.rider_id !== riderId) throw new Error("Unauthorized rider.");
  if (order.delivery_otp !== enteredOtp.trim()) throw new Error("Invalid 4-digit delivery OTP.");

  const isCod = order.payment_mode === "cod";
  const { error: updateError } = await admin
    .from("hyperlocal_orders")
    .update({
      status: "delivered",
      payment_status: isCod ? "cod_collected" : "paid",
      delivered_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", orderId);

  if (updateError) throw new Error(`Could not complete delivery: ${updateError.message}`);
  return { success: true, message: "Delivery completed successfully!" };
}
