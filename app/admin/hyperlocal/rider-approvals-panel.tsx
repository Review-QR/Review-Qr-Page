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
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  vehicle_type?: string | null;
  vehicle_number?: string | null;
  driving_license_number?: string | null;
  bank_account_holder_name?: string | null;
  bank_account_number?: string | null;
  bank_ifsc_code?: string | null;
  bank_name?: string | null;
  upi_id?: string | null;
  kyc_status?: string | null;
  display_status?: "pending" | "approved" | "rejected";
  is_verified?: boolean;
  rejection_reason?: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at?: string;
}

interface RiderStats {
  total: number;
  pending: number;
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
    approved: 0,
    rejected: 0,
  });
  const [activeSubTab, setActiveSubTab] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isActionPending, setIsActionPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [rejectRider, setRejectRider] = useState<RiderAdminItem | null>(null);
  const [deleteRider, setDeleteRider] = useState<RiderAdminItem | null>(null);
  const [rejectReason, setRejectReason] = useState("Document and vehicle details mismatch");

  const fetchRiders = useCallback(async () => {
    try {
      const res = await fetch("/api/hyperlocal/admin/riders");
      if (res.ok) {
        const data = await res.json();
        setRiders(data.riders || []);
        if (data.stats) {
          setStats({
            total: data.stats.total || 0,
            pending: data.stats.pending || 0,
            approved: data.stats.approved || 0,
            rejected: data.stats.rejected || 0,
          });
          if (onPendingCountChange) onPendingCountChange(data.stats.pending || 0);
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

  function handleOpenReject(r: RiderAdminItem) {
    setRejectRider(r);
    setRejectReason("Document and vehicle details mismatch");
    setErrorMessage(null);
  }

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
        onToast("Rider approved successfully.");
        fetchRiders();
      } else {
        setErrorMessage(data.error || "Approval failed.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Approval failed.");
    } finally {
      setIsActionPending(false);
    }
  }

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
        onToast("Rider application rejected.");
        setRejectRider(null);
        fetchRiders();
      } else {
        setErrorMessage(data.error || "Rejection failed.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Rejection failed.");
    } finally {
      setIsActionPending(false);
    }
  }

  async function handleConfirmDelete() {
    if (!deleteRider) return;
    setIsActionPending(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/hyperlocal/admin/riders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete_rider",
          riderId: deleteRider.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        onToast("Rider permanently deleted from database.");
        setDeleteRider(null);
        fetchRiders();
      } else {
        setErrorMessage(data.error || "Failed to delete rider.");
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to delete rider.");
    } finally {
      setIsActionPending(false);
    }
  }

  const filteredRiders = riders.filter((r) => {
    const status = r.kyc_status || "pending";
    if (activeSubTab === "pending" && status !== "pending") return false;
    if (activeSubTab === "approved" && status !== "approved") return false;
    if (activeSubTab === "rejected" && status !== "rejected") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = (r.full_name || "").toLowerCase().includes(q);
      const matchPhone = (r.phone || "").includes(q);
      const matchVehicle = (r.vehicle_number || "").toLowerCase().includes(q);
      const matchAddress = (r.residential_address || "").toLowerCase().includes(q);
      return matchName || matchPhone || matchVehicle || matchAddress;
    }
    return true;
  });

  return (
    <div className="space-y-3">
      {/* ── ERROR BANNER ── */}
      {errorMessage && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 px-3 py-2 text-[11px] text-rose-800 font-bold flex items-center justify-between">
          <span>⚠️ {errorMessage}</span>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-slate-500 hover:text-slate-900">
            ✕
          </button>
        </div>
      )}

      {/* ── COMPACT 4 KPI TILES ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={() => setActiveSubTab("pending")}
          className={`px-3 py-2 rounded-xl border text-left transition shadow-2xs ${
            activeSubTab === "pending"
              ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Pending Review</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-lg font-black text-amber-600">{stats.pending}</span>
            <span className="text-xs">⏳</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("approved")}
          className={`px-3 py-2 rounded-xl border text-left transition shadow-2xs ${
            activeSubTab === "approved"
              ? "bg-emerald-50 border-emerald-300 ring-1 ring-emerald-300"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Approved Fleet</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-lg font-black text-emerald-600">{stats.approved}</span>
            <span className="text-xs">✅</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("rejected")}
          className={`px-3 py-2 rounded-xl border text-left transition shadow-2xs ${
            activeSubTab === "rejected"
              ? "bg-rose-50 border-rose-300 ring-1 ring-rose-300"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rejected</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-lg font-black text-rose-600">{stats.rejected}</span>
            <span className="text-xs">🚫</span>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("all")}
          className={`px-3 py-2 rounded-xl border text-left transition shadow-2xs ${
            activeSubTab === "all"
              ? "bg-indigo-50 border-indigo-300 ring-1 ring-indigo-300"
              : "bg-white border-slate-200 hover:border-slate-300"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Total Registered</span>
          <div className="flex items-center justify-between mt-0.5">
            <span className="text-lg font-black text-indigo-700">{stats.total}</span>
            <span className="text-xs">🛵</span>
          </div>
        </button>
      </div>

      {/* ── COMPACT SEARCH & 4 SUBTABS BAR ── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-white p-2 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 sm:pb-0 text-[11px]">
          {[
            { id: "pending", label: "⏳ Pending Review", count: stats.pending },
            { id: "approved", label: "✅ Approved", count: stats.approved },
            { id: "rejected", label: "🚫 Rejected", count: stats.rejected },
            { id: "all", label: "Total Registered", count: stats.total },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveSubTab(t.id as any)}
              className={`px-2.5 py-1 rounded-lg font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
                activeSubTab === t.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[9px] ${
                  activeSubTab === t.id ? "bg-white/20 text-white" : "bg-white text-slate-700 border border-slate-200"
                }`}
              >
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
            placeholder="Search by name, phone, address..."
            className="w-full sm:w-60 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-amber-500 focus:bg-white"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-slate-400 hover:text-slate-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── FULL-WIDTH HORIZONTAL RIDER LIST ── */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-500 text-xs flex flex-col items-center gap-2 bg-white rounded-xl border border-slate-200">
          <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <span>Loading riders...</span>
        </div>
      ) : filteredRiders.length === 0 ? (
        <div className="p-8 text-center rounded-xl border border-dashed border-slate-200 bg-white">
          <span className="text-2xl block mb-1">🛵</span>
          <p className="text-xs font-bold text-slate-700">
            {activeSubTab === "pending"
              ? "No pending rider applications right now."
              : "No riders found in this view."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredRiders.map((r) => {
            const status = r.kyc_status || "pending";
            const addressStr = `${r.residential_address || "Address not provided"} (${r.city || "Bahraich"} - ${r.pincode || "271801"})`;

            // ── VIEW A: APPROVED FLEET (Single Long Line: Name, Phone, Address + Delete Only) ──
            if (activeSubTab === "approved") {
              return (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-2xs hover:border-slate-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-[160px]">
                      {r.profile_image_url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(r.profile_image_url || null)}
                          className="w-7 h-7 rounded-lg overflow-hidden border border-slate-200 flex-shrink-0"
                          title="View Selfie"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.profile_image_url} alt={r.full_name} className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {(r.full_name || "R").charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {r.full_name || "Unnamed Rider"}
                      </span>
                    </div>

                    <span className="text-[11px] font-mono text-slate-700 font-semibold whitespace-nowrap min-w-[115px]">
                      {r.phone}
                    </span>

                    <span className="text-[11px] text-slate-600 truncate flex-1" title={addressStr}>
                      {addressStr}
                    </span>
                  </div>

                  <div className="flex items-center justify-end flex-shrink-0">
                    <button
                      type="button"
                      disabled={isActionPending}
                      onClick={() => setDeleteRider(r)}
                      title="Delete Rider from Database"
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-600 transition"
                    >
                      <span>🗑️</span>
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            }

            // ── VIEW B: PENDING REVIEW (Compact Full-Width Strip: Approve & Reject Buttons Only) ──
            if (activeSubTab === "pending") {
              return (
                <div
                  key={r.id}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 rounded-xl border border-amber-200/80 bg-white px-3.5 py-2.5 shadow-2xs hover:border-amber-300 transition"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className="flex items-center gap-2 min-w-[170px]">
                      {r.profile_image_url ? (
                        <button
                          type="button"
                          onClick={() => setPreviewImage(r.profile_image_url || null)}
                          className="w-8 h-8 rounded-lg overflow-hidden border border-amber-300 flex-shrink-0"
                          title="Click to zoom selfie"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={r.profile_image_url} alt={r.full_name} className="w-full h-full object-cover" />
                        </button>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                          🛵
                        </div>
                      )}
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-slate-900 block truncate">
                          {r.full_name || "Unnamed Rider"}
                        </span>
                        <span className="text-[11px] font-mono text-slate-600 block">
                          {r.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-600 flex-1 min-w-0">
                      <span className="font-mono font-semibold text-slate-800 whitespace-nowrap">
                        {(r.vehicle_type || "bike").toUpperCase()} • {r.vehicle_number || "UP-40"}
                        {r.driving_license_number ? ` • DL: ${r.driving_license_number}` : ""}
                      </span>
                      {r.upi_id && (
                        <span className="font-mono text-slate-700 whitespace-nowrap">
                          UPI: {r.upi_id}
                        </span>
                      )}
                      <span className="text-slate-600 truncate" title={addressStr}>
                        📍 {addressStr}
                      </span>
                    </div>
                  </div>

                  {/* ONLY 2 Buttons in Pending Review: Approve & Reject */}
                  <div className="flex items-center gap-1.5 flex-shrink-0 justify-end">
                    <button
                      type="button"
                      disabled={isActionPending}
                      onClick={() => handleApprove(r.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-3 py-1 text-[11px] font-bold text-white shadow-2xs transition"
                    >
                      <span>✅</span>
                      <span>Approve</span>
                    </button>

                    <button
                      type="button"
                      disabled={isActionPending}
                      onClick={() => handleOpenReject(r)}
                      className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1 text-[11px] font-bold text-rose-700 transition"
                    >
                      <span>🚫</span>
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              );
            }

            // ── VIEW C: REJECTED ──
            if (activeSubTab === "rejected") {
              return (
                <div
                  key={r.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-rose-200 bg-white px-3.5 py-2 shadow-2xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-5 flex-1 min-w-0">
                    <span className="text-xs font-bold text-slate-900 min-w-[150px] truncate">
                      {r.full_name || "Unnamed Rider"}
                    </span>
                    <span className="text-[11px] font-mono text-slate-600 whitespace-nowrap">
                      {r.phone}
                    </span>
                    <span className="text-[11px] text-rose-700 truncate flex-1">
                      Reason: {r.rejection_reason || "Rejected by Admin"}
                    </span>
                  </div>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold flex-shrink-0">
                    Rejected
                  </span>
                </div>
              );
            }

            // ── VIEW D: TOTAL REGISTERED / ALL RIDERS (All riders with Delete option) ──
            return (
              <div
                key={r.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2 shadow-2xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-4 flex-1 min-w-0">
                  <div className="flex items-center gap-2 min-w-[160px]">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                      {(r.full_name || "R").charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {r.full_name || "Unnamed Rider"}
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-700 font-semibold whitespace-nowrap min-w-[115px]">
                    {r.phone}
                  </span>

                  <span className="text-[11px] text-slate-600 truncate flex-1" title={addressStr}>
                    {addressStr}
                  </span>

                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase whitespace-nowrap ${
                      status === "approved"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : status === "rejected"
                        ? "bg-rose-50 text-rose-700 border border-rose-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {status}
                  </span>
                </div>

                <div className="flex items-center justify-end flex-shrink-0">
                  <button
                    type="button"
                    disabled={isActionPending}
                    onClick={() => setDeleteRider(r)}
                    title="Delete Rider from Database"
                    className="inline-flex items-center gap-1 rounded-lg bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 text-[11px] font-bold text-rose-600 transition"
                  >
                    <span>🗑️</span>
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          MODAL 1: FULLSCREEN SELFIE PREVIEW
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-md w-full bg-white rounded-2xl border border-slate-200 p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 w-7 h-7 rounded-full bg-slate-900/80 text-white text-xs font-bold flex items-center justify-center hover:bg-slate-900"
            >
              ✕
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Rider Selfie Preview" className="w-full rounded-xl max-h-[80vh] object-contain" />
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          MODAL 2: REJECT RIDER MODAL
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {rejectRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-slate-900">🚫 Reject Rider: {rejectRider.full_name}</span>
              <button type="button" onClick={() => setRejectRider(null)} className="text-slate-400 hover:text-slate-700 text-xs">
                ✕
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Rejection Reason</label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Write rejection reason..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleConfirmReject}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-bold text-white shadow-xs"
              >
                {isActionPending ? "Rejecting..." : "Confirm Reject"}
              </button>
              <button
                type="button"
                onClick={() => setRejectRider(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════════════
          MODAL 3: DELETE RIDER CONFIRMATION MODAL
         ═══════════════════════════════════════════════════════════════════════════════ */}
      {deleteRider && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl border border-rose-200 bg-white p-4 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-xs font-black text-rose-700">🗑️ Delete Rider Permanently</span>
              <button type="button" onClick={() => setDeleteRider(null)} className="text-slate-400 hover:text-slate-700 text-xs">
                ✕
              </button>
            </div>

            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-slate-800 space-y-1.5">
              <p className="font-bold text-rose-900">
                Delete {deleteRider.full_name || "this rider"} ({deleteRider.phone}) from the database?
              </p>
              <p className="text-[11px] text-rose-800 leading-relaxed">
                This will completely erase their profile from the database. If they log in again with the same phone number, they will be forced to complete full profile setup from scratch.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={isActionPending}
                onClick={handleConfirmDelete}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-xs font-bold text-white shadow-xs"
              >
                {isActionPending ? "Deleting..." : "Confirm Delete"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteRider(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 hover:bg-slate-200 border border-slate-200"
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
