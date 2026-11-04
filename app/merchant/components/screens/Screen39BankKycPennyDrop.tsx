"use client";

import React, { useState } from "react";

interface Screen39Props {
  onBack?: () => void;
  onVerifySuccess?: () => void;
}

export default function Screen39BankKycPennyDrop({
  onBack,
  onVerifySuccess,
}: Screen39Props) {
  const [accountNo, setAccountNo] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [beneficiary, setBeneficiary] = useState("");
  const [checking, setChecking] = useState(false);
  const [verified, setVerified] = useState(false);

  const handlePennyDrop = async () => {
    setChecking(true);
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify_bank_kyc",
          data: {
            accountNumber: accountNo,
            ifsc,
            holderName: beneficiary,
          },
        }),
      });
      setVerified(true);
      onVerifySuccess?.();
    } catch {}
    setChecking(false);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              BANK VERIFICATION
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Bank Account KYC &amp; Penny Drop
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

        {/* Verification Status Banner */}
        <div className={`mt-2.5 rounded-2xl p-3 flex items-center justify-between shadow-xs border ${
          verified ? "bg-emerald-50 border-emerald-300" : "bg-amber-50 border-amber-300"
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center font-bold text-sm shadow-xs ${
              verified ? "bg-emerald-600" : "bg-amber-500"
            }`}>
              {verified ? "✓" : "⏳"}
            </div>
            <div>
              <h3 className={`text-xs font-black ${verified ? "text-emerald-950" : "text-amber-950"}`}>
                {verified ? "Penny Drop Verified" : "Verification Pending"}
              </h3>
              <p className={`text-[10px] ${verified ? "text-emerald-800" : "text-amber-800"}`}>
                {verified ? "₹1.00 test deposit confirmed via NPCI IMPS" : "Enter bank details and verify with ₹1 IMPS test"}
              </p>
            </div>
          </div>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border bg-white ${
            verified ? "text-emerald-800 border-emerald-200" : "text-amber-800 border-amber-200"
          }`}>
            {verified ? "Active Payout Route" : "Awaiting Details"}
          </span>
        </div>

        {/* Form Inputs */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Registered Beneficiary Name
            </label>
            <input
              type="text"
              value={beneficiary}
              placeholder="e.g. Ankit Shukla"
              onChange={(e) => setBeneficiary(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Bank Account Number
            </label>
            <input
              type="text"
              value={accountNo}
              placeholder="e.g. 9956726957"
              onChange={(e) => setAccountNo(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              IFSC Code
            </label>
            <input
              type="text"
              value={ifsc}
              placeholder="e.g. IDIB0004866"
              onChange={(e) => setIfsc(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 bg-slate-50 focus:outline-hidden uppercase"
            />
          </div>

          <div className="pt-1 text-[10px] text-slate-500">
            Bank Branch: <strong>HDFC Bank Ltd, Civil Lines Bahraich Branch, UP</strong>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {checking ? (
          <div className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs text-center shadow-xs animate-pulse">
            Executing ₹1.00 NPCI IMPS Penny Drop...
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePennyDrop}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
          >
            Re-Verify Bank Account (Penny Drop ₹1)
          </button>
        )}
      </div>
    </div>
  );
}
