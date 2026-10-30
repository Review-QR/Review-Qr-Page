"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  logoutTrustitMerchantSession,
  requestMerchantEmailOtpAction,
  verifyMerchantEmailOtpAction,
  completeMerchantEmailRegistrationAction,
} from "./actions";

function isPasswordValid(password: string) {
  return (
    password.length >= 6 &&
    password.length <= 16 &&
    /[A-Za-z]/.test(password) &&
    /[0-9]/.test(password)
  );
}

export default function RegisterAccount({
  skipPhoneOtp,
  passwordSetupPending,
  hasBlockingSession,
}: {
  skipPhoneOtp: boolean;
  passwordSetupPending: boolean;
  hasBlockingSession: boolean;
}) {
  const router = useRouter();

  // Form inputs
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP flow states
  const [otpSent, setOtpSent] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
  const [previewOtp, setPreviewOtp] = useState<string | undefined>(undefined);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  // Loading & status states
  const [getOtpBusy, setGetOtpBusy] = useState(false);
  const [verifyOtpBusy, setVerifyOtpBusy] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [otpError, setOtpError] = useState("");
  const [duplicateMobile, setDuplicateMobile] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Sign out blocking session if needed
  async function logoutAndStartNewAccount() {
    setSubmitBusy(true);
    setGeneralError("");
    try {
      const result = await logoutTrustitMerchantSession();
      if (!result.success) {
        setGeneralError(result.message);
        return;
      }
      router.refresh();
    } catch {
      setGeneralError("Could not sign out. Please try again.");
    } finally {
      setSubmitBusy(false);
    }
  }

  // 1. Get OTP Button Click
  async function handleGetOtp() {
    setGeneralError("");
    setOtpError("");
    setDuplicateMobile(false);

    const cleanBiz = businessName.trim();
    const cleanName = name.trim();
    const cleanPhone = mobile.replace(/\D/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanBiz) {
      setGeneralError("कृपया पहले दुकान / प्रतिष्ठान का नाम दर्ज करें (Business Name is required).");
      return;
    }
    if (!cleanName) {
      setGeneralError("कृपया मालिक / संचालक का नाम दर्ज करें (Owner Name is required).");
      return;
    }
    if (cleanPhone.length < 10) {
      setGeneralError("कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile).");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setGeneralError("कृपया मान्य ईमेल ID दर्ज करें (Enter a valid email address).");
      return;
    }

    setGetOtpBusy(true);
    try {
      const result = await requestMerchantEmailOtpAction({
        businessName: cleanBiz,
        fullName: cleanName,
        mobile: cleanPhone,
        email: cleanEmail,
      });

      if (!result.success) {
        setDuplicateMobile(result.code === "duplicate_mobile");
        setGeneralError(result.message);
        return;
      }

      setOtpSent(true);
      setPreviewOtp(result.previewOtp);
      setOtpSuccessMessage("OTP sent successfully to your email");
      setResendCooldown(30);
    } catch {
      setGeneralError("ईमेल OTP भेजने में समस्या हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setGetOtpBusy(false);
    }
  }

  // 2. Verify OTP Button Click
  async function handleVerifyOtp() {
    setOtpError("");
    const cleanOtp = otp.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (cleanOtp.length !== 6) {
      setOtpError("कृपया ईमेल पर आया 6-अंकों का OTP कोड दर्ज करें।");
      return;
    }

    setVerifyOtpBusy(true);
    try {
      const result = await verifyMerchantEmailOtpAction({
        email: cleanEmail,
        otp: cleanOtp,
      });

      if (!result.success) {
        setOtpError(result.message || "गलत OTP कोड। कृपया पुनः प्रयास करें।");
        return;
      }

      setIsEmailVerified(true);
      setVerificationToken(result.verificationToken || null);
      setOtpSuccessMessage("Email verified successfully! ✓");
    } catch {
      setOtpError("OTP वेरिफिकेशन में समस्या हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setVerifyOtpBusy(false);
    }
  }

  // 3. Final Step: Submit Registration & Continue
  async function handleSubmitRegistration(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError("");

    if (!isEmailVerified) {
      setGeneralError("कृपया आगे बढ़ने के लिए पहले ईमेल OTP वेरिफाई करें।");
      return;
    }

    if (!isPasswordValid(password)) {
      setGeneralError("पासवर्ड 6–16 अक्षरों का होना चाहिए जिसमें कम से कम 1 अक्षर और 1 नंबर हो।");
      return;
    }

    setSubmitBusy(true);
    try {
      const result = await completeMerchantEmailRegistrationAction({
        businessName: businessName.trim(),
        fullName: name.trim(),
        mobile: mobile.replace(/\D/g, ""),
        email: email.trim().toLowerCase(),
        verificationToken: verificationToken || undefined,
        otp: otp.trim(),
        password,
      });

      if (!result.success) {
        setDuplicateMobile(result.code === "duplicate_mobile");
        setGeneralError(result.message);
        return;
      }

      window.sessionStorage.setItem("trustit_business_name", businessName.trim());
      router.push("/register/business");
      router.refresh();
    } catch {
      setGeneralError("अकाउंट तैयार नहीं हो सका। कृपया पुनः प्रयास करें।");
    } finally {
      setSubmitBusy(false);
    }
  }

  // Blocking session card
  if (hasBlockingSession) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <p className="text-xs font-bold text-slate-900">एक मर्चेंट खाता पहले से लॉगिन है।</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
          नया बिज़नेस रजिस्टर करने से पहले पुराने सेशन से साइन आउट करें। आपका पुराना खाता सुरक्षित रहेगा।
        </p>
        <button
          type="button"
          disabled={submitBusy}
          onClick={logoutAndStartNewAccount}
          className="mt-3 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {submitBusy ? "साइन आउट हो रहा है…" : "पुराने खाते से साइन आउट करें व नया खाता बनाएं"}
        </button>
        {generalError && (
          <p role="alert" className="mt-2 text-[11px] font-semibold text-rose-800">
            {generalError}
          </p>
        )}
      </div>
    );
  }

  const isFormReadyForNext =
    isEmailVerified &&
    businessName.trim().length > 0 &&
    name.trim().length > 0 &&
    mobile.replace(/\D/g, "").length >= 10 &&
    isPasswordValid(password);

  return (
    <div className="mt-4">
      <form onSubmit={handleSubmitRegistration} className="space-y-3 text-left">
        {/* No. 1: Business Name */}
        <div>
          <label htmlFor="businessNameField" className="block text-[11px] sm:text-xs font-bold text-slate-700">
            1. Business Name (दुकान / प्रतिष्ठान का नाम) <span className="text-rose-500">*</span>
          </label>
          <input
            id="businessNameField"
            autoComplete="organization"
            maxLength={160}
            placeholder="उदा. Jamal Saloon, गुप्ता किराना, श्याम स्वीट्स..."
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            disabled={isEmailVerified || submitBusy}
            className="mt-1 h-9 sm:h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
            required
          />
        </div>

        {/* No. 2: Owner Name */}
        <div>
          <label htmlFor="ownerNameField" className="block text-[11px] sm:text-xs font-bold text-slate-700">
            2. Owner Name (मालिक / संचालक का नाम) <span className="text-rose-500">*</span>
          </label>
          <input
            id="ownerNameField"
            autoComplete="name"
            maxLength={160}
            placeholder="उदा. Jamal, राहुल वर्मा..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isEmailVerified || submitBusy}
            className="mt-1 h-9 sm:h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
            required
          />
        </div>

        {/* No. 3: Mobile Number */}
        <div>
          <label htmlFor="mobileField" className="block text-[11px] sm:text-xs font-bold text-slate-700">
            3. Mobile Number (दुकान का संपर्क नंबर) <span className="text-rose-500">*</span>
          </label>
          <div className="mt-1 flex h-9 sm:h-10 overflow-hidden rounded-xl border border-slate-200 bg-white transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
            <span className="flex items-center border-r border-slate-200 bg-slate-50 px-2.5 text-xs font-bold text-slate-700 select-none">
              🇮🇳 +91
            </span>
            <input
              id="mobileField"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder="10-अंकों का मोबाइल नंबर (उदा. 8545965845)"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              disabled={isEmailVerified || submitBusy}
              className="w-full px-3 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none disabled:bg-slate-50 disabled:text-slate-600"
              required
            />
          </div>
          <p className="mt-1 text-[10px] text-slate-500">
            दुकान प्रोफाइल व डिलीवरी ऑर्डर्स के संपर्क हेतु।
          </p>
        </div>

        {/* No. 4: Email ID with Inline Get OTP Button */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="emailField" className="block text-[11px] sm:text-xs font-bold text-slate-700">
              4. Email ID (OTP वेरिफिकेशन हेतु ईमेल) <span className="text-rose-500">*</span>
            </label>
            {isEmailVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-700">
                ✓ Verified
              </span>
            )}
          </div>

          <div className="mt-1 flex gap-2">
            <input
              id="emailField"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="उदा. jamal@gmail.com या owner@business.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (otpSent && !isEmailVerified) {
                  setOtpSent(false);
                  setOtpSuccessMessage("");
                }
              }}
              disabled={isEmailVerified || submitBusy}
              className="h-9 sm:h-10 flex-1 rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
              required
            />
            {!isEmailVerified && (
              <button
                type="button"
                disabled={
                  getOtpBusy ||
                  resendCooldown > 0 ||
                  !email.includes("@") ||
                  !businessName.trim() ||
                  !name.trim() ||
                  mobile.replace(/\D/g, "").length < 10
                }
                onClick={handleGetOtp}
                className="h-9 sm:h-10 shrink-0 rounded-xl bg-blue-600 px-3.5 text-xs font-bold text-white shadow-2xs transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
              >
                {getOtpBusy
                  ? "भेज रहे हैं..."
                  : resendCooldown > 0
                  ? `पुनः भेजें (${resendCooldown}s)`
                  : otpSent
                  ? "Resend OTP"
                  : "Get OTP"}
              </button>
            )}
          </div>

          {/* Inline OTP Section immediately below Email ID */}
          {otpSent && (
            <div className="mt-2 rounded-xl border border-blue-200/90 bg-blue-50/70 p-2.5 space-y-2">
              {/* Status line */}
              <div className="flex items-center justify-between text-xs">
                <p className="flex items-center gap-1.5 font-bold text-blue-900 text-[11px] sm:text-xs">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{otpSuccessMessage || "OTP sent successfully to your email"}</span>
                </p>
                {previewOtp && (
                  <span className="rounded-md border border-blue-300 bg-white px-2 py-0.5 font-mono text-[10px] font-black text-blue-800 shadow-2xs">
                    ⚡ Quick Test OTP: {previewOtp}
                  </span>
                )}
              </div>

              {!isEmailVerified && (
                <>
                  <p className="text-[10px] text-blue-800">
                    कृपया <strong>{email}</strong> का इनबॉक्स या स्पैम (Spam) फोल्डर देखें और 6-अंकों का कोड दर्ज करें:
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <input
                      id="inlineOtpBox"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="6-अंकों का OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      className="h-8.5 sm:h-9 w-36 sm:w-40 rounded-xl border border-slate-300 bg-white px-2.5 text-center font-mono text-sm font-bold tracking-widest text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      disabled={verifyOtpBusy || otp.trim().length !== 6}
                      onClick={handleVerifyOtp}
                      className="h-8.5 sm:h-9 rounded-xl bg-emerald-600 px-3.5 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {verifyOtpBusy ? "जांच रहे हैं..." : "Verify OTP"}
                    </button>
                  </div>
                </>
              )}

              {otpError && (
                <p role="alert" className="text-[11px] font-bold text-rose-700">
                  {otpError}
                </p>
              )}

              {isEmailVerified && (
                <p className="text-[11px] font-bold text-emerald-800 flex items-center gap-1">
                  <span>✓</span>
                  <span>ईमेल वेरिफाई हो गया है! अब पासवर्ड बनाकर आगे बढ़ें।</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* No. 5: Password Field */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="passwordField" className="block text-[11px] sm:text-xs font-bold text-slate-700">
              5. Create Your Password (लॉगिन पासवर्ड) <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 transition"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="passwordField"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            minLength={6}
            maxLength={16}
            placeholder="•••••••• (6-16 अक्षर, कम से कम 1 अक्षर व 1 नंबर)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={submitBusy}
            className="mt-1 h-9 sm:h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs sm:text-sm font-medium text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 disabled:text-slate-600"
            required
          />
          <p className="mt-1 text-[10px] text-slate-500">
            भविष्य में मर्चेंट पोर्टल लॉगिन के लिए सुरक्षित पासवर्ड रखें।
          </p>
        </div>

        {/* Action Button: Disabled until Email is Verified! */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={!isFormReadyForNext || submitBusy}
            className={`flex min-h-10 sm:min-h-11 w-full items-center justify-center gap-2 rounded-xl text-xs sm:text-sm font-bold transition shadow-xs ${
              isFormReadyForNext
                ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white shadow-[0_10px_20px_-10px_rgba(37,99,235,0.4)] hover:from-blue-700 hover:to-indigo-800 cursor-pointer"
                : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-75"
            }`}
          >
            {submitBusy ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>खाता तैयार हो रहा है...</span>
              </>
            ) : isEmailVerified ? (
              <>
                <span>बिज़नेस सेटअप पर आगे बढ़ें (Continue to Business Setup)</span>
                <span>→</span>
              </>
            ) : (
              <span>ईमेल OTP वेरिफाई करने के बाद यह बटन सक्रिय होगा 🔒</span>
            )}
          </button>

          {!isEmailVerified && (
            <p className="mt-1.5 text-center text-[10px] text-amber-700 font-medium">
              ℹ️ स्टेप 4 में Email ID के सामने <strong>Get OTP</strong> दबाकर ईमेल वेरिफाई करें ताकि यह बटन चालू हो सके।
            </p>
          )}
        </div>

        {/* Error / Alert Messages */}
        {generalError && (
          <div
            role={duplicateMobile ? "alert" : "status"}
            className={`rounded-xl p-3 text-xs font-semibold leading-relaxed ${
              duplicateMobile
                ? "border border-amber-200 bg-amber-50 text-amber-950"
                : "border border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <p>{generalError}</p>
            {duplicateMobile && (
              <Link
                href="/merchant/login"
                className="mt-1.5 inline-flex items-center gap-1 font-bold text-blue-700 underline underline-offset-2"
              >
                <span>मर्चेंट लॉगिन पर जाएँ</span>
                <span>→</span>
              </Link>
            )}
          </div>
        )}

        {/* Footer Link to Merchant Login */}
        <div className="border-t border-slate-100 pt-3 text-center">
          <p className="text-[11px] text-slate-600">
            Already have an account?{" "}
            <Link href="/merchant/login" className="font-bold text-blue-700 hover:underline">
              Merchant Login →
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
