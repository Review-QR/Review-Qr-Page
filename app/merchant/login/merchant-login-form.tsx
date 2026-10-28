"use client";

import { useActionState } from "react";
import { merchantSignInAction } from "./actions";

export default function MerchantLoginForm() {
  const [state, formAction, pending] = useActionState(merchantSignInAction, {
    message: "",
  });

  return (
    <form action={formAction} className="mt-4 space-y-3 text-left">
      {state.message && (
        <p className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 font-medium" role="alert">
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor="businessId" className="mb-1 block text-xs font-semibold text-slate-700">
          Business ID or verified mobile (+country code)
        </label>
        <input
          id="businessId"
          name="businessId"
          autoComplete="username"
          required
          maxLength={128}
          placeholder="e.g. biz_... or +919415..."
          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition"
        />
      </div>
      <div>
        <label htmlFor="merchantPassword" className="mb-1 block text-xs font-semibold text-slate-700">
          Password
        </label>
        <input
          id="merchantPassword"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
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
  );
}
