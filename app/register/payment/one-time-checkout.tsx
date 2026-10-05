"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createTrustitOneTimeCheckout, verifyTrustitOneTimePayment } from "../actions";

type CashfreeCheckoutResult = {
  error?: unknown;
  redirect?: unknown;
  paymentDetails?: unknown;
};
type CashfreeSdk = (options: { mode: "sandbox" }) => {
  checkout(options: { paymentSessionId: string; redirectTarget: "_modal" }): Promise<CashfreeCheckoutResult>;
};
type VerificationState = "idle" | "checking" | "pending" | "failed" | "error";

declare global {
  interface Window {
    Cashfree?: CashfreeSdk;
  }
}

let sdkLoading: Promise<void> | null = null;

function loadSdk() {
  if (window.Cashfree) return Promise.resolve();
  if (!sdkLoading) {
    sdkLoading = new Promise<void>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
      script.async = true;
      script.onload = () => window.Cashfree ? resolve() : reject(new Error("Cashfree checkout is unavailable."));
      script.onerror = () => reject(new Error("Cashfree checkout is unavailable."));
      document.head.appendChild(script);
    }).catch((error) => {
      sdkLoading = null;
      throw error;
    });
  }
  return sdkLoading;
}

const POLL_INTERVAL_MS = 2_500;
const POLL_WINDOW_MS = 60_000;
const ORDER_ID_PATTERN = /^rqr_[a-f0-9]{32}$/;

