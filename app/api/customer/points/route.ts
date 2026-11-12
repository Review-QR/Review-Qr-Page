import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { calculatePointsInrValue } from "@/lib/customer-points";

export const dynamic = "force-dynamic";

/**
 * Fetches live reward points balance and converted INR value (350 pts = INR 100)
 * for an authenticated customer by customerId or 10-digit mobile number.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId")?.trim();
    const rawPhone = searchParams.get("phone")?.trim() || "";
    const phone10 = rawPhone.replace(/\D/g, "").slice(-10);

    if (!customerId && phone10.length !== 10) {
      return NextResponse.json(
        { success: false, error: "Customer ID or valid 10-digit phone is required." },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();
    const selectWithPoints = "id, full_name, phone, reward_points";
    const rows: Array<{ id: string; full_name?: string | null; phone?: string | null; reward_points?: number | null }> = [];

    if (customerId) {
      const { data, error } = await admin
        .from("customers")
        .select(selectWithPoints)
        .eq("id", customerId)
        .maybeSingle();
      if (error) {
        if (error.message?.toLowerCase().includes("reward_points")) {
          return NextResponse.json(
            {
              success: true,
              rewardPoints: 0,
              inrValue: 0,
              pointsPerHundredInr: 350,
            },
            { headers: { "Cache-Control": "no-store, max-age=0" } },
          );
        }
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }
      if (data) rows.push(data);
    }

    const effectivePhone10 =
      phone10.length === 10
        ? phone10
        : (rows[0]?.phone || "").replace(/\D/g, "").slice(-10);

    if (effectivePhone10.length === 10) {
      const { data: phoneRows, error: phoneErr } = await admin
        .from("customers")
        .select(selectWithPoints)
        .or(`phone.eq.${effectivePhone10},phone.eq.91${effectivePhone10},phone.eq.+91${effectivePhone10},phone.ilike.%${effectivePhone10}%`)
        .limit(10);

      if (phoneErr && phoneErr.message?.toLowerCase().includes("reward_points")) {
        return NextResponse.json(
          {
            success: true,
            rewardPoints: 0,
            inrValue: 0,
            pointsPerHundredInr: 350,
          },
          { headers: { "Cache-Control": "no-store, max-age=0" } },
        );
      }
      for (const r of phoneRows || []) {
        if (!rows.some((existing) => existing.id === r.id)) {
          rows.push(r);
        }
      }
    }

    const rewardPoints = rows.reduce(
      (sum, row) => sum + Math.max(0, Number(row.reward_points ?? 0)),
      0,
    );

    return NextResponse.json(
      {
        success: true,
        customerId: rows[0]?.id || customerId || null,
        rewardPoints,
        inrValue: calculatePointsInrValue(rewardPoints),
        pointsPerHundredInr: 350,
      },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to fetch points." },
      { status: 500 },
    );
  }
}
