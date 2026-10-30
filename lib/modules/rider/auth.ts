/**
 * Rider Authentication Module
 */

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { RiderProfile } from "./types";

/**
 * Validates active verified rider status
 */
export async function requireActiveRider(riderId: string): Promise<RiderProfile> {
  if (!riderId) {
    throw new Error("Unauthorized: Active rider authentication token required.");
  }

  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("delivery_riders")
    .select("*")
    .eq("id", riderId)
    .eq("is_verified", true)
    .maybeSingle();

  if (error || !data) {
    throw new Error("Unauthorized: Verified delivery partner account not found.");
  }

  return {
    id: data.id,
    fullName: data.full_name,
    phone: data.phone,
    email: data.email,
    vehicleType: data.vehicle_type,
    vehicleNumber: data.vehicle_number,
    isOnline: Boolean(data.is_online),
    isAvailable: Boolean(data.is_available),
    isVerified: Boolean(data.is_verified),
    rating: Number(data.rating),
    walletBalance: Number(data.wallet_balance),
    cashInHand: Number(data.cash_in_hand),
    currentLatitude: data.current_latitude,
    currentLongitude: data.current_longitude,
  };
}
