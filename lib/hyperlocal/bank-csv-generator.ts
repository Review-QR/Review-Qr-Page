export interface CsvMerchantInput {
  businessId: string;
  businessName: string;
  ownerPhone?: string;
  ordersCount: number;
  netPayable: number;
  bankDetails?: {
    account_holder_name?: string;
    bank_account_number?: string;
    ifsc_code?: string;
  } | null;
}

export interface CsvRiderInput {
  riderId: string;
  riderName: string;
  phone: string;
  walletBalance: number;
  amountRequested?: number;
  upiId?: string;
}

/**
 * Generate standard Indian Netbanking Bulk Payment CSV
 * Compatible with SBI Corporate Portal (CMP), HDFC E-Net, ICICI Corporate Netbanking
 */
export function generateBankBulkCsv(input: {
  merchants?: CsvMerchantInput[];
  riders?: CsvRiderInput[];
}): string {
  const headers = [
    "Transaction_Type",
    "Beneficiary_Account_Or_VPA",
    "Beneficiary_IFSC",
    "Beneficiary_Name",
    "Amount_INR",
    "Sender_Reference_No",
    "Narration",
    "Beneficiary_Mobile",
  ];

  const rows: string[][] = [];

  // 1. Merchant IMPS/NEFT transfers
  if (input.merchants && input.merchants.length > 0) {
    for (const m of input.merchants) {
      if (m.netPayable <= 0) continue;
      const acc = m.bankDetails?.bank_account_number?.replace(/\s+/g, "") || "AWAITING_BANK_DETAILS";
      const ifsc = m.bankDetails?.ifsc_code || "SBIN0000123";
      const ref = `TR_SETTL_${m.businessId.slice(0, 6)}_${Date.now().toString().slice(-4)}`;
      rows.push([
        "IMPS",
        `"${acc}"`,
        `"${ifsc}"`,
        `"${(m.bankDetails?.account_holder_name || m.businessName).replace(/"/g, '""')}"`,
        m.netPayable.toFixed(2),
        `"${ref}"`,
        `"Trustit Merchant Settlement - ${m.ordersCount} Orders"`,
        `"${(m.ownerPhone || "9118643415").replace(/\D/g, "")}"`,
      ]);
    }
  }

  // 2. Rider UPI transfers
  if (input.riders && input.riders.length > 0) {
    for (const r of input.riders) {
      const amount = r.amountRequested || r.walletBalance;
      if (amount <= 0) continue;
      const vpa = r.upiId || `${r.phone.replace(/\D/g, "").slice(-10)}@upi`;
      const ref = `TR_UPI_${r.riderId.slice(0, 6)}_${Date.now().toString().slice(-4)}`;
      rows.push([
        "UPI",
        `"${vpa}"`,
        `"UPI"`,
        `"${r.riderName.replace(/"/g, '""')}"`,
        amount.toFixed(2),
        `"${ref}"`,
        `"Trustit Rider Trip Earnings Payout"`,
        `"${r.phone.replace(/\D/g, "")}"`,
      ]);
    }
  }

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}
