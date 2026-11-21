import "server-only";

import { createSupabaseAdminClient } from "@/lib/supabase-admin";

// ---- Types ----------------------------------------------------------------

export interface CustomerWallet {
  walletId: string;
  customerId: string;
  balanceInr: number;
  currency: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: "credit" | "debit" | "refund" | "bonus" | "topup" | "payment";
  amountInr: number;
  balanceAfterInr: number;
  referenceType: string | null;
  referenceId: string | null;
  paymentMethod: string | null;
  description: string;
  createdAt: string;
}

export interface WalletState {
  wallet: CustomerWallet;
  recentTransactions: WalletTransaction[];
}

// ---- Functions ------------------------------------------------------------

/**
 * Get or create a customer's wallet.
 * Idempotent: if wallet already exists, returns it.
 */
export async function getOrCreateCustomerWallet(customerId: string): Promise<CustomerWallet> {
  const admin = createSupabaseAdminClient();

  // Try to find existing wallet
  const { data: existing, error: findError } = await admin
    .from("customer_wallets")
    .select("id, customer_id, balance_inr, currency, is_active, created_at, updated_at")
    .eq("customer_id", customerId)
    .maybeSingle();

  if (findError) {
    throw new Error(`Failed to fetch customer wallet: ${findError.message}`);
  }

  if (existing) {
    return {
      walletId: existing.id,
      customerId: existing.customer_id,
      balanceInr: Number(existing.balance_inr) || 0,
      currency: existing.currency || "INR",
      isActive: existing.is_active !== false,
      createdAt: existing.created_at,
      updatedAt: existing.updated_at,
    };
  }

  // Wallet doesn't exist — create it via RPC (safe even under concurrency)
  const { data: created, error: createError } = await admin
    .rpc("ensure_customer_wallet", { p_customer: customerId });

  if (createError) {
    throw new Error(`Failed to create customer wallet: ${createError.message}`);
  }

  const walletId: string = created;
  const { data: fresh, error: freshError } = await admin
    .from("customer_wallets")
    .select("id, customer_id, balance_inr, currency, is_active, created_at, updated_at")
    .eq("id", walletId)
    .single();

  if (freshError || !fresh) {
    throw new Error("Wallet created but could not be read back");
  }

  return {
    walletId: fresh.id,
    customerId: fresh.customer_id,
    balanceInr: Number(fresh.balance_inr) || 0,
    currency: fresh.currency || "INR",
    isActive: fresh.is_active !== false,
    createdAt: fresh.created_at,
    updatedAt: fresh.updated_at,
  };
}

/**
 * Credit (add to) the customer's wallet balance.
 * Writes a transaction ledger entry atomically.
 */
export async function creditCustomerWallet(
  customerId: string,
  amountInr: number,
  opts?: {
    type?: "topup" | "refund" | "bonus";
    referenceType?: string;
    referenceId?: string;
    paymentMethod?: string;
    description?: string;
  }
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (amountInr <= 0) {
    return { success: false, newBalance: 0, error: "Amount must be positive" };
  }

  const wallet = await getOrCreateCustomerWallet(customerId);
  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.rpc("adjust_wallet_balance", {
    p_wallet: wallet.walletId,
    p_amount: amountInr,
    p_type: opts?.type ?? "topup",
    p_description: opts?.description ?? "Wallet credit",
    p_reference_type: opts?.referenceType ?? null,
    p_reference_id: opts?.referenceId ?? null,
  });

  if (error) {
    return { success: false, newBalance: wallet.balanceInr, error: error.message };
  }

  const row = (data ?? {}) as { ok?: boolean; code?: string; new_balance?: number };
  if (!row.ok) {
    return { success: false, newBalance: wallet.balanceInr, error: row.code ?? "Credit failed" };
  }

  return { success: true, newBalance: Number(row.new_balance ?? amountInr) };
}

/**
 * Debit (subtract from) the customer's wallet balance.
 * Atomic: rejects if insufficient balance.
 */
export async function debitCustomerWallet(
  customerId: string,
  amountInr: number,
  opts?: {
    type?: "payment";
    referenceType?: string;
    referenceId?: string;
    description?: string;
  }
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (amountInr <= 0) {
    return { success: false, newBalance: 0, error: "Amount must be positive" };
  }

  const wallet = await getOrCreateCustomerWallet(customerId);

  if (wallet.balanceInr < amountInr) {
    return {
      success: false,
      newBalance: wallet.balanceInr,
      error: "Insufficient wallet balance",
    };
  }

  const admin = createSupabaseAdminClient();

  const { data, error } = await admin.rpc("adjust_wallet_balance", {
    p_wallet: wallet.walletId,
    p_amount: amountInr,
    p_type: "debit",
    p_description: opts?.description ?? "Wallet debit",
    p_reference_type: opts?.referenceType ?? null,
    p_reference_id: opts?.referenceId ?? null,
  });

  if (error) {
    return { success: false, newBalance: wallet.balanceInr, error: error.message };
  }

  const row = (data ?? {}) as { ok?: boolean; code?: string; new_balance?: number };
  if (!row.ok) {
    return { success: false, newBalance: wallet.balanceInr, error: row.code ?? "Debit failed" };
  }

  return { success: true, newBalance: Number(row.new_balance ?? 0) };
}

/**
 * Get wallet state with recent transactions.
 */
export async function getCustomerWalletState(
  customerId: string,
  txLimit = 10
): Promise<WalletState> {
  const wallet = await getOrCreateCustomerWallet(customerId);
  const admin = createSupabaseAdminClient();

  const { data: txs, error: txError } = await admin
    .from("wallet_transactions")
    .select("id, wallet_id, type, amount_inr, balance_after_inr, reference_type, reference_id, payment_method, description, created_at")
    .eq("wallet_id", wallet.walletId)
    .order("created_at", { ascending: false })
    .limit(txLimit);

  if (txError) {
    throw new Error(`Failed to fetch wallet transactions: ${txError.message}`);
  }

  const recentTransactions: WalletTransaction[] = (txs ?? []).map((t) => ({
    id: t.id,
    walletId: t.wallet_id,
    type: (t.type as WalletTransaction["type"]) ?? "payment",
    amountInr: Number(t.amount_inr) || 0,
    balanceAfterInr: Number(t.balance_after_inr) || 0,
    referenceType: t.reference_type ?? null,
    referenceId: t.reference_id ?? null,
    paymentMethod: t.payment_method ?? null,
    description: t.description ?? "",
    createdAt: t.created_at,
  }));

  return { wallet, recentTransactions };
}
