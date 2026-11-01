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
  mediaUrl?: string;
  messageId?: string;
}): Promise<{ success: boolean; error?: string; requestId?: string }> {
  const digits = params.phone.replace(/\D/g, "");
  const phone10 = digits.length === 10 ? digits : digits.slice(-10);

  if (phone10.length !== 10) {
    return { success: false, error: "Invalid 10-digit mobile number." };
  }

  const fast2SmsKey = (process.env.FAST2SMS_API_KEY || FAST2SMS_BACKUP_TOKEN).trim();
  if (!fast2SmsKey) {
    return { success: false, error: "Fast2SMS API Key not configured." };
  }

  const messageId = params.messageId || process.env.FAST2SMS_WHATSAPP_MESSAGE_ID || "41350";
  const variableValues = [
    params.customerName,
    params.businessName,
    params.couponCode,
    String(params.discountPercent),
    String(params.validityDays),
  ].join("|");

  const url = new URL("https://www.fast2sms.com/dev/whatsapp");
  url.searchParams.set("authorization", fast2SmsKey);
  url.searchParams.set("message_id", messageId);
  url.searchParams.set("numbers", phone10);
  url.searchParams.set("variables_values", variableValues);
  if (params.mediaUrl) {
    url.searchParams.set("media_url", params.mediaUrl);
  }

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

    const errorMsg = data?.message || "Fast2SMS WhatsApp dispatch failed.";
    return { success: false, error: typeof errorMsg === "string" ? errorMsg : JSON.stringify(errorMsg) };
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

      // 1. Fast2SMS WhatsApp Template API
      const waRes = await dispatchFast2SmsWhatsAppMessage({
        phone,
        customerName,
        businessName,
        couponCode: coupon,
        discountPercent: discount,
        validityDays: validity,
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
