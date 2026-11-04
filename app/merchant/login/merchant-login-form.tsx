"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { merchantSignInAction } from "./actions";
import GoogleConsentModal from "@/components/auth/GoogleConsentModal";
import WhatsAppOtpNotificationBanner from "@/components/auth/WhatsAppOtpNotificationBanner";

export default function MerchantLoginForm() {
  const [tab, setTab] = useState<"whatsapp" | "biz_id">("whatsapp");
  const [mobileNumber, setMobileNumber] = useState("9118643415");
  const [businessIdInput, setBusinessIdInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeWhatsAppOtp, setActiveWhatsAppOtp] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isOtpLoading, setIsOtpLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState<string | null>(null);

  const [state, formAction, pending] = useActionState(merchantSignInAction, {
    message: "",
  });

  // 1. Send WhatsApp OTP
  const handleSendWhatsAppOtp = async () => {
    if (mobileNumber.length < 10) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      return;
    }
    setAuthError(null);
    setIsOtpLoading(true);

    try {
      const res = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone: mobileNumber, channel: "whatsapp" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to dispatch WhatsApp OTP.");
      }

      setOtpSent(true);
      if (data.previewOtp) {
        setActiveWhatsAppOtp(data.previewOtp);
      }
      setAuthSuccess(`Verification code sent to WhatsApp (+91 ${mobileNumber})`);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Error sending OTP.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  // 2. Verify WhatsApp OTP & Login
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otpDigits.join("");
    if (fullCode.length !== 6) {
      setAuthError("Please enter all 6 digits of the OTP.");
      return;
    }
    setAuthError(null);
    setIsOtpLoading(true);

    try {
      const res = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone: mobileNumber, otp: fullCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP code.");
      }

      if (data.isNewMerchant) {
        window.location.href = "/partner";
      } else {
        window.location.href = data.redirectUrl || "/merchant/app";
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  // 3. Google 1-Tap Login
  const handleGoogleLogin = async (googleUser: { email: string; fullName: string }) => {
    setIsOtpLoading(true);
    setAuthError(null);
    try {
      const res = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_login",
          email: googleUser.email,
          fullName: googleUser.fullName,
          phone: mobileNumber || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        window.location.href = data.redirectUrl || "/merchant/app";
      } else {
        throw new Error(data.message || "Google sign-in failed.");
      }
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Google sign-in error.");
    } finally {
      setIsOtpLoading(false);
    }
  };

  return (
    <div className="mt-5">
      {/* Google 1-Tap Fast-Track Button */}
      <button
        type="button"
        onClick={() => setIsGoogleModalOpen(true)}
        className="mb-4 flex w-full items-center justify-center gap-2.5 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 active:scale-98 transition"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
        <span>Continue with Google (1-Tap Auto-Login)</span>
      </button>

      {/* OR Divider */}
      <div className="relative mb-4 flex items-center justify-center">
        <div className="w-full border-t border-slate-200" />
        <span className="absolute bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
          OR LOGIN WITH PHONE / ID
        </span>
      </div>

      {/* Dual Tab Switcher */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setTab("whatsapp")}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition font-bold ${
            tab === "whatsapp"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="text-sm">🟢</span>
          <span>WhatsApp OTP</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("biz_id")}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition font-bold ${
            tab === "biz_id"
              ? "bg-white text-slate-900 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="text-sm">🏢</span>
          <span>Business ID / Password</span>
        </button>
      </div>

      {/* WhatsApp OTP Form */}
      {tab === "whatsapp" ? (
        <div className="mt-4 space-y-4 text-left">
          {authError && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700">
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}
          {authSuccess && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs font-semibold text-emerald-800">
              <span>✓</span>
              <span>{authSuccess}</span>
            </div>
          )}

          <div>
            <label htmlFor="mobileInput" className="mb-1.5 block text-xs font-bold text-slate-800">
              Registered Mobile Number
            </label>
            <div className="relative flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs focus-within:border-slate-800 focus-within:ring-4 focus-within:ring-slate-100 transition">
              <div className="flex flex-col items-center justify-center border-r border-slate-200 bg-slate-50/80 px-3.5 py-1 text-center select-none">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">IN</span>
                <span className="text-xs font-black text-slate-900">+91</span>
              </div>
              <input
                id="mobileInput"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 10-digit mobile number"
                className="w-full px-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:font-normal placeholder:text-slate-400 outline-none"
              />
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={true}
              title="SMS OTP is currently disabled pending TRAI DLT registration. Please use WhatsApp OTP."
              className="py-2 px-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-xs font-bold flex items-center justify-center gap-1 cursor-not-allowed opacity-75"
            >
              <span>💬 SMS OTP</span>
              <span className="text-[8.5px] bg-amber-100 text-amber-800 px-1 py-0.5 rounded font-black">DLT Pending</span>
            </button>
            <button
              type="button"
              className="py-2 px-2 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 text-xs font-black flex items-center justify-center gap-1 shadow-xs"
            >
              <span>🟢 WhatsApp OTP</span>
              <span className="text-[8.5px] bg-emerald-200 text-emerald-900 px-1 py-0.5 rounded font-black">Active</span>
            </button>
          </div>

          {!otpSent ? (
            <button
              type="button"
              disabled={isOtpLoading || mobileNumber.length < 10}
              onClick={handleSendWhatsAppOtp}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-emerald-700 active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isOtpLoading ? "Sending OTP..." : "Get WhatsApp Login OTP →"}
            </button>
          ) : (
            <div className="space-y-3 pt-1 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-800 block">
                Enter 6-Digit WhatsApp Code:
              </label>
              <div className="flex gap-2 justify-center">
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`login-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const updated = [...otpDigits];
                      updated[idx] = val;
                      setOtpDigits(updated);
                      if (val && idx < 5) {
                        document.getElementById(`login-otp-${idx + 1}`)?.focus();
                      }
                      if (idx === 5 && val) {
                        updated[5] = val;
                        handleVerifyOtp(updated.join(""));
                      }
                    }}
                    className="w-10 h-12 text-center font-mono font-black text-lg rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-600 focus:bg-white outline-none"
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={isOtpLoading || otpDigits.join("").length !== 6}
                onClick={() => handleVerifyOtp()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isOtpLoading ? "Verifying..." : "Verify OTP & Open Dashboard →"}
              </button>
            </div>
          )}

          <div className="pt-2 text-center">
            <p className="text-xs text-slate-600">
              New to Trustit?{" "}
              <Link href="/partner" className="font-black text-blue-700 hover:underline">
                Become a Partner (Free) →
              </Link>
            </p>
          </div>
        </div>
      ) : (
        /* Business ID + Password Form */
        <form action={formAction} autoComplete="off" className="mt-5 space-y-4 text-left">
          {state.message && (
            <div
              className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700"
              role="alert"
            >
              <span className="text-base leading-none">⚠️</span>
              <span>{state.message}</span>
            </div>
          )}

          <div>
            <label htmlFor="businessId" className="mb-1.5 block text-xs font-bold text-slate-800">
              Business ID (मर्चेंट कोड)
            </label>
            <input
              id="businessId"
              name="businessId"
              autoComplete="off"
              required
              maxLength={128}
              value={businessIdInput}
              onChange={(e) => setBusinessIdInput(e.target.value)}
              placeholder="e.g. biz_... or QR-77837092"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-2xs placeholder:font-normal placeholder:text-slate-400 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="merchantPassword" className="text-xs font-bold text-slate-800">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="merchantPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition focus:border-slate-800 focus:ring-4 focus:ring-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={pending || !businessIdInput.trim()}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 active:scale-[0.99] transition disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Login to Dashboard →"}
          </button>
        </form>
      )}

      {/* Google Consent Modal */}
      <GoogleConsentModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        role="merchant"
        defaultName="Lucky Shukla (Merchant)"
        defaultEmail="lucky.merchant@gmail.com"
        onSuccess={handleGoogleLogin}
      />

      {/* WhatsApp Floating Banner */}
      <WhatsAppOtpNotificationBanner
        otpCode={activeWhatsAppOtp}
        phone={mobileNumber}
        onAutoFill={(code) => {
          setOtpDigits(code.split(""));
          handleVerifyOtp(code);
        }}
        onDismiss={() => setActiveWhatsAppOtp(null)}
      />
    </div>
  );
}
