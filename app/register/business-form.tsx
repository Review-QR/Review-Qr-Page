"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveTrustitBusiness } from "./actions";

const cls = "mt-1 w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";
export default function BusinessForm() {
  const router = useRouter();
  const [busy,setBusy] = useState(false); const [message,setMessage] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage("");
    const form = new FormData(event.currentTarget);
    try {
      const result = await saveTrustitBusiness({ name:String(form.get("name")??""), type:String(form.get("type")??""), address:String(form.get("address")??""), reviewLink:String(form.get("reviewLink")??"") });
      if (!result.success) { setMessage(result.message); return; }
      router.push("/register/plan"); router.refresh();
    } catch {
      setMessage("We could not save these details just now. Please try again.");
    } finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-7 space-y-4"><label className="block text-sm font-medium">Business Name<input className={cls} name="name" maxLength={160} required /></label><label className="block text-sm font-medium">Business Type<select className={cls} name="type" required><option value="">Select type</option>{["Shop","Cafe/Restaurant","Salon","Clinic","Library","Hotel","Other"].map(x=><option key={x}>{x}</option>)}</select></label><label className="block text-sm font-medium">Address<input className={cls} name="address" maxLength={1000} required /></label><label className="block text-sm font-medium">Google Review Link<input className={cls} name="reviewLink" type="url" placeholder="https://…" maxLength={2048} required /><span className="mt-1 block text-xs font-normal text-slate-500">Apna Google Review link yahan paste karein. HTTPS links only.</span></label><button disabled={busy} className="w-full rounded-xl bg-blue-700 px-5 py-3.5 font-semibold text-white disabled:opacity-50">{busy?"Saving…":"Save and continue"}</button>{message&&<p role="alert" className="text-sm text-rose-700">{message}</p>}</form>;
}
