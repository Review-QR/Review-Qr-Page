"use client";

import { useActionState, useState } from "react";
import { merchantSignInAction } from "./actions";

export default function MerchantLoginForm() {
  const [tab, setTab] = useState<"mobile" | "biz_id">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(merchantSignInAction, {
    message: "",
  });

  return (
    <div className="mt-4">
      {/* Switcher Tabs */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1.5 text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setTab("mobile")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
            tab === "mobile"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>📱</span>
          <span>मोबाइल नंबर</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("biz_id")}
          className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition ${
            tab === "biz_id"
              ? "bg-white text-blue-700 shadow-sm"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span>🏢</span>
          <span>बिज़नेस ID</span>
        </button>
      </div>

      <form action={formAction} className="mt-5 space-y-4 text-left">
        {state.message && (
          <div
            className="flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-700"
            role="alert"
          >
            <span className="text-base leading-none">⚠️</span>
            <span>{state.message}</span>
          </div>
        )}

        {tab === "mobile" ? (
          <div>
            <label htmlFor="mobileInput" className="mb-1.5 block text-xs font-bold text-slate-700">
              रजिस्टर्ड मोबाइल नंबर (10-Digit Mobile)
            </label>
            <div className="relative flex rounded-2xl border border-slate-200 bg-white shadow-xs focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition">
              <span className="inline-flex items-center rounded-l-2xl border-r border-slate-200 bg-slate-50 px-3.5 text-xs font-black text-slate-700">
                🇮🇳 +91
              </span>
              <input
                id="mobileInput"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="उदा. 9118643415"
                className="w-full rounded-r-2xl px-3.5 py-3 text-sm font-semibold text-slate-900 outline-none"
              />
            </div>
            {/* Hidden field that passes the normalized +91 phone number to the existing server action */}
            <input
              type="hidden"
              name="businessId"
              value={mobileNumber ? `+91${mobileNumber}` : ""}
            />
            <p className="mt-1 text-[11px] text-slate-500">
              रजिस्ट्रेशन के समय दिया गया आपका 10 अंकों का फोन नंबर
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="businessId" className="mb-1.5 block text-xs font-bold text-slate-700">
              Business ID (मर्चेंट कोड)
            </label>
            <input
              id="businessId"
              name="businessId"
              autoComplete="username"
              required
              maxLength={128}
              placeholder="उदा. biz_... या QR-77837092"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-xs outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
            <p className="mt-1 text-[11px] text-slate-500">
              एडमिन या प्रोफाइल में दी गई आपकी यूनिक बिज़नेस ID
            </p>
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="merchantPassword" className="text-xs font-bold text-slate-700">
              लॉगिन पासवर्ड
            </label>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-[11px] font-semibold text-blue-700 hover:underline"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <div className="relative">
            <input
              id="merchantPassword"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              placeholder="••••••••"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-xs outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={pending || (tab === "mobile" && mobileNumber.length < 10)}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_12px_24px_-12px_rgba(37,99,235,0.4)] transition hover:from-blue-700 hover:to-blue-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>सत्यापित हो रहा है...</span>
            </>
          ) : (
            <>
              <span>डैशबोर्ड में लॉगिन करें</span>
              <span>→</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
