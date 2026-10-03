"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { saveTrustitBusiness } from "./actions";
import SearchableBusinessType from "@/app/components/searchable-business-type";

const cls = "mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
export default function BusinessForm({ initialBusinessName = "" }: { initialBusinessName?: string }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initialBusinessName);\n  const [businessType, setBusinessType] = useState("");
  const [busy,setBusy] = useState(false); const [message,setMessage] = useState("");
  useEffect(() => {
    if (initialBusinessName) return;
    setBusinessName(window.sessionStorage.getItem("trustit_business_name") ?? "");
  }, [initialBusinessName]);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await saveTrustitBusiness({ name:String(form.get("name")??""), type:String(form.get("type")??""), address:String(form.get("address")??""), reviewLink:String(form.get("reviewLink")??"") });
      if (!result.success) { setMessage(result.message); return; }
      window.sessionStorage.removeItem("trustit_business_name");
      router.push("/register/plan"); router.refresh();
    } catch {
      setMessage("We could not save these details just now. Please try again.");
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-semibold text-slate-800">Business Name<input className={cls} name="name" autoComplete="organization" maxLength={160} value={businessName} onChange={event => setBusinessName(event.target.value)} required /></label><label className="block text-sm font-semibold text-slate-800">Business Type<SearchableBusinessType name="type" value={businessType} onChange={setBusinessType} /></label><label className="block text-sm font-semibold text-slate-800">Address<input className={cls} name="address" autoComplete="street-address" maxLength={1000} required /></label><label className="block text-sm font-semibold text-slate-800">Google Review Link <span className="font-normal text-slate-500">(Optional)</span><input className={cls} name="reviewLink" type="url" inputMode="url" placeholder="https://… (optional)" maxLength={2048} /><span className="mt-1.5 block text-xs font-normal leading-5 text-slate-500">Add your Google Review link if you have it. You can add or update it later.</span></label><button disabled={busy} className="min-h-12 w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50">{busy?"Saving…":"Save and continue"}</button>{message&&<p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{message}</p>}</form>;
}
