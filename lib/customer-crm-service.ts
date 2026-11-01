import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export type MaskedCustomerOccasion = {
  id: string;
  customerName: string;
  maskedPhone: string;
  occasionType: "birthday" | "anniversary";
  day: number;
  month: number;
};

export type MerchantOccasionSummary = {
  todayBirthdaysCount: number;
  todayAnniversariesCount: number;
  birthdaysSentToday: number;
  anniversariesSentToday: number;
  offersSentToday: number;
  upcomingBirthdaysCount: number;
  upcomingAnniversariesCount: number;
  todayCustomers: MaskedCustomerOccasion[];
};

export type MerchantConnectWalletState = {
  businessId: string;
  creditsBalance: number;
  totalRecharged: number;
  totalConsumed: number;
  lowBalanceThreshold: number;
  isLowBalance: boolean;
  isZeroBalance: boolean;
  autoWishEnabled: boolean;
  dailyDispatchTime: string;
  birthdayActive: boolean;
  anniversaryActive: boolean;
};

/**
 * DPDP Act 2023 Masking Rule:
 * Shows full Customer Name (e.g. 'Lucky Shukla'), but masks phone to:
 * First 2 digits + '******' + Last 2 digits (e.g. '91******15')
 */
export function maskPhoneForMerchant(phone: string | null | undefined): string {
  if (!phone) return "—";
  const digits = phone.replace(/\D/g, "");
  if (digits.length < 10) return "••••••••••";
  const last10 = digits.slice(-10);
  return `${last10.slice(0, 2)}******${last10.slice(-2)}`;
}

/**
 * Fetch or initialize merchant connect credits wallet
 */
export async function getMerchantConnectWallet(businessId: string): Promise<MerchantConnectWalletState> {
  const admin = createSupabaseAdminClient();
  const { data, error } = await admin.rpc("get_or_create_merchant_wallet", {
    p_business_id: businessId,
  });

  if (error || !data) {
    return {
      businessId,
      creditsBalance: 0,
      totalRecharged: 0,
      totalConsumed: 0,
      lowBalanceThreshold: 50,
      isLowBalance: true,
      isZeroBalance: true,
      autoWishEnabled: true,
      dailyDispatchTime: "09:00",
      birthdayActive: true,
      anniversaryActive: true,
    };
  }

  const wallet = data as {
    business_id: string;
    credits_balance: number;
    total_recharged: number;
    total_consumed: number;
    low_balance_threshold: number;
    auto_wish_enabled: boolean;
    daily_dispatch_time: string;
    birthday_active: boolean;
    anniversary_active: boolean;
  };

  const balance = Number(wallet.credits_balance || 0);
  const threshold = Number(wallet.low_balance_threshold || 50);

  return {
    businessId: wallet.business_id,
    creditsBalance: balance,
    totalRecharged: Number(wallet.total_recharged || 0),
    totalConsumed: Number(wallet.total_consumed || 0),
    lowBalanceThreshold: threshold,
    isLowBalance: balance > 0 && balance < threshold,
    isZeroBalance: balance <= 0,
    autoWishEnabled: Boolean(wallet.auto_wish_enabled),
    dailyDispatchTime: wallet.daily_dispatch_time || "09:00",
    birthdayActive: wallet.birthday_active !== false,
    anniversaryActive: wallet.anniversary_active !== false,
  };
}

/**
 * Fetch Today's Occasions with strict DPDP masking for the Merchant UI
 */
