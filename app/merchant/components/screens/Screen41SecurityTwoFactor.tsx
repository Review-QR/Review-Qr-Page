"use client";

import React, { useState } from "react";

interface Screen41Props {
  onBack?: () => void;
  onSave?: () => void;
  initialTwoFactor?: boolean;
  initialLoginAlerts?: boolean;
}

export default function Screen41SecurityTwoFactor({
  onBack,
  onSave,
  initialTwoFactor = true,
  initialLoginAlerts = true,
}: Screen41Props) {
  const [twoFactor, setTwoFactor] = useState(initialTwoFactor);
  const [loginAlerts, setLoginAlerts] = useState(initialLoginAlerts);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const handleToggle2FA = async () => {
    const next = !twoFactor;
    setTwoFactor(next);
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_security_settings",
          data: { twoFactorEnabled: next, loginAlerts },
        }),
      });
    } catch {}
  };

  const handleToggleLoginAlerts = async () => {
    const next = !loginAlerts;
    setLoginAlerts(next);
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_security_settings",
          data: { twoFactorEnabled: twoFactor, loginAlerts: next },
        }),
      });
    } catch {}
  };

  const handleSaveSecuritySettings = async () => {
    setIsSavingSettings(true);
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_security_settings",
          data: { twoFactorEnabled: twoFactor, loginAlerts },
        }),
      });
      onSave?.();
    } catch {}
    setTimeout(() => setIsSavingSettings(false), 800);
  };

  const handleUpdatePassword = async () => {
    if (!currentPin.trim() || currentPin.length < 4) {
      setStatusMsg("Please enter your current 4-digit PIN.");
      return;
    }
    if (!newPin.trim() || newPin.length < 4) {
      setStatusMsg("New PIN must be at least 4 digits.");
      return;
    }
    if (newPin !== confirmPin) {
      setStatusMsg("New PIN and Confirm PIN do not match!");
      return;
    }

    setStatusMsg("⏳ Updating Master Cashier PIN in cloud database...");
    try {
      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_security_pin",
          data: { currentPin, newPin },
        }),
      });
      const d = await res.json();
      if (d.success) {
        setStatusMsg("✓ " + d.message);
        setTimeout(() => {
          setIsPasswordModalOpen(false);
          setCurrentPin("");
          setNewPin("");
          setConfirmPin("");
          setStatusMsg(null);
        }, 1500);
      } else {
        setStatusMsg("❌ " + (d.message || "Failed to update PIN"));
      }
    } catch (e: any) {
      setStatusMsg("❌ Network error: " + e.message);
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              ACCOUNT PROTECTION
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Security &amp; 2-Factor Authentication
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

        {/* Security Health Card */}
        <div className="mt-2.5 bg-emerald-50 border border-emerald-300 rounded-2xl p-3 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="text-xl">🛡️</span>
            <div>
              <h3 className="text-xs font-black text-emerald-950">Security Shield High</h3>
              <p className="text-[10px] text-emerald-800">
                Registered Mobile: +91 9118643415 (Verified)
              </p>
            </div>
          </div>
          <span className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-0.5 rounded-full">
            Protected
          </span>
        </div>

        {/* Security Controls */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
          {/* 2FA Toggle */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900 block">2-Factor Authentication (OTP)</span>
              <span className="text-[10px] text-slate-500">Requires WhatsApp/SMS OTP on new logins</span>
            </div>
            <button
              type="button"
              onClick={handleToggle2FA}
              className={`w-10 h-6 rounded-full transition relative p-0.5 cursor-pointer ${
                twoFactor ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition shadow-xs ${
                  twoFactor ? "translate-x-4" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Login Alerts Toggle */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-slate-900 block">Instant Login SMS Alerts</span>
              <span className="text-[10px] text-slate-500">Notifies owner phone if staff signs in</span>
            </div>
            <button
              type="button"
              onClick={handleToggleLoginAlerts}
              className={`w-10 h-6 rounded-full transition relative p-0.5 cursor-pointer ${
                loginAlerts ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition shadow-xs ${
                  loginAlerts ? "translate-x-4" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>

          {/* Password Reset */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              🔑 Change Master Password →
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSaveSecuritySettings}
          disabled={isSavingSettings}
          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition cursor-pointer flex items-center justify-center gap-1.5"
        >
          <span>{isSavingSettings ? "💾 Saving to Database..." : "Save Security Settings"}</span>
        </button>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h3 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>🔑</span>
                <span>Change Cashier PIN / Password</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {statusMsg && (
              <div className={`p-2 rounded-xl text-xs font-bold ${
                statusMsg.startsWith("✓") ? "bg-emerald-50 text-emerald-700 border border-emerald-300" : "bg-rose-50 text-rose-700 border border-rose-300"
              }`}>
                {statusMsg}
              </div>
            )}

            <div className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Current 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={currentPin}
                  onChange={(e) => setCurrentPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  New 4-Digit PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
                  Confirm New PIN
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-slate-50 focus:outline-hidden focus:border-blue-600"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={handleUpdatePassword}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                Update PIN
              </button>
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
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
