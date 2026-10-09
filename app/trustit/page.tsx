import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { discoveryMetadata } from "@/lib/public-discovery-seo";

export const metadata: Metadata = {
  ...discoveryMetadata({
    title: "Trustit | QR reviews for your business",
    description: "Create a simple Trustit QR for your business, help customers reach your Google Review page, and manage scans from one business dashboard.",
    canonicalPath: "/trustit",
  }),
  robots: { index: true, follow: true },
};

const navigation = [
  ["Home", "#home"],
  ["How it works", "#how-it-works"],
  ["Features", "#features"],
  ["Analytics", "#analytics"],
  ["Pricing", "#pricing"],
  ["FAQ", "#faq"],
] as const;

const steps = [
  ["01", "Create your profile", "Add your business details and Google Review link."],
  ["02", "Get your Trustit QR", "Your business gets a QR that opens its review journey."],
  ["03", "Invite customers to scan", "Place the QR where customers can easily find it."],
  ["04", "Track scans and manage", "Use your dashboard to view scan activity and account details."],
] as const;

const features = [
  ["QR for your business", "A dedicated QR that takes customers to your Trustit review page."],
  ["Customer review journey", "Customers scan, see your business, then continue to your Google Review link."],
  ["QR scan tracking", "View the scan count associated with your business QR."],
  ["Business analytics", "See the scan activity available for your QR in the merchant dashboard."],
  ["Subscription management", "Review your plan and expiry, and choose a renewal when available."],
  ["Merchant dashboard", "Manage your business details and open your Trustit QR."],
  ["Payment history", "Review payment activity connected with your merchant account."],
] as const;

const plans = [
  ["Basic", "₹29", "A simple way to get started with your Trustit QR."],
  ["Standard", "₹49", "Keep your business QR and dashboard access active."],
  ["Premium", "₹99", "Choose the plan that fits your business."],
] as const;

const questions = [
  ["What is Trustit?", "Trustit gives your business a QR-led path to its Google Review page, with a dashboard for QR and account management."],
  ["How does the Trustit QR work?", "Customers scan the QR to open your Trustit page, where they can continue to your Google Review link."],
  ["How do I register my business?", "Create an account, add your business details and review link, choose a plan, then complete the one-time payment."],
  ["What happens after registration?", "After payment is verified, your business and QR are activated and you can open the merchant dashboard."],
  ["Can I access my dashboard and QR?", "Yes. Sign in with your merchant credentials to see your business QR, account details, subscription and payment history."],
  ["What plans are available?", "Basic is ₹29, Standard is ₹49 and Premium is ₹99 for 30 days of service."],
  ["How does payment and renewal work?", "Registration uses a one-time payment for the selected 30-day term. Renewal is a separate action; AutoPay is not enabled."],
  ["What happens if my subscription expires?", "The QR may become inactive when service expires. Sign in to review your subscription and available renewal options."],
] as const;

function Brand() {
  return (
    <Link href="/trustit" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-4" aria-label="Trustit home">
      <Image src="/trustit-icon.svg" alt="" width={38} height={38} priority className="rounded-xl" />
      <span className="text-xl font-bold tracking-tight text-slate-950">Trustit</span>
    </Link>
  );
}

function PrimaryLink({ href = "/register", children }: { href?: string; children: React.ReactNode }) {
  return <Link href={href} className="!text-white inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold shadow-sm transition hover:bg-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">{children}</Link>;
}

function SecondaryLink({ href = "/merchant/login", children }: { href?: string; children: React.ReactNode }) {
  return <Link href={href} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2">{children}</Link>;
}

function SectionHeading({ eyebrow, title, description, dark = false }: { eyebrow: string; title: string; description: string; dark?: boolean }) {
  return <div className="mx-auto max-w-2xl text-center"><p className={`text-xs font-bold uppercase tracking-[0.18em] ${dark ? "text-blue-200" : "text-blue-700"}`}>{eyebrow}</p><h2 className={`mt-3 text-3xl font-semibold tracking-tight sm:text-4xl ${dark ? "text-white" : "text-slate-950"}`}>{title}</h2><p className={`mt-4 text-base leading-7 ${dark ? "text-slate-300" : "text-slate-600"}`}>{description}</p></div>;
}

function ProductPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-label="Illustration of the Trustit QR review journey">
      <div className="absolute -left-4 top-10 h-28 w-28 rounded-full bg-sky-100 blur-2xl sm:-left-8" />
      <div className="absolute -right-2 bottom-5 h-32 w-32 rounded-full bg-blue-100 blur-2xl" />
      <div className="relative rounded-[2rem] border border-slate-200 bg-white p-4 shadow-[0_28px_80px_-35px_rgba(15,35,75,0.35)] sm:p-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3"><Image src="/trustit-icon.svg" alt="" width={34} height={34} className="rounded-xl" /><div><p className="text-sm font-semibold text-slate-900">Trustit QR journey</p><p className="text-xs text-slate-500">Product preview</p></div></div>
          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">Simple setup</span>
        </div>
        <div className="grid gap-3 py-5 sm:grid-cols-[1fr_auto_1fr_auto_1fr] sm:items-center">
          <div className="rounded-2xl bg-slate-50 p-4 text-center"><div className="mx-auto grid h-24 w-24 grid-cols-7 gap-1 rounded-xl bg-white p-2" aria-hidden="true">{Array.from({ length: 49 }, (_, index) => <span key={index} className={`rounded-[2px] ${[0,1,2,7,9,14,15,16,4,5,6,11,13,18,20,21,22,28,30,32,34,35,36,40,42,43,44,46,48].includes(index) ? "bg-slate-900" : "bg-slate-100"}`} />)}</div><p className="mt-3 text-sm font-semibold text-slate-900">Your business QR</p><p className="mt-1 text-xs text-slate-500">Ready to display</p></div>
          <span className="hidden text-xl text-blue-500 sm:block" aria-hidden="true">→</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-col sm:text-center"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 text-xl text-blue-800" aria-hidden="true">⌕</span><div><p className="text-sm font-semibold text-slate-900">Customer scans</p><p className="mt-1 text-xs leading-5 text-slate-500">The Trustit page opens</p></div></div>
          <span className="hidden text-xl text-blue-500 sm:block" aria-hidden="true">→</span>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-col sm:text-center"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-emerald-50 text-lg text-emerald-800" aria-hidden="true">↗</span><div><p className="text-sm font-semibold text-slate-900">Review link</p><p className="mt-1 text-xs leading-5 text-slate-500">Customer continues to Google</p></div></div>
        </div>
        <p className="rounded-xl bg-slate-50 px-4 py-3 text-center text-xs leading-5 text-slate-500">Illustrative product preview · no customer or review figures shown</p>
      </div>
    </div>
  );
}

