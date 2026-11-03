"use client";

import React, { useState } from "react";

interface Screen03Props {
  onAgree?: () => void;
  onBack?: () => void;
}

export default function Screen03Consent({ onAgree, onBack }: Screen03Props) {
  const [hasScrolledBottom, setHasScrolledBottom] = useState(false);
  const [agreedCheckboxes, setAgreedCheckboxes] = useState({
    helmet: true,
    cashLimit: true,
    gpsTruth: true,
  });

  const allChecked = agreedCheckboxes.helmet && agreedCheckboxes.cashLimit && agreedCheckboxes.gpsTruth;

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-xs font-bold text-[#0D47A1] hover:underline"
          >
            <span>← Back</span>
          </button>
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Step 3 of 6</span>
        </div>

        <div className="mt-4 space-y-1">
          <h2 className="text-lg font-black text-slate-900 leading-tight">Partner Terms &amp; Road Safety Policy</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bahraich traffic compliance, parcel custody rules and cash ceiling undertakings.
          </p>
        </div>

        {/* Scrollable Terms Box */}
        <div
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.scrollHeight - el.scrollTop <= el.clientHeight + 40) {
              setHasScrolledBottom(true);
            }
          }}
          className="mt-4 bg-white border border-slate-200 rounded-2xl p-4 shadow-sm max-h-[260px] overflow-y-auto space-y-3 text-xs text-slate-700"
        >
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1">
            <strong className="text-amber-900 font-bold block text-xs">
              1. ₹1,500 Cash-in-Hand Safety Ceiling:
            </strong>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Main certify karta hoon ki jab bhi mere pass COD cash collection ₹1,500 tak pahunchega, main agle COD order se pehle Trustit UPI settlement me remit karunga.
            </p>
          </div>

          <div className="space-y-1">
            <strong className="text-slate-900 font-bold block">2. Mandatory Helmet &amp; Traffic Laws:</strong>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Driving license aur valid vehicle RC mandatory hai. Speed limits aur UP RTO Bahraich road safety guidelines ka strict palan karna hoga.
            </p>
          </div>

          <div className="space-y-1">
            <strong className="text-slate-900 font-bold block">3. Parcel Custody &amp; Zero Personal QR:</strong>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Grahak se payment lene ke liye rider apna personal PhonePe/Paytm QR kabhi show nahi karega. Trustit ka official Dynamic Cashfree QR code hi dikhana hoga.
            </p>
          </div>

          <div className="space-y-1">
            <strong className="text-slate-900 font-bold block">4. Anti-Spoof Location Integrity:</strong>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Kisi bhi tarah ka Fake GPS / Mock Location app chalana platform policy ka violation hai aur account permanently suspend kar diya jayega.
            </p>
          </div>
        </div>

        {/* Checkbox Undertakings */}
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedCheckboxes.helmet}
              onChange={(e) => setAgreedCheckboxes({ ...agreedCheckboxes, helmet: e.target.checked })}
              className="w-4 h-4 rounded text-[#0D47A1] accent-[#0D47A1]"
            />
            <span className="font-semibold text-[11px]">I will wear a helmet and follow Bahraich traffic rules</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedCheckboxes.cashLimit}
              onChange={(e) => setAgreedCheckboxes({ ...agreedCheckboxes, cashLimit: e.target.checked })}
              className="w-4 h-4 rounded text-[#0D47A1] accent-[#0D47A1]"
            />
            <span className="font-semibold text-[11px]">I accept the ₹1,500 Cash Remittance ceiling</span>
          </label>

          <label className="flex items-center gap-2.5 text-xs text-slate-800 cursor-pointer">
            <input
              type="checkbox"
              checked={agreedCheckboxes.gpsTruth}
              onChange={(e) => setAgreedCheckboxes({ ...agreedCheckboxes, gpsTruth: e.target.checked })}
              className="w-4 h-4 rounded text-[#0D47A1] accent-[#0D47A1]"
            />
            <span className="font-semibold text-[11px]">I confirm honest live GPS tracking without mock tools</span>
          </label>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-slate-200">
        <button
          type="button"
          onClick={onAgree}
          disabled={!allChecked}
          className={`w-full py-3 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-sm transition ${
            allChecked
              ? "bg-[#0D47A1] hover:bg-[#082b66] text-white active:scale-[0.98]"
              : "bg-slate-200 text-slate-400 cursor-not-allowed"
          }`}
        >
          <span>I Agree &amp; Proceed to KYC</span>
          <span>➔</span>
        </button>
      </div>
    </div>
  );
}
