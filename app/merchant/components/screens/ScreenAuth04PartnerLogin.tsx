"use client";

import React, { useState, useEffect } from "react";
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
            <span>Register Your Business</span>
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
      </div>
    </div>
  );
}
