import { requireActiveMerchant } from "@/lib/merchant-auth";
import { safeReviewLink } from "@/lib/safe-review-link";
import Link from "next/link";
import BusinessProfileForm from "./business-profile-form";
import PublicLocationForm from "./public-location-form";
import { isPublicDiscoveryLocationComplete } from "@/lib/business-location";

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
  const reviewLink = safeReviewLink(merchant.reviewLink);
  const discoveryComplete = isPublicDiscoveryLocationComplete({
    type: merchant.businessType,
    locality: merchant.locality,
    city: merchant.city,
    district: merchant.district,
    state: merchant.state,
    pincode: merchant.pincode,
    verifiedAt: merchant.discoveryLocationVerifiedAt,
  });

  return (
    <div className="space-y-6">
      <header>
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">Business profile</p>
        <h1 className="mt-1 text-2xl font-bold text-slate-950">My Business</h1>
        <p className="mt-2 text-sm text-slate-500">Update your business details, public discovery location, and device GPS location here.</p>
      </header>
      <section aria-label="Public Discovery Location status" className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3 ${discoveryComplete ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}>
        <div><p className="text-xs font-bold uppercase tracking-wide text-slate-700">Public Discovery Location</p><p className={`mt-1 text-sm font-bold ${discoveryComplete ? "text-emerald-800" : "text-amber-900"}`}>{discoveryComplete ? "✓ Complete" : "Needs completion"}</p></div>
        <a href="#public-discovery-location" className="inline-flex min-h-10 items-center rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-800 hover:bg-slate-50">{discoveryComplete ? "View location details" : "Complete location ↓"}</a>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Business Information</h2>
        <BusinessProfileForm
          name={merchant.businessName}
          type={merchant.businessType}
          owner={merchant.ownerName}
          address={merchant.address}
          phone={merchant.registeredMobile}
          reviewLink={reviewLink}
        />
      </section>
      <PublicLocationForm
        name={merchant.businessName}
        type={merchant.businessType}
        address={merchant.address}
        locality={merchant.locality}
        city={merchant.city}
        district={merchant.district}
        state={merchant.state}
        pincode={merchant.pincode}
        verifiedAt={merchant.discoveryLocationVerifiedAt}
        verificationSource={merchant.discoveryLocationVerificationSource}
        latitude={merchant.locationLatitude}
        longitude={merchant.locationLongitude}
        capturedAt={merchant.locationCapturedAt}
      />
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="mb-4 text-lg font-bold text-slate-950">Account and Plan</h2>
        <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <BusinessField label="Business ID" value={merchant.businessId} />
          <BusinessField label="Business Status" value={merchant.businessStatus} />
          <BusinessField label="Merchant Status" value={merchant.merchantStatus} />
          <BusinessField label="Registration Date" value={formattedDate(merchant.registrationDate)} />
          <BusinessField label="Current Plan" value={merchant.plan} />
          <BusinessField label="Expiry Date" value={formattedDate(merchant.expiry)} />
        </dl>
        <Link href="/merchant/dashboard/profile" className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-orange-200 bg-orange-50 px-4 py-2.5 text-sm font-semibold text-orange-900 hover:bg-orange-100">View Profile Completion and Location →</Link>
      </section>
    </div>
  );
}
