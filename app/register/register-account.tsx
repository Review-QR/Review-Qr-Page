"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMerchantBrowserClient } from "@/lib/supabase-merchant-browser";
import { completeTrustitProfile } from "./actions";

const supabase = createMerchantBrowserClient();
const inputClass = "mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

export default function RegisterAccount() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [stage, setStage] = useState<"account" | "otp" | "password">("account");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function sendOtp(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
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
      setStage("password"); setMessage("Mobile verified. Create a password for your account.");
    } catch {
      setMessage("We could not verify the code just now. Check your connection and try again.");
    } finally { setBusy(false); }
  }

  async function createPassword(event: React.FormEvent) {
    event.preventDefault(); setMessage("");
    if (password.length < 12 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password) || password !== confirm) { setMessage("Use at least 12 characters, including a letter and a number; both passwords must match."); return; }
    setBusy(true);
    try {
      // Check the verified phone and create/resume the onboarding profile before
      // changing an existing Auth password for a number already tied to a merchant.
      const profile = await completeTrustitProfile(name);
      if (!profile.success) { setMessage(profile.message); return; }
      const { error } = await supabase.auth.updateUser({ password });
      if (error) { setMessage("Password could not be saved. Please try again."); return; }
      setPassword(""); setConfirm("");
      router.push("/register/business"); router.refresh();
    } catch {
      setMessage("Your account could not be saved just now. Please try again.");
    } finally { setBusy(false); }
  }

  return <form onSubmit={stage === "account" ? sendOtp : stage === "otp" ? verifyOtp : createPassword} className="mt-7 space-y-5">
    {stage === "account" && <><label className="block text-left text-sm font-medium">Full Name<input className={inputClass} autoComplete="name" maxLength={160} value={name} onChange={e=>setName(e.target.value)} required /></label><label className="block text-left text-sm font-medium">Mobile Number<input className={inputClass} type="tel" autoComplete="tel" placeholder="+91 98765 43210" value={mobile} onChange={e=>setMobile(e.target.value)} required /><span className="mt-1 block text-xs font-normal text-slate-500">OTP verification uses the phone Auth provider configured for this project.</span></label></>}
    {stage === "otp" && <label className="block text-left text-sm font-medium">SMS verification code<input className={inputClass} inputMode="numeric" autoComplete="one-time-code" maxLength={12} value={otp} onChange={e=>setOtp(e.target.value)} required /></label>}
    {stage === "password" && <><label className="block text-left text-sm font-medium">Create Password<input className={inputClass} type="password" autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} required /></label><label className="block text-left text-sm font-medium">Confirm Password<input className={inputClass} type="password" autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)} required /></label><p className="text-left text-xs text-slate-500">At least 12 characters, with a letter and number. Your password stays with Supabase Auth and is never shown to an administrator.</p></>}
    <button disabled={busy} className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white hover:bg-blue-800 disabled:opacity-50">{busy ? "Please wait…" : stage === "account" ? "Send OTP" : stage === "otp" ? "Verify Mobile" : "Create Account"}</button>
    {stage !== "account" && <button type="button" disabled={busy} onClick={()=>{setStage(stage === "password" ? "otp" : "account"); setMessage("")}} className="w-full py-1 text-sm font-medium text-slate-600">Back</button>}
    {message && <p role="status" className="text-left text-sm text-slate-600">{message}</p>}
  </form>;
}
