import Link from "next/link";
import { redirect } from "next/navigation";
import RegisterAccount from "./register-account";
import { getTrustitResumeState, hasBlockingTrustitMerchantSession } from "./actions";
import { isTrustitPhoneOtpBypassEnabled, trustitPasswordSetupIsPending } from "@/lib/trustit-onboarding";

export const dynamic = "force-dynamic";
export default async function RegisterPage() {
  const resume = await getTrustitResumeState();
  if (resume?.current_step === "business") redirect("/register/business");
  if (resume?.current_step === "plan") redirect("/register/plan");
  if (resume?.current_step === "payment") redirect("/register/payment");
  if (resume?.current_step === "complete") redirect("/merchant/dashboard");
  const passwordSetupPending = await trustitPasswordSetupIsPending();
  const hasBlockingSession = passwordSetupPending ? false : await hasBlockingTrustitMerchantSession();
  return <main className="min-h-screen bg-slate-50 px-4 py-10"><div className="mx-auto max-w-lg"><Link href="/trustit" className="text-xl font-extrabold text-blue-700">Trustit</Link><section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><div className="flex justify-between text-xs font-semibold text-slate-500">{["Account","Business","Plan","Payment"].map((s,i)=><span key={s} className={i===0?"text-blue-700":""}>{i+1}. {s}</span>)}</div><h1 className="mt-8 text-2xl font-bold text-slate-900">Trustit par apna Business add karein</h1><p className="mt-2 text-slate-600">Apne customers se genuine Google Reviews paaiye.</p><RegisterAccount skipPhoneOtp={isTrustitPhoneOtpBypassEnabled()} passwordSetupPending={passwordSetupPending} hasBlockingSession={hasBlockingSession} /></section><p className="mt-5 text-center text-sm text-slate-600">Already have an account? <Link href="/merchant/login" className="font-semibold text-blue-700">Merchant Login</Link></p></div></main>;
}
