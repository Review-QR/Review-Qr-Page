"use client";

import React, { useState } from "react";

interface Screen42Props {
  onBack?: () => void;
  onSelectOutlet?: (name: string) => void;
}

export default function Screen42MultiOutletSwitcher({
  onBack,
  onSelectOutlet,
}: Screen42Props) {
  const [activeOutlet, setActiveOutlet] = useState("branch_1");

  const branches = [
    {
      id: "branch_1",
      name: "Golden Blossom Cafe (Main Hub)",
      locality: "Civil Lines / KDC Road, Bahraich",
      idCode: "QR-77837892",
      active: true,
      pendingOrders: 3,
      revenueToday: "₹2,840",
    },
    {
      id: "branch_2",
      name: "Golden Blossom Express (Branch 2)",
      locality: "Medical College Road, Bahraich",
      idCode: "QR-90412850",
      active: false,
      pendingOrders: 0,
      revenueToday: "₹1,420",
    },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              BRANCH MANAGEMENT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Multi-Outlet Switcher Console
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

        {/* Info */}
        <div className="mt-2.5 bg-blue-50 border border-blue-200 rounded-2xl p-2.5 text-xs text-blue-950 flex items-start gap-2">
          <span className="text-base">🏢</span>
          <p className="text-[10px] text-blue-800 leading-relaxed">
            Manage multiple physical cafe locations under one unified login. Switch branches in 1 tap without logging out.
          </p>
        </div>

        {/* Outlets List */}
        <div className="mt-3 space-y-2.5">
          {branches.map((b) => (
            <div
              key={b.id}
              onClick={() => {
                setActiveOutlet(b.id);
                onSelectOutlet?.(b.name);
              }}
              className={`p-3 rounded-2xl border-2 transition cursor-pointer shadow-2xs space-y-2 ${
                activeOutlet === b.id
                  ? "bg-white border-blue-600 ring-2 ring-blue-500/20"
                  : "bg-white border-slate-200 hover:border-slate-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-xs font-black text-slate-900">{b.name}</h4>
                    {activeOutlet === b.id && (
                      <span className="text-[8px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                        ACTIVE NOW
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 mt-0.5">{b.locality}</p>
                  <span className="text-[9px] font-mono text-slate-400">{b.idCode}</span>
                </div>

                <div className="text-right">
                  <span className="font-mono text-xs font-black text-emerald-700">{b.revenueToday}</span>
                  <span className="text-[9px] text-slate-400 block">Today's Sales</span>
                </div>
              </div>

              <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {b.pendingOrders} Orders Pending
                </span>
                <span className="font-bold text-blue-700">
                  {activeOutlet === b.id ? "✓ Currently Managing" : "Switch Branch →"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition flex items-center justify-center gap-1.5"
        >
          <span>+ Add New Store Outlet / Branch</span>
        </button>
      </div>
    </div>
  );
}
