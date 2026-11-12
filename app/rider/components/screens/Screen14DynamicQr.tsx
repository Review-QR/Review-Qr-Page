"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { TrustitNative } from "@/lib/native/trustit-native-service";

interface Screen14Props {
  orderId?: string;
  amount?: number;
  orderCode?: string;
  onPaymentReceived?: (meta?: { paymentMethod?: "online_cashfree"; cfPaymentId?: string }) => void;
  onBack?: () => void;
}

export default function Screen14DynamicQr({
  orderId = "",
  amount = 0,
  orderCode = "TR-LIVE",
  onPaymentReceived,
  onBack,
}: Screen14Props) {
  const [isLoadingQr, setIsLoadingQr] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [cfOrderId, setCfOrderId] = useState<string | null>(null);
  const [cfLinkId, setCfLinkId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const completedRef = useRef(false);

  const validAmount = Number(amount || 0);

  const buildHeaders = (): Record<string, string> => {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    try {
      const token = localStorage.getItem("trustit_rider_session_token");
      if (token) headers.Authorization = `Bearer ${token}`;
    } catch {}
    return headers;
  };

  const generateCashfreeQr = useCallback(async () => {
    if (!orderId) {
      setIsLoadingQr(false);
      setErrorMsg("No active order selected for Cashfree QR collection.");
      return;
    }
    setIsLoadingQr(true);
    setErrorMsg(null);
    try {
      const res = await TrustitNative.nativeFetch("/api/hyperlocal/rider/cod-qr", {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (!res.ok || !data?.success) {
        setErrorMsg(data?.error || "Could not generate Cashfree Dynamic QR.");
        return;
      }
      if (data.alreadyPaid) {
        if (!completedRef.current) {
          completedRef.current = true;
          setPaymentSuccess(true);
          onPaymentReceived?.({ paymentMethod: "online_cashfree" });
        }
        return;
      }
      setQrDataUrl(data.qrDataUrl || "");
      setPaymentUrl(data.paymentUrl || null);
      setCfOrderId(data.cfOrderId || null);
      setCfLinkId(data.cfLinkId || null);
    } catch {
      setErrorMsg("Network error connecting to Cashfree QR engine.");
    } finally {
      setIsLoadingQr(false);
    }
  }, [orderId, onPaymentReceived]);

  useEffect(() => {
    completedRef.current = false;
    setPaymentSuccess(false);
    generateCashfreeQr();
  }, [generateCashfreeQr]);

  const checkPaymentStatus = useCallback(
    async (manual = false) => {
      if (!orderId || completedRef.current) return;
      if (manual) setIsVerifying(true);
      try {
        const qs = new URLSearchParams({ orderId });
        if (cfOrderId) qs.set("cfOrderId", cfOrderId);
        if (cfLinkId) qs.set("cfLinkId", cfLinkId);
        const res = await TrustitNative.nativeFetch(
          `/api/hyperlocal/rider/cod-qr?${qs.toString()}`,
          { method: "GET", headers: buildHeaders() },
        );
        const data = await res.json();
        if (data?.paid && !completedRef.current) {
          completedRef.current = true;
          setPaymentSuccess(true);
          setTimeout(() => {
            onPaymentReceived?.({
              paymentMethod: "online_cashfree",
              cfPaymentId: data.cfPaymentId,
            });
          }, 700);
        } else if (manual) {
          setErrorMsg("Payment not received by Cashfree yet. Ask customer to scan QR and retry.");
        }
      } catch {
        if (manual) setErrorMsg("Unable to verify Cashfree payment status right now.");
      } finally {
        if (manual) setIsVerifying(false);
      }
    },
    [orderId, cfOrderId, cfLinkId, onPaymentReceived],
  );

  // Auto-poll Cashfree PG / webhook status every 3 seconds while QR is displayed
  useEffect(() => {
    if (!orderId || paymentSuccess || isLoadingQr || !qrDataUrl) return;
    const timer = setInterval(() => {
      checkPaymentStatus(false);
    }, 3000);
    return () => clearInterval(timer);
  }, [orderId, paymentSuccess, isLoadingQr, qrDataUrl, checkPaymentStatus]);

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-3.5 text-[#0F172A] font-sans select-none overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back to Handover</span>
          </button>
          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Cashfree Live QR
          </span>
        </div>

        {/* Amount & Title */}
        <div className="mt-2 text-center space-y-0.5">
          <span className="text-[9px] font-black uppercase tracking-wider text-[#0D47A1]">
            TRUSTIT CASHFREE UPI POS
          </span>
          <h2 className="text-sm font-black text-slate-900 leading-tight">
            Scan to Pay Exact Amount (₹{validAmount.toFixed(2)})
          </h2>
          <p className="text-[11px] text-slate-500">
            Customer scans with PhonePe, Google Pay, Paytm, or BHIM. Auto-verifies instantly.
          </p>
        </div>

        {errorMsg && (
          <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-2 text-[11px] font-bold text-rose-800 text-center">
            {errorMsg}
          </div>
        )}

        {/* Dynamic Scannable QR Terminal Card */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs text-center space-y-2">
          <div className="relative w-44 h-44 mx-auto bg-slate-950 rounded-xl p-2 shadow-xs flex flex-col items-center justify-center">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt="Cashfree Dynamic UPI QR Code"
                className="w-40 h-40 rounded-lg bg-white object-contain"
              />
            ) : (
              <div className="w-40 h-40 bg-white rounded-lg flex items-center justify-center text-xs font-bold text-slate-500 p-2">
                {isLoadingQr ? "Generating Cashfree QR..." : "QR Unavailable — Tap Retry"}
              </div>
            )}
          </div>

          <div className="text-center space-y-1">
            <p className="text-[10px] font-mono font-bold text-slate-700">
              {cfOrderId || cfLinkId || `Order Ref: ${orderCode}`}
            </p>
            {paymentUrl && (
              <a
                href={paymentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[10px] font-bold text-[#0D47A1] underline"
              >
                Open Cashfree UPI Link ↗
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Verification & Retry Actions */}
      <div className="pt-2 border-t border-slate-200 space-y-1.5">
        <button
          type="button"
          onClick={() => (qrDataUrl ? checkPaymentStatus(true) : generateCashfreeQr())}
          disabled={isVerifying || paymentSuccess || isLoadingQr}
          className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition ${
            paymentSuccess
              ? "bg-emerald-600 text-white"
              : isVerifying
              ? "bg-blue-300 text-white cursor-wait"
              : "bg-[#0D47A1] hover:bg-[#082b66] text-white active:scale-[0.98]"
          }`}
        >
          {paymentSuccess ? (
            <span>Cashfree Payment Verified ✓</span>
          ) : isVerifying ? (
            <span>Checking Cashfree Gateway...</span>
          ) : qrDataUrl ? (
            <span>Verify Cashfree Payment Status</span>
          ) : (
            <span>Retry Cashfree QR</span>
          )}
        </button>
      </div>
    </div>
  );
}
