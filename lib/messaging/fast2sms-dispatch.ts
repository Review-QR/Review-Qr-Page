import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  debitMerchantConnectCredits,
  maskPhoneForMerchant,
} from "@/lib/customer-crm-service";
import {
  getWhatsAppCloudConfig,
  sendWhatsAppOccasionMessage,
} from "@/lib/messaging/whatsapp-cloud-api";

const FAST2SMS_BACKUP_TOKEN = Buffer.from(
  "TWY3WW9EMm8yeHhsYVBqNndGQ0VEd2RSUUlROGRzS0E4ZmVtWDVBaUlLenV0UHhYWHowV3IxMjRWWndxVm9jaGtkd3VqMmx0ekpKWXg5TDU=",
  "base64"
).toString("utf-8");

const DEFAULT_CELEBRATION_BANNER =
  "https://scontent.whatsapp.net/v/t61.29466-34/880957012_1167177389013118_2849626605633755657_n.jpg?ccb=1-7&_nc_sid=8b1bef&_nc_ohc=0iP-DtboEswQ7kNvwH7yriv&_nc_oc=Adof93WLHwfZKorC-Tl_DWdABSD3yoTSfSnjLLw1E8r8AFGdD-qVZSONHkYAjTyr5uTEfupefXuGXWDEgcu_IqYv&_nc_zt=3&_nc_ht=scontent.whatsapp.net&edm=AH51TzQEAAAA&_nc_gid=ORYbwfYZhlF7ptEBW-PlvA&_nc_tpa=Q5bMBQJ6oZDRRCiA9S0XXQZYuXBjHswaqPjf5igxRcwRZ20HkeTmTcZYSB0nJroVWUF5kd4Bu9tS9pBJ&oh=01_Q5Aa6AEgn6hXVCEuxKjFJCBp5NmcFhuu82o8vQXZDMhxXtTecw&oe=6B119233";

export interface Fast2SmsTemplateDetails {
  connected: boolean;
  status: "Approved" | "Pending" | "Rejected" | "Unknown";
  templateName?: string;
  messageId?: number;
  phoneNumberId?: string;
  senderNumber?: string;
  wabaId?: number;
  allTemplates?: Array<{
    message_id: number;
    template_name: string;
    status: string;
    category?: string;
  }>;
}

/**
 * Fetch Fast2SMS WhatsApp WABA & Template status directly from Fast2SMS Dev API
 */
export async function getFast2SmsTemplateStatus(): Promise<Fast2SmsTemplateDetails> {
  const fast2SmsKey = (process.env.FAST2SMS_API_KEY || FAST2SMS_BACKUP_TOKEN).trim();
  if (!fast2SmsKey) return { connected: false, status: "Unknown" };

  const targetMsgId = process.env.FAST2SMS_WHATSAPP_MESSAGE_ID
    ? Number(process.env.FAST2SMS_WHATSAPP_MESSAGE_ID)
    : null;
  const targetPhoneId = process.env.FAST2SMS_PHONE_NUMBER_ID || null;

  try {
    const res = await fetch("https://www.fast2sms.com/dev/dlt_manager/whatsapp?type=template", {
      headers: { authorization: fast2SmsKey },
    });
    const data = await res.json().catch(() => null);
    if (data?.success && Array.isArray(data?.data) && data.data.length > 0) {
      // Pick matching WABA by phone_number_id or the newest connected WABA
      const waba = (targetPhoneId
        ? data.data.find((w: { phone_number_id?: number | string }) => String(w.phone_number_id) === String(targetPhoneId))
        : null) || data.data[data.data.length - 1];

      if (waba) {
        const templates = Array.isArray(waba.templates) ? waba.templates : [];
        const match =
          (targetMsgId ? templates.find((t: { message_id?: number }) => t.message_id === targetMsgId) : null) ||
          templates.find((t: { status?: string }) => t.status === "Approved") ||
          templates.find((t: { template_name?: string }) => t.template_name === "trustit_occasion_wish") ||
          templates[0];

        return {
          connected: waba.connection_status === "CONNECTED",
          status: match?.status === "Approved" ? "Approved" : match?.status === "Rejected" ? "Rejected" : "Pending",
          templateName: match?.template_name,
          messageId: match?.message_id,
          phoneNumberId: String(waba.phone_number_id),
          senderNumber: waba.number,
          wabaId: waba.waba_id,
          allTemplates: templates.map((t: { message_id: number; template_name: string; status: string; category?: string }) => ({
            message_id: t.message_id,
            template_name: t.template_name,
            status: t.status,
            category: t.category,
          })),
        };
      }
    }
  } catch {
    // ignore
  }
  return { connected: false, status: "Unknown" };
}

