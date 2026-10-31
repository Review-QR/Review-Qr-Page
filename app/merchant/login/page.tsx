import Link from "next/link";
import Image from "next/image";
import MerchantLoginForm from "./merchant-login-form";
import { merchantSignOutAction } from "./actions";
import { getActiveMerchant } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

export default async function MerchantLoginPage() {
  const merchant = await getActiveMerchant();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef4ff_0%,transparent_35%),radial-gradient(circle_at_90%_12%,#f0fdf4_0%,transparent_30%),#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-between p-4 sm:p-6 lg:p-8">
        {/* Top Navbar */}
        <header className="flex flex-wrap items-center justify-between gap-4 py-2 border-b border-slate-200/60 pb-4">
          <Link href="/trustit" className="flex items-center gap-3 group">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white shadow-xs group-hover:scale-105 transition">
              <span className="text-xl font-black">T</span>
            </div>
            <div>
              <span className="block text-xl font-black tracking-tight text-slate-900 leading-none">
                TRUSTIT
              </span>
              <span className="block text-[11px] font-semibold text-slate-500 mt-1">
                Your Business Growth Partner
              </span>
            </div>
          </Link>

          {/* Top-Right Trust Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 shadow-2xs">
              <span className="text-blue-600">🛡️</span>
              <span>Safe & Secure</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 shadow-2xs">
              <span className="text-indigo-600">🎧</span>
              <span>24x7 Support</span>
            </div>
            <div className="flex items-center gap-1.5 rounded-full border border-slate-200/80 bg-white/80 px-3 py-1 shadow-2xs">
              <span className="text-emerald-600">🌐</span>
              <span>Made for Indian Businesses</span>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="my-auto grid items-start gap-8 py-8 lg:grid-cols-12 lg:gap-10">
          {/* Right Column: TRUSTIT Merchant Sign In Card (Mobile-First: Order-1 on Mobile, Order-2 on Desktop) */}
          <div className="order-1 lg:order-2 lg:col-span-5">
            <section className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)]">
              <div className="text-center">
                {/* QR Blue Logo */}
                <div
                  className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-xl font-black text-white shadow-md shadow-blue-200"
                  aria-hidden="true"
                >
                  QR
                </div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                  TRUSTIT
                </p>
                <h2 className="mt-1 text-2xl font-black text-slate-900 tracking-tight">
                  Merchant Sign In
                </h2>
                <p className="mt-1 text-xs text-slate-500 max-w-xs mx-auto">
                  Access your business dashboard and manage your services, orders, payments and more.
                </p>

                {merchant ? (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
                    <span className="inline-block text-3xl">✅</span>
                    <h3 className="mt-2 text-sm font-bold text-slate-900">
                      Signed in as {merchant.businessName}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Business ID: <span className="font-mono font-bold text-blue-700">{merchant.businessId}</span>
                    </p>
                    <div className="mt-5 space-y-2.5">
                      <Link
                        href="/merchant/dashboard"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-black text-white shadow-xs hover:bg-blue-700 transition"
                      >
                        <span>Open Merchant Dashboard</span>
                        <span>→</span>
                      </Link>
                      <form action={merchantSignOutAction}>
                        <button className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                          Sign Out of Merchant Hub
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <MerchantLoginForm />
                )}
              </div>
            </section>
          </div>

          {/* Left Column (Hero, Growth Graphic, 6 Feature Cards & Categories) (Order-2 on Mobile, Order-1 on Desktop) */}
          <div className="order-2 lg:order-1 space-y-6 lg:col-span-7">
            {/* Platform Pill Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/90 px-3.5 py-1 text-xs font-bold text-blue-800 shadow-2xs">
              <span className="text-sm">🛡️</span>
              <span>Trusted Business Platform</span>
            </div>

            {/* Headline and Hero Graphic Row */}
            <div className="grid items-center gap-6 md:grid-cols-12">
              <div className="space-y-2 md:col-span-7">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl leading-tight">
                  Your Business, <br />
                  <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 bg-clip-text text-transparent">
                    Our Digital Speed.
                  </span>
                </h1>
                <p className="text-base font-bold text-slate-800 sm:text-lg">
                  आपका बिज़नेस, हमारी डिजिटल रफ़्तार।
                </p>
                <p className="text-xs leading-relaxed text-slate-600 sm:text-sm pt-1">
                  Get more customers, manage your services, take payments and grow your business — all in one place.
                </p>
              </div>

              {/* Center Phone Mockup Illustration */}
              <div className="relative md:col-span-5 flex justify-center">
                {/* Aura Glow */}
                <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-blue-200/60 via-indigo-200/40 to-emerald-100/50 blur-xl" />

                {/* Smartphone Device Frame */}
                <div className="relative w-full max-w-[210px] rounded-3xl border-4 border-slate-900 bg-slate-900 p-2 shadow-2xl">
                  {/* Phone Screen */}
                  <div className="rounded-2xl bg-white p-3 text-slate-900">
                    <div className="text-[10px] font-bold text-slate-500">Business Growth</div>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-xl font-black text-slate-950">+62%</span>
                      <span className="text-[10px] font-extrabold text-blue-600 flex items-center">
                        ▲ <span>+18%</span>
                      </span>
                    </div>

                    {/* Upward Chart Graphic */}
                    <div className="my-2 flex items-end gap-1.5 h-10 px-1 border-b border-slate-100 pb-1">
                      <span className="h-4 w-full rounded-xs bg-blue-100" />
                      <span className="h-6 w-full rounded-xs bg-blue-200" />
                      <span className="h-5 w-full rounded-xs bg-blue-300" />
                      <span className="h-8 w-full rounded-xs bg-blue-400" />
                      <span className="h-10 w-full rounded-xs bg-blue-600" />
                    </div>

                    {/* Mini Stats Cards */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between rounded-xl bg-orange-50/80 p-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="grid h-5 w-5 place-items-center rounded-md bg-orange-100 text-[10px]">🛒</span>
                          <div>
                            <span className="block font-bold text-slate-800 leading-none">Orders</span>
                            <span className="text-[9px] text-slate-500">128</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-orange-600">+18%</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-emerald-50/80 p-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="grid h-5 w-5 place-items-center rounded-md bg-emerald-100 text-[10px]">💳</span>
                          <div>
                            <span className="block font-bold text-slate-800 leading-none">Payments</span>
                            <span className="text-[9px] text-slate-500">₹24,580</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-emerald-600">+27%</span>
                      </div>

                      <div className="flex items-center justify-between rounded-xl bg-purple-50/80 p-1.5 text-[10px]">
                        <div className="flex items-center gap-1.5">
                          <span className="grid h-5 w-5 place-items-center rounded-md bg-purple-100 text-[10px]">👥</span>
                          <div>
                            <span className="block font-bold text-slate-800 leading-none">Customers</span>
                            <span className="text-[9px] text-slate-500">342</span>
                          </div>
                        </div>
                        <span className="font-extrabold text-purple-600">+40%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 6 Feature Grid Cards (2 columns x 3 rows) */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 pt-2">
              {/* Card 1 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-purple-200 hover:shadow-xs transition">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-purple-100 text-base text-purple-700">
                    👥
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Get New Customers</h3>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-slate-500">
                  Reach more people and build long-term relationships.
                </p>
              </div>

              {/* Card 2 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-emerald-200 hover:shadow-xs transition">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-emerald-100 text-base text-emerald-700">
                    🏪
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Manage Orders & Services</h3>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-slate-500">
                  Handle your bookings, orders and services easily.
                </p>
              </div>

              {/* Card 3 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-orange-200 hover:shadow-xs transition">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-orange-100 text-base text-orange-700">
                    💳
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Digital Payments</h3>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-slate-500">
                  Receive payments securely and manage transactions.
                </p>
              </div>

              {/* Card 4 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-rose-200 hover:shadow-xs transition">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-rose-100 text-base text-rose-700">
                    ⭐
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Customer Feedback & Reviews</h3>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-slate-500">
                  Build trust with genuine customer reviews.
                </p>
              </div>

              {/* Card 5 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-blue-200 hover:shadow-xs transition">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-blue-100 text-base text-blue-700">
                    📊
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Business Insights</h3>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-slate-500">
                  Understand your growth with simple reports.
                </p>
              </div>

              {/* Card 6 */}
              <div className="rounded-2xl border border-slate-200/90 bg-white p-3.5 shadow-2xs hover:border-teal-200 hover:shadow-xs transition">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-teal-100 text-base text-teal-700">
                    🚀
                  </span>
                  <h3 className="text-xs font-bold text-slate-900 leading-tight">Build Your Brand Online</h3>
                </div>
                <p className="mt-2 text-[11px] leading-snug text-slate-500">
                  Create a strong digital presence for your business.
                </p>
              </div>
            </div>

            {/* Horizontal Trust / Value Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white/90 px-4 py-3 text-xs font-bold text-slate-700 shadow-2xs">
              <div className="flex items-center gap-1.5">
                <span className="text-amber-500">⚡</span>
                <span>Easy to Use</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600">🛡️</span>
                <span>Safe & Secure</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-orange-500">👥</span>
                <span>Made for All Businesses</span>
              </div>
              <div className="hidden sm:block h-3 w-px bg-slate-200" />
              <div className="flex items-center gap-1.5">
                <span className="text-indigo-600">⚙️</span>
                <span>Dedicated Support</span>
              </div>
            </div>

            {/* Bottom Category Row */}
            <div className="pt-2">
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2 shadow-2xs hover:bg-white transition">
                  <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-orange-100 text-sm">🍴</div>
                  <span className="mt-1 block text-[10px] font-bold text-slate-800 leading-tight">Food & Beverage</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2 shadow-2xs hover:bg-white transition">
                  <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-rose-100 text-sm">🛍️</div>
                  <span className="mt-1 block text-[10px] font-bold text-slate-800 leading-tight">Retail & Lifestyle</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2 shadow-2xs hover:bg-white transition">
                  <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-sm">🚗</div>
                  <span className="mt-1 block text-[10px] font-bold text-slate-800 leading-tight">Automobile</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2 shadow-2xs hover:bg-white transition">
                  <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-pink-100 text-sm">💗</div>
                  <span className="mt-1 block text-[10px] font-bold text-slate-800 leading-tight">Health & Care</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2 shadow-2xs hover:bg-white transition">
                  <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-purple-100 text-sm">✂️</div>
                  <span className="mt-1 block text-[10px] font-bold text-slate-800 leading-tight">Beauty & Salon</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2 shadow-2xs hover:bg-white transition">
                  <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-emerald-100 text-sm">🔧</div>
                  <span className="mt-1 block text-[10px] font-bold text-slate-800 leading-tight">Home & Local</span>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/80 p-2 shadow-2xs hover:bg-white transition">
                  <div className="mx-auto grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-sm">💬</div>
                  <span className="mt-1 block text-[10px] font-bold text-slate-800 leading-tight">And Many More</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Trustit Review-QR Partner Network · Bahraich, Uttar Pradesh · Empowering Local Indian Businesses.
          </p>
        </footer>
      </div>
    </main>
  );
}
