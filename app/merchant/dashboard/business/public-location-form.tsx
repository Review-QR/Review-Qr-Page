"use client";

import { useActionState } from "react";
import { hasUsableCoordinates, isPublicDiscoveryLocationComplete } from "@/lib/business-location";
import { saveMerchantDiscoveryLocationAction, type PublicLocationActionState } from "./location-actions";
import LocationCapture from "../profile/location-capture";

const initialState: PublicLocationActionState = { ok: false, message: "" };
const inputClass = "mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

export default function PublicLocationForm({
  name, type, address, locality, city, district, state, pincode,
  verifiedAt, verificationSource, latitude, longitude, capturedAt,
}: {
  name: string; type: string | null; address: string | null;
  locality: string | null; city: string | null; district: string | null; state: string | null; pincode: string | null;
  verifiedAt: string | null; verificationSource: string | null; latitude: number | null; longitude: number | null; capturedAt: string | null;
}) {
  const [result, action, pending] = useActionState(saveMerchantDiscoveryLocationAction, initialState);
  const complete = isPublicDiscoveryLocationComplete({ type, locality, city, district, state, pincode, verifiedAt });
  const coordinates = hasUsableCoordinates({ latitude, longitude });
  return <section id="public-discovery-location" aria-labelledby="public-location-heading" className="scroll-mt-6 rounded-2xl border border-orange-200 bg-white p-5 shadow-sm sm:p-7">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-orange-800">Trustit Local Search</p><h2 id="public-location-heading" className="mt-1 text-lg font-bold text-slate-950">Public Discovery Location</h2><p className="mt-1 text-sm text-slate-600">Ye details Trustit par aapke business ko sahi city aur category mein dikhane ke liye use hongi.</p></div>
      <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${complete ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"}`}>{complete ? "✓ Complete" : "⚠ Incomplete"}</span>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 sm:col-span-2"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Business</p><p className="mt-1 text-sm font-semibold text-slate-900">{name} · {type || "Category not set"}</p><p className="mt-1 text-xs text-slate-600"><span className="font-semibold">Address:</span> {address?.trim() || "Not provided"}</p></div>
      <div className="rounded-xl border border-slate-100 px-4 py-3"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Latitude / Longitude</p><p className="mt-1 text-sm font-semibold text-slate-900">{coordinates ? `${latitude}, ${longitude}` : "Not captured · optional"}</p><p className="mt-1 text-xs text-slate-500">Coordinates improve directions and distance sorting but are not required for city listings.</p></div>
      <div className="rounded-xl border border-slate-100 px-4 py-3"><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Location confirmation</p><p className="mt-1 text-sm font-semibold text-slate-900">{verifiedAt ? verificationSource === "admin_reviewed" ? "Admin reviewed" : "Merchant confirmed" : "Not confirmed"}</p><p className="mt-1 text-xs text-slate-500">A complete location requires city, state, six-digit pincode, and a valid business category.</p></div>
    </div>
    <form action={action} className="mt-5 grid gap-4 sm:grid-cols-2">
      <p className="text-xs leading-5 text-slate-500 sm:col-span-2">Your registered address and GPS coordinates stay unchanged. Enter only location details you can confirm; we never infer them from your address.</p>
      <label className="text-sm font-semibold text-slate-800">Locality <span className="font-normal text-slate-500">(Optional)</span><input className={inputClass} name="locality" defaultValue={locality ?? ""} maxLength={160} autoComplete="address-level3" /></label>
      <label className="text-sm font-semibold text-slate-800">City <span className="text-rose-700">*</span><input className={inputClass} name="city" defaultValue={city ?? ""} maxLength={160} required autoComplete="address-level2" /></label>
      <label className="text-sm font-semibold text-slate-800">District <span className="font-normal text-slate-500">(Optional)</span><input className={inputClass} name="district" defaultValue={district ?? ""} maxLength={160} /></label>
      <label className="text-sm font-semibold text-slate-800">State <span className="text-rose-700">*</span><input className={inputClass} name="state" defaultValue={state ?? ""} maxLength={100} required autoComplete="address-level1" /></label>
      <label className="text-sm font-semibold text-slate-800">Pincode <span className="font-normal text-slate-500">(Optional while completing)</span><input className={inputClass} name="pincode" defaultValue={pincode ?? ""} maxLength={6} inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{6}" title="Leave blank or enter a 6-digit pincode" /></label>
      <p className="self-center text-xs leading-5 text-slate-500">A six-digit pincode is needed for a Complete status and public city listing. You may save confirmed city/state now and add the pincode later.</p>
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 sm:col-span-2"><LocationCapture latitude={latitude} longitude={longitude} capturedAt={capturedAt} /></div>
      <div className="flex flex-wrap items-center gap-3 sm:col-span-2"><button type="submit" disabled={pending} className="min-h-11 rounded-xl bg-[#a64c05] px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[#873d03] disabled:opacity-60">{pending ? "Saving…" : verifiedAt && verificationSource === "merchant_attested" ? "Save Location" : "Confirm Location"}</button>{result.message && <p role={result.ok ? "status" : "alert"} aria-live="polite" className={`text-sm ${result.ok ? "text-emerald-700" : "text-rose-700"}`}>{result.message}</p>}</div>
    </form>
  </section>;
}
