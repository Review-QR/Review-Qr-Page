import Link from "next/link";
import { requireActiveMerchant } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

export default async function MerchantSupportPage() {
  const merchant = await requireActiveMerchant();

  const faqs = [
    {
      q: "How does T+0 / T+1 bank settlement work via Cashfree?",
      a: "Customer payments are collected securely in the Cashfree Nodal Escrow account and credited to your verified merchant bank account every business day.",
    },
    {
      q: "How do I update my store delivery geofence or timings?",
      a: "Go to Store Management (or Business Profile) to update your active operating hours, store radius, and GPS geofence.",
    },
    {
      q: "How do I print order KOT receipts or customer bills?",
      a: "From the Live Orders Console, click 'Print KOT' on any order. It supports 58mm and 80mm thermal receipt printers via standard web print.",
    },
    {
      q: "How are customer reviews verified on TRUSTIT?",
      a: "Only customers who scanned your unique in-store QR code or completed a verified delivery order can submit authentic reviews.",
    },
  ];

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 border-b border-[#eaedff]">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span>System</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-900">Support &amp; Help Desk</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Help Desk &amp; Operational Assistance
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            24x7 merchant operations support, ticketing desk, and direct assistance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:+919118643415"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            <span>Call +91 9118643415</span>
          </a>
        </div>
      </div>

      {/* Emergency & Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">call</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Priority Merchant Hotline</h3>
            <p className="text-xs text-slate-500 mt-0.5">Dedicated desk for store operators</p>
            <a href="tel:+919118643415" className="text-xs font-extrabold text-slate-900 hover:underline mt-2 block">
              +91 9118643415
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">chat</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">WhatsApp Business Desk</h3>
            <p className="text-xs text-slate-500 mt-0.5">Instant WhatsApp support for quick queries</p>
            <a
              href="https://wa.me/919118643415"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-extrabold text-emerald-700 hover:underline mt-2 inline-flex items-center gap-1"
            >
              <span>+91 9118643415</span>
              <span className="text-[10px]">↗</span>
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-slate-200 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-800 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">mail</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900">Email &amp; Grievance Desk</h3>
            <p className="text-xs text-slate-500 mt-0.5">Official support &amp; operational correspondence</p>
            <a
              href="mailto:luckyshukla9118@gmail.com"
              className="text-xs font-mono font-bold text-sky-900 hover:underline mt-2 block"
            >
              luckyshukla9118@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-2xl bg-white p-5 sm:p-7 border border-slate-200 shadow-xs">
        <h2 className="text-lg font-extrabold text-slate-900 mb-4">Frequently Asked Operational Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-slate-700">help_outline</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
