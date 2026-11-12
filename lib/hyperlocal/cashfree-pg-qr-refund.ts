import "server-only";

import { randomUUID } from "node:crypto";
import QRCode from "qrcode";
import { createCashfreeClient } from "@/lib/cashfree";

export interface CashfreeDynamicQrInput {
  internalOrderId: string;
  amount: number;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  purpose?: string;
  returnUrl?: string;
  notifyUrl?: string;
  orderTags?: Record<string, string>;
}

export type CashfreeDynamicQrResult =
  | {
      success: true;
      mode: "sandbox" | "production";
      qrSource: "cashfree_upi_qr" | "cashfree_payment_link";
      qrDataUrl: string;
      upiUri: string | null;
      paymentUrl: string | null;
      cfOrderId: string | null;
      cfLinkId: string | null;
      cfPaymentId: string | null;
      paymentSessionId: string | null;
      amount: number;
    }
  | {
      success: false;
      error: string;
      httpStatus?: number | null;
    };

export type VerifyCashfreeQrPaymentResult =
  | {
      paid: true;
      cfOrderId: string | null;
      cfLinkId: string | null;
      cfPaymentId: string;
      amountPaid: number;
      paidAt: string;
    }
  | {
      paid: false;
      status: "PENDING" | "FAILED" | "EXPIRED" | "ERROR";
      reason?: string;
    };

export type CashfreeRefundResult =
  | {
      success: true;
      refundId: string;
      cfRefundId: string | null;
      refundStatus: string;
      refundArn: string | null;
      refundAmount: number;
    }
  | {
      success: false;
      error: string;
      httpStatus?: number | null;
    };

function extractCashfreeErrorMessage(rawText: string, fallbackStatus: number): string {
  try {
    const parsed = JSON.parse(rawText) as { message?: string; code?: string; type?: string };
    if (parsed?.message) {
      return parsed.code ? `${parsed.message} (${parsed.code})` : parsed.message;
    }
  } catch {
    // Plain text fallback below
  }
  return rawText.trim() || `Cashfree PG request failed with status ${fallbackStatus}`;
}

function sanitizeGatewayPhone(phone?: string): string {
  const digits = (phone || "").replace(/\D/g, "").slice(-10);
  return digits.length === 10 ? digits : "9876543210";
}

function sanitizeAlphanumericId(raw: string, maxLen = 40): string {
  return raw.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, maxLen);
}

/**
 * Generates a live Cashfree PG Dynamic UPI QR using PG credentials:
 * 1. Tries PG Order + `/orders/sessions` (`upi.channel = "qrcode"`).
 * 2. If S2S sessions is disabled on the PG account, falls back to Cashfree Payment Link (`POST /pg/links`),
 *    which returns a real Cashfree-hosted `link_qrcode` and `link_url`.
 * Zero mock or hardcoded VPA fallbacks.
 */
