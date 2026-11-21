import { NextResponse } from "next/server";
import { constantTimeEqual } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization") || "";
  const cronSecret = (process.env.CRON_SECRET || "").trim();

  if (!cronSecret || !constantTimeEqual(authHeader, `Bearer ${cronSecret}`)) {
    return NextResponse.json({ success: false, message: "Unauthorized cron execution." }, { status: 401 });
  }

  const startTime = Date.now();
  let cancelledCount = 0;

  try {
    // Auto-cancel orders that are stuck in 'pending' or 'confirmed' for > 15 minutes
    // This prevents inventory from being held indefinitely
    const CUTOFF_MS = 15 * 60 * 1000; // 15 minutes
    const cutoff = new Date(Date.now() - CUTOFF_MS).toISOString();

    // Query for stale orders via the orders API service
    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    const { data: staleOrders, error: fetchError } = await adminClient
      .from("hyperlocal_orders")
      .select("id, order_code, status, created_at, customer_id")
      .in("status", ["pending", "confirmed"])
      .lt("created_at", cutoff)
      .limit(50);

    if (fetchError) {
      console.error("[cron:auto-cancel] fetch error:", fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!staleOrders || staleOrders.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No stale orders found",
        cancelledCount: 0,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }

    // Cancel each stale order
    for (const order of staleOrders) {
      const { error: updateError } = await adminClient
        .from("hyperlocal_orders")
        .update({
          status: "cancelled",
          cancellation_reason: "Auto-cancelled: no merchant confirmation within 15 minutes",
          cancelled_at: new Date().toISOString(),
          cancelled_by: "system_cron",
        })
        .eq("id", order.id);

      if (!updateError) {
        cancelledCount++;
        // Release stock hold if applicable
        await adminClient
          .from("business_catalog_items")
          .update({ stock_hold: 0 })
          .eq("order_id", order.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Auto-cancelled ${cancelledCount} stale orders`,
      cancelledCount,
      totalScanned: staleOrders.length,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[cron:auto-cancel] unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Cron execution failed",
        cancelledCount,
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
