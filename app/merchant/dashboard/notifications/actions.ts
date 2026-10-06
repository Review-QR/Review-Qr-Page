"use server";

import { createMerchantActionClient } from "@/lib/supabase-merchant-server";
import { requireActiveMerchant } from "@/lib/merchant-auth";

export async function getMerchantNotifications() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantActionClient();
  const { data, error } = await supabase.from("merchant_notifications")
    .select("id,title,preview,rating,review_id,is_read,created_at")
    .eq("business_id", merchant.businessId).order("created_at", { ascending: false }).limit(20);
  if (error) throw new Error("Notifications are temporarily unavailable");
  const notifications = data ?? [];
  if (notifications.length > 0) {
    const { error: readError } = await supabase.from("merchant_notifications").update({ is_read: true })
      .eq("business_id", merchant.businessId)
      .eq("is_read", false)
      .in("id", notifications.map((notification) => notification.id));
    if (readError) throw new Error("Notifications are temporarily unavailable");
  }
  return notifications.map((notification) => ({ ...notification, is_read: true }));
}
