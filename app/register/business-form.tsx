"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTrustitBusiness } from "./actions";

const cls = "mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
export default function BusinessForm({ initialBusinessName = "", businessType = "", onComplete }: { initialBusinessName?: string; businessType?: string; onComplete?: () => void }) {
  const router = useRouter();
  const [busy,setBusy] = useState(false); const [message,setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await saveTrustitBusiness({ name:initialBusinessName, type:businessType, address:String(form.get("address")??""), reviewLink:String(form.get("reviewLink")??"") });
      if (!result.success) { setMessage(result.message); return; }
      window.sessionStorage.removeItem("trustit_business_name"); window.sessionStorage.removeItem("trustit_business_type");
      if (onComplete) onComplete(); else { router.push("/register/plan"); router.refresh(); }
    } catch {
      setMessage("We could not save these details just now. Please try again.");
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-5"><label className="block text-sm font-semibold text-slate-800">Business Address<input className={cls} name="address" autoComplete="street-address" maxLength={1000} required /></label><label className="block text-sm font-semibold text-slate-800">Google Review Link <span className="font-normal text-slate-500">(optional)</span><input className={cls} name="reviewLink" type="url" inputMode="url" placeholder="https://…" maxLength={2048} /><span className="mt-1.5 block text-xs font-normal leading-5 text-slate-500">You can add or update this later. If provided, use an HTTPS Google Review link.</span></label><button disabled={busy} className="min-h-12 w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50">{busy?"Saving…":"Save and continue"}</button>{message&&<p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{message}</p>}</form>;
}
