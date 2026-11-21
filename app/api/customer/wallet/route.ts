import { NextRequest, NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import {
  CUSTOMER_SESSION_COOKIE,
  enforceRateLimit,
  verifyCustomerSessionToken,
} from "@/lib/auth-api-guards";
import {
  getOrCreateCustomerWallet,
  creditCustomerWallet,
  debitCustomerWallet,
  getCustomerWalletState,
} from "@/lib/customer-wallet-service";

export const dynamic = "force-dynamic";

/**
 * Get or create customer wallet.
 * GET /api/customer/wallet?customerId=<uuid>
 */
export async function GET(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "customer_wallet_get", 45, 60_000);
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId")?.trim() || "";

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

    const state = await getCustomerWalletState(customerId, 10);
    return NextResponse.json({ success: true, ...state });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Failed to fetch wallet";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

/**
 * Credit or debit customer wallet.
 * POST /api/customer/wallet
 * Body: { customerId: string, action: "credit" | "debit", amount: number, description?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const rateLimited = enforceRateLimit(request, "customer_wallet_post", 15, 60_000);
    if (rateLimited) return rateLimited;

    const body = await request.json();
    const customerId = (body.customerId ?? "").trim();
    const action = (body.action ?? "").trim().toLowerCase();
    const amount = Number(body.amount) || 0;
    const description = (body.description ?? "").trim();

    if (!customerId || customerId.length < 30) {
      return NextResponse.json(
        { success: false, error: "Invalid customerId." },
        { status: 400 }
      );
    }

    if (!["credit", "debit"].includes(action)) {
      return NextResponse.json(
        { success: false, error: "action must be 'credit' or 'debit'." },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { success: false, error: "amount must be a positive number." },
        { status: 400 }
      );
    }

    if (action === "credit") {
      const result = await creditCustomerWallet(customerId, amount, {
        type: "topup",
        referenceType: "manual",
        description,
      });
      return NextResponse.json(result);
    }

    const result = await debitCustomerWallet(customerId, amount, {
      referenceType: "manual",
      description,
    });
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Wallet operation failed";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
