"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchableBusinessType from "@/app/components/searchable-business-type";
import { saveTrustitBusiness } from "./actions";

const cls = "mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-base shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-100";
export default function BusinessForm({ initialBusinessName = "" }: { initialBusinessName?: string }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [businessType, setBusinessType] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (initialBusinessName) return;
    setBusinessName(window.sessionStorage.getItem("trustit_business_name") ?? "");
  }, [initialBusinessName]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await saveTrustitBusiness({
        name: String(form.get("name") ?? ""),
        type: String(form.get("type") ?? ""),
        address: String(form.get("address") ?? ""),
        reviewLink: String(form.get("reviewLink") ?? ""),
      });
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      window.sessionStorage.removeItem("trustit_business_name");
      router.push("/register/plan");
      router.refresh();
    } catch {
      setMessage("We could not save these details just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-8 space-y-5">
      <label className="block text-sm font-semibold text-slate-800">
        Business Name
        <input className={cls} name="name" autoComplete="organization" maxLength={160} value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Business Type
        <SearchableBusinessType name="type" value={businessType} onChange={setBusinessType} inputClassName={cls} />
      </label>
      <div className="-mt-3 flex flex-wrap gap-2" aria-label="Popular business types">
        {["Restaurant", "Salon", "Cafe", "Hotel", "Shop"].map((type) => (
          <button key={type} type="button" onClick={() => setBusinessType(type)} className="rounded-full bg-blue-50 px-3 py-1 text-[11px] font-bold text-blue-700 transition hover:bg-blue-100">
            {type}
          </button>
        ))}
      </div>
      <label className="block text-sm font-semibold text-slate-800">
        Address
        <input className={cls} name="address" autoComplete="street-address" maxLength={1000} required />
      </label>
      <label className="block text-sm font-semibold text-slate-800">
        Google Review Link <span className="font-normal text-slate-500">(Optional)</span>
        <input className={cls} name="reviewLink" type="url" inputMode="url" placeholder="https://… (optional)" maxLength={2048} />
        <span className="mt-1.5 block text-xs font-normal leading-5 text-slate-500">Add your Google Review link if you have it. You can add or update it later.</span>
      </label>
      <button disabled={busy} className="min-h-12 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-[0_12px_24px_-14px_rgba(37,99,235,0.35)] transition hover:from-blue-700 hover:to-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50">
        {busy ? "Saving…" : "Save and continue"}
      </button>
      {message && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{message}</p>}
    </form>
  );
}
