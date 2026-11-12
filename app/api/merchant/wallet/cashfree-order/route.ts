import { NextResponse } from "next/server";
import { getActiveMerchant } from "@/lib/merchant-auth";
import { createCashfreeWalletRechargeOrder } from "@/lib/wallet/cashfree-wallet-service";
import { enforceRateLimit } from "@/lib/auth-api-guards";

export async function POST(req: Request) {
  try {
    const rateLimited = enforceRateLimit(req, "merchant_wallet_order", 15, 10 * 60_000);
    if (rateLimited) return rateLimited;

    const merchant = await getActiveMerchant();
    if (!merchant) {
      return NextResponse.json({ message: "Unauthorized. Please sign in." }, { status: 401 });
    }

    const body = (await req.json()) as {
      amount?: number;
      credits?: number;
      businessId?: string;
    };

    const amount = Number(body.amount);
    if (!Number.isFinite(amount) || amount < 10 || amount > 100_000) {
      return NextResponse.json(
        { message: "Recharge amount must be between ₹10 and ₹1,00,000." },
        { status: 400 }
      );
    }

    const requestedCredits = Number(body.credits);
    const maxAllowedCredits = Math.ceil(amount * 1.5);
    const credits =
      Number.isFinite(requestedCredits) && requestedCredits >= amount && requestedCredits <= maxAllowedCredits
        ? Math.floor(requestedCredits)
        : Math.floor(amount);

    const orderResult = await createCashfreeWalletRechargeOrder({
      businessId: merchant.businessId,
      amount,
      credits,
      merchantName: merchant.businessName,
      merchantPhone: merchant.registeredMobile || undefined,
      merchantEmail: merchant.email || undefined,
    });

    if (!orderResult.success) {
      return NextResponse.json({ message: orderResult.error }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      orderId: orderResult.orderId,
      paymentSessionId: orderResult.paymentSessionId,
      checkoutMode: orderResult.environment,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { message: err instanceof Error ? err.message : "Internal server error." },
      { status: 500 }
    );
  }
}
