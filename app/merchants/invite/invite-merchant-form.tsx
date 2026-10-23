"use client";

import { useActionState, useState } from "react";
import { createMerchantInviteAction, type MerchantInviteActionState } from "./actions";

const initialState: MerchantInviteActionState = { success: false, message: "" };

type Business = { id: string; name: string; owner?: string | null; phone?: string | null };

export default function InviteMerchantForm({ businesses }: { businesses: Business[] }) {
  const [state, formAction, pending] = useActionState(createMerchantInviteAction, initialState);
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    if (!state.registrationUrl) return;
    await navigator.clipboard.writeText(state.registrationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div className="max-w-3xl">
      <form action={formAction} className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
        <label className="block text-sm font-semibold text-slate-800">
          Select pending merchant for invite
          <select name="businessId" required disabled={pending || businesses.length === 0} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100">
            <option value="">Choose a pending merchant…</option>
            {businesses.map((business) => (
              <option key={business.id} value={business.id}>
                {business.name} — {business.id}
              </option>
            ))}
          </select>
          {businesses.length === 0 && <p className="mt-2 text-xs text-slate-500">No eligible pending merchants without an active registration invitation.</p>}
        </label>
        <div className="flex flex-col gap-2 md:flex-row">
          <button type="submit" disabled={pending || businesses.length === 0} className="rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-50">
            {pending ? "Creating…" : "Create Registration Link"}
          </button>
          <button
            type="button"
            onClick={() => window.open("/register", "_blank", "noopener,noreferrer")}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 hover:border-slate-400 hover:bg-slate-50"
          >
            Open Merchant Registration ↗
          </button>
        </div>
      </form>
      <p className="mt-2 text-xs text-slate-500">Need the public signup page? Open Merchant Registration in a new tab.</p>

      {state.message && <p role={state.success ? "status" : "alert"} className={`mt-5 rounded-xl border px-4 py-3 text-sm ${state.success ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-rose-200 bg-rose-50 text-rose-800"}`}>{state.message}</p>}

      {state.registrationUrl && (
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">One-time registration link</p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <input readOnly value={state.registrationUrl} className="min-w-0 flex-1 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm text-slate-700" />
            <button type="button" onClick={copyLink} className="rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100">
              {copied ? "Copied" : "Copy Link"}
            </button>
          </div>
          <p className="mt-2 text-xs text-slate-600">Share this link privately with the merchant. Do not publish it.</p>
        </div>
      )}
    </div>
  );
}
