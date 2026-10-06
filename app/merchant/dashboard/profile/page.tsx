import Link from "next/link";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { getMerchantProfileCompletion } from "@/lib/merchant-profile-completion";
import { safeReviewLink } from "@/lib/safe-review-link";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";
import LocationCapture from "./location-capture";

export const dynamic = "force-dynamic";

export default async function MerchantProfilePage() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();
  const { data: location } = await supabase
    .from("businesses")
    .select("location_latitude, location_longitude, location_captured_at")
    .eq("id", merchant.businessId)
    .eq("merchant_status", "active")
    .is("deleted_at", null)
    .maybeSingle();
  const profile = {
    ...merchant,
    locationLatitude: typeof location?.location_latitude === "number" ? location.location_latitude : null,
    locationLongitude: typeof location?.location_longitude === "number" ? location.location_longitude : null,
    locationCapturedAt: typeof location?.location_captured_at === "string" ? location.location_captured_at : null,
  };
  const completion = getMerchantProfileCompletion(profile);
  const missing = completion.items.filter((item) => !item.complete).map((item) => item.label);
  const reviewLink = safeReviewLink(merchant.reviewLink);

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
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-800">PROFILE COMPLETION</p>
            <h2 id="profile-completion-title" className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950">{completion.score}% <span className="text-lg font-semibold text-slate-500">Complete</span></h2>
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
              {item.complete ? <span className="text-xs font-semibold text-emerald-800">Complete</span> : item.action === "capture-location" ? <a href="#business-location" className="min-h-8 inline-flex items-center rounded-lg bg-orange-100 px-3 text-xs font-bold text-orange-900 hover:bg-orange-200">Capture Location</a> : <Link href={item.action} className="min-h-8 inline-flex items-center rounded-lg bg-orange-100 px-3 text-xs font-bold text-orange-900 hover:bg-orange-200">Complete Profile</Link>}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-5 text-slate-500">Scoring rule: the six equally weighted core details shown above each contribute one sixth. A detail is complete only when its stored value is present and valid. Google Review Link is optional and does not change this score. A mobile number is shown as provided; this app does not store a separate phone-verification flag.</p>
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
          <LocationCapture latitude={profile.locationLatitude} longitude={profile.locationLongitude} capturedAt={profile.locationCapturedAt} />
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
