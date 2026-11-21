import { NextRequest, NextResponse } from "next/server";
import {
  CUSTOMER_SESSION_COOKIE,
  enforceRateLimit,
  verifyCustomerSessionToken,
} from "@/lib/auth-api-guards";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

/**
 * Get wallet transaction history.
 * GET /api/customer/wallet/transactions?customerId=<uuid>&limit=20
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "customer_wallet_tx", 45, 60_000);
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId")?.trim() || "";
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "20", 10), 50);

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: "customerId is required." },
        { status: 400 }
      );
    }

    // Verify session ownership
    const sessionCookie = request.cookies.get(CUSTOMER_SESSION_COOKIE)?.value;
    if (sessionCookie) {
      const session = await verifyCustomerSessionToken(sessionCookie);
      if (session && session.customerId !== customerId) {
        return NextResponse.json(
          { success: false, error: "Unauthorized: wallet belongs to another customer." },
          { status: 403 }
        );
      }
    }

    const admin = createSupabaseAdminClient();

    // Find customer's wallet
    const { data: wallet, error: walletError } = await admin
      .from("customer_wallets")
      .select("id")
      .eq("customer_id", customerId)
      .maybeSingle();

    if (walletError) {
      return NextResponse.json({ success: false, error: "Wallet lookup failed." }, { status: 500 });
    }

    if (!wallet) {
      return NextResponse.json({ success: true, transactions: [] });
    }

    const { data: txs, error: txError } = await admin
      .from("wallet_transactions")
      .select("id, type, amount_inr, balance_after_inr, reference_type, reference_id, payment_method, description, created_at")
      .eq("wallet_id", wallet.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (txError) {
      return NextResponse.json({ success: false, error: "Failed to fetch transactions." }, { status: 500 });
    }

    const transactions = (txs ?? []).map((t) => ({
      id: t.id,
      type: t.type,
      amountInr: Number(t.amount_inr),
      balanceAfterInr: Number(t.balance_after_inr),
      referenceType: t.reference_type ?? null,
      referenceId: t.reference_id ?? null,
      paymentMethod: t.payment_method ?? null,
      description: t.description ?? "",
      createdAt: t.created_at,
    }));

    return NextResponse.json({ success: true, transactions });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch transactions";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
