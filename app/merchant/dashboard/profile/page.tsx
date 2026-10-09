import Link from "next/link";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { getMerchantProfileCompletion } from "@/lib/merchant-profile-completion";
import { safeReviewLink } from "@/lib/safe-review-link";
import { hasUsableCoordinates, isPublicDiscoveryLocationComplete } from "@/lib/business-location";

export const dynamic = "force-dynamic";

export default async function MerchantProfilePage() {
  const merchant = await requireActiveMerchant();
  const completion = getMerchantProfileCompletion(merchant);
  const missing = completion.items.filter((item) => !item.complete).map((item) => item.label);
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
  const publicLocationItems = [
    { label: "City", complete: Boolean(merchant.city?.trim()) },
    { label: "State", complete: Boolean(merchant.state?.trim()) },
    { label: "Six-digit Pincode", complete: Boolean(merchant.pincode && /^\d{6}$/.test(merchant.pincode)) },
    { label: "Merchant confirmation and valid business type", complete: discoveryComplete },
  ];
  const hasCoordinates = hasUsableCoordinates({ latitude: merchant.locationLatitude, longitude: merchant.locationLongitude });

  return (
    <div className="grid min-w-0 gap-5 sm:gap-6">
      <header className="merchant-page-heading">
        <div>
          <p className="merchant-page-heading__eyebrow">Your account</p>
          <h1>Merchant Profile</h1>
          <p>See what is complete and update your business details.</p>
        </div>
        <Link href="/merchant/dashboard/business" className="inline-flex min-h-11 shrink-0 items-center rounded-xl bg-[#a64c05] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#873d03]">Edit Business Details</Link>
      </header>

      <section aria-labelledby="profile-completion-title" className="min-w-0 rounded-3xl border border-[#eee2d1] bg-white p-5 shadow-[0_8px_22px_rgba(89,62,30,0.05)] sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-800">CORE PROFILE COMPLETION</p>
            <h2 id="profile-completion-title" className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">Core Profile: {completion.score}% <span className="text-lg font-semibold text-slate-500">Complete</span></h2>
          </div>
          <p className="text-sm font-semibold text-slate-600">{completion.completedCount} of {completion.totalCount} core details complete</p>
        </div>
        <div role="progressbar" aria-label="Profile completion" aria-valuemin={0} aria-valuemax={100} aria-valuenow={completion.score} className="mt-4 h-3 overflow-hidden rounded-full bg-orange-100">
          <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-[width]" style={{ width: `${completion.score}%` }} />
        </div>
        {missing.length ? <p className="mt-3 text-sm text-slate-600">To reach 100%, complete: <strong className="text-slate-900">{missing.join(", ")}</strong>.</p> : <p className="mt-3 text-sm font-medium text-emerald-800">Your core merchant profile is complete.</p>}

        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {completion.items.map((item) => (
            <li key={item.id} className="flex min-w-0 flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-[#fffdfa] px-3.5 py-3">
              <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-slate-800"><span aria-hidden="true" className={item.complete ? "text-emerald-700" : "text-rose-700"}>{item.complete ? "✓" : "✕"}</span>{item.label}</span>
              {item.complete ? <span className="text-xs font-semibold text-emerald-800">Complete</span> : item.action === "capture-location" ? <Link href="/merchant/dashboard/business#public-discovery-location" className="min-h-8 inline-flex items-center rounded-lg bg-orange-100 px-3 text-xs font-bold text-orange-900 hover:bg-orange-200">Capture Location</Link> : <Link href={item.action} className="min-h-8 inline-flex items-center rounded-lg bg-orange-100 px-3 text-xs font-bold text-orange-900 hover:bg-orange-200">Complete Profile</Link>}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-slate-500">Scoring rule: the six equally weighted core details shown above each contribute one sixth. A detail is complete only when its stored value is present and valid. Google Review Link is optional and does not change this score. A mobile number is shown as provided; this app does not store a separate phone-verification flag.</p>
      </section>

      <section aria-labelledby="public-location-completion-title" className="min-w-0 rounded-3xl border border-orange-200 bg-white p-5 shadow-[0_8px_22px_rgba(89,62,30,0.05)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Trustit Local Search</p><h2 id="public-location-completion-title" className="mt-1 text-lg font-bold text-slate-950">Public Discovery Location</h2></div>
          <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${discoveryComplete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{discoveryComplete ? "Complete" : "Needs completion"}</span>
        </div>
        <p className="mt-2 text-sm text-slate-600">The six-item Profile Completion score above measures your core merchant details. Discovery has its own status and needs a valid category, city, state, six-digit pincode, and your confirmation.</p>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">{publicLocationItems.map((item) => <li key={item.label} className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-[#fffdfa] px-3.5 py-3 text-sm"><span>{item.label}</span><span className={item.complete ? "font-semibold text-emerald-800" : "font-semibold text-amber-800"}>{item.complete ? "Complete" : "Needs completion"}</span></li>)}</ul>
        {!discoveryComplete && <Link href="/merchant/dashboard/business#public-discovery-location" className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-orange-100 px-4 text-sm font-bold text-orange-900 hover:bg-orange-200">Complete Public Discovery Location</Link>}
      </section>

      <section className="grid min-w-0 gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-3xl border border-[#eee2d1] bg-white p-5 shadow-[0_8px_22px_rgba(89,62,30,0.05)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Business Address</p>
          <h2 className="mt-2 text-lg font-bold text-slate-950">Registered address</h2>
          <p className="mt-2 break-words text-sm leading-6 text-slate-700">{merchant.address?.trim() || "Not provided"}</p>
          <p className="mt-3 text-xs leading-5 text-slate-500">This address is the text saved in your business record. It is not used as a GPS location.</p>
          <Link href="/merchant/dashboard/business" className="mt-4 inline-flex min-h-10 items-center font-semibold text-orange-900 hover:text-orange-700">Edit Business Address →</Link>
        </div>
        <div id="business-location" className="min-w-0 scroll-mt-5 rounded-3xl border border-[#eee2d1] bg-white p-5 shadow-[0_8px_22px_rgba(89,62,30,0.05)] sm:p-7">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Live Location</p>
          <h2 className="mt-2 text-lg font-bold text-slate-950">Device GPS status</h2>
          <p className="mt-2 text-sm font-semibold text-slate-800">{hasCoordinates ? "Captured" : "Not captured"}</p>
          {hasCoordinates && <p className="mt-1 break-words font-mono text-sm text-slate-700">{merchant.locationLatitude?.toFixed(6)}, {merchant.locationLongitude?.toFixed(6)}</p>}
          {merchant.locationCapturedAt && <p className="mt-1 text-xs text-slate-500">Captured {new Date(merchant.locationCapturedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p>}
          <p className="mt-2 text-xs leading-5 text-slate-500">Your saved GPS coordinates remain separate from the registered address and structured discovery location.</p>
          <Link href="/merchant/dashboard/business#public-discovery-location" className="mt-4 inline-flex min-h-10 items-center font-semibold text-orange-900 hover:text-orange-700">Manage Live Location →</Link>
        </div>
      </section>

      <section className="min-w-0 rounded-3xl border border-[#eee2d1] bg-white p-5 shadow-[0_8px_22px_rgba(89,62,30,0.05)] sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-violet-800">Optional</p><h2 className="mt-1 text-lg font-bold text-slate-950">Google Review Link</h2></div>
          {reviewLink ? <a href={reviewLink} target="_blank" rel="noreferrer" className="max-w-full break-all text-sm font-semibold text-blue-700 hover:text-blue-900">Open review link ↗</a> : <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">Not added · No score impact</span>}
        </div>
        <p className="mt-2 break-all text-sm text-slate-600">{reviewLink ?? "You can add this any time in My Business. It is not required for registration or profile completion."}</p>
      </section>
    </div>
  );
}
