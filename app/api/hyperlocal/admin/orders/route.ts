import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { adminCancelOrderDoorstepRefusal } from "@/lib/hyperlocal/hyperlocal-service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all";
    const admin = createSupabaseAdminClient();

    let query = admin
      .from("hyperlocal_orders")
      .select(`
        *,
        hyperlocal_order_items (*),
        delivery_riders:hyperlocal_orders_rider_id_fkey (id, full_name, phone, vehicle_type, vehicle_number, rating, is_online),
        businesses (id, name, city, phone, address)
      `)
      .order("created_at", { ascending: false });

    if (filter === "disputed") {
      query = query.not("dispute_status", "in", '("none","resolved")');
    } else if (filter === "active") {
      query = query.in("status", [
        "placed",
        "accepted_by_merchant",
        "preparing",
        "ready_for_pickup",
        "rider_assigned",
        "picked_up",
        "out_for_delivery",
        "arrived_at_doorstep",
      ]);
    } else if (filter === "cancelled") {
      query = query.eq("status", "cancelled");
    } else if (filter === "delivered") {
      query = query.in("status", ["delivered", "completed"]);
    } else {
      query = query.limit(100);
    }

    const { data: orders, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Compute live counters
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const { data: statsData } = await admin
      .from("hyperlocal_orders")
      .select("id, status, dispute_status, delivered_at, created_at, updated_at");

    const allStats = statsData || [];
    const activeCount = allStats.filter((o: any) =>
      ["placed", "accepted_by_merchant", "preparing", "ready_for_pickup", "rider_assigned", "picked_up", "out_for_delivery", "arrived_at_doorstep"].includes(o.status),
    ).length;

    const disputedCount = allStats.filter((o: any) => o.dispute_status && !["none", "resolved"].includes(o.dispute_status)).length;

    const deliveredTodayCount = allStats.filter(
      (o: any) =>
        ["delivered", "completed"].includes(o.status) &&
        new Date(o.delivered_at || o.updated_at || o.created_at).getTime() >= startOfToday.getTime(),
    ).length;

    const cancelledTodayCount = allStats.filter(
      (o: any) =>
        o.status === "cancelled" &&
        new Date(o.updated_at || o.created_at).getTime() >= startOfToday.getTime(),
    ).length;

    return NextResponse.json({
      orders: orders || [],
      counts: {
        active: activeCount,
        disputed: disputedCount,
        deliveredToday: deliveredTodayCount,
        cancelledToday: cancelledTodayCount,
        total: allStats.length,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to load admin orders" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, orderId, adminNotes, cancelledBy } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    if (action === "cancel_refusal") {
      const result = await adminCancelOrderDoorstepRefusal(orderId, {
        adminNotes: adminNotes || "Customer refused delivery at doorstep",
        cancelledBy: cancelledBy || "admin",
      });
      return NextResponse.json({ success: true, result });
    }

    if (action === "resolve_dispute") {
      const admin = createSupabaseAdminClient();
      await admin
        .from("hyperlocal_orders")
        .update({
          dispute_status: "resolved",
          admin_notes: adminNotes || "Dispute resolved by Admin",
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId);

      return NextResponse.json({ success: true, message: "Dispute marked resolved" });
    }

    return NextResponse.json({ error: "Unknown admin action" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Admin action failed" },
      { status: 500 },
    );
  }
}
