import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { verifyRiderSessionToken } from "@/lib/hyperlocal/rider-session";
import { buildCorsHeaders, handleCorsPreflight } from "@/lib/auth-cors";
import { enforceRateLimit } from "@/lib/auth-api-guards";
import { isValidHyperlocalOrderId } from "@/lib/hyperlocal/order-id";
import {
  createCashfreeDynamicQr,
  verifyCashfreeQrOrLink,
} from "@/lib/hyperlocal/cashfree-pg-qr-refund";

export const dynamic = "force-dynamic";

const RIDER_SESSION_COOKIE = "trustit_rider_session";

function extractRiderId(request: NextRequest): string | null {
  const bearer = request.headers.get("Authorization")?.replace(/^Bearer\s+/i, "").trim();
  const cookieToken = request.cookies.get(RIDER_SESSION_COOKIE)?.value?.trim();
  const raw = bearer || cookieToken || "";
  return raw ? verifyRiderSessionToken(raw) : null;
}

export async function OPTIONS(request: NextRequest) {
  return handleCorsPreflight(request);
}

/**
 * POST /api/hyperlocal/rider/cod-qr
 * Generates a real Cashfree PG Dynamic UPI QR / Payment Link QR for a Rider's active COD delivery.
 */
export async function POST(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  const rateLimited = enforceRateLimit(request, "rider_cod_qr_post", 30, 5 * 60_000);
  if (rateLimited) return rateLimited;

  try {
    const riderId = extractRiderId(request);
    if (!riderId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: active rider session required." },
        { status: 401, headers: corsHeaders }
      );
    }

    const body = await request.json();
    const orderId = typeof body?.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId || !isValidHyperlocalOrderId(orderId)) {
      return NextResponse.json(
        { success: false, error: "Valid orderId is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const admin = createSupabaseAdminClient();
    const { data: order, error: orderErr } = await admin
      .from("hyperlocal_orders")
      .select("id, rider_id, business_id, total_amount, payment_mode, payment_status, status, customer_name, customer_phone")
      .eq("id", orderId)
      .maybeSingle();

    if (orderErr || !order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404, headers: corsHeaders });
    }
    if (order.rider_id !== riderId) {
      return NextResponse.json(
        { success: false, error: "Forbidden: this order is not assigned to your rider account." },
        { status: 403, headers: corsHeaders }
      );
    }
    if (["cancelled", "rejected", "delivered", "completed"].includes(String(order.status || "").toLowerCase())) {
      return NextResponse.json(
        { success: false, error: `Cannot collect QR payment for ${order.status} order.` },
        { status: 400, headers: corsHeaders }
      );
    }
    if (order.payment_status === "paid") {
      return NextResponse.json(
        {
          success: true,
          alreadyPaid: true,
          amount: Number(order.total_amount),
          message: "Order payment is already confirmed via Cashfree.",
        },
        { headers: corsHeaders }
      );
    }

    const qrResult = await createCashfreeDynamicQr({
      internalOrderId: order.id,
      amount: Number(order.total_amount),
      customerName: order.customer_name || "Trustit Customer",
      customerPhone: order.customer_phone || undefined,
      purpose: `Trustit COD Delivery #${order.id.slice(-6).toUpperCase()}`,
      orderTags: {
        business_id: String(order.business_id || ""),
        rider_id: riderId,
        collection_type: "rider_doorstep_qr",
      },
    });

    if (!qrResult.success) {
      return NextResponse.json(
        { success: false, error: qrResult.error },
        { status: qrResult.httpStatus || 502, headers: corsHeaders }
      );
    }

    const cfRef = qrResult.cfOrderId || qrResult.cfLinkId;
    if (cfRef) {
      await admin
        .from("hyperlocal_orders")
        .update({
          cashfree_order_id: cfRef,
          updated_at: new Date().toISOString(),
        })
        .eq("id", order.id);
    }

    return NextResponse.json(
      {
        success: true,
        alreadyPaid: false,
        orderId: order.id,
        amount: qrResult.amount,
        mode: qrResult.mode,
        qrSource: qrResult.qrSource,
        qrDataUrl: qrResult.qrDataUrl,
        upiUri: qrResult.upiUri,
        paymentUrl: qrResult.paymentUrl,
        cfOrderId: qrResult.cfOrderId,
        cfLinkId: qrResult.cfLinkId,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to generate Cashfree QR." },
      { status: 500, headers: corsHeaders }
    );
  }
}

/**
 * GET /api/hyperlocal/rider/cod-qr?orderId=...&cfOrderId=...&cfLinkId=...
 * Verifies Cashfree payment status for a Rider's doorstep COD QR.
 */
export async function GET(request: NextRequest) {
  const corsHeaders = buildCorsHeaders(request.headers.get("origin"));
  const rateLimited = enforceRateLimit(request, "rider_cod_qr_get", 120, 5 * 60_000);
  if (rateLimited) return rateLimited;

  try {
    const riderId = extractRiderId(request);
    if (!riderId) {
      return NextResponse.json(
        { success: false, error: "Unauthorized: active rider session required." },
        { status: 401, headers: corsHeaders }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId")?.trim() || "";
    const cfOrderIdParam = searchParams.get("cfOrderId")?.trim() || null;
    const cfLinkIdParam = searchParams.get("cfLinkId")?.trim() || null;

    if (!orderId || !isValidHyperlocalOrderId(orderId)) {
      return NextResponse.json({ success: false, error: "Valid orderId required." }, { status: 400, headers: corsHeaders });
    }

    const admin = createSupabaseAdminClient();
    const { data: order } = await admin
      .from("hyperlocal_orders")
      .select("id, rider_id, total_amount, payment_status, cashfree_order_id, cashfree_payment_id")
      .eq("id", orderId)
      .maybeSingle();

    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found." }, { status: 404, headers: corsHeaders });
    }
    if (order.rider_id !== riderId) {
      return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403, headers: corsHeaders });
    }

    if (order.payment_status === "paid") {
      return NextResponse.json(
        {
          success: true,
          paid: true,
          cfPaymentId: order.cashfree_payment_id || order.cashfree_order_id || "cf_paid",
          amountPaid: Number(order.total_amount),
        },
        { headers: corsHeaders }
      );
    }

    const storedRef = typeof order.cashfree_order_id === "string" ? order.cashfree_order_id : null;
    const cfOrderId = cfOrderIdParam || (storedRef && storedRef.startsWith("qr_") ? storedRef : null);
    const cfLinkId = cfLinkIdParam || (storedRef && storedRef.startsWith("lnk_") ? storedRef : null);

    const check = await verifyCashfreeQrOrLink({
      cfOrderId,
      cfLinkId,
      expectedAmount: Number(order.total_amount),
    });

    if (!check.paid) {
      return NextResponse.json(
        {
          success: true,
          paid: false,
          status: check.status,
          reason: check.reason,
        },
        { headers: corsHeaders }
      );
    }

    const now = new Date().toISOString();
    await admin
      .from("hyperlocal_orders")
      .update({
        payment_status: "paid",
        payment_mode: "online_cashfree",
        cashfree_order_id: check.cfOrderId || check.cfLinkId || order.cashfree_order_id,
        cashfree_payment_id: check.cfPaymentId,
        updated_at: now,
      })
      .eq("id", order.id);

    return NextResponse.json(
      {
        success: true,
        paid: true,
        cfPaymentId: check.cfPaymentId,
        amountPaid: check.amountPaid,
      },
      { headers: corsHeaders }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "QR verification failed." },
      { status: 500, headers: corsHeaders }
    );
  }
}
