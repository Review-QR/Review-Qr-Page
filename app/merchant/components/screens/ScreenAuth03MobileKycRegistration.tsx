"use client";

import React, { useState } from "react";
import GoogleConsentModal from "@/components/auth/GoogleConsentModal";
import { TrustitNative } from "@/lib/native/trustit-native-service";

interface ScreenAuth03Props {
  category?: string;
  onBack?: () => void;
  onRegisterComplete?: (details?: { storeName: string; ownerName: string; phone: string; category: string }) => void;
  disableRedirect?: boolean;
}

/**
 * ScreenAuth03: Streamlined Merchant Registration & WhatsApp OTP Verification.
 * Clean, single-pill phone input without disjointed flag, DLT warning completely removed.
 */
export default function ScreenAuth03MobileKycRegistration({
  category = "kirana",
  onBack,
  onRegisterComplete,
  disableRedirect = false,
}: ScreenAuth03Props) {
  const [storeName, setStoreName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Send WhatsApp OTP
  const handleSendOtp = async () => {
    if (phone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone, channel: "whatsapp" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to dispatch WhatsApp OTP.");
      }
      setOtpSent(true);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Error sending OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify OTP & Register Store
  const handleVerifyAndRegister = async (otpOverride?: string) => {
    const fullCode = otpOverride || otp.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the OTP.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Step A: Verify OTP
      const verifyRes = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone, otp: fullCode }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Invalid OTP code. Please check WhatsApp.");
      }

      // Step B: Register profile in database
      const finalStore = storeName.trim() || `${ownerName || "Merchant"}'s Store`;
      const finalOwner = ownerName.trim() || "Merchant Partner";
      const regRes = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_merchant",
          phone,
          storeName: finalStore,
          ownerName: finalOwner,
          category,
          city: "Bahraich",
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.message || "Failed to register merchant profile.");
      }

      onRegisterComplete?.({
        storeName: finalStore,
        ownerName: finalOwner,
        phone,
        category,
      });

      if (!disableRedirect && typeof window !== "undefined") {
        window.location.href = regData.redirectUrl || "/merchant/app";
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Google 1-Tap Sign-In
  const handleGoogleLogin = async (googleUser: { email: string; fullName: string }) => {
    setIsGoogleModalOpen(false);
    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_login",
          email: googleUser.email,
          fullName: googleUser.fullName,
          phone: phone.length === 10 ? phone : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Google sign-in failed.");
      }

      onRegisterComplete?.({
        storeName: `${googleUser.fullName}'s Store`,
        ownerName: googleUser.fullName,
        phone,
        category,
      });

      if (!disableRedirect && typeof window !== "undefined") {
        window.location.href = data.redirectUrl || "/merchant/app";
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Google authentication error.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && idx < 5) {
      const nextInput = document.getElementById(`otp-input-${idx + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2 border-b border-slate-200">
          <div>
            <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider block">
              REGISTRATION • STEP 2 OF 3
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Store Profile &amp; WhatsApp OTP
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 active:scale-95 transition"
          >
            ← Back
          </button>
        </div>

        {/* Selected Category Pill */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2 shadow-2xs flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Vertical:</span>
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
            {category} Mart
          </span>
        </div>

        {/* Registration Form */}
        <div className="mt-2 bg-white border border-slate-200 rounded-xl p-2.5 shadow-2xs space-y-2">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Official Store / Shop Name
            </label>
            <input
              type="text"
              value={storeName}
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. Ankit Shukla Grocery Store"
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 transition"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Proprietor / Owner Full Name
            </label>
            <input
              type="text"
              value={ownerName}
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. अंकित शुक्ला (Ankit Shukla)"
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 transition"
            />
          </div>

          {/* Unified Clean Single-Pill Phone Input */}
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Mobile Number (WhatsApp)
            </label>
            <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 focus-within:bg-white focus-within:border-blue-600 transition">
              <span className="text-xs font-bold text-slate-700 mr-2 border-r border-slate-300 pr-2 select-none flex items-center gap-1">
                <span>🇮🇳</span>
                <span>+91</span>
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                autoComplete="off"
                placeholder="10-digit mobile number"
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none"
              />
            </div>
            {/* Clean reassuring message - ZERO DLT WARNING */}
            <span className="text-[9px] text-emerald-600 font-bold block mt-1">
              🟢 6-digit verification code will be sent to your WhatsApp.
            </span>
          </div>

          {/* OTP Section (Shown after clicking Send OTP) */}
          {otpSent && (
            <div className="pt-2 border-t border-slate-100 space-y-1.5 animate-in fade-in duration-200">
              <label className="text-[10px] font-bold uppercase text-slate-700 block text-center">
                Enter 6-Digit WhatsApp OTP
              </label>
              <div className="flex justify-center gap-1.5">
                {otp.map((d, i) => (
                  <input
                    key={i}
                    id={`otp-input-${i}`}
                    type="text"
                    maxLength={1}
                    value={d}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-8 h-9 text-center text-sm font-mono font-black border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                  />
                ))}
              </div>
              <p className="text-[9px] text-center text-slate-500">
                Code sent to WhatsApp (+91 {phone})
              </p>
            </div>
          )}
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 border-t border-slate-200 space-y-1.5">
        {!otpSent ? (
          <button
            type="button"
            disabled={isLoading || phone.length !== 10}
            onClick={handleSendOtp}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            {isLoading ? "Sending WhatsApp OTP..." : "Send Verification Code (WhatsApp) →"}
          </button>
        ) : (
          <button
            type="button"
            disabled={isLoading || otp.join("").length !== 6}
            onClick={() => handleVerifyAndRegister()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            {isLoading ? "Creating Profile..." : "Verify & Complete Registration ✓"}
          </button>
        )}

        {/* Google 1-Tap Alternative */}
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 text-[11px] font-bold shadow-2xs flex items-center justify-center gap-2 transition"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>
      </div>

      {/* Google Consent Modal */}
      <GoogleConsentModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        role="merchant"
        onSuccess={handleGoogleLogin}
      />
    </div>
  );
}
