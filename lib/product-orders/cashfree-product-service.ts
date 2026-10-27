import "server-only";

import { randomUUID } from "node:crypto";
import { createCashfreeClient } from "@/lib/cashfree";
import { isValidProductOrderId } from "./order-id";

export interface CreateProductPaymentOrderInput {
  orderId: string;
  amount: number;
  businessId: string;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  returnUrl?: string;
  notifyUrl?: string;
}

export type CreateProductPaymentOrderResult =
  | {
      success: true;
      orderId: string;
      paymentSessionId: string;
      orderStatus: string;
    }
  | {
      success: false;
      error: string;
      httpStatus?: number | null;
    };

export type VerifyProductPaymentResult =
  | {
      status: "VERIFIED_SUCCESS";
      orderId: string;
      paymentId: string;
      amount: number;
      currency: "INR";
      paidAt: string;
      paymentMethod?: string;
      rawPayload?: Record<string, unknown>;
    }
  | {
      status: "PENDING" | "FAILED" | "USER_DROPPED" | "NOT_FOUND" | "VERIFICATION_ERROR";
      reason?: string;
      httpStatus?: number | null;
    };

/**
 * Creates a distinct Cashfree Payment Order specifically for physical products.
 * Guarantees strict isolation: orderId starts with 'tord_', tagged with order_type: 'physical_product'.
 */
export async function createCashfreeProductPaymentOrder(
  input: CreateProductPaymentOrderInput,
): Promise<CreateProductPaymentOrderResult> {
  if (!isValidProductOrderId(input.orderId)) {
    return {
      success: false,
      error: "Invalid product order reference format.",
      httpStatus: 400,
    };
  }

  if (!Number.isFinite(input.amount) || input.amount < 1) {
    return {
      success: false,
      error: "Invalid order amount. Amount must be greater than or equal to ₹1.00.",
      httpStatus: 400,
    };
  }

  let client;
  try {
    client = createCashfreeClient();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Cashfree client configuration failed.",
      httpStatus: 500,
    };
  }

  const idempotencyKey = randomUUID();
  const customerPhone = (input.customerPhone || "").replace(/\D/g, "");
  const validPhone = customerPhone.length === 10 ? customerPhone : "9999999999";

  const requestBody = {
    order_id: input.orderId,
    order_amount: input.amount,
    order_currency: "INR",
    customer_details: {
      customer_id: `cust_${input.businessId.slice(0, 24)}`,
      customer_name: input.customerName || "Trustit Merchant",
      customer_email: input.customerEmail || "merchant@trustitreview.com",
      customer_phone: validPhone,
    },
    order_meta: {
      return_url: input.returnUrl || undefined,
      notify_url: input.notifyUrl || undefined,
    },
    order_note: `Trustit Physical QR Kit Order (${input.orderId})`,
    order_tags: {
      order_type: "physical_product",
      business_id: input.businessId,
    },
  };

  try {
    const response = await fetch(`${client.apiBaseUrl}/orders`, client.createRequestInit({
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
      headers: {
        "content-type": "application/json",
        "x-idempotency-key": idempotencyKey,
      },
      body: JSON.stringify(requestBody),
    }));

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `Cashfree order creation failed with status ${response.status}`,
        httpStatus: response.status,
      };
    }

    const data = (await response.json()) as {
      order_id?: string;
      order_status?: string;
      payment_session_id?: string;
    };

    if (
      data.order_id !== input.orderId ||
      typeof data.payment_session_id !== "string" ||
      !data.payment_session_id
    ) {
      return {
        success: false,
        error: "Cashfree returned an invalid or incomplete order response.",
        httpStatus: 502,
      };
    }

    return {
      success: true,
      orderId: data.order_id,
      orderStatus: data.order_status || "ACTIVE",
      paymentSessionId: data.payment_session_id,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error contacting payment service.",
      httpStatus: 503,
    };
  }
}

/**
 * Server-side verification of a physical product payment from Cashfree.
 * Never trusts client or browser redirects alone. Queries the authoritative Cashfree Orders API.
 */
