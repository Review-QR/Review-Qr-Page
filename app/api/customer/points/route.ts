import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { calculatePointsInrValue } from "@/lib/customer-points";
import {
  CUSTOMER_SESSION_COOKIE,
  enforceRateLimit,
  isUuid,
  verifyCustomerSessionToken,
} from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

/**
 * Fetches live reward points balance and converted INR value (350 pts = INR 100)
 * for an authenticated customer by customerId or 10-digit mobile number.
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "customer_points", 45, 60_000);
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId")?.trim() || "";
    const rawPhone = searchParams.get("phone")?.trim() || "";
    const email = searchParams.get("email")?.trim().toLowerCase() || "";
    const phone10 = rawPhone.replace(/\D/g, "").slice(-10);

    if (customerId && !isUuid(customerId)) {
      return NextResponse.json(
        { success: false, error: "Invalid Customer ID format." },
        { status: 400 },
      );
    }

    if (!customerId && phone10.length !== 10 && !email) {
      return NextResponse.json(
        { success: false, error: "Customer ID, email, or valid 10-digit phone is required." },
        { status: 400 },
      );
    }

    const session = verifyCustomerSessionToken(
      request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value
    );
    if (session) {
      if (customerId && session.customerId && session.customerId !== customerId) {
        return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
      }
      if (phone10.length === 10 && session.phone && session.phone !== phone10) {
        return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
      }
      if (email && session.email && session.email !== email) {
        return NextResponse.json({ success: false, error: "Forbidden." }, { status: 403 });
      }
    }

    const admin = createSupabaseAdminClient();
    const selectWithPoints = "id, full_name, phone, email, reward_points";
    const rows: Array<{
      id: string;
      full_name?: string | null;
      phone?: string | null;
      email?: string | null;
      reward_points?: number | null;
    }> = [];

    const pushUnique = (list: typeof rows | null | undefined) => {
      for (const r of list || []) {
        if (!rows.some((existing) => existing.id === r.id)) {
          rows.push(r);
        }
      }
    };

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
      if (data) pushUnique([data]);
    }

    const effectivePhone10 =
      phone10.length === 10
        ? phone10
        : (rows[0]?.phone || "").replace(/\D/g, "").slice(-10);

    if (effectivePhone10.length === 10) {
      const { data: exactPhoneRows, error: exactErr } = await admin
        .from("customers")
        .select(selectWithPoints)
        .in("phone", [effectivePhone10, `91${effectivePhone10}`, `+91${effectivePhone10}`])
        .limit(10);

      if (exactErr && exactErr.message?.toLowerCase().includes("reward_points")) {
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
      pushUnique(exactPhoneRows);
    }

    const effectiveEmail = email || rows[0]?.email?.trim().toLowerCase() || "";
    if (effectiveEmail && effectiveEmail.includes("@")) {
      const { data: emailRows } = await admin
        .from("customers")
        .select(selectWithPoints)
        .ilike("email", effectiveEmail)
        .limit(5);
      pushUnique(emailRows);
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
