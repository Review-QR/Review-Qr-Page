import { NextResponse } from "next/server";
import { runDailyOccasionAutoDispatcher } from "@/lib/messaging/fast2sms-dispatch";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Check optional CRON_SECRET or Admin authorization
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    // If CRON_SECRET is configured, enforce it
    return NextResponse.json({ message: "Unauthorized cron execution." }, { status: 401 });
  }

  try {
    const result = await runDailyOccasionAutoDispatcher();
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...result,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      {
        success: false,
        error: err instanceof Error ? err.message : "Cron execution failed",
      },
      { status: 500 }
    );
  }
}
