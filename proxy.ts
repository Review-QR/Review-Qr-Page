import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  merchantSessionCookieName,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase-config";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  applyCorsHeaders,
  handleCorsPreflight,
} from "@/lib/auth-cors";
import { constantTimeEqual } from "@/lib/auth-api-guards";

const PUBLIC_MERCHANT_PATHS = [
  "/merchant",
  "/merchant/login",
  "/merchant/register",
];

function isPublicMerchantPage(request: NextRequest): boolean {
  const { pathname } = request.nextUrl;
  return PUBLIC_MERCHANT_PATHS.some(
    (p) => pathname === p || (p !== "/merchant" && pathname.startsWith(`${p}/`))
  );
}

function isPublicMerchantApi(pathname: string): boolean {
  return (
    pathname === "/api/merchant/auth" ||
    pathname.startsWith("/api/merchant/auth/")
  );
}

function buildReportOnlyCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV !== "production";
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'unsafe-eval' https://sdk.cashfree.com`
    : `'self' 'nonce-${nonce}' https://sdk.cashfree.com`;

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' data: https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com https://*.tile.openstreetmap.org https://maps.gstatic.com https://*.googleapis.com",
    "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://sdk.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com https://nominatim.openstreetmap.org https://router.project-osrm.org https://maps.googleapis.com",
    "frame-src 'self' https://sdk.cashfree.com https://api.cashfree.com https://sandbox.cashfree.com",
    "object-src 'none'",
    "base-uri 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
}

function createProxySupabaseClient(
  request: NextRequest,
  responseRef: { current: NextResponse },
  cookieName?: string
) {
  return createServerClient(supabaseUrl, supabasePublishableKey, {
    ...(cookieName ? { cookieOptions: { name: cookieName } } : {}),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        const nextHeaders = new Headers(request.headers);
        responseRef.current = NextResponse.next({
          request: { headers: nextHeaders },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          responseRef.current.cookies.set(name, value, options);
        });
      },
    },
  });
}

async function hasActiveAdminClaim(
  claims: Record<string, unknown>
): Promise<boolean> {
  const userId = typeof claims.sub === "string" ? claims.sub : "";
  const email =
    typeof claims.email === "string" ? claims.email.trim().toLowerCase() : "";
  if (!userId && !email) return false;

  const adminClient = createSupabaseAdminClient();
  const { data, error } = await adminClient
    .from("admin_users")
    .select("user_id, email, is_active")
    .eq("is_active", true);

  if (error || !data) return false;
  return data.some(
    (row) =>
      (userId && row.user_id === userId) ||
      (email && typeof row.email === "string" && row.email.trim().toLowerCase() === email)
  );
}

