import { createCashfreeHyperlocalPaymentOrder } from "@/lib/hyperlocal/cashfree-hyperlocal-service";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { enforceRateLimit } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const rateLimited = enforceRateLimit(request, "hyperlocal_payment_session", 20, 10 * 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const { orderId, businessId, businessName, customerName, customerPhone, customerEmail, returnUrl } = body;

    if (!orderId || !businessId) {
      return Response.json(
        { success: false, error: "Missing required order fields (orderId, businessId)." },
        { status: 400 },
      );
    }

    if (
      process.env.NODE_ENV === "production" &&
      (!process.env.CASHFREE_CLIENT_ID?.trim() || !process.env.CASHFREE_CLIENT_SECRET?.trim())
    ) {
      return Response.json(
        { success: false, error: "Payment gateway is not configured." },
        { status: 503 }
      );
    }

    // Enforce authoritative order existence, ownership, and DB-computed amount
    const admin = createSupabaseAdminClient();
    const { data: dbOrder } = await admin
      .from("hyperlocal_orders")
      .select("id, business_id, total_amount, payment_status")
      .eq("id", orderId)
      .maybeSingle();

    if (!dbOrder) {
      return Response.json({ success: false, error: "Order not found." }, { status: 404 });
    }
    if (dbOrder.business_id !== businessId) {
      return Response.json({ success: false, error: "Order business mismatch." }, { status: 403 });
    }
    if (dbOrder.payment_status === "paid") {
      return Response.json({ success: false, error: "Order is already paid." }, { status: 400 });
    }

    const authoritativeAmount = Number(dbOrder.total_amount);
    if (!Number.isFinite(authoritativeAmount) || authoritativeAmount <= 0) {
      return Response.json({ success: false, error: "Invalid authoritative order amount." }, { status: 400 });
    }

    const result = await createCashfreeHyperlocalPaymentOrder({
      orderId,
      amount: authoritativeAmount,
      businessId,
      businessName,
      customerName,
      customerPhone,
      customerEmail,
      returnUrl,
    });

    if (!result.success) {
      return Response.json({ success: false, error: result.error }, { status: result.httpStatus || 400 });
    }

    return Response.json(result);
  } catch (err) {
    return Response.json(
      { success: false, error: err instanceof Error ? err.message : "Payment session creation failed." },
      { status: 500 },
    );
  }
}
