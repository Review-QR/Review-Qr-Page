import { requireActiveMerchant } from "@/lib/merchant-auth";
import { safeGoogleReviewLink } from "@/lib/safe-review-link";
import GoogleReviewLinkForm from "./google-review-link-form";

export const dynamic = "force-dynamic";

function BusinessField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-slate-900">{value?.trim() || "—"}</dd>
    </div>
  );
}

function formattedDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime())
    ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeZone: "Asia/Kolkata" }).format(date)
    : value;
}

export default async function MerchantBusinessPage() {
  const merchant = await requireActiveMerchant();
  const reviewLink = safeGoogleReviewLink(merchant.reviewLink);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Business profile</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">My Business</h1>
        <p className="mt-2 text-sm text-slate-500">Your registered business details. Update your Google Review link below.</p>
      </header>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <BusinessField label="Business Name" value={merchant.businessName} />
          <BusinessField label="Business ID" value={merchant.businessId} />
          <BusinessField label="Owner / Merchant Name" value={merchant.ownerName} />
          <BusinessField label="Registered Mobile" value={merchant.registeredMobile} />
          <BusinessField label="Business Type" value={merchant.businessType} />
          <BusinessField label="Address" value={merchant.address} />
          <BusinessField label="Business Status" value={merchant.businessStatus} />
          <BusinessField label="Merchant Status" value={merchant.merchantStatus} />
          <BusinessField label="Registration Date" value={formattedDate(merchant.registrationDate)} />
          <BusinessField label="Current Plan" value={merchant.plan} />
          <BusinessField label="Expiry Date" value={formattedDate(merchant.expiry)} />
          <BusinessField label="Google Review Link" value={reviewLink} />
        </dl>
        {reviewLink ? (
          <a href={reviewLink} target="_blank" rel="noreferrer" className="mt-5 inline-flex rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
            Open Google Review
          </a>
        ) : (
          <p className="mt-5 text-sm text-slate-500">Google Review link is unavailable.</p>
        )}
        <GoogleReviewLinkForm initialLink={reviewLink ?? ""} />
      </section>
    </div>
  );
}
