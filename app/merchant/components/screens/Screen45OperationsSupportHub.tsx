"use client";

import React from "react";

interface Screen45Props {
  onBack?: () => void;
  onOpenPrinterWizard?: () => void;
  onOpenTicket?: () => void;
}

export default function Screen45OperationsSupportHub({
  onBack,
  onOpenPrinterWizard,
  onOpenTicket,
}: Screen45Props) {
  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              24X7 ESCALATION DESK
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Merchant Operations Support
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Status Card */}
        <div className="mt-2.5 bg-emerald-50 border border-emerald-300 rounded-2xl p-3 shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Desk Online
            </span>
            <span className="text-[10px] font-bold bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-200">
              Avg Response: &lt; 2 Mins
            </span>
          </div>
          <p className="text-[10px] text-emerald-800">
            Dedicated hyperlocal support team stationed at Bahraich Central Operations Hub.
          </p>
        </div>

        {/* Support Channels */}
        <div className="mt-3 space-y-2">
          {/* WhatsApp Direct */}
          <a
            href="https://wa.me/919118643415"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-white border border-emerald-300 hover:border-emerald-500 rounded-2xl shadow-2xs flex items-center justify-between transition block"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl shadow-2xs">
                💬
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Direct WhatsApp Operations Desk</h4>
                <p className="text-[10px] text-slate-500 font-mono">+91 9118643415 (24x7 Active)</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700">Chat →</span>
          </a>

          {/* Emergency Phone */}
          <a
            href="tel:+919118643415"
            className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-2xs flex items-center justify-between transition block"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center text-xl shadow-2xs">
                📞
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Urgent Calling Helpline</h4>
                <p className="text-[10px] text-slate-500">For rider emergencies &amp; kitchen escalations</p>
              </div>
            </div>
            <span className="text-xs font-bold text-blue-700">Call Now →</span>
          </a>

          {/* Thermal Printer Setup Shortcut */}
          <div
            onClick={onOpenPrinterWizard}
            className="p-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl shadow-2xs flex items-center justify-between transition cursor-pointer"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center text-xl shadow-2xs">
                🖨️
              </div>
              <div>
                <h4 className="text-xs font-black text-slate-900">Thermal Printer Setup Wizard</h4>
                <p className="text-[10px] text-slate-500">Connect 58mm/80mm USB/Bluetooth receipt printers</p>
              </div>
            </div>
            <span className="text-xs font-bold text-slate-700">Setup →</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onOpenTicket}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
        >
          Submit Formal Support Ticket →
        </button>
      </div>
    </div>
  );
}
