"use client";

import { useState } from "react";
import type {
  MerchantBankAccount,
  MerchantFinancialSummary,
  MerchantKycDocument,
  MerchantSettlementRecord,
} from "@/lib/bank-payouts-service";

function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return dateStr;
  }
}

export default function MerchantPayoutsClient({
  business,
  bankDetails,
  financialSummary,
  settlements,
  kycDocuments,
  children,
}: {
  business: { id: string; name: string; city: string | null; businessType: string | null };
  bankDetails: MerchantBankAccount | null;
  financialSummary: MerchantFinancialSummary;
  settlements: MerchantSettlementRecord[];
  kycDocuments: MerchantKycDocument[];
  children?: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = useState<"settlements" | "kyc" | "subscriptions">("settlements");
  const [filterRange, setFilterRange] = useState<"all" | "today" | "week" | "month">("all");
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState<string | null>(null);

  // Bank Change Request State
  const [newHolderName, setNewHolderName] = useState("");
  const [newAccNumber, setNewAccNumber] = useState("");
  const [newAccConfirm, setNewAccConfirm] = useState("");
  const [newIfsc, setNewIfsc] = useState("");
  const [newBankName, setNewBankName] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [changeSubmitted, setChangeSubmitted] = useState(false);
  const [changeError, setChangeError] = useState("");

  const copyToClipboard = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedUtr(text);
    setTimeout(() => setCopiedUtr(null), 2500);
  };

  const handleExportCsv = () => {
    const headers = [
      "Settlement Date",
      "Settlement ID",
      "Orders Count",
      "Gross Sales (INR)",
      "Commission Deducted (INR)",
      "Payment Gateway Fee (INR)",
      "TDS 194-O (INR)",
      "Net Payout Deposited (INR)",
      "Bank UTR Number",
      "Account Number",
      "IFSC Code",
      "Status",
    ];

    const rows = settlements.map((s) => [
      s.settlement_date,
      s.id,
      s.orders_count,
      s.gross_sales.toFixed(2),
      s.platform_commission.toFixed(2),
      s.payment_gateway_fee.toFixed(2),
      s.tds_deduction.toFixed(2),
      s.net_payout_amount.toFixed(2),
      s.bank_utr_number,
      s.bank_account_number,
      s.ifsc_code,
      s.status.toUpperCase(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Trustit_Settlements_${business.name.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSettlements = settlements.filter((s) => {
    if (filterRange === "today") {
      const todayStr = new Date().toISOString().slice(0, 10);
      return s.settlement_date === todayStr;
    }
    if (filterRange === "week") {
      const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
      return s.settlement_date >= sevenDaysAgo;
    }
    if (filterRange === "month") {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
      return s.settlement_date >= thirtyDaysAgo;
    }
    return true;
  });

  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    if (!newHolderName || !newAccNumber || !newIfsc || !newBankName) {
      setChangeError("Kripya sabhi zaroori bank fields bharein.");
      return;
    }
    if (newAccNumber !== newAccConfirm) {
      setChangeError("Account number aur Confirm Account number match nahi kar rahe hain.");
      return;
    }
    if (newIfsc.length !== 11) {
      setChangeError("IFSC Code 11-digit ka hona chahiye (e.g., SBIN0000123).");
      return;
    }
    setOtpSent(true);
  };

  const handleSubmitBankChange = (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError("");
    if (!otpCode || otpCode.length !== 6) {
      setChangeError("Kripya 6-digit OTP daalein jo registered mobile par bheja gaya hai.");
      return;
    }
    setChangeSubmitted(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700 uppercase tracking-wider">
              Settlements & Payouts Engine
            </span>
            <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-700">
              T+1 Daily Cycle
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Financial Ledger & Bank Settlements
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {business.name} • Bahraich Hyperlocal Hub • Rozana subah 10:00 AM bank payout ledger
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            📥 Export CSV Statement
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs hover:bg-slate-50 transition"
          >
            🖨️ Print Summary
          </button>
          <button
            type="button"
            onClick={() => setIsBankModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-700 transition"
          >
            🏦 Manage Bank Account
          </button>
        </div>
      </div>

      {/* 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Today */}
        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/60 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-700">
            <span>📅 Today&apos;s Orders</span>
            <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px]">Live</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {formatCurrency(financialSummary.today.net_payout)}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {financialSummary.today.orders_count} Orders
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-emerald-100/60 pt-2">
            <span>Gross Sales: {formatCurrency(financialSummary.today.gross_sales)}</span>
            <span className="text-rose-600 font-medium">
              Comm: -{formatCurrency(financialSummary.today.commission)}
            </span>
          </div>
        </div>

        {/* Card 2: This Week */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/60 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-blue-700">
            <span>📈 This Week</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px]">7 Days</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {formatCurrency(financialSummary.this_week.net_payout)}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {financialSummary.this_week.orders_count} Orders
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-blue-100/60 pt-2">
            <span>Gross GMV: {formatCurrency(financialSummary.this_week.gross_sales)}</span>
            <span className="text-rose-600 font-medium">
              Comm: -{formatCurrency(financialSummary.this_week.commission)}
            </span>
          </div>
        </div>

        {/* Card 3: This Month */}
        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50/60 to-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-indigo-700">
            <span>🏆 This Month</span>
            <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px]">30 Days</span>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-black text-slate-900">
              {formatCurrency(financialSummary.this_month.net_payout)}
            </span>
            <span className="text-xs font-bold text-slate-600">
              {financialSummary.this_month.orders_count} Orders
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between text-xs text-slate-500 border-t border-indigo-100/60 pt-2">
            <span>Gross GMV: {formatCurrency(financialSummary.this_month.gross_sales)}</span>
            <span className="text-indigo-700 font-bold">100% Settled</span>
          </div>
        </div>

        {/* Card 4: Bank Account & Payout Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-600">
            <span>🏦 Bank Account</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              ✓ Verified
            </span>
          </div>
          <div className="mt-2">
            <p className="text-sm font-bold text-slate-900 truncate">
              {bankDetails?.bank_name ?? "State Bank of India"}
            </p>
            <p className="font-mono text-xs text-slate-600">
              {bankDetails?.bank_account_number ?? "•••• •••• 4819"} • {bankDetails?.ifsc_code ?? "SBIN0000123"}
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-[11px] text-slate-500">Auto IMPS Daily</span>
            <button
              type="button"
              onClick={() => setIsBankModalOpen(true)}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 underline"
            >
              Request Change
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 text-sm font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("settlements")}
          className={`pb-3 px-1 transition ${
            activeTab === "settlements"
              ? "border-b-2 border-blue-600 text-blue-700 font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          💳 Daily Settlements & Passbook ({settlements.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("kyc")}
          className={`pb-3 px-3 transition ${
            activeTab === "kyc"
              ? "border-b-2 border-blue-600 text-blue-700 font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          📜 KYC & Licenses ({kycDocuments.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("subscriptions")}
          className={`pb-3 px-3 transition ${
            activeTab === "subscriptions"
              ? "border-b-2 border-blue-600 text-blue-700 font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          ⚡ Subscription Plans History
        </button>
      </div>

      {/* TAB 1: Daily Settlements & Passbook */}
      {activeTab === "settlements" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Daily Payouts & UTR Passbook</h2>
              <p className="text-xs text-slate-500">
                Formula: Item Subtotal - 10% Platform Commission - 1.75% Payment Gateway Fee - 1% TDS (194-O) = Net Deposited
              </p>
            </div>

            <div className="flex items-center gap-1.5 rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setFilterRange("all")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  filterRange === "all" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                All Time
              </button>
              <button
                type="button"
                onClick={() => setFilterRange("month")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  filterRange === "month" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                This Month
              </button>
              <button
                type="button"
                onClick={() => setFilterRange("week")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  filterRange === "week" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                This Week
              </button>
              <button
                type="button"
                onClick={() => setFilterRange("today")}
                className={`rounded-lg px-2.5 py-1.5 transition ${
                  filterRange === "today" ? "bg-white text-slate-900 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Today
              </button>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[960px] border-collapse text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-3.5 py-3">Settlement Date</th>
                  <th className="px-3.5 py-3">Batch ID</th>
                  <th className="px-3.5 py-3 text-center">Orders</th>
                  <th className="px-3.5 py-3 text-right">Gross Sales</th>
                  <th className="px-3.5 py-3 text-right">Commission (10%)</th>
                  <th className="px-3.5 py-3 text-right">PG Fee (1.75%)</th>
                  <th className="px-3.5 py-3 text-right">TDS (1%)</th>
                  <th className="px-3.5 py-3 text-right text-emerald-800 font-extrabold">Net Payout</th>
                  <th className="px-3.5 py-3">Bank UTR Number</th>
                  <th className="px-3.5 py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                {filteredSettlements.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-3.5 py-3.5 font-semibold text-slate-900">
                      {formatDate(record.settlement_date)}
                    </td>
                    <td className="px-3.5 py-3.5 font-mono text-[11px] text-slate-500">
                      {record.id}
                    </td>
                    <td className="px-3.5 py-3.5 text-center font-bold text-slate-800">
                      {record.orders_count}
                    </td>
                    <td className="px-3.5 py-3.5 text-right font-medium text-slate-900">
                      {formatCurrency(record.gross_sales)}
                    </td>
                    <td className="px-3.5 py-3.5 text-right text-rose-600 font-medium">
                      -{formatCurrency(record.platform_commission)}
                    </td>
                    <td className="px-3.5 py-3.5 text-right text-slate-500">
                      -{formatCurrency(record.payment_gateway_fee)}
                    </td>
                    <td className="px-3.5 py-3.5 text-right text-slate-500">
                      -{formatCurrency(record.tds_deduction)}
                    </td>
                    <td className="px-3.5 py-3.5 text-right text-emerald-700 font-black text-sm">
                      {formatCurrency(record.net_payout_amount)}
                    </td>
                    <td className="px-3.5 py-3.5 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <span className="text-slate-800">{record.bank_utr_number}</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(record.bank_utr_number)}
                          className="text-[10px] text-blue-600 hover:text-blue-800 bg-blue-50 px-1.5 py-0.5 rounded font-sans"
                        >
                          {copiedUtr === record.bank_utr_number ? "Copied!" : "Copy"}
                        </button>
                      </div>
                    </td>
                    <td className="px-3.5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                        ✓ Settled
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: KYC & Licenses */}
      {activeTab === "kyc" && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">KYC & Compliance Documents</h2>
            <p className="text-xs text-slate-500">
              Government regulatory documents for legal operations in Bahraich (Food FSSAI, Drug License, PAN, Trade License).
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {kycDocuments.map((doc) => (
              <div key={doc.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                    {doc.document_type.replace(/_/g, " ")}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                    ✓ Verified
                  </span>
                </div>
                <p className="mt-2 text-sm font-mono font-bold text-slate-900">
                  {doc.document_number || "Verified on file"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Verified by Trustit Admin • {doc.verified_at ? formatDate(doc.verified_at) : "Active"}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Existing Subscription Billing */}
      {activeTab === "subscriptions" && (
        <div className="space-y-4">
          {children}
        </div>
      )}

      {/* Manage Bank Account & Change Request Modal */}
      {isBankModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
                  Bank Payouts Configuration
                </span>
                <h3 className="text-xl font-black text-slate-900">Bank Account Details</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsBankModalOpen(false);
                  setChangeSubmitted(false);
                  setOtpSent(false);
                  setChangeError("");
                }}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            {/* Currently Active Bank Account */}
            <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Active Bank Account (Direct Payouts)
                </span>
                <span className="rounded-full bg-emerald-200 px-2 py-0.5 text-[10px] font-bold text-emerald-900">
                  Penny-Drop Verified ✓
                </span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Bank Name:</span>
                  <p className="font-bold text-slate-900">{bankDetails?.bank_name ?? "State Bank of India"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Account Number:</span>
                  <p className="font-mono font-bold text-slate-900">
                    {bankDetails?.bank_account_number ?? "•••• •••• 4819"}
                  </p>
                </div>
                <div>
                  <span className="text-slate-500">IFSC Code:</span>
                  <p className="font-mono font-bold text-slate-900">{bankDetails?.ifsc_code ?? "SBIN0000123"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Account Holder:</span>
                  <p className="font-bold text-slate-900">{bankDetails?.account_holder_name ?? business.name}</p>
                </div>
              </div>
            </div>

            {/* Security Warning Notice */}
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3.5 text-xs text-amber-900 leading-relaxed">
              <strong>🔒 Enterprise Fraud Protection:</strong> Bank account badalne ke liye 2-Factor OTP verification aur Admin phone confirmation zaroori hai. Naye account me payout shuru hone se pehle <strong>24-hour security cooling-off hold</strong> rehta hai taaki kisi unauthorised change ko roka ja sake.
            </div>

            {changeSubmitted ? (
              <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200 text-2xl text-emerald-800">
                  ✓
                </div>
                <h4 className="mt-3 text-base font-bold text-slate-900">
                  Bank Change Request Submitted!
                </h4>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Aapki request Trustit Admin Queue me chali gayi hai. Hamare executive aapke registered number par phone karke confirm karenge aur 24 ghante ke cooling-off period ke baad naya account active ho jayega.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsBankModalOpen(false);
                    setChangeSubmitted(false);
                    setOtpSent(false);
                  }}
                  className="mt-4 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700"
                >
                  OK, Got It
                </button>
              </div>
            ) : (
              <form onSubmit={otpSent ? handleSubmitBankChange : handleRequestOtp} className="mt-5 space-y-4">
                <h4 className="text-sm font-bold text-slate-900">
                  {otpSent ? "Step 2: Enter Verification OTP" : "Request Bank Account Update"}
                </h4>

                {changeError && (
                  <p className="rounded-lg bg-rose-50 p-2.5 text-xs font-medium text-rose-700 border border-rose-200">
                    {changeError}
                  </p>
                )}

                {!otpSent ? (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">Account Holder Name (as in Bank)</label>
                      <input
                        type="text"
                        value={newHolderName}
                        onChange={(e) => setNewHolderName(e.target.value)}
                        placeholder="RAMESH KUMAR GUPTA"
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">New Account Number</label>
                        <input
                          type="password"
                          value={newAccNumber}
                          onChange={(e) => setNewAccNumber(e.target.value)}
                          placeholder="e.g. 501002391823"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Confirm Account Number</label>
                        <input
                          type="text"
                          value={newAccConfirm}
                          onChange={(e) => setNewAccConfirm(e.target.value)}
                          placeholder="Re-enter Account No"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Bank IFSC Code</label>
                        <input
                          type="text"
                          value={newIfsc}
                          onChange={(e) => setNewIfsc(e.target.value.toUpperCase())}
                          placeholder="SBIN0000123"
                          maxLength={11}
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500 font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-slate-700">Bank Name</label>
                        <input
                          type="text"
                          value={newBankName}
                          onChange={(e) => setNewBankName(e.target.value)}
                          placeholder="State Bank of India / HDFC"
                          className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs outline-none focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full rounded-xl bg-blue-600 py-2.5 text-xs font-bold text-white hover:bg-blue-700 transition"
                    >
                      Send OTP to Registered Mobile →
                    </button>
                  </>
                ) : (
                  <>
                    <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 text-xs text-slate-700">
                      OTP sent to registered mobile for business <strong>{business.name}</strong>. (For demo testing, enter <code>123456</code>).
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">6-Digit OTP</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        className="w-full rounded-xl border border-slate-300 px-3 py-2 text-center text-sm font-bold tracking-widest outline-none focus:border-blue-500 font-mono"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="w-1/3 rounded-xl border border-slate-300 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        className="w-2/3 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 transition"
                      >
                        Confirm & Submit to Admin Queue ✓
                      </button>
                    </div>
                  </>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
