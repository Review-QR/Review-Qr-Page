"use server";

import { revalidatePath } from "next/cache";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { saveMerchantBankDetails, submitBankChangeRequest } from "@/lib/bank-payouts-service";

export async function addMerchantBankDetailsAction(input: {
  accountHolderName: string;
  bankAccountNumber: string;
  ifscCode: string;
  bankName: string;
  branchName?: string;
  accountType: "current" | "savings";
  upiId?: string;
}) {
  const merchant = await requireActiveMerchant();
  const res = await saveMerchantBankDetails(merchant.businessId, input);
  revalidatePath("/merchant/dashboard/payments");
  revalidatePath("/merchant/dashboard/profile");
  return res;
}

export async function submitMerchantBankChangeAction(input: {
  newAccountHolderName: string;
  newAccountNumber: string;
  newIfscCode: string;
  newBankName: string;
  otpCode: string;
}) {
  const merchant = await requireActiveMerchant();
  const res = await submitBankChangeRequest(merchant.businessId, input);
  revalidatePath("/merchant/dashboard/payments");
  revalidatePath("/merchant/dashboard/profile");
  revalidatePath("/merchants");
  return res;
}
