import { NextResponse } from "next/server";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { verifyAndApplyWalletRecharge } from "@/lib/wallet/cashfree-wallet-service";
import { getMerchantConnectWallet } from "@/lib/customer-crm-service";
import { createCashfreeClient } from "@/lib/cashfree";
import { enforceRateLimit } from "@/lib/auth-api-guards";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const rateLimited = enforceRateLimit(req, "merchant_wallet_verify", 20, 10 * 60_000);
    if (rateLimited) return rateLimited;

    const merchant = await getActiveMerchant();
    if (!merchant) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as {
      orderId?: string;
      credits?: number;
    };

    const orderId = typeof body.orderId === "string" ? body.orderId.trim() : "";
    if (!orderId || !/^twal_[a-zA-Z0-9_-]+$/.test(orderId)) {
      return NextResponse.json({ message: "Valid wallet Order ID is required." }, { status: 400 });
    }

    // Verify order ownership, type, and authoritative credit amount directly with Cashfree
    const client = createCashfreeClient();
    const cfResp = await fetch(
      `${client.apiBaseUrl}/orders/${encodeURIComponent(orderId)}`,
      client.createRequestInit({
        method: "GET",
        cache: "no-store",
        signal: AbortSignal.timeout(15_000),
      })
    );
    if (!cfResp.ok) {
      return NextResponse.json({ success: false, message: "Unable to verify order with payment gateway." }, { status: 502 });
    }
    const cfOrder = (await cfResp.json()) as {
      order_status?: string;
      order_amount?: number;
      order_tags?: Record<string, string>;
    };

    const tagBusinessId = cfOrder.order_tags?.business_id;
    const tagOrderType = cfOrder.order_tags?.order_type;
    if (
      tagBusinessId !== merchant.businessId ||
      tagOrderType !== "connect_wallet_recharge"
    ) {
      return NextResponse.json(
        { success: false, message: "Order does not belong to this merchant wallet." },
        { status: 403 }
      );
    }

    const paidAmount = Number(cfOrder.order_amount || 0);
    const taggedCredits = Number(cfOrder.order_tags?.credits || paidAmount);
    const verifiedCredits =
      Number.isFinite(taggedCredits) && taggedCredits > 0 && taggedCredits <= Math.ceil(paidAmount * 1.5)
        ? Math.floor(taggedCredits)
        : Math.floor(paidAmount);

    const result = await verifyAndApplyWalletRecharge(
      orderId,
      merchant.businessId,
      verifiedCredits,
      "Cashfree Instant Top-up"
    );

    const freshWallet = await getMerchantConnectWallet(merchant.businessId);

    return NextResponse.json({
      success: result.success,
      wallet: freshWallet,
      message: result.success ? "Recharge successful!" : result.error || "Payment verification pending.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Verification error" },
      { status: 500 }
    );
  }
}
