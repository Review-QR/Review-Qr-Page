import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseActionClient } from "@/lib/supabase-server";
import {
  authorizedPreviewOrigin,
  completeAdminRecovery,
  type RecoveryClient,
} from "@/lib/admin-password-recovery";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const origin = authorizedPreviewOrigin(
    {
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
      VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    },
    request.nextUrl.origin
  );
  if (!origin) return new Response(null, { status: 404 });

  const code = request.nextUrl.searchParams.get("code");
  let validRecovery = false;
  try {
    const supabase = await createSupabaseActionClient();
    validRecovery = await completeAdminRecovery(
      supabase as unknown as RecoveryClient,
      code
    );
  } catch {
    validRecovery = false;
  }

  const destination = new URL(
    validRecovery ? "/reset-password" : "/login?recovery=invalid",
    origin
  );
  const response = NextResponse.redirect(destination, { status: 303 });
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Referrer-Policy", "no-referrer");
  return response;
}
