"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRegisterFlow } from "./register-shell";
import {
  logoutTrustitMerchantSession,
  requestMerchantEmailOtpAction,
  verifyMerchantEmailOtpAction,
  requestMerchantPhoneOtpAction,
  verifyMerchantPhoneOtpAction,
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
  const { setStep1Completed } = useRegisterFlow();

  // Form inputs - strictly blank by default with NO pre-fillers
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // OTP flow states
  const [otpChannel, setOtpChannel] = useState<"mobile" | "email">("mobile");
  const [otpSent, setOtpSent] = useState(false);
  const [otpSuccessMessage, setOtpSuccessMessage] = useState("");
  const [previewOtp, setPreviewOtp] = useState<string | undefined>(undefined);
  const [isMobileVerified, setIsMobileVerified] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);

  const isVerified = isMobileVerified || isEmailVerified;

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
  async function handleGetOtp(targetChannel = otpChannel) {
    setGeneralError("");
    setOtpError("");
    setDuplicateMobile(false);

    const cleanBiz = businessName.trim();
    const cleanName = name.trim();
    const cleanPhone = mobile.replace(/\D/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanBiz) {
      setGeneralError("Please enter your business name.");
      return;
    }
    if (!cleanName) {
      setGeneralError("Please enter the business owner's name.");
      return;
    }
    if (cleanPhone.length < 10) {
      setGeneralError("Please enter a valid 10-digit mobile number.");
      return;
    }
    if (targetChannel === "email" && (!cleanEmail.includes("@") || !cleanEmail.includes("."))) {
      setGeneralError("Please enter a valid email address for verification.");
      return;
    }

    setGetOtpBusy(true);
    try {
      if (targetChannel === "mobile") {
        const result = await requestMerchantPhoneOtpAction({
          businessName: cleanBiz,
          fullName: cleanName,
          mobile: cleanPhone,
        });

        if (!result.success) {
          setDuplicateMobile(result.code === "duplicate_mobile");
          setGeneralError(result.message);
          return;
        }

        setOtpSent(true);
        setPreviewOtp(result.previewOtp);
        setOtpSuccessMessage(`OTP sent successfully to +91 ${cleanPhone}`);
        setResendCooldown(30);
      } else {
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
      }
    } catch {
      setGeneralError("Failed to send verification OTP. Please try again.");
    } finally {
      setGetOtpBusy(false);
    }
  }

  // 2. Verify OTP Button Click
  async function handleVerifyOtp() {
    setOtpError("");
    const cleanOtp = otp.trim();
    const cleanPhone = mobile.replace(/\D/g, "");
    const cleanEmail = email.trim().toLowerCase();

    if (cleanOtp.length !== 6) {
      setOtpError("Please enter the 6-digit code.");
      return;
    }

    setVerifyOtpBusy(true);
    try {
      if (otpChannel === "mobile") {
        const result = await verifyMerchantPhoneOtpAction({
          mobile: cleanPhone,
          otp: cleanOtp,
        });

        if (!result.success) {
          setOtpError(result.message || "Invalid verification code. Please try again.");
          return;
        }

        setIsMobileVerified(true);
        setVerificationToken(result.verificationToken || null);
        setOtpSuccessMessage("Mobile number verified successfully! ✓");
        setStep1Completed(true);
      } else {
        const result = await verifyMerchantEmailOtpAction({
          email: cleanEmail,
          otp: cleanOtp,
        });

        if (!result.success) {
          setOtpError(result.message || "Invalid verification code. Please try again.");
          return;
        }

        setIsEmailVerified(true);
        setVerificationToken(result.verificationToken || null);
        setOtpSuccessMessage("Email verified successfully! ✓");
        setStep1Completed(true);
      }
    } catch {
      setOtpError("Verification failed. Please check your code and try again.");
    } finally {
      setVerifyOtpBusy(false);
    }
  }

  // 3. Final Step: Submit Registration & Continue to Business Address
  async function handleSubmitRegistration(e: React.FormEvent) {
    e.preventDefault();
    setGeneralError("");

    if (!isVerified) {
      setGeneralError("Please verify your mobile number or email with OTP before continuing.");
      return;
    }

    if (!isPasswordValid(password)) {
      setGeneralError("Password must be 6–16 characters with at least one letter and one number.");
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
      setGeneralError("Could not create merchant account. Please try again.");
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
          <p className="text-xs font-bold text-slate-900">An active merchant account is currently signed in.</p>
        </div>
        <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
          Sign out of the previous session to register a new business. Your existing data remains safe.
        </p>
        <button
          type="button"
          disabled={submitBusy}
          onClick={logoutAndStartNewAccount}
          className="mt-3 flex min-h-9 w-full items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {submitBusy ? "Signing out…" : "Sign out & Create New Account"}
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
    isVerified &&
    businessName.trim().length > 0 &&
    name.trim().length > 0 &&
    mobile.replace(/\D/g, "").length >= 10 &&
    isPasswordValid(password);

  return (
    <div className="mt-2">
      <form onSubmit={handleSubmitRegistration} className="space-y-2 text-left">
        
        {/* 1. Business Name with Leading Icon Box */}
        <div>
          <label htmlFor="businessNameField" className="block text-xs font-bold text-slate-700">
            1. Business Name <span className="text-rose-500">*</span>
          </label>
          <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <div className="h-8.5 w-8.5 flex items-center justify-center border-r border-slate-200 bg-slate-50/70 text-slate-600 text-sm shrink-0">
              🏪
            </div>
            <input
              id="businessNameField"
              type="text"
              autoComplete="organization"
              maxLength={160}
              placeholder=""
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              disabled={isVerified || submitBusy}
              className="h-8.5 w-full px-3 text-xs sm:text-[13px] font-medium text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-600"
              required
            />
          </div>
        </div>

        {/* 2. Owner Name with Leading Icon Box */}
        <div>
          <label htmlFor="ownerNameField" className="block text-xs font-bold text-slate-700">
            2. Owner Name <span className="text-rose-500">*</span>
          </label>
          <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <div className="h-8.5 w-8.5 flex items-center justify-center border-r border-slate-200 bg-slate-50/70 text-slate-600 text-sm shrink-0">
              👤
            </div>
            <input
              id="ownerNameField"
              type="text"
              autoComplete="name"
              maxLength={160}
              placeholder=""
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isVerified || submitBusy}
              className="h-8.5 w-full px-3 text-xs sm:text-[13px] font-medium text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-600"
              required
            />
          </div>
        </div>

        {/* 3. Mobile Number with Leading Icon Box & INLINE Get OTP Button */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="mobileField" className="block text-xs font-bold text-slate-700">
              3. Mobile Number <span className="text-rose-500">*</span>
            </label>
            {isMobileVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[9.5px] font-black text-emerald-700">
                ✓ Mobile Verified
              </span>
            ) : (
              otpChannel === "mobile" && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpChannel("email");
                    setOtpSent(false);
                    setOtpSuccessMessage("");
                  }}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  Verify via Email instead
                </button>
              )
            )}
          </div>
          <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <div className="h-8.5 w-8.5 flex items-center justify-center border-r border-slate-200 bg-slate-50/70 text-slate-600 text-sm shrink-0">
              📱
            </div>
            <div className="flex items-center border-r border-slate-200 bg-slate-50 px-2 h-8.5 text-xs font-bold text-slate-700 shrink-0 select-none">
              🇮🇳 +91 ▾
            </div>
            <input
              id="mobileField"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              placeholder=""
              value={mobile}
              onChange={(e) => {
                setMobile(e.target.value.replace(/\D/g, ""));
                if (otpSent && !isVerified) {
                  setOtpSent(false);
                  setOtpSuccessMessage("");
                }
              }}
              disabled={isVerified || submitBusy}
              className="h-8.5 w-full px-3 text-xs sm:text-[13px] font-semibold text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-600"
              required
            />
            {/* INLINE Get OTP Button for Mobile */}
            {!isVerified && otpChannel === "mobile" && (
              <button
                type="button"
                disabled={
                  getOtpBusy ||
                  resendCooldown > 0 ||
                  mobile.replace(/\D/g, "").length < 10 ||
                  !businessName.trim() ||
                  !name.trim()
                }
                onClick={() => handleGetOtp("mobile")}
                className="m-1 h-6.5 px-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition border border-blue-600 shadow-2xs whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {getOtpBusy
                  ? "Sending…"
                  : resendCooldown > 0
                  ? `Resend (${resendCooldown}s)`
                  : otpSent
                  ? "Resend OTP"
                  : "Get OTP (SMS)"}
              </button>
            )}
          </div>
          <p className="mt-0.5 text-[9.5px] text-slate-400">
            SMS / WhatsApp OTP will be sent to verify your shop's primary contact.
          </p>

          {/* Inline OTP Section revealed immediately underneath Mobile */}
          {otpSent && otpChannel === "mobile" && (
            <div className="mt-1.5 rounded-xl border border-blue-200/90 bg-blue-50/70 p-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <p className="flex items-center gap-1 font-bold text-blue-900 text-[10.5px]">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{otpSuccessMessage || "OTP sent successfully to your mobile"}</span>
                </p>
                {previewOtp && (
                  <span className="rounded-md border border-blue-300 bg-white px-1.5 py-0.2 font-mono text-[9px] font-black text-blue-800 shadow-2xs">
                    Quick Test: {previewOtp}
                  </span>
                )}
              </div>

              {!isMobileVerified && (
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    id="inlineMobileOtpBox"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="h-8 w-32 rounded-lg border border-slate-300 bg-white px-2 text-center font-mono text-xs font-bold tracking-widest text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    disabled={verifyOtpBusy || otp.trim().length !== 6}
                    onClick={handleVerifyOtp}
                    className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifyOtpBusy ? "Verifying…" : "Verify OTP"}
                  </button>
                </div>
              )}

              {otpError && (
                <p role="alert" className="text-[10px] font-bold text-rose-700">
                  {otpError}
                </p>
              )}

              {isMobileVerified && (
                <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <span>✓</span>
                  <span>Mobile verified successfully!</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* 4. Email ID */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="emailField" className="block text-xs font-bold text-slate-700">
              4. Email ID <span className="text-rose-500">*</span>
            </label>
            {isEmailVerified ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[9.5px] font-black text-emerald-700">
                ✓ Verified
              </span>
            ) : (
              otpChannel === "email" && (
                <button
                  type="button"
                  onClick={() => {
                    setOtpChannel("mobile");
                    setOtpSent(false);
                    setOtpSuccessMessage("");
                  }}
                  className="text-[10px] text-blue-600 hover:underline font-semibold"
                >
                  Verify via Mobile (SMS) instead
                </button>
              )
            )}
          </div>

          <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <div className="h-8.5 w-8.5 flex items-center justify-center border-r border-slate-200 bg-slate-50/70 text-slate-600 text-sm shrink-0">
              ✉️
            </div>
            <input
              id="emailField"
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder=""
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (otpSent && !isVerified) {
                  setOtpSent(false);
                  setOtpSuccessMessage("");
                }
              }}
              disabled={isVerified || submitBusy}
              className="h-8.5 w-full px-3 text-xs sm:text-[13px] font-medium text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-600"
              required
            />
            {/* INLINE Get OTP Button for Email if selected */}
            {!isVerified && otpChannel === "email" && (
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
                onClick={() => handleGetOtp("email")}
                className="m-1 h-6.5 px-2.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs transition border border-blue-200 shadow-2xs whitespace-nowrap shrink-0 disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                {getOtpBusy
                  ? "Sending…"
                  : resendCooldown > 0
                  ? `Resend (${resendCooldown}s)`
                  : otpSent
                  ? "Resend OTP"
                  : "Get OTP (Email)"}
              </button>
            )}
          </div>

          {/* Inline OTP Section revealed immediately underneath email if email channel */}
          {otpSent && otpChannel === "email" && (
            <div className="mt-1.5 rounded-xl border border-blue-200/90 bg-blue-50/70 p-2 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <p className="flex items-center gap-1 font-bold text-blue-900 text-[10.5px]">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{otpSuccessMessage || "OTP sent successfully to your email"}</span>
                </p>
                {previewOtp && (
                  <span className="rounded-md border border-blue-300 bg-white px-1.5 py-0.2 font-mono text-[9px] font-black text-blue-800 shadow-2xs">
                    Quick Test: {previewOtp}
                  </span>
                )}
              </div>

              {!isEmailVerified && (
                <div className="flex items-center gap-2 pt-0.5">
                  <input
                    id="inlineEmailOtpBox"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="Enter 6-digit OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                    className="h-8 w-32 rounded-lg border border-slate-300 bg-white px-2 text-center font-mono text-xs font-bold tracking-widest text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                  />
                  <button
                    type="button"
                    disabled={verifyOtpBusy || otp.trim().length !== 6}
                    onClick={handleVerifyOtp}
                    className="h-8 rounded-lg bg-emerald-600 px-3 text-xs font-bold text-white shadow-2xs transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {verifyOtpBusy ? "Verifying…" : "Verify OTP"}
                  </button>
                </div>
              )}

              {otpError && (
                <p role="alert" className="text-[10px] font-bold text-rose-700">
                  {otpError}
                </p>
              )}

              {isEmailVerified && (
                <p className="text-[10px] font-bold text-emerald-800 flex items-center gap-1">
                  <span>✓</span>
                  <span>Email verified successfully!</span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* 5. Create Your Password with Leading Icon Box & Show/Hide Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <label htmlFor="passwordField" className="block text-xs font-bold text-slate-700">
              5. Create Your Password <span className="text-rose-500">*</span>
            </label>
          </div>
          <div className="mt-0.5 flex items-center rounded-xl border border-slate-200 bg-white overflow-hidden shadow-2xs focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100 transition">
            <div className="h-8.5 w-8.5 flex items-center justify-center border-r border-slate-200 bg-slate-50/70 text-slate-600 text-sm shrink-0">
              🔒
            </div>
            <input
              id="passwordField"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
              maxLength={16}
              placeholder=""
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={submitBusy}
              className="h-8.5 w-full px-3 text-xs sm:text-[13px] font-medium text-slate-900 outline-none disabled:bg-slate-50 disabled:text-slate-600"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="px-3 text-xs font-bold text-blue-600 hover:text-blue-800 transition shrink-0 select-none"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <p className="mt-0.5 text-[9.5px] text-slate-400">
            Password must be 6–16 characters, with at least one letter and one number.
          </p>
        </div>

        {/* Action Button: Business Address (Clean Label Always) */}
        <div className="pt-1.5">
          <button
            type="submit"
            disabled={!isFormReadyForNext || submitBusy}
            className={`flex min-h-9 w-full items-center justify-center gap-2 rounded-xl text-xs sm:text-[13px] font-bold transition shadow-xs ${
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
                <span>Creating Account…</span>
              </>
            ) : (
              <>
                <span>Business Address</span>
                <span>→</span>
              </>
            )}
          </button>

          {!isEmailVerified && (
            <p className="mt-1 text-center text-[9.5px] text-slate-400 font-medium">
              Verify Email OTP above to unlock Business Address.
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
                <span>Go to Merchant Login</span>
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
