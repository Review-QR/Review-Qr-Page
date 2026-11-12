import { NextResponse } from "next/server";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export async function POST(req: Request) {
  try {
    const merchant = await getActiveMerchant();
    if (!merchant) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { isOutletOpen, isTakingOrders } = body;

    const supabase = createSupabaseAdminClient();

    // Check allow_taking_orders permission if merchant is trying to enable taking orders
    if (typeof isTakingOrders === "boolean" && isTakingOrders === true) {
      try {
        const { data: business } = await supabase
          .from("businesses")
          .select("allow_taking_orders")
          .eq("id", merchant.businessId)
          .maybeSingle();

        const isAllowed = Boolean((business as { allow_taking_orders?: boolean } | null)?.allow_taking_orders);
        if (!isAllowed) {
          return NextResponse.json(
            { error: "Access Denied: Taking orders has not been allowed by admin." },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json(
          { error: "Access Denied: Taking orders has not been allowed by admin." },
          { status: 403 }
        );
      }
    }

    const updates: Record<string, boolean> = {};
    if (typeof isOutletOpen === "boolean") {
      updates.is_outlet_open = isOutletOpen;
      if (!isOutletOpen) {
        updates.is_taking_orders = false;
      }
    }
    if (typeof isTakingOrders === "boolean" && updates.is_outlet_open !== false) {
      updates.is_taking_orders = isTakingOrders;
    }

    if (Object.keys(updates).length > 0) {
      const { error: dbErr } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", merchant.businessId);
      if (dbErr) {
        console.error("Outlet status DB update failed:", dbErr);
        return NextResponse.json(
          { error: dbErr.message || "Failed to update outlet status" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json({ success: true, updates });
  } catch (error) {
    console.error("Outlet status update failed:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
