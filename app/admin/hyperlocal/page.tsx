import Link from "next/link";
import LogoutButton from "@/app/logout-button";
import { requireActiveAdmin } from "@/lib/supabase-server";
import HyperlocalLiveAdminClient from "./hyperlocal-admin-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Hyperlocal Command Center & OTP Audit | Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminHyperlocalPage() {
  await requireActiveAdmin();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Admin Light Compact Top Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-5 py-2.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow-xs hover:bg-amber-400 transition"
          >
            ⚡
          </Link>
          <div>
            <div className="flex items-center gap-1.5">
              <Link href="/admin" className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition">
                Admin
              </Link>
              <span className="text-slate-300 text-[11px]">/</span>
              <span className="text-[11px] font-bold text-amber-600">Live Delivery Command Center</span>
            </div>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              Hyperlocal Orders, OTP Audit &amp; Doorstep Refusal Control
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin"
            className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-[11px] font-semibold text-slate-700 shadow-2xs transition"
          >
            ← Admin Dashboard
          </Link>
          <div className="logout-control">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-[1440px] mx-auto px-3 sm:px-5 py-3.5">
        <HyperlocalLiveAdminClient />
      </div>
    </main>
  );
}
