"use client";

import React, { useState } from "react";
import { useRiderAuth } from "@/app/rider/hooks/useRiderAuth";

export interface OnContinueParams {
  phone: string;
  channel: "sms" | "whatsapp";
  previewOtp?: string;
  fullName?: string;
  vehicleType?: "bike" | "scooter" | "ev";
  isNewRegistration?: boolean;
}

interface Screen01Props {
  onContinue?: (
    phone: string,
    channel: "sms" | "whatsapp",
    previewOtp?: string,
    meta?: { fullName?: string; vehicleType?: "bike" | "scooter" | "ev"; isNewRegistration?: boolean }
  ) => void;
  onGoogleLogin?: () => void;
}

export default function Screen01AuthStart({ onContinue, onGoogleLogin }: Screen01Props) {
  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [vehicleType, setVehicleType] = useState<"bike" | "scooter" | "ev">("bike");
  const channel: "sms" | "whatsapp" = "whatsapp";

  const { sendPhoneOtp, isLoading, error } = useRiderAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (authMode === "signup" && fullName.trim().length < 2) {
      setLocalError("Please enter your full name (कम से कम 2 अक्षर).");
      return;
    }
    if (phone.length < 10) {
      setLocalError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setLocalError(null);

    const res = await sendPhoneOtp(phone, channel);
    if (res.success) {
      onContinue?.(phone, channel, res.previewOtp, {
        fullName: fullName.trim() || "Delivery Partner",
        vehicleType,
        isNewRegistration: authMode === "signup",
      });
    } else {
      setLocalError(res.error || "Failed to dispatch WhatsApp OTP. Please try again.");
    }
  };

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-3.5 text-[#0F172A] font-sans select-none overflow-hidden">
      <div>
        {/* Top Brand Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0D47A1] text-white flex items-center justify-center text-sm shadow-sm">
              🛵
            </div>
            <div>
              <span className="text-[9px] font-black uppercase text-[#0D47A1] tracking-wider block">TRUSTIT FLEET</span>
              <h2 className="text-xs font-black text-slate-900 leading-tight">Delivery Partner App</h2>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-[#0D47A1] border border-blue-200">
            Bahraich UP 40
          </span>
        </div>

        {/* Dual-Mode Segmented Switch: Register vs Sign In */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/80 rounded-xl text-xs font-bold my-2">
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setLocalError(null);
            }}
            className={`py-1.5 rounded-lg text-center transition ${
              authMode === "signup"
                ? "bg-white text-[#0D47A1] shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🆕 Register (साइन अप)
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthMode("signin");
              setLocalError(null);
            }}
            className={`py-1.5 rounded-lg text-center transition ${
              authMode === "signin"
                ? "bg-white text-[#0D47A1] shadow-xs font-black"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🔑 Sign In (लॉगिन)
          </button>
        </div>

        {/* Form Card (Compact Zero-Scroll Fit) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          {authMode === "signup" ? (
            /* Sign Up Fields */
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Full Name (पूरा नाम)
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setLocalError(null);
                  }}
                  placeholder="e.g. लकी शुक्ला"
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-[#0D47A1] focus:bg-white transition"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Mobile Number (WhatsApp OTP)
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5 focus-within:border-[#0D47A1] focus-within:bg-white transition">
                  <span className="text-xs font-bold text-slate-700 mr-2 border-r border-slate-300 pr-2">
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
                    className="w-full bg-transparent font-bold text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none tracking-wider"
                  />
                </div>
              </div>

              {/* Vehicle Type Selector */}
              <div>
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                  Fleet Vehicle Type:
                </label>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    type="button"
                    onClick={() => setVehicleType("bike")}
                    className={`py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                      vehicleType === "bike"
                        ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-2xs font-black"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>🏍️</span>
                    <span>Motorcycle</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType("scooter")}
                    className={`py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                      vehicleType === "scooter"
                        ? "bg-blue-50 border-[#0D47A1] text-[#0D47A1] shadow-2xs font-black"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>🛵</span>
                    <span>Scooter</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVehicleType("ev")}
                    className={`py-1.5 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition ${
                      vehicleType === "ev"
                        ? "bg-emerald-50 border-emerald-600 text-emerald-800 shadow-2xs font-black"
                        : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <span>⚡</span>
                    <span>Electric</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            /* Sign In Fields */
            <>
              <div>
                <label className="text-[10px] font-bold text-slate-700 block mb-0.5">
                  Registered Mobile Number
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2 focus-within:border-[#0D47A1] focus-within:bg-white transition">
                  <span className="text-xs font-bold text-slate-700 mr-2 border-r border-slate-300 pr-2">
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
                    placeholder="Enter your 10-digit number"
                    className="w-full bg-transparent font-bold text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none tracking-wider"
                  />
                </div>
              </div>

              {/* Clean WhatsApp OTP Badge */}
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-[11px]">
                <span className="text-emerald-950 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Instant WhatsApp Verification
                </span>
                <span className="text-[9px] font-black text-emerald-700 uppercase">Fast Sign In</span>
              </div>
            </>
          )}

          {/* Error Banner */}
          {(localError || error) && (
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-[10px] text-red-700 font-medium">
              ⚠️ {localError || error}
            </div>
          )}

          {/* Primary CTA (Slim 40px Button) */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={phone.length < 10 || isLoading}
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition active:scale-[0.98] ${
              phone.length === 10 && !isLoading
                ? "bg-[#0D47A1] hover:bg-[#082b66] text-white"
                : "bg-slate-200 text-slate-400 cursor-not-allowed"
            }`}
          >
            {isLoading ? (
              <span>Sending WhatsApp OTP...</span>
            ) : authMode === "signup" ? (
              <>
                <span>Register &amp; Send WhatsApp OTP</span>
                <span>➔</span>
              </>
            ) : (
              <>
                <span>Sign In with WhatsApp OTP</span>
                <span>➔</span>
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-2 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-[#FAF8FF] px-2 text-[9px] font-bold text-slate-400 uppercase">
            OR WITH GOOGLE
          </span>
        </div>

        {/* Google 1-Tap CTA (Slim 36px) */}
        <button
          type="button"
          onClick={onGoogleLogin}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-2xs transition"
        >
          <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>
            {authMode === "signup" ? "Sign Up with Google (Auto-Fill Profile)" : "Sign In with Google"}
          </span>
        </button>
      </div>

      {/* Mode Switch Helper & Footer Terms */}
      <div className="pt-2 border-t border-slate-200 text-center space-y-0.5">
        <div className="text-[10px] text-slate-500">
          {authMode === "signup" ? (
            <span>
              Already a registered partner?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signin");
                  setLocalError(null);
                }}
                className="font-bold text-[#0D47A1] hover:underline"
              >
                Sign In here (लॉगिन करें)
              </button>
            </span>
          ) : (
            <span>
              New to Trustit Fleet?{" "}
              <button
                type="button"
                onClick={() => {
                  setAuthMode("signup");
                  setLocalError(null);
                }}
                className="font-bold text-[#0D47A1] hover:underline"
              >
                Register as New Partner (साइन अप करें)
              </button>
            </span>
          )}
        </div>
        <p className="text-[9px] text-slate-400">
          By proceeding, you agree to <span className="font-bold text-[#0D47A1]">Partner Terms</span> &amp;{" "}
          <span className="font-bold text-[#0D47A1]">Road Safety Policy</span>.
        </p>
      </div>
    </div>
  );
}