export async function verifyCashfreeProductPayment(
  orderId: string,
): Promise<VerifyProductPaymentResult> {
  if (!isValidProductOrderId(orderId)) {
    return {
      status: "VERIFICATION_ERROR",
      reason: "Invalid product order ID format.",
      httpStatus: 400,
    };
  }

  let client;
  try {
    client = createCashfreeClient();
  } catch {
    return {
      status: "VERIFICATION_ERROR",
      reason: "Payment configuration unavailable.",
      httpStatus: 500,
    };
  }

  try {
    // 1. Fetch order details from Cashfree
    const orderResponse = await fetch(`${client.apiBaseUrl}/orders/${encodeURIComponent(orderId)}`, client.createRequestInit({
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    }));

    if (orderResponse.status === 404) {
      return { status: "NOT_FOUND", httpStatus: 404 };
    }

    if (!orderResponse.ok) {
      return {
        status: "VERIFICATION_ERROR",
        httpStatus: orderResponse.status,
        reason: `Payment gateway returned status ${orderResponse.status}`,
      };
    }

    const orderData = (await orderResponse.json()) as {
      order_id?: string;
      order_status?: string;
      order_amount?: number;
      order_currency?: string;
    };

    if (orderData.order_id !== orderId) {
      return {
        status: "VERIFICATION_ERROR",
        reason: "Cashfree order ID mismatch.",
      };
    }

    // 2. Fetch payments for this order to obtain transaction ID and timestamp
    const paymentsResponse = await fetch(`${client.apiBaseUrl}/orders/${encodeURIComponent(orderId)}/payments`, client.createRequestInit({
      method: "GET",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    }));

    let successfulPayment: {
      cf_payment_id?: string | number;
      payment_status?: string;
      payment_amount?: number;
      payment_currency?: string;
      payment_time?: string;
      payment_method?: Record<string, unknown> | string;
    } | null = null;

    if (paymentsResponse.ok) {
      const paymentsList = (await paymentsResponse.json()) as Array<{
        cf_payment_id?: string | number;
        payment_status?: string;
        payment_amount?: number;
        payment_currency?: string;
        payment_time?: string;
        payment_method?: Record<string, unknown> | string;
      }>;

      if (Array.isArray(paymentsList)) {
        successfulPayment = paymentsList.find((p) => p.payment_status === "SUCCESS") || null;
      }
    }

    if (orderData.order_status === "PAID" || successfulPayment?.payment_status === "SUCCESS") {
      const paymentAmount = successfulPayment?.payment_amount ?? orderData.order_amount ?? 0;
      const paymentId = String(successfulPayment?.cf_payment_id || `cf_${orderId}`);
      const paidAt = successfulPayment?.payment_time || new Date().toISOString();
      const paymentMethod = typeof successfulPayment?.payment_method === "string"
        ? successfulPayment.payment_method
        : typeof successfulPayment?.payment_method === "object" && successfulPayment.payment_method !== null
          ? Object.keys(successfulPayment.payment_method)[0]
          : "online";

      return {
        status: "VERIFIED_SUCCESS",
        orderId,
        paymentId,
        amount: paymentAmount,
        currency: "INR",
        paidAt,
        paymentMethod,
        rawPayload: {
          order: orderData,
          payment: successfulPayment,
        },
      };
    }

    if (orderData.order_status === "ACTIVE") {
      return { status: "PENDING", reason: "Order is pending payment." };
    }

    if (orderData.order_status === "EXPIRED" || orderData.order_status === "TERMINATED") {
      return { status: "FAILED", reason: `Order is ${orderData.order_status}.` };
    }

    return {
      status: "PENDING",
      reason: `Order status is ${orderData.order_status}.`,
    };
  } catch (err) {
    return {
      status: "VERIFICATION_ERROR",
      reason: err instanceof Error ? err.message : "Error verifying payment with gateway.",
      httpStatus: 503,
    };
  }
}
