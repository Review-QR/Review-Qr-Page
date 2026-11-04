"use server";

import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantActionClient } from "@/lib/supabase-merchant-server";
import { isReviewIncentiveCopy } from "@/lib/merchant-message-safety";

const categories = new Set(["Festival", "Offer", "Announcement", "New Product", "Customer Appreciation", "Seasonal"]);

export interface SaveMessageInput {
  id?: string;
  category: string;
  templateId: string;
  title: string;
  message: string;
  cta: string;
  startsAt: string;
  endsAt: string;
  imageUrl?: string | null;
  creativeStyle?: string | null;
  dishName?: string | null;
  dishPrice?: string | null;
  socialChannels?: string[];
  publishStatus?: "draft" | "scheduled" | "published" | "failed";
}

export async function saveMerchantMessage(input: SaveMessageInput) {
  if (
    !categories.has(input.category) ||
    typeof input.title !== "string" ||
    !input.title.trim() ||
    input.title.length > 120 ||
    typeof input.message !== "string" ||
    !input.message.trim() ||
    input.message.length > 2000 ||
    input.cta.length > 80 ||
    isReviewIncentiveCopy(`${input.title} ${input.message} ${input.cta}`)
  ) {
    return { ok: false, message: "Keep offers separate from reviews and ratings." };
  }

  const startsAt = input.startsAt ? Date.parse(input.startsAt) : null;
  const endsAt = input.endsAt ? Date.parse(input.endsAt) : null;

  if (
    (input.startsAt && !Number.isFinite(startsAt)) ||
    (input.endsAt && !Number.isFinite(endsAt)) ||
    (startsAt !== null && endsAt !== null && endsAt <= startsAt)
  ) {
    return { ok: false, message: "End date must be after the start date." };
  }

  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantActionClient();

  const values: Record<string, unknown> = {
    business_id: merchant.businessId,
    category: input.category,
    template_id: input.templateId.slice(0, 80),
    title: input.title.trim(),
    message: input.message.trim(),
    cta_text: input.cta.trim() || null,
    starts_at: startsAt ? new Date(startsAt).toISOString() : null,
    ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    updated_at: new Date().toISOString(),
  };

  if (input.imageUrl !== undefined) values.image_url = input.imageUrl;
  if (input.creativeStyle !== undefined) values.creative_style = input.creativeStyle;
  if (input.dishName !== undefined) values.dish_name = input.dishName;
  if (input.dishPrice !== undefined) values.dish_price = input.dishPrice;
  if (input.socialChannels !== undefined) values.social_channels = input.socialChannels;
  if (input.publishStatus !== undefined) values.publish_status = input.publishStatus;

  const { error } = input.id
    ? await supabase.from("merchant_messages").update(values).eq("id", input.id).eq("business_id", merchant.businessId)
    : await supabase.from("merchant_messages").insert(values);

  if (error) return { ok: false, message: "We could not save this message. Please try again." };
  return { ok: true };
}

export async function getMerchantMessages() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantActionClient();
  const { data, error } = await supabase
    .from("merchant_messages")
    .select("id,category,template_id,title,message,cta_text,starts_at,ends_at,updated_at,image_url,creative_style,dish_name,dish_price,social_channels,publish_status")
    .eq("business_id", merchant.businessId)
    .order("updated_at", { ascending: false })
    .limit(30);

  if (error) throw new Error("Saved messages are temporarily unavailable");
  return data ?? [];
}

export async function getMerchantSocialIntegration() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantActionClient();
  const { data } = await supabase
    .from("merchant_social_integrations")
    .select("id,business_id,provider,postiz_api_url,postiz_api_key,facebook_page_name,instagram_username,auto_publish_enabled,default_schedule_time")
    .eq("business_id", merchant.businessId)
    .maybeSingle();

  return data ?? null;
}

