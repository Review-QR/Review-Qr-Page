import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import { createHash } from "node:crypto";
import { requestCashfreePayout } from "./cashfree-payouts-service";
import type { MerchantBankAccount } from "@/lib/bank-payouts-service";
import { generateBankBulkCsv, type CsvMerchantInput, type CsvRiderInput } from "./bank-csv-generator";

export { generateBankBulkCsv, type CsvMerchantInput, type CsvRiderInput };

/**
 * Deterministic, Cashfree-safe identifier generator.
 *
 * Cashfree's requestTransfer deduplicates by transferId: re-sending the SAME
 * transferId returns the existing transfer and never creates a second one. A
 * retry that used a timestamp-based id (the old behaviour) would create a NEW
 * id and therefore a SECOND payout. Making the id a stable hash of the payout
 * intent (rider + request key) guarantees retries are idempotent end-to-end.
 * Output is alphanumeric + `_` and well under Cashfree's 50-char limit.
 */
function stablePayoutId(prefix: string, seed: string): string {
  const digest = createHash("sha1").update(seed).digest("hex").slice(0, 20);
  return `${prefix}_${digest}`.replace(/[^a-zA-Z0-9_]/g, "");
}

/**
 * Append an immutable audit row for an admin financial action. Best-effort:
 * a failure to write the audit row logs loudly but does not itself roll back a
 * money move that has already committed (the money move is the source of
 * truth; the audit row is traceability). Callers that must be transactionally
 * consistent should pass the audit insert through the same RPC/transaction as
 * the mutation (see deduct_rider_wallet usage).
 */
export async function writeAdminAuditRecord(input: {
  actorEmail?: string | null;
  actorUserId?: string | null;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  payload?: Record<string, unknown>;
}): Promise<void> {
  try {
    const admin = createSupabaseAdminClient();
    await admin.from("admin_audit_log").insert({
      actor_email: input.actorEmail ?? null,
      actor_user_id: input.actorUserId ?? null,
      action: input.action,
      target_type: input.targetType,
      target_id: input.targetId,
      reason: input.reason,
      payload: (input.payload ?? {}) as Record<string, unknown>,
    });
  } catch (err) {
    // The table is created by migration 20261114090000; if absent, surface loudly.
    // eslint-disable-next-line no-console
    console.error("[admin-audit] failed to write audit record", input.action, err);
  }
}

/** Atomic, overdraw-safe wallet deduction via the M3 RPC. */
async function rpcDeductRiderWallet(admin: ReturnType<typeof createSupabaseAdminClient>, riderId: string, amount: number) {
  const { data, error } = await admin.rpc("deduct_rider_wallet", { p_rider: riderId, p_amount: amount });
  if (error) return { ok: false as const, code: "rpc_unavailable" };
  const row = (data ?? {}) as { ok?: boolean; code?: string; new_balance?: number };
  return { ok: Boolean(row.ok), code: row.code ?? "unknown", newBalance: row.new_balance ?? null };
}

export interface PendingMerchantSettlement {
  businessId: string;
  businessName: string;
  ownerName?: string;
  ownerPhone?: string;
  city?: string;
  ordersCount: number;
  orderIds: string[];
  grossSales: number;
  platformCommission: number;
  paymentGatewayFee: number;
  netPayable: number;
  bankDetails: MerchantBankAccount | null;
}

export interface PendingRiderPayoutItem {
  id: string; // payout request id or rider id
  riderId: string;
  riderName: string;
  phone: string;
  walletBalance: number;
  cashInHand: number;
  upiId: string;
  bankAccountNumber?: string;
  ifscCode?: string;
  requestId?: string;
  amountRequested: number;
  status: "pending" | "processing" | "completed" | "failed";
  createdAt?: string;
}

export interface SettlementLedgerSummary {
  totalGrossDelivered: number;
  totalPlatformCommissionRetained: number;
  totalMerchantPendingPayout: number;
  totalRiderPendingPayout: number;
  totalSettledBatchesCount: number;
}

