"use server";

import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantActionClient } from "@/lib/supabase-merchant-server";
import { isReviewIncentiveCopy } from "@/lib/merchant-message-safety";

const categories = new Set(["Festival","Offer","Announcement","New Product","Customer Appreciation","Seasonal"]);
export async function saveMerchantMessage(input: { id?: string; category: string; templateId: string; title: string; message: string; cta: string; startsAt: string; endsAt: string }) {
  if (!categories.has(input.category) || typeof input.title !== "string" || !input.title.trim() || input.title.length > 120 ||
    typeof input.message !== "string" || !input.message.trim() || input.message.length > 2000 || input.cta.length > 80 ||
    isReviewIncentiveCopy(`${input.title} ${input.message} ${input.cta}`)) return { ok: false, message: "Keep offers separate from reviews and ratings." };
  const startsAt = input.startsAt ? Date.parse(input.startsAt) : null;
  const endsAt = input.endsAt ? Date.parse(input.endsAt) : null;
  if ((input.startsAt && !Number.isFinite(startsAt)) || (input.endsAt && !Number.isFinite(endsAt)) || (startsAt !== null && endsAt !== null && endsAt <= startsAt)) return { ok: false, message: "End date must be after the start date." };
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantActionClient();
  const values = { business_id: merchant.businessId, category: input.category, template_id: input.templateId.slice(0, 80), title: input.title.trim(), message: input.message.trim(), cta_text: input.cta.trim() || null, starts_at: startsAt ? new Date(startsAt).toISOString() : null, ends_at: endsAt ? new Date(endsAt).toISOString() : null, updated_at: new Date().toISOString() };
  const { error } = input.id
    ? await supabase.from("merchant_messages").update(values).eq("id", input.id).eq("business_id", merchant.businessId)
    : await supabase.from("merchant_messages").insert(values);
  if (error) return { ok: false, message: "We could not save this message. Please try again." };
  return { ok: true };
}

export async function getMerchantMessages() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantActionClient();
  const { data, error } = await supabase.from("merchant_messages").select("id,category,template_id,title,message,cta_text,starts_at,ends_at,updated_at").eq("business_id", merchant.businessId).order("updated_at", { ascending: false }).limit(30);
  if (error) throw new Error("Saved messages are temporarily unavailable");
  return data ?? [];
}
