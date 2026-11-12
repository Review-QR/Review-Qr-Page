import { NextRequest } from "next/server";
import { createParchaOrder, updateParchaMerchantQuote } from "@/lib/hyperlocal/hyperlocal-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { getActiveAdminContext } from "@/lib/supabase-server";
import {
  CUSTOMER_SESSION_COOKIE,
  enforceRateLimit,
  verifyCustomerSessionToken,
} from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "hyperlocal_parcha_post", 20, 5 * 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();

    if (body.action === "update_quote") {
      const [merchant, adminCtx] = await Promise.all([
        getActiveMerchant().catch(() => null),
        getActiveAdminContext().catch(() => null),
      ]);
      if (!merchant && !adminCtx) {
        return Response.json(
          { success: false, error: "Unauthorized: merchant or admin session required to update quote." },
          { status: 401 }
        );
      }

      const quoteAmount = Number(body.merchantQuoteAmount || 0);
      if (!body.orderId || !Number.isFinite(quoteAmount) || quoteAmount <= 0 || quoteAmount > 100_000) {
        return Response.json(
          { success: false, error: "Valid orderId and positive quote amount are required." },
          { status: 400 }
        );
      }

      if (merchant && !adminCtx) {
        const admin = createSupabaseAdminClient();
        const { data: orderRow } = await admin
          .from("hyperlocal_orders")
          .select("business_id")
          .eq("id", body.orderId)
          .maybeSingle();
        if (!orderRow) {
          return Response.json({ success: false, error: "Order not found." }, { status: 404 });
        }
        if (orderRow.business_id !== merchant.businessId) {
          return Response.json({ success: false, error: "Forbidden." }, { status: 403 });
        }
      }

      const result = await updateParchaMerchantQuote({
        orderId: body.orderId,
        merchantQuoteAmount: quoteAmount,
        merchantQuoteItems: body.merchantQuoteItems || [],
      });
      return Response.json(result);
    }

    const result = await createParchaOrder({
      businessId: body.businessId,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerAddress: body.customerAddress,
      handwrittenText: body.handwrittenText,
      parchaImageUrl: body.parchaImageUrl,
      customerNotes: body.customerNotes,
    });

    return Response.json({ success: true, ...result });
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Parcha submission failed" },
      { status: 400 },
    );
  }
}

export async function GET(request: NextRequest) {
  const rateLimited = enforceRateLimit(request, "hyperlocal_parcha_get", 60, 60_000);
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(request.url);
  const orderId = searchParams.get("orderId");
  const businessId = searchParams.get("businessId");

  const session = verifyCustomerSessionToken(
    request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
  );

  // Never dump global parcha orders with customer PII to unauthenticated callers
  if (!orderId && !businessId && !session?.phone) {
    return Response.json({ parchas: [] });
  }

  if (businessId) {
    const [merchant, adminCtx] = await Promise.all([
      getActiveMerchant().catch(() => null),
      getActiveAdminContext().catch(() => null),
    ]);
    if (!adminCtx && (!merchant || merchant.businessId !== businessId)) {
      return Response.json({ success: false, error: "Unauthorized." }, { status: 401 });
    }
  }

  const admin = createSupabaseAdminClient();
  let query = admin
    .from("grocery_parcha_orders")
    .select(`
      id,
      order_id,
      handwritten_text,
      parcha_image_url,
      merchant_quote_amount,
      merchant_quote_items,
      quote_status,
      created_at,
      hyperlocal_orders!inner (
        id,
        business_id,
        status,
        total_amount,
        payment_mode,
        payment_status,
        customer_phone
      )
    `)
    .order("created_at", { ascending: false });

  if (orderId) query = query.eq("order_id", orderId);
  else if (businessId) query = query.eq("hyperlocal_orders.business_id", businessId);
  else if (session?.phone) {
    query = query.eq("hyperlocal_orders.customer_phone", session.phone);
  }

  const { data, error } = await query.limit(20);
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ parchas: data || [] });
}
