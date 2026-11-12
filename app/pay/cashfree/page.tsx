"use client";

import React, { Suspense, useEffect, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";

function loadCashfreeScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).Cashfree) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://sdk.cashfree.com/js/v3/cashfree.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Cashfree SDK.")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Cashfree) resolve();
      else reject(new Error("Cashfree SDK unavailable."));
    };
    script.onerror = () => reject(new Error("Failed to load Cashfree SDK."));
    document.head.appendChild(script);
  });
}

function CashfreeHostedCheckoutInner() {
  const params = useSearchParams();
  const sessionId = params.get("sessionId") || "";
  const orderId = params.get("orderId") || params.get("order_id") || "";
  const mode = params.get("mode") === "production" ? "production" : "sandbox";
  const returned = params.get("returned") === "1" || (!sessionId && Boolean(orderId));

  const [status, setStatus] = useState<"launching" | "verifying" | "paid" | "pending" | "error">(
    returned ? "verifying" : sessionId ? "launching" : "error",
  );
  const [message, setMessage] = useState<string>(
    returned
      ? "Verifying your Cashfree UPI / Card payment..."
      : sessionId
        ? "Opening Cashfree Secure UPI Checkout..."
        : "Missing payment session details.",
  );

  const launchCheckout = useCallback(async () => {
    if (!sessionId) {
      setStatus("error");
      setMessage("Missing Cashfree payment session ID.");
      return;
    }
    try {
      setStatus("launching");
      setMessage("Connecting to Cashfree UPI / Card Gateway...");
      try {
        sessionStorage.setItem("trustit_cf_last", JSON.stringify({ sessionId, orderId, mode }));
      } catch {}
      await loadCashfreeScript();
      const cf = (window as any).Cashfree({ mode });
      await cf.checkout({
        paymentSessionId: sessionId,
        redirectTarget: "_self",
      });
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Could not launch Cashfree checkout.");
    }
  }, [sessionId, orderId, mode]);

  const verifyOrder = useCallback(async () => {
    if (!orderId) {
      setStatus("error");
      setMessage("Order ID is missing.");
      return;
    }
    setStatus("verifying");
    setMessage("Verifying payment status with Cashfree...");
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch(
          `/api/hyperlocal/payment/verify?orderId=${encodeURIComponent(orderId)}&_ts=${Date.now()}`,
          { cache: "no-store" },
        );
        const data = await res.json().catch(() => null);
        if (data?.status === "VERIFIED_SUCCESS") {
          setStatus("paid");
          setMessage("Payment verified! Please switch back to the Trustit Customer app to track your order.");
          return;
        }
        if (data?.status === "FAILED" || data?.status === "USER_DROPPED") {
          setStatus("pending");
          setMessage("Payment was cancelled or incomplete. Switch back to the Trustit Customer app to retry or switch to COD.");
          return;
        }
      } catch {}
      await new Promise((r) => setTimeout(r, 1500));
    }
    setStatus("pending");
    setMessage("Payment is still confirming. Switch back to the Trustit Customer app — it will sync automatically.");
  }, [orderId]);

  useEffect(() => {
    if (returned) {
      verifyOrder();
    } else if (sessionId) {
      launchCheckout();
    }
  }, [returned, sessionId, launchCheckout, verifyOrder]);

  return (
    <main className="min-h-screen bg-[#f4f6ff] flex items-center justify-center p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white border border-[#dae2fd] shadow-xl p-6 text-center space-y-4">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-[#003178] text-white flex items-center justify-center text-2xl font-black shadow-md">
          {status === "paid" ? "✓" : status === "error" ? "!" : "⚡"}
        </div>

        <div className="space-y-1">
          <div className="text-[10px] font-black uppercase tracking-widest text-[#006875]">
            Trustit Secure Checkout • Cashfree
          </div>
          <h1 className="text-base font-black text-[#131b2e]">
            {status === "paid"
              ? "Payment Confirmed"
              : status === "launching"
                ? "Opening Cashfree..."
                : status === "verifying"
                  ? "Confirming Payment..."
                  : status === "pending"
                    ? "Payment Pending"
                    : "Checkout Notice"}
          </h1>
          <p className="text-xs text-[#434652] leading-relaxed">{message}</p>
          {orderId && (
            <div className="text-[10.5px] font-mono text-[#737783] pt-1">Order: {orderId}</div>
          )}
        </div>

        {status === "launching" && sessionId && (
          <button
            type="button"
            onClick={launchCheckout}
            className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3 text-xs font-black text-white shadow-md"
          >
            Tap if Cashfree didn&apos;t open →
          </button>
        )}

        {(status === "paid" || status === "pending") && (
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                window.close();
                window.location.href = "/order";
              }}
              className="w-full rounded-2xl bg-[#059669] hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md"
            >
              Return to Trustit App →
            </button>
            {status === "pending" && orderId && (
              <button
                type="button"
                onClick={verifyOrder}
                className="w-full rounded-2xl border border-[#003178]/30 bg-[#f2f3ff] py-2.5 text-xs font-bold text-[#003178]"
              >
                🔄 Re-check Payment Status
              </button>
            )}
          </div>
        )}

        {status === "error" && (
          <button
            type="button"
            onClick={() => {
              if (sessionId) launchCheckout();
              else window.location.href = "/order";
            }}
            className="w-full rounded-2xl bg-[#003178] py-3 text-xs font-black text-white"
          >
            {sessionId ? "Retry Launch" : "Back to Trustit"}
          </button>
        )}
      </div>
    </main>
  );
}

export default function CashfreeHostedCheckoutPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#f4f6ff] flex items-center justify-center p-4 text-xs font-bold text-[#003178]">
          Loading Secure Cashfree Checkout...
        </main>
      }
    >
      <CashfreeHostedCheckoutInner />
    </Suspense>
  );
}
