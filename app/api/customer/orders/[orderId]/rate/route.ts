import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  enforceRateLimit,
  verifyCustomerSessionToken,
} from "@/lib/auth-api-guards";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Rate a rider for a specific order.
 * POST /api/customer/orders/:orderId/rate
 * Body: { riderId: string, rating: number (1-5), comment?: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const rateLimited = enforceRateLimit(request, "rider_rating", 10, 60_000);
    if (rateLimited) return rateLimited;

    const { orderId: orderIdParam } = await params;
    const orderId = orderIdParam.trim();

    if (!orderId || orderId.length < 30) {
      return NextResponse.json(
        { success: false, error: "Invalid orderId." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const riderId = (body.riderId ?? "").trim();
    const rating = Number(body.rating) || 0;
    const comment = (body.comment ?? "").trim().slice(0, 500) || null;

    if (!riderId || riderId.length < 30) {
      return NextResponse.json(
        { success: false, error: "Invalid riderId." },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be between 1 and 5." },
        { status: 400 }
      );
    }

    // Verify customer session
    const sessionCookie = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (!sessionCookie) {
      return NextResponse.json(
        { success: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const session = await verifyCustomerSessionToken(sessionCookie);
    if (!session) {
      return NextResponse.json(
        { success: false, error: "Invalid or expired session." },
        { status: 401 }
      );
    }

    // Call the RPC
    const admin = createSupabaseAdminClient();
    const { error: rpcError } = await admin.rpc("submit_rider_rating", {
      p_order_id: orderId,
      p_rider_id: riderId,
      p_rating: rating,
      p_comment: comment,
    });

    if (rpcError) {
      if (
        rpcError.message?.includes("duplicate") ||
        rpcError.message?.includes("conflict") ||
        rpcError.message?.includes("already")
      ) {
        return NextResponse.json({
          success: true,
          alreadyRated: true,
          message: "You have already rated this delivery.",
        });
      }
      return NextResponse.json(
        { success: false, error: rpcError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Thank you! Your ${rating}★ rating has been recorded.`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to submit rating";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
