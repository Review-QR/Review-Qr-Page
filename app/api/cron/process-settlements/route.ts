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
  let processedBatches = 0;
  let totalAmount = 0;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // Find merchant settlement batches that are ready for processing
    // A batch is "ready" when it has settled splits and is marked as 'pending'
    const { data: readyBatches, error: fetchError } = await adminClient
      .from("merchant_settlement_batches")
      .select("id, business_id, net_amount, status, created_at")
      .eq("status", "pending")
      .lte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()) // at least 24h old
      .limit(20);

    if (fetchError) {
      console.error("[cron:settlements] fetch error:", fetchError);
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    if (!readyBatches || readyBatches.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No settlement batches ready for processing",
        processedBatches: 0,
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    }

    // Mark each batch as "processing" so admin UI knows it's being handled
    for (const batch of readyBatches) {
      const { error: updateError } = await adminClient
        .from("merchant_settlement_batches")
        .update({
          status: "processing",
          processing_started_at: new Date().toISOString(),
        })
        .eq("id", batch.id)
        .eq("status", "pending"); // guard against double-processing

      if (updateError) {
        console.error(`[cron:settlements] batch ${batch.id} update error:`, updateError);
        continue;
      }

      processedBatches++;
      totalAmount += Number(batch.net_amount) || 0;

      // In production, trigger actual bank transfer / Cashfree payout here
      // For now, mark as queued for admin review
      await adminClient
        .from("merchant_settlement_batches")
        .update({
          status: "queued_for_payout",
          processing_completed_at: new Date().toISOString(),
        })
        .eq("id", batch.id);
    }

    return NextResponse.json({
      success: true,
      message: `Processed ${processedBatches} settlement batches`,
      processedBatches,
      totalAmount: Math.round(totalAmount * 100) / 100,
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[cron:settlements] unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Cron execution failed",
        processedBatches,
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
