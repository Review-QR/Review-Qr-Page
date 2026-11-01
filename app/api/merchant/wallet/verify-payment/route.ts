import { NextResponse } from "next/server";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { verifyAndApplyWalletRecharge } from "@/lib/wallet/cashfree-wallet-service";
import { getMerchantConnectWallet } from "@/lib/customer-crm-service";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const merchant = await getActiveMerchant();
    if (!merchant) {
      return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
    }

    const body = (await req.json()) as {
      orderId?: string;
      credits?: number;
    };

    const orderId = body.orderId;
    const credits = Number(body.credits || 0);

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required." }, { status: 400 });
    }

    const result = await verifyAndApplyWalletRecharge(
      orderId,
      merchant.businessId,
      credits,
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
