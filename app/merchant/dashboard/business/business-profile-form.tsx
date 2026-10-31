"use client";

import { useActionState, useState } from "react";
import {
  saveBusinessProfileAction,
  requestMerchantMobileChangeOtpAction,
  verifyAndApplyMobileChangeAction,
  requestMerchantEmailChangeOtpAction,
  verifyAndApplyEmailChangeAction,
  type BusinessProfileActionState,
} from "./actions";

const initialState: BusinessProfileActionState = { ok: false, message: "" };
const inputClass =
  "mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-50 disabled:text-slate-500";

export default function BusinessProfileForm({
  name,
  type,
  owner,
  address,
  phone,
  email: initialEmail,
  isMobileVerified: initialIsMobileVerified,
  isEmailVerified: initialIsEmailVerified,
}: {
  name: string;
  type: string | null;
  owner: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  isMobileVerified: boolean;
  isEmailVerified: boolean;
}) {
  const [state, action, pending] = useActionState(saveBusinessProfileAction, initialState);

  // Live state for mobile and email
  const [currentPhone, setCurrentPhone] = useState(phone ?? "");
  const [isMobileVerified, setIsMobileVerified] = useState(initialIsMobileVerified);
  const [currentEmail, setCurrentEmail] = useState(initialEmail ?? "");
  const [isEmailVerified, setIsEmailVerified] = useState(initialIsEmailVerified);

  // Modal / Drawer state for Change Mobile
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [newMobile, setNewMobile] = useState("");
  const [mobileOtp, setMobileOtp] = useState("");
  const [mobileOtpSent, setMobileOtpSent] = useState(false);
  const [mobileCooldown, setMobileCooldown] = useState(0);
  const [mobileBusy, setMobileBusy] = useState(false);
  const [mobileModalMsg, setMobileModalMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Modal / Drawer state for Verify/Change Email
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState(initialEmail ?? "");
  const [emailOtp, setEmailOtp] = useState("");
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailModalMsg, setEmailModalMsg] = useState<{ text: string; error: boolean } | null>(null);

  // 1. Send OTP for Mobile Change
  async function handleSendMobileOtp() {
    setMobileModalMsg(null);
    const clean = newMobile.replace(/\D/g, "");
    if (clean.length !== 10) {
      setMobileModalMsg({ text: "Please enter a valid 10-digit mobile number.", error: true });
      return;
    }

    setMobileBusy(true);
    try {
      const res = await requestMerchantMobileChangeOtpAction(clean);
      if (!res.success) {
        setMobileModalMsg({ text: res.message, error: true });
        return;
      }
      setMobileOtpSent(true);
      setMobileModalMsg({ text: "Verification code sent to your new mobile via SMS.", error: false });
      setMobileCooldown(30);
      const timer = setInterval(() => {
        setMobileCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setMobileModalMsg({ text: "Failed to send verification SMS. Please try again.", error: true });
    } finally {
      setMobileBusy(false);
    }
  }

  // 2. Verify & Apply Mobile Change
  async function handleVerifyMobileChange() {
    setMobileModalMsg(null);
    const clean = newMobile.replace(/\D/g, "");
    if (clean.length !== 10) {
      setMobileModalMsg({ text: "Please enter a valid 10-digit mobile number.", error: true });
      return;
    }
    if (mobileOtp.trim().length !== 6) {
      setMobileModalMsg({ text: "Please enter the 6-digit OTP code.", error: true });
      return;
    }

    setMobileBusy(true);
    try {
      const res = await verifyAndApplyMobileChangeAction(clean, mobileOtp.trim());
      if (!res.success) {
        setMobileModalMsg({ text: res.message, error: true });
        return;
      }
      setCurrentPhone(clean);
      setIsMobileVerified(true);
      setShowMobileModal(false);
      setMobileOtp("");
      setMobileOtpSent(false);
      setNewMobile("");
    } catch {
      setMobileModalMsg({ text: "Verification failed. Please check the code and try again.", error: true });
    } finally {
      setMobileBusy(false);
    }
  }

  // 3. Send OTP for Email Change/Verification
  async function handleSendEmailOtp() {
    setEmailModalMsg(null);
    const clean = newEmail.trim().toLowerCase();
    if (!clean.includes("@") || !clean.includes(".")) {
      setEmailModalMsg({ text: "Please enter a valid email address.", error: true });
      return;
    }

    setEmailBusy(true);
    try {
      const res = await requestMerchantEmailChangeOtpAction(clean);
      if (!res.success) {
        setEmailModalMsg({ text: res.message, error: true });
        return;
      }
      setEmailOtpSent(true);
      setEmailModalMsg({ text: "Verification code sent to your email inbox.", error: false });
      setEmailCooldown(30);
      const timer = setInterval(() => {
        setEmailCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch {
      setEmailModalMsg({ text: "Failed to send email verification code.", error: true });
    } finally {
      setEmailBusy(false);
    }
  }

  // 4. Verify & Apply Email Change/Verification
  async function handleVerifyEmailChange() {
    setEmailModalMsg(null);
    const clean = newEmail.trim().toLowerCase();
    if (!clean.includes("@") || !clean.includes(".")) {
      setEmailModalMsg({ text: "Please enter a valid email address.", error: true });
      return;
    }
    if (emailOtp.trim().length !== 6) {
      setEmailModalMsg({ text: "Please enter the 6-digit OTP code.", error: true });
      return;
    }

    setEmailBusy(true);
    try {
      const res = await verifyAndApplyEmailChangeAction(clean, emailOtp.trim());
      if (!res.success) {
        setEmailModalMsg({ text: res.message, error: true });
        return;
      }
      setCurrentEmail(clean);
      setIsEmailVerified(true);
      setShowEmailModal(false);
      setEmailOtp("");
      setEmailOtpSent(false);
    } catch {
      setEmailModalMsg({ text: "Verification failed. Please check the code and try again.", error: true });
    } finally {
      setEmailBusy(false);
    }
  }

  return (
    <div className="relative">
      <form action={action} className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold text-slate-800">
          Business Name
          <input className={inputClass} name="name" defaultValue={name} maxLength={200} required autoComplete="organization" />
        </label>

        <label className="text-sm font-semibold text-slate-800">
          Business Type
          <input className={inputClass} name="type" defaultValue={type ?? ""} maxLength={120} required />
        </label>

        <label className="text-sm font-semibold text-slate-800">
          Owner / Merchant Name
          <input className={inputClass} name="owner" defaultValue={owner ?? ""} maxLength={200} required autoComplete="name" />
        </label>

        {/* REGISTERED MOBILE with Verified Badge & Change Button */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Registered Mobile</span>
              {isMobileVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-700">
                  <span className="font-black">✓</span> Verified
                </span>
              ) : null}
            </label>
            <button
              type="button"
              onClick={() => {
                setShowMobileModal(true);
                setNewMobile("");
                setMobileOtp("");
                setMobileOtpSent(false);
                setMobileModalMsg(null);
              }}
              className="text-xs font-bold text-[#a64c05] hover:text-[#873d03] hover:underline"
            >
              Change Mobile →
            </button>
          </div>
          <input
            className={inputClass}
            value={currentPhone ? currentPhone.replace(/\D/g, "").slice(-10) : "Not provided"}
            readOnly
            aria-describedby="merchant-phone-help"
          />
          <span id="merchant-phone-help" className="mt-1 block text-xs font-normal text-slate-500">
            This is the verified mobile linked to your account. OTP verification is required to change it.
          </span>
        </div>

        {/* EMAIL ID (OPTIONAL) with Verified / Unverified Badge & OTP Action */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
              <span>Email ID</span>
              <span className="text-xs font-normal text-slate-400">(Optional)</span>
              {currentEmail && isEmailVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.2 text-[10px] font-bold text-emerald-700">
                  <span className="font-black">✓</span> Verified
                </span>
              ) : currentEmail ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.2 text-[10px] font-bold text-amber-700">
                  Unverified
                </span>
              ) : null}
            </label>
            <button
              type="button"
              onClick={() => {
                setShowEmailModal(true);
                setNewEmail(currentEmail || "");
                setEmailOtp("");
                setEmailOtpSent(false);
                setEmailModalMsg(null);
              }}
              className="text-xs font-bold text-[#a64c05] hover:text-[#873d03] hover:underline"
            >
              {currentEmail ? (isEmailVerified ? "Change Email →" : "Verify with OTP →") : "Add & Verify Email →"}
            </button>
          </div>
          <input
            className={inputClass}
            name="email"
            type="email"
            value={currentEmail}
            onChange={(e) => {
              setCurrentEmail(e.target.value);
              setIsEmailVerified(false);
            }}
            placeholder="e.g. contact@business.com (optional)"
            autoComplete="email"
          />
          <span className="mt-1 block text-xs font-normal text-slate-500">
            Optional: For sales reports &amp; recovery. You can save without verifying, or verify with OTP anytime.
          </span>
        </div>

        <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
          Business Address
          <textarea
            className={`${inputClass} min-h-24 resize-y`}
            name="address"
            defaultValue={address ?? ""}
            maxLength={1000}
            required
            autoComplete="street-address"
          />
        </label>

        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 rounded-xl bg-[#a64c05] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#873d03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 disabled:opacity-60 cursor-pointer"
          >
            {pending ? "Saving…" : "Save Business Details"}
          </button>
          <p role={state.message ? "status" : undefined} aria-live="polite" className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-700"}`}>
            {state.message}
          </p>
        </div>
      </form>

      {/* ======================================================== */}
      {/* CHANGE MOBILE MODAL (Requires OTP Verification)          */}
      {/* ======================================================== */}
      {showMobileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Change Registered Mobile</h3>
                <p className="text-xs text-slate-500">A verification code will be sent to confirm your new number.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMobileModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">New Mobile Number</label>
                <div className="mt-1 flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                  <span className="px-3 text-xs font-bold text-slate-600 bg-slate-50 border-r border-slate-200 py-2.5 select-none">
                    🇮🇳 +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile"
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value.replace(/\D/g, ""))}
                    disabled={mobileBusy || mobileOtpSent}
                    className="w-full px-3 py-2.5 text-sm font-semibold text-slate-900 outline-none"
                  />
                  {!mobileOtpSent && (
                    <button
                      type="button"
                      disabled={mobileBusy || newMobile.length !== 10}
                      onClick={handleSendMobileOtp}
                      className="m-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-700 disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {mobileBusy ? "Sending…" : "Get OTP"}
                    </button>
                  )}
                </div>
              </div>

              {mobileOtpSent && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-blue-950">Enter 6-Digit OTP</label>
                    {mobileCooldown > 0 ? (
                      <span className="text-[11px] font-semibold text-slate-500">Resend in {mobileCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendMobileOtp}
                        className="text-[11px] font-bold text-orange-700 hover:underline cursor-pointer"
                      >
                        Resend OTP
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={mobileOtp}
                      onChange={(e) => setMobileOtp(e.target.value.replace(/\D/g, ""))}
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-center font-mono text-base font-bold tracking-widest text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      disabled={mobileBusy || mobileOtp.length !== 6}
                      onClick={handleVerifyMobileChange}
                      className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {mobileBusy ? "Verifying…" : "Confirm Change"}
                    </button>
                  </div>
                </div>
              )}

              {mobileModalMsg && (
                <p className={`text-xs font-semibold ${mobileModalMsg.error ? "text-rose-600" : "text-emerald-700"}`}>
                  {mobileModalMsg.text}
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowMobileModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* VERIFY / CHANGE EMAIL MODAL (OTP Verification)          */}
      {/* ======================================================== */}
      {showEmailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Verify Email Address</h3>
                <p className="text-xs text-slate-500">Receive a 6-digit code in your email inbox to verify.</p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700">Email Address</label>
                <div className="mt-1 flex items-center rounded-xl border border-slate-300 bg-white overflow-hidden focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-100">
                  <span className="px-3 text-xs text-slate-500 bg-slate-50 border-r border-slate-200 py-2.5 select-none">
                    ✉️
                  </span>
                  <input
                    type="email"
                    placeholder="name@business.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    disabled={emailBusy || emailOtpSent}
                    className="w-full px-3 py-2.5 text-sm font-medium text-slate-900 outline-none"
                  />
                  {!emailOtpSent && (
                    <button
                      type="button"
                      disabled={emailBusy || !newEmail.includes("@")}
                      onClick={handleSendEmailOtp}
                      className="m-1 rounded-lg bg-orange-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-700 disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {emailBusy ? "Sending…" : "Get Code"}
                    </button>
                  )}
                </div>
              </div>

              {emailOtpSent && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-blue-950">Enter 6-Digit Email Code</label>
                    {emailCooldown > 0 ? (
                      <span className="text-[11px] font-semibold text-slate-500">Resend in {emailCooldown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendEmailOtp}
                        className="text-[11px] font-bold text-orange-700 hover:underline cursor-pointer"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="000000"
                      value={emailOtp}
                      onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ""))}
                      className="h-10 w-full rounded-xl border border-slate-300 bg-white px-3 text-center font-mono text-base font-bold tracking-widest text-slate-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                    />
                    <button
                      type="button"
                      disabled={emailBusy || emailOtp.length !== 6}
                      onClick={handleVerifyEmailChange}
                      className="h-10 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 shrink-0 cursor-pointer"
                    >
                      {emailBusy ? "Verifying…" : "Confirm Verification"}
                    </button>
                  </div>
                </div>
              )}

              {emailModalMsg && (
                <p className={`text-xs font-semibold ${emailModalMsg.error ? "text-rose-600" : "text-emerald-700"}`}>
                  {emailModalMsg.text}
                </p>
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowEmailModal(false)}
                className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
