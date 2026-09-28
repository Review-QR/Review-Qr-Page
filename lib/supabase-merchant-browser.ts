"use client";

import { createBrowserClient } from "@supabase/ssr";
import {
  merchantSessionCookieName,
  supabasePublishableKey,
  supabaseUrl,
} from "@/lib/supabase-config";

export function createMerchantBrowserClient() {
  return createBrowserClient(supabaseUrl, supabasePublishableKey, {
    cookieOptions: {
      name: merchantSessionCookieName,
      path: "/",
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: false,
    },
  });
}
