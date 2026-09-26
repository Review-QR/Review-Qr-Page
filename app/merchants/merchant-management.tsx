"use client";

import Link from "next/link";
import { useActionState, useCallback, useEffect, useMemo, useState } from "react";
import LogoutButton from "@/app/logout-button";
import type { Business } from "@/lib/types";
import {
  provisionMerchantAction,
  resetMerchantPasswordAction,
  setMerchantAccountStatusAction,
  type MerchantAccessState,
} from "@/app/businesses/merchant-access-actions";

const INITIAL_ACTION_STATE: MerchantAccessState = { message: "", success: false };
const MERCHANT_STATUSES = ["all", "pending", "active", "suspended", "expired"] as const;
const PLANS = ["all", "basic", "standard", "premium"] as const;

type MerchantStatus = "active" | "suspended";

function normalized(value: string | null | undefined) {
  return String(value ?? "").trim().toLowerCase();
}

function isExpired(business: Business, today: string) {
  return (
    normalized(business.status) === "expired" ||
    Boolean(business.expiry && business.expiry < today)
  );
}

function merchantStatusClass(status: string) {
  switch (normalized(status)) {
    case "active":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "suspended":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    case "pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
}

function accountStateClass(provisioned: boolean) {
  return provisioned
    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
}

function PasswordActionForm({
  businessId,
  mode,
  onSuccess,
}: {
  businessId: string;
  mode: "activate" | "reset";
  onSuccess?: () => void;
}) {
  const action = mode === "activate" ? provisionMerchantAction : resetMerchantPasswordAction;
  const [password, setPassword] = useState("");
  const [state, formAction, pending] = useActionState(action, INITIAL_ACTION_STATE);

  useEffect(() => {
    if (!state.success) return;
    setPassword("");
    onSuccess?.();
  }, [state, onSuccess]);

  return (
    <form action={formAction} className="flex min-w-64 items-start gap-2">
      <input type="hidden" name="businessId" value={businessId} />
      <div className="min-w-0 flex-1">
        <label className="sr-only" htmlFor={`${mode}-${businessId}-password`}>
          {mode === "activate" ? "Initial merchant password" : "New merchant password"}
        </label>
        <input
          id={`${mode}-${businessId}-password`}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(event) => setPassword(event.currentTarget.value)}
          placeholder={mode === "activate" ? "Initial password" : "New password"}
          className="w-full rounded-lg border border-slate-300 px-2.5 py-2 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
        {state.message && (
          <p
            className={`mt-1 max-w-64 text-left text-xs ${state.success ? "text-emerald-700" : "text-rose-700"}`}
            role="status"
          >
            {state.message}
          </p>
        )}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-lg border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-wait disabled:opacity-60"
      >
        {pending ? "Saving…" : mode === "activate" ? "Activate" : "Reset"}
      </button>
    </form>
  );
}

