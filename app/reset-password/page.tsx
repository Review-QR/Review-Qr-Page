import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import {
  authorizedPreviewOrigin,
  hasActiveAdminSession,
  type RecoveryClient,
} from "@/lib/admin-password-recovery";
import { updateRecoveryPasswordAction } from "./actions";
import PasswordForm from "./password-form";

export const dynamic = "force-dynamic";

export default async function ResetPasswordPage() {
  const requestHeaders = await headers();
  const origin = authorizedPreviewOrigin(
    {
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF,
      VERCEL_BRANCH_URL: process.env.VERCEL_BRANCH_URL,
    },
    requestHeaders.get("host")
      ? `https://${requestHeaders.get("host")}`
      : null
  );
  if (!origin) notFound();

  const supabase = await createSupabaseServerClient();
  if (!(await hasActiveAdminSession(supabase as unknown as RecoveryClient))) {
    redirect("/login?recovery=invalid");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Choose a new admin password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Use at least 12 characters. The recovery link is one-time and expires.
        </p>
        <PasswordForm action={updateRecoveryPasswordAction} />
        <Link href="/login" className="mt-6 inline-block text-sm text-blue-700 underline">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}

function notFound(): never {
  redirect("/login?recovery=unavailable");
}