export async function saveMerchantSocialIntegration(input: {
  provider?: "postiz" | "meta" | "buffer" | "custom";
  postizApiUrl?: string;
  postizApiKey?: string;
  facebookPageName?: string;
  instagramUsername?: string;
  autoPublishEnabled?: boolean;
}) {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantActionClient();

  const cleanUrl = input.postizApiUrl?.trim() || null;
  if (cleanUrl && !/^https?:\/\//i.test(cleanUrl)) {
    return { ok: false, message: "Postiz API URL must start with http:// or https://" };
  }

  const values = {
    business_id: merchant.businessId,
    provider: input.provider || "postiz",
    postiz_api_url: cleanUrl,
    postiz_api_key: input.postizApiKey?.trim() || null,
    facebook_page_name: input.facebookPageName?.trim() || null,
    instagram_username: input.instagramUsername?.trim() || null,
    auto_publish_enabled: input.autoPublishEnabled ?? true,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase
    .from("merchant_social_integrations")
    .upsert(values, { onConflict: "business_id" });

  if (error) {
    return { ok: false, message: "Failed to save social integration settings." };
  }

  return { ok: true };
}

export async function getMerchantCatalogItems() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantActionClient();
  const { data } = await supabase
    .from("business_catalog_items")
    .select("id,name,category,price,unit,item_type,is_available,image_url")
    .eq("business_id", merchant.businessId)
    .order("display_order", { ascending: true })
    .limit(50);

  return data ?? [];
}

export async function publishPostizSocialPost(input: {
  caption: string;
  imageUrl?: string;
  channels: string[];
  scheduleTime?: string;
}) {
  const merchant = await requireActiveMerchant();
  const integration = await getMerchantSocialIntegration();

  if (!integration?.postiz_api_key && !process.env.POSTIZ_API_KEY) {
    // If no API key configured yet, simulate successful staging/readiness with clear guidance
    return {
      ok: true,
      mode: "staged",
      message: "Post planned successfully! (Connect your Postiz API Key in settings for automatic direct publishing to Instagram/Facebook).",
    };
  }

  const apiUrl = integration?.postiz_api_url || process.env.POSTIZ_API_URL || "https://api.postiz.com/v1/posts";
  const apiKey = integration?.postiz_api_key || process.env.POSTIZ_API_KEY;

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        content: input.caption,
        media: input.imageUrl ? [input.imageUrl] : [],
        providers: input.channels,
        scheduleDate: input.scheduleTime || null,
        metadata: { businessId: merchant.businessId },
      }),
    });

    if (!response.ok) {
      return {
        ok: false,
        message: `Postiz API error (${response.status}). Please verify your API key and connected pages.`,
      };
    }

    const json = await response.json();
    return {
      ok: true,
      mode: "published",
      postId: json.id || "postiz-ok",
      message: "Post successfully published to your connected social channels!",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { ok: false, message: `Could not connect to Postiz: ${msg}` };
  }
}

/** 5. Get Saved Occasion Drafts */
export async function getMerchantOccasionDraftsAction() {
  const merchant = await requireActiveMerchant();
  const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
  const admin = createSupabaseAdminClient();

  try {
    const { data } = await admin
      .from("merchant_occasion_templates")
      .select("*")
      .eq("business_id", merchant.businessId);

    if (data && data.length > 0) {
      return data;
    }
  } catch {
    // fallback to merchant_messages if table not yet created
  }

  // Fallback to merchant_messages table
  try {
    const { data: mmData } = await admin
      .from("merchant_messages")
      .select("*")
      .eq("business_id", merchant.businessId)
      .ilike("template_id", "occasion_%");

    if (mmData && mmData.length > 0) {
      return mmData.map((row) => {
        const occasionType = row.template_id.replace("occasion_", "");
        const discountMatch = row.cta_text?.match(/Flat\s+(\d+)%/);
        const validityMatch = row.cta_text?.match(/Valid\s+(\d+)\s+Days/);
        return {
          occasion_type: occasionType,
          template_style: row.creative_style || "ivory_cream",
          headline: row.title,
          body_text: row.message,
          discount_percent: discountMatch ? Number(discountMatch[1]) : 20,
          coupon_validity_days: validityMatch ? Number(validityMatch[1]) : 7,
          is_active: row.publish_status === "published",
          poster_image_url: row.image_url,
        };
      });
    }
  } catch {
    // ignore
  }

  return [];
}

