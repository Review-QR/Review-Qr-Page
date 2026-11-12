"use client";

import React, { useState } from "react";

interface SettlementRow {
  date: string;
  orders: number;
  gross: number;
  net: number;
  utr: string;
  status: string;
}

interface Screen37Props {
  onBack?: () => void;
  onInspectSettlement?: () => void;
  onOpenBankKyc?: () => void;
  bankAccountMask?: string;
  todayGrossEarnings?: number;
  deliveredOrdersCount?: number;
  settlements?: SettlementRow[];
}

export default function Screen37DailySettlementLedger({
  onBack,
  onInspectSettlement,
  onOpenBankKyc,
  bankAccountMask = "",
  todayGrossEarnings = 0,
  deliveredOrdersCount = 0,
  settlements = [],
}: Screen37Props) {
  const [range, setRange] = useState<"today" | "week" | "month">("today");

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              FINANCIAL SETTLEMENTS
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Bank Payouts &amp; Escrow Ledger
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

        {/* Today's Net Payout Hero Card */}
        <div className="mt-2.5 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-4 text-white shadow-md space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
              Today's Net Payout Due
            </span>
            <span className="text-[10px] font-bold bg-white text-emerald-900 px-2 py-0.5 rounded-md">
              10:00 AM Daily Credit
            </span>
          </div>

          <div className="pt-1">
            <p className="text-2xl font-black font-mono">₹{todayGrossEarnings.toFixed(2)}</p>
            <span className="text-[10px] text-emerald-100">
              From {deliveredOrdersCount} live completed order(s)
            </span>
          </div>

          <div className="pt-2 border-t border-white/20 flex items-center justify-between text-[10px]">
            <span>{bankAccountMask ? `Bank: ${bankAccountMask}` : "Bank Account Not Linked Yet"}</span>
            <button
              type="button"
              onClick={onOpenBankKyc}
              className="text-white underline font-bold"
            >
              {bankAccountMask ? "Manage Bank →" : "Add Bank Details →"}
            </button>
          </div>
        </div>

        {/* Date Filter */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase">Settlement History</span>
          <div className="flex gap-1 text-xs font-bold">
            {(["today", "week", "month"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRange(r)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  range === r ? "bg-slate-900 text-white shadow-xs" : "bg-white text-slate-600 border border-slate-200"
                }`}
              >
                {r === "today" ? "Today" : r === "week" ? "This Week" : "Month"}
              </button>
            ))}
          </div>
        </div>

        {/* Settlement Ledger Table */}
        <div className="mt-2.5 space-y-2">
          {settlements.length === 0 ? (
            <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-5 text-center space-y-1.5">
              <p className="text-xs font-black text-slate-800">No Payout Settlements Generated Yet</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Cashfree Automated Payouts is not enabled yet. Once orders settle via Trustit Manual / Escrow cycle, live UTR records will appear here.
              </p>
            </div>
          ) : (
            settlements.map((s, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{s.date}</h4>
                  <span className="text-[10px] text-slate-500">{s.orders} Orders • Gross ₹{s.gross}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-sm font-black text-emerald-700">₹{s.net.toFixed(2)}</span>
                  <span className="text-[9px] text-slate-400 block font-mono">UTR: {s.utr}</span>
                </div>
              </div>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {s.status}
                </span>
                <button
                  type="button"
                  onClick={onInspectSettlement}
                  className="font-bold text-slate-700 hover:text-slate-900"
                >
                  Breakdown Sheet →
                </button>
              </div>
            </div>
            ))
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2 text-center text-[10px] text-slate-500 font-mono">
        Payouts &amp; Penny Drop Not Active Yet (Manual Settlement Mode)
      </div>
    </div>
  );
}
