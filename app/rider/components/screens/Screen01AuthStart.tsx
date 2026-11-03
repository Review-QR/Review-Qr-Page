"use client";

import React, { useState } from "react";
import { useRiderAuth } from "@/app/rider/hooks/useRiderAuth";

interface Screen01Props {
  onContinue?: (phone: string, channel: "sms" | "whatsapp", previewOtp?: string) => void;
  onGoogleLogin?: () => void;
}

export default function Screen01AuthStart({ onContinue, onGoogleLogin }: Screen01Props) {
  const [phone, setPhone] = useState("9876543210");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("sms");
  const { sendPhoneOtp, isLoading, error, previewOtp } = useRiderAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (phone.length < 10) {
      setLocalError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLocalError(null);

    const res = await sendPhoneOtp(phone, channel);
    if (res.success) {
      onContinue?.(phone, channel, res.previewOtp);
    } else {
      setLocalError(res.error || "Failed to dispatch OTP. Please try again.");
    }
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Top Brand Header */}
      <div className="pt-2">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-[#0D47A1] text-white flex items-center justify-center shadow-md">
              <span className="text-xl">🛵</span>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#0D47A1]">TRUSTIT FLEET</span>
              <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Delivery Partner App</h2>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-[#0D47A1] border border-blue-200">
            Bahraich Hub
          </span>
        </div>

        {/* Hero Pitch */}
        <div className="mt-5 space-y-1">
          <h1 className="text-lg font-black text-slate-900 leading-tight">
            Deliver Orders, Earn Daily &amp; Grow With Trustit
          </h1>
          <p className="text-xs text-slate-500 leading-relaxed">
            30-second proximity radar, instant Cashfree UPI settlements, and safety assurance across Bahraich.
          </p>
        </div>

        {/* Mobile Input Card */}
        <div className="mt-5 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-3.5">
          <div>
            <label className="text-[11px] font-bold text-slate-700 block mb-1">
              Mobile Number (WhatsApp/SMS OTP)
            </label>
            <div className="flex items-center rounded-xl border-2 border-slate-200 bg-slate-50 focus-within:border-[#0D47A1] focus-within:bg-white transition px-3 py-2.5">
              <span className="text-xs font-black text-slate-700 mr-2 border-r border-slate-300 pr-2">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value.replace(/\D/g, ""));
                  setLocalError(null);
                }}
                placeholder="Enter 10-digit number"
                className="w-full bg-transparent font-bold text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none tracking-wider"
              />
            </div>
          </div>

          {/* OTP Channel Selector */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Choose Verification Channel:
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel("sms")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  channel === "sms"
                    ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>💬 SMS OTP</span>
              </button>
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                  channel === "whatsapp"
                    ? "bg-emerald-50 border-emerald-600 text-emerald-800 shadow-xs"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>🟢 WhatsApp OTP</span>
              </button>
            </div>
          </div>

          {/* Error Banner */}
          {(localError || error) && (
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 font-medium">
              ⚠️ {localError || error}
            </div>
          )}

          {/* Preview OTP Helper (for smooth testing) */}
          {previewOtp && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-center text-xs font-mono font-bold text-emerald-800">
              ⚡ Test OTP Code: <span className="underline">{previewOtp}</span>
            </div>
          )}

          {/* Primary CTA */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={phone.length < 10 || isLoading}
            className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition ${
              phone.length === 10 && !isLoading
                ? "bg-[#0D47A1] hover:bg-[#082b66] text-white active:scale-[0.98]"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span>Sending Secure OTP...</span>
            ) : (
              <>
                <span>Send Verification OTP</span>
                <span>➔</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-4 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-[#FAF8FF] px-2 text-[10px] font-bold text-slate-400 uppercase">
            OR SIGN IN WITH
          </span>
        </div>

        {/* Google 1-Tap CTA */}
        <button
          type="button"
          onClick={onGoogleLogin}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <span className="text-base font-black">G</span>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Footer Info & Terms */}
      <div className="pt-4 border-t border-slate-200 text-center space-y-1">
        <p className="text-[10px] text-slate-500">
          By proceeding, you agree to the <span className="font-bold text-[#0D47A1]">Trustit Partner Terms</span> &amp;{" "}
          <span className="font-bold text-[#0D47A1]">Road Safety Policy</span>.
        </p>
        <span className="text-[9px] text-slate-400 block font-mono">Project Trustit Fleet v2.0 · Bahraich (UP 40)</span>
      </div>
    </div>
  );
}
