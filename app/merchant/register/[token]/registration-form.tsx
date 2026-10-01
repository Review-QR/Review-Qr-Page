"use client";

import { useActionState } from "react";
import { registerMerchantFromInvite, type MerchantRegistrationState } from "./actions";

const initialState: MerchantRegistrationState = { success: false, message: "" };
const inputClass = "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3.5 text-base text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100";

export default function MerchantInviteRegistrationForm({ token, businessId }: { token: string; businessId: string }) {
  const [state, formAction, pending] = useActionState(registerMerchantFromInvite, initialState);

  return (
    <form action={formAction} className="mt-6 space-y-5">
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="businessId" value={businessId} />
      <label className="block text-sm font-semibold text-slate-800">
        Create Password
        <input name="password" type="password" autoComplete="new-password" minLength={8} maxLength={64} required className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Confirm Password
        <input name="confirmation" type="password" autoComplete="new-password" minLength={8} maxLength={64} required className={inputClass} />
      </label>
      <p className="-mt-2 text-xs leading-5 text-slate-500">Use 8–64 characters with at least one letter and one number.</p>
      <button type="submit" disabled={pending} className="min-h-12 w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-800 disabled:cursor-wait disabled:opacity-60">
        {pending ? "Creating account…" : "Create Merchant Account"}
      </button>
      {state.message && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{state.message}</p>}
      <p className="text-center text-sm text-slate-500">After registration, sign in using your Business ID and password.</p>
    </form>
  );
}
