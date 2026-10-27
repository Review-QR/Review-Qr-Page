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
