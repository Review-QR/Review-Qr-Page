"use client";

import React, { useState } from "react";

export interface GoogleConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  role: "customer" | "merchant" | "rider";
  onSuccess: (user: { email: string; fullName: string; phone?: string }) => void;
  defaultEmail?: string;
  defaultName?: string;
}

export default function GoogleConsentModal({
  isOpen,
  onClose,
  role,
  onSuccess,
  defaultEmail = "lucky.trustit@gmail.com",
  defaultName = "Lucky Shukla",
}: GoogleConsentModalProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [fullName, setFullName] = useState(defaultName);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const roleLabels = {
    customer: "Customer Super-App",
    merchant: "Merchant Partner Console",
    rider: "Rider Fleet Partner",
  };

  const handleConsent = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSuccess({
        email: email.trim().toLowerCase(),
        fullName: fullName.trim() || "Google User",
      });
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-slate-900 font-sans animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-slate-100 text-center">
          {/* Official Google G Logo */}
          <div className="w-12 h-12 mx-auto mb-3 flex items-center justify-center rounded-2xl bg-white border border-slate-200 shadow-xs">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
          </div>

          <h3 className="text-base font-black text-slate-900 tracking-tight">
            Sign in with Google
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            to continue to <strong className="text-blue-700">Trustit {roleLabels[role]}</strong>
          </p>
        </div>

        {/* Account Selection Card */}
        <div className="p-5 space-y-4">
          {!isCustomMode ? (
            <div className="rounded-2xl border-2 border-blue-500/30 bg-blue-50/40 p-3.5 flex items-center justify-between transition hover:border-blue-500">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs">
                  {fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="text-xs font-black text-slate-900 leading-tight">
                    {fullName}
                  </div>
                  <div className="text-[11px] font-mono text-slate-600">
                    {email}
                  </div>
                  <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded-md">
                    ✓ Google Verified
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="text-[10px] font-bold text-blue-700 hover:underline px-2 py-1 rounded-lg bg-white border border-blue-200"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="space-y-2.5 rounded-2xl border border-slate-200 bg-slate-50 p-3.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Your Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Lucky Shukla"
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                  Google Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. you@gmail.com"
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-xl border border-slate-300 bg-white text-slate-900 outline-none focus:border-blue-600"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsCustomMode(false)}
                className="text-[10px] font-bold text-blue-700 underline block text-right w-full"
              >
                ✓ Use this profile
              </button>
            </div>
          )}

          {/* Consent Notice */}
          <div className="text-[10.5px] text-slate-500 leading-relaxed bg-slate-50 border border-slate-100 p-2.5 rounded-xl">
            To continue, Google will share your name, email address, and profile picture with Trustit.
            Review Trustit&apos;s <span className="text-blue-600 underline">Privacy Policy</span> and <span className="text-blue-600 underline">Terms</span>.
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={isLoading || !email.includes("@")}
              onClick={handleConsent}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1a73e8] hover:bg-[#1557b0] text-white font-bold text-xs shadow-md transition active:scale-98 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Verifying with Google...</span>
                </>
              ) : (
                <>
                  <span>Continue as {fullName.split(" ")[0]}</span>
                  <span>→</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
