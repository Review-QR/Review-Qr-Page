import { NextResponse } from "next/server";
import { requireActiveAdmin } from "@/lib/supabase-server";
import {
  getPendingMerchantSettlements,
  getPendingRiderPayouts,
  getSettlementLedgerKPIs,
  settleMerchantBatchManual,
  executeMerchantPayoutCashfree,
  executeRiderPayout,
  settleRiderPayoutManual,
  generateBankBulkCsv,
} from "@/lib/hyperlocal/settlement-service";
import { isCashfreePayoutsConfigured } from "@/lib/hyperlocal/cashfree-payouts-service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireActiveAdmin();

    const [pendingMerchants, pendingRiders, kpis] = await Promise.all([
      getPendingMerchantSettlements(),
      getPendingRiderPayouts(),
      getSettlementLedgerKPIs(),
    ]);

    return NextResponse.json({
      success: true,
      pendingMerchants,
      pendingRiders,
      kpis,
      isCashfreePayoutsConfigured: isCashfreePayoutsConfigured(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized or failed to fetch settlements";
    return NextResponse.json({ success: false, error: message }, { status: 401 });
  }
}

export async function POST(request: Request) {
  try {
    await requireActiveAdmin();

    const body = await request.json();
    const { action } = body;

    // 1. Export Bank Bulk CSV
    if (action === "export_bank_csv") {
      const { type } = body; // 'merchants' | 'riders' | 'all'
      const [merchants, riders] = await Promise.all([
        getPendingMerchantSettlements(),
        getPendingRiderPayouts(),
      ]);

      const csvContent = generateBankBulkCsv({
        merchants: type === "riders" ? [] : merchants,
        riders: type === "merchants" ? [] : riders,
      });

      return new NextResponse(csvContent, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="Trustit_Bulk_Bank_Settlement_${new Date().toISOString().slice(0, 10)}.csv"`,
        },
      });
    }

    // 2. Settle Merchant Batch Manually (with Bank UTR)
    if (action === "settle_merchant_batch") {
      const { businessId, orderIds, utrNumber, accountNumber, ifscCode, netPayoutAmount } = body;
      if (!businessId || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json({ error: "Missing businessId or orderIds" }, { status: 400 });
      }

      const result = await settleMerchantBatchManual({
        businessId,
        orderIds,
        utrNumber,
        accountNumber,
        ifscCode,
        netPayoutAmount,
      });

      return NextResponse.json(result);
    }

    // 3. Payout Merchant via Cashfree IMPS
    if (action === "payout_merchant_cashfree") {
      const { businessId, orderIds } = body;
      if (!businessId || !orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json({ error: "Missing businessId or orderIds" }, { status: 400 });
      }

      const result = await executeMerchantPayoutCashfree({
        businessId,
        orderIds,
      });

      return NextResponse.json(result);
    }

    // 4. Settle Rider Payout with Bank UTR
    if (action === "settle_rider_payout") {
      const { requestId, utrNumber } = body;
      if (!requestId) {
        return NextResponse.json({ error: "Missing requestId" }, { status: 400 });
      }

      const result = await settleRiderPayoutManual({ requestId, utrNumber });
      return NextResponse.json(result);
    }

    // 5. Payout Rider via Cashfree UPI
    if (action === "payout_rider_cashfree") {
      const { riderId, amount, destinationUpi } = body;
      if (!riderId || !amount) {
        return NextResponse.json({ error: "Missing riderId or amount" }, { status: 400 });
      }

      const result = await executeRiderPayout({
        riderId,
        amount: Number(amount),
        destinationUpi,
      });

      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error processing settlement action";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
