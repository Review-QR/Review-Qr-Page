"use client";

import React, { useState, useEffect } from "react";
import { TrustitNative } from "@/lib/native/trustit-native-service";

interface ScreenAuth03Props {
  category?: string;
  onBack?: () => void;
  onLoginSuccess?: (details?: { storeName?: string; ownerName?: string; phone?: string; category?: string }) => void;
  onRegisterComplete?: (details?: { storeName: string; ownerName: string; phone: string; category: string }) => void;
  disableRedirect?: boolean;
}

export type BusinessCategoryType = "kirana" | "restaurant" | "chemist" | "salon" | "carwash";

const CATEGORIES: Array<{
  id: BusinessCategoryType;
  icon: string;
  labelHi: string;
  labelEn: string;
  badge: string;
}> = [
  { id: "kirana", icon: "🛒", labelHi: "किराना व जनरल", labelEn: "Kirana & Grocery", badge: "Daily Mart" },
  { id: "restaurant", icon: "☕", labelHi: "रेस्टोरेंट व फ़ूड", labelEn: "Food & Cafe", badge: "Live KOT" },
  { id: "chemist", icon: "💊", labelHi: "दवा व मेडिकल", labelEn: "Chemist & Rx", badge: "Pharmacy" },
  { id: "salon", icon: "✂️", labelHi: "सैलून व ब्यूटी", labelEn: "Salon & Spa", badge: "Chair Queue" },
  { id: "carwash", icon: "🚗", labelHi: "कार वॉश व ऑटो", labelEn: "Car Wash & Auto", badge: "Service Bay" },
];

/**
 * ScreenAuth03MobileKycRegistration:
 * Unified WhatsApp Phone & OTP Authentication + Auto-Login + GPS Onboarding Flow.
 * - Single entry point for both 'Register' and 'Login'
 * - Checks DB on OTP verify:
 *     - If phone exists in DB: Direct instant login to Dashboard!
 *     - If new phone: Opens Store Profile Setup with Name, Category & GPS Auto-Fetch
 * - Zero "Continue with Google"
 * - Instant "Edit Number" button to fix mistyped phone numbers
 */