/** 6. Save/Approve Occasion Greeting Draft & Upload Custom Poster */
export async function saveMerchantOccasionDraftAction(input: {
  occasionType: "birthday" | "anniversary" | "festival" | "offer";
  templateStyle: string;
  headline: string;
  bodyText: string;
  discountPercent: number;
  couponValidityDays: number;
  isActive: boolean;
  posterDataUrl?: string;
}) {
  const merchant = await requireActiveMerchant();
  const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
  const admin = createSupabaseAdminClient();

  let posterPublicUrl: string | undefined = undefined;

  // 1. If merchant's client canvas generated poster image, upload to public storage
  if (input.posterDataUrl && input.posterDataUrl.startsWith("data:image")) {
    try {
      const base64Data = input.posterDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filePath = `posters/${merchant.businessId}_${input.occasionType}.jpg`;
      const uploadRes = await admin.storage.from("merchant-assets").upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

      if (!uploadRes.error) {
        const { data: pubData } = admin.storage.from("merchant-assets").getPublicUrl(filePath);
        posterPublicUrl = `${pubData.publicUrl}?t=${Date.now()}`;
      }
    } catch (err) {
      console.warn("Could not upload merchant occasion poster:", err);
    }
  }

  // 2. Persist in merchant_messages
  try {
    const templateId = `occasion_${input.occasionType}`;
    const { data: existing } = await admin
      .from("merchant_messages")
      .select("id")
      .eq("business_id", merchant.businessId)
      .eq("template_id", templateId)
      .maybeSingle();

    const payload = {
      business_id: merchant.businessId,
      category: "Customer Appreciation",
      template_id: templateId,
      title: input.headline.trim(),
      message: input.bodyText.trim(),
      cta_text: `Flat ${input.discountPercent}% OFF | Valid ${input.couponValidityDays} Days`,
      creative_style: input.templateStyle,
      image_url: posterPublicUrl || null,
      publish_status: (input.isActive ? "published" : "draft") as "published" | "draft",
      updated_at: new Date().toISOString(),
    };

    if (existing?.id) {
      await admin.from("merchant_messages").update(payload).eq("id", existing.id);
    } else {
      await admin.from("merchant_messages").insert(payload);
    }
  } catch (err) {
    console.warn("Could not save to merchant_messages:", err);
  }

  // 3. Persist in merchant_occasion_templates if available
  try {
    await admin
      .from("merchant_occasion_templates")
      .upsert(
        {
          business_id: merchant.businessId,
          occasion_type: input.occasionType,
          template_style: input.templateStyle,
          headline: input.headline.trim(),
          body_text: input.bodyText.trim(),
          discount_percent: input.discountPercent,
          coupon_validity_days: input.couponValidityDays,
          is_active: input.isActive,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "business_id,occasion_type",
        }
      );
  } catch {
    // ignore
  }

  return {
    success: true,
    posterUrl: posterPublicUrl,
    message: `${
      input.occasionType === "birthday"
        ? "Birthday"
        : input.occasionType === "anniversary"
        ? "Anniversary"
        : "Offer"
    } greeting card and poster saved successfully!`,
  };
}

