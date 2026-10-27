import Link from "next/link";
import LogoutButton from "@/app/logout-button";
import { requireActiveAdmin } from "@/lib/supabase-server";
import { getAdminProductOrders } from "@/lib/product-orders/product-order-service";
import OrdersAdminClient from "./orders-admin-client";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physical QR Orders | Admin Dashboard",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireActiveAdmin();
  const orders = await getAdminProductOrders({ limit: 100 });

  return (
    <main className="dashboard-shell min-h-screen bg-slate-50/60 pb-12">
      {/* Admin Top Navigation Header */}
      <header className="dashboard-header bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="dashboard-brand flex items-center gap-3">
          <Link
            href="/admin"
            className="w-9 h-9 rounded-xl bg-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs hover:bg-indigo-700 transition"
          >
            QR
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <Link href="/admin" className="text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
                Admin Dashboard
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-slate-900">Physical QR Orders</span>
            </div>
            <h2 className="text-sm font-bold text-slate-800">Production & Courier Tracking</h2>
          </div>
        </div>

        <div className="dashboard-header-actions flex items-center gap-3">
          <Link
            href="/admin"
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs transition"
          >
            ← Back to Admin
          </Link>
          <div className="logout-control">
            <LogoutButton />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OrdersAdminClient initialOrders={orders} />
      </div>
    </main>
  );
}
