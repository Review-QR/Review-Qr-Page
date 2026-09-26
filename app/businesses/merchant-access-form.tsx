"use client";

import { useActionState, useEffect, useState } from "react";
import {
  provisionMerchantAction,
  resetMerchantPasswordAction,
} from "./merchant-access-actions";

export default function MerchantAccessForm({
  businessId,
  merchantStatus,
  onSuccess,
}: {
  businessId: string;
  merchantStatus?: string | null;
  onSuccess?: () => void;
}) {
  const isPending = (merchantStatus ?? "pending").toLowerCase() === "pending";
  const action = isPending ? provisionMerchantAction : resetMerchantPasswordAction;
  const [password, setPassword] = useState("");
  const [state, formAction, submitting] = useActionState(action, {
    message: "",
    success: false,
  });

  useEffect(() => {
    if (state.success) {
      setPassword("");
      onSuccess?.();
    }
  }, [state, onSuccess]);

  return (
    <div className="min-w-56 space-y-2">
      <form action={formAction} className="flex min-w-56 gap-2">
        <input type="hidden" name="businessId" value={businessId} />
        <input
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          aria-label={isPending ? "Initial merchant password" : "New merchant password"}
          placeholder={isPending ? "Initial password" : "New password"}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-2 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={submitting}
          className="whitespace-nowrap rounded-lg border border-blue-200 px-3 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50 disabled:opacity-60"
        >
          {submitting ? "Saving..." : isPending ? "Activate" : "Reset"}
        </button>
      </form>
      {state.message && (
        <p className={`max-w-64 text-xs ${state.success ? "text-green-700" : "text-red-700"}`} role="status">
          {state.message}
        </p>
      )}
    </div>
  );
}
