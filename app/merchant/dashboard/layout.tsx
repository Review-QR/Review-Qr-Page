import Link from "next/link";
import { merchantSignOutAction } from "@/app/merchant/login/actions";
import { requireActiveMerchant } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

const navigation = [
  { href: "/merchant/dashboard", label: "Dashboard" },
  { href: "/merchant/dashboard/business", label: "My Business" },
  { href: "/merchant/dashboard/qr", label: "My QR Code" },
  { href: "/merchant/dashboard/reviews", label: "Customer Reviews" },
  { href: "/merchant/dashboard#scan-analytics", label: "Analytics" },
  { href: "/merchant/dashboard/subscription", label: "Subscription" },
  { href: "/merchant/dashboard/payments", label: "Payments" },
];

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return (
    <nav aria-label="Merchant navigation" className={mobile ? "flex gap-2 overflow-x-auto pb-1" : "space-y-1"}>
      {navigation.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={mobile
            ? "shrink-0 rounded-xl border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:border-orange-200 hover:text-orange-700"
            : `block rounded-xl px-3 py-3 text-sm font-medium ${item.href.includes("/qr") ? "bg-[#ffe7b8] text-orange-900" : "text-slate-700 hover:bg-orange-50 hover:text-orange-800"}`}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

export default async function MerchantDashboardLayout({ children }: { children: React.ReactNode }) {
  const merchant = await requireActiveMerchant();

  return (
    <div className="min-h-screen bg-[#fff8ed] text-slate-900 lg:flex">
      <aside className="hidden w-64 shrink-0 border-r border-orange-100 bg-[#fffdf8] p-5 lg:flex lg:flex-col">
        <Link href="/merchant/dashboard" className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-slate-950"><span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-xl text-emerald-700">◈</span>Trustit</Link>
        <p className="mt-1 text-sm text-slate-500">Merchant Portal</p>

        <div className="mt-7 rounded-2xl border border-orange-100 bg-[#fff7e8] p-4 shadow-sm">
          <p className="truncate font-semibold text-slate-900">{merchant.businessName}</p>
          <p className="mt-1 break-all font-mono text-xs text-slate-500">{merchant.businessId}</p>
          <span className="mt-3 inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800">Active Merchant</span>
        </div>

        <div className="mt-7"><NavigationLinks /></div>
        <form action={merchantSignOutAction} className="mt-auto pt-8">
          <button type="submit" className="w-full rounded-xl border border-orange-100 bg-white px-3 py-2.5 text-left text-sm font-semibold text-slate-600 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700">Log out</button>
        </form>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b border-orange-100 bg-[#fffdf8] px-4 py-4 sm:px-6 lg:px-8 lg:border-b-0">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <Link href="/merchant/dashboard" className="text-lg font-bold text-blue-700 lg:hidden">Trustit</Link>
              <p className="mt-0.5 text-xs text-slate-500 lg:hidden">Merchant Portal</p>
              <p className="hidden text-sm font-medium text-slate-500 lg:block">Merchant Portal</p>
              <p className="mt-1 truncate text-sm font-semibold text-slate-800 lg:hidden">{merchant.businessName}</p>
              <p className="break-all font-mono text-[11px] text-slate-500 lg:hidden">{merchant.businessId}</p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-semibold text-emerald-800">Active Merchant</span>
            <form action={merchantSignOutAction} className="lg:hidden">
              <button type="submit" className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600">Log out</button>
            </form>
          </div>
          <div className="mt-3 lg:hidden"><NavigationLinks mobile /></div>
        </header>
        <main className="mx-auto w-full max-w-[1500px] p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
