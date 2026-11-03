"use client";

import React, { useState, useEffect } from "react";
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
  phone = "9876543210",
  channel = "sms",
  previewOtp,
  onVerified,
  onResend,
  onBack,
}: Screen02Props) {
  const initialDigits = previewOtp && previewOtp.length === 6
    ? previewOtp.split("")
    : ["5", "4", "7", "2", "9", "1"];

  const [digits, setDigits] = useState<string[]>(initialDigits);
  const [countdown, setCountdown] = useState<number>(30);
  const [localError, setLocalError] = useState<string | null>(null);
  const { verifyPhoneOtp, sendPhoneOtp, isLoading, error } = useRiderAuth();

  useEffect(() => {
    if (previewOtp && previewOtp.length === 6) {
      setDigits(previewOtp.split(""));
    }
  }, [previewOtp]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, "").slice(-1);
    const updated = [...digits];
    updated[index] = clean;
    setDigits(updated);
    setLocalError(null);
  };

  const fullOtp = digits.join("");

  const handleVerify = async () => {
    if (fullOtp.length < 6) {
      setLocalError("Please enter all 6 digits of the OTP code.");
      return;
    }
    setLocalError(null);

    const res = await verifyPhoneOtp(phone, fullOtp);
    if (res.success) {
      onVerified?.(fullOtp, res.rider);
    } else {
      setLocalError(res.error || "Invalid OTP code. Please re-check.");
    }
  };

  const handleResendOtp = async () => {
    setCountdown(30);
    setLocalError(null);
    await sendPhoneOtp(phone, channel);
    onResend?.();
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 2 of 6</span>
        </div>

        {/* Title */}
        <div className="mt-5 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Verify Your Mobile Number</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Enter 6-digit OTP code sent via {channel === "whatsapp" ? "WhatsApp" : "SMS"} to{" "}
            <strong className="text-slate-900 font-mono">+91 {phone}</strong>
          </p>
        </div>

        {/* 6 Spaced Digit Boxes */}
        <div className="mt-6 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex justify-between gap-1.5 sm:gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                className="w-10 h-12 sm:w-11 sm:h-12 text-center text-lg font-black text-slate-900 border-2 border-slate-200 rounded-xl focus:border-[#0D47A1] focus:bg-blue-50/30 focus:outline-none transition"
              />
            ))}
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 font-medium text-center">
              ⚠️ {localError || error}
            </div>
          )}

          {/* Resend & Channel Switch */}
          <div className="flex items-center justify-between pt-2 text-xs">
            {countdown > 0 ? (
              <span className="text-slate-500 font-semibold">Resend OTP in {countdown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendOtp}
                className="font-bold text-[#0D47A1] hover:underline"
              >
                Resend OTP Now
              </button>
            )}
            <span className="text-[10px] text-slate-400 font-mono">Channel: {channel.toUpperCase()}</span>
          </div>

          {/* Verify CTA */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={fullOtp.length < 6 || isLoading}
            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition ${
              fullOtp.length === 6 && !isLoading
                ? "bg-[#0D47A1] hover:bg-[#082b66] text-white active:scale-[0.98]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span>Verifying OTP Code...</span>
            ) : (
              <>
                <span>Verify &amp; Continue</span>
                <span>➔</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Footer Info */}
      <div className="pt-4 border-t border-slate-200 text-center">
        <p className="text-[10px] text-slate-400">
          Secure OTP Verification · Encrypted with Fast2SMS SHA-256 Engine
        </p>
      </div>
    </div>
  );
}