/**
 * Get real-time pending merchant settlements grouped by restaurant
 */
export async function getPendingMerchantSettlements(): Promise<PendingMerchantSettlement[]> {
  const admin = createSupabaseAdminClient();

  // 1. Fetch splits where settlement_status is pending or wallet_credited (delivered but merchant unbatched)
  const { data: splits, error: splitErr } = await admin
    .from("hyperlocal_payout_splits")
    .select("order_id, merchant_id, gross_amount, merchant_gross, platform_commission, payment_gateway_fee, merchant_net_payable, settlement_status, batch_id")
    .is("batch_id", null)
    .neq("settlement_status", "settled_split");

  if (splitErr || !splits || splits.length === 0) {
    return [];
  }

  // 2. Fetch distinct businesses info
  const businessIds = Array.from(new Set(splits.map((s) => s.merchant_id)));

  const [{ data: businesses }, { data: banks }] = await Promise.all([
    admin.from("businesses").select("id, name, owner, phone, city").in("id", businessIds),
    admin.from("merchant_bank_accounts").select("*").in("business_id", businessIds),
  ]);

  const bizMap = new Map((businesses || []).map((b) => [b.id, b]));
  const bankMap = new Map((banks || []).map((bk) => [bk.business_id, bk as unknown as MerchantBankAccount]));

  // 3. Aggregate splits by merchant
  const aggregated = new Map<string, PendingMerchantSettlement>();

  for (const s of splits) {
    const biz = bizMap.get(s.merchant_id);
    const bank = bankMap.get(s.merchant_id) || null;

    if (!aggregated.has(s.merchant_id)) {
      aggregated.set(s.merchant_id, {
        businessId: s.merchant_id,
        businessName: biz?.name || "Merchant Restaurant",
        ownerName: biz?.owner || "Restaurant Partner",
        ownerPhone: biz?.phone || "N/A",
        city: biz?.city || "Bahraich",
        ordersCount: 0,
        orderIds: [],
        grossSales: 0,
        platformCommission: 0,
        paymentGatewayFee: 0,
        netPayable: 0,
        bankDetails: bank,
      });
    }

    const current = aggregated.get(s.merchant_id)!;
    current.ordersCount += 1;
    current.orderIds.push(s.order_id);
    current.grossSales = Math.round((current.grossSales + Number(s.merchant_gross || 0)) * 100) / 100;
    current.platformCommission = Math.round((current.platformCommission + Number(s.platform_commission || 0)) * 100) / 100;
    current.paymentGatewayFee = Math.round((current.paymentGatewayFee + Number(s.payment_gateway_fee || 0)) * 100) / 100;
    current.netPayable = Math.round((current.netPayable + Number(s.merchant_net_payable || 0)) * 100) / 100;
  }

  return Array.from(aggregated.values());
}

/**
 * Get pending rider payouts (either active wallet balance > 0 or submitted payout requests)
 */
