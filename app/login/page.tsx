"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { signInAction } from "./actions";
import { adminRecoveryLoginMessage } from "@/lib/admin-recovery-login-message";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, {
    message: "",
  });
  const [queryMessage, setQueryMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const error = params.get("error");
    const recovery = params.get("recovery");

    if (error === "not_admin") {
      setQueryMessage(
        "Your account does not have active administrator access. Contact an administrator."
      );
      return;
    }

    setQueryMessage(adminRecoveryLoginMessage(recovery) ?? "");
  }, []);
  const message = state.message || queryMessage;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl font-bold text-white">
            QR
          </div>

          <h1 className="text-2xl font-bold text-slate-900">
            Review-QR Admin
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Admin panel me sign in karein
          </p>
        </div>

        {message && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {message}
          </div>
        )}

        <form action={formAction} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              autoComplete="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <Link
          href="/login/forgot-password"
          className="mt-4 inline-block text-sm text-blue-700 underline"
        >
          Forgot your password?
        </Link>

        <p className="mt-6 text-center text-xs text-slate-400">
          Authorized Review-QR administrators only.
        </p>
      </div>
    </main>
  );
}