export async function createCashfreeDynamicQr(
  input: CashfreeDynamicQrInput
): Promise<CashfreeDynamicQrResult> {
  const amount = Math.round(Number(input.amount) * 100) / 100;
  if (!Number.isFinite(amount) || amount < 1) {
    return { success: false, error: "Invalid payment amount. Minimum ₹1.00 required.", httpStatus: 400 };
  }

  let client;
  try {
    client = createCashfreeClient();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Cashfree PG credentials are not configured.",
      httpStatus: 503,
    };
  }

  const validPhone = sanitizeGatewayPhone(input.customerPhone);
  const customerName = input.customerName?.trim() || "Trustit Customer";
  const customerEmail = input.customerEmail?.trim() || `cust_${validPhone}@trustitreview.com`;
  const appBase = process.env.NEXT_PUBLIC_APP_URL || "https://trustitreview.com";
  const notifyUrl = input.notifyUrl || process.env.CASHFREE_WEBHOOK_URL || `${appBase}/api/cashfree/webhook`;
  const returnUrl = input.returnUrl || `${appBase}/pay/cashfree?order_id=${encodeURIComponent(input.internalOrderId)}&returned=1`;

  const suffix = `${Date.now().toString(36)}${randomUUID().slice(0, 4)}`;
  const cfOrderId = sanitizeAlphanumericId(`qr_${input.internalOrderId.replace(/^hord_/, "")}_${suffix}`, 45);

  let s2sFailureReason = "";

  // Attempt 1: Native Cashfree UPI QR session (/pg/orders + /pg/orders/sessions)
  try {
    const orderRes = await fetch(
      `${client.apiBaseUrl}/orders`,
      client.createRequestInit({
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
        headers: {
          "content-type": "application/json",
          "x-idempotency-key": randomUUID(),
        },
        body: JSON.stringify({
          order_id: cfOrderId,
          order_amount: amount,
          order_currency: "INR",
          customer_details: {
            customer_id: `cust_${validPhone}`,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: validPhone,
          },
          order_meta: {
            return_url: returnUrl,
            notify_url: notifyUrl,
          },
          order_note: input.purpose || `Trustit Order ${input.internalOrderId}`,
          order_tags: {
            target_order_id: input.internalOrderId,
            qr_channel: "cashfree_pg_dynamic_qr",
            ...(input.orderTags || {}),
          },
        }),
      })
    );

    if (orderRes.ok) {
      const orderJson = (await orderRes.json()) as { payment_session_id?: string; order_id?: string };
      const paymentSessionId = orderJson.payment_session_id;
      if (paymentSessionId) {
        const sessionRes = await fetch(
          `${client.apiBaseUrl}/orders/sessions`,
          client.createRequestInit({
            method: "POST",
            cache: "no-store",
            signal: AbortSignal.timeout(15_000),
            headers: { "content-type": "application/json" },
            body: JSON.stringify({
              payment_session_id: paymentSessionId,
              payment_method: {
                upi: { channel: "qrcode" },
              },
            }),
          })
        );

        if (sessionRes.ok) {
          const sessionJson = (await sessionRes.json()) as {
            cf_payment_id?: string | number;
            data?: {
              url?: string | null;
              payload?: string | { qrcode?: string; default?: string };
            };
          };

          const rawPayload = sessionJson.data?.payload;
          let qrCandidate = "";
          let upiUri: string | null = null;

          if (typeof rawPayload === "string") {
            qrCandidate = rawPayload.trim();
          } else if (rawPayload && typeof rawPayload === "object") {
            qrCandidate = String(rawPayload.qrcode || rawPayload.default || "").trim();
          }

          if (qrCandidate.startsWith("data:image/")) {
            return {
              success: true,
              mode: client.environment,
              qrSource: "cashfree_upi_qr",
              qrDataUrl: qrCandidate,
              upiUri: null,
              paymentUrl: sessionJson.data?.url || null,
              cfOrderId,
              cfLinkId: null,
              cfPaymentId: sessionJson.cf_payment_id ? String(sessionJson.cf_payment_id) : null,
              paymentSessionId,
              amount,
            };
          }

          if (qrCandidate.startsWith("upi://") || qrCandidate.length > 10) {
            upiUri = qrCandidate.startsWith("upi://") ? qrCandidate : null;
            const encodedQr = await QRCode.toDataURL(qrCandidate, {
              width: 340,
              margin: 1,
              color: { dark: "#0F172A", light: "#FFFFFF" },
            });
            return {
              success: true,
              mode: client.environment,
              qrSource: "cashfree_upi_qr",
              qrDataUrl: encodedQr,
              upiUri,
              paymentUrl: sessionJson.data?.url || null,
              cfOrderId,
              cfLinkId: null,
              cfPaymentId: sessionJson.cf_payment_id ? String(sessionJson.cf_payment_id) : null,
              paymentSessionId,
              amount,
            };
          }
        } else {
          const errText = await sessionRes.text();
          s2sFailureReason = extractCashfreeErrorMessage(errText, sessionRes.status);
        }
      }
    } else {
      const errText = await orderRes.text();
      s2sFailureReason = extractCashfreeErrorMessage(errText, orderRes.status);
    }
  } catch (err) {
    s2sFailureReason = err instanceof Error ? err.message : "Cashfree QR session error";
  }

  // Attempt 2: Official Cashfree PG Payment Link QR (works on all standard PG accounts without S2S)
  const cfLinkId = sanitizeAlphanumericId(`lnk_${input.internalOrderId.replace(/^hord_/, "")}_${suffix}`, 45);
  try {
    const expiryIso = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const linkRes = await fetch(
      `${client.apiBaseUrl}/links`,
      client.createRequestInit({
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
        headers: {
          "content-type": "application/json",
          "x-idempotency-key": randomUUID(),
        },
        body: JSON.stringify({
          link_id: cfLinkId,
          link_amount: amount,
          link_currency: "INR",
          link_purpose: (input.purpose || `Trustit Order ${input.internalOrderId}`).slice(0, 100),
          link_partial_payments: false,
          link_expiry_time: expiryIso,
          link_notify: {
            send_sms: false,
            send_email: false,
          },
          customer_details: {
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: validPhone,
          },
          link_meta: {
            return_url: returnUrl,
            notify_url: notifyUrl,
            upi_intent: true,
          },
          link_notes: {
            target_order_id: input.internalOrderId,
            ...(input.orderTags || {}),
          },
        }),
      })
    );

    if (!linkRes.ok) {
      const errText = await linkRes.text();
      const linkErr = extractCashfreeErrorMessage(errText, linkRes.status);
      return {
        success: false,
        error: s2sFailureReason ? `${linkErr} (S2S note: ${s2sFailureReason})` : linkErr,
        httpStatus: linkRes.status,
      };
    }

    const linkData = (await linkRes.json()) as {
      cf_link_id?: string | number;
      link_id?: string;
      link_url?: string;
      link_qrcode?: string;
    };

    const linkUrl = linkData.link_url || null;
    let qrDataUrl = typeof linkData.link_qrcode === "string" ? linkData.link_qrcode.trim() : "";

    if (qrDataUrl && !qrDataUrl.startsWith("data:image/")) {
      qrDataUrl = `data:image/png;base64,${qrDataUrl}`;
    }

    if (!qrDataUrl && linkUrl) {
      qrDataUrl = await QRCode.toDataURL(linkUrl, {
        width: 340,
        margin: 1,
        color: { dark: "#0F172A", light: "#FFFFFF" },
      });
    }

    if (!qrDataUrl) {
      return {
        success: false,
        error: "Cashfree Payment Link did not return a QR code image or URL.",
        httpStatus: 502,
      };
    }

    return {
      success: true,
      mode: client.environment,
      qrSource: "cashfree_payment_link",
      qrDataUrl,
      upiUri: null,
      paymentUrl: linkUrl,
      cfOrderId: null,
      cfLinkId: linkData.link_id || cfLinkId,
      cfPaymentId: linkData.cf_link_id ? String(linkData.cf_link_id) : null,
      paymentSessionId: null,
      amount,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to reach Cashfree PG Links API.",
      httpStatus: 503,
    };
  }
}

