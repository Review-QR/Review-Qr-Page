"use client";

import React, { useCallback, useEffect, useState } from "react";
import { calculatePointsInrValue } from "@/lib/customer-points";

interface AdminCustomerPointRow {
  id: string;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  reward_points: number;
  inr_value: number;
  created_at: string;
}

interface PointsLedgerEntry {
  id: string;
  customer_id: string;
  points_delta: number;
  balance_after: number;
  reason: string;
  admin_email: string | null;
  created_at: string;
}

const PRESET_TOP_UPS = [100, 350, 700, 1400];

export default function AdminCustomerPointsPanel() {
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<AdminCustomerPointRow[]>([]);
  const [ledger, setLedger] = useState<PointsLedgerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomerPointRow | null>(null);
  const [pointsInput, setPointsInput] = useState("350");
  const [reasonInput, setReasonInput] = useState("Admin Loyalty Top-Up");
  const [isSaving, setIsSaving] = useState(false);
  const [statusNotice, setStatusNotice] = useState("");

  const loadCustomers = useCallback(async (queryText: string) => {
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await fetch(
        `/api/hyperlocal/admin/customer-points?q=${encodeURIComponent(queryText.trim())}`,
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Could not load customer points.");
        return;
      }
      setCustomers(data.customers || []);
      setLedger(data.recentLedger || []);
      if (!selectedCustomer && data.customers?.length > 0) {
        setSelectedCustomer(data.customers[0]);
      }
    } catch {
      setErrorMsg("Network error loading customer points.");
    } finally {
      setLoading(false);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    loadCustomers("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApplyTopUp = async (mode: "add" | "deduct") => {
    if (!selectedCustomer) return;
    const rawAmt = Math.abs(Math.trunc(Number(pointsInput)));
    if (!Number.isFinite(rawAmt) || rawAmt <= 0) {
      setErrorMsg("Please enter a valid positive number of points.");
      return;
    }

    const delta = mode === "deduct" ? -rawAmt : rawAmt;
    setIsSaving(true);
    setErrorMsg("");
    setStatusNotice("");
    try {
      const res = await fetch("/api/hyperlocal/admin/customer-points", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          pointsDelta: delta,
          reason: reasonInput.trim() || (mode === "add" ? "Admin Top-Up" : "Admin Adjustment"),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Points update failed.");
        return;
      }

      const nextPts = Number(data.rewardPoints ?? 0);
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === selectedCustomer.id
            ? { ...c, reward_points: nextPts, inr_value: calculatePointsInrValue(nextPts) }
            : c,
        ),
      );
      setSelectedCustomer((prev) =>
        prev ? { ...prev, reward_points: nextPts, inr_value: calculatePointsInrValue(nextPts) } : prev,
      );
      setStatusNotice(
        `${delta > 0 ? "+" : ""}${data.appliedDelta} points updated for ${selectedCustomer.full_name || selectedCustomer.phone}. New balance: ${nextPts} pts (₹${calculatePointsInrValue(nextPts)}).`,
      );
      loadCustomers(search);
    } catch {
      setErrorMsg("Network error saving points.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-indigo-200 bg-gradient-to-r from-indigo-950 via-[#003178] to-teal-900 p-4 text-white flex flex-wrap items-center justify-between gap-3 shadow-xs">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-cyan-200">
            TRUSTIT SUPER-APP • LOYALTY TOP-UP DESK
          </span>
          <h2 className="text-base font-black mt-0.5">Customer Reward Points Control</h2>
          <p className="text-xs text-slate-200 mt-0.5">
            Conversion Rate Locked: <strong>350 Points = ₹100.00</strong>
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            loadCustomers(search);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search mobile, name or email..."
            className="rounded-xl bg-white/95 text-slate-900 px-3 py-2 text-xs font-semibold w-56 outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 px-3.5 py-2 text-xs font-black transition"
          >
            Search
          </button>
        </form>
      </div>

      {errorMsg && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-bold text-rose-800">
          ⚠️ {errorMsg}
        </div>
      )}
      {statusNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-bold text-emerald-900">
          ✓ {statusNotice}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Customer Directory */}
        <div className="lg:col-span-7 rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Registered Customers ({customers.length})
            </h3>
            <button
              type="button"
              onClick={() => loadCustomers(search)}
              className="text-[11px] font-bold text-[#003178] hover:underline"
            >
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading customers...</div>
          ) : customers.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching customers found.
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
              {customers.map((cust) => {
                const isSelected = selectedCustomer?.id === cust.id;
                return (
                  <button
                    key={cust.id}
                    type="button"
                    onClick={() => setSelectedCustomer(cust)}
                    className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 transition ${
                      isSelected ? "bg-indigo-50/80 ring-1 ring-inset ring-indigo-300" : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="text-xs font-black text-slate-900 truncate">
                        {cust.full_name || "Trustit Customer"}
                      </div>
                      <div className="text-[11px] font-semibold text-slate-600 mt-0.5">
                        📞 {cust.phone ? `+91 ${cust.phone}` : "No phone"} • {cust.email || "—"}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-black text-[#003178]">
                        {cust.reward_points.toLocaleString("en-IN")} pts
                      </div>
                      <div className="text-[10px] font-bold text-emerald-700">
                        Value: ₹{calculatePointsInrValue(cust.reward_points)}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Customer Top-Up Controls & Audit */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-2xs">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Top-Up / Adjust Customer Points
            </h3>

            {!selectedCustomer ? (
              <p className="text-xs text-slate-500">Select a customer from the list to manage points.</p>
            ) : (
              <>
                <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-black text-slate-900">
                      {selectedCustomer.full_name || "Customer"}
                    </div>
                    <div className="text-[11px] text-slate-600">
                      +91 {selectedCustomer.phone || "N/A"}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-[#003178]">
                      {selectedCustomer.reward_points} pts
                    </div>
                    <div className="text-[11px] font-bold text-emerald-700">
                      = ₹{calculatePointsInrValue(selectedCustomer.reward_points)}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1.5">
                    Quick Top-Up Presets
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {PRESET_TOP_UPS.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setPointsInput(String(preset))}
                        className={`rounded-xl border py-1.5 text-[11px] font-black transition ${
                          Number(pointsInput) === preset
                            ? "border-[#003178] bg-indigo-50 text-[#003178]"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        +{preset}
                        <span className="block text-[9px] font-semibold text-emerald-700">
                          ₹{calculatePointsInrValue(preset)}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Points Amount
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={pointsInput}
                      onChange={(e) => setPointsInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-black text-slate-900 outline-none focus:border-[#003178]"
                    />
                  </div>
                  <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 flex flex-col justify-center">
                    <span className="text-[10px] font-bold text-emerald-800">Converted INR Value</span>
                    <span className="text-sm font-black text-emerald-900">
                      ₹{calculatePointsInrValue(Number(pointsInput) || 0)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Reason / Admin Note
                  </label>
                  <input
                    type="text"
                    value={reasonInput}
                    onChange={(e) => setReasonInput(e.target.value)}
                    placeholder="e.g. Referral bonus / Order support top-up"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-[#003178]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleApplyTopUp("add")}
                    className="rounded-xl bg-[#003178] hover:bg-blue-900 py-2.5 text-xs font-black text-white shadow-xs disabled:opacity-50 transition"
                  >
                    {isSaving ? "Saving..." : "+ Add Points Top-Up"}
                  </button>
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => handleApplyTopUp("deduct")}
                    className="rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 py-2.5 text-xs font-bold text-rose-800 disabled:opacity-50 transition"
                  >
                    - Deduct Points
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-2.5 shadow-2xs">
            <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">
              Recent Points Activity
            </h4>
            {ledger.length === 0 ? (
              <p className="text-[11px] text-slate-500">No point transactions yet.</p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {ledger.map((row) => (
                  <div
                    key={row.id}
                    className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 flex items-center justify-between text-[11px]"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{row.reason}</span>
                      <span className="block text-[10px] text-slate-500">
                        Bal: {row.balance_after} pts (₹{calculatePointsInrValue(row.balance_after)})
                      </span>
                    </div>
                    <span
                      className={`font-black ${
                        row.points_delta >= 0 ? "text-emerald-700" : "text-rose-700"
                      }`}
                    >
                      {row.points_delta >= 0 ? `+${row.points_delta}` : row.points_delta}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
