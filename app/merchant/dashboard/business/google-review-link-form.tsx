"use client";

import { useActionState } from "react";
import { updateGoogleReviewLinkAction, type GoogleReviewLinkState } from "./actions";

const initialState: GoogleReviewLinkState = { success: false, message: "" };

export default function GoogleReviewLinkForm({ initialLink }: { initialLink: string }) {
  const [state, formAction, pending] = useActionState(updateGoogleReviewLinkAction, initialState);
  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      <label htmlFor="merchant-google-review-link" className="block text-sm font-semibold text-slate-800">
        Add or update your Google Review link
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id="merchant-google-review-link"
          name="reviewLink"
          type="url"
          inputMode="url"
          autoComplete="url"
          maxLength={2048}
          required
          defaultValue={initialLink}
          placeholder="https://g.page/r/…"
          className="min-h-11 min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
        />
        <button type="submit" disabled={pending} className="min-h-11 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 disabled:opacity-60">
          {pending ? "Saving…" : initialLink ? "Update link" : "Save link"}
        </button>
      </div>
      <p className="text-xs leading-5 text-slate-500">Use an HTTPS link from Google, g.page, or Google Maps short links.</p>
      {state.message && <p role={state.success ? "status" : "alert"} className={`text-sm ${state.success ? "text-emerald-700" : "text-rose-700"}`}>{state.message}</p>}
    </form>
  );
}
