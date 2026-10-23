"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { getMerchantNotifications } from "./actions";

type Notification = { id: string; title: string; preview: string; rating: number; review_id: string; is_read: boolean; created_at: string };
export default function NotificationPanel({ unread }: { unread: boolean }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unavailable, setUnavailable] = useState(false);
  const router = useRouter();
  async function show() { setOpen(true); setLoading(true); setUnavailable(false); try { setItems(await getMerchantNotifications()); router.refresh(); } catch { setUnavailable(true); } finally { setLoading(false); } }
  return <>
    <button type="button" onClick={show} aria-label="Open customer review notifications" title="Open customer review notifications" className="absolute left-[18px] top-[14px] z-10 grid size-3 place-items-center rounded-full">
      <span className="sr-only">Customer review notifications</span>
      {unread && <span aria-hidden="true" className="size-2 rounded-full bg-rose-500 ring-2 ring-white" />}
    </button>
    {open && <div className="fixed inset-0 z-[80]" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="merchant-notification-title" className="absolute right-3 top-3 max-h-[80vh] w-[min(25rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl sm:right-6 sm:top-6">
        <div className="flex items-center justify-between"><h2 id="merchant-notification-title" className="font-bold text-slate-900">Notifications</h2><button onClick={() => setOpen(false)} aria-label="Close notifications" className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100">×</button></div>
        {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading…</p> : unavailable ? <p role="alert" className="py-8 text-center text-sm text-rose-700">Notifications are temporarily unavailable.</p> : items.length ? <ul className="mt-3 divide-y divide-slate-100">{items.map((item) => <li key={item.id} className="py-3"><Link onClick={() => setOpen(false)} href={`/merchant/dashboard/reviews#review-${encodeURIComponent(item.review_id)}`} className="block rounded-xl p-2 hover:bg-amber-50"><strong className="text-sm text-slate-900">{item.title}</strong><p className="mt-1 text-xs font-semibold text-amber-600">{"★".repeat(item.rating)}{"☆".repeat(5-item.rating)}</p><p className="mt-1 line-clamp-2 text-sm text-slate-600">“{item.preview}”</p><time className="mt-2 block text-xs text-slate-400">{new Date(item.created_at).toLocaleString()}</time></Link></li>)}</ul> : <p className="py-8 text-center text-sm text-slate-500">No customer review notifications yet.</p>}
      </section>
    </div>}
  </>;
}
