"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseActionClient } from "@/lib/supabase-server";
import {
  authorizedPreviewOrigin,
  updateAdminRecoveryPassword,
  type RecoveryClient,
} from "@/lib/admin-password-recovery";

export type PasswordUpdateState = { message: string };

export async function updateRecoveryPasswordAction(
  _previousState: PasswordUpdateState,
  formData: FormData
): Promise<PasswordUpdateState> {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("confirmPassword") ?? "");
  const requestHeaders = await headers();
  const origin = authorizedPreviewOrigin(
    {
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
      VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    },
    requestHeaders.get("origin")
  );

  if (!origin) return { message: "Password update is unavailable for this deployment." };
  if (password.length < 12 || password !== confirmation) {
    return { message: "Use at least 12 characters and make both entries match." };
  }

  let updated = false;
  try {
    const supabase = await createSupabaseActionClient();
    updated = await updateAdminRecoveryPassword(
      supabase as unknown as RecoveryClient,
      password
    );
  } catch {
    updated = false;
  }

  if (!updated) return { message: "The recovery session is invalid or expired. Request a new link." };
  redirect("/admin");
}
