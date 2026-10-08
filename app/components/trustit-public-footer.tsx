import Image from "next/image";
import Link from "next/link";
import { trustitPolicyLinks, trustitPublicInfo } from "@/lib/trustit-public-info";

export default function TrustitPublicFooter() {
  return <footer className="border-t border-slate-200 bg-white text-slate-700">
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr] lg:px-8">
      <div><Link href="/trustit" className="inline-flex items-center gap-2 font-bold text-slate-950"><Image src="/trustit-icon.svg" alt="" width={32} height={32} className="rounded-lg" />Trustit</Link><p className="mt-3 max-w-sm text-sm leading-6">A QR-powered review journey and business dashboard.</p>{trustitPublicInfo.legalName && <p className="mt-3 text-xs">Operated by {trustitPublicInfo.legalName}</p>}</div>
      <div><h2 className="text-sm font-semibold text-slate-950">Information</h2><nav aria-label="Legal and business information" className="mt-3 grid justify-items-start gap-2">{trustitPolicyLinks.map((item) => <Link key={item.href} href={item.href} className="text-sm hover:text-blue-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-700">{item.label}</Link>)}</nav></div>
      <div><h2 className="text-sm font-semibold text-slate-950">Your account</h2><div className="mt-3 grid justify-items-start gap-2"><Link href="/register" className="text-sm hover:text-blue-800">Register Your Business</Link><Link href="/merchant/login" className="text-sm hover:text-blue-800">Business Login</Link><Link href="/trustit" className="text-sm hover:text-blue-800">Product overview</Link></div></div>
    </div><div className="border-t border-slate-100 px-4 py-4 text-center text-xs text-slate-500">Trustit</div>
  </footer>;
}
