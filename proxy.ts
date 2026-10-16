import { NextResponse, type NextRequest } from "next/server";
import { resolveCashfreePreviewIngressDecision } from "@/lib/cashfree-preview-ingress";
import { updateSupabaseSession } from "@/lib/supabase-proxy";
import { merchantSessionCookieName } from "@/lib/supabase-config";
import { shouldSkipSupabaseSessionRefresh } from "@/lib/supabase-proxy-routing";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const ingressDecision = resolveCashfreePreviewIngressDecision({
    vercelEnvironment: process.env.VERCEL_ENV,
    vercelGitCommitRef: process.env.VERCEL_GIT_COMMIT_REF,
    cashfreeEnvironment: process.env.CASHFREE_ENVIRONMENT,
    cashfreeApiBaseUrl: process.env.CASHFREE_API_BASE_URL,
    requestHost: request.nextUrl.host,
    requestPath: pathname,
    requestMethod: request.method,
    webhookUrl: process.env.CASHFREE_WEBHOOK_URL,
    ingressEnabled: process.env.CASHFREE_PREVIEW_WEBHOOK_INGRESS_ENABLED,
    vercelUrl: process.env.VERCEL_URL,
    vercelBranchUrl: process.env.VERCEL_BRANCH_URL,
  });
  if (ingressDecision === "reject") {
    return new Response(null, {
      status: 404,
      headers: { "cache-control": "no-store" },
    });
  }
  if (ingressDecision === "allow") {
    // The webhook route authenticates the request with Cashfree's signature.
    return NextResponse.next({ request });
  }

  if (shouldSkipSupabaseSessionRefresh(pathname)) {
    return NextResponse.next();
  }

  const isMerchantRequest =
    pathname === "/merchant" || pathname.startsWith("/merchant/") ||
    pathname === "/register" || pathname.startsWith("/register/");
  return updateSupabaseSession(
    request,
    isMerchantRequest ? merchantSessionCookieName : undefined
  );
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
