"use server";

import { redirect } from "next/navigation";
import { createSupabaseActionClient } from "@/lib/supabase-server";

export type SignInState = {
  message: string;
};

export async function signInAction(
  _previousState: SignInState,
  formData: FormData
): Promise<SignInState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { message: "Email and password are required." };
  }

  let supabase;
  try {
    supabase = await createSupabaseActionClient();
  } catch {
    return { message: "Unable to sign in. Please try again." };
  }

  let user;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        message: "Sign-in failed. Check your email and password, then try again.",
      };
    }

    user = data.user;
  } catch {
    return { message: "Unable to sign in. Please try again." };
  }

  let admin;
  try {
    const result = await supabase
      .from("admin_users")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("is_active", true)
      .maybeSingle();

    if (result.error) {
      await supabase.auth.signOut();
      return { message: "Unable to verify administrator access. Please try again." };
    }

    admin = result.data;
  } catch {
    await supabase.auth.signOut();
    return { message: "Unable to verify administrator access. Please try again." };
  }

  if (!admin) {
    await supabase.auth.signOut();
    return {
      message:
        "Your account does not have active administrator access. Contact an administrator.",
    };
  }

  redirect("/");
}
