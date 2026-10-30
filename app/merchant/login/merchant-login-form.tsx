"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { merchantSignInAction } from "./actions";

export default function MerchantLoginForm() {
  const [tab, setTab] = useState<"mobile" | "biz_id">("mobile");
  const [mobileNumber, setMobileNumber] = useState("");
  const [businessIdInput, setBusinessIdInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction, pending] = useActionState(merchantSignInAction, {
    message: "",
  });

  return (
    <div className="mt-5">
      {/* Dual Tab Switcher */}
      <div className="grid grid-cols-2 gap-1 rounded-2xl bg-slate-100 p-1 text-xs font-bold text-slate-600">
        <button
          type="button"
          onClick={() => setTab("mobile")}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
            tab === "mobile"
              ? "bg-white text-blue-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="text-sm">📱</span>
          <span>Mobile Number</span>
        </button>
        <button
          type="button"
          onClick={() => setTab("biz_id")}
          className={`flex items-center justify-center gap-2 rounded-xl py-2.5 transition ${
            tab === "biz_id"
              ? "bg-white text-blue-700 shadow-xs"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          <span className="text-sm">🏢</span>
          <span>Business ID</span>
        </button>
      </div>

      <form action={formAction} className="mt-5 space-y-4 text-left">
        {state.message && (
          <div
            className="flex items-start gap-2.5 rounded-2xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-red-700"
            role="alert"
          >
            <span className="text-base leading-none">⚠️</span>
            <span>{state.message}</span>
          </div>
        )}

        {tab === "mobile" ? (
          <div>
            <label htmlFor="mobileInput" className="mb-1.5 block text-xs font-bold text-slate-800">
              Registered Mobile Number
            </label>
            <div className="relative flex overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100 transition">
              <div className="flex flex-col items-center justify-center border-r border-slate-200 bg-slate-50/80 px-3.5 py-1 text-center select-none">
                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">IN</span>
                <span className="text-xs font-black text-slate-900">+91</span>
              </div>
              <input
                id="mobileInput"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter your mobile number"
                className="w-full px-3.5 py-3 text-sm font-semibold text-slate-900 placeholder:text-slate-400 outline-none"
              />
            </div>
            {/* Hidden field for form submission with +91 normalized value */}
            <input
              type="hidden"
              name="businessId"
              value={mobileNumber ? `+91${mobileNumber}` : ""}
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              We&apos;ll send a 10-digit OTP to your number
            </p>
          </div>
        ) : (
          <div>
            <label htmlFor="businessId" className="mb-1.5 block text-xs font-bold text-slate-800">
              Business ID (मर्चेंट कोड)
            </label>
            <input
              id="businessId"
              name="businessId"
              autoComplete="username"
              required
              maxLength={128}
              value={businessIdInput}
              onChange={(e) => setBusinessIdInput(e.target.value)}
              placeholder="e.g. biz_... or QR-77837092"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Your unique Business ID issued by Trustit Review-QR
            </p>
          </div>
        )}

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="merchantPassword" className="text-xs font-bold text-slate-800">
              Password
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
            id="merchantPassword"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            placeholder="••••••••"
            className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-900 shadow-2xs placeholder:text-slate-400 outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {/* Primary Action Button */}
        <button
          type="submit"
          disabled={pending || (tab === "mobile" && mobileNumber.length < 10) || (tab === "biz_id" && !businessIdInput.trim())}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-5 py-3.5 text-sm font-black text-white shadow-[0_12px_24px_-10px_rgba(37,99,235,0.45)] transition hover:from-blue-700 hover:to-indigo-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? (
            <>
              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <span>Signing in...</span>
            </>
          ) : (
            <>
              <span>Login to Dashboard</span>
              <span>→</span>
            </>
          )}
        </button>

        {/* OR Divider */}
        <div className="relative my-4 flex items-center justify-center">
          <div className="w-full border-t border-slate-200" />
          <span className="absolute bg-white px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
            OR
          </span>
        </div>

        {/* Secondary Switcher Button */}
        {tab === "mobile" ? (
          <button
            type="button"
            onClick={() => setTab("biz_id")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-300 hover:bg-slate-50 transition"
          >
            <span className="text-base">🏢</span>
            <span>Login with Business ID</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setTab("mobile")}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 bg-white px-4 py-3 text-xs font-bold text-slate-700 shadow-2xs hover:border-blue-300 hover:bg-slate-50 transition"
          >
            <span className="text-base">📱</span>
            <span>Login with Mobile Number</span>
          </button>
        )}

        {/* Footer Link */}
        <div className="pt-2 text-center">
          <p className="text-xs text-slate-600">
            New to Trustit?{" "}
            <Link
              href="/register?new=1"
              className="font-black text-blue-700 hover:underline hover:text-blue-900 transition"
            >
              Register Your Business →
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}
