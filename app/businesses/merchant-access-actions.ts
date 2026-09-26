"use server";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { merchantAuthEmail } from "@/lib/merchant-identity";
import { createSupabaseActionClient } from "@/lib/supabase-server";

export type MerchantAccessState = { message: string; success: boolean };

const failure = (
  message = "Merchant account update failed. Please try again."
): MerchantAccessState => ({ message, success: false });

async function getMerchantAdministratorClient() {
  const supabase = await createSupabaseActionClient();
  const { data: claimsData, error: claimsError } =
    await supabase.auth.getClaims();
  const userId = claimsData?.claims.sub;
  if (claimsError || !userId) return null;

  const { data: administrator, error } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();
  return !error && administrator ? supabase : null;
}

function readPassword(formData: FormData) {
  const businessId = String(formData.get("businessId") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!businessId || businessId.length > 128 || password.length < 8) return null;
  return { businessId, password };
}

export async function provisionMerchantAction(
  _previousState: MerchantAccessState,
  formData: FormData
): Promise<MerchantAccessState> {
  const administratorClient = await getMerchantAdministratorClient();
  if (!administratorClient) {
    return failure("Only an active administrator can manage merchant accounts.");
  }

  const input = readPassword(formData);
  if (!input) return failure("Enter a valid Business ID and a password of at least 8 characters.");

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return failure("Merchant account management is not configured on this server.");
  }

  const { data: business, error: businessError } = await administratorClient
    .from("businesses")
    .select("id, owner, phone, merchant_status")
    .eq("id", input.businessId)
    .maybeSingle();
  if (businessError) return failure("Unable to verify the business. Please try again.");
  if (!business) return failure("Business not found.");
  if (business.merchant_status !== "pending") {
    return failure("Only pending merchant accounts can be provisioned here.");
  }
  if (!business.owner?.trim() || !business.phone?.trim()) {
    return failure("Add the merchant name and registered mobile number before activation.");
  }

  const { data: created, error: createError } =
    await adminClient.auth.admin.createUser({
      email: merchantAuthEmail(input.businessId),
      password: input.password,
      email_confirm: true,
    });
  if (createError || !created.user) {
    return failure("Could not create the merchant account. Check its provisioning status and try again.");
  }

  try {
    const { error: provisionError } = await adminClient.rpc(
      "provision_merchant_account",
      { p_business_id: input.businessId, p_user_id: created.user.id }
    );
    if (!provisionError) {
      return { message: "Merchant account activated. Give the password directly to the merchant.", success: true };
    }

    const { data: mapping, error: mappingError } = await adminClient
      .from("merchant_accounts")
      .select("user_id")
      .eq("business_id", input.businessId)
      .maybeSingle();

    if (!mappingError && mapping?.user_id === created.user.id) {
      return { message: "Merchant account activated. Give the password directly to the merchant.", success: true };
    }
    if (!mappingError && !mapping) {
      await adminClient.auth.admin.deleteUser(created.user.id);
    }
    return failure("Could not activate this merchant account. Verify its status before retrying.");
  } catch {
    // An uncertain transaction result must not cause deletion of a linked Auth user.
    return failure("Merchant activation could not be confirmed. Verify its status before retrying.");
  }
}

export async function resetMerchantPasswordAction(
  _previousState: MerchantAccessState,
  formData: FormData
): Promise<MerchantAccessState> {
  if (!(await getMerchantAdministratorClient())) {
    return failure("Only an active administrator can manage merchant accounts.");
  }

  const input = readPassword(formData);
  if (!input) return failure("Enter a valid Business ID and a password of at least 8 characters.");

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return failure("Merchant account management is not configured on this server.");
  }

  const { data: mapping, error: mappingError } = await adminClient
    .from("merchant_accounts")
    .select("user_id")
    .eq("business_id", input.businessId)
    .maybeSingle();
  if (mappingError || !mapping) return failure("Merchant account not found.");

  const { error: updateError } = await adminClient.auth.admin.updateUserById(
    mapping.user_id,
    { password: input.password }
  );
  if (updateError) return failure("Could not reset the merchant password. Please try again.");

  return { message: "Merchant password reset successfully.", success: true };
}

export async function setMerchantAccountStatusAction(
  _previousState: MerchantAccessState,
  formData: FormData
): Promise<MerchantAccessState> {
  const administratorClient = await getMerchantAdministratorClient();
  if (!administratorClient) {
    return failure("Only an active administrator can manage merchant accounts.");
  }

  const businessId = String(formData.get("businessId") ?? "").trim();
  const nextStatus = String(formData.get("merchantStatus") ?? "");
  if (
    !businessId ||
    businessId.length > 128 ||
    (nextStatus !== "active" && nextStatus !== "suspended")
  ) {
    return failure("Invalid merchant status request.");
  }

  const { data: business, error: businessError } = await administratorClient
    .from("businesses")
    .select("merchant_status")
    .eq("id", businessId)
    .maybeSingle();
  if (businessError) return failure("Unable to verify the business. Please try again.");
  if (!business) return failure("Business not found.");

  let adminClient;
  try {
    adminClient = createSupabaseAdminClient();
  } catch {
    return failure("Merchant account management is not configured on this server.");
  }

  const { data: mapping, error: mappingError } = await adminClient
    .from("merchant_accounts")
    .select("business_id")
    .eq("business_id", businessId)
    .maybeSingle();
  if (mappingError || !mapping) {
    return failure("A provisioned merchant account is required for this action.");
  }

  const currentStatus = business.merchant_status;
  if (
    (nextStatus === "suspended" && currentStatus !== "active") ||
    (nextStatus === "active" && currentStatus !== "suspended")
  ) {
    return failure("This merchant account status cannot be changed with that action.");
  }

  const { data: updatedBusiness, error: updateError } = await administratorClient
    .from("businesses")
    .update({ merchant_status: nextStatus })
    .eq("id", businessId)
    .eq("merchant_status", currentStatus)
    .select("id")
    .maybeSingle();
  if (updateError || !updatedBusiness) {
    return failure("Could not update merchant access. Please try again.");
  }

  return {
    message:
      nextStatus === "suspended"
        ? "Merchant access suspended."
        : "Merchant access activated.",
    success: true,
  };
}
