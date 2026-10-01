"use server";

import { revalidatePath } from "next/cache";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import { isQrTemplateId } from "./templates";

export async function saveQrTemplateAction(templateId: string) {
  if (!isQrTemplateId(templateId)) {
    return { ok: false as const, error: "Choose one of the available Trustit designs." };
  }

  const merchant = await getActiveMerchant();
  if (!merchant) return { ok: false as const, error: "Sign in to an active merchant account to save this design." };

  const supabase = await createMerchantServerClient();
  const { error } = await supabase.rpc("set_merchant_qr_template", { p_template_id: templateId });
  if (error) {
    return { ok: false as const, error: "We could not save your QR design. Please try again." };
  }

  revalidatePath("/merchant/dashboard/qr");
  revalidatePath("/merchant/dashboard");
  return { ok: true as const };
}
