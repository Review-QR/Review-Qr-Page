"use client";

import { useActionState } from "react";
import type { PasswordUpdateState } from "./actions";

export default function PasswordForm({
  action,
}: {
  action: (
    previousState: PasswordUpdateState,
    formData: FormData
  ) => Promise<PasswordUpdateState>;
}) {
  const [state, formAction, pending] = useActionState(action, { message: "" });

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block text-sm font-medium text-slate-700" htmlFor="new-password">
        New password
      </label>
      <input
        id="new-password"
        type="password"
        name="password"
        autoComplete="new-password"
        minLength={12}
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
      />
      <label className="block text-sm font-medium text-slate-700" htmlFor="confirm-password">
        Confirm new password
      </label>
      <input
        id="confirm-password"
        type="password"
        name="confirmPassword"
        autoComplete="new-password"
        minLength={12}
        required
        className="w-full rounded-lg border border-slate-300 px-3 py-3 outline-none focus:border-blue-500"
      />
      {state.message && (
        <p className="text-sm text-slate-700" role="status" aria-live="polite">
          {state.message}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update password"}
      </button>
    </form>
  );
}