function StatusActionForm({
  businessId,
  nextStatus,
  onSuccess,
}: {
  businessId: string;
  nextStatus: MerchantStatus;
  onSuccess: (status: MerchantStatus) => void;
}) {
  const [state, formAction, pending] = useActionState(
    setMerchantAccountStatusAction,
    INITIAL_ACTION_STATE
  );
  const handleSuccess = useCallback(() => onSuccess(nextStatus), [nextStatus, onSuccess]);

  useEffect(() => {
    if (state.success) handleSuccess();
  }, [state, handleSuccess]);

  return (
    <form action={formAction} className="flex flex-col items-start gap-1">
      <input type="hidden" name="businessId" value={businessId} />
      <input type="hidden" name="merchantStatus" value={nextStatus} />
      <button
        type="submit"
        disabled={pending}
        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-60 ${
          nextStatus === "suspended"
            ? "border-rose-200 text-rose-700 hover:bg-rose-50"
            : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
        }`}
      >
        {pending ? "Saving…" : nextStatus === "suspended" ? "Suspend" : "Activate"}
      </button>
      {state.message && !state.success && (
        <span className="max-w-48 text-left text-xs text-rose-700" role="status">
          {state.message}
        </span>
      )}
    </form>
  );
}

function DetailDialog({
  business,
  provisioned,
  onClose,
}: {
  business: Business;
  provisioned: boolean;
  onClose: () => void;
}) {
  const merchantStatus = business.merchant_status || "pending";
  const detailGroups = [
    {
      title: "Business",
      items: [
        ["Business ID", business.id],
        ["Business Name", business.name],
        ["Owner / Merchant Name", business.owner],
        ["Registered Mobile", business.phone],
        ["Business Type", business.type],
        ["Address", business.address],
        ["Google Review Link", business.review_link],
      ] as const,
    },
    {
      title: "Subscription",
      items: [
        ["Plan", business.plan],
        ["Expiry Date", business.expiry],
        ["Registration Date", business.registration_date],
        ["Business Status", business.status],
        ["QR Status", business.qr_status],
      ] as const,
    },
    {
      title: "Merchant Account",
      items: [
        ["Merchant Status", merchantStatus],
        ["Account State", provisioned ? "Provisioned" : "Not Provisioned"],
      ] as const,
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="merchant-details-title"
      tabIndex={-1}
      onClick={onClose}
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      <section
        className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="section-kicker">MERCHANT DETAILS</p>
            <h2 id="merchant-details-title" className="text-xl font-bold text-slate-900">
              {business.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
        </header>
        <div className="grid gap-5 md:grid-cols-2">
          {detailGroups.map((group) => (
            <section className="rounded-xl border border-slate-200 p-4" key={group.title}>
              <h3 className="mb-3 text-sm font-semibold text-slate-800">{group.title}</h3>
              <dl className="space-y-3">
                {group.items.map(([label, value]) => (
                  <div className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)]" key={label}>
                    <dt className="text-xs font-medium text-slate-500">{label}</dt>
                    <dd className="break-words text-sm text-slate-800">
                      {label === "Google Review Link" && value ? (
                        <a
                          href={value}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-700 underline underline-offset-2"
                        >
                          Open review link
                        </a>
                      ) : (
                        value || "—"
                      )}
                    </dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}

function MerchantActions({
  business,
  provisioned,
  onProvisioned,
  onStatusChange,
  onView,
}: {
  business: Business;
  provisioned: boolean;
  onProvisioned: (businessId: string) => void;
  onStatusChange: (businessId: string, status: MerchantStatus) => void;
  onView: () => void;
}) {
  const status = normalized(business.merchant_status || "pending");
  const canManage = provisioned && (status === "active" || status === "suspended");
  const handleProvisioned = useCallback(
    () => onProvisioned(business.id),
    [business.id, onProvisioned]
  );
  const handleStatusChange = useCallback(
    (nextStatus: MerchantStatus) => onStatusChange(business.id, nextStatus),
    [business.id, onStatusChange]
  );

  if (status === "pending" && !provisioned) {
    return (
      <PasswordActionForm
        businessId={business.id}
        mode="activate"
        onSuccess={handleProvisioned}
      />
    );
  }

  if (!canManage) {
    return <span className="text-xs text-amber-700">Account mapping needs review</span>;
  }

  return (
    <div className="flex min-w-64 flex-wrap items-start gap-2">
      <button
        type="button"
        onClick={onView}
        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        View
      </button>
      <PasswordActionForm
        businessId={business.id}
        mode="reset"
      />
      <StatusActionForm
        businessId={business.id}
        nextStatus={status === "active" ? "suspended" : "active"}
        onSuccess={handleStatusChange}
      />
    </div>
  );
}

export default function MerchantManagement({
  businesses,
  provisionedBusinessIds,
}: {
  businesses: Business[];
  provisionedBusinessIds: string[];
}) {
  const [rows, setRows] = useState(businesses);
  const [provisionedIds, setProvisionedIds] = useState(
    () => new Set(provisionedBusinessIds)
  );
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof MERCHANT_STATUSES)[number]>("all");
  const [planFilter, setPlanFilter] = useState<(typeof PLANS)[number]>("all");
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const filteredRows = useMemo(() => {
    const query = normalized(search);
    return rows.filter((business) => {
      const matchesSearch =
        !query ||
        [business.id, business.name, business.owner, business.phone].some((value) =>
          normalized(value).includes(query)
        );
      const expired = isExpired(business, today);
      const merchantStatus = normalized(business.merchant_status || "pending");
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "expired" ? expired : merchantStatus === statusFilter);
      const matchesPlan =
        planFilter === "all" || normalized(business.plan) === planFilter;
      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [rows, search, statusFilter, planFilter, today]);

  const markProvisioned = useCallback((businessId: string) => {
    setProvisionedIds((current) => new Set(current).add(businessId));
    setRows((current) =>
      current.map((business) =>
        business.id === businessId ? { ...business, merchant_status: "active" } : business
      )
    );
  }, []);

  const updateStatus = useCallback((businessId: string, status: MerchantStatus) => {
    setRows((current) =>
      current.map((business) =>
        business.id === businessId ? { ...business, merchant_status: status } : business
      )
    );
  }, []);

  const selectedProvisioned = selectedBusiness
    ? provisionedIds.has(selectedBusiness.id)
    : false;

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-brand">
          <div className="brand-mark" aria-hidden="true">QR</div>
          <div>
            <p className="brand-kicker">Review-QR · ADMIN</p>
            <h1>Merchant Management</h1>
            <p className="dashboard-subtitle">Manage merchant accounts and access</p>
          </div>
        </div>
        <div className="dashboard-header-actions flex-wrap">
          <Link
            href="/"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Dashboard
          </Link>
          <Link
            href="/businesses"
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Businesses
          </Link>
          <div className="logout-control"><LogoutButton /></div>
        </div>
      </header>

      <section className="dashboard-panel">
        <div className="section-heading">
          <div>
            <p className="section-kicker">MERCHANT ACCOUNTS</p>
            <h2>Businesses and merchant access</h2>
          </div>
          <span className="count-badge">{filteredRows.length} of {rows.length}</span>
        </div>

        <div className="mb-5 grid gap-3 md:grid-cols-[minmax(15rem,1fr)_12rem_12rem]">
          <label className="block">
            <span className="sr-only">Search merchants</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder="Search ID, business, owner, or mobile"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </label>
          <label className="block">
            <span className="sr-only">Filter merchant status</span>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.currentTarget.value as typeof statusFilter)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              {MERCHANT_STATUSES.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : status[0].toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="sr-only">Filter plan</span>
            <select
              value={planFilter}
              onChange={(event) => setPlanFilter(event.currentTarget.value as typeof planFilter)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-blue-500"
            >
              {PLANS.map((plan) => (
                <option key={plan} value={plan}>
                  {plan === "all" ? "All plans" : plan[0].toUpperCase() + plan.slice(1)}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filteredRows.length === 0 ? (
          <p className="empty-state" role="status">No merchants match these filters.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full min-w-[1500px] border-collapse text-left">
              <thead className="bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-3 py-3">Business</th>
                  <th className="px-3 py-3">Owner / Mobile</th>
                  <th className="px-3 py-3">Type</th>
                  <th className="px-3 py-3">Plan</th>
                  <th className="px-3 py-3">Expiry</th>
                  <th className="px-3 py-3">Merchant Status</th>
                  <th className="px-3 py-3">QR Status</th>
                  <th className="px-3 py-3">Registered</th>
                  <th className="px-3 py-3">Account</th>
                  <th className="px-3 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRows.map((business) => {
                  const provisioned = provisionedIds.has(business.id);
                  const merchantStatus = business.merchant_status || "pending";
                  return (
                    <tr key={business.id} className="align-top transition hover:bg-slate-50/70">
                      <td className="px-3 py-4">
                        <div className="font-semibold text-slate-800">{business.name}</div>
                        <div className="mt-1 font-mono text-xs text-slate-500">{business.id}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-700">
                        <div>{business.owner || "—"}</div>
                        <div className="mt-1 text-xs text-slate-500">{business.phone || "—"}</div>
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-700">{business.type || "—"}</td>
                      <td className="px-3 py-4">
                        <span className={`plan-tag plan-tag--${normalized(business.plan) || "default"}`}>
                          {business.plan || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">{business.expiry || "—"}</td>
                      <td className="px-3 py-4">
                        <span className={`status-pill ${merchantStatusClass(merchantStatus)}`}>
                          <span />{merchantStatus}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <span className={`status-pill ${normalized(business.qr_status) === "active" ? "status-pill--active" : "status-pill--expired"}`}>
                          <span />{business.qr_status || "inactive"}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-slate-600">{business.registration_date || "—"}</td>
                      <td className="px-3 py-4">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${accountStateClass(provisioned)}`}>
                          {provisioned ? "Provisioned" : "Not Provisioned"}
                        </span>
                      </td>
                      <td className="px-3 py-4">
                        <MerchantActions
                          business={business}
                          provisioned={provisioned}
                          onProvisioned={markProvisioned}
                          onStatusChange={updateStatus}
                          onView={() => setSelectedBusiness(business)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedBusiness && (
        <DetailDialog
          business={selectedBusiness}
          provisioned={selectedProvisioned}
          onClose={() => setSelectedBusiness(null)}
        />
      )}
    </main>
  );
}
