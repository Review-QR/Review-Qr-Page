"use client";

import React, { useState } from "react";

interface Screen42Props {
  onBack?: () => void;
  onSelectOutlet?: (name: string) => void;
  initialBranches?: Array<{
    id: string;
    name: string;
    locality: string;
    phone?: string;
    idCode: string;
    active: boolean;
    pendingOrders: number;
    revenueToday: string;
  }>;
}

export default function Screen42MultiOutletSwitcher({
  onBack,
  onSelectOutlet,
  initialBranches,
}: Screen42Props) {
  const [activeOutlet, setActiveOutlet] = useState("branch_1");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newBranchName, setNewBranchName] = useState("");
  const [newBranchLocality, setNewBranchLocality] = useState("");
  const [newBranchPhone, setNewBranchPhone] = useState("");
  const [branches, setBranches] = useState(
    initialBranches && initialBranches.length > 0
      ? initialBranches
      : [
          {
            id: "branch_1",
            name: "Asirwad genral (Main Hub)",
            locality: "Civil Lines, Bahraich",
            idCode: "QR-77837892",
            active: true,
            pendingOrders: 3,
            revenueToday: "₹2,840",
          },
          {
            id: "branch_2",
            name: "Asirwad genral (Station Road Branch)",
            locality: "Railway Station Road, Bahraich",
            idCode: "QR-90412850",
            active: false,
            pendingOrders: 0,
            revenueToday: "₹1,420",
          },
        ]
  );

  const handleSwitchOutlet = async (bId: string, bName: string) => {
    setActiveOutlet(bId);
    onSelectOutlet?.(bName);
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "switch_branch", data: { branchId: bId } }),
      });
    } catch {}
  };

  const handleAddBranch = async () => {
    if (!newBranchName.trim() || !newBranchLocality.trim()) return;
    setIsAdding(true);
    const newId = `branch_${Date.now()}`;
    const newBranch = {
      id: newId,
      name: newBranchName.trim(),
      locality: newBranchLocality.trim(),
      phone: newBranchPhone.trim(),
      idCode: `QR-${Math.floor(10000000 + Math.random() * 90000000)}`,
      active: true,
      pendingOrders: 0,
      revenueToday: "₹0",
    };

    setBranches((prev) => [...prev, newBranch]);
    setActiveOutlet(newId);
    onSelectOutlet?.(newBranch.name);

    try {
      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add_branch",
          data: {
            name: newBranchName.trim(),
            locality: newBranchLocality.trim(),
            phone: newBranchPhone.trim(),
          },
        }),
      });
      const d = await res.json();
      if (d.success && d.branches) {
        setBranches(d.branches);
      }
    } catch {}

    setIsAdding(false);
    setIsAddModalOpen(false);
    setNewBranchName("");
    setNewBranchLocality("");
    setNewBranchPhone("");
  };

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
              onClick={() => handleSwitchOutlet(b.id, b.name)}
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
          onClick={() => setIsAddModalOpen(true)}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <span>+ Add New Store Outlet / Branch</span>
        </button>
      </div>

      {/* Add New Branch Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>🏬</span>
                <span>Register New Branch Outlet</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Outlet / Branch Name
                </label>
                <input
                  type="text"
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                  placeholder="e.g. Shri Balaji Daily Needs (Nanpara Road)"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Locality / Street Area
                </label>
                <input
                  type="text"
                  value={newBranchLocality}
                  onChange={(e) => setNewBranchLocality(e.target.value)}
                  placeholder="e.g. Nanpara Bypass near Chauraha, Bahraich"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Branch Cashier Contact Number
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newBranchPhone}
                  onChange={(e) => setNewBranchPhone(e.target.value)}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleAddBranch}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Create Branch
              </button>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