export async function getMerchantOccasionSummary(businessId: string): Promise<MerchantOccasionSummary> {
  const admin = createSupabaseAdminClient();
  const now = new Date();
  const currentDay = now.getDate();
  const currentMonth = now.getMonth() + 1; // 1-12

  // 1. Fetch matching occasions for this business
  const { data: occasions } = await admin
    .from("review_special_occasions")
    .select(`
      id,
      occasion_key,
      day,
      month,
      customer_profile_id
    `)
    .eq("business_id", businessId);

  // 2. Fetch customer names & mobile from trustit_reviews
  const { data: reviews } = await admin
    .from("trustit_reviews")
    .select("customer_name, customer_mobile, business_id")
    .eq("business_id", businessId)
    .not("customer_name", "is", null);

  const customerNameMap = new Map<string, { name: string; mobile: string }>();
  if (reviews) {
    for (const r of reviews) {
      if (r.customer_name) {
        customerNameMap.set(r.business_id, {
          name: r.customer_name,
          mobile: r.customer_mobile || "",
        });
      }
    }
  }

  let todayBirthdaysCount = 0;
  let todayAnniversariesCount = 0;
  let upcomingBirthdaysCount = 0;
  let upcomingAnniversariesCount = 0;
  const todayCustomers: MaskedCustomerOccasion[] = [];

  if (occasions && occasions.length > 0) {
    for (const occ of occasions) {
      const isBirthday = occ.occasion_key === "birthday";
      const isAnniversary = occ.occasion_key === "anniversary";
      const isToday = occ.day === currentDay && occ.month === currentMonth;

      if (isToday) {
        if (isBirthday) todayBirthdaysCount++;
        if (isAnniversary) todayAnniversariesCount++;

        const sampleCustomer = reviews?.[todayCustomers.length % (reviews.length || 1)];
        const customerName = sampleCustomer?.customer_name || "Valued Customer";
        const maskedPhone = maskPhoneForMerchant(sampleCustomer?.customer_mobile);

        todayCustomers.push({
          id: occ.id,
          customerName,
          maskedPhone,
          occasionType: isBirthday ? "birthday" : "anniversary",
          day: occ.day,
          month: occ.month,
        });
      } else {
        // Upcoming in next 7 days
        const diffDays = occ.day - currentDay;
        if (occ.month === currentMonth && diffDays > 0 && diffDays <= 7) {
          if (isBirthday) upcomingBirthdaysCount++;
          if (isAnniversary) upcomingAnniversariesCount++;
        }
      }
    }
  }

  // 3. Fetch today's sent count from audit ledger
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayTx } = await admin
    .from("merchant_credit_transactions")
    .select("type, description")
    .eq("business_id", businessId)
    .eq("type", "dispatch")
    .gte("created_at", todayStart.toISOString());

  let birthdaysSentToday = 0;
  let anniversariesSentToday = 0;
  let offersSentToday = 0;

  if (todayTx) {
    for (const tx of todayTx) {
      const desc = tx.description.toLowerCase();
      if (desc.includes("birthday")) birthdaysSentToday++;
      else if (desc.includes("anniversary")) anniversariesSentToday++;
      else if (desc.includes("offer") || desc.includes("campaign")) offersSentToday++;
    }
  }

  return {
    todayBirthdaysCount,
    todayAnniversariesCount,
    birthdaysSentToday,
    anniversariesSentToday,
    offersSentToday,
    upcomingBirthdaysCount,
    upcomingAnniversariesCount,
    todayCustomers,
  };
}

/**
 * Debit message credits when a wish or offer is successfully dispatched
 */
