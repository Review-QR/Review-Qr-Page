import { merchantSignOutAction } from "@/app/merchant/login/actions";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { appConfig } from "@/lib/config";
import MyQrCode from "./my-qr-code";

export const dynamic = "force-dynamic";

function merchantStatusClass(status: string) {
  switch (status.trim().toLowerCase()) {
    case "active":
      return "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200";
    case "pending":
      return "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
    case "suspended":
      return "bg-rose-50 text-rose-700 ring-1 ring-rose-200";
    default:
      return "bg-slate-100 text-slate-600 ring-1 ring-slate-200";
  }
}

function businessStatusClass(status: string) {
  switch (status.trim().toLowerCase()) {
    case "active":
      return "status-pill--active";
    case "pending":
    case "expiring soon":
      return "status-pill--pending";
    case "expired":
    case "suspended":
      return "status-pill--expired";
    default:
      return "status-pill--pending";
  }
}

function matchingPlan(plan: string | null) {
  const normalizedPlan = plan?.trim().toLowerCase();
  return Object.values(appConfig.plans).find(
    (availablePlan) => availablePlan.name.toLowerCase() === normalizedPlan
  );
}

function expiryDayDifference(expiry: string | null) {
  if (!expiry || !/^\d{4}-\d{2}-\d{2}$/.test(expiry)) return null;

  const expiryTime = Date.parse(`${expiry}T00:00:00Z`);
  if (!Number.isFinite(expiryTime) || new Date(expiryTime).toISOString().slice(0, 10) !== expiry) {
    return null;
  }

  const today = new Date().toISOString().slice(0, 10);
  const todayTime = Date.parse(`${today}T00:00:00Z`);
  return Math.trunc((expiryTime - todayTime) / 86_400_000);
}

function daysLabel(days: number | null) {
  if (days === null) return "—";
  if (days === 0) return "Expires Today";
  if (days > 0) return `${days} Day${days === 1 ? "" : "s"} Remaining`;
  const elapsed = Math.abs(days);
  return `Expired ${elapsed} Day${elapsed === 1 ? "" : "s"} Ago`;
}

function subscriptionStatus(status: string | null, days: number | null) {
  const normalizedStatus = status?.trim().toLowerCase();
  if (normalizedStatus === "suspended") return "Suspended";
  if (normalizedStatus === "expired" || (days !== null && days < 0)) return "Expired";
  if (
    normalizedStatus === "expiring soon" ||
    (days !== null && days >= 0 && days <= appConfig.subscription.expiryWarningDays)
  ) {
    return "Expiring Soon";
  }
  if (normalizedStatus === "active") return "Active";
  return status?.trim() || "—";
}

function subscriptionStatusClass(status: string) {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-emerald-100 text-emerald-700";
    case "expiring soon":
      return "bg-amber-100 text-amber-700";
    case "expired":
    case "suspended":
      return "bg-rose-100 text-rose-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

function renewalStatus(days: number | null) {
  if (days === null) return "Not set";
  if (days < 0) return "Renewal required";
  if (days === 0) return "Due today";
  if (days <= appConfig.subscription.expiryWarningDays) return "Due soon";
  return "Not due";
}

function ProfileField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-800">
        {value?.trim() || "—"}
      </dd>
    </div>
  );
}

export default async function MerchantDashboardPage() {
  const merchant = await requireActiveMerchant();
  const ownerName = merchant.ownerName?.trim() || merchant.businessName;
  const businessStatus = merchant.businessStatus?.trim() || "—";
  const plan = matchingPlan(merchant.plan);
  const expiryDays = expiryDayDifference(merchant.expiry);
  const subscriptionState = subscriptionStatus(merchant.businessStatus, expiryDays);

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-xl font-bold text-white"
              aria-hidden="true"
            >
              QR
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
                Review-QR Merchant
              </p>
              <h1 className="mt-1 text-lg font-bold text-slate-900 sm:text-xl">
                {merchant.businessName}
              </h1>
              <p className="font-mono text-xs text-slate-500">
                Business ID: {merchant.businessId}
              </p>
            </div>
          </div>
          <form action={merchantSignOutAction}>
            <button
              type="submit"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 sm:w-auto"
            >
              Merchant Logout
            </button>
          </form>
        </header>

        <section className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-6 shadow-sm sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">MERCHANT DASHBOARD</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Welcome, {ownerName} 👋
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Manage your business from your Review-QR merchant dashboard.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${merchantStatusClass(merchant.merchantStatus)}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                Merchant: {merchant.merchantStatus}
              </span>
              <span className={`status-pill ${businessStatusClass(businessStatus)}`}>
                <span aria-hidden="true" />Business: {businessStatus}
              </span>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-blue-100 bg-white/80 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Business Name
              </p>
              <p className="mt-1 font-semibold text-slate-900">{merchant.businessName}</p>
            </div>
            <div className="rounded-xl border border-blue-100 bg-white/80 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Business ID
              </p>
              <p className="mt-1 font-mono font-semibold text-slate-900">{merchant.businessId}</p>
            </div>
          </div>
        </section>

        <MyQrCode
          businessId={merchant.businessId}
          businessName={merchant.businessName}
          qrStatus={merchant.qrStatus}
          expiry={merchant.expiry}
          reviewLink={merchant.reviewLink}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              MY SUBSCRIPTION
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">My Subscription</h2>
            <p className="mt-1 text-sm text-slate-500">
              Subscription details for your authenticated business.
            </p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileField label="Current Plan" value={plan?.name ?? merchant.plan} />
            <ProfileField
              label="Monthly Price"
              value={plan ? `₹${plan.price}/month` : null}
            />
            <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Subscription Status
              </dt>
              <dd className="mt-2">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${subscriptionStatusClass(subscriptionState)}`}>
                  {subscriptionState}
                </span>
              </dd>
            </div>
            <ProfileField label="Registration Date" value={merchant.registrationDate} />
            <ProfileField label="Expiry Date" value={merchant.expiry} />
            <ProfileField label="Days Remaining / Expired Duration" value={daysLabel(expiryDays)} />
            <ProfileField label="Renewal Status" value={renewalStatus(expiryDays)} />
          </dl>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">
              BUSINESS PROFILE
            </p>
            <h2 className="mt-1 text-lg font-bold text-slate-900">Your business information</h2>
            <p className="mt-1 text-sm text-slate-500">
              This profile is linked to your authenticated merchant account.
            </p>
          </div>
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <ProfileField label="Business Name" value={merchant.businessName} />
            <ProfileField label="Business ID" value={merchant.businessId} />
            <ProfileField label="Owner / Merchant Name" value={merchant.ownerName} />
            <ProfileField label="Registered Mobile" value={merchant.registeredMobile} />
            <ProfileField label="Business Type" value={merchant.businessType} />
            <ProfileField label="Address" value={merchant.address} />
            <ProfileField label="Business Status" value={businessStatus} />
          </dl>
        </section>
      </div>
    </main>
  );
}