async function hasActiveMerchantUser(userId: string): Promise<boolean> {
  if (!userId) return false;
  const adminClient = createSupabaseAdminClient();
  const { data: account } = await adminClient
    .from("merchant_accounts")
    .select("business_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!account?.business_id) return false;

  const { data: business } = await adminClient
    .from("businesses")
    .select("id, merchant_status, deleted_at")
    .eq("id", account.business_id)
    .is("deleted_at", null)
    .maybeSingle();

  return Boolean(business && business.merchant_status === "active");
}

function unauthorizedApiResponse(
  request: NextRequest,
  message: string,
  status = 401
): NextResponse {
  const res = NextResponse.json({ success: false, error: message }, { status });
  return applyCorsHeaders(res, request.headers.get("origin"));
}

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const origin = request.headers.get("origin");
  const isApiRequest = pathname.startsWith("/api/");

  // 1. Handle CORS preflight cleanly for all API endpoints
  if (isApiRequest && request.method === "OPTIONS") {
    return handleCorsPreflight(request);
  }

  // 2. Fail-closed CRON_SECRET verification for /api/cron/*
  if (pathname === "/api/cron" || pathname.startsWith("/api/cron/")) {
    const cronSecret = (process.env.CRON_SECRET || "").trim();
    const authHeader = request.headers.get("authorization") || "";
    if (!cronSecret || !constantTimeEqual(authHeader, `Bearer ${cronSecret}`)) {
      return unauthorizedApiResponse(request, "Unauthorized cron invocation.", 401);
    }
    return applyCorsHeaders(NextResponse.next(), origin);
  }

  const requestHeaders = new Headers(request.headers);
  let nonce: string | null = null;
  if (!isApiRequest) {
    nonce = btoa(crypto.randomUUID());
    requestHeaders.set("x-nonce", nonce);
  }

  const responseRef = {
    current: NextResponse.next({
      request: { headers: requestHeaders },
    }),
  };

  // 3. Fail-closed gate for /admin/*, /api/hyperlocal/admin/*, and internal preview/test consoles
  const PROTECTED_INTERNAL_PATHS = [
    "/businesses",
    "/qr-codes",
    "/merchant-preview",
    "/rider-app",
    "/rider-preview",
    "/test-flight",
  ];
  const isProtectedInternalPage = PROTECTED_INTERNAL_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const isAdminPage = pathname === "/admin" || pathname.startsWith("/admin/") || isProtectedInternalPage;
  const isAdminApi = pathname.startsWith("/api/hyperlocal/admin/");
  if (isAdminPage || isAdminApi) {
    try {
      const supabase = createProxySupabaseClient(request, responseRef);
      const { data, error } = await supabase.auth.getClaims();
      const claims = data?.claims as Record<string, unknown> | undefined;

      if (error || !claims?.sub) {
        if (isAdminApi) {
          return unauthorizedApiResponse(request, "Unauthorized: admin session required.", 401);
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }

      const isActiveAdmin = await hasActiveAdminClaim(claims);
      if (!isActiveAdmin) {
        if (isAdminApi) {
          return unauthorizedApiResponse(request, "Forbidden: active admin role required.", 403);
        }
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("error", "not_admin");
        return NextResponse.redirect(loginUrl);
      }
    } catch {
      if (isAdminApi) {
        return unauthorizedApiResponse(request, "Unauthorized: session check failed.", 401);
      }
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 4. Fail-closed gate for protected /merchant/* and /api/merchant/*
  const isMerchantPage =
    (pathname === "/merchant" || pathname.startsWith("/merchant/")) &&
    !isPublicMerchantPage(request);
  const isMerchantApi =
    pathname.startsWith("/api/merchant/") && !isPublicMerchantApi(pathname);
  const isRegisterPage =
    pathname === "/register" || pathname.startsWith("/register/");

  if (isMerchantPage || isMerchantApi || isRegisterPage) {
    try {
      const supabase = createProxySupabaseClient(
        request,
        responseRef,
        merchantSessionCookieName
      );

      let userId: string | null = null;
      const authHeader = request.headers.get("authorization") || "";
      const bearerToken = authHeader.toLowerCase().startsWith("bearer ")
        ? authHeader.slice(7).trim()
        : "";

      if (bearerToken && isMerchantApi) {
        const { data: userData, error: userErr } = await supabase.auth.getUser(bearerToken);
        if (!userErr && userData?.user?.id) {
          userId = userData.user.id;
        }
      } else {
        const { data, error } = await supabase.auth.getClaims();
        if (!error && typeof data?.claims?.sub === "string") {
          userId = data.claims.sub;
        }
      }

      if ((isMerchantPage || isMerchantApi) && !userId) {
        if (isMerchantApi) {
          return unauthorizedApiResponse(
            request,
            "Unauthorized: active merchant session required.",
            401
          );
        }
        const loginUrl = new URL("/merchant/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if ((isMerchantPage || isMerchantApi) && userId) {
        const activeMerchant = await hasActiveMerchantUser(userId);
        if (!activeMerchant) {
          if (isMerchantApi) {
            return unauthorizedApiResponse(
              request,
              "Forbidden: merchant account inactive or missing.",
              403
            );
          }
          return NextResponse.redirect(new URL("/merchant/login", request.url));
        }
      }
    } catch {
      if (isMerchantApi) {
        return unauthorizedApiResponse(
          request,
          "Unauthorized: merchant session check failed.",
          401
        );
      }
      if (isMerchantPage) {
        return NextResponse.redirect(new URL("/merchant/login", request.url));
      }
    }
  } else if (
    pathname === "/merchant" ||
    pathname.startsWith("/merchant/") ||
    pathname === "/merchant/login"
  ) {
    // Best-effort session cookie refresh on public merchant pages
    try {
      const supabase = createProxySupabaseClient(
        request,
        responseRef,
        merchantSessionCookieName
      );
      await supabase.auth.getClaims();
    } catch {
      // Ignore refresh failure on public login/onboarding pages
    }
  }

  if (isApiRequest) {
    return applyCorsHeaders(responseRef.current, origin);
  }

  if (nonce) {
    responseRef.current.headers.set(
      "Content-Security-Policy-Report-Only",
      buildReportOnlyCsp(nonce)
    );
  }

  return responseRef.current;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