export async function debitMerchantConnectCredits(
  businessId: string,
  count: number,
  description: string,
  recipientMaskedPhone?: string
): Promise<{ success: boolean; balanceRemaining: number; message: string }> {
  const admin = createSupabaseAdminClient();

  // 1. Get current balance
  const { data: wallet, error } = await admin
    .from("merchant_connect_wallets")
    .select("credits_balance, total_consumed")
    .eq("business_id", businessId)
    .single();

  if (error || !wallet) {
    return { success: false, balanceRemaining: 0, message: "Wallet not found." };
  }

  if (wallet.credits_balance < count) {
    return {
      success: false,
      balanceRemaining: wallet.credits_balance,
      message: `Insufficient message credits. Required: ${count}, Available: ${wallet.credits_balance}`,
    };
  }

  const newBalance = wallet.credits_balance - count;
  const newConsumed = (wallet.total_consumed || 0) + count;

  // 2. Update wallet
  await admin
    .from("merchant_connect_wallets")
    .update({
      credits_balance: newBalance,
      total_consumed: newConsumed,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId);

  // 3. Write transaction ledger
  await admin.from("merchant_credit_transactions").insert({
    business_id: businessId,
    type: "dispatch",
    credits: -count,
    balance_after: newBalance,
    description,
    recipient_masked_phone: recipientMaskedPhone || null,
  });

  return { success: true, balanceRemaining: newBalance, message: "Credits debited successfully." };
}

/**
 * Refund message credits back if delivery fails
 */
export async function refundMerchantConnectCredits(
  businessId: string,
  count: number,
  reason: string,
  recipientMaskedPhone?: string
): Promise<{ success: boolean; newBalance: number }> {
  const admin = createSupabaseAdminClient();

  const { data: wallet } = await admin
    .from("merchant_connect_wallets")
    .select("credits_balance, total_consumed")
    .eq("business_id", businessId)
    .single();

  if (!wallet) return { success: false, newBalance: 0 };

  const newBalance = wallet.credits_balance + count;
  const newConsumed = Math.max(0, (wallet.total_consumed || 0) - count);

  await admin
    .from("merchant_connect_wallets")
    .update({
      credits_balance: newBalance,
      total_consumed: newConsumed,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId);

  await admin.from("merchant_credit_transactions").insert({
    business_id: businessId,
    type: "refund",
    credits: count,
    balance_after: newBalance,
    description: `Refund: ${reason}`,
    recipient_masked_phone: recipientMaskedPhone || null,
  });

  return { success: true, newBalance };
}

/**
 * Add credits after Cashfree payment approval (including pack bonus)
 */
export async function creditMerchantConnectWallet(
  businessId: string,
  amountInr: number,
  creditsToAdd: number,
  cashfreeOrderId: string,
  packName: string
): Promise<{ success: boolean; newBalance: number }> {
  const admin = createSupabaseAdminClient();

  // Idempotency guard: prevent duplicate credit if both webhook and client verification hit
  if (cashfreeOrderId) {
    const { data: existingTx } = await admin
      .from("merchant_credit_transactions")
      .select("id, balance_after")
      .eq("cashfree_order_id", cashfreeOrderId)
      .limit(1)
      .maybeSingle();

    if (existingTx) {
      console.log(`[creditMerchantConnectWallet] Order ${cashfreeOrderId} already processed. Skipping duplicate credit.`);
      const { data: w } = await admin
        .from("merchant_connect_wallets")
        .select("credits_balance")
        .eq("business_id", businessId)
        .single();
      return { success: true, newBalance: w?.credits_balance ?? existingTx.balance_after ?? 0 };
    }
  }

  // Get or init wallet
  await admin.rpc("get_or_create_merchant_wallet", { p_business_id: businessId });

  const { data: wallet } = await admin
    .from("merchant_connect_wallets")
    .select("credits_balance, total_recharged")
    .eq("business_id", businessId)
    .single();

  const currentBal = wallet?.credits_balance || 0;
  const currentRecharged = wallet?.total_recharged || 0;
  const newBalance = currentBal + creditsToAdd;

  await admin
    .from("merchant_connect_wallets")
    .update({
      credits_balance: newBalance,
      total_recharged: currentRecharged + amountInr,
      updated_at: new Date().toISOString(),
    })
    .eq("business_id", businessId);

  await admin.from("merchant_credit_transactions").insert({
    business_id: businessId,
    type: "recharge",
    credits: creditsToAdd,
    balance_after: newBalance,
    amount_inr: amountInr,
    cashfree_order_id: cashfreeOrderId,
    description: `Top-up: ${packName} (+${creditsToAdd} Connect Credits)`,
  });

  return { success: true, newBalance };
}
