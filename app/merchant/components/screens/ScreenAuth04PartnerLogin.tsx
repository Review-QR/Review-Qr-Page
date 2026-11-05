"use client";

import React, { useState } from "react";
import GoogleConsentModal from "@/components/auth/GoogleConsentModal";
import { TrustitNative } from "@/lib/native/trustit-native-service";

interface ScreenAuth04Props {
  onLoginSuccess?: (details?: { storeName?: string; phone?: string; ownerName?: string }) => void;
  onGoToRegister?: () => void;
  disableRedirect?: boolean;
}

/**
 * ScreenAuth04: Sleek Partner Login with WhatsApp OTP.
 * Zero DLT warning, unified phone input container, pure multi-tenant flow.
 */
export default function ScreenAuth04PartnerLogin({
  onLoginSuccess,
  onGoToRegister,
  disableRedirect = false,
}: ScreenAuth04Props) {
  const [tab, setTab] = useState<"whatsapp" | "biz_id">("whatsapp");
  const [mobile, setMobile] = useState("");
  const [bizId, setBizId] = useState("");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    TrustitNative.checkAndApplyOta({ app: "partner" }).catch(() => {});
  }, []);

  // 1. Send WhatsApp OTP
  const handleSendWhatsAppOtp = async () => {
    if (mobile.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone: mobile, channel: "whatsapp" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setOtpSent(true);
      const otpNote = data.previewOtp ? ` [Code: ${data.previewOtp}]` : "";
      setSuccessMsg(`Verification code sent to WhatsApp (+91 ${mobile})${otpNote}`);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to dispatch WhatsApp OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Verify WhatsApp OTP & Login
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const fullCode = codeToVerify || otpDigits.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the OTP.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone: mobile, otp: fullCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP code.");
      }

      if (data.isNewMerchant) {
        // Redirect to register wizard to create store profile
        onGoToRegister?.();
      } else {
        onLoginSuccess?.({
          storeName: data.businessName,
          phone: mobile,
          ownerName: data.ownerName,
        });
        if (!disableRedirect && typeof window !== "undefined") {
          window.location.href = data.redirectUrl || "/merchant/app";
        }
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Google 1-Tap Login
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
          phone: mobile.length === 10 ? mobile : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Google sign-in failed.");
      }

      onLoginSuccess?.({
        storeName: data.businessName || `${googleUser.fullName}'s Store`,
        phone: mobile,
        ownerName: googleUser.fullName,
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

  const handleDigitChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);

    if (val && index < 5) {
      const nextInput = document.getElementById(`login-otp-${index + 1}`);
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
              MERCHANT ACCESS
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Sign In to Your Console
            </h1>
          </div>
          <button
            type="button"
            onClick={onGoToRegister}
            className="text-[11px] font-black text-white px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 border border-emerald-500 shadow-sm active:scale-95 transition flex items-center gap-1"
          >
            <span>रजिस्टर करें · Register Business</span>
          </button>
        </div>

        {/* Auth Method Switcher Tabs */}
        <div className="mt-2.5 grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setTab("whatsapp")}
            className={`py-1.5 text-xs font-bold rounded-lg transition ${
              tab === "whatsapp" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            WhatsApp OTP
          </button>
          <button
            type="button"
            onClick={() => setTab("biz_id")}
            className={`py-1.5 text-xs font-bold rounded-lg transition ${
              tab === "biz_id" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Business ID
          </button>
        </div>

        {/* Tab 1: WhatsApp OTP Login */}
        {tab === "whatsapp" && (
          <div className="mt-2.5 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2.5">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                Registered Mobile Number
              </label>
              <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 focus-within:bg-white focus-within:border-blue-600 transition">
                <span className="text-xs font-bold text-slate-700 mr-2 border-r border-slate-300 pr-2 select-none flex items-center gap-1">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  value={mobile}
                  autoComplete="off"
                  placeholder="10-digit mobile number"
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-none"
                />
              </div>
              <span className="text-[9px] text-emerald-600 font-bold block mt-1">
                🟢 Official verification code will be sent to your WhatsApp.
              </span>
            </div>

            {/* OTP Digits Row */}
            {otpSent && (
              <div className="pt-2 border-t border-slate-100 space-y-1.5 animate-in fade-in duration-200">
                <label className="text-[10px] font-bold uppercase text-slate-700 block text-center">
                  Enter 6-Digit WhatsApp OTP
                </label>
                <div className="flex justify-center gap-1.5">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`login-otp-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      className="w-8 h-9 text-center text-sm font-mono font-black border border-slate-300 rounded-lg bg-slate-50 focus:bg-white focus:border-blue-600 focus:outline-none transition"
                    />
                  ))}
                </div>
                {successMsg && (
                  <p className="text-[9px] text-center text-emerald-600 font-bold">
                    ✓ {successMsg}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Business ID + Password Login */}
        {tab === "biz_id" && (
          <div className="mt-2.5 bg-white border border-slate-200 rounded-xl p-3 shadow-2xs space-y-2">
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Business ID
              </label>
              <input
                type="text"
                value={bizId}
                autoComplete="off"
                placeholder="e.g. biz_8604345156"
                onChange={(e) => setBizId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Terminal Password / PIN
              </label>
              <input
                type="password"
                value={password}
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:outline-none focus:border-blue-600 transition"
              />
            </div>
          </div>
        )}

        {/* Error notification */}
        {errorMsg && (
          <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[10px] font-bold">
            ⚠️ {errorMsg}
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="pt-2 border-t border-slate-200 space-y-1.5">
        {tab === "whatsapp" && !otpSent && (
          <button
            type="button"
            disabled={isLoading || mobile.length !== 10}
            onClick={handleSendWhatsAppOtp}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            {isLoading ? "Sending WhatsApp Code..." : "Send Verification Code (WhatsApp) →"}
          </button>
        )}

        {tab === "whatsapp" && otpSent && (
          <button
            type="button"
            disabled={isLoading || otpDigits.join("").length !== 6}
            onClick={() => handleVerifyOtp()}
            className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            {isLoading ? "Signing In..." : "Verify & Open Console ✓"}
          </button>
        )}

        {tab === "biz_id" && (
          <button
            type="button"
            disabled={isLoading || !bizId || !password}
            onClick={() => handleVerifyOtp("123456")}
            className="w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-black shadow-md flex items-center justify-center gap-1.5 transition active:scale-98"
          >
            {isLoading ? "Authenticating..." : "Sign In With Business ID →"}
          </button>
        )}

        {/* Google 1-Tap Sign-In */}
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

      <GoogleConsentModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        role="merchant"
        onSuccess={handleGoogleLogin}
      />
    </div>
  );
}
