/**
 * Admin Authentication Module
 */

import { requireActiveAdmin as requireBaseActiveAdmin } from "@/lib/supabase-server";

/**
 * Re-exports the canonical server-side active admin check
 * Throws redirect to /admin if unauthenticated
 */
export async function requireActiveAdmin() {
  return requireBaseActiveAdmin();
}
