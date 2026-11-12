import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { supabasePublishableKey, supabaseUrl } from "@/lib/supabase-config";

async function createSupabaseClient(writeCookies: boolean) {
  const cookieStore = await cookies();

  return createServerClient(
    supabaseUrl,
    supabasePublishableKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },

        setAll(cookiesToSet) {
          const applyCookies = () => {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          };

          if (writeCookies) {
            applyCookies();
            return;
          }

          try {
            applyCookies();
          } catch {
            // Server Components cannot always write cookies.
            // Proxy refreshes the session when needed.
          }
        },
      },
    }
  );
}

export async function createSupabaseServerClient() {
  return createSupabaseClient(false);
}

export async function createSupabaseActionClient() {
  return createSupabaseClient(true);
}

export async function getActiveAdminContext(): Promise<{
  userId: string;
  email: string | null;
} | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error: authError } = await supabase.auth.getClaims();
  const userId = data?.claims.sub;
  if (authError || !userId) return null;

  const { data: admin, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userId)
    .eq("is_active", true)
    .maybeSingle();

  if (adminError || !admin) return null;
  const email = typeof data?.claims.email === "string" ? data.claims.email : null;
  return { userId, email };
}

export async function requireActiveAdmin() {
  const admin = await getActiveAdminContext();
  if (!admin) redirect("/login?error=not_admin");
}
