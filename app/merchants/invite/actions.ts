"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseActionClient } from "@/lib/supabase-server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { merchantRegistrationUrl, createMerchantInviteToken } from "./invite-utils";

export type MerchantInviteRow = {
  id: string;
  business_id: string;
  status: "pending" | "used" | "expired" | "revoked";
  expires_at: string;
  created_at: string;
  used_at: string | null;
  revoked_at: string | null;
  businesses: { name: string; owner: string | null; phone: string | null } | null;
};

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
    const { token, tokenHash } = createMerchantInviteToken();
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    const { data, error } = await admin.rpc("admin_create_merchant_invite", {
      p_business_id: businessId,
      p_actor_user_id: actorUserId,
      p_token_hash: tokenHash,
      p_expires_at: expiresAt,
    });
    if (error || !data) return { success: false, message: "The merchant invitation could not be created. The business may no longer be eligible." };

    const registrationUrl = merchantRegistrationUrl(token);
    revalidatePath("/merchants/invite");
    revalidatePath("/merchants");

    return {
      success: true,
      message: "Registration link created. It expires in 48 hours and can be used once.",
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

export async function listMerchantInvites(): Promise<MerchantInviteRow[] | null> {
  const actorUserId = await getActiveAdmin();
  if (!actorUserId) return null;

  const { data, error } = await createSupabaseAdminClient().rpc("admin_list_merchant_invites", {
    p_actor_user_id: actorUserId,
  });
  if (error) return [];
  return ((data ?? []) as {
    id: string;
    business_id: string;
    status: MerchantInviteRow["status"];
    expires_at: string;
    created_at: string;
    used_at: string | null;
    revoked_at: string | null;
    business_name: string | null;
    business_owner: string | null;
    business_phone: string | null;
  }[]).map((invite) => ({
    id: invite.id,
    business_id: invite.business_id,
    status: invite.status,
    expires_at: invite.expires_at,
    created_at: invite.created_at,
    used_at: invite.used_at,
    revoked_at: invite.revoked_at,
    businesses: invite.business_name ? {
      name: invite.business_name,
      owner: invite.business_owner,
      phone: invite.business_phone,
    } : null,
  }));
}
