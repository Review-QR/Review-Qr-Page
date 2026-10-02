"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { merchantAuthEmail } from "@/lib/merchant-identity";
import { hashMerchantInviteToken, isValidMerchantInviteToken } from "@/app/merchants/invite/invite-utils";

export type MerchantRegistrationState = { success: boolean; message: string };

function validPassword(password: string) {
  return password.length >= 8
    && password.length <= 64
    && /[A-Za-z]/.test(password)
    && /[0-9]/.test(password);
}

export async function registerMerchantFromInvite(
  _previous: MerchantRegistrationState,
  formData: FormData,
): Promise<MerchantRegistrationState> {
  const token = String(formData.get("token") ?? "").trim();
  const businessId = String(formData.get("businessId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmation") ?? "");

  if (!isValidMerchantInviteToken(token) || !/^[A-Za-z0-9_-]{1,128}$/.test(businessId)) {
    return { success: false, message: "This registration link is invalid." };
  }
  if (!validPassword(password) || password !== confirmation) {
    return { success: false, message: "Password must be 8–64 characters, include a letter and a number, and both entries must match." };
  }

  const admin = createSupabaseAdminClient();
  const tokenHash = hashMerchantInviteToken(token);

  const { data: inviteRows, error: inviteError } = await admin.rpc("get_merchant_invite_registration", {
    p_token_hash: tokenHash,
  });
  const invite = (inviteRows?.[0] ?? null) as {
    business_id: string;
    status: "pending" | "used" | "expired" | "revoked";
    expires_at: string;
    merchant_status: string | null;
    business_deleted: boolean;
    has_account: boolean;
  } | null;

  if (
    inviteError ||
    !invite ||
    invite.business_id !== businessId ||
    invite.status !== "pending" ||
    new Date(invite.expires_at).getTime() <= Date.now() ||
    invite.merchant_status !== "pending" ||
    invite.business_deleted ||
    invite.has_account
  ) {
    return { success: false, message: "This registration link is invalid, expired, used, or revoked." };
  }

  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email: merchantAuthEmail(businessId),
    password,
    email_confirm: true,
  });

  if (createError || !created.user) {
    return { success: false, message: "This merchant account could not be created. The invitation may already have been used." };
  }

  const { data: completedBusinessId, error: completeError } = await admin.rpc("complete_merchant_invite", {
    p_token_hash: tokenHash,
    p_user_id: created.user.id,
  });

  if (completeError || completedBusinessId !== businessId) {
    try {
      await admin.auth.admin.deleteUser(created.user.id);
    } catch {
      // Preserve the failure response; the Auth identity must not be reused by this flow.
    }
    return { success: false, message: "Registration could not be completed. Please request a new invitation." };
  }

  redirect("/merchant/login?registered=1");
}
