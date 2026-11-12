import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const BASE_BUSINESS_FIELDS =
  "id, name, city, type, address, phone, location_latitude, location_longitude, merchant_status";

/**
 * Live hyperlocal discovery feed for Customer Super-App & Android APK clients.
 * Always reflects admin-controlled `businesses.is_verified` and live outlet order-taking flags cleanly.
 */
export async function GET() {
  try {
    const admin = createSupabaseAdminClient();

    let businesses: Array<Record<string, unknown>> = [];
    const withFlags = await admin
      .from("businesses")
      .select(`${BASE_BUSINESS_FIELDS}, is_verified, is_outlet_open, allow_taking_orders, is_taking_orders`)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (
      withFlags.error &&
      /is_verified|is_outlet_open|allow_taking_orders|is_taking_orders/i.test(withFlags.error.message || "")
    ) {
      const fallback = await admin
        .from("businesses")
        .select(BASE_BUSINESS_FIELDS)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (fallback.error) {
        return NextResponse.json({ success: false, error: fallback.error.message }, { status: 500 });
      }
      businesses = (fallback.data || []).map((b) => ({
        ...b,
        is_verified: false,
        is_outlet_open: true,
        allow_taking_orders: false,
        is_taking_orders: false,
      }));
    } else if (withFlags.error) {
      return NextResponse.json(
        { success: false, error: withFlags.error.message },
        { status: 500 },
      );
    } else {
      businesses = (withFlags.data || []).map((b) => {
        const row = b as {
          is_verified?: boolean | null;
          is_outlet_open?: boolean | null;
          allow_taking_orders?: boolean | null;
          is_taking_orders?: boolean | null;
        };
        return {
          ...b,
          is_verified: Boolean(row.is_verified),
          is_outlet_open: row.is_outlet_open !== false,
          allow_taking_orders: Boolean(row.allow_taking_orders),
          is_taking_orders: Boolean(row.is_taking_orders),
        };
      });
    }

    businesses = businesses.filter(
      (b) => !b.merchant_status || b.merchant_status === "active"
    );

    const activeBizIds = new Set(businesses.map((b) => String(b.id)));
    const { data: items } = await admin
      .from("business_catalog_items")
      .select("id, business_id, name, category, price, item_type, is_available, image_url, description")
      .eq("is_available", true)
      .order("name", { ascending: true });

    const activeItems = (items || []).filter((it) => activeBizIds.has(String(it.business_id)));

    return NextResponse.json({
      success: true,
      businesses,
      items: activeItems,
      catalogItems: activeItems,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load stores." },
      { status: 500 },
    );
  }
}
