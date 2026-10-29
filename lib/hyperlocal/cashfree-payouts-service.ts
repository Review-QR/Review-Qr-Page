export type CashfreePayoutEnvironment = "sandbox" | "production";

export interface CashfreeBeneDetails {
  beneId?: string;
  name: string;
  email?: string;
  phone: string;
  bankAccount?: string;
  ifsc?: string;
  vpa?: string; // UPI ID (e.g. luckyshukla@oksbi)
  address1?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export interface RequestPayoutTransferInput {
  transferId: string;
  amount: number;
  transferMode: "upi" | "banktransfer" | "imps" | "neft";
  beneDetails: CashfreeBeneDetails;
  remarks?: string;
}

export interface CashfreePayoutTransferResult {
  success: boolean;
  status: "SUCCESS" | "PENDING" | "FAILED" | "REJECTED";
  utr?: string;
  referenceId?: string;
  transferId: string;
  message: string;
  fallbackToManual?: boolean;
  rawResponse?: Record<string, unknown>;
}

// In-memory token cache for Cashfree Payouts Bearer token
let cachedAuthToken: { token: string; expiresAt: number } | null = null;

export function getCashfreePayoutsConfig() {
  const env = (process.env.CASHFREE_PAYOUTS_ENV || process.env.CASHFREE_ENVIRONMENT || "sandbox").trim().toLowerCase() as CashfreePayoutEnvironment;
  const clientId = (process.env.CASHFREE_PAYOUTS_CLIENT_ID || process.env.CASHFREE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.CASHFREE_PAYOUTS_CLIENT_SECRET || process.env.CASHFREE_CLIENT_SECRET || "").trim();

  const baseUrl = env === "production"
    ? "https://payout-api.cashfree.com/payout"
    : "https://payout-gamma.cashfree.com/payout";

  return {
    environment: env,
    clientId,
    clientSecret,
    baseUrl,
    isConfigured: Boolean(clientId && clientSecret),
  };
}

export function isCashfreePayoutsConfigured(): boolean {
  return getCashfreePayoutsConfig().isConfigured;
}

/**
 * Authorize and get Cashfree Payouts Bearer Token
 * Cached for 50 minutes (Cashfree token lasts 60 mins).
 */
export async function authorizeCashfreePayouts(): Promise<{ success: boolean; token?: string; error?: string }> {
  const config = getCashfreePayoutsConfig();

  if (!config.isConfigured) {
    return { success: false, error: "Cashfree Payouts credentials not configured in environment." };
  }

  // Return cached token if still valid for at least 5 minutes
  if (cachedAuthToken && cachedAuthToken.expiresAt > Date.now() + 5 * 60 * 1000) {
    return { success: true, token: cachedAuthToken.token };
  }

  try {
    const authUrl = `${config.baseUrl}/v1/authorize`;
    const response = await fetch(authUrl, {
      method: "POST",
      headers: {
        "X-Client-Id": config.clientId,
        "X-Client-Secret": config.clientSecret,
      },
      cache: "no-store",
    });

    const data = await response.json();

    if (response.ok && data.status === "SUCCESS" && data.data?.token) {
      cachedAuthToken = {
        token: data.data.token,
        expiresAt: Date.now() + 50 * 60 * 1000, // 50 mins
      };
      return { success: true, token: data.data.token };
    }

    return {
      success: false,
      error: data.message || `Cashfree Payouts auth failed with status ${response.status}`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error connecting to Cashfree Payouts API";
    return { success: false, error: message };
  }
}

/**
 * Execute a Payout transfer via Cashfree Direct Payouts API (UPI or IMPS Bank Transfer).
 * If Cashfree Payouts is pending underwriting or fails due to sandbox / policy limitations,
 * it returns a structured result with fallbackToManual=true so the admin can settle via 1-click Bank CSV.
 */
export async function requestCashfreePayout(
  input: RequestPayoutTransferInput,
): Promise<CashfreePayoutTransferResult> {
  const config = getCashfreePayoutsConfig();

  // If not configured, gracefully return fallback
  if (!config.isConfigured) {
    return {
      success: false,
      status: "FAILED",
      transferId: input.transferId,
      message: "Cashfree Payouts credentials not configured. Please use 1-Click Bank Netbanking CSV export or manual settlement.",
      fallbackToManual: true,
    };
  }

  const auth = await authorizeCashfreePayouts();
  if (!auth.success || !auth.token) {
    return {
      success: false,
      status: "FAILED",
      transferId: input.transferId,
      message: `Cashfree Payouts authorization error: ${auth.error || "Unable to generate bearer token"}. Payout queued for Bank CSV export.`,
      fallbackToManual: true,
    };
  }

  try {
    const transferUrl = `${config.baseUrl}/v1.2/requestTransfer`;
    const transferMode = input.transferMode === "neft" ? "banktransfer" : (input.transferMode === "imps" ? "banktransfer" : input.transferMode);

    const payload = {
      transferId: input.transferId,
      amount: input.amount.toFixed(2),
      transferMode,
      remarks: input.remarks || "Trustit SuperApp Settlement",
      beneDetails: {
        beneId: input.beneDetails.beneId || `bene_${Date.now()}`,
        name: input.beneDetails.name,
        email: input.beneDetails.email || "partner@trustitreview.com",
        phone: input.beneDetails.phone.replace(/\D/g, "").slice(-10) || "9118643415",
        bankAccount: input.beneDetails.bankAccount,
        ifsc: input.beneDetails.ifsc,
        vpa: input.beneDetails.vpa,
        address1: input.beneDetails.address1 || "Bahraich City",
        city: input.beneDetails.city || "Bahraich",
        state: input.beneDetails.state || "Uttar Pradesh",
        pincode: input.beneDetails.pincode || "271801",
      },
    };

    const res = await fetch(transferUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const data = await res.json();

    if (res.ok && (data.status === "SUCCESS" || data.subCode === "200" || data.subCode === "201")) {
      const transferData = data.data || {};
      const isSuccess = transferData.status === "SUCCESS";
      return {
        success: true,
        status: isSuccess ? "SUCCESS" : "PENDING",
        transferId: input.transferId,
        referenceId: transferData.referenceId || String(data.referenceId || ""),
        utr: transferData.utr || `CF${Date.now().toString().slice(-8)}`,
        message: data.message || `₹${input.amount} transfer processed successfully via Cashfree.`,
        rawResponse: data,
      };
    }

    // Cashfree returned an operational error (e.g., INSUFFICIENT_BALANCE, ACCOUNT_NOT_ACTIVE)
    return {
      success: false,
      status: "FAILED",
      transferId: input.transferId,
      message: data.message || `Cashfree transfer rejected: ${data.subCode || res.status}`,
      fallbackToManual: true,
      rawResponse: data,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to communicate with Cashfree Payouts API";
    return {
      success: false,
      status: "FAILED",
      transferId: input.transferId,
      message: `${errorMsg}. Payout queued for Bank Netbanking settlement.`,
      fallbackToManual: true,
    };
  }
}

/**
 * Fetch Cashfree Payouts Available Float Balance
 */
export async function getCashfreePayoutBalance(): Promise<{
  success: boolean;
  balance?: number;
  availableBalance?: number;
  error?: string;
}> {
  const config = getCashfreePayoutsConfig();
  if (!config.isConfigured) {
    return { success: false, error: "Cashfree Payouts not configured." };
  }

  const auth = await authorizeCashfreePayouts();
  if (!auth.success || !auth.token) {
    return { success: false, error: auth.error || "Payouts token expired" };
  }

  try {
    const res = await fetch(`${config.baseUrl}/v1.2/getBalance`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
      cache: "no-store",
    });

    const data = await res.json();
    if (res.ok && data.status === "SUCCESS" && data.data) {
      return {
        success: true,
        balance: Number(data.data.balance || 0),
        availableBalance: Number(data.data.availableBalance || 0),
      };
    }

    return { success: false, error: data.message || "Failed to fetch balance." };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { success: false, error: message };
  }
}
