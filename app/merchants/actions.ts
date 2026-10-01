"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseActionClient } from "@/lib/supabase-server";

export type DeleteMerchantResult = {
  success: boolean;
  businessDeleted?: boolean;
  identityCleanupPending?: boolean;
  message: string;
};

const BUSINESS_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

export async function deleteMerchantAction(
  businessIdInput: unknown
): Promise<DeleteMerchantResult> {
  if (typeof businessIdInput !== "string" || !BUSINESS_ID_PATTERN.test(businessIdInput)) {
    return { success: false, message: "Invalid merchant identifier." };
  }

  const userClient = await createSupabaseActionClient();
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims();
  const actorUserId = claimsData?.claims.sub;
  if (claimsError || typeof actorUserId !== "string") {
    return { success: false, message: "Sign in with an active administrator account to continue." };
  }

  const { data: admin, error: adminError } = await userClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", actorUserId)
    .eq("is_active", true)
    .maybeSingle();
  if (adminError || !admin) {
    return { success: false, message: "Only an active administrator can delete a merchant." };
  }

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return { success: false, message: "Merchant deletion is not configured on this server." };
  }

  const { data: authUserId, error: deletionError } = await adminClient.rpc(
    "admin_delete_merchant",
    { p_business_id: businessIdInput, p_actor_user_id: actorUserId }
  );
  if (deletionError) {
    console.error("Merchant database deletion failed", { businessId: businessIdInput, code: deletionError.code });
    return {
      success: false,
      message: `The database did not confirm merchant deletion: ${deletionError.message}. Refresh and verify the merchant before retrying.`,
    };
  }

  if (typeof authUserId === "string") {
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(authUserId);
    if (authDeleteError) {
      console.error("Merchant Auth identity cleanup failed", { businessId: businessIdInput, code: authDeleteError.status });
      const { error: identityLookupError } = await adminClient.auth.admin.getUserById(authUserId);
      if (identityLookupError?.status === 404 || identityLookupError?.code === "user_not_found") {
        return { success: true, businessDeleted: true, message: "Merchant deleted successfully." };
      }
      return {
        success: false,
        businessDeleted: true,
        identityCleanupPending: true,
        message: "Merchant data was deleted, but its sign-in identity remains and has been blocked from creating merchant data. Retry identity cleanup to finish.",
      };
    }
  }

  return { success: true, businessDeleted: true, message: "Merchant deleted successfully." };
}
