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
    <main className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Admin Dark Top Bar */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shadow hover:bg-amber-400 transition"
          >
            ⚡
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-xs font-semibold text-slate-400 hover:text-white transition">
                Admin
              </Link>
              <span className="text-slate-600">/</span>
              <span className="text-xs font-bold text-amber-400">Live Delivery Command Center</span>
            </div>
            <h1 className="text-sm font-bold text-white leading-tight">
              Hyperlocal Orders, OTP Audit &amp; Doorstep Refusal Control
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition"
          >
            ← Admin Dashboard
          </Link>
          <div className="logout-control">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <HyperlocalLiveAdminClient />
      </div>
    </main>
  );
}
