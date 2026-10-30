/**
 * Shared Supabase Database Service
 */

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const databaseService = {
  getAdminClient: createSupabaseAdminClient,
  getServerClient: createSupabaseServerClient,
};
