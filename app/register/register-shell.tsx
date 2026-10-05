import Image from "next/image";
import Link from "next/link";

const steps = ["Account", "Business", "Plan", "Payment"] as const;

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e8f0ff_0%,transparent_34%),radial-gradient(circle_at_90%_15%,#fff3dc_0%,transparent_28%),linear-gradient(145deg,#f7f9ff_0%,#ffffff_52%,#f5f7ff_100%)] px-4 py-5 font-sans text-slate-950 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between px-1">
          <Link href="/trustit" className="inline-flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-4" aria-label="Trustit home">
            <Image src="/trustit-icon.svg" alt="" width={42} height={42} priority className="rounded-xl shadow-sm" />
            <span>
              <span className="block text-xl font-extrabold tracking-tight">Trustit</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500 sm:block">Get More Google Reviews</span>
            </span>
          </Link>
          <Link href="/merchant/login" className="rounded-full bg-white/80 px-4 py-2 text-sm font-bold text-blue-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-white hover:ring-blue-200">
            Business Login <span aria-hidden="true">→</span>
          </Link>
        </header>

        <section className="mt-5 overflow-hidden rounded-[2rem] border border-white/80 bg-white/95 shadow-[0_30px_90px_-48px_rgba(15,23,42,0.45)] backdrop-blur sm:mt-7">
          <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/50 to-amber-50/50 px-5 py-5 sm:px-9 sm:py-6">
            <nav aria-label="Registration progress">
              <ol className="grid grid-cols-4 gap-2 sm:gap-4">
                {steps.map((step, index) => {
                  const number = index + 1;
                  const active = number === currentStep;
                  const complete = number < currentStep;
                  return (
                    <li key={step} aria-current={active ? "step" : undefined} className="min-w-0">
                      <div className={`flex items-center gap-2 text-[11px] font-bold sm:text-xs ${active ? "text-blue-800" : complete ? "text-emerald-700" : "text-slate-400"}`}>
                        <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] shadow-sm ${active ? "bg-blue-700 text-white" : complete ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{complete ? "✓" : number}</span>
                        <span className="truncate">{step}</span>
                      </div>
                      <div className={`mt-2 h-1.5 rounded-full ${active ? "bg-blue-700" : complete ? "bg-emerald-500" : "bg-slate-100"}`} />
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1fr)_290px]">
            <div className="p-5 sm:p-8 lg:p-10">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-blue-700">Step {currentStep} of 4</p>
                <h1 className="mt-2 max-w-2xl text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">{description}</p>
              </div>
              {children}
            </div>

            <aside className="hidden border-l border-slate-100 bg-gradient-to-b from-amber-50 via-white to-blue-50 p-7 lg:block">
              <div className="flex h-full flex-col justify-between">
                <div>
                  <div className="mx-auto grid h-40 w-full place-items-center rounded-[2rem] bg-gradient-to-br from-blue-100 via-white to-amber-100 shadow-inner">
                    <div className="relative">
                      <div className="h-24 w-32 rounded-t-[2rem] rounded-b-xl bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg" />
                      <div className="absolute left-3 top-7 h-9 w-9 rounded-lg bg-white/90 shadow" />
                      <div className="absolute right-3 top-7 h-9 w-9 rounded-lg bg-white/90 shadow" />
                      <div className="absolute -bottom-3 left-7 h-7 w-7 rounded-full border-4 border-slate-700 bg-slate-200" />
                      <div className="absolute -bottom-3 right-7 h-7 w-7 rounded-full border-4 border-slate-700 bg-slate-200" />
                      <div className="absolute -right-7 -top-4 grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-lg ring-1 ring-slate-100">⭐</div>
                    </div>
                  </div>
                  <h2 className="mt-6 text-xl font-extrabold">Grow your business with Trustit</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-600">Simple setup, secure payment and a QR that helps customers share genuine feedback.</p>
                  <ul className="mt-5 space-y-3 text-sm font-semibold text-slate-700">
                    <li className="flex gap-2"><span className="text-emerald-500">✓</span> Easy &amp; secure setup</li>
                    <li className="flex gap-2"><span className="text-emerald-500">✓</span> Activate after payment</li>
                    <li className="flex gap-2"><span className="text-emerald-500">✓</span> Merchant dashboard included</li>
                  </ul>
                </div>
                <div className="mt-8 rounded-2xl border border-rose-100 bg-rose-50 p-4 text-xs leading-5 text-rose-900">
                  <strong>Trusted by local businesses.</strong>
                  <br />Start collecting better customer feedback today.
                </div>
              </div>
            </aside>
          </div>
        </section>

        <p className="mx-auto mt-4 max-w-3xl text-center text-xs leading-5 text-slate-500">Your business and QR are activated only after payment verification. Payments are one-time; AutoPay is not enabled.</p>
      </div>
    </main>
  );
}
