"use client";

import { useState } from "react";

export default function PublicSupportModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 rounded-full border border-slate-200/90 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-2xs hover:border-blue-400 hover:text-blue-700 hover:bg-white transition cursor-pointer"
      >
        <span className="text-blue-600">🎧</span>
        <span>24x7 Support</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div
            className="relative w-full max-w-lg rounded-3xl bg-white p-6 sm:p-7 shadow-2xl border border-slate-200 text-left"
            role="dialog"
            aria-modal="true"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="absolute top-5 right-5 grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition"
              aria-label="Close modal"
            >
              ✕
            </button>

            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-md shadow-blue-200">
                <span className="text-xl">🎧</span>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Trustit Merchant Help Desk
                </h3>
                <p className="text-xs text-slate-500">
                  24x7 operations, onboarding &amp; direct assistance
                </p>
              </div>
            </div>

            {/* Direct Contact Cards */}
            <div className="space-y-3 mt-4">
              {/* Phone Hotline */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-slate-200 text-slate-800">
                    <span className="text-lg">📞</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Priority Merchant Hotline</h4>
                    <p className="text-[11px] text-slate-500">Dedicated desk for merchant partners</p>
                  </div>
                </div>
                <a
                  href="tel:+919118643415"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
                >
                  Call +91 9118643415
                </a>
              </div>

              {/* WhatsApp Desk */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 hover:bg-emerald-50 transition">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-100 text-emerald-800">
                    <span className="text-lg">💬</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">WhatsApp Business Desk</h4>
                    <p className="text-[11px] text-slate-500">Instant chat &amp; query resolution</p>
                  </div>
                </div>
                <a
                  href="https://wa.me/919118643415"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-1"
                >
                  <span>Chat on WhatsApp</span>
                  <span>↗</span>
                </a>
              </div>

              {/* Email Desk */}
              <div className="flex items-center justify-between p-3.5 rounded-2xl border border-sky-200/80 bg-sky-50/40 hover:bg-sky-50 transition">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-sky-100 text-sky-800">
                    <span className="text-lg">✉️</span>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">Email &amp; Grievance Desk</h4>
                    <p className="text-[11px] text-slate-500">Official correspondence &amp; queries</p>
                  </div>
                </div>
                <a
                  href="mailto:luckyshukla9118@gmail.com"
                  className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold transition shadow-xs"
                >
                  Email Us
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1 font-semibold text-slate-700">
                <span>🛡️</span> Verified Partner Support
              </span>
              <span>Available 24x7</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
