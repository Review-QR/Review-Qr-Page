"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMerchantBrowserClient } from "@/lib/supabase-merchant-browser";
import { completeTrustitBypassPassword, completeTrustitOtpPassword, completeTrustitProfile, createTrustitAccountWithoutOtp, logoutTrustitMerchantSession } from "./actions";

const supabase = createMerchantBrowserClient();
const inputClass = "mt-1.5 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-100";

function isPasswordValid(password: string) {
  return password.length >= 6 && password.length <= 16 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

export default function RegisterAccount({ skipPhoneOtp, passwordSetupPending, hasBlockingSession }: { skipPhoneOtp: boolean; passwordSetupPending: boolean; hasBlockingSession: boolean }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState("");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"details" | "otp" | "password" | "pending-password">(
    passwordSetupPending ? "pending-password" : "details",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [duplicateMobile, setDuplicateMobile] = useState(false);

  function report(result: { success: boolean; message: string; code?: string }) {
    setDuplicateMobile(result.code === "duplicate_mobile");
    setMessage(result.message);
  }

  async function logoutAndStartNewAccount() {
    setBusy(true); setMessage("");
    try {
      const result = await logoutTrustitMerchantSession();
      if (!result.success) { setMessage(result.message); return; }
      router.refresh();
    } catch {
      setMessage("Could not sign out. Please try again.");
    } finally { setBusy(false); }
  }

  async function sendOtp(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage(""); setDuplicateMobile(false);
    const normalized = mobile.replace(/[\s()-]/g, "");
    const phone = normalized.startsWith("+") ? normalized : `+91${normalized}`;
    if (!/^\+[1-9][0-9]{7,14}$/.test(phone)) { setMessage("Enter a valid mobile number with country code."); setBusy(false); return; }
    try {
      const { error } = await supabase.auth.signInWithOtp({ phone, options: { shouldCreateUser: true } });
      if (error) { setMessage("Mobile verification is not available yet. Please check SMS/phone Auth setup and try again."); return; }
      setMobile(phone); setStage("otp"); setMessage("OTP sent. Check your SMS and enter the code here.");
    } catch {
      setMessage("We could not send the OTP just now. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  async function verifyOtp(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const { error } = await supabase.auth.verifyOtp({ phone: mobile, token: otp.trim(), type: "sms" });
      if (error) { setMessage("That code could not be verified. Check it and try again."); return; }
      setStage("password"); setMessage("Mobile verified. Create your password to continue.");
    } catch {
      setMessage("We could not verify the code just now. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  async function createAccountWithoutOtp(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setDuplicateMobile(false);
    if (!businessName.trim() || !name.trim() || !mobile.trim()) {
      setMessage("Enter your business name, owner name, and mobile number to continue.");
      return;
    }
    if (!isPasswordValid(password)) {
      setMessage("Password must be 6–16 characters and include a letter and a number.");
      return;
    }
    setBusy(true);
    try {
      const result = await createTrustitAccountWithoutOtp({ businessName, fullName: name, mobile, password });
      if (!result.success) { report(result); return; }
      window.sessionStorage.setItem("trustit_business_name", businessName.trim());
      router.push("/register/business");
      router.refresh();
    } catch {
      setMessage("Your account could not be saved just now. Please try again.");
    } finally { setBusy(false); setPassword(""); }
  }

  async function createVerifiedAccount(event: React.FormEvent) {
    event.preventDefault(); setMessage(""); setDuplicateMobile(false);
    if (!isPasswordValid(password)) { setMessage("Password must be 6–16 characters and include a letter and a number."); return; }
    setBusy(true);
    try {
      const profile = await completeTrustitProfile(name, businessName);
      if (!profile.success) { report(profile); return; }
      const passwordResult = await completeTrustitOtpPassword(password);
      if (!passwordResult.success) { setMessage(passwordResult.message); return; }
      window.sessionStorage.setItem("trustit_business_name", businessName.trim());
      setPassword("");
      router.push("/register/business");
      router.refresh();
    } catch {
      setMessage("Your account could not be saved just now. Please try again.");
    } finally { setBusy(false); setPassword(""); }
  }

  async function setPendingAccountPassword(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    if (!isPasswordValid(password)) { setMessage("Password must be 6–16 characters and include a letter and a number."); return; }
    setBusy(true);
    try {
      const result = await completeTrustitBypassPassword({ password, confirmation: password });
      if (!result.success) { setMessage(result.message); return; }
      setPassword(""); router.push("/register/business"); router.refresh();
    } catch {
      setMessage("Password could not be saved. Please try again.");
    } finally { setBusy(false); setPassword(""); }
  }

  if (hasBlockingSession) return <div className="mt-8 rounded-3xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm"><p className="text-sm font-semibold text-slate-900">A merchant session is already active.</p><p className="mt-1 text-sm leading-6 text-slate-600">Sign out before creating a different account. Your current account will not be changed.</p><button type="button" disabled={busy} onClick={logoutAndStartNewAccount} className="mt-4 min-h-12 w-full rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50">{busy ? "Signing out…" : "Logout & Start New Account"}</button>{message && <p role="alert" className="mt-3 text-sm text-rose-800">{message}</p>}</div>;

  const formSubmit = stage === "details" ? (skipPhoneOtp ? createAccountWithoutOtp : sendOtp) : stage === "otp" ? verifyOtp : stage === "password" ? createVerifiedAccount : setPendingAccountPassword;
  const showDetails = stage === "details" || stage === "otp";

  return <form onSubmit={formSubmit} className="mt-8 space-y-5">
    {showDetails && <>
      <label className="block text-sm font-semibold text-slate-800">Business Name<input className={inputClass} autoComplete="organization" maxLength={160} value={businessName} onChange={event => setBusinessName(event.target.value)} required disabled={stage !== "details"} /></label>
      <label className="block text-sm font-semibold text-slate-800">Owner Name<input className={inputClass} autoComplete="name" maxLength={160} value={name} onChange={event => setName(event.target.value)} required disabled={stage !== "details"} /></label>
      <label className="block text-sm font-semibold text-slate-800">Mobile Number<input className={inputClass} type="tel" autoComplete="tel" inputMode="tel" placeholder="+91 98765 43210" maxLength={24} value={mobile} onChange={event => setMobile(event.target.value)} required /></label>
      {!skipPhoneOtp && <p className="-mt-3 text-xs leading-5 text-slate-500">OTP verification uses the phone Auth provider configured for this project.</p>}
      {stage === "details" && <><label className="block text-sm font-semibold text-slate-800">Create Your Password<input className={inputClass} type="password" autoComplete="new-password" minLength={6} maxLength={16} value={password} onChange={event => setPassword(event.target.value)} required aria-describedby="password-help" /></label><p id="password-help" className="-mt-3 text-xs leading-5 text-slate-500">Password must be 6–16 characters, with at least one letter and one number.</p></>}
    </>}
    {stage === "otp" && <label className="block text-sm font-semibold text-slate-800">SMS verification code<input className={inputClass} inputMode="numeric" autoComplete="one-time-code" maxLength={12} value={otp} onChange={event => setOtp(event.target.value)} required /></label>}
    {(stage === "password" || stage === "pending-password") && <><label className="block text-sm font-semibold text-slate-800">Create Your Password<input className={inputClass} type="password" autoComplete="new-password" minLength={6} maxLength={16} value={password} onChange={event => setPassword(event.target.value)} required aria-describedby="password-help" /></label><p id="password-help" className="-mt-3 text-xs leading-5 text-slate-500">Password must be 6–16 characters, with at least one letter and one number.</p></>}
    <button disabled={busy} className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-blue-700 to-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_-14px_rgba(37,99,235,0.8)] transition hover:from-blue-800 hover:to-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-60">{busy ? "Please wait…" : stage === "details" ? (skipPhoneOtp ? "Create Your Business Account" : "Send OTP") : stage === "otp" ? "Verify OTP" : stage === "password" ? "Create Your Business Account" : "Set Password & Continue"}</button>
    {(stage === "otp" || stage === "password") && <button type="button" disabled={busy} onClick={() => { setStage(stage === "password" ? "otp" : "details"); setMessage(""); }} className="min-h-10 w-full rounded-lg px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">Back</button>}
    {message && <div role={duplicateMobile ? "alert" : "status"} className={`rounded-xl px-4 py-3 text-sm leading-6 ${duplicateMobile ? "border border-amber-200 bg-amber-50 text-amber-950" : "bg-slate-50 text-slate-700"}`}><p>{message}</p>{duplicateMobile && <Link href="/merchant/login" className="mt-1 inline-block font-semibold text-blue-800 underline underline-offset-2">Merchant Login</Link>}</div>}
    <p className="border-t border-slate-100 pt-4 text-center text-sm text-slate-600">Already have an account? <Link href="/merchant/login" className="font-semibold text-blue-800 underline underline-offset-2">Merchant Login</Link></p>
  </form>;
}
