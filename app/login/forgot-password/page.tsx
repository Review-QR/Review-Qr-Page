"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  requestRecoveryAction,
  type RecoveryRequestState,
} from "./actions";

const initialState: RecoveryRequestState = { message: "" };

export default function ForgotPasswordPage() {
  const [state, formAction, pending] = useActionState(
    requestRecoveryAction,
    initialState
  );

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Reset admin password</h1>
        <p className="mt-2 text-sm text-slate-600">
          Enter your admin email. If recovery is available for the account,
          instructions will be sent to that address.
        </p>
        <form action={formAction} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700" htmlFor="recovery-email">
            Email
          </label>
          <input
            id="recovery-email"
            type="email"
            name="email"
            autoComplete="email"
            maxLength={320}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {pending ? "Sending…" : "Send recovery instructions"}
          </button>
        </form>
        {state.message && (
          <p className="mt-4 text-sm text-slate-700" role="status" aria-live="polite">
            {state.message}
          </p>
        )}
        <Link href="/login" className="mt-6 inline-block text-sm text-blue-700 underline">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
