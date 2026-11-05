"use client";

import React, { useState } from "react";

interface Screen43Props {
  ownerName?: string;
  phone?: string;
  initialStaffList?: Array<{
    name: string;
    role: string;
    phone: string;
    access: string;
    badge: string;
  }>;
  onBack?: () => void;
  onInviteStaff?: () => void;
}

export default function Screen43StaffRolesMatrix({
  ownerName = "Store Owner",
  phone = "+91 Primary Admin",
  initialStaffList,
  onBack,
  onInviteStaff,
}: Screen43Props) {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newRole, setNewRole] = useState("Counter Cashier");
  const [feedback, setFeedback] = useState<string | null>(null);

  const [staffList, setStaffList] = useState(
    initialStaffList && initialStaffList.length > 0
      ? initialStaffList
      : [
          { name: ownerName, role: "Owner (Admin)", phone, access: "Full Master Access", badge: "bg-purple-100 text-purple-900" },
          { name: "Ramesh Kumar", role: "Counter Cashier", phone: "+91 94501 23456", access: "Live Orders & Menu Only", badge: "bg-blue-100 text-blue-900" },
          { name: "Chef Dinesh", role: "Kitchen Master", phone: "+91 87654 32109", access: "KOT Screen Only", badge: "bg-amber-100 text-amber-900" },
        ]
  );

  const handleRevoke = async (targetName: string) => {
    setStaffList((prev) => prev.filter((s) => s.name !== targetName));
    setFeedback(`⏳ Revoking access for ${targetName} in database...`);
    try {
      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manage_staff",
          data: { actionType: "revoke", targetName },
        }),
      });
      const d = await res.json();
      if (d.success) {
        setFeedback(`✓ Access for ${targetName} revoked successfully from Cloud!`);
      }
    } catch {}
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleInvite = async () => {
    if (!newName.trim() || !newPhone.trim()) return;
    const access =
      newRole === "Counter Cashier"
        ? "Live Orders & Menu Only"
        : newRole === "Kitchen Master"
        ? "KOT Screen Only"
        : "Delivery Waybills Only";
    const badge =
      newRole === "Counter Cashier"
        ? "bg-blue-100 text-blue-900"
        : newRole === "Kitchen Master"
        ? "bg-amber-100 text-amber-900"
        : "bg-emerald-100 text-emerald-900";

    const newStaff = {
      name: newName.trim(),
      role: newRole,
      phone: `+91 ${newPhone.trim().replace(/^\+91\s*/, "")}`,
      access,
      badge,
    };
    setStaffList((prev) => [...prev, newStaff]);
    setIsInviteModalOpen(false);
    setNewName("");
    setNewPhone("");
    setFeedback(`⏳ Adding ${newStaff.name} to Cloud Database...`);

    try {
      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "manage_staff",
          data: { actionType: "invite", staffMember: newStaff },
        }),
      });
      const d = await res.json();
      if (d.success) {
        setFeedback(`✓ Invited ${newStaff.name} as ${newRole}! Login PIN sent.`);
      }
    } catch {}

    setTimeout(() => setFeedback(null), 3500);
    onInviteStaff?.();
  };

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

        {/* Feedback Alert */}
        {feedback && (
          <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs font-bold text-emerald-800 animate-in fade-in">
            {feedback}
          </div>
        )}

        {/* Staff Members List */}
        <div className="mt-3 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Authorized Store Staff ({staffList.length} Members)
          </span>

          {staffList.map((s, i) => (
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
                  <button
                    type="button"
                    onClick={() => handleRevoke(s.name)}
                    className="text-rose-600 hover:text-rose-800 font-bold px-2 py-0.5 rounded hover:bg-rose-50 cursor-pointer active:scale-95 transition"
                  >
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
          onClick={() => setIsInviteModalOpen(true)}
          className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
        >
          <span>+ Invite New Staff Member via Phone OTP</span>
        </button>
      </div>

      {/* Invite Staff Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>👥</span>
                <span>Invite Store Staff Member</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Staff Member Full Name
                </label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Mobile Number (For Cashier OTP)
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="e.g. 9118643415"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Role &amp; Permissions
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                >
                  <option value="Counter Cashier">Counter Cashier (Live Orders &amp; Menu)</option>
                  <option value="Kitchen Master">Kitchen Master (KOT Screen Only)</option>
                  <option value="Delivery Dispatcher">Delivery Dispatcher (Waybills Only)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleInvite}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Send Invite OTP
              </button>
              <button
                type="button"
                onClick={() => setIsInviteModalOpen(false)}
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
