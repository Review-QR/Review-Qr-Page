"use server";

import { revalidatePath } from "next/cache";
import { randomBytes, createHash } from "node:crypto";
import { createSupabaseActionClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { merchantRegistrationUrl, createMerchantInviteToken } from "./invite-utils";

export type MerchantInviteActionState = {
  success: boolean;
  message: string;
  registrationUrl?: string;
};

async function getActiveAdmin() {
  const supabase = await createSupabaseActionClient();
  const { data, error } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (error || !userId) return null;
  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  return !adminError && admin ? userId : null;
}

export async function createMerchantInviteAction(
  _previous: MerchantInviteActionState,
  formData: FormData,
): Promise<MerchantInviteActionState> {
  const actorUserId = await getActiveAdmin();
  if (!actorUserId) return { success: false, message: "Only an active administrator can create merchant invitations." };

  const businessId = String(formData.get("businessId") ?? "").trim();
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(businessId)) {
    return { success: false, message: "Select a valid merchant business." };
  }

  try {
    const admin = createSupabaseAdminClient();
    const { data: business, error: businessError } = await admin
      .from("businesses")
      .select("id, name, owner, phone, merchant_status, deleted_at")
      .eq("id", businessId)
      .maybeSingle();

    if (businessError || !business || business.deleted_at) {
      return { success: false, message: "Merchant business not found." };
    }
    if (business.merchant_status !== "pending") {
      return { success: false, message: "Only a pending merchant can receive a registration invitation." };
    }

    const { data: mapping, error: mappingError } = await admin
      .from("merchant_accounts")
      .select("business_id")
      .eq("business_id", businessId)
      .maybeSingle();
    if (mappingError) return { success: false, message: "Could not verify the merchant account state." };
    if (mapping) return { success: false, message: "This merchant already has an account." };

    const { token, tokenHash } = createMerchantInviteToken();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { error } = await admin.rpc("admin_create_merchant_invite", {
      p_business_id: businessId,
      p_actor_user_id: actorUserId,
      p_token_hash: tokenHash,
      p_expires_at: expiresAt,
    });
    if (error) return { success: false, message: "The merchant invitation could not be created. Please try again." };

    const registrationUrl = merchantRegistrationUrl(token);
    revalidatePath("/merchants/invite");
    revalidatePath("/merchants");

    return {
      success: true,
      message: `Registration link created for ${business.name}. It expires in 48 hours and can be used once.`,
      registrationUrl,
    };
  } catch {
    return { success: false, message: "The merchant invitation could not be created. Please try again." };
  }
}

export async function revokeMerchantInviteAction(inviteId: string): Promise<MerchantInviteActionState> {
  const actorUserId = await getActiveAdmin();
  if (!actorUserId || !/^[0-9a-f-]{36}$/i.test(inviteId)) {
    return { success: false, message: "Invalid invitation request." };
  }

  try {
    const { data, error } = await createSupabaseAdminClient().rpc("admin_revoke_merchant_invite", {
      p_invite_id: inviteId,
      p_actor_user_id: actorUserId,
    });
    if (error || data !== true) {
      return { success: false, message: "The invitation could not be revoked. It may already be used or expired." };
    }
    revalidatePath("/merchants/invite");
    return { success: true, message: "Invitation revoked." };
  } catch {
    return { success: false, message: "The invitation could not be revoked." };
  }
}

export async function listMerchantInvites() {
  const actorUserId = await getActiveAdmin();
  if (!actorUserId) return null;

  const admin = createSupabaseAdminClient();
  await admin
    .from("merchant_invites")
    .update({ status: "expired" })
    .eq("status", "pending")
    .lte("expires_at", new Date().toISOString());

  const { data, error } = await admin
    .from("merchant_invites")
    .select("id, business_id, status, expires_at, created_at, used_at, revoked_at, businesses(name, owner, phone)")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return [];
  return data ?? [];
}