export default function ScreenAuth03MobileKycRegistration({
  onBack,
  onLoginSuccess,
  onRegisterComplete,
  disableRedirect = false,
}: ScreenAuth03Props) {
  // Step: "phone_otp" (Stage 1) or "profile_setup" (Stage 2 for new merchants)
  const [step, setStep] = useState<"phone_otp" | "profile_setup">("phone_otp");

  // Phone & OTP state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState<number>(30);
  const [canResend, setCanResend] = useState(false);

  // New Merchant Profile Setup state
  const [ownerName, setOwnerName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [category, setCategory] = useState<BusinessCategoryType>("kirana");
  const [address, setAddress] = useState("");
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gpsLocked, setGpsLocked] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle OTP resend countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (otpSent && otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer((prev) => prev - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [otpSent, otpTimer]);

  // Hardware back button handler inside auth
  useEffect(() => {
    const handleBack = () => {
      if (step === "profile_setup") {
        setStep("phone_otp");
        return true;
      }
      if (otpSent) {
        setOtpSent(false);
        setOtp(["", "", "", "", "", ""]);
        return true;
      }
      if (onBack) {
        onBack();
        return true;
      }
      return false;
    };

    (window as any).__handleTrustitBack = handleBack;
    return () => {
      delete (window as any).__handleTrustitBack;
    };
  }, [step, otpSent, onBack]);

  // 1. Send WhatsApp OTP
  const handleSendOtp = async () => {
    const cleanNumber = phone.trim().replace(/\D/g, "");
    if (cleanNumber.length !== 10) {
      setErrorMsg("कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें। (Enter 10-digit mobile number)");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const res = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send_otp", phone: cleanNumber, channel: "whatsapp" }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "WhatsApp OTP भेजने में विफल।");
      }

      setOtpSent(true);
      setOtp(["", "", "", "", "", ""]);
      setOtpTimer(30);
      setCanResend(false);

      const previewNote = data.previewOtp ? ` [Code: ${data.previewOtp}]` : "";
      setSuccessMsg(`WhatsApp पर 6-अंकों का वेरिफिकेशन कोड भेज दिया गया है (+91 ${cleanNumber})${previewNote}`);

      // Auto-focus first digit after render
      setTimeout(() => {
        document.getElementById("otp-input-0")?.focus();
      }, 200);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "OTP भेजने में त्रुटि आई।");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Change / Edit Phone Number (fixes mistyped numbers instantly)
  const handleEditNumber = () => {
    setOtpSent(false);
    setOtp(["", "", "", "", "", ""]);
    setErrorMsg(null);
    setSuccessMsg(null);
    setTimeout(() => {
      document.getElementById("merchant-phone-input")?.focus();
    }, 100);
  };

  // 3. Handle OTP Input Digits
  const handleOtpChange = (idx: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val.slice(-1);
    setOtp(newOtp);

    // Auto-advance
    if (val && idx < 5) {
      document.getElementById(`otp-input-${idx + 1}`)?.focus();
    }

    // Auto-verify when 6th digit entered
    if (idx === 5 && val) {
      const fullCode = newOtp.join("");
      if (fullCode.length === 6) {
        handleVerifyOtp(fullCode);
      }
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      document.getElementById(`otp-input-${idx - 1}`)?.focus();
    }
  };

  // 4. Verify OTP & Check Database for Existing vs New Merchant
  const handleVerifyOtp = async (codeToVerify?: string) => {
    const cleanNumber = phone.trim().replace(/\D/g, "");
    const fullCode = codeToVerify || otp.join("");
    if (fullCode.length !== 6) {
      setErrorMsg("कृपया पूरा 6-अंकों का OTP कोड दर्ज करें।");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify_otp", phone: cleanNumber, otp: fullCode }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "अमान्य OTP कोड। कृपया WhatsApp चेक करें।");
      }

      // CASE A: EXISTING MERCHANT FOUND IN DATABASE -> DIRECT LOGIN!
      if (!data.isNewMerchant) {
        const activeStoreName = data.storeName || data.businessName || "My Store";
        const activeOwnerName = data.ownerName || "Merchant Partner";
        const activeCategory = (data.category as BusinessCategoryType) || "kirana";

        // Save session locally for persistent cold-boot
        if (typeof window !== "undefined") {
          localStorage.setItem(
            "trustit_merchant_session",
            JSON.stringify({
              isAuthenticated: true,
              storeName: activeStoreName,
              ownerName: activeOwnerName,
              category: activeCategory,
              phone: cleanNumber,
              businessId: data.businessId,
            })
          );
        }

        TrustitNative.playHapticFeedback("success").catch(() => {});

        if (onLoginSuccess) {
          onLoginSuccess({
            storeName: activeStoreName,
            ownerName: activeOwnerName,
            phone: cleanNumber,
            category: activeCategory,
          });
        }

        if (!disableRedirect && typeof window !== "undefined") {
          window.location.href = data.redirectUrl || "/partner";
        }
        return;
      }

      // CASE B: NEW MERCHANT -> PROCEED TO STORE DETAILS & GPS ONBOARDING!
      TrustitNative.playHapticFeedback("click").catch(() => {});
      setStep("profile_setup");
      setSuccessMsg("फ़ोन नंबर सफलतापूर्वक सत्यापित हुआ! कृपया अपनी दुकान की जानकारी दर्ज करें।");
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "वेरिफिकेशन विफल रहा।");
      TrustitNative.playHapticFeedback("heavy").catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  // 5. GPS Auto-Fetch Location (High Accuracy via Android GPS / Geolocation)
  const handleAutoFetchGps = async () => {
    setIsGpsLoading(true);
    setErrorMsg(null);
    TrustitNative.playHapticFeedback("click").catch(() => {});

    try {
      const loc = await TrustitNative.getPreciseLocation();
      if (loc && loc.latitude && loc.longitude) {
        setLatitude(loc.latitude);
        setLongitude(loc.longitude);
        setGpsLocked(true);

        const fullLocStr = [
          loc.address,
          loc.mohalla,
          loc.city || "Bahraich",
          loc.pincode ? `PIN: ${loc.pincode}` : "",
        ]
          .filter(Boolean)
          .join(", ");

        setAddress(fullLocStr || `${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)}, Bahraich`);
        TrustitNative.playHapticFeedback("success").catch(() => {});
      } else {
        throw new Error("GPS लोकेशन प्राप्त नहीं हो सकी। कृपया लोकेशन परमिशन चेक करें।");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "GPS लोकेशन प्राप्त करने में विफल।");
      TrustitNative.playHapticFeedback("heavy").catch(() => {});
    } finally {
      setIsGpsLoading(false);
    }
  };

  // 6. Complete New Merchant Registration
  const handleCompleteRegistration = async () => {
    const cleanNumber = phone.trim().replace(/\D/g, "");
    if (!ownerName.trim()) {
      setErrorMsg("कृपया अपना / प्रोपराइटर का नाम दर्ज करें। (Enter Owner Name)");
      return;
    }
    if (!storeName.trim()) {
      setErrorMsg("कृपया दुकान का नाम दर्ज करें। (Enter Store Name)");
      return;
    }
    if (!address.trim()) {
      setErrorMsg("कृपया दुकान का पता दर्ज करें या 'GPS से पता लाएं' दबाएं।");
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const regRes = await TrustitNative.nativeFetch("/api/merchant/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register_merchant",
          phone: cleanNumber,
          storeName: storeName.trim(),
          ownerName: ownerName.trim(),
          category,
          city: "Bahraich",
          address: address.trim(),
          latitude: latitude || 27.5744,
          longitude: longitude || 81.5977,
        }),
      });

      const regData = await regRes.json();
      if (!regRes.ok || !regData.success) {
        throw new Error(regData.message || "दुकान रजिस्टर करने में विफल।");
      }

      // Save session locally
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "trustit_merchant_session",
          JSON.stringify({
            isAuthenticated: true,
            storeName: storeName.trim(),
            ownerName: ownerName.trim(),
            category,
            phone: cleanNumber,
            businessId: regData.businessId,
          })
        );
      }

      TrustitNative.playHapticFeedback("success").catch(() => {});

      if (onRegisterComplete) {
        onRegisterComplete({
          storeName: storeName.trim(),
          ownerName: ownerName.trim(),
          phone: cleanNumber,
          category,
        });
      } else if (onLoginSuccess) {
        onLoginSuccess({
          storeName: storeName.trim(),
          ownerName: ownerName.trim(),
          phone: cleanNumber,
          category,
        });
      }

      if (!disableRedirect && typeof window !== "undefined") {
        window.location.href = regData.redirectUrl || "/partner";
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "रजिस्ट्रेशन असफल रहा।");
      TrustitNative.playHapticFeedback("heavy").catch(() => {});
    } finally {
      setIsLoading(false);
    }
  };

  // =========================================================================
  // RENDER: STAGE 1 (PHONE & WHATSAPP OTP VERIFICATION)
  // =========================================================================
  if (step === "phone_otp") {
    return (
      <div className="w-full h-full bg-[#FAF9F6] text-slate-900 flex flex-col justify-between p-4 font-sans select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <div>
          {/* Header Bar */}
          <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center font-black text-sm shadow-md">
                T
              </div>
              <div>
                <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block leading-tight">
                  TRUSTIT PARTNER
                </span>
                <h1 className="text-xs font-black text-slate-900 leading-none">
                  WhatsApp Phone Verification
                </h1>
              </div>
            </div>
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white border border-amber-200 active:scale-95 transition"
              >
                ← Back
              </button>
            )}
          </div>

          {/* Value Pitch Banner */}
          <div className="mt-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-300 rounded-2xl p-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">💬</span>
              <div>
                <h2 className="text-xs font-black text-emerald-950">
                  सीधा WhatsApp OTP लॉगिन व रजिस्ट्रेशन
                </h2>
                <p className="text-[10px] text-emerald-800 leading-tight mt-0.5">
                  पासवर्ड की कोई झंझट नहीं। आपका मोबाइल नंबर ही आपकी आधिकारिक मर्चेंट पहचान है।
                </p>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="mt-3.5 bg-white border border-amber-200/80 rounded-2xl p-4 shadow-sm space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-black uppercase text-slate-600 block">
                  मोबाइल नंबर (Mobile Number)
                </label>
                {otpSent && (
                  <button
                    type="button"
                    onClick={handleEditNumber}
                    className="text-[10px] font-black text-amber-700 hover:text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-300 transition active:scale-95 flex items-center gap-1"
                  >
                    <span>✏️ गलत नंबर? बदलें</span>
                  </button>
                )}
              </div>

              {/* Single-Pill Phone Input */}
              <div className="flex items-center rounded-xl border-2 border-amber-300 bg-amber-50/30 px-3 py-2.5 focus-within:bg-white focus-within:border-emerald-600 transition shadow-inner">
                <span className="text-xs font-black text-slate-700 mr-2.5 border-r border-amber-300 pr-2.5 select-none flex items-center gap-1.5">
                  <span className="text-sm">🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  id="merchant-phone-input"
                  type="tel"
                  maxLength={10}
                  disabled={otpSent}
                  value={phone}
                  autoComplete="tel"
                  placeholder="10 अंकों का मोबाइल नंबर"
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-sm font-mono font-black text-slate-900 bg-transparent focus:outline-none tracking-wider placeholder:text-slate-400 placeholder:font-sans placeholder:font-normal placeholder:text-xs disabled:text-slate-600"
                />
                {otpSent && <span className="text-emerald-600 font-black text-xs">✓ Sent</span>}
              </div>
              <span className="text-[9px] text-slate-500 font-medium block mt-1">
                * आपके इसी नंबर पर 6-अंकों का आधिकारिक Trustit WhatsApp कोड भेजा जाएगा।
              </span>
            </div>

            {/* OTP Section (Reveals after code dispatched) */}
            {otpSent && (
              <div className="pt-3 border-t border-amber-100 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-black uppercase text-slate-700 block">
                    6-Digit WhatsApp OTP
                  </label>
                  <span className="text-[10px] font-mono font-bold text-amber-700">
                    {canResend ? "Code expired" : `Expires in ${otpTimer}s`}
                  </span>
                </div>

                <div className="flex justify-between gap-1.5 sm:gap-2">
                  {otp.map((d, i) => (
                    <input
                      key={i}
                      id={`otp-input-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      className="w-11 h-12 text-center text-lg font-mono font-black border-2 border-amber-300 rounded-xl bg-amber-50/20 focus:bg-white focus:border-emerald-600 focus:outline-none transition shadow-2xs"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <p className="text-[9px] text-slate-500 leading-tight">
                    WhatsApp नहीं मिला?
                  </p>
                  <button
                    type="button"
                    disabled={!canResend || isLoading}
                    onClick={handleSendOtp}
                    className="text-[10px] font-black text-emerald-700 hover:text-emerald-800 disabled:opacity-40 underline transition"
                  >
                    🔄 OTP दोबारा भेजें (Resend OTP)
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Feedback Messages */}
          {errorMsg && (
            <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-start gap-2 shadow-2xs">
              <span className="text-base shrink-0">⚠️</span>
              <span className="leading-tight">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-start gap-2 shadow-2xs">
              <span className="text-base shrink-0">💬</span>
              <span className="leading-tight">{successMsg}</span>
            </div>
          )}
        </div>

        {/* Action Button Footer */}
        <div className="pt-3 border-t border-amber-200/50 space-y-2">
          {!otpSent ? (
            <button
              type="button"
              disabled={isLoading || phone.length !== 10}
              onClick={handleSendOtp}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-emerald-600/30 border border-emerald-500 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>{isLoading ? "WhatsApp OTP भेजा जा रहा है..." : "🟢 WhatsApp OTP भेजें · Send OTP"}</span>
              <span>→</span>
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading || otp.join("").length !== 6}
              onClick={() => handleVerifyOtp()}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-emerald-600/30 border border-emerald-500 flex items-center justify-center gap-2 transition active:scale-98"
            >
              <span>{isLoading ? "वेरिफाई किया जा रहा है..." : "✓ कोड वेरिफाई करके आगे बढ़ें"}</span>
              <span>→</span>
            </button>
          )}

          <p className="text-[9px] text-center text-slate-500 leading-none">
            🔒 By proceeding, you verify your merchant number via WhatsApp.
          </p>
        </div>
      </div>
    );
  }

  // =========================================================================
  // RENDER: STAGE 2 (NEW MERCHANT PROFILE & GPS ONBOARDING)
  // =========================================================================
  return (
    <div className="w-full h-full bg-[#FAF9F6] text-slate-900 flex flex-col justify-between p-4 font-sans select-none overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div>
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-600 text-white flex items-center justify-center font-black text-sm shadow-md">
              T
            </div>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-amber-700 block leading-tight">
                TRUSTIT PARTNER • NEW ONBOARDING
              </span>
              <h1 className="text-xs font-black text-slate-900 leading-none">
                दुकान की जानकारी व GPS पता
              </h1>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setStep("phone_otp")}
            className="text-[11px] font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg bg-white border border-amber-200 active:scale-95 transition"
          >
            ← Back
          </button>
        </div>

        {/* Verified Phone Chip */}
        <div className="mt-3 bg-emerald-50 border border-emerald-300 rounded-xl p-2.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-emerald-700 text-base">✅</span>
            <div>
              <span className="text-[9px] font-black uppercase tracking-wider text-emerald-800 block leading-tight">
                वेरिफाइड मोबाइल नंबर (WhatsApp Verified)
              </span>
              <span className="text-xs font-mono font-black text-emerald-950">
                +91 {phone}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleEditNumber}
            className="text-[10px] font-black text-amber-800 bg-amber-100 hover:bg-amber-200 px-2 py-1 rounded-md border border-amber-300 transition"
          >
            बदलें
          </button>
        </div>

        {/* Store Profile Fields Card */}
        <div className="mt-3 bg-white border border-amber-200/80 rounded-2xl p-3.5 shadow-sm space-y-3">
          {/* Owner Full Name */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
              दुकानदार / प्रोपराइटर का नाम (Owner Full Name) *
            </label>
            <input
              type="text"
              value={ownerName}
              autoComplete="name"
              placeholder="उदा. दीपक जैन (Deepak Jain)"
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
            />
          </div>

          {/* Store Name */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
              दुकान / बिज़नेस का नाम (Store / Business Name) *
            </label>
            <input
              type="text"
              value={storeName}
              placeholder="उदा. जैन प्रोविज़न स्टोर (Jain Provision Store)"
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-none transition"
            />
          </div>

          {/* Business Type / Category Picker */}
          <div>
            <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
              बिज़नेस की श्रेणी चुनें (Select Business Category) *
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      setCategory(cat.id);
                      TrustitNative.playHapticFeedback("click").catch(() => {});
                    }}
                    className={`p-2 rounded-xl border text-left transition flex items-center gap-2 ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 font-black shadow-xs"
                        : "bg-slate-50 border-slate-200 text-slate-700 font-bold hover:bg-slate-100"
                    }`}
                  >
                    <span className="text-xl">{cat.icon}</span>
                    <div className="min-w-0 flex-1">
                      <span className="text-[11px] block leading-tight truncate">{cat.labelHi}</span>
                      <span className="text-[8px] text-slate-500 block truncate leading-none mt-0.5">
                        {cat.labelEn}
                      </span>
                    </div>
                    {isSelected && <span className="text-emerald-600 text-xs font-black">✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Store Address & GPS Auto-Fetch */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-black uppercase text-slate-600 block">
                दुकान का पता (Store Address &amp; Mohalla) *
              </label>
              {gpsLocked && (
                <span className="text-[9px] font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-300">
                  📍 GPS Locked
                </span>
              )}
            </div>

            <textarea
              rows={2}
              value={address}
              placeholder="दुकान नंबर, बाज़ार का नाम, मोहल्ला, बहराइच"
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:outline-none transition resize-none"
            />

            {/* GPS Auto-Fetch One-Click Button */}
            <button
              type="button"
              disabled={isGpsLoading}
              onClick={handleAutoFetchGps}
              className="mt-1.5 w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black flex items-center justify-center gap-2 transition active:scale-98 shadow-2xs"
            >
              <span>{isGpsLoading ? "🔄 सैटेलाइट GPS खोजा जा रहा है..." : "📍 GPS से दुकान की लोकेशन व पता लाएं (Auto-Fetch)"}</span>
            </button>
            {gpsLocked && latitude && longitude && (
              <p className="text-[9px] text-emerald-700 font-mono font-bold mt-1 text-center">
                सटीक निर्देशांक: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E (Bahraich Local Hub)
              </p>
            )}
          </div>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs font-bold flex items-start gap-2 shadow-2xs">
            <span className="text-base shrink-0">⚠️</span>
            <span className="leading-tight">{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Registration Submit Button Footer */}
      <div className="pt-3 border-t border-amber-200/50 space-y-2">
        <button
          type="button"
          disabled={isLoading || !ownerName.trim() || !storeName.trim() || !address.trim()}
          onClick={handleCompleteRegistration}
          className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-black shadow-lg shadow-emerald-600/30 border border-emerald-500 flex items-center justify-center gap-2 transition active:scale-98"
        >
          <span>{isLoading ? "दुकान रजिस्टर हो रही है..." : "🚀 दुकान रजिस्टर करें और शुरू करें · Complete Registration"}</span>
          <span>→</span>
        </button>

        <p className="text-[9px] text-center text-slate-500 leading-none">
          🛡️ आधिकारिक मर्चेंट प्रोफ़ाइल TRUSTIT बहराइच नेटवर्क पर लाइव हो जाएगी।
        </p>
      </div>
    </div>
  );
}
