"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  logoutTrustitMerchantSession,
  requestMerchantEmailOtpAction,
  completeMerchantEmailRegistrationAction,
} from "./actions";

const inputClass =
  "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-900 shadow-2xs outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

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
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [previewOtp, setPreviewOtp] = useState<string | undefined>(undefined);

  const [stage, setStage] = useState<"details" | "otp">("details");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [duplicateMobile, setDuplicateMobile] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function logoutAndStartNewAccount() {
    setBusy(true);
    setMessage("");
    try {
      const result = await logoutTrustitMerchantSession();
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      router.refresh();
    } catch {
      setMessage("Could not sign out. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  // 1. Request Email OTP
  async function handleSendEmailOtp(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");
    setDuplicateMobile(false);

    const cleanBiz = businessName.trim();
    const cleanName = name.trim();
    const cleanPhone = mobile.replace(/\D/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanBiz) {
      setMessage("कृपया दुकान / प्रतिष्ठान का नाम दर्ज करें (Business Name is required).");
      return;
    }
    if (!cleanName) {
      setMessage("कृपया मालिक का नाम दर्ज करें (Owner Name is required).");
      return;
    }
    if (cleanPhone.length < 10) {
      setMessage("कृपया 10 अंकों का मान्य मोबाइल नंबर दर्ज करें (Enter valid 10-digit mobile).");
      return;
    }
    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      setMessage("कृपया मान्य ईमेल ID दर्ज करें (Enter a valid email address for OTP).");
      return;
    }
    if (!isPasswordValid(password)) {
      setMessage("पासवर्ड 6–16 अक्षरों का होना चाहिए जिसमें कम से कम 1 अक्षर और 1 नंबर हो।");
      return;
    }

    setBusy(true);
    try {
      const result = await requestMerchantEmailOtpAction({
        businessName: cleanBiz,
        fullName: cleanName,
        mobile: cleanPhone,
        email: cleanEmail,
      });

      if (!result.success) {
        setDuplicateMobile(result.code === "duplicate_mobile");
        setMessage(result.message);
        return;
      }

      setPreviewOtp(result.previewOtp);
      setStage("otp");
      setResendCooldown(30);
      setMessage(result.message || `वेरिफिकेशन कोड ${cleanEmail} पर भेज दिया गया है।`);
    } catch {
      setMessage("ईमेल OTP भेजने में समस्या हुई। कृपया पुनः प्रयास करें।");
    } finally {
      setBusy(false);
    }
  }

  // 2. Verify OTP & Create Account
  async function handleVerifyOtpAndCreate(event: React.FormEvent) {
    event.preventDefault();
    setMessage("");

    const cleanOtp = otp.trim();
    if (cleanOtp.length !== 6) {
      setMessage("कृपया ईमेल पर आया 6-अंकों का वेरिफिकेशन कोड दर्ज करें।");
      return;
    }

    setBusy(true);
    try {
      const result = await completeMerchantEmailRegistrationAction({
        businessName: businessName.trim(),
        fullName: name.trim(),
        mobile: mobile.replace(/\D/g, ""),
        email: email.trim().toLowerCase(),
        otp: cleanOtp,
        password,
      });

      if (!result.success) {
        setDuplicateMobile(result.code === "duplicate_mobile");
        setMessage(result.message);
        return;
      }

      window.sessionStorage.setItem("trustit_business_name", businessName.trim());
      router.push("/register/business");
      router.refresh();
    } catch {
      setMessage("अकाउंट तैयार नहीं हो सका। कृपया पुनः प्रयास करें।");
    } finally {
      setBusy(false);
    }
  }

  if (hasBlockingSession) {
    return (
      <div className="mt-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-bold text-slate-900">एक मर्चेंट खाता पहले से लॉगिन है।</p>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          नया बिज़नेस रजिस्टर करने से पहले पुराने सेशन से साइन आउट करें। आपका पुराना खाता सुरक्षित रहेगा।
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={logoutAndStartNewAccount}
          className="mt-4 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "साइन आउट हो रहा है…" : "पुराने खाते से साइन आउट करें व नया खाता बनाएं"}
        </button>
        {message && <p role="alert" className="mt-3 text-xs font-semibold text-rose-800">{message}</p>}
      </div>
    );
  }

  return (
    <div className="mt-8">
      {stage === "details" ? (
        <form onSubmit={handleSendEmailOtp} className="space-y-4 text-left">
          {/* Business Name */}
          <div>
            <label htmlFor="businessNameField" className="block text-xs font-bold text-slate-800">
              Business Name (दुकान / प्रतिष्ठान का नाम) *
            </label>
            <input
              id="businessNameField"
              className={inputClass}
              autoComplete="organization"
              maxLength={160}
              placeholder="उदा. Jamal Saloon, गुप्ता किराना, श्याम दूध भंडार..."
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              required
            />
          </div>

          {/* Owner Name */}
          <div>
            <label htmlFor="ownerNameField" className="block text-xs font-bold text-slate-800">
              Owner Name (मालिक / संचालक का नाम) *
            </label>
            <input
              id="ownerNameField"
              className={inputClass}
              autoComplete="name"
              maxLength={160}
              placeholder="उदा. Jamal, राहुल वर्मा..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          {/* Mobile Number with +91 indicator */}
          <div>
            <label htmlFor="mobileField" className="block text-xs font-bold text-slate-800">
              Mobile Number (दुकान का संपर्क नंबर) *
            </label>
            <div className="relative mt-1.5 flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition">
              <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3.5 text-xs font-black text-slate-700 select-none">
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
                className="w-full px-4 py-3.5 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
                required
              />
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              यह नंबर आपके बिज़नेस प्रोफाइल व डिलीवरी आर्डर्स के संपर्क के लिए उपयोग होगा।
            </p>
          </div>

          {/* Email ID for OTP Verification */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="emailField" className="block text-xs font-bold text-slate-800">
                Email Address (OTP वेरिफिकेशन हेतु ईमेल) *
              </label>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                Email OTP
              </span>
            </div>
            <input
              id="emailField"
              type="email"
              inputMode="email"
              autoComplete="email"
              className={inputClass}
              placeholder="उदा. jamal@gmail.com या owner@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <p className="mt-1 text-[11px] text-slate-500">
              इस ईमेल पर तुरंत 6-अंकों का वेरिफिकेशन कोड भेजा जाएगा।
            </p>
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="passwordField" className="block text-xs font-bold text-slate-800">
                Create Your Password (लॉगिन पासवर्ड) *
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs font-bold text-blue-700 hover:text-blue-900 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="passwordField"
              className={inputClass}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
              maxLength={16}
              placeholder="•••••••• (6-16 अक्षर, कम से कम 1 अक्षर व 1 नंबर)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={busy || !businessName.trim() || !name.trim() || mobile.length < 10 || !email.includes("@")}
            className="mt-2 flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_24px_-14px_rgba(37,99,235,0.4)] transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>ईमेल OTP भेजा जा रहा है...</span>
              </>
            ) : (
              <>
                <span>ईमेल OTP भेजें व आगे बढ़ें (Send Email OTP)</span>
                <span>→</span>
              </>
            )}
          </button>

          {message && (
            <div
              role={duplicateMobile ? "alert" : "status"}
              className={`rounded-2xl p-4 text-xs font-semibold leading-relaxed ${
                duplicateMobile
                  ? "border border-amber-200 bg-amber-50 text-amber-950"
                  : "border border-rose-200 bg-rose-50 text-rose-800"
              }`}
            >
              <p>{message}</p>
              {duplicateMobile && (
                <Link
                  href="/merchant/login"
                  className="mt-2 inline-flex items-center gap-1 font-bold text-blue-700 underline underline-offset-2"
                >
                  <span>मर्चेंट लॉगिन पर जाएँ</span>
                  <span>→</span>
                </Link>
              )}
            </div>
          )}

          <div className="border-t border-slate-100 pt-4 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{" "}
              <Link href="/merchant/login" className="font-bold text-blue-700 hover:underline">
                Merchant Login →
              </Link>
            </p>
          </div>
        </form>
      ) : (
        /* Stage 2: OTP Verification Mode */
        <form onSubmit={handleVerifyOtpAndCreate} className="space-y-5 text-left">
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
            <div className="flex items-start gap-3">
              <span className="text-2xl">📩</span>
              <div>
                <h3 className="text-xs font-bold text-blue-950">वेरिफिकेशन कोड भेजा गया</h3>
                <p className="mt-0.5 text-xs text-blue-800">
                  हमने <strong>{email}</strong> पर 6-अंकों का OTP भेजा है। कृपया अपना इनबॉक्स या स्पैम फोल्डर देखें।
                </p>
                {previewOtp && (
                  <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-mono font-black text-blue-900 border border-blue-300">
                    <span>⚡ Quick Test OTP:</span>
                    <span>{previewOtp}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="otpField" className="block text-xs font-bold text-slate-800">
              6-Digit Email Verification Code *
            </label>
            <input
              id="otpField"
              type="text"
              inputMode="numeric"
              maxLength={6}
              autoComplete="one-time-code"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              className="mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-center font-mono text-2xl font-black tracking-[8px] text-slate-900 shadow-2xs outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              required
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={busy || otp.trim().length !== 6}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_24px_-14px_rgba(5,150,105,0.4)] transition hover:from-emerald-700 hover:to-teal-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <>
                <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>वेरिफाई किया जा रहा है...</span>
              </>
            ) : (
              <>
                <span>वेरिफाई करें व बिज़नेस सेटअप पर चलें (Verify & Continue)</span>
                <span>→</span>
              </>
            )}
          </button>

          <div className="flex items-center justify-between text-xs font-semibold text-slate-600 pt-1">
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setStage("details");
                setMessage("");
              }}
              className="text-slate-600 hover:text-slate-900 hover:underline"
            >
              ← ईमेल या विवरण बदलें
            </button>

            <button
              type="button"
              disabled={busy || resendCooldown > 0}
              onClick={handleSendEmailOtp}
              className="text-blue-700 hover:underline disabled:text-slate-400 disabled:no-underline"
            >
              {resendCooldown > 0 ? `पुनः OTP भेजें (${resendCooldown}s)` : "OTP फिर से भेजें (Resend)"}
            </button>
          </div>

          {message && (
            <div
              role="alert"
              className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-800"
            >
              {message}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