/**
 * Verifies a Rider COD Cashfree QR order or Payment Link directly against Cashfree PG API.
 */
export async function verifyCashfreeQrOrLink(input: {
  cfOrderId?: string | null;
  cfLinkId?: string | null;
  expectedAmount: number;
}): Promise<VerifyCashfreeQrPaymentResult> {
  let client;
  try {
    client = createCashfreeClient();
  } catch (err) {
    return {
      paid: false,
      status: "ERROR",
      reason: err instanceof Error ? err.message : "Cashfree PG credentials unavailable.",
    };
  }

  try {
    if (input.cfOrderId) {
      const orderRes = await fetch(
        `${client.apiBaseUrl}/orders/${encodeURIComponent(input.cfOrderId)}`,
        client.createRequestInit({ method: "GET", cache: "no-store", signal: AbortSignal.timeout(12_000) })
      );
      if (!orderRes.ok) {
        return { paid: false, status: "PENDING", reason: `Cashfree order check HTTP ${orderRes.status}` };
      }
      const orderData = (await orderRes.json()) as {
        order_status?: string;
        order_amount?: number;
      };
      if (orderData.order_status !== "PAID") {
        return {
          paid: false,
          status: orderData.order_status === "EXPIRED" ? "EXPIRED" : "PENDING",
          reason: `Cashfree order status: ${orderData.order_status || "ACTIVE"}`,
        };
      }
      const paidAmt = Number(orderData.order_amount ?? input.expectedAmount);
      if (paidAmt + 0.01 < input.expectedAmount) {
        return { paid: false, status: "FAILED", reason: `Underpayment detected: ₹${paidAmt}` };
      }

      const paymentsRes = await fetch(
        `${client.apiBaseUrl}/orders/${encodeURIComponent(input.cfOrderId)}/payments`,
        client.createRequestInit({ method: "GET", cache: "no-store", signal: AbortSignal.timeout(12_000) })
      );
      let cfPaymentId = input.cfOrderId;
      let paidAt = new Date().toISOString();
      if (paymentsRes.ok) {
        const list = (await paymentsRes.json()) as Array<{
          cf_payment_id?: string | number;
          payment_status?: string;
          payment_time?: string;
        }>;
        const ok = Array.isArray(list) ? list.find((p) => p.payment_status === "SUCCESS") : undefined;
        if (ok?.cf_payment_id) cfPaymentId = String(ok.cf_payment_id);
        if (ok?.payment_time) paidAt = ok.payment_time;
      }

      return {
        paid: true,
        cfOrderId: input.cfOrderId,
        cfLinkId: null,
        cfPaymentId,
        amountPaid: paidAmt,
        paidAt,
      };
    }

    if (input.cfLinkId) {
      const linkRes = await fetch(
        `${client.apiBaseUrl}/links/${encodeURIComponent(input.cfLinkId)}`,
        client.createRequestInit({ method: "GET", cache: "no-store", signal: AbortSignal.timeout(12_000) })
      );
      if (!linkRes.ok) {
        return { paid: false, status: "PENDING", reason: `Cashfree link check HTTP ${linkRes.status}` };
      }
      const linkData = (await linkRes.json()) as {
        link_status?: string;
        link_amount_paid?: number;
        cf_link_id?: string | number;
      };
      if (linkData.link_status !== "PAID") {
        return {
          paid: false,
          status: linkData.link_status === "EXPIRED" ? "EXPIRED" : "PENDING",
          reason: `Payment link status: ${linkData.link_status || "ACTIVE"}`,
        };
      }
      const paidAmt = Number(linkData.link_amount_paid ?? input.expectedAmount);
      if (paidAmt + 0.01 < input.expectedAmount) {
        return { paid: false, status: "FAILED", reason: `Underpayment detected: ₹${paidAmt}` };
      }

      return {
        paid: true,
        cfOrderId: null,
        cfLinkId: input.cfLinkId,
        cfPaymentId: linkData.cf_link_id ? `link_${linkData.cf_link_id}` : input.cfLinkId,
        amountPaid: paidAmt,
        paidAt: new Date().toISOString(),
      };
    }

    return { paid: false, status: "ERROR", reason: "Missing Cashfree QR order or link identifier." };
  } catch (err) {
    return {
      paid: false,
      status: "ERROR",
      reason: err instanceof Error ? err.message : "Cashfree QR verification failed.",
    };
  }
}

