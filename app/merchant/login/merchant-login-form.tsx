"use client";

import { useActionState } from "react";
import { merchantSignInAction } from "./actions";

export default function MerchantLoginForm() {
  const [state, formAction, pending] = useActionState(merchantSignInAction, {
    message: "",
  });

  return (
    <form action={formAction} className="mt-6 space-y-4">
      {state.message && (
        <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700" role="alert">
          {state.message}
        </p>
      )}
      <div>
        <label htmlFor="businessId" className="mb-1 block text-sm font-medium text-slate-700">
          Business ID
        </label>
        <input
          id="businessId"
          name="businessId"
          autoComplete="username"
          required
          maxLength={128}
          className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
        />
      </div>
      <div>
        <label htmlFor="merchantPassword" className="mb-1 block text-sm font-medium text-slate-700">
          Password
        </label>
        <input
          id="merchantPassword"
          name="password"
          type="password"
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
  );
}

