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
    if (text.includes("selfie") || text.includes("फोटो") || text.includes("चेहरा") || text.includes("चश्मा")) {
      onEditSelfie?.();
    } else if (text.includes("गाड़ी") || text.includes("वाहन") || text.includes("vehicle") || text.includes("dl") || text.includes("लाइसेंस")) {
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
              सत्यापन गेटवे (Verification Gate)
            </span>
            <h2 className="text-sm font-black text-slate-900 leading-tight">
              {kycStatus === "approved"
                ? "आवेदन स्वीकृत ✅"
                : kycStatus === "action_required"
                ? "सुधार आवश्यक ⚠️"
                : kycStatus === "rejected"
                ? "आवेदन अस्वीकृत 🚫"
                : "दस्तावेज़ समीक्षा जारी ⏳"}
            </h2>
          </div>
          <button
            type="button"
            onClick={checkStatus}
            className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs hover:bg-slate-50 text-xs"
            title="स्थिति रीफ्रेश करें"
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
              <h3 className="text-base font-black text-amber-950">एडमिन समीक्षा प्रगति पर है</h3>
              <p className="text-xs text-amber-800 mt-1 max-w-xs mx-auto leading-relaxed">
                बहराइच फ्लीट ऑपरेशन्स टीम आपके वाहन, ड्राइविंग लाइसेंस और प्रोफाइल की समीक्षा कर रही है।
              </p>
              <div className="mt-3.5 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-[11px] font-bold text-slate-800 border border-amber-200 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>समीक्षा समय: <strong>15 से 30 मिनट</strong></span>
              </div>
            </div>

            {/* Application Summary Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5 text-xs">
              <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                आपके द्वारा सबमिट किया गया विवरण
              </h4>
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">राइडर का नाम:</span>
                  <span className="font-bold text-slate-900">{riderData?.full_name || "समीक्षाधीन"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">वाहन एवं DL:</span>
                  <span className="font-mono font-bold text-slate-900">
                    {(riderData?.vehicle_type || "BIKE").toUpperCase()} · {riderData?.vehicle_number || "UP 40"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">स्थान / ज़ोन:</span>
                  <span className="font-semibold text-slate-800">बहराइच, उत्तर प्रदेश - 271801</span>
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
              <h3 className="text-base font-black text-orange-950">आवेदन में सुधार आवश्यक है</h3>
              <p className="text-xs text-orange-800 mt-1 max-w-xs mx-auto leading-relaxed">
                एडमिन सत्यापन टीम ने आपके आवेदन में निम्नलिखित विवरण सुधारने का निर्देश दिया है:
              </p>

              {/* Admin Note Highlight Box */}
              <div className="mt-3 bg-white/90 border border-orange-300 rounded-2xl p-3.5 text-left shadow-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-600 block mb-1">
                  💬 एडमिन का संदेश / निर्देश:
                </span>
                <p className="text-xs font-bold text-slate-900 leading-snug">
                  &quot;{rejectionReason || adminNotes || "कृपया अपना विवरण सुधारें"}&quot;
                </p>
              </div>
            </div>

            {/* Action Button: Edit & Resubmit */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2 text-center">
              <p className="text-xs font-semibold text-slate-600">
                आपका पूर्व विवरण सुरक्षित है। केवल आवश्यक सुधार करके तुरंत दोबारा सबमिट करें।
              </p>
              <button
                type="button"
                onClick={handleStartCorrection}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 active:scale-95"
              >
                <span>✏️</span>
                <span>विवरण सुधारें और पुनः सबमिट करें (Edit &amp; Resubmit)</span>
              </button>
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
              <h3 className="text-base font-black text-emerald-950">बधाई हो! आपका आवेदन स्वीकृत हो गया!</h3>
              <p className="text-xs text-emerald-800 mt-1 max-w-xs mx-auto leading-relaxed">
                एडमिन टीम द्वारा आपका प्रोफाइल, वाहन और ड्राइविंग लाइसेंस सत्यापित कर दिया गया है।
              </p>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-black shadow-xs">
                <span>✓</span>
                <span>वेरिफाइड ट्रस्टिट फ्लीट पार्टनर</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs text-xs text-slate-600 space-y-1 text-center">
              <p className="font-bold text-slate-900">अगला चरण: 2 मिनट की सुरक्षा ट्रेनिंग अकादमी</p>
              <p className="text-[11px]">ट्रेनिंग क्विज़ पास करते ही आपकी दैनिक डिलीवरी शिफ्ट शुरू हो जाएगी।</p>
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
              <h3 className="text-base font-black text-rose-950">आवेदन अस्वीकृत हुआ</h3>
              <p className="text-xs text-rose-800 mt-1 leading-relaxed">
                कारण: {rejectionReason || "दस्तावेज़ सत्यापन विफल रहा"}
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs text-center space-y-2">
              <p className="text-xs text-slate-600">
                यदि आपको लगता है कि यह कोई त्रुटि है, तो Trustit फ्लीट सपोर्ट टीम से संपर्क करें।
              </p>
              <a
                href="tel:+919415099999"
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs shadow flex items-center justify-center gap-2"
              >
                <span>📞</span>
                <span>Trustit फ्लीट सपोर्ट: +91 94150 99999</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* ── FOOTER CTA: STRICT ADMIN APPROVAL GATE ── */}
      <div className="pt-4 border-t border-slate-200 mt-4 space-y-2">
        {kycStatus === "approved" ? (
          <button
            type="button"
            onClick={onProceedToAcademy}
            className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>ट्रेनिंग अकादमी शुरू करें (Start Training Academy)</span>
            <span>➔</span>
          </button>
        ) : kycStatus === "action_required" ? (
          <button
            type="button"
            onClick={handleStartCorrection}
            className="w-full py-3.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-md transition flex items-center justify-center gap-2 active:scale-95"
          >
            <span>विवरण सुधारें (Edit Details)</span>
            <span>➔</span>
          </button>
        ) : (
          <button
            type="button"
            disabled
            className="w-full py-3.5 rounded-2xl bg-slate-200 text-slate-400 font-black text-xs flex items-center justify-center gap-2 cursor-not-allowed shadow-none"
          >
            <span>⏳ एडमिन अप्रूवल पेंडिंग (सत्यापन के बाद बटन सक्रिय होगा)</span>
          </button>
        )}
      </div>
    </div>
  );
}
