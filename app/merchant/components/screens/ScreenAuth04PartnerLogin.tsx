"use client";

import React, { useState } from "react";
import GoogleConsentModal from "@/components/auth/GoogleConsentModal";
import WhatsAppOtpNotificationBanner from "@/components/auth/WhatsAppOtpNotificationBanner";

interface ScreenAuth04Props {
  onLoginSuccess?: () => void;
  onGoToRegister?: () => void;
}

export default function ScreenAuth04PartnerLogin({
  onLoginSuccess,
  onGoToRegister,
}: ScreenAuth04Props) {
  const [tab, setTab] = useState<"whatsapp" | "biz_id">("whatsapp");
  const [mobile, setMobile] = useState("9118643415");
  const [bizId, setBizId] = useState("QR-77837892");
  const [password, setPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeWhatsAppOtp, setActiveWhatsAppOtp] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // 1. Send WhatsApp OTP
  const handleSendWhatsAppOtp = async () => {
    if (mobile.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone: mobile, channel: "whatsapp" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to send OTP.");
      }

      setOtpSent(true);
      if (data.previewOtp) {
        setActiveWhatsAppOtp(data.previewOtp);
      }
      setSuccessMsg(`Verification code sent to WhatsApp (+91 ${mobile})`);
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
      const res = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone: mobile, otp: fullCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Invalid OTP code.");
      }

      if (data.isNewMerchant) {
        // Redirect to register wizard
        onGoToRegister?.();
      } else {
        onLoginSuccess?.();
        if (typeof window !== "undefined") {
          window.location.href = data.redirectUrl || "/merchant/dashboard";
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
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_login",
          email: googleUser.email,
          fullName: googleUser.fullName,
          phone: mobile || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onLoginSuccess?.();
        if (typeof window !== "undefined") {
          window.location.href = data.redirectUrl || "/merchant/dashboard";
        }
      } else {
        throw new Error(data.message || "Google sign-in failed.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Google sign-in error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Top Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-black text-xs shadow-xs">
              T
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">
                TRUSTIT PARTNER
              </span>
              <h2 className="text-xs font-black text-slate-900 leading-tight">
                Merchant Sign In
              </h2>
            </div>
          </div>
          <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            SSL 256-Bit Secure
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="mt-3 grid grid-cols-2 gap-1 rounded-2xl bg-slate-200/80 p-1 text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setTab("whatsapp")}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === "whatsapp" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            <span>🟢</span>
            <span>WhatsApp OTP</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("biz_id")}
            className={`py-2 rounded-xl transition flex items-center justify-center gap-1.5 ${
              tab === "biz_id" ? "bg-white text-slate-900 shadow-xs" : "hover:text-slate-900"
            }`}
          >
            <span>🏢</span>
            <span>Business ID</span>
          </button>
        </div>

        {/* Login Inputs */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          {tab === "whatsapp" ? (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Registered Mobile Number
                </label>
                <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-2">
                  <span className="text-xs font-bold text-slate-600 mr-2 border-r border-slate-300 pr-2">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 10-digit number"
                    className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden tracking-wider"
                  />
                </div>
              </div>

              {/* Delivery Channels */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={true}
                  title="SMS OTP is currently disabled pending TRAI DLT registration. Please use WhatsApp OTP."
                  className="py-1.5 px-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-[10.5px] font-bold flex items-center justify-center gap-1 cursor-not-allowed opacity-75"
                >
                  <span>💬 SMS</span>
                  <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-black">DLT Pending</span>
                </button>
                <button
                  type="button"
                  className="py-1.5 px-2 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 text-[10.5px] font-black flex items-center justify-center gap-1 shadow-xs"
                >
                  <span>🟢 WhatsApp</span>
                  <span className="text-[8px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded font-black">Active</span>
                </button>
              </div>

              {!otpSent ? (
                <button
                  type="button"
                  onClick={handleSendWhatsAppOtp}
                  disabled={mobile.length < 10 || isLoading}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition disabled:opacity-50"
                >
                  {isLoading ? "Sending OTP..." : "Get WhatsApp OTP →"}
                </button>
              ) : (
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <label className="text-[10px] font-bold uppercase text-slate-600 block">
                    Enter 6-Digit WhatsApp Code:
                  </label>
                  <div className="flex gap-1.5 justify-center">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`merchant-otp-${idx}`}
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
                            document.getElementById(`merchant-otp-${idx + 1}`)?.focus();
                          }
                          if (idx === 5 && val) {
                            updated[5] = val;
                            handleVerifyOtp(updated.join(""));
                          }
                        }}
                        className="w-9 h-10 text-center font-mono font-black text-base rounded-xl border-2 border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-600 focus:bg-white outline-none"
                      />
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleVerifyOtp()}
                    disabled={isLoading || otpDigits.join("").length !== 6}
                    className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs transition disabled:opacity-50"
                  >
                    {isLoading ? "Verifying Session..." : "Verify & Sign In →"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Business / Outlet ID
                </label>
                <input
                  type="text"
                  value={bizId}
                  onChange={(e) => setBizId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Master Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 font-bold">
              ⚠️ {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 font-bold">
              ✓ {successMsg}
            </div>
          )}

          <div className="flex items-center justify-between pt-1 text-[10px]">
            <span className="text-slate-500">Need help?</span>
            <a href="tel:+919118643415" className="text-blue-600 font-bold hover:underline">
              Call 24x7 Help Desk
            </a>
          </div>
        </div>

        {/* Divider */}
        <div className="relative my-3 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <span className="relative bg-[#F8FAFC] px-2 text-[10px] font-bold text-slate-400 uppercase">
            OR 1-TAP GOOGLE LOGIN
          </span>
        </div>

        {/* Google 1-Tap Button */}
        <button
          type="button"
          onClick={() => setIsGoogleModalOpen(true)}
          className="w-full py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 active:scale-98 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
          </svg>
          <span>Continue with Google (Auto-Login)</span>
        </button>
      </div>

      {/* CTA Footer */}
      <div className="pt-3 space-y-2">
        <button
          type="button"
          onClick={onGoToRegister}
          className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-300 transition"
        >
          + Register New Store / Business
        </button>
      </div>

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
        phone={mobile}
        onAutoFill={(code) => {
          setOtpDigits(code.split(""));
          handleVerifyOtp(code);
        }}
        onDismiss={() => setActiveWhatsAppOtp(null)}
      />
    </div>
  );
}
