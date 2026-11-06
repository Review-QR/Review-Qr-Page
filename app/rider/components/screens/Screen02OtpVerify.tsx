"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRiderAuth } from "@/app/rider/hooks/useRiderAuth";
import type { DeliveryRider } from "@/lib/hyperlocal/types";

interface Screen02Props {
  phone?: string;
  channel?: "sms" | "whatsapp";
  previewOtp?: string;
  onVerified?: (otp: string, rider?: DeliveryRider | null) => void;
  onResend?: () => void;
  onBack?: () => void;
}

export default function Screen02OtpVerify({
  phone = "",
  channel = "whatsapp",
  previewOtp,
  onVerified,
  onResend,
  onBack,
}: Screen02Props) {
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState<number>(30);
  const [localError, setLocalError] = useState<string | null>(null);
  const { verifyPhoneOtp, sendPhoneOtp, isLoading, error } = useRiderAuth();

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Focus first empty box on mount
  useEffect(() => {
    const firstEmptyIndex = digits.findIndex((d) => !d);
    const targetIdx = firstEmptyIndex === -1 ? 0 : firstEmptyIndex;
    inputRefs.current[targetIdx]?.focus();
  }, []);

  // 30s Countdown timer
  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      const updated = [...digits];
      updated[index] = "";
      setDigits(updated);
      return;
    }

    // Support pasting a 6-digit OTP code into any box
    if (clean.length > 1) {
      const pasted = clean.slice(0, 6).split("");
      const updated = [...digits];
      pasted.forEach((ch, idx) => {
        if (index + idx < 6) updated[index + idx] = ch;
      });
      setDigits(updated);
      setLocalError(null);
      const nextFocus = Math.min(5, index + pasted.length);
      inputRefs.current[nextFocus]?.focus();
      return;
    }

    const updated = [...digits];
    updated[index] = clean;
    setDigits(updated);
    setLocalError(null);

    // Auto-advance to next box
    if (index < 5 && clean) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fullOtp = digits.join("");

  const handleVerify = async () => {
    if (fullOtp.length < 6) {
      setLocalError("कृपया 6 अंकों का OTP दर्ज करें (Enter 6-digit OTP).");
      return;
    }
    setLocalError(null);

    const res = await verifyPhoneOtp(phone, fullOtp);
    if (res.success) {
      onVerified?.(fullOtp, res.rider);
    } else {
      setLocalError(res.error || "अमान्य OTP कोड. कृपया पुनः जांचें (Invalid OTP code).");
    }
  };

  const handleResendOtp = async () => {
    setCountdown(30);
    setLocalError(null);
    await sendPhoneOtp(phone, channel);
    onResend?.();
  };

  return (
    <div className="w-full h-full min-h-[560px] bg-[#FAF8FF] flex flex-col justify-between p-4 text-[#0F172A] font-sans select-none overflow-y-auto">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 2 of 6</span>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3.5 space-y-0.5">
          <h2 className="text-base font-black text-slate-900 leading-tight">Verify WhatsApp Mobile OTP</h2>
          <p className="text-xs text-slate-500 leading-snug">
            Sent via <strong className="text-emerald-700">WhatsApp</strong> to{" "}
            <strong className="text-slate-900 font-mono">{phone ? `+91 ${phone}` : "your mobile number"}</strong>
          </p>
        </div>

        {/* 6 Auto-Next Digit Boxes with Forced Numeric Keyboard */}
        <div className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-4">
          <div className="flex justify-between gap-1.5 sm:gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                maxLength={6}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                onFocus={(e) => e.target.select()}
                className={`w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-black font-mono rounded-xl border transition ${
                  digit
                    ? "border-[#0D47A1] bg-blue-50/40 text-slate-950 font-black"
                    : "border-slate-300 bg-slate-50 text-slate-800"
                } focus:border-[#0D47A1] focus:bg-blue-50/50 focus:outline-none focus:ring-2 focus:ring-[#0D47A1]/20`}
              />
            ))}
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-bold text-center">
              ⚠️ {localError || error}
            </div>
          )}

          {/* Resend Countdown Bar */}
          <div className="flex items-center justify-between text-xs pt-1 px-1">
            {countdown > 0 ? (
              <span className="text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                <span>⏳ पुनः OTP भेजें (Resend):</span>
                <strong className="font-mono text-[#0D47A1] font-black">{countdown}s</strong>
              </span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-xs font-black text-[#0D47A1] hover:underline flex items-center gap-1"
              >
                <span>🔄</span>
                <span>पुनः OTP भेजें (Resend OTP Now)</span>
              </button>
            )}
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              WhatsApp Active
            </span>
          </div>

          {/* Primary Verify CTA */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={fullOtp.length < 6 || isLoading}
            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-[0.99] ${
              fullOtp.length === 6 && !isLoading
                ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span>सत्यापन हो रहा है (Verifying)...</span>
            ) : (
              <>
                <span>OTP सत्यापित करें (Verify &amp; Proceed)</span>
                <span>➔</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-2 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400 font-mono">
          Fast2SMS Direct WhatsApp Gateway · 256-Bit SSL Encrypted
        </p>
      </div>
    </div>
  );
}