export default function OneTimeCheckout({
  initialOrderId,
  autoVerifyOrderId,
}: {
  initialOrderId: string | null;
  autoVerifyOrderId: string | null;
}) {
  const router = useRouter();
  const [orderId, setOrderId] = useState(initialOrderId ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [verificationState, setVerificationState] = useState<VerificationState>("idle");
  const operationInProgress = useRef(false);
  const mounted = useRef(false);
  const startupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const delayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolveDelay = useRef<(() => void) | null>(null);

  function wait(ms: number) {
    return new Promise<void>((resolve) => {
      resolveDelay.current = resolve;
      delayTimer.current = setTimeout(() => {
        delayTimer.current = null;
        resolveDelay.current = null;
        resolve();
      }, ms);
    });
  }

  async function pollPaymentStatus(id: string, automatic: boolean) {
    const deadline = Date.now() + POLL_WINDOW_MS;
    setVerificationState("checking");
    setMessage("");

    while (mounted.current) {
      let result;
      try {
        result = await verifyTrustitOneTimePayment(id);
      } catch {
        result = { success: false as const, status: "pending" as const, message: "Payment confirmation is still pending." };
      }

      if (!mounted.current) return;
      if (result.success) {
        setVerificationState("idle");
        router.replace("/merchant/dashboard");
        router.refresh();
        return;
      }
      if (result.status === "failed") {
        setVerificationState("failed");
        setMessage("Payment was not completed. You can try again.");
        return;
      }
      if (result.status === "error") {
        setVerificationState("error");
        setMessage(result.message);
        return;
      }
      if (!automatic) {
        setVerificationState("pending");
        setMessage("Payment confirmation is still pending. Please wait or use Recover & Check again.");
        return;
      }
      const remaining = deadline - Date.now();
      if (remaining <= 0) {
        setVerificationState("pending");
        setMessage("Payment confirmation is taking a little longer. Please wait or use Recover & Check.");
        return;
      }
      await wait(Math.min(POLL_INTERVAL_MS, remaining));
    }
  }

  async function verifyWithLock(id: string, automatic: boolean, lockAlreadyHeld = false) {
    if (!ORDER_ID_PATTERN.test(id)) return;
    if (!lockAlreadyHeld) {
      if (operationInProgress.current) return;
      operationInProgress.current = true;
      setBusy(true);
    }
    try {
      await pollPaymentStatus(id, automatic);
    } finally {
      if (!lockAlreadyHeld) {
        operationInProgress.current = false;
        if (mounted.current) setBusy(false);
      }
    }
  }

  useEffect(() => {
    mounted.current = true;
    startupTimer.current = setTimeout(() => {
      startupTimer.current = null;
      if (!mounted.current) return;
      if (initialOrderId) setOrderId(initialOrderId);
      const orderToVerify = autoVerifyOrderId ?? initialOrderId;
      if (orderToVerify) void verifyWithLock(orderToVerify, true);
    }, 0);

    return () => {
      mounted.current = false;
      if (startupTimer.current) clearTimeout(startupTimer.current);
      startupTimer.current = null;
      if (delayTimer.current) clearTimeout(delayTimer.current);
      delayTimer.current = null;
      resolveDelay.current?.();
      resolveDelay.current = null;
    };
  }, [initialOrderId, autoVerifyOrderId]);

  async function start() {
    if (operationInProgress.current) return;
    operationInProgress.current = true;
    setBusy(true);
    setVerificationState("idle");
    setMessage("");
    let checkoutStarted = false;
    let activeOrderId = "";

    try {
      const result = await createTrustitOneTimeCheckout();
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      if (result.orderId) {
        activeOrderId = result.orderId;
        setOrderId(result.orderId);
      }
      if (!result.orderId || !result.paymentSessionId) {
        setMessage("An existing payment is saved. Use Recover & Check to verify it, or finish its checkout if you already opened it.");
        return;
      }

      await loadSdk();
      if (!window.Cashfree) throw new Error("Cashfree checkout is unavailable.");
      checkoutStarted = true;
      await window.Cashfree({ mode: "sandbox" }).checkout({
        paymentSessionId: result.paymentSessionId,
        redirectTarget: "_modal",
      });
      await verifyWithLock(result.orderId, true, true);
    } catch {
      if (checkoutStarted && activeOrderId) {
        await verifyWithLock(activeOrderId, true, true);
      } else if (mounted.current) {
        setVerificationState("error");
        setMessage("Checkout could not be completed. If you submitted payment, use Recover & Check before trying again.");
      }
    } finally {
      operationInProgress.current = false;
      if (mounted.current) setBusy(false);
    }
  }

  async function recover() {
    if (operationInProgress.current) return;
    await verifyWithLock(orderId, false);
  }

  return (
    <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-5">
      <h3 className="font-bold text-slate-900">Pay Once</h3>
      <p className="mt-1 text-sm text-slate-600">Pay for 30 days of service. Your business and QR activate after the payment is verified.</p>
      {orderId && <label className="mt-4 block text-sm font-medium">Payment reference<input className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm shadow-sm" value={orderId} readOnly /></label>}
      <div className="mt-4 flex flex-wrap gap-3">
        <button type="button" disabled={busy} onClick={() => void start()} className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 px-5 py-3 font-bold text-white shadow-[0_12px_24px_-14px_rgba(234,88,12,0.45)] disabled:opacity-50">{busy ? "Please wait…" : "Continue to Cashfree"}</button>
        {orderId && <button type="button" disabled={busy} onClick={() => void recover()} className="rounded-2xl border border-slate-200 bg-white px-5 py-3 font-bold text-slate-700 shadow-sm disabled:opacity-50">Recover &amp; Check</button>}
      </div>
      {verificationState === "checking" && (
        <div role="status" aria-live="polite" className="mt-5 flex gap-3 rounded-xl border border-blue-200 bg-white p-4 text-sm text-slate-700">
          <span aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-blue-700 border-r-transparent motion-reduce:animate-none" />
          <div><p className="font-semibold text-slate-900">Payment confirmation in progress…</p><p className="mt-1">After confirmation, you will be redirected to your Merchant Dashboard automatically.</p></div>
        </div>
      )}
      {message && verificationState !== "checking" && <p role="status" aria-live="polite" className={`mt-4 rounded-xl px-4 py-3 text-sm ${verificationState === "failed" || verificationState === "error" ? "bg-rose-50 text-rose-800" : "bg-white text-slate-700"}`}>{message}</p>}
    </div>
  );
}
