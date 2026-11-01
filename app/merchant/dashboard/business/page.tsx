import { requireActiveMerchant } from "@/lib/merchant-auth";
import { safeReviewLink } from "@/lib/safe-review-link";
import Link from "next/link";
import BusinessProfileForm from "./business-profile-form";
import PublicLocationForm from "./public-location-form";
import { isPublicDiscoveryLocationComplete } from "@/lib/business-location";
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
    <div className="space-y-4">
      <header className="pb-0.5">
        <h1 className="text-xl font-bold text-slate-950 tracking-tight">Business Profile</h1>
        <a href="#public-discovery-location" className="sr-only" aria-hidden={discoveryComplete}>
          {discoveryComplete ? "Public discovery location complete" : "Complete public discovery location"}
        </a>
      </header>
      <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs sm:p-5">
        <BusinessProfileForm
          name={merchant.businessName}
          type={merchant.businessType}
          owner={merchant.ownerName}
          address={merchant.address}
          phone={merchant.registeredMobile}
          email={merchant.email}
          isMobileVerified={merchant.isMobileVerified}
          isEmailVerified={merchant.isEmailVerified}
          logoUrl={merchant.logoUrl}
          reviewLink={reviewLink}
          locality={merchant.locality}
          city={merchant.city}
          district={merchant.district}
          state={merchant.state}
          pincode={merchant.pincode}
          latitude={merchant.locationLatitude}
          longitude={merchant.locationLongitude}
          capturedAt={merchant.locationCapturedAt}
        />
      </section>
      <div className="hidden" aria-hidden="true">
        <GoogleReviewLinkForm initialLink={reviewLink ?? ""} />
      </div>
      <section className="rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs sm:p-5">
        <h2 className="mb-3 text-base font-bold text-slate-950">Account and Plan</h2>
        <dl className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <BusinessField label="Business ID" value={merchant.businessId} />
          <BusinessField label="Business Status" value={merchant.businessStatus} />
          <BusinessField label="Merchant Status" value={merchant.merchantStatus} />
          <BusinessField label="Registration Date" value={formattedDate(merchant.registrationDate)} />
          <BusinessField label="Current Plan" value={merchant.plan} />
          <BusinessField label="Expiry Date" value={formattedDate(merchant.expiry)} />
        </dl>
        <Link href="/merchant/dashboard/profile" className="mt-4 inline-flex min-h-9 items-center rounded-lg border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-semibold text-orange-900 hover:bg-orange-100 transition">View Profile Completion and Location →</Link>
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
    </div>
  );
}
