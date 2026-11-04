"use client";

import React, { useState } from "react";
import { useRiderAuth } from "@/app/rider/hooks/useRiderAuth";

interface Screen01Props {
  onContinue?: (phone: string, channel: "sms" | "whatsapp", previewOtp?: string) => void;
  onGoogleLogin?: () => void;
}

export default function Screen01AuthStart({ onContinue, onGoogleLogin }: Screen01Props) {
  const [phone, setPhone] = useState("9876543210");
  const [channel, setChannel] = useState<"sms" | "whatsapp">("whatsapp");
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
              Mobile Number (WhatsApp OTP)
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
              {/* SMS OTP Button - Disabled by DLT */}
              <button
                type="button"
                disabled={true}
                title="SMS OTP is currently disabled pending TRAI DLT registration. Please use WhatsApp OTP."
                className="py-2 px-2 rounded-xl border border-slate-200 bg-slate-100/90 text-slate-400 text-[11px] font-bold flex items-center justify-center gap-1 cursor-not-allowed opacity-75"
              >
                <span>💬 SMS</span>
                <span className="text-[8.5px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-black">DLT Pending</span>
              </button>

              {/* WhatsApp OTP Button - Active */}
              <button
                type="button"
                onClick={() => setChannel("whatsapp")}
                className="py-2 px-2 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 text-[11px] font-black flex items-center justify-center gap-1 shadow-xs"
              >
                <span>🟢 WhatsApp OTP</span>
                <span className="text-[8.5px] bg-emerald-200 text-emerald-900 px-1 py-0.5 rounded font-black">Active</span>
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
              <span>Sending WhatsApp OTP...</span>
            ) : (
              <>
                <span>Send WhatsApp OTP</span>
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
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google (1-Tap Auto-Login)</span>
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
