import Image from "next/image";
import Link from "next/link";

const steps = ["Account", "Business Address", "Plan", "Payment"] as const;

function ModernPhonePreview() {
  return (
    <div className="relative mx-auto w-full max-w-[220px]">
      {/* Ambient background glows */}
      <div className="absolute -right-4 top-6 h-24 w-24 rounded-full bg-blue-200/50 blur-2xl pointer-events-none" />
      <div className="absolute -left-4 bottom-8 h-24 w-24 rounded-full bg-indigo-200/40 blur-2xl pointer-events-none" />

      {/* Smartphone Device Frame */}
      <div className="relative w-full rounded-[2.2rem] border-[3px] border-slate-900 bg-slate-900 p-1.5 shadow-xl ring-1 ring-slate-900/10">
        {/* Dynamic Island / Speaker Pill */}
        <div className="mx-auto mb-1 h-3.5 w-16 rounded-full bg-slate-950 flex items-center justify-center">
          <span className="h-1.5 w-1.5 rounded-full bg-slate-800" />
        </div>

        {/* Screen */}
        <div className="rounded-[1.7rem] bg-white p-3 text-slate-900 shadow-inner">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Business Growth</span>
            <span className="rounded-full bg-blue-50 px-1.5 py-0.2 text-[8px] font-black text-blue-700">Live</span>
          </div>

          <div className="flex items-baseline justify-between mt-0.5">
            <span className="text-lg font-black tracking-tight text-slate-950">+62%</span>
            <span className="text-[10px] font-extrabold text-blue-600 flex items-center">
              ▲ <span>+18%</span>
            </span>
          </div>

          {/* Upward Chart Graphic */}
          <div className="my-2 flex items-end gap-1 h-8 px-1 border-b border-slate-100 pb-1">
            <span className="h-3 w-full rounded-xs bg-blue-100" />
            <span className="h-4.5 w-full rounded-xs bg-blue-200" />
            <span className="h-4 w-full rounded-xs bg-blue-300" />
            <span className="h-6 w-full rounded-xs bg-blue-400" />
            <span className="h-8 w-full rounded-xs bg-blue-600" />
          </div>

          {/* Mini Stats Cards */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between rounded-xl bg-orange-50/90 px-2 py-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="grid h-4.5 w-4.5 place-items-center rounded-md bg-orange-100 text-[10px]">🛒</span>
                <div>
                  <span className="block font-bold text-slate-800 leading-none text-[10px]">Orders</span>
                  <span className="text-[8px] text-slate-500">128</span>
                </div>
              </div>
              <span className="font-extrabold text-orange-600 text-[10px]">+18%</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-50/90 px-2 py-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="grid h-4.5 w-4.5 place-items-center rounded-md bg-emerald-100 text-[10px]">💳</span>
                <div>
                  <span className="block font-bold text-slate-800 leading-none text-[10px]">Payments</span>
                  <span className="text-[8px] text-slate-500">₹24,580</span>
                </div>
              </div>
              <span className="font-extrabold text-emerald-600 text-[10px]">+27%</span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-purple-50/90 px-2 py-1 text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="grid h-4.5 w-4.5 place-items-center rounded-md bg-purple-100 text-[10px]">👥</span>
                <div>
                  <span className="block font-bold text-slate-800 leading-none text-[10px]">Customers</span>
                  <span className="text-[8px] text-slate-500">342</span>
                </div>
              </div>
              <span className="font-extrabold text-purple-600 text-[10px]">+40%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterShell({
  currentStep,
  title,
  description,
  children,
}: {
  currentStep: number;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef4ff_0%,transparent_35%),radial-gradient(circle_at_92%_12%,#fff2d8_0%,transparent_30%),#f8fafc] font-sans text-slate-950">
      <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6 sm:py-5">
        {/* Top Header */}
        <header className="flex items-center justify-between px-1 py-1 sm:px-2">
          <Link href="/trustit" className="inline-flex items-center gap-2">
            <Image src="/trustit-icon.svg" alt="Trustit" width={36} height={36} priority className="rounded-xl shadow-xs" />
            <span>
              <span className="block text-lg font-black tracking-tight text-slate-900 leading-none">Trustit</span>
              <span className="block text-[9px] font-semibold text-slate-500">Your Business Growth Partner</span>
            </span>
          </Link>

          {/* Top Trust Badges */}
          <div className="hidden lg:flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <span className="text-blue-600">🛡️</span> Safe & Secure
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-600">🎧</span> 24x7 Support
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-orange-600">🇮🇳</span> Made for Indian Businesses
            </span>
          </div>

          <Link
            href="/merchant/login"
            className="rounded-full bg-white px-3.5 py-1.5 text-xs font-bold text-blue-700 shadow-2xs ring-1 ring-slate-200 transition hover:ring-blue-300 hover:bg-blue-50/50"
          >
            Business Login <span aria-hidden="true">→</span>
          </Link>
        </header>

        {/* Main Card Container */}
        <section className="mt-3 overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-[0_20px_60px_-30px_rgba(15,23,42,0.2)]">
          {/* Progress Header */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/40 to-white px-4 py-3 sm:px-6">
            <ol className="grid grid-cols-4 gap-2 sm:gap-4" aria-label="Registration progress">
              {steps.map((step, index) => {
                const n = index + 1;
                const active = n === currentStep;
                const complete = n < currentStep;
                return (
                  <li key={step} className="min-w-0">
                    <div
                      className={`flex items-center gap-1.5 text-[10px] sm:text-xs font-extrabold ${
                        active ? "text-blue-700" : complete ? "text-emerald-600" : "text-slate-400"
                      }`}
                    >
                      <span
                        className={`grid h-5 w-5 sm:h-6 sm:w-6 shrink-0 place-items-center rounded-full text-[10px] font-black ${
                          active
                            ? "bg-blue-600 text-white shadow-xs"
                            : complete
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {complete ? "✓" : n}
                      </span>
                      <span className="truncate">{step}</span>
                    </div>
                    <div
                      className={`mt-1.5 h-1 rounded-full transition-all ${
                        active ? "bg-blue-600" : complete ? "bg-emerald-500" : "bg-slate-100"
                      }`}
                    />
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Body Content Grid */}
          <div className="grid md:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.85fr)]">
            {/* Form Column */}
            <div className="min-w-0 p-4 sm:p-6 lg:p-7">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-700">
                <span>Step {currentStep} of 4</span>
              </div>
              <h1 className="mt-1.5 text-xl sm:text-2xl font-black tracking-tight text-slate-900 leading-tight">
                {title}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 leading-normal max-w-xl">
                {description}
              </p>
              {children}
            </div>

            {/* Right-Hand Growth & Trust Preview */}
            <aside className="border-t border-slate-100 bg-gradient-to-br from-blue-50/60 via-white to-indigo-50/40 p-4 sm:p-6 md:border-l md:border-t-0 flex flex-col justify-between">
              <div>
                <ModernPhonePreview />

                <div className="mt-4 text-center">
                  <h2 className="text-sm sm:text-base font-black text-slate-900 leading-snug">
                    Turn Local Trust Into Business Growth
                  </h2>
                  <p className="mt-0.5 text-[11px] text-slate-500">
                    आपका बिज़नेस, हमारी डिजिटल रफ़्तार
                  </p>

                  <div className="mt-3 space-y-2 text-left rounded-2xl bg-white/80 border border-slate-100 p-3 shadow-2xs">
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>🛵 25–35m Dedicated Rider Fleet</span>
                    </p>
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>⚡ Category-Tailored Tools (KOT / Parcha / Tokens)</span>
                    </p>
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>⭐ Genuine Google Reviews & Trust</span>
                    </p>
                    <p className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>🔔 Real-Time Sound & Order Alerts</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Verified Local Businesses Tag */}
              <div className="mt-4 rounded-xl border border-rose-100 bg-rose-50/80 px-3 py-2 text-center text-[11px] font-bold text-rose-800">
                “Empowering Bahraich’s verified local businesses”
              </div>
            </aside>
          </div>
        </section>

        <p className="mx-auto mt-3 max-w-2xl px-2 text-center text-[10px] text-slate-500">
          Your business and QR are activated only after payment verification. Payments are one-time; AutoPay is not enabled.
        </p>
      </div>
    </main>
  );
}