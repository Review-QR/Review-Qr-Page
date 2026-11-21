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
  let cleanedCount = 0;

  try {
    const { createClient } = await import("@supabase/supabase-js");
    const adminClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    );

    // 1. Clean expired OTP records (> 24 hours old)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredOtps } = await adminClient
      .from("otp_records")
      .delete()
      .lt("created_at", oneDayAgo)
      .select("id");

    cleanedCount += expiredOtps?.length || 0;

    // 2. Clean expired checkout drafts (> 7 days old)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredDrafts } = await adminClient
      .from("checkout_drafts")
      .delete()
      .lt("created_at", sevenDaysAgo)
      .select("id");

    cleanedCount += expiredDrafts?.length || 0;

    // 3. Clean expired push notification tokens (> 90 days inactive)
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();

    const { data: expiredTokens } = await adminClient
      .from("push_notification_tokens")
      .delete()
      .lt("last_used_at", ninetyDaysAgo)
      .select("id");

    cleanedCount += expiredTokens?.length || 0;

    // 4. Clean old temporary files
    const { error: cleanupError } = await adminClient.rpc("cleanup_temp_files");

    return NextResponse.json({
      success: true,
      message: `Cleaned ${cleanedCount} expired records`,
      details: {
        otpRecords: expiredOtps?.length || 0,
        checkoutDrafts: expiredDrafts?.length || 0,
        pushTokens: expiredTokens?.length || 0,
        tempFiles: cleanupError ? "failed" : "completed",
      },
      durationMs: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    console.error("[cron:cleanup] unexpected error:", err);
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Cron execution failed",
        cleanedCount,
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