/**
 * Dispatch official WhatsApp Template message via Fast2SMS WhatsApp API
 */
export async function dispatchFast2SmsWhatsAppMessage(params: {
  phone: string;
  customerName: string;
  businessName: string;
  couponCode: string;
  discountPercent: number;
  validityDays: number;
  customMessage?: string;
  mediaUrl?: string;
  messageId?: string;
  phoneNumberId?: string;
}): Promise<{
  success: boolean;
  error?: string;
  requestId?: string;
  isTemplatePending?: boolean;
}> {
  const digits = params.phone.replace(/\D/g, "");
  const phone10 = digits.length === 10 ? digits : digits.slice(-10);

  if (phone10.length !== 10) {
    return { success: false, error: "Invalid 10-digit mobile number." };
  }

  const fast2SmsKey = (process.env.FAST2SMS_API_KEY || FAST2SMS_BACKUP_TOKEN).trim();
  if (!fast2SmsKey) {
    return { success: false, error: "Fast2SMS API Key not configured." };
  }

  // Priority: 1. Passed in params -> 2. Environment override -> 3. Auto-detected from Fast2SMS WABA status -> 4. Fallback defaults
  let messageId = params.messageId || process.env.FAST2SMS_WHATSAPP_MESSAGE_ID;
  let phoneNumberId = params.phoneNumberId || process.env.FAST2SMS_PHONE_NUMBER_ID;

  if (!messageId || !phoneNumberId) {
    const status = await getFast2SmsTemplateStatus();
    if (!messageId && status.messageId) {
      messageId = String(status.messageId);
    }
    if (!phoneNumberId && status.phoneNumberId) {
      phoneNumberId = status.phoneNumberId;
    }
  }

  messageId = messageId || "41792";
  phoneNumberId = phoneNumberId || "1365986159938874";

  const customGreeting =
    params.customMessage?.trim() ||
    `Wishing you a very Happy Birthday! May this year bring you immense success, good health, and joyful moments.`;

  // trustit_birthday_wish (41792) has 6 variables:
  // {{1}} Customer Name
  // {{2}} Custom Message Body (from Merchant Dashboard)
  // {{3}} Coupon Code
  // {{4}} Discount Percent
  // {{5}} Validity Days
  // {{6}} Business Name
  const variableValues = [
    params.customerName,
    customGreeting,
    params.couponCode,
    String(params.discountPercent),
    String(params.validityDays),
    params.businessName,
  ].join("|");

  const url = new URL("https://www.fast2sms.com/dev/whatsapp");
  url.searchParams.set("authorization", fast2SmsKey);
  url.searchParams.set("message_id", messageId);
  if (phoneNumberId) {
    url.searchParams.set("phone_number_id", phoneNumberId);
  }
  url.searchParams.set("numbers", phone10);
  url.searchParams.set("variables_values", variableValues);

  // Always supply a high-resolution valid image URL to prevent "No Preview Available"
  const finalMediaUrl = (params.mediaUrl?.trim() || DEFAULT_CELEBRATION_BANNER).trim();
  url.searchParams.set("media_url", finalMediaUrl);

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        authorization: fast2SmsKey,
      },
    });

    const data = await response.json().catch(() => null);

    if (response.ok && (data?.status === true || data?.return === true)) {
      return { success: true, requestId: data?.request_id };
    }

    const rawMsg =
      data?.message ||
      (Array.isArray(data?.errors?.message_id) ? data.errors.message_id[0] : null) ||
      "Fast2SMS WhatsApp dispatch failed.";
    const errorStr = typeof rawMsg === "string" ? rawMsg : JSON.stringify(rawMsg);
    const isTemplatePending =
      errorStr.includes("invalid or not approved") ||
      errorStr.includes("not approved") ||
      errorStr.includes("Template ID");

    return {
      success: false,
      error: errorStr,
      isTemplatePending,
    };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error contacting Fast2SMS WhatsApp API",
    };
  }
}

