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
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#434652] uppercase tracking-wider">
            <span>System</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#003178]">Support &amp; Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#131b2e] tracking-tight">
            Help Desk &amp; Operational Assistance
          </h1>
          <p className="text-xs sm:text-sm text-[#434652]">
            24x7 merchant operations support, ticketing desk, and instant dispute resolution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="tel:18004198787"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#003178] hover:bg-[#0d47a1] text-white text-xs font-bold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">support_agent</span>
            <span>Call 1800-419-8787</span>
          </a>
        </div>
      </div>

      {/* Emergency & Direct Contact Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-[#eaedff] shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#eaedff] text-[#003178] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">call</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#131b2e]">Priority Merchant Hotline</h3>
            <p className="text-xs text-[#737783] mt-0.5">Toll-free dedicated desk for store operators</p>
            <a href="tel:18004198787" className="text-xs font-extrabold text-[#003178] hover:underline mt-2 block">
              1800-419-8787 (Toll-Free)
            </a>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#eaedff] shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e7f7ef] text-[#003d27] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">chat</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#131b2e]">WhatsApp Business Desk</h3>
            <p className="text-xs text-[#737783] mt-0.5">Instant WhatsApp support for quick queries</p>
            <span className="text-xs font-extrabold text-[#003d27] mt-2 block">+91 94150 00000</span>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#eaedff] shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#e0f9fc] text-[#006875] flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-[24px]">verified_user</span>
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#131b2e]">Ombudsman &amp; Grievance</h3>
            <p className="text-xs text-[#737783] mt-0.5">RBI &amp; DPDP compliance officer desk</p>
            <span className="text-xs font-mono text-[#006875] mt-2 block">support@trustitreview.com</span>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="rounded-2xl bg-white p-5 sm:p-7 border border-[#eaedff] shadow-xs">
        <h2 className="text-lg font-extrabold text-[#131b2e] mb-4">Frequently Asked Operational Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="p-4 rounded-xl bg-[#faf8ff] border border-[#eaedff]">
              <h4 className="text-xs sm:text-sm font-bold text-[#131b2e] flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] text-[#003178]">help_outline</span>
                <span>{faq.q}</span>
              </h4>
              <p className="text-xs text-[#434652] mt-1.5 leading-relaxed pl-6">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
