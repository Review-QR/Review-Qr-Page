"use client";

import Image from "next/image";
import Link from "next/link";
import React, { createContext, useContext, useState } from "react";

const RegisterFlowContext = createContext<{
  step1Completed: boolean;
  setStep1Completed: (val: boolean) => void;
}>({
  step1Completed: false,
  setStep1Completed: () => {},
});

export function useRegisterFlow() {
  return useContext(RegisterFlowContext);
}

const steps = ["Account", "Business Address", "Plan", "Payment"] as const;

function ModernPhonePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[155px]">
      {/* Ambient background glows */}
      <div className="absolute -right-3 top-4 h-14 w-14 rounded-full bg-blue-200/40 blur-lg pointer-events-none" />
      <div className="absolute -left-3 bottom-6 h-14 w-14 rounded-full bg-indigo-200/30 blur-lg pointer-events-none" />

      {/* Smartphone Device Frame */}
      <div className="relative w-full rounded-[1.6rem] border-[2px] border-slate-900 bg-slate-900 p-1 shadow-md ring-1 ring-slate-900/10">
        {/* Dynamic Island / Speaker Pill */}
        <div className="mx-auto mb-0.5 h-2 w-10 rounded-full bg-slate-950 flex items-center justify-center">
          <span className="h-0.5 w-0.5 rounded-full bg-slate-800" />
        </div>

        {/* Screen */}
        <div className="rounded-[1.3rem] bg-white p-2 text-slate-900 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[7.5px] font-bold text-slate-500 uppercase tracking-wider">Business Growth</span>
            <span className="rounded-full bg-blue-50 px-1 py-0.2 text-[7px] font-black text-blue-700">Live</span>
          </div>

          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-sm font-black tracking-tight text-slate-950">+62%</span>
            <span className="text-[8.5px] font-extrabold text-blue-600 flex items-center">
              ▲ <span>+18%</span>
            </span>
          </div>

          {/* Upward Chart Graphic */}
          <div className="my-1 flex items-end gap-1 h-5 px-0.5 border-b border-slate-100 pb-0.5">
            <span className="h-1.5 w-full rounded-xs bg-blue-100" />
            <span className="h-3 w-full rounded-xs bg-blue-200" />
            <span className="h-2.5 w-full rounded-xs bg-blue-300" />
            <span className="h-4 w-full rounded-xs bg-blue-400" />
            <span className="h-5 w-full rounded-xs bg-blue-600" />
          </div>

          {/* Mini Stats Cards */}
          <div className="space-y-0.5">
            <div className="flex items-center justify-between rounded-md bg-orange-50/90 px-1.5 py-0.5 text-[8.5px]">
              <div className="flex items-center gap-1">
                <span className="grid h-3 w-3 place-items-center rounded bg-orange-100 text-[7px]">🛒</span>
                <span className="font-bold text-slate-800">Orders 128</span>
              </div>
              <span className="font-extrabold text-orange-600">+18%</span>
            </div>

            <div className="flex items-center justify-between rounded-md bg-emerald-50/90 px-1.5 py-0.5 text-[8.5px]">
              <div className="flex items-center gap-1">
                <span className="grid h-3 w-3 place-items-center rounded bg-emerald-100 text-[7px]">💳</span>
                <span className="font-bold text-slate-800">₹24,580</span>
              </div>
              <span className="font-extrabold text-emerald-600">+27%</span>
            </div>

            <div className="flex items-center justify-between rounded-md bg-purple-50/90 px-1.5 py-0.5 text-[8.5px]">
              <div className="flex items-center gap-1">
                <span className="grid h-3 w-3 place-items-center rounded bg-purple-100 text-[7px]">👥</span>
                <span className="font-bold text-slate-800">342 Users</span>
              </div>
              <span className="font-extrabold text-purple-600">+40%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterShell({
  currentStep,
  step1Completed: initialStep1Completed,
  title,
  description,
  children,
}: {
  currentStep: number;
  step1Completed?: boolean;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const [internalStep1Completed, setInternalStep1Completed] = useState(Boolean(initialStep1Completed));

  const effectiveStep1Completed = internalStep1Completed || Boolean(initialStep1Completed) || currentStep > 1;

  return (
    <RegisterFlowContext.Provider
      value={{
        step1Completed: effectiveStep1Completed,
        setStep1Completed: setInternalStep1Completed,
      }}
    >
      <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef4ff_0%,transparent_35%),radial-gradient(circle_at_92%_12%,#fff2d8_0%,transparent_30%),#f8fafc] font-sans text-slate-950 flex flex-col justify-center py-2 sm:py-3">
        <div className="mx-auto w-full max-w-5xl px-3 sm:px-5">
          {/* Top Header */}
          <header className="flex items-center justify-between px-1 py-1">
            <Link href="/trustit" className="inline-flex items-center gap-2">
              <Image src="/trustit-icon.svg" alt="Trustit" width={28} height={28} priority className="rounded-xl shadow-xs" />
              <span>
                <span className="block text-sm font-black tracking-tight text-slate-900 leading-none">Trustit</span>
                <span className="block text-[8px] font-semibold text-slate-500">Your Business Growth Partner</span>
              </span>
            </Link>

            {/* Top Trust Badges */}
            <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
              <span className="flex items-center gap-1.5">
                <span className="text-blue-600">🛡️</span> Safe & Secure
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-emerald-600">🎧</span> 24x7 Support
              </span>
              <span className="flex items-center gap-1.5">
                <span className="text-orange-600">🇮🇳</span> Made for Indian Businesses
              </span>
            </div>

            <Link
              href="/merchant/login"
              className="rounded-full bg-white px-3 py-1 text-xs font-bold text-blue-700 shadow-2xs ring-1 border border-slate-200 transition hover:border-blue-300 hover:bg-blue-50/50"
            >
              Business Login <span aria-hidden="true">→</span>
            </Link>
          </header>

          {/* Main Card Container */}
          <section className="mt-1.5 overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_12px_36px_-18px_rgba(15,23,42,0.12)]">
            {/* Progress Header */}
            <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/40 to-white px-3 py-1.5 sm:px-5">
              <ol className="grid grid-cols-4 gap-2 sm:gap-3" aria-label="Registration progress">
                {steps.map((step, index) => {
                  const n = index + 1;
                  const isStep1Done = n === 1 && effectiveStep1Completed;
                  const active = n === currentStep && !isStep1Done;
                  const complete = n < currentStep || isStep1Done;
                  return (
                    <li key={step} className="min-w-0">
                      <div
                        className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold ${
                          complete ? "text-emerald-600" : active ? "text-blue-700" : "text-slate-400"
                        }`}
                      >
                        <span
                          className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                            complete
                              ? "bg-emerald-100 text-emerald-700"
                              : active
                              ? "bg-blue-600 text-white shadow-xs"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {complete ? "✓" : n}
                        </span>
                        <span className="truncate">{step}</span>
                      </div>
                      <div
                        className={`mt-1 h-1 rounded-full transition-all ${
                          complete ? "bg-emerald-500" : active ? "bg-blue-600" : "bg-slate-100"
                        }`}
                      />
                    </li>
                  );
                })}
              </ol>
            </div>

            {/* Body Content Grid */}
            <div className="grid md:grid-cols-[minmax(0,1.3fr)_minmax(240px,0.7fr)]">
              {/* Form Column */}
              <div className="min-w-0 p-3 sm:p-4 lg:p-4.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2 py-0.2 text-[9px] font-black uppercase tracking-wider text-blue-700">
                  <span>Step {currentStep} of 4</span>
                </div>
                <h1 className="mt-1 text-base sm:text-lg font-black tracking-tight text-slate-900 leading-tight">
                  {title}
                </h1>
                <p className="mt-0.5 text-xs text-slate-500 leading-normal max-w-xl">
                  {description}
                </p>
                {children}
              </div>

              {/* Right-Hand Growth & Trust Preview */}
              <aside className="border-t border-slate-100 bg-gradient-to-br from-blue-50/50 via-white to-indigo-50/30 p-3 sm:p-4 md:border-l md:border-t-0 flex flex-col justify-between">
                <div>
                  <ModernPhonePreview />

                  <div className="mt-2 text-center">
                    <h2 className="text-xs sm:text-[13px] font-black text-slate-900 leading-snug">
                      Turn Local Trust Into Business Growth
                    </h2>
                    <p className="mt-0.5 text-[9.5px] text-slate-500">
                      आपका बिज़नेस, हमारी डिजिटल रफ़्तार
                    </p>

                    <div className="mt-2 space-y-1 text-left rounded-xl bg-white/85 border border-slate-100 p-2 shadow-2xs">
                      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>🛵 25–35m Dedicated Rider Fleet</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>⚡ Category-Tailored Tools (KOT / Parcha / Tokens)</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>⭐ Genuine Google Reviews &amp; Trust</span>
                      </p>
                      <p className="flex items-center gap-1.5 text-[10.5px] font-semibold text-slate-700">
                        <span className="text-emerald-500 font-bold">✓</span>
                        <span>🔔 Real-Time Sound &amp; Order Alerts</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verified Local Businesses Tag */}
                <div className="mt-2 rounded-lg border border-rose-100 bg-rose-50/70 px-2 py-1 text-center text-[9.5px] font-bold text-rose-800">
                  “Empowering Bahraich’s verified local businesses”
                </div>
              </aside>
            </div>
          </section>

          <p className="mx-auto mt-1.5 max-w-2xl px-2 text-center text-[9.5px] text-slate-500">
            Your business and QR are activated only after payment verification. Payments are one-time; AutoPay is not enabled.
          </p>
        </div>
      </main>
    </RegisterFlowContext.Provider>
  );
}