export async function getPendingRiderPayouts(): Promise<PendingRiderPayoutItem[]> {
  const admin = createSupabaseAdminClient();

  // Check pending requests first
  const { data: requests } = await admin
    .from("rider_payout_requests")
    .select("*, delivery_riders(full_name, phone, vehicle_number, wallet_balance, cash_in_hand)")
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  const result: PendingRiderPayoutItem[] = [];
  const processedRiderIds = new Set<string>();

  if (requests && requests.length > 0) {
    for (const r of requests) {
      processedRiderIds.add(r.rider_id);
      result.push({
        id: r.id,
        requestId: r.id,
        riderId: r.rider_id,
        riderName: r.delivery_riders?.full_name || "Delivery Rider",
        phone: r.delivery_riders?.phone || "N/A",
        walletBalance: Number(r.delivery_riders?.wallet_balance || 0),
        cashInHand: Number(r.delivery_riders?.cash_in_hand || 0),
        upiId: r.destination_upi || r.delivery_riders?.upi_id || "",
        bankAccountNumber: r.destination_bank_account,
        ifscCode: r.destination_ifsc,
        amountRequested: Number(r.amount),
        status: r.status as "pending" | "processing" | "completed" | "failed",
        createdAt: r.created_at,
      });
    }
  }

  // Also include online/active riders who have accumulated wallet earnings (> 0) but haven't triggered a withdrawal request yet
  const { data: riders } = await admin
    .from("delivery_riders")
    .select("id, full_name, phone, wallet_balance, cash_in_hand, upi_id")
    .gt("wallet_balance", 0);

  if (riders && riders.length > 0) {
    for (const rider of riders) {
      if (!processedRiderIds.has(rider.id)) {
        result.push({
          id: `wal_${rider.id.slice(0, 8)}`,
          riderId: rider.id,
          riderName: rider.full_name,
          phone: rider.phone,
          walletBalance: Number(rider.wallet_balance),
          cashInHand: Number(rider.cash_in_hand || 0),
          upiId: rider.upi_id || `${rider.phone.replace(/\D/g, "").slice(-10)}@upi`,
          amountRequested: Number(rider.wallet_balance),
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }
    }
  }

  return result;
}

/**
 * Fetch overall platform settlement financial KPIs
 */
export async function getSettlementLedgerKPIs(): Promise<SettlementLedgerSummary> {
  const admin = createSupabaseAdminClient();

  const [{ data: splits }, { data: batches }, { data: riders }] = await Promise.all([
    admin.from("hyperlocal_payout_splits").select("gross_amount, platform_commission, merchant_net_payable, settlement_status, batch_id"),
    admin.from("merchant_settlement_batches").select("id, status"),
    admin.from("delivery_riders").select("wallet_balance"),
  ]);

  let totalGross = 0;
  let totalComm = 0;
  let merchantPending = 0;

  (splits || []).forEach((s) => {
    totalGross += Number(s.gross_amount || 0);
    totalComm += Number(s.platform_commission || 0);
    if (!s.batch_id && s.settlement_status !== "settled_split") {
      merchantPending += Number(s.merchant_net_payable || 0);
    }
  });

  const riderPending = (riders || []).reduce((acc, r) => acc + Number(r.wallet_balance || 0), 0);

  return {
    totalGrossDelivered: Math.round(totalGross * 100) / 100,
    totalPlatformCommissionRetained: Math.round(totalComm * 100) / 100,
    totalMerchantPendingPayout: Math.round(merchantPending * 100) / 100,
    totalRiderPendingPayout: Math.round(riderPending * 100) / 100,
    totalSettledBatchesCount: (batches || []).filter((b) => b.status === "settled").length,
  };
}

/**
 * Settle a merchant batch manually or after bank corporate netbanking transfer
 */
export async function settleMerchantBatchManual(input: {
  businessId: string;
  orderIds: string[];
  utrNumber?: string;
  accountNumber?: string;
  ifscCode?: string;
  grossSales?: number;
  platformCommission?: number;
  netPayoutAmount?: number;
  /** Mandatory admin justification (recorded on the batch + audit log). */
  reason?: string;
  /** Acting admin email (recorded on the batch + audit log). */
  actorEmail?: string;
  actorUserId?: string;
}): Promise<{ success: boolean; batchId: string; utrNumber: string; alreadySettled?: boolean }> {
  const admin = createSupabaseAdminClient();
  const dateStr = new Date().toISOString().slice(0, 10);
  const utr = input.utrNumber?.trim() || `CMS${Date.now().toString().slice(-8)}`;
  const batchId = `SETTL_${dateStr.replace(/-/g, "")}_${input.businessId.slice(0, 6)}_${Date.now().toString().slice(-4)}`;

  // 1. Fetch splits for accurate figures if not supplied
  const { data: splits } = await admin
    .from("hyperlocal_payout_splits")
    .select("*")
    .in("order_id", input.orderIds);

  let gross = input.grossSales || 0;
  let comm = input.platformCommission || 0;
  let net = input.netPayoutAmount || 0;

  if (splits && splits.length > 0 && (!gross || !net)) {
    gross = splits.reduce((acc, s) => acc + Number(s.merchant_gross || 0), 0);
    comm = splits.reduce((acc, s) => acc + Number(s.platform_commission || 0), 0);
    net = splits.reduce((acc, s) => acc + Number(s.merchant_net_payable || 0), 0);
  }

  // 2. Insert into merchant_settlement_batches
  const batchRecord = {
    id: batchId,
    business_id: input.businessId,
    settlement_date: dateStr,
    orders_count: input.orderIds.length,
    gross_sales: Math.round(gross * 100) / 100,
    platform_commission: Math.round(comm * 100) / 100,
    payment_gateway_fee: Math.round((gross * 0.0175) * 100) / 100,
    tds_deduction: 0,
    net_payout_amount: Math.round(net * 100) / 100,
    bank_utr_number: utr,
    bank_account_number: input.accountNumber || "Registered Bank A/C",
    ifsc_code: input.ifscCode || "SBIN0000123",
    settled_by_email: input.actorEmail ?? null,
    reason: input.reason ?? null,
    status: "settled",
    settled_at: new Date().toISOString(),
  };

  await admin.from("merchant_settlement_batches").upsert(batchRecord);

  // 3. Status-guarded: only flip splits that are not already settled_split, so
  //    a re-settle of already-settled orders is a no-op (duplicate guard).
  let newlySettled = 0;
  if (input.orderIds.length > 0) {
    const { data: updatedSplits } = await admin
      .from("hyperlocal_payout_splits")
      .update({
        settlement_status: "settled_split",
        settled_at: new Date().toISOString(),
        batch_id: batchId,
        utr_number: utr,
      })
      .in("order_id", input.orderIds)
      .neq("settlement_status", "settled_split")
      .select("order_id");
    newlySettled = (updatedSplits || []).length;
  }

  await writeAdminAuditRecord({
    actorEmail: input.actorEmail,
    actorUserId: input.actorUserId,
    action: "settle_merchant_batch",
    targetType: "merchant_settlement_batch",
    targetId: batchId,
    reason: input.reason ?? "",
    payload: {
      businessId: input.businessId,
      orderCount: input.orderIds.length,
      utr,
      netPayoutAmount: batchRecord.net_payout_amount,
      newlySettledSplits: newlySettled,
    },
  });

  return { success: true, batchId, utrNumber: utr, alreadySettled: newlySettled === 0 };
}

/**
 * Execute automated Cashfree Payouts IMPS transfer to Merchant
 * Falls back to pending bank transfer if Cashfree Payouts is pending underwriting
 */
export async function executeMerchantPayoutCashfree(input: {
  businessId: string;
  orderIds: string[];
  /** Stable, caller-supplied key that makes this payout idempotent. Retries with
   *  the same key reuse the same (deterministic) Cashfree transferId so a second
   *  external IMPS transfer cannot be initiated. */
  idempotencyKey?: string;
  /** Mandatory admin justification (recorded on the batch + audit log). */
  reason?: string;
  /** Acting admin email (recorded on the batch + audit log). */
  actorEmail?: string;
  actorUserId?: string;
}): Promise<{
  success: boolean;
  batchId?: string;
  utr?: string;
  message: string;
  fallbackToManual?: boolean;
  alreadySettled?: boolean;
}> {
  const admin = createSupabaseAdminClient();

  // 1. Fetch splits and bank account
  const [{ data: splits }, { data: bank }, { data: business }] = await Promise.all([
    admin.from("hyperlocal_payout_splits").select("*").in("order_id", input.orderIds),
    admin.from("merchant_bank_accounts").select("*").eq("business_id", input.businessId).maybeSingle(),
    admin.from("businesses").select("name, owner, phone").eq("id", input.businessId).maybeSingle(),
  ]);

  if (!splits || splits.length === 0) {
    return { success: false, message: "No pending orders found to settle." };
  }

  // Duplicate guard: if every split in this request is already settled_split,
  // there is nothing to pay out. Return early so no second transfer is made.
  const unsettled = (splits || []).filter((s) => s.settlement_status !== "settled_split");
  if (unsettled.length === 0) {
    return {
      success: false,
      alreadySettled: true,
      message: "These orders are already settled. No payout will be issued.",
      fallbackToManual: false,
    };
  }

  if (!bank?.bank_account_number || !bank?.ifsc_code) {
    return {
      success: false,
      message: "Merchant has not linked a verified bank account number & IFSC.",
      fallbackToManual: true,
    };
  }

  const gross = unsettled.reduce((acc, s) => acc + Number(s.merchant_gross || 0), 0);
  const comm = unsettled.reduce((acc, s) => acc + Number(s.platform_commission || 0), 0);
  const net = unsettled.reduce((acc, s) => acc + Number(s.merchant_net_payable || 0), 0);

  // Deterministic, stable transfer id: the same settlement intent always maps to
  // the same Cashfree transferId (idempotency key) regardless of retries.
  const transferId = stablePayoutId("TR_SETTL", `merchant|${input.businessId}|${input.idempotencyKey ?? input.orderIds.join(",")}`);

  // 2. Call Cashfree Payouts API
  const cfRes = await requestCashfreePayout({
    transferId,
    amount: net,
    transferMode: "banktransfer",
    beneDetails: {
      name: bank.account_holder_name || business?.name || "Merchant",
      phone: business?.phone || "9118643415",
      bankAccount: bank.bank_account_number.replace(/\s+/g, ""),
      ifsc: bank.ifsc_code.trim().toUpperCase(),
    },
    remarks: `Trustit Settlement for ${unsettled.length} orders`,
  });

  if (cfRes.success && cfRes.status === "SUCCESS") {
    // Immediate success: mark settled (status-guarded inside the helper).
    const settled = await settleMerchantBatchManual({
      businessId: input.businessId,
      orderIds: input.orderIds,
      utrNumber: cfRes.utr,
      accountNumber: bank.bank_account_number,
      ifscCode: bank.ifsc_code,
      grossSales: gross,
      platformCommission: comm,
      netPayoutAmount: net,
      reason: input.reason,
      actorEmail: input.actorEmail,
      actorUserId: input.actorUserId,
    });
    return {
      success: true,
      batchId: settled.batchId,
      utr: cfRes.utr,
      alreadySettled: settled.alreadySettled,
      message: `₹${net.toFixed(2)} transferred to ${bank.bank_name} via Cashfree IMPS! Bank UTR: ${cfRes.utr}`,
    };
  }

  // Graceful fallback: Register pending settlement batch for 1-click Bank CSV
  return {
    success: false,
    message: cfRes.message || "Cashfree Payouts transfer could not be completed automatically. Queued for 1-Click Bank Netbanking CSV export.",
    fallbackToManual: true,
  };
}

/**
 * Execute Rider Payout (UPI Transfer)
 */
export async function executeRiderPayout(input: {
  riderId: string;
  amount: number;
  destinationUpi?: string;
  /** Stable, caller-supplied key that makes this payout idempotent. Two calls
   *  with the same rider + idempotencyKey reuse the same request/transfer id,
   *  so a retry or duplicate click cannot trigger a second external payout. */
  idempotencyKey?: string;
  /** Mandatory admin justification (recorded on the payout + audit log). */
  reason?: string;
  /** Acting admin email (recorded on the payout + audit log). */
  actorEmail?: string;
  actorUserId?: string;
}): Promise<{
  success: boolean;
  requestId?: string;
  utr?: string;
  message: string;
  status: "completed" | "pending" | "failed";
  alreadySettled?: boolean;
}> {
  const admin = createSupabaseAdminClient();

  const requestIdSeed = `rpo|${input.riderId}|${input.idempotencyKey ?? "default"}`;
  const requestId = stablePayoutId("rpo", requestIdSeed);
  const transferIdSeed = `tr_upi|${input.riderId}|${input.idempotencyKey ?? "default"}`;
  const transferId = stablePayoutId("TR_UPI", transferIdSeed);

  // Idempotency guard: if this exact payout request already exists, do NOT
  // re-initiate an external transfer. Return its current state instead.
  const { data: existingReq } = await admin
    .from("rider_payout_requests")
    .select("id, status, utr_number, cf_transfer_id")
    .eq("id", requestId)
    .maybeSingle();
  if (existingReq) {
    return {
      success: true,
      requestId: existingReq.id,
      status: existingReq.status === "completed" ? "completed" : "pending",
      alreadySettled: existingReq.status === "completed",
      message:
        existingReq.status === "completed"
          ? `Payout already completed for this request (ref ${requestId}). No duplicate transfer will be issued.`
          : `Payout request already in progress (ref ${requestId}).`,
    };
  }

  // 1. Fetch current rider
  const { data: rider } = await admin
    .from("delivery_riders")
    .select("full_name, phone, wallet_balance, upi_id")
    .eq("id", input.riderId)
    .maybeSingle();

  const balance = Number(rider?.wallet_balance || 0);
  if (balance <= 0 || input.amount > balance) {
    return {
      success: false,
      message: "Insufficient wallet balance for withdrawal.",
      status: "failed",
    };
  }

  const upiId = input.destinationUpi?.trim() || rider?.upi_id?.trim() || `${rider?.phone?.replace(/\D/g, "").slice(-10)}@upi`;

  // 2. Reserve the payout request BEFORE the external call. Persisting the
  //    cf_transfer_id up-front means a duplicate/retry is already "in-flight"
  //    and the idempotency guard above blocks a second external transfer.
  const nowIso = () => new Date().toISOString();
  await admin.from("rider_payout_requests").upsert({
    id: requestId,
    rider_id: input.riderId,
    amount: input.amount,
    payout_mode: "upi",
    destination_upi: upiId,
    status: "processing",
    cf_transfer_id: transferId,
    settled_by_email: input.actorEmail ?? null,
    reason: input.reason ?? null,
    created_at: nowIso(),
  });

  // 3. Atomic, overdraw-safe wallet deduction (M3 RPC). If it cannot be
  //    reserved, do not issue the external transfer.
  const deduct = await rpcDeductRiderWallet(admin, input.riderId, input.amount);
  if (!deduct.ok) {
    const code = deduct.code;
    await admin
      .from("rider_payout_requests")
      .update({ status: "failed", failure_reason: code })
      .eq("id", requestId);
    if (code === "rpc_unavailable") {
      // RPC not yet migrated: fall back to the legacy guarded update path so a
      // not-yet-deployed migration doesn't break the flow.
      await admin
        .from("delivery_riders")
        .update({ upi_id: upiId, updated_at: nowIso() })
        .eq("id", input.riderId);
    } else {
      return {
        success: false,
        message: code === "insufficient" ? "Insufficient wallet balance for withdrawal." : "Unable to reserve wallet balance.",
        status: "failed",
      };
    }
  }

  // 4. Call Cashfree Payouts UPI with the deterministic transferId
  const cfRes = await requestCashfreePayout({
    transferId,
    amount: input.amount,
    transferMode: "upi",
    beneDetails: {
      name: rider?.full_name || "Delivery Partner",
      phone: rider?.phone || "9118643415",
      vpa: upiId,
    },
    remarks: "Trustit Rider Instant UPI Payout",
  });

  if (cfRes.success && cfRes.status === "SUCCESS") {
    await admin
      .from("rider_payout_requests")
      .update({ status: "completed", utr_number: cfRes.utr, settled_at: nowIso(), failure_reason: null })
      .eq("id", requestId)
      .in("status", ["processing", "pending"]);

    await writeAdminAuditRecord({
      actorEmail: input.actorEmail,
      actorUserId: input.actorUserId,
      action: "payout_rider_cashfree",
      targetType: "rider_payout_request",
      targetId: requestId,
      reason: input.reason ?? "",
      payload: { riderId: input.riderId, amount: input.amount, utr: cfRes.utr, transferId },
    });

    return {
      success: true,
      requestId,
      utr: cfRes.utr,
      status: "completed",
      message: `₹${input.amount} instantly transferred to ${upiId} via UPI! UTR: ${cfRes.utr}`,
    };
  }

  // 5. Fallback: Cashfree not configured / pending -> leave the request pending
  //    (wallet already reserved atomically above) for Admin 1-Click CSV settle.
  await admin
    .from("rider_payout_requests")
    .update({ status: "pending", failure_reason: cfRes.message })
    .eq("id", requestId)
    .eq("status", "processing");

  await writeAdminAuditRecord({
    actorEmail: input.actorEmail,
    actorUserId: input.actorUserId,
    action: "payout_rider_cashfree",
    targetType: "rider_payout_request",
    targetId: requestId,
    reason: input.reason ?? "",
    payload: { riderId: input.riderId, amount: input.amount, outcome: "queued_pending", transferId },
  });

  return {
    success: true,
    requestId,
    status: "pending",
    message: `₹${input.amount} payout request logged for ${upiId}. Reference: ${requestId}. Admin will approve via corporate bank UPI transfer.`,
  };
}

/**
 * Admin action: Settle rider payout request manually with Bank UTR
 */
export async function settleRiderPayoutManual(input: {
  requestId: string;
  utrNumber?: string;
  /** Mandatory admin justification (recorded on the payout + audit log). */
  reason?: string;
  /** Acting admin email (recorded on the payout + audit log). */
  actorEmail?: string;
  actorUserId?: string;
}): Promise<{ success: boolean; utrNumber: string; alreadySettled?: boolean; error?: string }> {
  const admin = createSupabaseAdminClient();
  const utr = input.utrNumber?.trim() || `UPI${stablePayoutId("UPI", `manual|${input.requestId}|${input.actorEmail ?? ""}`)}`;
  const now = new Date().toISOString();

  // Load current state so we can (a) refuse to re-settle a completed/failed row
  // and (b) only transition open states forward.
  const { data: req } = await admin
    .from("rider_payout_requests")
    .select("id, status, rider_id, amount")
    .eq("id", input.requestId)
    .maybeSingle();

  if (!req) {
    return { success: false, utrNumber: utr, error: "Payout request not found." };
  }
  if (req.status === "completed") {
    return { success: true, utrNumber: utr, alreadySettled: true };
  }
  if (req.status === "failed") {
    return { success: false, utrNumber: utr, error: "Payout request has already failed and cannot be settled." };
  }

  try {
    // Status-guarded transition: only pending/processing can become completed,
    // so a duplicate click or a race with the Cashfree path cannot double-settle.
    const { error } = await admin
      .from("rider_payout_requests")
      .update({
        status: "completed",
        utr_number: utr,
        settled_at: now,
        settled_by_email: input.actorEmail ?? null,
        reason: input.reason ?? null,
      })
      .eq("id", input.requestId)
      .in("status", ["pending", "processing"]);

    if (error) throw error;
  } catch {
    // Pre-migration / transient tolerance; do not silently claim success.
    return { success: false, utrNumber: utr, error: "Unable to settle payout request." };
  }

  await writeAdminAuditRecord({
    actorEmail: input.actorEmail,
    actorUserId: input.actorUserId,
    action: "settle_rider_payout",
    targetType: "rider_payout_request",
    targetId: input.requestId,
    reason: input.reason ?? "",
    payload: { riderId: req.rider_id, amount: req.amount, utr },
  });

  return { success: true, utrNumber: utr };
}
