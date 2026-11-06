"use client";

import { useState, useEffect, useCallback } from "react";

export interface RiderAdminItem {
  id: string;
  full_name: string;
  phone: string;
  email?: string | null;
  profile_image_url?: string | null;
  residential_address?: string | null;
  city?: string | null;
  pincode?: string | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  driving_license_number?: string | null;
  bank_account_holder_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc_code?: string | null;
  bank_name?: string | null;
  upi_id?: string | null;
  kyc_status?: string | null;
  display_status?: "pending" | "action_required" | "approved" | "rejected";
  is_verified?: boolean;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
}

interface RiderStats {
  total: number;
  pending: number;
  actionRequired: number;
  approved: number;
  rejected: number;
}

interface RiderApprovalsPanelProps {
  onToast: (msg: string) => void;
  onPendingCountChange?: (count: number) => void;
}

export default function RiderApprovalsPanel({ onToast, onPendingCountChange }: RiderApprovalsPanelProps) {
  const [riders, setRiders] = useState<RiderAdminItem[]>([]);
  const [stats, setStats] = useState<RiderStats>({
    total: 0,
    pending: 0,
    actionRequired: 0,
    approved: 0,
    rejected: 0,
  });
  const [activeSubTab, setActiveSubTab] = useState<"all" | "pending" | "action_required" | "approved" | "rejected">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [editRider, setEditRider] = useState<RiderAdminItem | null>(null);
  const [correctionRider, setCorrectionRider] = useState<RiderAdminItem | null>(null);
  const [rejectRider, setRejectRider] = useState<RiderAdminItem | null>(null);

  // Edit form state
  const [editForm, setEditForm] = useState({
    fullName: "",
    phone: "",
    residentialAddress: "",
    pincode: "271801",
    vehicleType: "bike",
    vehicleNumber: "",
    drivingLicenseNumber: "",
    upiId: "",
    autoApprove: false,
  });

  // Correction form state
  const [correctionReason, setCorrectionReason] = useState("सेल्फी फोटो धुंधली है / चेहरा स्पष्ट नहीं है");
  const [correctionNote, setCorrectionNote] = useState("");

  // Reject form state
  const [rejectReason, setRejectReason] = useState("दस्तावेज़ और वाहन विवरण का मिलान नहीं हो सका");

  const fetchRiders = useCallback(async () => {
    try {
      const res = await fetch("/api/hyperlocal/admin/riders");
      if (res.ok) {
        const data = await res.json();
        setRiders(data.riders || []);
        if (data.stats) {
          setStats(data.stats);
          if (onPendingCountChange) onPendingCountChange(data.stats.pending);
        }
      }
    } catch {
      // Silent on background polling error
    } finally {
      setIsLoading(false);
    }
  }, [onPendingCountChange]);

  useEffect(() => {
    fetchRiders();
    const interval = setInterval(fetchRiders, 4000);
    return () => clearInterval(interval);
  }, [fetchRiders]);

  // Open Edit Modal with prefilled values
  function handleOpenEdit(r: RiderAdminItem) {
    setEditRider(r);
    setEditForm({
      fullName: r.full_name || "",
      phone: (r.phone || "").replace(/^\+91/, ""),
      residentialAddress: r.residential_address || "",
      pincode: r.pincode || "271801",
      vehicleType: r.vehicle_type || "bike",
      vehicleNumber: r.vehicle_number || "",
      drivingLicenseNumber: r.driving_license_number || "",
      upiId: r.upi_id || "",
      autoApprove: false,
    });
    setErrorMessage(null);
  }

  // Open Correction Modal
  function handleOpenCorrection(r: RiderAdminItem) {
    setCorrectionRider(r);
    setCorrectionReason("सेल्फी फोटो धुंधली है / चेहरा स्पष्ट नहीं है");
    setCorrectionNote("");
    setErrorMessage(null);
  }

  // Open Reject Modal
  function handleOpenReject(r: RiderAdminItem) {
    setRejectRider(r);
    setRejectReason("दस्तावेज़ और वाहन विवरण का मिलान नहीं हो सका");
    setErrorMessage(null);
  }

  // Action: Approve Rider
  async function handleApprove(riderId: string) {
    setIsActionPending(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/hyperlocal/admin/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve_rider", riderId }),
      });
      const data = await res.json();
      if (data.success) {
        onToast("✅ राइडर स्वीकृत हो गया है! ऐप पर ट्रेनिंग तुरंत अनलॉक हो गई है।");
        fetchRiders();
      } else {
        setErrorMessage(data.error || "अप्रूवल विफल रहा");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "अप्रूवल विफल रहा");
    } finally {
      setIsActionPending(false);
    }
  }

  // Action: Save Edit Rider
  async function handleSaveEdit() {
    if (!editRider) return;
    setIsActionPending(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/hyperlocal/admin/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "edit_rider",
          riderId: editRider.id,
          ...editForm,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onToast(editForm.autoApprove ? "✅ विवरण अपडेट और राइडर स्वीकृत कर दिया गया!" : "✏️ विवरण सफलतापूर्वक अपडेट हुआ!");
        setEditRider(null);
        fetchRiders();
      } else {
        setErrorMessage(data.error || "अपडेट विफल रहा");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "अपडेट विफल रहा");
    } finally {
      setIsActionPending(false);
    }
  }

  // Action: Send Correction Request
  async function handleSendCorrection() {
    if (!correctionRider) return;
    setIsActionPending(true);
    setErrorMessage(null);
    try {
      const fullNote = correctionNote ? `${correctionReason}: ${correctionNote}` : correctionReason;
      const res = await fetch("/api/hyperlocal/admin/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "request_correction",
          riderId: correctionRider.id,
          reason: correctionReason,
          note: fullNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onToast("🔄 सुधार का अनुरोध राइडर ऐप पर भेज दिया गया है!");
        setCorrectionRider(null);
        fetchRiders();
      } else {
        setErrorMessage(data.error || "अनुरोध भेजने में विफल");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "अनुरोध विफल रहा");
    } finally {
      setIsActionPending(false);
    }
  }

  // Action: Reject Rider
  async function handleConfirmReject() {
    if (!rejectRider) return;
    setIsActionPending(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/hyperlocal/admin/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject_rider",
          riderId: rejectRider.id,
          reason: rejectReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onToast("❌ राइडर आवेदन अस्वीकृत कर दिया गया है।");
        setRejectRider(null);
        fetchRiders();
      } else {
        setErrorMessage(data.error || "रिजेक्शन विफल रहा");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "रिजेक्शन विफल रहा");
    } finally {
      setIsActionPending(false);
    }
  }

  // Filter riders
  const filteredRiders = riders.filter((r) => {
    // Sub-tab filter
    if (activeSubTab === "pending" && r.display_status !== "pending") return false;
    if (activeSubTab === "action_required" && r.display_status !== "action_required") return false;
    if (activeSubTab === "approved" && r.kyc_status !== "approved") return false;
    if (activeSubTab === "rejected" && r.kyc_status !== "rejected") return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (r.full_name || "").toLowerCase().includes(q);
      const matchPhone = (r.phone || "").includes(q);
      const matchVehicle = (r.vehicle_number || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchVehicle;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── ERROR BANNER ── */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-500 bg-rose-500/20 p-3 text-xs text-rose-300 font-bold flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* ── KPI TILES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          type="button"
          onClick={() => setActiveSubTab("pending")}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeSubTab === "pending"
              ? "bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Pending Review</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-amber-400">{stats.pending}</span>
            <span className="text-sm">⏳</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("action_required")}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeSubTab === "action_required"
              ? "bg-orange-500/20 border-orange-400 ring-2 ring-orange-400/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Action Required</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-orange-400">{stats.actionRequired}</span>
            <span className="text-sm">⚠️</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("approved")}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeSubTab === "approved"
              ? "bg-emerald-500/20 border-emerald-400 ring-2 ring-emerald-400/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Approved Fleet</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-emerald-400">{stats.approved}</span>
            <span className="text-sm">✅</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("rejected")}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeSubTab === "rejected"
              ? "bg-rose-500/20 border-rose-400 ring-2 ring-rose-400/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Rejected</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-rose-400">{stats.rejected}</span>
            <span className="text-sm">🚫</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("all")}
          className={`p-3.5 rounded-2xl border text-left transition ${
            activeSubTab === "all"
              ? "bg-indigo-500/20 border-indigo-400 ring-2 ring-indigo-400/30"
              : "bg-slate-900 border-slate-800 hover:border-slate-700"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Registered</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-2xl font-black text-indigo-300">{stats.total}</span>
            <span className="text-sm">🛵</span>
          </div>
        </button>
      </div>

      {/* ── SEARCH & SUBTABS BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          {[
            { id: "pending", label: "⏳ Pending Review", count: stats.pending },
            { id: "action_required", label: "⚠️ Correction Requested", count: stats.actionRequired },
            { id: "approved", label: "✅ Approved", count: stats.approved },
            { id: "rejected", label: "🚫 Rejected", count: stats.rejected },
            { id: "all", label: "All Riders", count: stats.total },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveSubTab(t.id as any)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeSubTab === t.id
                  ? "bg-amber-400 text-slate-950 font-black shadow"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <span>{t.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeSubTab === t.id ? "bg-slate-950/20 text-slate-950" : "bg-slate-800 text-slate-400"
              }`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="नाम, मोबाइल या गाड़ी नंबर खोजें..."
            className="w-full sm:w-64 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── RIDER CARDS STREAM ── */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-500 text-xs flex flex-col items-center gap-2">
          <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
          <span>लोड हो रहा है...</span>
        </div>
      ) : filteredRiders.length === 0 ? (
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
          <span className="text-3xl block mb-2">🛵</span>
          <p className="text-xs font-bold text-slate-400">
            {activeSubTab === "pending"
              ? "कोई भी पेंडिंग राइडर आवेदन नहीं है। सभी सत्यापित हैं!"
              : "कोई राइडर रिकॉर्ड नहीं मिला।"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRiders.map((r) => {
            const cleanPhone = (r.phone || "").replace(/\D/g, "").slice(-10);
            const waText = encodeURIComponent(
              `नमस्ते ${r.full_name || "राइडर"}, Trustit फ्लीट वेरिफिकेशन टीम (बहराइच) से संपर्क। कृपया Trustit राइडर ऐप खोलकर सत्यापन की स्थिति जांचें।`
            );

            return (
              <div
                key={r.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/90 p-4 space-y-3.5 shadow-lg transition hover:border-slate-700 relative overflow-hidden"
              >
                {/* Top Header: Selfie + Name + Badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    {/* Selfie Thumbnail with Zoom onClick */}
                    {r.profile_image_url ? (
                      <button
                        type="button"
                        onClick={() => setPreviewImage(r.profile_image_url || null)}
                        className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-amber-400/60 shadow group flex-shrink-0"
                        title="सेल्फी बड़ा करके देखें"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={r.profile_image_url}
                          alt={r.full_name}
                          className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] text-white font-bold transition">
                          🔍
                        </div>
                      </button>
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl flex-shrink-0 text-slate-400">
                        🛵
                      </div>
                    )}

                    <div>
                      <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                        <span>{r.full_name || "अनाम राइडर"}</span>
                        {r.kyc_status === "approved" && (
                          <span className="text-emerald-400 text-xs" title="Verified Fleet Partner">✅</span>
                        )}
                      </h3>
                      <p className="text-xs font-mono text-slate-300 mt-0.5">{r.phone || "नंबर उपलब्ध नहीं"}</p>
                      
                      {/* 1-Click Call & WhatsApp Action Pills */}
                      {cleanPhone && (
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={`tel:+91${cleanPhone}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-[10px] font-bold text-sky-300 transition"
                          >
                            <span>📞</span>
                            <span>कॉल करें</span>
                          </a>

                          <a
                            href={`https://wa.me/91${cleanPhone}?text=${waText}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/40 text-[10px] font-bold text-emerald-300 transition"
                          >
                            <span>💬</span>
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div>
                    {r.display_status === "action_required" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-pulse">
                        ⚠️ सुधार आवश्यक
                      </span>
                    ) : r.kyc_status === "approved" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                        ✅ स्वीकृत
                      </span>
                    ) : r.kyc_status === "rejected" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/20 text-rose-400 border border-rose-500/40">
                        🚫 अस्वीकृत
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse">
                        ⏳ समीक्षा पेंडिंग
                      </span>
                    )}
                  </div>
                </div>

                {/* Correction Banner if any */}
                {(r.display_status === "action_required" || r.rejection_reason) && (
                  <div className="rounded-xl border border-orange-500/40 bg-orange-950/40 p-2.5 text-xs text-orange-200">
                    <p className="font-bold flex items-center gap-1.5 text-orange-300 text-[11px]">
                      <span>⚠️ सुधार संदेश:</span>
                      <span>{r.rejection_reason || "विवरण में सुधार का अनुरोध भेजा गया"}</span>
                    </p>
                    {r.admin_notes && (
                      <p className="text-[10px] text-orange-300/80 mt-1 font-mono">{r.admin_notes}</p>
                    )}
                  </div>
                )}

                {/* Details Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">वाहन एवं DL</span>
                    <span className="font-semibold text-slate-200 block truncate">
                      🛵 {(r.vehicle_type || "bike").toUpperCase()} | {r.vehicle_number || "संख्या उपलब्ध नहीं"}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block truncate">
                      🪪 DL: {r.driving_license_number || "उपलब्ध नहीं"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">बैंक / UPI</span>
                    <span className="font-semibold text-slate-200 block truncate">
                      💳 {r.upi_id || r.bank_account_number || "उपलब्ध नहीं"}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {r.bank_name || r.bank_ifsc_code || "IFSC नहीं"}
                    </span>
                  </div>

                  <div className="col-span-2 pt-1 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 font-bold uppercase block">निवास का पता</span>
                    <p className="text-slate-300 text-[11px] leading-snug">
                      🏠 {r.residential_address || "पता दर्ज नहीं है"} ({r.city || "Bahraich"} - {r.pincode || "271801"})
                    </p>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-[10px] text-slate-500 flex items-center justify-between">
                  <span>पंजीकरण समय: {new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "short", timeStyle: "short" })}</span>
                  <span className="font-mono text-[9px] text-slate-600">ID: {r.id.slice(0, 8)}...</span>
                </div>

                {/* Action Buttons Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-slate-800">
                  {/* 1. Approve Button */}
                  <button
                    type="button"
                    disabled={isActionPending || r.kyc_status === "approved"}
                    onClick={() => handleApprove(r.id)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 py-2 px-2 text-[11px] font-black text-slate-950 shadow transition"
                  >
                    <span>✅</span>
                    <span>{r.kyc_status === "approved" ? "स्वीकृत है" : "स्वीकृत करें"}</span>
                  </button>

                  {/* 2. Direct Edit Button */}
                  <button
                    type="button"
                    disabled={isActionPending}
                    onClick={() => handleOpenEdit(r)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-slate-800 hover:bg-slate-700 py-2 px-2 text-[11px] font-bold text-slate-200 border border-slate-700 transition"
                  >
                    <span>✏️</span>
                    <span>एडिट करें</span>
                  </button>

                  {/* 3. Request Correction Button */}
                  <button
                    type="button"
                    disabled={isActionPending}
                    onClick={() => handleOpenCorrection(r)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 py-2 px-2 text-[11px] font-bold text-amber-300 border border-amber-500/40 transition"
                  >
                    <span>🔄</span>
                    <span>सुधार भेजें</span>
                  </button>

                  {/* 4. Reject Button */}
                  <button
                    type="button"
                    disabled={isActionPending || r.kyc_status === "rejected"}
                    onClick={() => handleOpenReject(r)}
                    className="flex items-center justify-center gap-1 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 disabled:opacity-40 py-2 px-2 text-[11px] font-bold text-rose-300 border border-rose-500/40 transition"
                  >
                    <span>🚫</span>
                    <span>अस्वीकार</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          MODAL 1: HIGH-RES SELFIE PREVIEW
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-4 text-center space-y-3 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs font-black text-white">📸 राइडर लाइव सेल्फी ऑडिट</h4>
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="relative aspect-square rounded-2xl overflow-hidden border border-slate-800 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImage}
                alt="Selfie High Res"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold"
              >
                बंद करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          MODAL 2: ADMIN DIRECT EDIT MODAL
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {editRider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>✏️</span> एडमिन द्वारा विवरण संपादन
                </h4>
                <p className="text-[10px] text-slate-400">राइडर से फोन पर बात करके आवश्यक विवरण सुधारें।</p>
              </div>
              <button
                type="button"
                onClick={() => setEditRider(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">पूरा नाम</label>
                <input
                  type="text"
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">मोबाइल नंबर (10 अंक)</label>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-2 rounded-xl bg-slate-800 text-slate-400 font-mono">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    className="flex-1 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">निवास का पता (मकान, गली, गाँव, पोस्ट)</label>
                <textarea
                  rows={2}
                  value={editForm.residentialAddress}
                  onChange={(e) => setEditForm({ ...editForm, residentialAddress: e.target.value })}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">पिन कोड</label>
                  <input
                    type="text"
                    maxLength={6}
                    value={editForm.pincode}
                    onChange={(e) => setEditForm({ ...editForm, pincode: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">वाहन प्रकार</label>
                  <select
                    value={editForm.vehicleType}
                    onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                  >
                    <option value="bike">मोटरसाइकिल (Bike)</option>
                    <option value="scooter">स्कूटर (Scooter)</option>
                    <option value="ev">इलेक्ट्रिक व्हीकल (EV)</option>
                    <option value="cycle">साइकिल (Bicycle)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">वाहन संख्या</label>
                  <input
                    type="text"
                    value={editForm.vehicleNumber}
                    onChange={(e) => setEditForm({ ...editForm, vehicleNumber: e.target.value.toUpperCase() })}
                    placeholder="UP 40 AB 1234"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">ड्राइविंग लाइसेंस (DL)</label>
                  <input
                    type="text"
                    value={editForm.drivingLicenseNumber}
                    onChange={(e) => setEditForm({ ...editForm, drivingLicenseNumber: e.target.value.toUpperCase() })}
                    placeholder="UP40 20230001234"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono uppercase"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">UPI आईडी</label>
                <input
                  type="text"
                  value={editForm.upiId}
                  onChange={(e) => setEditForm({ ...editForm, upiId: e.target.value })}
                  placeholder="rider@upi"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white font-mono"
                />
              </div>

              {/* Auto Approve Checkbox */}
              <div className="pt-2 border-t border-slate-800">
                <label className="flex items-center gap-2 cursor-pointer bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                  <input
                    type="checkbox"
                    checked={editForm.autoApprove}
                    onChange={(e) => setEditForm({ ...editForm, autoApprove: e.target.checked })}
                    className="w-4 h-4 accent-amber-400 rounded"
                  />
                  <span className="text-xs font-bold text-emerald-400">
                    सेव करने के साथ तुरंत स्वीकृत (Approve) भी करें
                  </span>
                </label>
              </div>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleSaveEdit}
                className="flex-1 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-xs font-black text-slate-950 shadow"
              >
                {isActionPending ? "सेव हो रहा है..." : editForm.autoApprove ? "सेव और अप्रूव करें" : "परिवर्तन सेव करें"}
              </button>
              <button
                type="button"
                onClick={() => setEditRider(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          MODAL 3: REQUEST CORRECTION MODAL (WITH WHATSAPP PING)
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {correctionRider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                  <span>🔄</span> सुधार का अनुरोध भेजें
                </h4>
                <p className="text-[10px] text-slate-400">{correctionRider.full_name} ({correctionRider.phone})</p>
              </div>
              <button
                type="button"
                onClick={() => setCorrectionRider(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">सुधार की श्रेणी</label>
                <select
                  value={correctionReason}
                  onChange={(e) => setCorrectionReason(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                >
                  <option value="सेल्फी फोटो धुंधली है / चेहरा स्पष्ट नहीं है">📸 सेल्फी धुंधली है / चेहरा स्पष्ट नहीं</option>
                  <option value="धूप का चश्मा या मास्क हटाकर दोबारा सेल्फी लें">🕶️ धूप का चश्मा या मास्क हटाकर सेल्फी लें</option>
                  <option value="वाहन संख्या (Vehicle No) अमान्य है, सही दर्ज करें">🛵 वाहन संख्या (UP 40...) सही दर्ज करें</option>
                  <option value="ड्राइविंग लाइसेंस (DL) संख्या में त्रुटि है">🪪 ड्राइविंग लाइसेंस संख्या में त्रुटि</option>
                  <option value="निवास का पता और पिन कोड स्पष्ट नहीं है">🏠 पता या पिन कोड में सुधार आवश्यक</option>
                  <option value="UPI आईडी अमान्य है, सही बैंक UPI भरें">💳 UPI आईडी अमान्य है</option>
                  <option value="अन्य निर्देश">✍️ अन्य निर्देश (कस्टम नोट लिखें)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">अतिरिक्त संदेश या निर्देश (वैकल्पिक)</label>
                <textarea
                  rows={3}
                  value={correctionNote}
                  onChange={(e) => setCorrectionNote(e.target.value)}
                  placeholder="जैसे: कृपया बिना चश्मे के अच्छी रोशनी में सेल्फी लें ताकि चेहरा पहचान में आ सके।"
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white placeholder:text-slate-500"
                />
              </div>

              {/* WhatsApp Preview */}
              {correctionRider.phone && (
                <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-[11px] text-emerald-200">
                  <p className="font-bold flex items-center gap-1 text-emerald-300">
                    <span>💬</span> WhatsApp संदेश प्रीव्यू:
                  </p>
                  <p className="mt-1 text-slate-300 italic text-[10px]">
                    &quot;नमस्ते {correctionRider.full_name}, Trustit फ्लीट वेरिफिकेशन में आपके आवेदन में एक सुधार आवश्यक है: {correctionNote ? `${correctionReason} (${correctionNote})` : correctionReason}। कृपया ऐप खोलकर अपडेट करें।&quot;
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleSendCorrection}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-xs font-black text-slate-950 shadow"
              >
                {isActionPending ? "भेज रहे हैं..." : "सुधार अनुरोध भेजें"}
              </button>

              {/* Quick WhatsApp Share Button */}
              {correctionRider.phone && (
                <a
                  href={`https://wa.me/91${(correctionRider.phone || "").replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(
                    `नमस्ते ${correctionRider.full_name}, Trustit फ्लीट वेरिफिकेशन में आपके आवेदन में सुधार आवश्यक है: ${correctionNote ? `${correctionReason} (${correctionNote})` : correctionReason}। कृपया Trustit राइडर ऐप खोलकर अपडेट करें।`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white flex items-center gap-1"
                >
                  <span>💬 WhatsApp</span>
                </a>
              )}

              <button
                type="button"
                onClick={() => setCorrectionRider(null)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          MODAL 4: REJECT RIDER MODAL
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {rejectRider && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h4 className="text-sm font-black text-rose-400 flex items-center gap-1.5">
                <span>🚫</span> आवेदन अस्वीकृत करें
              </h4>
              <button
                type="button"
                onClick={() => setRejectRider(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300">
              क्या आप सुनिश्चित हैं कि <strong className="text-white">{rejectRider.full_name}</strong> का आवेदन अस्वीकृत करना चाहते हैं?
            </p>

            <div className="space-y-2 text-xs">
              <label className="text-[10px] font-bold text-slate-400 uppercase block">अस्वीकृति का कारण</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="कारण दर्ज करें..."
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-white"
              />
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleConfirmReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-black text-white shadow"
              >
                {isActionPending ? "अस्वीकृत हो रहा है..." : "हाँ, अस्वीकृत करें"}
              </button>
              <button
                type="button"
                onClick={() => setRejectRider(null)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300"
              >
                रद्द करें
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
