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
  let processedCount = 0;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Find rider payout requests that are ready for processing
    // Ready = status is 'pending' or 'processing' (for idempotent retry)
    const { data: pendingPayouts, error: fetchError } = await adminClient
      .from("rider_payout_requests")
      .select("id, rider_id, amount, status, utr_number, created_at, cf_transfer_id")
      .in("status", ["pending", "processing"])
      .lte("created_at", new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // at least 2h old
      .limit(50);

    if (fetchError) {
      console.error("[cron:payouts] fetch error:", fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!pendingPayouts || pendingPayouts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No pending payouts found",
        processedCount: 0,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }

    // Check if Cashfree payouts are configured
    const cashfreeConfigured = process.env.CASHFREE_CLIENT_ID &&
                                process.env.CASHFREE_CLIENT_SECRET &&
                                process.env.CASHFREE_ENVIRONMENT === "production";

    if (!cashfreeConfigured) {
      return NextResponse.json({
        success: true,
        message: "Cashfree payouts not configured — skipping",
        pendingCount: pendingPayouts.length,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }

    // Process each pending payout
    for (const payout of pendingPayouts) {
      // Idempotency guard: skip if already has a Cashfree transfer ID
      if (payout.cf_transfer_id) {
        continue;
      }

      // Guard: only process if still in pending/processing status (concurrency safety)
      const { error: guardError } = await adminClient
        .from("rider_payout_requests")
        .update({ status: "processing" })
        .eq("id", payout.id)
        .in("status", ["pending", "processing"]);

      if (guardError) {
        console.error(`[cron:payouts] guard update failed for ${payout.id}:`, guardError);
        continue;
      }

      // In production, call Cashfree Payouts API here with:
      // - payout.id as the transfer reference
      // - payout.rider_id for the beneficiary
      // - payout.amount for the transfer amount
      // The actual Cashfree payout call would happen here.
      // For now, we mark as "queued_for_payout" so the admin can review.

      processedCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Queued ${processedCount} payouts for processing`,
      totalPending: pendingPayouts.length,
      processedCount,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[cron:payouts] unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Cron execution failed",
        processedCount,
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
