import Link from "next/link";
import { requireActiveMerchant } from "@/lib/merchant-auth";
import { createMerchantServerClient } from "@/lib/supabase-merchant-server";

export const dynamic = "force-dynamic";

export default async function MerchantFleetPage() {
  const merchant = await requireActiveMerchant();
  const supabase = await createMerchantServerClient();

  const { data: activeOrders, count: activeCount } = await supabase
    .from("hyperlocal_orders")
    .select("id, status, customer_name, customer_phone, total_amount, created_at", { count: "exact" })
    .eq("business_id", merchant.businessId)
    .in("status", ["ready_for_pickup", "out_for_delivery"])
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-col w-full pb-16 space-y-6">
      {/* Top Breadcrumb & Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 py-4 border-b border-[#eaedff]">
        <div className="flex flex-col space-y-1">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#434652] uppercase tracking-wider">
            <span>Operations</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span>Delivery</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-[#003178]">Fleet Dispatch Command</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#131b2e] tracking-tight">
            Delivery Management &amp; Dispatch Operations
          </h1>
          <p className="text-xs sm:text-sm text-[#434652]">
            Coordinate in-house fleet riders, request TRUSTIT 3PL network couriers (Shadowfax, Borzo), and monitor dispatch SLAs in real time.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2.5">
          <Link
            href="/merchant/dashboard/orders"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#003178] hover:bg-[#0d47a1] text-white text-xs font-bold transition-all shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">two_wheeler</span>
            <span>Live Dispatch Console</span>
          </Link>
        </div>
      </div>

      {/* Operational Health Alert Banner */}
      <div className="relative overflow-hidden rounded-xl bg-[#f2f3ff] p-4 border border-[#eaedff] shadow-xs">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#003178]"></div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pl-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003178]/10 flex items-center justify-center text-[#003178]">
              <span className="material-symbols-outlined text-[24px]">electric_moped</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#131b2e]">TRUSTIT Hyperlocal Delivery Mesh</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8df7c1] text-[#002113] uppercase">
                  Automatic Fallback Ready
                </span>
              </div>
              <p className="text-xs text-[#434652] mt-0.5">
                Orders automatically broadcast to verified riders within 3.5 km radius. Average acceptance time: &lt; 90 seconds.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-mono text-[#434652]">Hub: {merchant.locality || merchant.city || "Bahraich"}</span>
            <span className="w-2.5 h-2.5 rounded-full bg-[#005739] animate-pulse"></span>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl bg-white p-5 border border-[#eaedff] shadow-xs">
          <div className="flex items-center justify-between text-[#434652] mb-1">
            <span className="text-[11px] uppercase tracking-wider font-bold">Active Deliveries</span>
            <span className="material-symbols-outlined text-[20px] text-[#003178]">electric_moped</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#131b2e] leading-none">{activeCount ?? 0}</span>
            <span className="text-xs text-[#737783]">orders en route</span>
          </div>
          <span className="text-[11px] text-[#737783] mt-2 block">Real-time GPS monitored</span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#eaedff] shadow-xs">
          <div className="flex items-center justify-between text-[#434652] mb-1">
            <span className="text-[11px] uppercase tracking-wider font-bold">Avg Pickup Time</span>
            <span className="material-symbols-outlined text-[20px] text-[#006875]">timer</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#006875] leading-none">6.2</span>
            <span className="text-xs text-[#737783]">mins</span>
          </div>
          <span className="text-[11px] text-[#005739] mt-2 block font-semibold">Under 10m target</span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#eaedff] shadow-xs">
          <div className="flex items-center justify-between text-[#434652] mb-1">
            <span className="text-[11px] uppercase tracking-wider font-bold">On-Time SLA</span>
            <span className="material-symbols-outlined text-[20px] text-[#005739]">verified</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#005739] leading-none">99.1%</span>
            <span className="text-xs text-[#737783]">benchmark</span>
          </div>
          <span className="text-[11px] text-[#005739] mt-2 block font-semibold">Optimal fleet band</span>
        </div>

        <div className="rounded-2xl bg-white p-5 border border-[#eaedff] shadow-xs">
          <div className="flex items-center justify-between text-[#434652] mb-1">
            <span className="text-[11px] uppercase tracking-wider font-bold">Fleet Pool</span>
            <span className="material-symbols-outlined text-[20px] text-[#003178]">groups</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#131b2e] leading-none">Dual</span>
            <span className="text-xs text-[#737783]">Pool Mode</span>
          </div>
          <span className="text-[11px] text-[#737783] mt-2 block">TRUSTIT Fleet + 3PL Network</span>
        </div>
      </div>

      {/* Active Orders List */}
      <div className="rounded-2xl bg-white p-5 sm:p-6 border border-[#eaedff] shadow-xs">
        <h2 className="text-base font-extrabold text-[#131b2e] mb-4">Active Fleet Deliveries</h2>
        {!activeOrders || activeOrders.length === 0 ? (
          <div className="p-8 text-center bg-[#faf8ff] rounded-xl border border-[#eaedff]">
            <span className="material-symbols-outlined text-[40px] text-[#737783] mb-2">two_wheeler</span>
            <p className="text-sm font-bold text-[#131b2e]">No active delivery dispatches right now</p>
            <p className="text-xs text-[#737783] mt-1">
              When new orders are accepted and marked ready, riders will appear here with live tracking.
            </p>
            <Link
              href="/merchant/dashboard/orders"
              className="inline-flex items-center gap-1.5 px-4 py-2 mt-4 rounded-xl bg-[#003178] text-white text-xs font-bold hover:bg-[#0d47a1]"
            >
              Open Orders Queue
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {activeOrders.map((order) => (
              <div
                key={order.id}
                className="p-4 rounded-xl border border-[#eaedff] bg-[#faf8ff] flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#003178]">#{order.id}</span>
                    <span className="px-2 py-0.5 rounded-full bg-[#eaedff] text-[#003178] text-[10px] font-bold uppercase">
                      {order.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#131b2e] mt-1">{order.customer_name}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#131b2e]">₹{order.total_amount}</span>
                  <Link
                    href="/merchant/dashboard/orders"
                    className="block text-[11px] font-bold text-[#003178] hover:underline mt-0.5"
                  >
                    View Details →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
