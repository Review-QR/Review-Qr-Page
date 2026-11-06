"use client";

import React, { useState } from "react";

interface Screen19Props {
  onBack?: () => void;
  onRefresh?: () => void;
  onChatFleet?: () => void;
  onProceedToAcademy?: () => void;
  riderName?: string;
  vehicleNumber?: string;
}

export default function Screen19VerificationPending({
  onBack,
  onRefresh,
  onChatFleet,
  onProceedToAcademy,
  riderName,
  vehicleNumber,
}: Screen19Props) {
  const [activeTab, setActiveTab] = useState<"docs" | "timeline">("docs");

  const steps = [
    { title: "Mobile & Basic Profile", status: "completed", detail: `${riderName || "Verified Partner"} · UP 40 Fleet Zone` },
    { title: "Vehicle RC & DL Details", status: "completed", detail: `${vehicleNumber || "Vehicle RC"} · Verification in Progress` },
    { title: "Penny-Drop Bank Settlement", status: "completed", detail: "Cashfree UPI Payout handle linked" },
    { title: "Background Verification & Admin Approval", status: "in_progress", detail: "Admin Ops Review (ETA: 1-2 hours)" },
    { title: "Delivery Kit & Final Activation", status: "locked", detail: "Thermal bag & T-shirt allocation" },
  ];

  return (
    <div className="w-full h-full bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Stage 1 Onboarding
            </span>
            <h2 className="text-sm font-extrabold text-slate-900 leading-tight">Verification In-Progress</h2>
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-xs hover:bg-slate-50 text-xs"
            title="Refresh Status"
          >
            🔄
          </button>
        </div>

        {/* Hero Card */}
        <div className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-inner mb-2 animate-bounce">
            ⏳
          </div>
          <h3 className="text-base font-black text-amber-900">Documents Under Review</h3>
          <p className="text-xs text-amber-700 mt-1 max-w-xs mx-auto">
            Your rider application is being audited by the Bahraich Fleet Operations Team. Typical review time: <strong>2 to 4 hours</strong>.
          </p>
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[11px] font-bold text-slate-700 border border-amber-200 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            Application ID: <span className="font-mono text-[#0D47A1]">#TR-BHR-4091</span>
          </div>
        </div>

        {/* Tab Toggle */}
        <div className="mt-4 flex border border-slate-200 rounded-xl p-1 bg-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab("docs")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "docs" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            📋 Verification Stepper
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("timeline")}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === "timeline" ? "bg-white text-slate-900 shadow-xs" : "text-slate-500"
            }`}
          >
            🏢 Fleet Support Desk
          </button>
        </div>

        {/* Content based on Tab */}
        {activeTab === "docs" ? (
          <div className="mt-3 space-y-2">
            {steps.map((st, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-xl p-3 flex items-start gap-3 shadow-2xs"
              >
                <div className="mt-0.5">
                  {st.status === "completed" && (
                    <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">
                      ✓
                    </div>
                  )}
                  {st.status === "in_progress" && (
                    <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black animate-spin">
                      ◐
                    </div>
                  )}
                  {st.status === "locked" && (
                    <div className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-black">
                      🔒
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{st.title}</h4>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        st.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : st.status === "in_progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {st.status === "completed" ? "Verified" : st.status === "in_progress" ? "In Review" : "Pending"}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">{st.detail}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-3 bg-white border border-slate-200 rounded-xl p-3.5 space-y-2.5">
            <h4 className="text-xs font-black text-slate-900">Bahraich Fleet Hub Assistance</h4>
            <p className="text-[11px] text-slate-600">
              Need immediate document approval or have blurred photograph issues? Reach out to the local onboarding coordinator:
            </p>
            <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">Ravi Shankar (Fleet Ops)</p>
                <p className="text-[10px] text-slate-500">Civil Lines Hub · 10 AM - 7 PM</p>
              </div>
              <button
                type="button"
                onClick={onChatFleet}
                className="px-3 py-1 rounded-lg bg-[#0D47A1] text-white text-xs font-bold shadow-xs hover:bg-blue-800"
              >
                📞 Call Hub
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer CTAs */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <button
          type="button"
          onClick={onProceedToAcademy}
          className="w-full py-3 rounded-xl bg-[#0D47A1] text-white font-extrabold text-sm shadow-md hover:bg-blue-800 transition flex items-center justify-center gap-2"
        >
          <span>Fast-Track: Start Training Academy</span>
          <span>→</span>
        </button>
        <p className="text-center text-[10px] text-slate-400">
          Complete the 2-minute academy while your KYC is in review to unlock duty faster.
        </p>
      </div>
    </div>
  );
}