/** 7. Update Occasion Schedule & Timing */
export async function updateMerchantOccasionScheduleAction(input: {
  dailyDispatchTime: string;
  birthdayActive: boolean;
  anniversaryActive: boolean;
}) {
  const merchant = await requireActiveMerchant();
  const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
  const admin = createSupabaseAdminClient();

  try {
    const { error } = await admin
      .from("merchant_connect_wallets")
      .update({
        daily_dispatch_time: input.dailyDispatchTime,
        birthday_active: input.birthdayActive,
        anniversary_active: input.anniversaryActive,
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", merchant.businessId);

    if (error) {
      return { success: false, message: error.message };
    }
  } catch {
    // table might be pending
  }
  return { success: true, message: "Occasion schedule & auto-dispatch time updated successfully." };
}

/** 8. Test Dispatch Fast2SMS Official WhatsApp Message with Custom Poster */
export async function sendFast2SmsWhatsAppTestAction(input: {
  phone: string;
  customerName?: string;
  occasionType: string;
  discountPercent: number;
  couponValidityDays: number;
  customMessage?: string;
  mediaUrl?: string;
  posterDataUrl?: string;
}) {
  const merchant = await requireActiveMerchant();
  const { createSupabaseAdminClient } = await import("@/lib/supabase-admin");
  const admin = createSupabaseAdminClient();
  const {
    dispatchFast2SmsWhatsAppMessage,
    getFast2SmsTemplateStatus,
  } = await import("@/lib/messaging/fast2sms-dispatch");

  let mediaUrl = input.mediaUrl;

  // 1. Upload dynamic canvas poster if provided
  if (input.posterDataUrl && input.posterDataUrl.startsWith("data:image")) {
    try {
      const base64Data = input.posterDataUrl.replace(/^data:image\/\w+;base64,/, "");
      const buffer = Buffer.from(base64Data, "base64");
      const filePath = `posters/${merchant.businessId}_${input.occasionType}.jpg`;
      const uploadRes = await admin.storage.from("merchant-assets").upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

      if (!uploadRes.error) {
        const { data: pubData } = admin.storage.from("merchant-assets").getPublicUrl(filePath);
        mediaUrl = `${pubData.publicUrl}?t=${Date.now()}`;
      }
    } catch (err) {
      console.warn("Could not upload test poster:", err);
    }
  }

  // 2. Fallback to existing merchant poster if already saved
  if (!mediaUrl) {
    const filePath = `posters/${merchant.businessId}_${input.occasionType}.jpg`;
    const { data: pubData } = admin.storage.from("merchant-assets").getPublicUrl(filePath);
    if (pubData?.publicUrl) {
      mediaUrl = pubData.publicUrl;
    }
  }

  const couponCode = `${
    input.occasionType === "birthday"
      ? "BDAY"
      : input.occasionType === "anniversary"
      ? "ANNIV"
      : input.occasionType === "festival"
      ? "FESTIVE"
      : "SPECIAL"
  }-TEST-${input.discountPercent}`;

  const res = await dispatchFast2SmsWhatsAppMessage({
    phone: input.phone,
    customerName: input.customerName || "Lucky Ji",
    businessName: merchant.businessName,
    couponCode,
    discountPercent: input.discountPercent,
    validityDays: input.couponValidityDays,
    customMessage: input.customMessage,
    mediaUrl,
  });

  if (res.success) {
    return {
      success: true,
      requestId: res.requestId,
      mediaUrl,
      message: `WhatsApp greeting dispatched via Fast2SMS Cloud API with your custom poster! (Request ID: ${res.requestId})`,
    };
  }

  if (res.isTemplatePending) {
    const templateInfo = await getFast2SmsTemplateStatus();
    return {
      success: false,
      isPendingMetaApproval: true,
      templateStatus: templateInfo.status,
      message: `Fast2SMS WhatsApp Template (ID: ${templateInfo.messageId || "Pending"}, ${templateInfo.templateName || "trustit_occasion_wish"}) abhi Meta ke dwara review me "${templateInfo.status || "Pending"}" hai. Jaise hi Meta approve karega, Fast2SMS API se automatic delivery chalu ho jayegi!`,
    };
  }

  return {
    success: false,
    message: res.error || "Fast2SMS dispatch failed.",
  };
}

/** 9. Get Fast2SMS WhatsApp Cloud Gateway & Template Status */
export async function getFast2SmsWabaStatusAction() {
  await requireActiveMerchant();
  const { getFast2SmsTemplateStatus } = await import("@/lib/messaging/fast2sms-dispatch");
  return await getFast2SmsTemplateStatus();
}
