"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { selectTrustitPlan } from "../actions";

const plans = [{id:"basic",name:"Basic",price:29},{id:"standard",name:"Standard",price:49},{id:"premium",name:"Premium",price:99}];
export default function PlanPicker({selected}:{selected:string|null}) {
  const router=useRouter(); const [plan,setPlan]=useState(selected?.toLowerCase()??""); const [busy,setBusy]=useState(false); const [message,setMessage]=useState("");
  async function submit(){ if(!plan)return;setBusy(true);setMessage("");try{const result=await selectTrustitPlan(plan);if(!result.success){setMessage(result.message);return;}router.push("/register/payment");router.refresh();}catch{setMessage("We could not save your plan just now. Please try again.");}finally{setBusy(false);} }
  return <><div className="mt-7 grid gap-3">{plans.map(p=><label key={p.id} className={`flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition focus-within:ring-2 focus-within:ring-blue-300 sm:p-5 ${plan===p.id?"border-blue-600 bg-blue-50 ring-1 ring-blue-200":"border-slate-200 hover:border-slate-300"}`}><span className="flex items-center gap-3"><input type="radio" name="plan" checked={plan===p.id} onChange={()=>setPlan(p.id)} className="h-4 w-4 accent-blue-700" /><span><strong className="block">{p.name}</strong><small className="text-slate-500">30 days of service · one-time payment</small></span></span><strong className="shrink-0">₹{p.price}</strong></label>)}</div><button onClick={()=>void submit()} disabled={!plan||busy} className="mt-6 min-h-12 w-full rounded-xl bg-blue-700 px-5 py-3.5 text-sm font-semibold text-white transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50">{busy?"Saving…":"Continue to payment"}</button>{message&&<p role="alert" className="mt-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{message}</p>}</>;
}