export default function TrustitPage() {
  return (
    <main id="home" className="overflow-hidden bg-white font-sans text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <Brand />
          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">{navigation.map(([label, href]) => <a key={label} href={href} className="rounded py-2 text-sm font-medium text-slate-600 hover:text-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700">{label}</a>)}</nav>
          <div className="hidden items-center gap-3 sm:flex"><SecondaryLink>Business Login</SecondaryLink><PrimaryLink>Register Your Business</PrimaryLink></div>
          <details className="relative sm:hidden">
            <summary className="grid h-11 w-11 cursor-pointer list-none place-items-center rounded-xl border border-slate-300 text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700" aria-label="Open navigation"><span className="text-xl" aria-hidden="true">☰</span></summary>
            <div className="absolute right-0 top-14 z-40 w-[min(19rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
              <nav aria-label="Mobile navigation" className="grid">{navigation.map(([label, href]) => <a key={label} href={href} className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50">{label}</a>)}</nav>
              <div className="mt-2 grid gap-2 border-t border-slate-100 pt-3"><SecondaryLink>Business Login</SecondaryLink><PrimaryLink>Register Your Business</PrimaryLink></div>
            </div>
          </details>
        </div>
      </header>

      <section className="relative isolate border-b border-slate-100 bg-[linear-gradient(135deg,#f8fbff_0%,#ffffff_58%,#eff6ff_100%)]">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-24">
          <div><p className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-800 shadow-sm"><span className="h-2 w-2 rounded-full bg-blue-600" />QR-powered review journey</p><h1 className="mt-6 max-w-xl text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-5xl lg:text-[3.65rem]">Make it easier for customers to review your business.</h1><p className="mt-6 max-w-xl text-base leading-7 text-slate-600 sm:text-lg">Give customers one simple QR to find your business and continue to its Google Review page. Manage the QR and scan activity from your Trustit dashboard.</p><div className="mt-8 flex flex-col gap-3 min-[420px]:flex-row"><PrimaryLink>Register Your Business</PrimaryLink><SecondaryLink>Business Login</SecondaryLink></div><p className="mt-4 text-xs text-slate-500">Simple setup · One-time 30-day plans · No AutoPay</p></div>
          <ProductPreview />
        </div>
      </section>

      <section className="border-b border-slate-100 bg-white"><div className="mx-auto grid max-w-7xl gap-px px-4 py-7 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">{[["QR-powered", "A simple scan-to-review path"], ["Business focused", "A profile made for your business"], ["Scan insights", "See QR scan activity"], ["One dashboard", "QR, account and payment details"]].map(([title, text]) => <div key={title} className="flex items-start gap-3 px-4 py-4"><span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-50 text-sm font-bold text-blue-800" aria-hidden="true">✓</span><div><p className="text-sm font-semibold text-slate-900">{title}</p><p className="mt-1 text-sm text-slate-500">{text}</p></div></div>)}</div></section>

      <section id="how-it-works" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="How it works" title="From business details to a ready-to-use QR" description="A clear setup flow, with your business and QR activated only after payment verification." /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{steps.map(([number, title, text]) => <article key={number} className="relative rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_-26px_rgba(15,23,42,0.35)]"><span className="text-sm font-bold tracking-wide text-blue-700">{number}</span><h3 className="mt-5 text-lg font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></article>)}</div></div></section>

      <section id="features" className="scroll-mt-24 bg-slate-50 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Built for business owners" title="The essentials, in one place" description="A practical set of tools to connect your in-person customer experience with your online review page." /><div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{features.map(([title, text], index) => <article key={title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-blue-50 font-semibold text-blue-800" aria-hidden="true">0{index + 1}</span><div><h3 className="font-semibold text-slate-950">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{text}</p></div></article>)}</div></div></section>

      <section id="analytics" className="scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl items-center gap-10 lg:grid-cols-2 lg:gap-16"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Business overview</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Useful scan insight without the guesswork.</h2><p className="mt-4 max-w-xl text-base leading-7 text-slate-600">See the scan count for your Trustit QR and keep your business profile, subscription and payment history together in the merchant dashboard.</p><p className="mt-4 text-sm text-slate-500">The preview shows interface examples only. It contains no live business data or performance claims.</p></div><div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6"><div className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-wide text-slate-500">Example dashboard</p><h3 className="mt-1 font-semibold text-slate-950">Business overview</h3></div><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-800">Preview</span></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><div className="rounded-xl bg-slate-50 p-4"><p className="text-xs text-slate-500">QR scan activity</p><p className="mt-2 text-sm font-semibold text-slate-900">Scan count available</p><div className="mt-4 flex h-16 items-end gap-1.5" aria-hidden="true">{[24,38,30,52,43,62,47,70,56,76,60,84].map((height, i) => <span key={i} className="flex-1 rounded-t bg-blue-200" style={{ height: `${height}%` }} />)}</div><p className="mt-2 text-[11px] text-slate-500">Illustrative shape · not real activity</p></div><div className="grid gap-3"><div className="rounded-xl border border-slate-100 p-4"><p className="text-xs text-slate-500">Subscription</p><p className="mt-2 text-sm font-semibold text-slate-900">Plan and expiry details</p></div><div className="rounded-xl border border-slate-100 p-4"><p className="text-xs text-slate-500">Payments</p><p className="mt-2 text-sm font-semibold text-slate-900">Payment history</p></div></div></div></div></div></div></section>

      <section id="pricing" className="scroll-mt-24 bg-slate-950 px-4 py-20 text-white sm:px-6 lg:px-8 lg:py-24"><div className="mx-auto max-w-7xl"><SectionHeading eyebrow="Straightforward pricing" title="Choose a 30-day plan" description="Pay once for the selected term. Renew separately when you choose; automatic recurring billing is not enabled." dark /><div className="mt-12 grid gap-4 md:grid-cols-3">{plans.map(([name, price, description], index) => <article key={name} className={`rounded-2xl border p-6 ${index === 1 ? "border-blue-400 bg-blue-950/60 ring-1 ring-blue-400/40" : "border-slate-700 bg-slate-900/70"}`}><p className="text-sm font-semibold text-blue-200">{name}</p><p className="mt-4 text-4xl font-semibold tracking-tight">{price}<span className="ml-2 text-sm font-medium text-slate-300">/ 30 days</span></p><p className="mt-3 min-h-12 text-sm leading-6 text-slate-300">{description}</p><div className="mt-5 border-t border-slate-700 pt-5"><p className="text-sm text-slate-200">Trustit QR and merchant dashboard</p><p className="mt-2 text-sm text-slate-400">One-time payment · manual renewal</p></div><div className="mt-6"><PrimaryLink>Register Your Business</PrimaryLink></div></article>)}</div></div></section>

      <section className="px-4 py-20 sm:px-6 lg:px-8 lg:py-24"><div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">A thoughtful customer experience</p><h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Make the next step easy for your customers.</h2><p className="mt-4 text-base leading-7 text-slate-600">A visible QR helps customers find your review page when they are ready. Trustit supports an easy path; reviews remain honest and entirely the customer’s choice.</p><ul className="mt-7 space-y-4">{["One scan opens your business review journey", "Share the QR where it is useful in your business", "Manage your QR and account from one dashboard"].map(item => <li key={item} className="flex gap-3 text-sm leading-6 text-slate-700"><span className="mt-0.5 text-blue-700" aria-hidden="true">✓</span>{item}</li>)}</ul></div><div id="faq" className="scroll-mt-24"><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">FAQ</p><h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">Good to know</h2><div className="mt-5 divide-y divide-slate-200 border-y border-slate-200">{questions.map(([question, answer]) => <details key={question} className="group py-4"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700"><span>{question}</span><span className="text-lg text-blue-700 transition group-open:rotate-45" aria-hidden="true">+</span></summary><p className="max-w-prose pt-3 text-sm leading-6 text-slate-600">{answer}</p></details>)}</div></div></div></section>

        <section className="px-4 pb-20 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 rounded-[1.75rem] bg-blue-50 px-6 py-10 sm:px-10 sm:py-12 md:flex-row md:items-center md:justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Get started with Trustit</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Ready to create your business profile?</h2><p className="mt-2 text-sm text-slate-600">Set up your business, choose a plan and activate your QR after verified payment.</p></div><div className="flex flex-col gap-3 min-[420px]:flex-row"><PrimaryLink>Register Your Business</PrimaryLink><SecondaryLink>Business Login</SecondaryLink></div></div></section>

      <footer className="border-t border-slate-200 bg-white"><div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8"><div><Brand /><p className="mt-4 max-w-sm text-sm leading-6 text-slate-600">A simple QR-powered review journey and business dashboard.</p></div><div><h2 className="text-sm font-semibold text-slate-950">Explore</h2><nav aria-label="Footer navigation" className="mt-3 grid gap-2">{navigation.map(([label, href]) => <a key={label} href={href} className="w-fit text-sm text-slate-600 hover:text-blue-800">{label}</a>)}</nav></div><div><h2 className="text-sm font-semibold text-slate-950">Your account</h2><div className="mt-3 grid justify-items-start gap-2"><Link href="/register" className="text-sm text-slate-600 hover:text-blue-800">Register Your Business</Link><Link href="/merchant/login" className="text-sm text-slate-600 hover:text-blue-800">Business Login</Link></div></div></div><div className="border-t border-slate-100 py-4 text-center text-xs text-slate-500">Trustit</div></footer>
    </main>
  );
}
