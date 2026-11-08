"use client";

import React, { useState, useEffect, useCallback } from "react";

interface Screen19Props {
  riderId?: string;
  onBack?: () => void;
  onProceedToAcademy?: () => void;
  onEditProfile?: () => void;
  onEditVehicle?: () => void;
  onEditSelfie?: () => void;
  onCallFleetOps?: () => void;
}

export default function Screen19VerificationPending({
  riderId,
  onBack,
  onProceedToAcademy,
  onEditProfile,
  onEditVehicle,
  onEditSelfie,
  onCallFleetOps,
}: Screen19Props) {
  const [kycStatus, setKycStatus] = useState<"pending" | "action_required" | "approved" | "rejected">("pending");
  const [adminNotes, setAdminNotes] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [riderData, setRiderData] = useState<any>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);

  // Poll status from /api/hyperlocal/rider every 3 seconds
  const checkStatus = useCallback(async () => {
    if (!riderId || riderId === "rider_new_partner") return;
    try {
      const res = await fetch(`/api/hyperlocal/rider?riderId=${riderId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.rider) {
          setRiderData(data.rider);
          const rawStatus = data.rider.kyc_status;
          const displayStatus = data.rider.display_status;
          setAdminNotes(data.rider.admin_notes || null);
          setRejectionReason(data.rider.rejection_reason || null);

          if (rawStatus === "approved") {
            setKycStatus("approved");
          } else if (rawStatus === "rejected") {
            setKycStatus("rejected");
          } else if (displayStatus === "action_required" || Boolean(data.rider.rejection_reason)) {
            setKycStatus("action_required");
          } else {
            setKycStatus("pending");
          }
        }
      }
    } catch {
      // Silent on background poll
    }
  }, [riderId]);

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // Determine which edit screen to route to based on correction notes
  const handleStartCorrection = () => {
    const text = `${rejectionReason || ""} ${adminNotes || ""}`.toLowerCase();
    if (text.includes("selfie") || text.includes("photo") || text.includes("face") || text.includes("glasses")) {
      onEditSelfie?.();
    } else if (text.includes("vehicle") || text.includes("dl") || text.includes("license") || text.includes("rc")) {
      onEditVehicle?.();
    } else {
      onEditProfile?.();
    }
  };

  return (
    <div className="w-full h-full min-h-[560px] bg-[#FAF8FF] flex flex-col justify-between p-4 sm:p-5 text-[#0F172A] font-sans select-none overflow-y-auto">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 text-xs font-bold"
          >
            ←
          </button>
          <div className="text-center">
            <span className="text-[9px] font-black uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
              Verification Gateway
            </span>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              {kycStatus === "approved"
                ? "Application Approved ✅"
                : kycStatus === "action_required"
                ? "Correction Required ⚠️"
                : kycStatus === "rejected"
                ? "Application Rejected 🚫"
                : "Verification In-Progress ⏳"}
            </h2>
          </div>
          <button
            type="button"
            onClick={checkStatus}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 text-xs"
            title="Refresh Status"
          >
            🔄
          </button>
        </div>

        {/* ═════════════════════════════════════════════════════════════════════════
            STATE 1: PENDING VERIFICATION (Review in progress)
           ═════════════════════════════════════════════════════════════════════════ */}
        {kycStatus === "pending" && (
          <div className="mt-4 space-y-4">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-5 text-center shadow-xs">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner mb-3 animate-pulse">
                ⏳
              </div>
              <h3 className="text-base font-black text-amber-950">Admin Review In-Progress</h3>
              <p className="text-xs text-amber-800 mt-1 max-w-xs mx-auto leading-relaxed">
                The Fleet Operations team is reviewing your profile, vehicle, and driving license details.
              </p>
              <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[11px] font-bold text-slate-800 border border-amber-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>Expected Review Time: <strong>15 - 30 minutes</strong></span>
              </div>
            </div>

            {/* Application Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5 text-xs">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Submitted Application Details
              </h4>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Rider Name:</span>
                  <span className="font-bold text-slate-900">{riderData?.full_name || "Under Review"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle &amp; DL:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(riderData?.vehicle_type || "BIKE").toUpperCase()} · {riderData?.vehicle_number || "UP 40"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">City / Zone:</span>
                  <span className="font-semibold text-slate-800">
                    {riderData?.city || riderData?.district || "Bahraich, Uttar Pradesh"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            STATE 2: ACTION REQUIRED (Correction requested by Admin)
           ═════════════════════════════════════════════════════════════════════════ */}
        {kycStatus === "action_required" && (
          <div className="mt-4 space-y-4">
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 border-2 border-orange-400 rounded-3xl p-5 text-center shadow-md">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-100 border-2 border-orange-300 flex items-center justify-center text-3xl shadow-inner mb-3">
                ⚠️
              </div>
              <h3 className="text-base font-black text-orange-950">Correction Required</h3>
              <p className="text-xs text-orange-800 mt-1 max-w-xs mx-auto leading-relaxed">
                The verification team has requested updates to your submitted details:
              </p>

              {/* Admin Note Highlight Box */}
              <div className="mt-3 bg-white/90 border border-orange-300 rounded-2xl p-3.5 text-left shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block mb-1">
                  💬 Admin Instructions:
                </span>
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  &quot;{rejectionReason || adminNotes || "Please update your submitted details as requested."}&quot;
                </p>
              </div>
            </div>

            {/* Action Card: Edit & Resubmit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2 text-center">
              <p className="text-xs font-semibold text-slate-600">
                Your previously entered details are saved. Update the necessary fields and resubmit.
              </p>
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={handleStartCorrection}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>✏️</span>
                  <span>Edit &amp; Resubmit Application</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            STATE 3: APPROVED (Admin verified and unlocked)
           ═════════════════════════════════════════════════════════════════════════ */}
        {kycStatus === "approved" && (
          <div className="mt-4 space-y-4">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-3xl p-5 text-center shadow-md">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-3xl shadow-inner mb-3">
                🎉
              </div>
              <h3 className="text-base font-black text-emerald-950">Congratulations! Application Approved!</h3>
              <p className="text-xs text-emerald-800 mt-1 max-w-xs mx-auto leading-relaxed">
                Your profile, vehicle, and driving license have been verified by the fleet operations team.
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-xs">
                <span>✓</span>
                <span>Verified Trustit Fleet Partner</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-xs text-slate-600 space-y-1 text-center">
              <p className="font-bold text-slate-900">Next Step: 2-Minute Safety Academy Quiz</p>
              <p className="text-[11px]">Pass the brief training quiz to start accepting live delivery shifts.</p>
            </div>
          </div>
        )}

        {/* ═════════════════════════════════════════════════════════════════════════
            STATE 4: REJECTED (Disqualified)
           ═════════════════════════════════════════════════════════════════════════ */}
        {kycStatus === "rejected" && (
          <div className="mt-4 space-y-4">
            <div className="bg-rose-50 border-2 border-rose-400 rounded-3xl p-5 text-center shadow-md">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-3xl shadow-inner mb-3">
                🚫
              </div>
              <h3 className="text-base font-black text-rose-950">Application Rejected</h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                Reason: {rejectionReason || "Document verification was not approved"}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center space-y-2">
              <p className="text-xs text-slate-600">
                If you believe this is an error, please reach out to the Trustit fleet support team.
              </p>
              <div className="flex justify-center">
                <a
                  href="tel:+919415099999"
                  className="py-2.5 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow flex items-center justify-center gap-2"
                >
                  <span>📞</span>
                  <span>Trustit Fleet Support: +91 94150 99999</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER CTA: COMPACT ADMIN APPROVAL GATE BUTTON ── */}
      <div className="pt-3 border-t border-slate-200 mt-4 flex justify-center">
        {kycStatus === "approved" ? (
          <button
            type="button"
            onClick={onProceedToAcademy}
            className="py-2.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Start Training Academy</span>
            <span>➔</span>
          </button>
        ) : kycStatus === "action_required" ? (
          <button
            type="button"
            onClick={handleStartCorrection}
            className="py-2.5 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>Edit Details</span>
            <span>➔</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="py-2.5 px-5 rounded-xl bg-slate-200 text-slate-500 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
          >
            <span>⏳ Approval Pending (Review in progress)</span>
          </button>
        )}
      </div>
    </div>
  );
}
