"use client";

import { useActionState, useEffect, useState } from "react";
import { signInAction } from "./actions";

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(signInAction, {
    message: "",
  });
  const [queryMessage, setQueryMessage] = useState("");

  useEffect(() => {
    const error = new URLSearchParams(window.location.search).get("error");

    if (error === "not_admin") {
      setQueryMessage(
        "Your account does not have active administrator access. Contact an administrator."
      );
    }
  }, []);
  const message = state.message || queryMessage;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4 sm:p-6">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm">
        <div className="mb-5 text-center">
          <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-lg font-black text-white">
            QR
          </div>

          <h1 className="text-lg font-bold text-slate-900">
            Review-QR Admin
          </h1>

          <p className="mt-1 text-xs text-slate-500">
            Admin panel me sign in karein
          </p>
        </div>

        {message && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 font-medium">
            {message}
          </div>
        )}

        <form action={formAction} className="space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Email
            </label>

            <input
              type="email"
              name="email"
              placeholder="admin@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="••••••••"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 transition shadow-xs"
          >
            {pending ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p className="mt-5 text-center text-[10px] text-slate-400">
          Authorized Review-QR administrators only.
        </p>
      </div>
    </main>
  );
}
