import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  merchantSessionCookieName,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase-config";

async function createMerchantClient(writeCookies: boolean) {
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabasePublishableKey, {
    cookieOptions: {
      name: merchantSessionCookieName,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    },
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        if (!writeCookies) return;
        for (const { name, value, options } of cookiesToSet) {
          cookieStore.set(name, value, options);
        }
      },
    },
  });
}

export function createMerchantServerClient() {
  return createMerchantClient(false);
}

export function createMerchantActionClient() {
  return createMerchantClient(true);
}
