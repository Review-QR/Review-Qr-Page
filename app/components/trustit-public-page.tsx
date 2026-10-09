import type { ReactNode } from "react";
import Link from "next/link";
import TrustitPublicFooter from "@/app/components/trustit-public-footer";

export function TrustitPublicPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  return <><main className="min-h-[70vh] bg-slate-50 px-4 py-10 text-slate-900 sm:px-6 sm:py-16"><div className="mx-auto max-w-4xl"><Link href="/trustit" className="text-sm font-bold text-blue-700">Trustit</Link><header className="mt-8 rounded-3xl bg-gradient-to-br from-blue-950 to-blue-700 px-6 py-9 text-white sm:px-10"><p className="text-xs font-semibold uppercase tracking-[.18em] text-blue-200">Trustit · Customer information</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1><p className="mt-4 max-w-2xl leading-7 text-blue-100">{intro}</p></header><article className="mt-6 space-y-5 rounded-3xl border border-slate-200 bg-white p-6 leading-7 text-slate-700 sm:p-10 [&_h2]:pt-2 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:leading-7 [&_h2]:text-slate-950 [&_li]:ml-5 [&_li]:list-disc [&_ul]:space-y-2 [&_a]:font-medium [&_a]:text-blue-700 [&_a]:underline [&_a]:underline-offset-2">{children}</article></div></main><TrustitPublicFooter /></>;
}
