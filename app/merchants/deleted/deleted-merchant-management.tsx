"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { permanentlyDeleteMerchantAction, restoreMerchantAction, type MerchantLifecycleResult } from "@/app/merchants/actions";
import LogoutButton from "@/app/logout-button";
import type { Business } from "@/lib/types";

type DeletedMerchant = { business: Business; deletedByName: string };

export default function DeletedMerchantManagement({ merchants }: { merchants: DeletedMerchant[] }) {
  const [rows, setRows] = useState(merchants);
  const [target, setTarget] = useState<DeletedMerchant | null>(null);
  const [mode, setMode] = useState<"restore" | "permanent" | null>(null);
  const [typedId, setTypedId] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [pending, setPending] = useState(false);
  const [cleanupBusinessId, setCleanupBusinessId] = useState<string | null>(null);
  const router = useRouter();

  async function submit() {
    if (!target || !mode || pending) return;
    if (mode === "permanent" && typedId !== target.business.id) return;
    setPending(true);
    let result: MerchantLifecycleResult;
    try {
      result = mode === "restore"
        ? await restoreMerchantAction(target.business.id)
        : await permanentlyDeleteMerchantAction(target.business.id, typedId);
    } catch {
      result = { success: false, message: "The request could not be completed. Refresh and verify the merchant before retrying." };
    } finally {
      setPending(false);
    }

    setMessage(result.message);
    setIsError(!result.success);
    if (result.success || result.businessDeleted) {
      setRows((current) => current.filter((item) => item.business.id !== target.business.id));
      setCleanupBusinessId(result.identityCleanupPending ? target.business.id : null);
      setTarget(null);
      setMode(null);
      setTypedId("");
      router.refresh();
    }
  }

  async function retryIdentityCleanup() {
    if (!cleanupBusinessId || pending) return;
    setPending(true);
    try {
      const result = await permanentlyDeleteMerchantAction(cleanupBusinessId, cleanupBusinessId);
      setMessage(result.message);
      setIsError(!result.success);
      if (!result.identityCleanupPending) setCleanupBusinessId(null);
    } catch {
      setMessage("Identity cleanup could not be confirmed. Retry after checking the Auth account state.");
      setIsError(true);
    } finally {
      setPending(false);
    }
  }

  function openDialog(merchant: DeletedMerchant, nextMode: "restore" | "permanent") {
    setTarget(merchant);
    setMode(nextMode);
    setTypedId("");
    setMessage("");
  }

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand"><div className="brand-mark" aria-hidden="true">QR</div><div><p className="brand-kicker">Review-QR · ADMIN</p><h1>Deleted Merchants</h1><p className="dashboard-subtitle">Restore accounts or permanently remove them and their associated records.</p></div></div>
        <div className="dashboard-header-actions flex-wrap">
          <Link href="/merchants" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Active Merchants</Link>
          <Link href="/admin" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50">Dashboard</Link>
          <div className="logout-control"><LogoutButton /></div>
        </div>
      </header>

      {message && <div className={`mb-4 rounded-xl px-4 py-3 text-sm ${isError ? "bg-rose-50 text-rose-800" : "bg-emerald-50 text-emerald-800"}`} role={isError ? "alert" : "status"}>
        <p>{message}</p>
        {cleanupBusinessId && <button type="button" disabled={pending} onClick={retryIdentityCleanup} className="mt-2 rounded-md border border-rose-300 px-3 py-1.5 font-semibold disabled:opacity-60">{pending ? "Retrying…" : "Retry Auth identity cleanup"}</button>}
      </div>}

      <section className="dashboard-panel">
        <div className="section-heading"><div><p className="section-kicker">PRESERVED MERCHANT RECORDS</p><h2>Deleted Merchants</h2></div><span className="count-badge">{rows.length}</span></div>
        {rows.length === 0 ? <p className="empty-state">No deleted merchants</p> : <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[1200px] border-collapse text-left">
            <thead className="bg-slate-50"><tr className="text-xs font-semibold uppercase tracking-wide text-slate-500"><th className="px-3 py-3">Merchant ID</th><th className="px-3 py-3">Business Name</th><th className="px-3 py-3">Owner / Merchant Name</th><th className="px-3 py-3">Mobile</th><th className="px-3 py-3">Business Type</th><th className="px-3 py-3">Deleted On</th><th className="px-3 py-3">Deleted By</th><th className="px-3 py-3">Previous Status</th><th className="px-3 py-3">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-100 bg-white">{rows.map(({ business, deletedByName }) => <tr key={business.id} className="align-top hover:bg-slate-50/70">
              <td className="px-3 py-4 font-mono text-xs text-slate-600">{business.id}</td>
              <td className="px-3 py-4 font-semibold text-slate-900">{business.name}<span className="ml-2 rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-800">Deleted</span></td>
              <td className="px-3 py-4 text-sm text-slate-700">{business.owner || "—"}</td>
              <td className="px-3 py-4 text-sm text-slate-700">{business.phone || "—"}</td>
              <td className="px-3 py-4 text-sm text-slate-700">{business.type || "—"}</td>
              <td className="px-3 py-4 text-sm text-slate-700">{business.deleted_at ? new Date(business.deleted_at).toLocaleString("en-IN", { timeZone: "UTC" }) : "—"}</td>
              <td className="px-3 py-4 text-sm text-slate-700">{deletedByName}</td>
              <td className="px-3 py-4 text-sm text-slate-700"><span className="capitalize">{business.merchant_status || "pending"}</span> · {business.status || "—"}</td>
              <td className="px-3 py-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => openDialog({ business, deletedByName }, "restore")} className="rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-800 hover:bg-blue-50">Restore</button><button type="button" onClick={() => openDialog({ business, deletedByName }, "permanent")} className="rounded-lg border border-rose-300 px-3 py-2 text-xs font-semibold text-rose-800 hover:bg-rose-50">Delete Permanently</button></div></td>
            </tr>)}</tbody>
          </table>
        </div>}
      </section>

      {target && mode && <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4" role="presentation" onClick={() => { if (!pending) { setTarget(null); setMode(null); } }}>
        <section role="alertdialog" aria-modal="true" aria-labelledby="deleted-merchant-action-title" className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7" onClick={(event) => event.stopPropagation()}>
          <h2 id="deleted-merchant-action-title" className="text-xl font-bold text-slate-900">{mode === "restore" ? "Restore Merchant?" : "Delete Permanently?"}</h2>
          {mode === "restore" ? <p className="mt-3 text-sm leading-6 text-slate-600">Restore <strong>{target.business.name}</strong>? The existing account and associated data will remain unchanged.</p> : <><p className="mt-3 text-sm leading-6 text-rose-800">This will permanently delete this merchant and its associated merchant data. This action cannot be undone.</p><label className="mt-4 block text-sm font-medium text-slate-700">Type the merchant ID <span className="font-mono">{target.business.id}</span> to confirm.<input autoComplete="off" value={typedId} onChange={(event) => setTypedId(event.currentTarget.value)} className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2 font-mono" /></label></>}
          <div className="mt-6 flex justify-end gap-2"><button type="button" disabled={pending} onClick={() => { setTarget(null); setMode(null); }} className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Cancel</button><button type="button" disabled={pending || (mode === "permanent" && typedId !== target.business.id)} onClick={submit} className={`rounded-lg px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50 ${mode === "permanent" ? "bg-rose-700 hover:bg-rose-800" : "bg-blue-700 hover:bg-blue-800"}`}>{pending ? "Working…" : mode === "restore" ? "Restore Merchant" : "Delete Permanently"}</button></div>
        </section>
      </div>}
    </main>
  );
}
