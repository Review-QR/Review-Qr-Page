import "server-only";

import { randomUUID } from "node:crypto";
import { createCashfreeClient } from "@/lib/cashfree";
import { creditMerchantConnectWallet } from "@/lib/customer-crm-service";

export type CreateWalletPaymentOrderInput = {
  businessId: string;
  amount: number;
  credits: number;
  merchantName?: string;
  merchantPhone?: string;
  merchantEmail?: string;
  returnUrl?: string;
};

export type CreateWalletPaymentOrderResult =
  | {
      success: true;
      orderId: string;
      paymentSessionId: string;
      environment: string;
    }
  | {
      success: false;
      error: string;
    };

export function generateWalletOrderId(): string {
  const ts = Date.now().toString(36);
  const rnd = Math.random().toString(36).substring(2, 8);
  return `twal_${ts}_${rnd}`;
}

export async function createCashfreeWalletRechargeOrder(
  input: CreateWalletPaymentOrderInput
): Promise<CreateWalletPaymentOrderResult> {
  if (!input.amount || input.amount < 1) {
    return { success: false, error: "Minimum recharge amount is ₹1.00." };
  }

  let client;
  try {
    client = createCashfreeClient();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Cashfree client configuration failed.",
    };
  }

  const orderId = generateWalletOrderId();
  const phone = (input.merchantPhone || "").replace(/\D/g, "");
  const validPhone = phone.length === 10 ? phone : "9118643415";

  const appBase = process.env.NEXT_PUBLIC_APP_URL || "https://trustitreview.com";
  const returnUrl =
    input.returnUrl ||
    `${appBase}/merchant/dashboard?wallet_recharge_status={order_status}&order_id=${orderId}`;

  const requestBody = {
    order_id: orderId,
    order_amount: input.amount,
    order_currency: "INR",
    customer_details: {
      customer_id: `biz_${input.businessId.slice(0, 24)}`,
      customer_name: input.merchantName || "Trustit Merchant",
      customer_email: input.merchantEmail || "merchant@trustitreview.com",
      customer_phone: validPhone,
    },
    order_meta: {
      return_url: returnUrl,
      notify_url: `${appBase}/api/cashfree/webhook`,
    },
    order_note: `Trustit Connect Credits Top-up (${input.credits} Credits)`,
    order_tags: {
      order_type: "connect_wallet_recharge",
      business_id: input.businessId,
      credits: String(input.credits),
    },
  };

  try {
    const response = await fetch(`${client.apiBaseUrl}/orders`, client.createRequestInit({
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
      headers: {
        "content-type": "application/json",
        "x-idempotency-key": randomUUID(),
      },
      body: JSON.stringify(requestBody),
    }));

    if (!response.ok) {
      const errText = await response.text();
      return { success: false, error: `Cashfree Error: ${errText}` };
    }

    const data = (await response.json()) as {
      order_id: string;
      payment_session_id: string;
      payments?: { url?: string };
    };

    return {
      success: true,
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id,
      environment: client.environment,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to initiate payment session.",
    };
  }
}

/**
 * Verify wallet order with Cashfree and credit wallet
 */
export async function verifyAndApplyWalletRecharge(
  orderId: string,
  businessId: string,
  creditsExpected: number,
  packLabel: string
): Promise<{ success: boolean; newBalance?: number; error?: string }> {
  let client;
  try {
    client = createCashfreeClient();
  } catch (err) {
    return { success: false, error: "Payment gateway configuration error." };
  }

  try {
    const response = await fetch(`${client.apiBaseUrl}/orders/${orderId}`, client.createRequestInit({
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    }));

    if (!response.ok) {
      return { success: false, error: "Failed to verify order with Cashfree." };
    }

    const order = (await response.json()) as {
      order_status: string;
      order_amount: number;
    };

    if (order.order_status === "PAID") {
      const res = await creditMerchantConnectWallet(
        businessId,
        order.order_amount,
        creditsExpected,
        orderId,
        packLabel
      );
      return { success: true, newBalance: res.newBalance };
    }

    return { success: false, error: `Order status is ${order.order_status}` };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Verification exception",
    };
  }
}