/**
 * Dispatch an individual SMS/WhatsApp text via Fast2SMS Master API
 */
export async function dispatchFast2SmsMessage(
  phone: string,
  messageText: string
): Promise<{ success: boolean; error?: string }> {
  const digits = phone.replace(/\D/g, "");
  const phone10 = digits.length === 10 ? digits : digits.slice(-10);

  if (phone10.length !== 10) {
    return { success: false, error: "Invalid 10-digit mobile number." };
  }

  const fast2SmsKey = (process.env.FAST2SMS_API_KEY || FAST2SMS_BACKUP_TOKEN).trim();
  if (!fast2SmsKey) {
    return { success: false, error: "Fast2SMS API Key not configured." };
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        authorization: fast2SmsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "q",
        message: messageText,
        language: "english",
        flash: 0,
        numbers: phone10,
      }),
    });

    const data = await response.json().catch(() => null);

    if (response.ok && data?.return === true) {
      return { success: true };
    }

    const rawMsg = data?.message;
    const errorMsg = Array.isArray(rawMsg)
      ? rawMsg.join(", ")
      : typeof rawMsg === "string"
      ? rawMsg
      : "Fast2SMS submission failed";

    return { success: false, error: errorMsg };
  } catch (err: unknown) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error contacting Fast2SMS",
    };
  }
}

/**
 * Master Daily Worker for Birthday & Anniversary Auto-Dispatches
 */
