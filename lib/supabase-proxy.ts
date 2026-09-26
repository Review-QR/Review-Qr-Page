import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-config";

/** Refresh Supabase's cookie session before Server Components read it. */
export async function updateSupabaseSession(
  request: NextRequest,
  cookieName?: string
) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabasePublishableKey, {
    ...(cookieName
      ? {
          cookieOptions: {
            name: cookieName,
            httpOnly: true,
            sameSite: "lax" as const,
            secure: process.env.NODE_ENV === "production",
            path: "/",
          },
        }
      : {}),
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        // Make refreshed cookies visible to Server Components in this request.
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        // Supabase requires returning the latest response so refreshed cookies
        // reach the browser and replace the session it sent with this request.
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
        for (const [name, value] of Object.entries(headers)) {
          response.headers.set(name, value);
        }
      },
    },
  });

  // getClaims verifies the JWT and refreshes it when it is close to expiry.
  // The route-level admin guard remains responsible for authorization.
  try {
    await supabase.auth.getClaims();
  } catch {
    // If Auth is temporarily unreachable, keep the response usable. Protected
    // pages still verify claims and active-admin access in their server guard.
  }

  return response;
}
