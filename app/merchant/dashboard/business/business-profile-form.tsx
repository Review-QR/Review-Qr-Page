"use client";

import { useActionState } from "react";
import { saveBusinessProfileAction, type BusinessProfileActionState } from "./actions";

const initialState: BusinessProfileActionState = { ok: false, message: "" };
const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

export default function BusinessProfileForm({
  name,
  type,
  owner,
  address,
  phone,
  reviewLink,
}: {
  name: string;
  type: string | null;
  owner: string | null;
  address: string | null;
  phone: string | null;
  reviewLink: string | null;
}) {
  const [state, action, pending] = useActionState(saveBusinessProfileAction, initialState);
  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <label className="text-sm font-semibold text-slate-800">Business Name
        <input className={inputClass} name="name" defaultValue={name} maxLength={200} required autoComplete="organization" />
      </label>
      <label className="text-sm font-semibold text-slate-800">Business Type
        <input className={inputClass} name="type" defaultValue={type ?? ""} maxLength={120} required />
      </label>
      <label className="text-sm font-semibold text-slate-800">Owner / Merchant Name
        <input className={inputClass} name="owner" defaultValue={owner ?? ""} maxLength={200} required autoComplete="name" />
      </label>
      <label className="text-sm font-semibold text-slate-800">Registered Mobile
        <input className={inputClass} value={phone ?? "Not provided"} readOnly aria-describedby="merchant-phone-help" />
        <span id="merchant-phone-help" className="mt-1 block text-xs font-normal text-slate-500">This is the mobile linked to your sign-in. Contact support to change it securely.</span>
      </label>
      <label className="text-sm font-semibold text-slate-800 sm:col-span-2">Business Address
        <textarea className={`${inputClass} min-h-24 resize-y`} name="address" defaultValue={address ?? ""} maxLength={1000} required autoComplete="street-address" />
      </label>
      <label className="text-sm font-semibold text-slate-800 sm:col-span-2">Google Review Link <span className="font-normal text-slate-500">(Optional)</span>
        <input className={inputClass} name="reviewLink" type="url" inputMode="url" defaultValue={reviewLink ?? ""} maxLength={2048} placeholder="https://…" />
      </label>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
        <button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-[#a64c05] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#873d03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60">
          {pending ? "Saving…" : "Save Business Details"}
        </button>
        <p role={state.message ? "status" : undefined} aria-live="polite" className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>{state.message}</p>
      </div>
    </form>
  );
}
