import { type NextRequest } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase-proxy";
import { merchantSessionCookieName } from "@/lib/supabase-config";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const isMerchantRequest =
    pathname === "/merchant" || pathname.startsWith("/merchant/");
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
