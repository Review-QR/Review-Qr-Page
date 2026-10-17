"use client";

import { useState } from "react";
import { createPreviewSandboxOrder } from "./actions";

export default function PreviewSandboxOrderButton() {
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Awaited<ReturnType<typeof createPreviewSandboxOrder>> | null>(null);

  async function createOrder() {
    if (busy || !window.confirm("Create or retrieve the single INR 29 Cashfree Sandbox test order for this Preview merchant? No checkout or payment will start.")) return;
    setBusy(true);
    setResult(null);
    try {
      setResult(await createPreviewSandboxOrder());
    } catch {
      setResult({ success: false, reason: "unavailable" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-5">
      <button type="button" disabled={busy} onClick={() => void createOrder()} className="rounded-xl bg-amber-700 px-5 py-3 font-bold text-white disabled:opacity-50">
        {busy ? "Creating Sandbox order…" : "Authorize one Sandbox order"}
      </button>
      {result?.success && (
        <p role="status" className="mt-4 rounded-lg bg-emerald-50 p-4 text-sm text-emerald-900">
          Sandbox order ready. Order ID: <code className="font-mono">{result.orderId}</code>. No checkout was started.
        </p>
      )}
      {result && !result.success && (
        <p role="status" className="mt-4 rounded-lg bg-slate-100 p-4 text-sm text-slate-700">
          {result.reason === "rate_limited" ? "Please wait before retrying." : "Sandbox order creation is unavailable for this account or deployment."}
        </p>
      )}
    </div>
  );
}
