"use client";

import React, { useState } from "react";
import { stripGooglePlusCode } from "@/lib/hyperlocal/address-format";
import {
  BAHRAICH_POPULAR_AREAS,
  CustomerLanguage,
  DetectedGpsLocation,
  t,
} from "./customer-types";

interface CustomerSplashProps {
  visible: boolean;
  onFinish: () => void;
}

/**
 * N-01: Custom Trustit Brand Splash Screen (#003178 -> #0d47a1).
 */
export function CustomerBrandSplash({ visible, onFinish }: CustomerSplashProps) {
  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[70] flex flex-col items-center justify-between bg-gradient-to-br from-[#003178] via-[#0d47a1] to-[#001945] text-white p-6">
      <div className="w-full flex justify-end">
        <button
          type="button"
          onClick={onFinish}
          className="rounded-full bg-white/15 hover:bg-white/25 px-3 py-1 text-[11px] font-bold text-white/90 transition"
        >
          Skip →
        </button>
      </div>

      <div className="flex flex-col items-center text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="h-20 w-20 rounded-3xl bg-white text-[#003178] flex items-center justify-center shadow-2xl border-4 border-[#9cf0ff]/40">
          <span className="text-4xl font-black tracking-tighter">T</span>
        </div>
        <div className="space-y-1">
          <div className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-[#9cf0ff]">
            TRUSTIT • BAHRAICH
          </div>
          <h1 className="text-2xl font-black tracking-tight">Trustit Super-App</h1>
          <p className="text-xs text-[#d9e2ff] max-w-xs">
            100% Verified Local Stores, Kirana Parcha, Medical Rx &amp; Fast Doorstep Delivery
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold text-[#8df7c1]">
          <span className="h-2 w-2 rounded-full bg-[#8df7c1] animate-pulse" />
          <span>Preparing Bahraich Live Hub &amp; GPS...</span>
        </div>
      </div>

      <button
        type="button"
        onClick={onFinish}
        className="w-full max-w-sm rounded-2xl bg-white text-[#003178] py-3 text-xs font-black shadow-xl hover:bg-[#f2f3ff] transition"
      >
        Explore Bahraich Stores →
      </button>
    </div>
  );
}

export interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueAsGuest?: () => void;
  requireAuthChoice?: boolean;
  districtName?: string;
  lang: CustomerLanguage;
  step: "welcome_back" | "login" | "otp" | "name_push" | "gps_lock";
  setStep: (s: "welcome_back" | "login" | "otp" | "name_push" | "gps_lock") => void;
  rememberedUser: { id: string; name: string; phone: string; email: string } | null;
  onContinueRemembered: () => void;
  authMode: "phone" | "email";
  setAuthMode: (m: "phone" | "email") => void;
  loginPhone: string;
  setLoginPhone: (v: string) => void;
  loginEmail: string;
  setLoginEmail: (v: string) => void;
  loginOtp: string;
  setLoginOtp: (v: string) => void;
  loginOtpCountdown: number;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  isGoogleLoading: boolean;
  otpError: string;
  otpNotice: string;
  onSendOtp: (overrideId?: string, channel?: "sms" | "whatsapp") => void;
  onVerifyOtp: () => void;
  onOpenGoogleModal: () => void;
  newCustomerName: string;
  setNewCustomerName: (v: string) => void;
  pushEnabled: boolean;
  onEnablePushAndSaveName: (
    allowPush: boolean,
    addressDetails?: {
      locality: string;
      houseStreet: string;
      fullAddress: string;
      landmark?: string;
      cityPincode?: string;
      tag: "Home" | "Work" | "Other";
    },
  ) => void;
  userLiveLocation: string;
  addrPincode: string;
  isDetectingGps: boolean;
  onDetectGps: () => Promise<DetectedGpsLocation | null>;
  onSelectBahraichArea: (area: { name: string; mohalla: string; pincode: string; lat: number; lng: number }) => void;
}

/**
 * N-02 to N-06: Clean Bahraich Onboarding Sheet.
 */
export function CustomerOnboardingModal({
  isOpen,
  onClose,
  onContinueAsGuest,
  requireAuthChoice = false,
  districtName = "Bahraich",
  lang,
  step,
  setStep,
  rememberedUser,
  onContinueRemembered,
  authMode,
  setAuthMode,
  loginPhone,
  setLoginPhone,
  loginEmail,
  setLoginEmail,
  loginOtp,
  setLoginOtp,
  loginOtpCountdown,
  isSendingOtp,
  isVerifyingOtp,
  isGoogleLoading,
  otpError,
  otpNotice,
  onSendOtp,
  onVerifyOtp,
  onOpenGoogleModal,
  newCustomerName,
  setNewCustomerName,
  pushEnabled,
  onEnablePushAndSaveName,
  userLiveLocation,
  addrPincode,
  isDetectingGps,
  onDetectGps,
  onSelectBahraichArea,
}: OnboardingModalProps) {
  const [areaSearch, setAreaSearch] = useState("");
  const [profileHouseFlat, setProfileHouseFlat] = useState("");
  const [profileLocality, setProfileLocality] = useState("");
  const [profileLandmark, setProfileLandmark] = useState("");
  const [profileCityPincode, setProfileCityPincode] = useState("Bahraich, 271801");
  const [profileAddressTag, setProfileAddressTag] = useState<"Home" | "Work" | "Other">("Home");
  const [gpsPrefillNote, setGpsPrefillNote] = useState<string>("");
  const [showTermsModal, setShowTermsModal] = useState(false);

  React.useEffect(() => {
    if (!userLiveLocation) return;
    if (!profileLocality) {
      setProfileLocality(stripGooglePlusCode(userLiveLocation) || userLiveLocation);
    }
    if (addrPincode && (!profileCityPincode || profileCityPincode === "Bahraich, 271801")) {
      setProfileCityPincode(`Bahraich, ${addrPincode}`);
    }
  }, [userLiveLocation, addrPincode, profileLocality, profileCityPincode]);

  const handleAutoDetectProfileAddress = async () => {
    setGpsPrefillNote("");
    const detected = await onDetectGps();
    if (detected) {
      const detectedLocality = stripGooglePlusCode(
        detected.mohalla || detected.locationName || detected.street || detected.formattedAddress || "",
      );
      if (detectedLocality) {
        setProfileLocality(detectedLocality);
      }
      if (detected.landmark) {
        const cleanLm = stripGooglePlusCode(detected.landmark);
        if (cleanLm && cleanLm.toLowerCase() !== detectedLocality.toLowerCase()) {
          setProfileLandmark(cleanLm);
        }
      }
      const detectedCity = detected.city || "Bahraich";
      const detectedPin = detected.pincode || addrPincode || "271801";
      setProfileCityPincode(`${detectedCity}, ${detectedPin}`);
      setGpsPrefillNote("Location auto-filled from GPS. Please enter your House / Flat No. and Landmark.");
    } else if (userLiveLocation) {
      setProfileLocality(stripGooglePlusCode(userLiveLocation) || userLiveLocation);
      setProfileCityPincode(`Bahraich, ${addrPincode || "271801"}`);
    }
  };

  if (!isOpen) return null;

  const maskedPhone = rememberedUser?.phone
    ? `+91 ${rememberedUser.phone.slice(0, 2)}*****${rememberedUser.phone.slice(-3)}`
    : "";

  const filteredAreas = BAHRAICH_POPULAR_AREAS.filter(
    (a) =>
      !areaSearch.trim() ||
      a.name.toLowerCase().includes(areaSearch.trim().toLowerCase()) ||
      a.mohalla.toLowerCase().includes(areaSearch.trim().toLowerCase()),
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-[#c3c6d4]/60 overflow-hidden animate-in slide-in-from-bottom-4 duration-200 max-h-[92vh] flex flex-col">
        <div className="bg-gradient-to-r from-[#003178] to-[#0d47a1] px-5 py-3.5 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-[#9cf0ff]">
              {step === "welcome_back" && "N-02 • Welcome Back"}
              {step === "login" && "N-03 • India +91 Sign In"}
              {step === "otp" && "N-04 • WhatsApp Verification"}
              {step === "name_push" && "N-05 • Profile & Order Alerts"}
              {step === "gps_lock" && `N-06 • ${districtName || "Local"} GPS Lock`}
            </div>
            <h3 className="text-sm font-extrabold">
              {step === "welcome_back" && t(lang, "Continue Your Account", "अपना अकाउंट जारी रखें")}
              {step === "login" && t(lang, "Sign in or Sign up", "लॉगिन या नया अकाउंट बनाएँ")}
              {step === "otp" && t(lang, "Enter 6-Digit OTP", "6-अंकों का OTP दर्ज करें")}
              {step === "name_push" && t(lang, "Quick Setup (One Time)", "प्रोफ़ाइल व अलर्ट सेटअप")}
              {step === "gps_lock" && t(lang, "Confirm Delivery Area", "डिलीवरी इलाका चुनें")}
            </h3>
          </div>
          {!(requireAuthChoice && (step === "login" || step === "welcome_back")) && (
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center justify-center"
              aria-label="Close"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {otpNotice && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-2.5 text-xs font-semibold text-emerald-900">
              {otpNotice}
            </div>
          )}
          {otpError && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-900">
              {otpError}
            </div>
          )}

          {step === "welcome_back" && rememberedUser && (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-[#003178]/20 bg-[#f2f3ff] p-4 flex items-center gap-3.5">
                <div className="h-12 w-12 rounded-2xl bg-[#003178] text-white font-black text-lg flex items-center justify-center shrink-0">
                  {rememberedUser.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#006875]">
                    {t(lang, "Saved Trustit Profile", "सेव किया गया प्रोफ़ाइल")}
                  </div>
                  <div className="text-base font-black text-[#131b2e] truncate">
                    {rememberedUser.name}
                  </div>
                  <div className="text-xs font-mono text-[#434652]">
                    {maskedPhone || rememberedUser.email} • {districtName || "Local"}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onContinueRemembered}
                className="w-full rounded-xl bg-gradient-to-r from-[#003178] to-[#0d47a1] hover:opacity-95 py-2.5 text-[11.5px] font-black text-white shadow-sm transition"
              >
                {t(lang, `Continue as ${rememberedUser.name} →`, `${rememberedUser.name} के रूप में जारी रखें →`)}
              </button>

              <button
                type="button"
                onClick={() => setStep("login")}
                className="w-full rounded-xl border border-[#c3c6d4] bg-white hover:bg-[#faf8ff] py-2 text-[11.5px] font-bold text-[#434652] transition"
              >
                {t(lang, "Use another mobile number", "दूसरा मोबाइल नंबर इस्तेमाल करें")}
              </button>

              <button
                type="button"
                onClick={() => (onContinueAsGuest ? onContinueAsGuest() : onClose())}
                className="w-full rounded-xl border border-[#003178]/25 bg-[#f2f3ff] hover:bg-[#eaedff] py-2 text-[11.5px] font-extrabold text-[#003178] transition"
              >
                {t(lang, "Continue as Guest →", "गेस्ट के रूप में जारी रखें →")}
              </button>
            </div>
          )}

          {step === "login" && (
            <div className="space-y-4">
              {authMode === "phone" ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#434652] mb-1.5">
                      {t(lang, "Indian Mobile Number (+91 Locked)", "मोबाइल नंबर (🇮🇳 +91 लॉक)")}
                    </label>
                    <div className="flex items-center rounded-2xl border-2 border-[#003178]/30 focus-within:border-[#003178] bg-[#faf8ff] px-3.5 py-2.5">
                      <span className="text-xs font-black text-[#003178] mr-2.5 pr-2.5 border-r border-[#c3c6d4] shrink-0">
                        🇮🇳 +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="10-digit mobile number"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && loginPhone.length === 10) onSendOtp(undefined, "whatsapp");
                        }}
                        className="w-full bg-transparent text-sm font-bold text-[#131b2e] font-mono tracking-wider outline-none placeholder:font-sans placeholder:text-xs placeholder:text-[#737783]"
                      />
                    </div>
                    <p className="mt-1.5 text-[11px] text-[#006875] font-semibold flex items-center gap-1.5">
                      <span>💬</span>
                      <span>
                        {t(
                          lang,
                          "Instant 6-digit verification code sent via WhatsApp.",
                          "तुरंत 6-अंकों का कोड आपके WhatsApp पर भेजा जाएगा।",
                        )}
                      </span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      disabled={isSendingOtp || loginPhone.length !== 10}
                      onClick={() => onSendOtp(undefined, "whatsapp")}
                      className="rounded-xl bg-gradient-to-r from-[#059669] to-[#047857] hover:from-[#047857] hover:to-[#065f46] py-2 px-2.5 text-[11.5px] font-black text-white shadow-sm disabled:opacity-50 transition"
                    >
                      {isSendingOtp ? "Sending..." : "WhatsApp OTP →"}
                    </button>
                    <button
                      type="button"
                      disabled={isSendingOtp || loginPhone.length !== 10}
                      onClick={() => onSendOtp(undefined, "sms")}
                      className="rounded-xl border border-[#003178]/25 bg-white hover:bg-[#f2f3ff] py-2 px-2.5 text-[11.5px] font-extrabold text-[#003178] shadow-2xs disabled:opacity-50 transition"
                    >
                      SMS Text OTP
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-[#434652] mb-1.5">
                      {t(lang, "Email Address (Backup Sign-In)", "ईमेल पता (वैकल्पिक बैकअप)")}
                    </label>
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && loginEmail.includes("@")) onSendOtp(loginEmail);
                      }}
                      className="w-full rounded-xl border-2 border-[#003178]/30 focus:border-[#003178] bg-[#faf8ff] px-3.5 py-2 text-sm font-semibold text-[#131b2e] outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    disabled={isSendingOtp || !loginEmail.includes("@")}
                    onClick={() => onSendOtp(loginEmail)}
                    className="w-full rounded-xl bg-[#003178] hover:bg-[#0d47a1] py-2 text-[11.5px] font-black text-white shadow-sm disabled:opacity-50 transition"
                  >
                    {isSendingOtp ? "Sending Email Code..." : "Send Email OTP →"}
                  </button>
                </div>
              )}

              <div>
                <button
                  type="button"
                  onClick={() => (onContinueAsGuest ? onContinueAsGuest() : onClose())}
                  className="w-full rounded-xl border border-[#003178]/25 bg-[#f2f3ff] hover:bg-[#eaedff] py-2 text-[11.5px] font-extrabold text-[#003178] transition"
                >
                  {t(lang, "Continue as Guest →", "गेस्ट के रूप में जारी रखें →")}
                </button>
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="space-y-4">
              <div className="text-center space-y-1">
                <div className="text-xs text-[#434652]">
                  {t(lang, "Enter 6-digit code sent to", "भेजा गया 6-अंकों का कोड दर्ज करें")}
                </div>
                <div className="text-sm font-black text-[#003178] font-mono">
                  {authMode === "phone" ? `+91 ${loginPhone}` : loginEmail}
                </div>
                <button
                  type="button"
                  onClick={() => setStep("login")}
                  className="text-[11px] font-bold text-[#006875] hover:underline"
                >
                  ← Change {authMode === "phone" ? "Number" : "Email"}
                </button>
              </div>

              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="• • • • • •"
                value={loginOtp}
                onChange={(e) => setLoginOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && loginOtp.length === 6) onVerifyOtp();
                }}
                className="w-full rounded-2xl border-2 border-[#003178]/40 focus:border-[#003178] bg-[#f2f3ff] px-3 py-3 text-center font-mono text-xl sm:text-2xl font-black tracking-[0.25em] sm:tracking-[0.35em] text-[#003178] outline-none"
              />

              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[#737783]">Didn&apos;t receive code?</span>
                {loginOtpCountdown > 0 ? (
                  <span className="font-mono font-bold text-[#006875]">
                    Resend in 00:{String(loginOtpCountdown).padStart(2, "0")}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => onSendOtp(undefined, authMode === "phone" ? "whatsapp" : undefined)}
                    className="font-bold text-[#003178] hover:underline"
                  >
                    ↻ Resend WhatsApp OTP
                  </button>
                )}
              </div>

              <button
                type="button"
                disabled={isVerifyingOtp || loginOtp.length !== 6}
                onClick={onVerifyOtp}
                className="w-full rounded-2xl bg-[#003178] hover:bg-[#0d47a1] py-3 text-xs font-black text-white shadow-md disabled:opacity-50 transition"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify & Continue →"}
              </button>
            </div>
          )}

          {step === "name_push" && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#434652] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="w-full rounded-2xl border-2 border-[#c3c6d4] focus:border-[#059669] bg-[#faf8ff] px-3.5 py-2.5 text-sm font-bold text-[#131b2e] outline-none"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#434652]">Detailed Delivery Address</span>
                  <button
                    type="button"
                    disabled={isDetectingGps}
                    onClick={handleAutoDetectProfileAddress}
                    className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-[#059669] text-[11px] font-extrabold hover:bg-emerald-100 transition disabled:opacity-60 shrink-0"
                  >
                    {isDetectingGps ? "Detecting GPS..." : "📍 Auto-Detect Location"}
                  </button>
                </div>

                {gpsPrefillNote && (
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-[10.5px] font-semibold text-emerald-900">
                    {gpsPrefillNote}
                  </div>
                )}

                {/* 4 Full-Width Stacked Lines for Clear Address Entry */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                      House / Flat / Floor No. *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. House 42, 1st Floor"
                      value={profileHouseFlat}
                      onChange={(e) => setProfileHouseFlat(e.target.value)}
                      className="w-full rounded-xl border border-[#c3c6d4] focus:border-[#059669] bg-[#faf8ff] px-3 py-2 text-xs font-semibold text-[#131b2e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                      Street / Mohalla / Locality *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Civil Lines, Peepal Chauraha"
                      value={profileLocality}
                      onChange={(e) => setProfileLocality(e.target.value)}
                      className="w-full rounded-xl border border-[#c3c6d4] focus:border-[#059669] bg-[#faf8ff] px-3 py-2 text-xs font-semibold text-[#131b2e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                      Nearest Landmark (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near District Hospital / SBI Bank"
                      value={profileLandmark}
                      onChange={(e) => setProfileLandmark(e.target.value)}
                      className="w-full rounded-xl border border-[#c3c6d4] focus:border-[#059669] bg-[#faf8ff] px-3 py-2 text-xs font-semibold text-[#131b2e] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10.5px] font-bold text-[#434652] mb-1">
                      City &amp; Pincode *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Bahraich, 271801"
                      value={profileCityPincode}
                      onChange={(e) => setProfileCityPincode(e.target.value)}
                      className="w-full rounded-xl border border-[#c3c6d4] focus:border-[#059669] bg-[#faf8ff] px-3 py-2 text-xs font-semibold text-[#131b2e] outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                  {(["Home", "Work", "Other"] as const).map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setProfileAddressTag(tag)}
                      className={`rounded-xl border py-1.5 text-[11px] font-bold transition ${
                        profileAddressTag === tag
                          ? "bg-[#059669] text-white border-[#059669]"
                          : "bg-white text-[#434652] border-[#c3c6d4]"
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-[#006875]/30 bg-[#f2f3ff] p-3 space-y-1">
                <div className="text-xs font-extrabold text-[#131b2e]">
                  Live Order &amp; Handover PIN Alerts
                </div>
                <div className="text-[10px] font-semibold text-[#006875]">
                  Android 13+ Notification &amp; Live Tracking Ready {pushEnabled ? "• Already Active ✓" : ""}
                </div>
              </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    disabled={isVerifyingOtp || !newCustomerName.trim()}
                    onClick={() => {
                      const combinedFull = [
                        profileHouseFlat.trim(),
                        profileLocality.trim(),
                        profileLandmark.trim() ? `Near ${profileLandmark.trim()}` : "",
                        profileCityPincode.trim(),
                      ]
                        .filter(Boolean)
                        .join(", ");
                      onEnablePushAndSaveName(true, {
                        locality: profileLocality,
                        houseStreet: profileHouseFlat,
                        landmark: profileLandmark,
                        cityPincode: profileCityPincode,
                        fullAddress: combinedFull,
                        tag: profileAddressTag,
                      });
                    }}
                    className="w-full rounded-2xl bg-[#059669] hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md disabled:opacity-50 transition"
                  >
                    {isVerifyingOtp
                      ? "Saving Profile..."
                      : profileLocality.trim() || profileHouseFlat.trim()
                      ? "Save Profile & Verify Address →"
                      : "Save Profile & Choose Address →"}
                  </button>
                  <button
                    type="button"
                    disabled={isVerifyingOtp || !newCustomerName.trim()}
                    onClick={() => onEnablePushAndSaveName(true)}
                    className="w-full rounded-xl border border-[#c3c6d4] bg-white hover:bg-[#f2f3ff] py-2 text-[11px] font-bold text-[#003178] disabled:opacity-50 transition"
                  >
                    Verify Address Later (At Checkout) →
                  </button>
                </div>
            </div>
          )}

          {step === "gps_lock" && (
            <div className="space-y-4">
              <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/70 p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
                    📡 Current {districtName || "Live"} Signal
                  </span>
                  <span className="rounded-full bg-emerald-600 text-white px-2 py-0.5 text-[10px] font-bold">
                    PIN {addrPincode || "271801"}
                  </span>
                </div>
                <div className="text-sm font-black text-[#131b2e]">{userLiveLocation}</div>
                <button
                  type="button"
                  disabled={isDetectingGps}
                  onClick={onDetectGps}
                  className="w-full rounded-xl bg-white border border-emerald-300 py-2 text-xs font-extrabold text-emerald-900 hover:bg-emerald-100/60 transition"
                >
                  {isDetectingGps ? "🛰️ Locking High-Precision GPS..." : "🔄 Re-detect Exact Hardware GPS"}
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#434652] mb-1.5">
                  Or pick your Bahraich Mohalla / Area
                </label>
                <input
                  type="text"
                  placeholder="Search Civil Lines, Ghantaghar, Station Road..."
                  value={areaSearch}
                  onChange={(e) => setAreaSearch(e.target.value)}
                  className="w-full rounded-xl border border-[#c3c6d4] bg-[#faf8ff] px-3 py-2 text-xs font-semibold text-[#131b2e] outline-none focus:border-[#003178] mb-2"
                />
                <div className="grid grid-cols-1 gap-1.5 max-h-48 overflow-y-auto">
                  {filteredAreas.map((area) => (
                    <button
                      key={area.name}
                      type="button"
                      onClick={() => onSelectBahraichArea(area)}
                      className="flex items-center justify-between rounded-xl border border-[#eaedff] bg-[#faf8ff] hover:bg-[#f2f3ff] hover:border-[#003178]/40 px-3 py-2 text-left transition"
                    >
                      <div>
                        <div className="text-xs font-bold text-[#131b2e]">{area.mohalla}</div>
                        <div className="text-[10px] text-[#737783]">{area.name} • {area.pincode}</div>
                      </div>
                      <span className="text-xs font-bold text-[#003178]">Select →</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-2xl bg-[#059669] hover:bg-emerald-700 py-3 text-xs font-black text-white shadow-md transition"
                >
                  Confirm Location &amp; Shop →
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full rounded-xl border border-[#c3c6d4] bg-white hover:bg-[#f2f3ff] py-2 text-[11px] font-bold text-[#003178] transition"
                >
                  Skip for Now (Verify Address at Checkout)
                </button>
              </div>
            </div>
          )}

          {(step === "login" || step === "otp") && (
            <div className="pt-2.5 mt-1 border-t border-slate-200/70 text-center">
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className="text-[11px] font-semibold text-slate-600 hover:text-[#003178] leading-relaxed transition"
              >
                By signing in you agree to{" "}
                <span className="font-extrabold text-[#003178] underline underline-offset-2">
                  TRUSTIT Terms of Service &amp; Local Safety Assurance
                </span>
                .
              </button>
            </div>
          )}
        </div>
      </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-[#c3c6d4] overflow-hidden">
            <div className="bg-gradient-to-r from-[#003178] to-[#0d47a1] px-5 py-3.5 text-white flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#9cf0ff]">
                  Legal &amp; Privacy
                </div>
                <h4 className="text-sm font-black">Terms of Service &amp; Local Safety Assurance</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="h-7 w-7 rounded-full bg-white/15 hover:bg-white/25 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs text-[#434652] leading-relaxed max-h-[75vh] overflow-y-auto">
              <div className="rounded-2xl bg-[#f2f3ff] border border-[#dae2fd] p-3 text-[11px] text-[#434652] leading-relaxed">
                <strong className="text-[#003178]">🛡️ DPDP Act 2023 Security:</strong> Your mobile number is used strictly for WhatsApp &amp; SMS OTP login, rider gate handover, and Cashfree refund receipts. No spam.
              </div>

              <div className="rounded-2xl border border-[#eaedff] bg-[#faf8ff] p-3 space-y-1.5 text-[11px]">
                <div className="font-black text-[#003178]">✓ Terms of Service</div>
                <p>
                  Orders placed via Trustit connect directly with verified local Bahraich merchants. Prices, packaging, and delivery ETAs are confirmed transparently before checkout.
                </p>
              </div>

              <div className="rounded-2xl border border-[#eaedff] bg-[#faf8ff] p-3 space-y-1.5 text-[11px]">
                <div className="font-black text-[#003d27]">✓ Local Safety Assurance</div>
                <p>
                  All partner stores and delivery riders undergo KYC &amp; hub verification. Gate handover uses a secure 4-digit PIN and instant IMPS refund protection via Cashfree.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-full rounded-xl bg-[#003178] hover:bg-[#0d47a1] py-2.5 text-xs font-black text-white transition"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
