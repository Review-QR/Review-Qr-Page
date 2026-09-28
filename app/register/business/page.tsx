import { redirect } from "next/navigation";
import Link from "next/link";
import BusinessForm from "../business-form";
import { getTrustitUser } from "@/lib/trustit-onboarding";
import { getTrustitResumeState } from "../actions";

export const dynamic = "force-dynamic";
export default async function RegisterBusinessPage() {
  if (!(await getTrustitUser())) redirect("/register");
  const resume = await getTrustitResumeState();
  if (!resume) redirect("/register");
  if (resume?.current_step === "plan") redirect("/register/plan");
  if (resume?.current_step === "payment") redirect("/register/payment");
  if (resume?.current_step === "complete") redirect("/merchant/dashboard");
  return <main className="min-h-screen bg-slate-50 px-4 py-10"><section className="mx-auto max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9"><Link href="/trustit" className="font-bold text-blue-700">Trustit</Link><p className="mt-6 text-xs font-semibold text-blue-700">2 of 4 · BUSINESS</p><h1 className="mt-2 text-2xl font-bold">Tell us about your business</h1><p className="mt-2 text-slate-600">Your QR stays inactive until payment is verified.</p><BusinessForm /></section></main>;
}
