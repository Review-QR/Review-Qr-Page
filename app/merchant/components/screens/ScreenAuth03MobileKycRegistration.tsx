"use client";

import React, { useState } from "react";
import GoogleConsentModal from "@/components/auth/GoogleConsentModal";
import WhatsAppOtpNotificationBanner from "@/components/auth/WhatsAppOtpNotificationBanner";

interface ScreenAuth03Props {
  category?: string;
  onBack?: () => void;
  onRegisterComplete?: (details?: { storeName: string; ownerName: string; phone: string; category: string }) => void;
  disableRedirect?: boolean;
}

export default function ScreenAuth03MobileKycRegistration({
  category = "kirana",
  onBack,
  onRegisterComplete,
  disableRedirect = false,
}: ScreenAuth03Props) {
  const [storeName, setStoreName] = useState(
    category === "kirana"
      ? "Shri Ram Kirana & Supermarket"
      : category === "chemist"
      ? "Sanjivani Medicos & Pharmacy"
      : category === "salon"
      ? "Looks Unisex Salon & Spa"
      : category === "carwash"
      ? "SpeedX Auto Foam Detailing"
      : "Golden Blossom Cafe"
  );
  const [ownerName, setOwnerName] = useState("Lucky Shukla");
  const [phone, setPhone] = useState("9118643415");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeWhatsAppOtp, setActiveWhatsAppOtp] = useState<string | null>(null);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // 1. Send WhatsApp OTP
  const handleSendOtp = async () => {
    if (phone.length < 10) {
      setErrorMsg("Please enter a valid 10-digit mobile number.");
      return;
    }
    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone, channel: "whatsapp" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to dispatch WhatsApp OTP.");
      }
      setOtpSent(true);
      if (data.previewOtp) {
        setActiveWhatsAppOtp(data.previewOtp);
      }
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
      const verifyRes = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone, otp: fullCode }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        throw new Error(verifyData.message || "Invalid OTP code.");
      }

      // Step B: Register profile in database
      const regRes = await fetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_merchant",
          phone,
          storeName,
          ownerName,
          category,
          city: "Bahraich",
        }),
      });
      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.message || "Registration failed.");
      }

      onRegisterComplete?.({ storeName, ownerName, phone, category });
      if (!disableRedirect && typeof window !== "undefined") {
        window.location.href = regData.redirectUrl || "/merchant/app";
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to register.");
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Google 1-Tap Register
  const handleGoogleRegister = async (googleUser: { email: string; fullName: string }) => {
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
          phone: phone || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        onRegisterComplete?.({ storeName, ownerName: googleUser.fullName, phone, category });
        if (!disableRedirect && typeof window !== "undefined") {
          window.location.href = data.redirectUrl || "/merchant/app";
        }
      } else {
        throw new Error(data.message || "Google sign-in failed.");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Google registration error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              REGISTRATION • STEP 2 OF 3
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Store KYC &amp; WhatsApp OTP
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Selected Category Pill */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-xs flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Selected Vertical:</span>
          <span className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
            {category} Mart
          </span>
        </div>

        {/* Registration Form */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2.5">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Official Store / Shop Name
            </label>
            <input
              type="text"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Proprietor / Owner Full Name
            </label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden focus:border-blue-600"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
              Mobile Number (WhatsApp OTP)
            </label>
            <div className="flex items-center rounded-xl border border-slate-300 bg-slate-50 px-2.5 py-1.5">
              <span className="text-xs font-bold text-slate-600 mr-2 border-r border-slate-300 pr-2">
                🇮🇳 +91
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                className="w-full text-xs font-mono font-bold text-slate-900 bg-transparent focus:outline-hidden tracking-wider"
              />
            </div>
          </div>

          {/* Delivery Channels */}
          <div className="grid grid-cols-2 gap-2 pt-0.5">
            <button
              type="button"
              disabled={true}
              title="SMS OTP is currently disabled pending TRAI DLT registration. Please use WhatsApp OTP."
              className="py-1.5 px-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-400 text-[10px] font-bold flex items-center justify-center gap-1 cursor-not-allowed opacity-75"
            >
              <span>💬 SMS</span>
              <span className="text-[8px] bg-amber-100 text-amber-800 px-1 py-0.2 rounded font-black">DLT Pending</span>
            </button>
            <button
              type="button"
              className="py-1.5 px-2 rounded-xl border-2 border-emerald-600 bg-emerald-50 text-emerald-950 text-[10px] font-black flex items-center justify-center gap-1 shadow-xs"
            >
              <span>🟢 WhatsApp</span>
              <span className="text-[8px] bg-emerald-200 text-emerald-900 px-1 py-0.2 rounded font-black">Active</span>
            </button>
          </div>

          {!otpSent ? (
            <button
              type="button"
              disabled={phone.length < 10 || isLoading}
              onClick={handleSendOtp}
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition disabled:opacity-50"
            >
              {isLoading ? "Sending OTP..." : "Get WhatsApp Verification Code →"}
            </button>
          ) : (
            <div className="space-y-2 pt-1 border-t border-slate-100">
              <label className="text-[10px] font-bold uppercase text-slate-600 block">
                Enter 6-Digit WhatsApp Code:
              </label>
              <div className="flex gap-1.5 justify-center">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`reg-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      const updated = [...otp];
                      updated[idx] = val;
                      setOtp(updated);
                      if (val && idx < 5) {
                        document.getElementById(`reg-otp-${idx + 1}`)?.focus();
                      }
                      if (idx === 5 && val) {
                        updated[5] = val;
                        handleVerifyAndRegister(updated.join(""));
                      }
                    }}
                    className="w-8 h-9 text-center font-mono font-black text-base rounded-lg border-2 border-slate-300 bg-slate-50 text-slate-900 focus:border-emerald-600 focus:bg-white outline-none"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Feedback message */}
          {errorMsg && (
            <div className="p-2 rounded-xl bg-red-50 border border-red-200 text-[11px] text-red-700 font-bold">
              ⚠️ {errorMsg}
            </div>
          )}
        </div>

        {/* Google 1-Tap Fast Track */}
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setIsGoogleModalOpen(true)}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            <span>Or Register Instantly with Google</span>
          </button>
        </div>
      </div>

      {/* CTA Footer */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isLoading || (!otpSent && phone.length < 10)}
          onClick={() => {
            if (!otpSent) handleSendOtp();
            else handleVerifyAndRegister();
          }}
          className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {isLoading ? (
            <span>Processing...</span>
          ) : (
            <span>✓ {!otpSent ? "SEND WHATSAPP OTP" : `VERIFY & OPEN ${category.toUpperCase()} CONSOLE`}</span>
          )}
        </button>
      </div>

      {/* Google Consent Modal */}
      <GoogleConsentModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        role="merchant"
        defaultName={ownerName || "Lucky Shukla"}
        defaultEmail="lucky.merchant@gmail.com"
        onSuccess={handleGoogleRegister}
      />

      {/* WhatsApp Floating Banner */}
      <WhatsAppOtpNotificationBanner
        otpCode={activeWhatsAppOtp}
        phone={phone}
        onAutoFill={(code) => {
          setOtp(code.split(""));
          handleVerifyAndRegister(code);
        }}
        onDismiss={() => setActiveWhatsAppOtp(null)}
      />
    </div>
  );
}
