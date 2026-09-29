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
    <main className="min-h-screen bg-[linear-gradient(145deg,#f5f8ff_0%,#ffffff_48%,#eff6ff_100%)] px-4 py-6 font-sans text-slate-900 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl">
        <header className="flex items-center justify-between gap-4">
          <Link href="/trustit" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-4" aria-label="Trustit home">
            <Image src="/trustit-icon.svg" alt="" width={36} height={36} priority className="rounded-xl" />
            <span className="text-lg font-bold tracking-tight text-slate-950">Trustit</span>
          </Link>
          <Link href="/merchant/login" className="rounded-lg px-2 py-2 text-sm font-semibold text-slate-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">Business Login</Link>
        </header>

        <section className="mt-6 rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-[0_24px_70px_-48px_rgba(15,23,42,0.35)] sm:mt-9 sm:p-9">
          <nav aria-label="Registration progress">
            <ol className="grid grid-cols-4 gap-2">
              {steps.map((step, index) => {
                const number = index + 1;
                const active = number === currentStep;
                const complete = number < currentStep;
                return <li key={step} aria-current={active ? "step" : undefined} className="min-w-0"><div className={`flex items-center gap-1.5 text-[11px] font-semibold sm:gap-2 sm:text-xs ${active ? "text-blue-800" : complete ? "text-emerald-700" : "text-slate-400"}`}><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[10px] ${active ? "bg-blue-700 text-white" : complete ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{complete ? "✓" : number}</span><span className="truncate">{step}</span></div><div className={`mt-2 h-1 rounded-full ${active ? "bg-blue-700" : complete ? "bg-emerald-500" : "bg-slate-100"}`} /></li>;
              })}
            </ol>
          </nav>
          <div className="mt-8 sm:mt-10"><p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-700">Step {currentStep} of 4</p><h1 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h1><p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">{description}</p></div>
          {children}
        </section>

        <p className="mt-5 text-center text-xs leading-5 text-slate-500">Your business and QR are activated only after payment verification. Payments are one-time; AutoPay is not enabled.</p>
      </div>
    </main>
  );
}
