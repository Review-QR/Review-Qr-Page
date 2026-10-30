/**
 * Customer Authentication Module
 * Isolated OTP generation, verification, and session resolution for customers
 */

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export interface CustomerAuthResult {
  success: boolean;
  customerId?: string;
  email?: string;
  fullName?: string;
  phone?: string;
  message: string;
}

/**
 * Validates a customer email/phone OTP session
 */
export async function verifyCustomerSession(customerId: string): Promise<boolean> {
  if (!customerId) return false;
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin
    .from("customers")
    .select("id, is_verified")
    .eq("id", customerId)
    .maybeSingle();

  if (error || !data) return false;
  return Boolean(data.is_verified);
}

/**
 * Resolves customer profile from ID or email
 */
export async function getCustomerProfile(identifier: { id?: string; email?: string }) {
  const admin = createSupabaseAdminClient();
  let query = admin.from("customers").select("*");

  if (identifier.id) {
    query = query.eq("id", identifier.id);
  } else if (identifier.email) {
    query = query.eq("email", identifier.email.trim().toLowerCase());
  } else {
    return null;
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  return data;
}
