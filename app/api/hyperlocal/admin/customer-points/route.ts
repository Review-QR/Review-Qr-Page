import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { getActiveAdminContext } from "@/lib/supabase-server";
import { calculatePointsInrValue } from "@/lib/customer-points";

export const dynamic = "force-dynamic";

/**
 * Admin-only Customer Reward Points directory, lookup & top-up/adjustment API.
 * Conversion rule: 350 Points = INR 100.
 */
export async function GET(request: NextRequest) {
  try {
    const adminCtx = await getActiveAdminContext();
    if (!adminCtx) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const q = (searchParams.get("q") || "").trim();
    const admin = createSupabaseAdminClient();

    let query = admin
      .from("customers")
      .select("id, full_name, phone, email, reward_points, created_at")
      .order("created_at", { ascending: false })
      .limit(40);

    if (q) {
      const safe = q.replace(/[%_,()]/g, "").trim();
      const digits = safe.replace(/\D/g, "");
      if (digits.length >= 4) {
        query = query.or(
          `phone.ilike.%${digits}%,full_name.ilike.%${safe}%,email.ilike.%${safe}%`,
        );
      } else if (safe) {
        query = query.or(`full_name.ilike.%${safe}%,email.ilike.%${safe}%,phone.ilike.%${safe}%`);
      }
    }

    const { data, error } = await query;

    if (error) {
      if (error.message?.toLowerCase().includes("reward_points")) {
        return NextResponse.json(
          {
            success: false,
            migrationRequired: true,
            error:
              "Column customers.reward_points is missing. Run migration 20261112090000_customer_points_and_merchant_verified.sql first.",
          },
          { status: 500 },
        );
      }
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const customers = (data || []).map((c) => {
      const pts = Math.max(0, Number((c as { reward_points?: number | null }).reward_points ?? 0));
      return {
        id: c.id,
        full_name: c.full_name,
        phone: c.phone,
        email: c.email,
        reward_points: pts,
        inr_value: calculatePointsInrValue(pts),
        created_at: c.created_at,
      };
    });

    const { data: recentLedger } = await admin
      .from("customer_points_ledger")
      .select("id, customer_id, points_delta, balance_after, reason, admin_email, created_at")
      .order("created_at", { ascending: false })
      .limit(15);

    return NextResponse.json({
      success: true,
      customers,
      recentLedger: recentLedger || [],
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Failed to load customer points." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const adminCtx = await getActiveAdminContext();
    if (!adminCtx) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const customerId = typeof body.customerId === "string" ? body.customerId.trim() : "";
    const pointsDelta = Math.trunc(Number(body.pointsDelta));
    const reason =
      typeof body.reason === "string" && body.reason.trim()
        ? body.reason.trim().slice(0, 140)
        : "Admin Top-Up";

    if (!customerId) {
      return NextResponse.json({ success: false, error: "Customer ID is required." }, { status: 400 });
    }
    if (!Number.isFinite(pointsDelta) || pointsDelta === 0) {
      return NextResponse.json(
        { success: false, error: "Enter a valid non-zero points amount." },
        { status: 400 },
      );
    }

    const admin = createSupabaseAdminClient();
    const { data: customer, error: fetchErr } = await admin
      .from("customers")
      .select("id, full_name, phone, reward_points")
      .eq("id", customerId)
      .maybeSingle();

    if (fetchErr || !customer) {
      return NextResponse.json(
        { success: false, error: fetchErr?.message || "Customer not found." },
        { status: 404 },
      );
    }

    const currentPoints = Math.max(0, Number(customer.reward_points ?? 0));
    const nextBalance = Math.max(0, currentPoints + pointsDelta);
    const appliedDelta = nextBalance - currentPoints;

    const { error: updateErr } = await admin
      .from("customers")
      .update({ reward_points: nextBalance })
      .eq("id", customer.id);

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    await admin.from("customer_points_ledger").insert({
      customer_id: customer.id,
      points_delta: appliedDelta,
      balance_after: nextBalance,
      reason,
      admin_email: adminCtx.email || adminCtx.userId,
    });

    return NextResponse.json({
      success: true,
      customerId: customer.id,
      rewardPoints: nextBalance,
      inrValue: calculatePointsInrValue(nextBalance),
      appliedDelta,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Top-up failed." },
      { status: 500 },
    );
  }
}
