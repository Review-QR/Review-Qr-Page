"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import RegisterAccount from "./register-account";
import BusinessForm from "./business-form";
import PlanPicker from "./plan/plan-picker";
import OneTimeCheckout from "./payment/one-time-checkout";

const steps = ["Account", "Business", "Plan", "Payment"];
const headlines = [
  ["Know What Your Customers Think About Your Business", "आपके ग्राहक आपके Business के बारे में क्या सोचते हैं", "Simple feedback helps you understand each visit."],
  ["Know What Your Customers Love About Your Business", "आपके ग्राहकों को आपके Business में क्या सबसे ज्यादा पसंद आता है", "Give every customer a clear, thoughtful way to share."],
  ["Understand What Your Customers Think", "आपके ग्राहक आपके Business को किस नज़र से देखते हैं", "Build trust with genuine customer feedback."],
  ["Turn Customer Feedback Into Business Insights", "Customer Feedback से Business की बेहतर समझ", "See feedback and QR activity in your merchant dashboard."],
  ["Discover What Your Customers Really Think", "आपके ग्राहक आपके Business के बारे में वास्तव में क्या सोचते हैं", "Start with a few details and get your business ready."],
];

export default function RegistrationFlow({
  initialStep, skipPhoneOtp, passwordSetupPending, hasBlockingSession, selectedPlan,
  orderId, businessName: savedName, businessType: savedType,
}: {
  initialStep: number; skipPhoneOtp: boolean; passwordSetupPending: boolean;
  hasBlockingSession: boolean; selectedPlan: string | null; orderId: string | null;
  businessName: string; businessType: string;
}) {
  const [step, setStep] = useState(initialStep);
  const [plan, setPlan] = useState(selectedPlan);
  const [name, setName] = useState(savedName);
  const [type, setType] = useState(savedType);
  const [headlineIndex, setHeadlineIndex] = useState(0);
  useEffect(() => {
    const storedName = window.sessionStorage.getItem("trustit_business_name");
    const storedType = window.sessionStorage.getItem("trustit_business_type");
    if (storedName) setName(storedName);
    if (storedType) setType(storedType);
    const timer = window.setInterval(() => setHeadlineIndex(index => (index + 1) % headlines.length), 5500);
    return () => window.clearInterval(timer);
  }, []);
  function advance(next: number) {
    setStep(next);
    window.setTimeout(() => document.getElementById(`registration-step-${next}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
  }
  const priceByPlan: Record<string, number> = { Basic: 29, Standard: 49, Premium: 99 };
  const activeHeadline = headlines[headlineIndex];

  return <main className="min-h-screen bg-[#faf7f0] px-4 py-5 font-sans text-slate-900 sm:px-6 sm:py-8">
    <div className="mx-auto max-w-3xl">
      <header className="flex items-center justify-between gap-4">
        <Link href="/trustit" className="inline-flex items-center gap-2 rounded-lg" aria-label="Trustit home"><Image src="/trustit-icon.svg" alt="" width={36} height={36} priority className="rounded-xl" /><span className="text-lg font-bold">Trustit</span></Link>
        <Link href="/merchant/login" className="text-sm font-semibold text-slate-600 hover:text-amber-800">Business Login</Link>
      </header>
      <section className="mt-5 rounded-[1.75rem] border border-[#eee5d5] bg-white p-5 shadow-[0_22px_65px_-42px_rgba(31,41,55,.35)] sm:mt-7 sm:p-8">
        <div className="rounded-2xl bg-[#fffaf0] p-5 sm:p-6" aria-live="polite">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-amber-800">Trustit for your business</p>
          <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-[#14243a] sm:text-3xl">{activeHeadline[0]}</h1>
          <p className="mt-2 text-lg font-medium text-amber-900">{activeHeadline[1]}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activeHeadline[2]}</p>
        </div>
        <nav aria-label="Registration progress" className="sticky top-0 z-10 -mx-5 mt-5 border-y border-[#eee5d5] bg-white/95 px-5 py-3 backdrop-blur sm:-mx-8 sm:px-8">
          <ol className="grid grid-cols-4 gap-2">{steps.map((label, index) => { const number = index + 1; const complete = number < step; const current = number === step; return <li key={label} aria-current={current ? "step" : undefined}><div className={`flex items-center gap-1.5 text-[11px] font-semibold sm:gap-2 sm:text-xs ${current ? "text-amber-900" : complete ? "text-emerald-700" : "text-slate-400"}`}><span className={`grid size-6 shrink-0 place-items-center rounded-full text-[10px] ${current ? "bg-amber-700 text-white" : complete ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{complete ? "✓" : number}</span><span className="truncate">{label}</span></div><div className={`mt-2 h-1 rounded-full ${current ? "bg-amber-700" : complete ? "bg-emerald-500" : "bg-slate-100"}`} /></li>; })}</ol>
        </nav>

        <div className="mt-7 space-y-3">
          {steps.map((label, index) => { const number = index + 1; const current = number === step; const complete = number < step; return <section id={`registration-step-${number}`} key={label} className={`scroll-mt-28 rounded-2xl border p-4 sm:p-5 ${current ? "border-amber-300 bg-white shadow-sm" : complete ? "border-emerald-100 bg-emerald-50/40" : "border-slate-100 bg-slate-50/60"}`}>
            <h2 className="flex items-center gap-2 text-base font-semibold text-[#14243a]"><span className={`grid size-7 place-items-center rounded-full text-xs ${current ? "bg-amber-700 text-white" : complete ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"}`}>{complete ? "✓" : number}</span>{label}{complete ? <span className="ml-auto text-xs font-medium text-emerald-700">Complete</span> : null}</h2>
            {current && number === 1 && <><p className="mt-2 text-sm text-slate-600">Create your account and choose the business category customers will see.</p><RegisterAccount skipPhoneOtp={skipPhoneOtp} passwordSetupPending={passwordSetupPending} hasBlockingSession={hasBlockingSession} onComplete={(businessName, businessType) => { setName(businessName); setType(businessType); advance(2); }} /></>}
            {current && number === 2 && <><p className="mt-2 text-sm text-slate-600">Add the address and optional Google Review link for your business.</p><BusinessForm initialBusinessName={name} businessType={type} onComplete={() => advance(3)} /></>}
            {current && number === 3 && <><p className="mt-2 text-sm text-slate-600">Choose a 30-day plan. The selected price is confirmed securely before payment.</p><PlanPicker selected={plan} onContinue={(nextPlan) => { setPlan(nextPlan); advance(4); }} /></>}
            {current && number === 4 && <><p className="mt-2 text-sm text-slate-600">One-time payment · no AutoPay or recurring charges.</p><p className="mt-4 rounded-xl border border-[#eee5d5] bg-[#fffaf0] p-4 text-sm font-semibold">{plan ?? "Plan"} · ₹{priceByPlan[plan ?? ""] ?? "—"} for 30 days</p><OneTimeCheckout initialOrderId={orderId} autoVerifyOrderId={orderId} /></>}
            {complete && <p className="mt-2 pl-9 text-sm text-slate-600">{number === 1 ? `${name || "Business account"}${type ? ` · ${type}` : ""}` : number === 2 ? "Business details saved" : number === 3 ? `${plan ?? "Plan"} selected` : "Payment confirmed"}</p>}
            {!current && !complete && <p className="mt-2 pl-9 text-sm text-slate-500">Complete the previous step to continue.</p>}
          </section>; })}
        </div>
        <p className="mt-5 text-center text-xs leading-5 text-slate-500">Your business and QR are activated only after payment verification.</p>
      </section>
    </div>
  </main>;
}
