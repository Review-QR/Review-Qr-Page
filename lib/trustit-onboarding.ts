import "server-only";

import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

export async function getTrustitUser() {
  const client = await createMerchantServerClient();
  const { data, error } = await client.auth.getUser();
  if (error || !data.user || !data.user.phone_confirmed_at) return null;
  return { client, user: data.user };
}

export function safeActionError() {
  return { success: false as const, message: "Something went wrong. Please try again." };
}