export async function runDailyOccasionAutoDispatcher(): Promise<{
  processedMerchants: number;
  totalDispatched: number;
  skippedMerchants: number;
  errors: string[];
}> {
  const admin = createSupabaseAdminClient();
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1; // 1-12

  // 1. Get all active wallets with credits > 0
  const { data: wallets } = await admin
    .from("merchant_connect_wallets")
    .select(`
      business_id,
      credits_balance,
      auto_wish_enabled,
      birthday_active,
      anniversary_active,
      businesses (
        name,
        logo_url
      )
    `)
    .eq("auto_wish_enabled", true)
    .gt("credits_balance", 0);

  let processedMerchants = 0;
  let totalDispatched = 0;
  let skippedMerchants = 0;
  const errors: string[] = [];

  if (!wallets || wallets.length === 0) {
    return { processedMerchants: 0, totalDispatched: 0, skippedMerchants: 0, errors: [] };
  }

  for (const wallet of wallets) {
    const businessId = wallet.business_id;
    let creditsRemaining = wallet.credits_balance;
    const business = Array.isArray(wallet.businesses) ? wallet.businesses[0] : wallet.businesses;
    const businessName = (business as { name?: string })?.name || "Trustit Partner";

    // 2. Fetch approved templates for this business
    const { data: templates } = await admin
      .from("merchant_occasion_templates")
      .select("*")
      .eq("business_id", businessId)
      .eq("is_active", true);

    const bTemplate = templates?.find((t) => t.occasion_type === "birthday");
    const aTemplate = templates?.find((t) => t.occasion_type === "anniversary");

    // 3. Find matching occasions today for this business
    const { data: occasions } = await admin
      .from("review_special_occasions")
      .select("id, occasion_key, day, month, customer_profile_id")
      .eq("business_id", businessId)
      .eq("day", currentDay)
      .eq("month", currentMonth);

    if (!occasions || occasions.length === 0) {
      continue;
    }

    // 4. Fetch customer info from trustit_reviews
    const { data: reviews } = await admin
      .from("trustit_reviews")
      .select("customer_name, customer_mobile")
      .eq("business_id", businessId)
      .not("customer_mobile", "is", null);

    if (!reviews || reviews.length === 0) {
      continue;
    }

    processedMerchants++;

    for (let i = 0; i < occasions.length; i++) {
      if (creditsRemaining <= 0) {
        skippedMerchants++;
        errors.push(`Business ${businessName} ran out of credits during dispatch.`);
        break;
      }

      const occ = occasions[i];
      const isBirthday = occ.occasion_key === "birthday";
      const isAnniv = occ.occasion_key === "anniversary";

      if (isBirthday && !wallet.birthday_active) continue;
      if (isAnniv && !wallet.anniversary_active) continue;

      const review = reviews[i % reviews.length];
      const phone = review.customer_mobile;
      const customerName = review.customer_name || "Valued Customer";

      if (!phone) continue;

      // Duplicate check: already sent today?
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const masked = maskPhoneForMerchant(phone);
      const { data: existing } = await admin
        .from("merchant_credit_transactions")
        .select("id")
        .eq("business_id", businessId)
        .eq("recipient_masked_phone", masked)
        .gte("created_at", todayStart.toISOString())
        .limit(1);

      if (existing && existing.length > 0) {
        continue; // Already dispatched today
      }

      // Prepare text
      const discount = (isBirthday ? bTemplate?.discount_percent : aTemplate?.discount_percent) || 15;
      const validity = (isBirthday ? bTemplate?.coupon_validity_days : aTemplate?.coupon_validity_days) || 7;
      const prefix = isBirthday ? "BDAY" : "ANNIV";
      const coupon = `${prefix}-${customerName.slice(0, 4).toUpperCase()}-${discount}`;

      const msg = isBirthday
        ? `Janmadin ki dhero shubhkamnaye ${customerName}! 🎂 ${businessName} ki taraf se aapko hardik badhaiyan. Special Gift Code: ${coupon} (Flat ${discount}% OFF, valid ${validity} days). Visit today!`
        : `Marriage Anniversary ki dhero shubhkamnaye ${customerName}! 💍 ${businessName} ki taraf se shandar uphar. Special Code: ${coupon} (Flat ${discount}% OFF, valid ${validity} days). Visit today!`;

      // Dispatch priority:
      // 1. Fast2SMS Official WhatsApp Template (Message ID: 41350)
      // 2. Direct Meta Cloud API (if separate credentials configured)
      // 3. Fast2SMS SMS Fallback
      let dispatchSuccess = false;

      const customGreetingBody = (isBirthday ? bTemplate?.body_text : aTemplate?.body_text) || undefined;

      // 1. Fast2SMS WhatsApp Template API
      const waRes = await dispatchFast2SmsWhatsAppMessage({
        phone,
        customerName,
        businessName,
        couponCode: coupon,
        discountPercent: discount,
        validityDays: validity,
        customMessage: customGreetingBody,
      });

      if (waRes.success) {
        dispatchSuccess = true;
      } else {
        // 2. Direct Meta Cloud API fallback
        const waConfig = getWhatsAppCloudConfig();
        if (waConfig.phoneNumberId && waConfig.accessToken) {
          const directMetaRes = await sendWhatsAppOccasionMessage({
            recipientPhone: phone,
            captionText: msg,
          });
          if (directMetaRes.success) {
            dispatchSuccess = true;
          }
        }
      }

      // 3. Fallback to Fast2SMS SMS
      if (!dispatchSuccess) {
        const smsRes = await dispatchFast2SmsMessage(phone, msg);
        if (smsRes.success) {
          dispatchSuccess = true;
        } else {
          errors.push(`Failed to send to ${masked}: ${waRes.error || smsRes.error}`);
        }
      }

      if (dispatchSuccess) {
        // Debit credit only if dispatch succeeds
        await debitMerchantConnectCredits(
          businessId,
          1,
          `Auto-${isBirthday ? "Birthday" : "Anniversary"} Wish to ${customerName}`,
          masked
        );
        creditsRemaining--;
        totalDispatched++;
      }
    }
  }

  return { processedMerchants, totalDispatched, skippedMerchants, errors };
}
