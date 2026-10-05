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
    <main className="min-h-screen bg-[#fff8ed] font-sans text-slate-950">
      <div className="mx-auto min-h-screen max-w-[1500px] p-3 sm:p-5 lg:p-7">
        <div className="grid min-h-[calc(100vh-1.5rem)] overflow-hidden rounded-[2rem] bg-white shadow-[0_30px_90px_-35px_rgba(67,43,20,0.32)] ring-1 ring-orange-100 lg:grid-cols-[43%_57%]">
          <aside className="relative hidden overflow-hidden bg-[#24180f] text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute -left-28 -top-28 h-80 w-80 rounded-full bg-orange-500/25 blur-2xl" />
            <div className="absolute -bottom-24 -right-20 h-80 w-80 rounded-full bg-emerald-500/20 blur-2xl" />
            <div className="relative p-10 xl:p-12">
              <Link href="/trustit" className="inline-flex items-center gap-3">
                <Image src="/trustit-icon.svg" alt="" width={46} height={46} priority className="rounded-2xl bg-white p-1" />
                <span className="text-2xl font-black tracking-tight">Trustit</span>
              </Link>
              <div className="mt-20 max-w-lg">
                <span className="inline-flex rounded-full border border-orange-300/30 bg-orange-400/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.18em] text-orange-200">Merchant Registration</span>
                <h2 className="mt-6 text-5xl font-black leading-[1.05] tracking-tight xl:text-6xl">Turn every happy customer into a <span className="text-orange-400">Google Review.</span></h2>
                <p className="mt-6 max-w-md text-base leading-7 text-white/65">Create your business profile, choose your plan and get your Trustit QR ready for customers.</p>
              </div>
              <div className="mt-10 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="text-2xl font-black text-orange-400">01</div><div className="mt-1 text-xs font-semibold text-white/60">Easy setup</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="text-2xl font-black text-emerald-400">02</div><div className="mt-1 text-xs font-semibold text-white/60">Secure QR</div></div>
                <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4"><div className="text-2xl font-black text-violet-400">03</div><div className="mt-1 text-xs font-semibold text-white/60">Live dashboard</div></div>
              </div>
            </div>
            <div className="relative p-10 pt-0 xl:p-12 xl:pt-0">
              <div className="rounded-3xl border border-orange-300/20 bg-gradient-to-r from-orange-500/15 to-emerald-500/10 p-5">
                <p className="text-sm font-bold">Built for local businesses</p>
                <p className="mt-1 text-xs leading-5 text-white/55">Restaurants, salons, shops, clinics, hotels and more.</p>
              </div>
            </div>
          </aside>

          <section className="flex min-w-0 flex-col bg-[#fffdf9]">
            <header className="flex items-center justify-between border-b border-orange-100 px-5 py-4 sm:px-8 lg:px-10">
              <Link href="/trustit" className="inline-flex items-center gap-2 lg:hidden">
                <Image src="/trustit-icon.svg" alt="" width={38} height={38} priority className="rounded-xl" />
                <span className="text-xl font-black">Trustit</span>
              </Link>
              <div className="hidden lg:block">
                <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-600">Get started</p>
                <p className="mt-0.5 text-sm font-semibold text-slate-500">Your business journey starts here</p>
              </div>
              <Link href="/merchant/login" className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-extrabold text-slate-800 shadow-sm transition hover:border-orange-300 hover:text-orange-700">Business Login <span aria-hidden="true">→</span></Link>
            </header>

            <div className="border-b border-orange-100 bg-white px-5 py-4 sm:px-8 lg:px-10">
              <nav aria-label="Registration progress">
                <ol className="grid grid-cols-4 gap-2 sm:gap-4">
                  {steps.map((step, index) => {
                    const number = index + 1;
                    const active = number === currentStep;
                    const complete = number < currentStep;
                    return (
                      <li key={step} aria-current={active ? "step" : undefined} className="min-w-0">
                        <div className={`flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide sm:text-xs ${active ? "text-orange-700" : complete ? "text-emerald-700" : "text-slate-400"}`}>
                          <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[10px] ${active ? "bg-orange-500 text-white shadow-md shadow-orange-200" : complete ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{complete ? "✓" : number}</span>
                          <span className="truncate">{step}</span>
                        </div>
                        <div className={`mt-2 h-1.5 rounded-full ${active ? "bg-orange-500" : complete ? "bg-emerald-500" : "bg-slate-100"}`} />
                      </li>
                    );
                  })}
                </ol>
              </nav>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="mx-auto w-full max-w-2xl p-5 sm:p-8 lg:p-10 xl:p-12">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-600">Step {currentStep} of 4</p>
                  <h1 className="mt-3 text-3xl font-black leading-tight tracking-tight sm:text-4xl">{title}</h1>
                  <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">{description}</p>
                </div>
                {children}
              </div>
            </div>
          </section>
        </div>
      </div>
      <p className="mx-auto max-w-3xl px-5 pb-4 pt-2 text-center text-[11px] leading-5 text-slate-500">Your business and QR are activated only after payment verification. Payments are one-time; AutoPay is not enabled.</p>
    </main>
  );
}
