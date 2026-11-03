"use client";

import React, { useState } from "react";

interface Screen43Props {
  onBack?: () => void;
  onInviteStaff?: () => void;
}

export default function Screen43StaffRolesMatrix({
  onBack,
  onInviteStaff,
}: Screen43Props) {
  const staff = [
    { name: "Supriya Verma", role: "Owner (Admin)", phone: "+91 9118643415", access: "Full Master Access", badge: "bg-purple-100 text-purple-900" },
    { name: "Ramesh Kumar", role: "Counter Cashier", phone: "+91 94501 23456", access: "Live Orders & Menu Only", badge: "bg-blue-100 text-blue-900" },
    { name: "Chef Dinesh", role: "Kitchen Master", phone: "+91 87654 32109", access: "KOT Screen Only", badge: "bg-amber-100 text-amber-900" },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              ACCESS CONTROL
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Staff Roles &amp; Team Permissions
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

        {/* Security Info */}
        <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 text-xs text-slate-700 flex items-start gap-2">
          <span className="text-base">🛡️</span>
          <p className="text-[10px] text-slate-600 leading-relaxed">
            Protect financial data: Cashiers and Kitchen Chefs cannot view bank payouts, settlement ledgers, or subscription billing.
          </p>
        </div>

        {/* Staff Members List */}
        <div className="mt-3 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Authorized Store Staff (3 Members)
          </span>

          {staff.map((s, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{s.name}</h4>
                  <span className="text-[10px] font-mono text-slate-500">{s.phone}</span>
                </div>
                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${s.badge}`}>
                  {s.role}
                </span>
              </div>

              <div className="pt-1 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="text-slate-600">Permissions: <strong>{s.access}</strong></span>
                {i > 0 && (
                  <button type="button" className="text-rose-600 hover:text-rose-800 font-bold">
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Invite */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onInviteStaff}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5"
        >
          <span>+ Invite New Staff Member via Phone OTP</span>
        </button>
      </div>
    </div>
  );
}
