"use server";

import { headers } from "next/headers";
import { createSupabaseActionClient } from "@/lib/supabase-server";
import {
  ADMIN_RECOVERY_MESSAGE,
  authorizedPreviewOrigin,
  recoveryCallbackUrl,
  requestAdminPasswordRecovery,
  type RecoveryClient,
} from "@/lib/admin-password-recovery";

export type RecoveryRequestState = { message: string };

export async function requestRecoveryAction(
  _previousState: RecoveryRequestState,
  formData: FormData
): Promise<RecoveryRequestState> {
  const email = String(formData.get("email") ?? "").trim();
  const requestHeaders = await headers();
  const origin = authorizedPreviewOrigin(
    {
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
      VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    },
    requestHeaders.get("origin")
  );

  if (!origin || !email || email.length > 320) {
    return { message: ADMIN_RECOVERY_MESSAGE };
  }

  try {
    const supabase = await createSupabaseActionClient();
    const message = await requestAdminPasswordRecovery(
      supabase as unknown as RecoveryClient,
      email,
      recoveryCallbackUrl(origin)
    );
    return { message };
  } catch {
    return { message: ADMIN_RECOVERY_MESSAGE };
  }
}
