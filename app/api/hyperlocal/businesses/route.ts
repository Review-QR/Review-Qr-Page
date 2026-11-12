import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const BASE_BUSINESS_FIELDS =
  "id, name, city, type, address, phone, location_latitude, location_longitude";

/**
 * Live hyperlocal discovery feed for Customer Super-App & Android APK clients.
 * Always reflects admin-controlled `businesses.is_verified` state cleanly.
 */
export async function GET() {
  try {
    const admin = createSupabaseAdminClient();

    let businesses: Array<Record<string, unknown>> = [];
    const withVerified = await admin
      .from("businesses")
      .select(`${BASE_BUSINESS_FIELDS}, is_verified`)
      .is("deleted_at", null)
      .order("name", { ascending: true });

    if (withVerified.error && withVerified.error.message?.toLowerCase().includes("is_verified")) {
      const fallback = await admin
        .from("businesses")
        .select(BASE_BUSINESS_FIELDS)
        .is("deleted_at", null)
        .order("name", { ascending: true });

      if (fallback.error) {
        return NextResponse.json({ success: false, error: fallback.error.message }, { status: 500 });
      }
      businesses = (fallback.data || []).map((b) => ({ ...b, is_verified: false }));
    } else if (withVerified.error) {
      return NextResponse.json(
        { success: false, error: withVerified.error.message },
        { status: 500 },
      );
    } else {
      businesses = (withVerified.data || []).map((b) => ({
        ...b,
        is_verified: Boolean((b as { is_verified?: boolean | null }).is_verified),
      }));
    }

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
