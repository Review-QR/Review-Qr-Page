import Image from "next/image";
import Link from "next/link";

const steps = ["Account", "Business", "Plan", "Payment"] as const;

function GrowthIllustration() {
  return (
    <div className="relative mx-auto mt-2 w-full max-w-[330px]">
      <div className="absolute -right-2 top-5 h-20 w-20 rounded-full bg-orange-100 blur-xl" />
      <div className="absolute -left-3 bottom-6 h-24 w-24 rounded-full bg-emerald-100 blur-xl" />
      <div className="relative rounded-[2rem] border border-orange-100 bg-gradient-to-br from-orange-50 via-white to-emerald-50 p-6 shadow-[0_20px_45px_-30px_rgba(15,23,42,.35)]">
        <div className="mx-auto h-36 w-52 rounded-[1.5rem] bg-gradient-to-b from-orange-400 to-orange-600 shadow-lg">
          <div className="flex h-10 items-center justify-center gap-2 rounded-t-[1.5rem] bg-orange-300/70">
            <span className="h-2.5 w-12 rounded-full bg-white/80" />
            <span className="h-2.5 w-7 rounded-full bg-white/60" />
          </div>
          <div className="grid grid-cols-3 gap-3 px-5 pt-7">
            <span className="h-10 rounded-lg bg-white/85 shadow-sm" />
            <span className="h-10 rounded-lg bg-emerald-100 shadow-sm" />
            <span className="h-10 rounded-lg bg-white/85 shadow-sm" />
          </div>
        </div>
        <div className="absolute bottom-12 left-5 grid h-20 w-20 rotate-[-8deg] place-items-center rounded-2xl border-4 border-white bg-white shadow-xl">
          <div className="grid h-14 w-14 grid-cols-5 gap-1 rounded-lg bg-slate-950 p-2">
            {Array.from({ length: 25 }).map((_, i) => <span key={i} className={`rounded-[1px] ${[0,2,4,6,8,12,14,16,18,20,22,24].includes(i) ? "bg-white" : "bg-slate-700"}`} />)}
          </div>
        </div>
        <div className="absolute -right-3 top-8 grid h-14 w-14 place-items-center rounded-2xl bg-white text-2xl shadow-xl ring-1 ring-slate-100">⭐</div>
        <div className="mt-8 flex items-center justify-between rounded-2xl border border-white bg-white/80 px-4 py-3 shadow-sm">
          <span className="text-xs font-bold text-slate-600">Google Reviews</span>
          <span className="text-sm font-black text-orange-500">★★★★★</span>
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
      <div className="mx-auto max-w-[1450px] px-3 py-4 sm:px-6 sm:py-6">
        <header className="flex items-center justify-between px-1 sm:px-2">
          <Link href="/trustit" className="inline-flex items-center gap-2.5">
            <Image src="/trustit-icon.svg" alt="" width={42} height={42} priority className="rounded-xl shadow-sm" />
            <span>
              <span className="block text-xl font-black tracking-tight">Trustit</span>
              <span className="block text-[9px] font-semibold text-slate-500">Get More Google Reviews</span>
            </span>
          </Link>
          <Link href="/merchant/login" className="rounded-full bg-white px-4 py-2.5 text-xs font-extrabold text-blue-700 shadow-sm ring-1 ring-slate-200 transition hover:ring-blue-200 sm:px-5 sm:text-sm">Business Login <span aria-hidden="true">→</span></Link>
        </header>

        <section className="mt-4 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-[0_30px_80px_-42px_rgba(15,23,42,.35)] sm:mt-6">
          <div className="border-b border-slate-100 bg-gradient-to-r from-white via-blue-50/50 to-white px-5 py-5 sm:px-8">
            <ol className="grid grid-cols-4 gap-2 sm:gap-4" aria-label="Registration progress">
              {steps.map((step, index) => {
                const n=index+1, active=n===currentStep, complete=n<currentStep;
                return <li key={step} className="min-w-0">
                  <div className={`flex items-center gap-2 text-[10px] font-extrabold sm:text-xs ${active?"text-blue-700":complete?"text-emerald-600":"text-slate-400"}`}>
                    <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] ${active?"bg-blue-600 text-white shadow-md shadow-blue-200":complete?"bg-emerald-100 text-emerald-700":"bg-slate-100 text-slate-500"}`}>{complete?"✓":n}</span>
                    <span className="truncate">{step}</span>
                  </div>
                  <div className={`mt-2 h-1.5 rounded-full ${active?"bg-blue-600":complete?"bg-emerald-500":"bg-slate-100"}`} />
                </li>
              })}
            </ol>
          </div>

          <div className="grid md:grid-cols-[minmax(0,1.55fr)_minmax(280px,.8fr)]">
            <div className="min-w-0 p-5 sm:p-8 lg:p-10">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-blue-700">Step {currentStep} of 4</p>
              <h1 className="mt-2 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p>
              {children}
            </div>
            <aside className="border-t border-slate-100 bg-gradient-to-br from-blue-50/80 via-white to-orange-50/70 p-5 sm:p-7 md:border-l md:border-t-0">
              <GrowthIllustration />
              <div className="mt-6 text-center md:text-left">
                <h2 className="text-xl font-black leading-tight">Turn Customer Feedback<br className="hidden lg:block" /> Into Business Growth</h2>
                <div className="mt-4 space-y-2.5 text-sm font-semibold text-slate-600">
                  <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> More Google Reviews</p>
                  <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Build Customer Trust</p>
                  <p className="flex items-center gap-2"><span className="text-emerald-500">✓</span> Grow Your Business</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-xs leading-5 text-rose-900">
                <strong>“Trusted by local businesses across India”</strong>
              </div>
            </aside>
          </div>
        </section>

        <p className="mx-auto mt-4 max-w-3xl px-4 text-center text-[11px] leading-5 text-slate-500">Your business and QR are activated only after payment verification. Payments are one-time; AutoPay is not enabled.</p>
      </div>
    </main>
  );
}
