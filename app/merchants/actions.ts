"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createSupabaseActionClient } from "@/lib/supabase-server";

export type MerchantLifecycleResult = {
  success: boolean;
  businessDeleted?: boolean;
  identityCleanupPending?: boolean;
  message: string;
};

const BUSINESS_ID_PATTERN = /^[A-Za-z0-9_-]{1,128}$/;

async function requireActiveAdmin() {
  const userClient = await createSupabaseActionClient();
  const { data: claimsData, error: claimsError } = await userClient.auth.getClaims();
  const actorUserId = claimsData?.claims.sub;
  if (claimsError || typeof actorUserId !== "string") return null;

  const { data: admin, error: adminError } = await userClient
    .from("admin_users")
    .select("user_id")
    .eq("user_id", actorUserId)
    .eq("is_active", true)
    .maybeSingle();
  if (adminError || !admin) return null;
  return { actorUserId };
}

function revalidateMerchantLists() {
  revalidatePath("/merchants");
  revalidatePath("/merchants/deleted");
}

export async function softDeleteMerchantAction(
  businessIdInput: unknown,
): Promise<MerchantLifecycleResult> {
  if (typeof businessIdInput !== "string" || !BUSINESS_ID_PATTERN.test(businessIdInput)) {
    return { success: false, message: "Invalid merchant identifier." };
  }

  const admin = await requireActiveAdmin();
  if (!admin) return { success: false, message: "Only a signed-in active administrator can move a merchant to Deleted Merchants." };

  let adminClient;
  try { adminClient = createSupabaseAdminClient(); } catch {
    return { success: false, message: "Merchant management is not configured on this server." };
  }
  const { data, error } = await adminClient.rpc("admin_soft_delete_merchant", {
    p_business_id: businessIdInput,
    p_actor_user_id: admin.actorUserId,
  });
  if (error || data !== true) {
    console.error("Merchant soft deletion failed", { businessId: businessIdInput, code: error?.code });
    return { success: false, message: "The merchant could not be moved to Deleted Merchants. Refresh the list and verify its current status." };
  }

  revalidateMerchantLists();
  return { success: true, message: "Merchant moved to Deleted Merchants. Its data has been preserved." };
}

export async function restoreMerchantAction(
  businessIdInput: unknown,
): Promise<MerchantLifecycleResult> {
  if (typeof businessIdInput !== "string" || !BUSINESS_ID_PATTERN.test(businessIdInput)) {
    return { success: false, message: "Invalid merchant identifier." };
  }

  const admin = await requireActiveAdmin();
  if (!admin) return { success: false, message: "Only a signed-in active administrator can restore a merchant." };

  let adminClient;
  try { adminClient = createSupabaseAdminClient(); } catch {
    return { success: false, message: "Merchant management is not configured on this server." };
  }
  const { data, error } = await adminClient.rpc("admin_restore_merchant", {
    p_business_id: businessIdInput,
    p_actor_user_id: admin.actorUserId,
  });
  if (error || data !== true) {
    console.error("Merchant restore failed", { businessId: businessIdInput, code: error?.code });
    return { success: false, message: "The merchant could not be restored. Refresh the list and verify its current status." };
  }

  revalidateMerchantLists();
  return { success: true, message: "Merchant restored to Active Merchants. Its existing data is unchanged." };
}

export async function permanentlyDeleteMerchantAction(
  businessIdInput: unknown,
  typedBusinessId: unknown,
): Promise<MerchantLifecycleResult> {
  if (typeof businessIdInput !== "string" || !BUSINESS_ID_PATTERN.test(businessIdInput)) {
    return { success: false, message: "Invalid merchant identifier." };
  }
  if (typedBusinessId !== businessIdInput) {
    return { success: false, message: "Type the exact merchant ID to confirm permanent deletion." };
  }

  const admin = await requireActiveAdmin();
  if (!admin) return { success: false, message: "Only a signed-in active administrator can permanently delete a merchant." };

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return { success: false, message: "Permanent deletion is not configured on this server." };
  }

  // The database RPC independently locks and verifies deleted_at. Keeping this
  // entry point on the Deleted Merchants page is a second layer of protection.
  const { data: authUserId, error } = await adminClient.rpc("admin_delete_merchant", {
    p_business_id: businessIdInput,
    p_actor_user_id: admin.actorUserId,
  });
  if (error) {
    console.error("Permanent merchant deletion failed", { businessId: businessIdInput, code: error.code });
    return { success: false, message: "The database did not confirm permanent deletion. Refresh and verify the merchant before retrying." };
  }

  revalidateMerchantLists();
  if (typeof authUserId === "string") {
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(authUserId);
    if (authDeleteError) {
      console.error("Merchant Auth identity cleanup failed", { businessId: businessIdInput, code: authDeleteError.status });
      const { error: identityLookupError } = await adminClient.auth.admin.getUserById(authUserId);
      if (identityLookupError?.status !== 404 && identityLookupError?.code !== "user_not_found") {
        return {
          success: false,
          businessDeleted: true,
          identityCleanupPending: true,
          message: "Merchant data was permanently deleted, but sign-in identity cleanup is pending. Retry cleanup to finish.",
        };
      }
    }
  }

  return { success: true, businessDeleted: true, message: "Merchant permanently deleted." };
}