/**
 * Initiates a genuine Cashfree PG Refund via POST /pg/orders/{order_id}/refunds.
 */
export async function createCashfreeOrderRefund(input: {
  cfOrderId: string;
  refundAmount: number;
  refundId?: string;
  refundNote?: string;
  refundSpeed?: "STANDARD" | "INSTANT";
}): Promise<CashfreeRefundResult> {
  const amount = Math.round(Number(input.refundAmount) * 100) / 100;
  if (!input.cfOrderId || !Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "Valid Cashfree order ID and positive refund amount required.", httpStatus: 400 };
  }

  let client;
  try {
    client = createCashfreeClient();
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Cashfree PG credentials not configured for refund.",
      httpStatus: 503,
    };
  }

  const refundId = sanitizeAlphanumericId(
    input.refundId || `ref_${input.cfOrderId.replace(/^hord_/, "")}_${Date.now().toString(36)}`,
    40
  );

  try {
    const res = await fetch(
      `${client.apiBaseUrl}/orders/${encodeURIComponent(input.cfOrderId)}/refunds`,
      client.createRequestInit({
        method: "POST",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
        headers: {
          "content-type": "application/json",
          "x-idempotency-key": randomUUID(),
        },
        body: JSON.stringify({
          refund_id: refundId,
          refund_amount: amount,
          refund_note: (input.refundNote || "Trustit order cancellation refund").slice(0, 100),
          refund_speed: input.refundSpeed || "STANDARD",
        }),
      })
    );

    const rawText = await res.text();
    if (!res.ok) {
      return {
        success: false,
        error: extractCashfreeErrorMessage(rawText, res.status),
        httpStatus: res.status,
      };
    }

    const parsed = JSON.parse(rawText) as {
      refund_id?: string;
      cf_refund_id?: string | number;
      refund_status?: string;
      refund_arn?: string | null;
      refund_amount?: number;
    };

    return {
      success: true,
      refundId: parsed.refund_id || refundId,
      cfRefundId: parsed.cf_refund_id ? String(parsed.cf_refund_id) : null,
      refundStatus: parsed.refund_status || "PENDING",
      refundArn: parsed.refund_arn || null,
      refundAmount: Number(parsed.refund_amount ?? amount),
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Network error initiating Cashfree refund.",
      httpStatus: 503,
    };
  }
}
