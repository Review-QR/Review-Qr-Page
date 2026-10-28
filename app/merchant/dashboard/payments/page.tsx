import { requireActiveMerchant } from "@/lib/merchant-auth";
import PaymentHistory from "../payment-history";
import MerchantPayoutsClient from "./merchant-payouts-client";
import {
  getMerchantBankDetails,
  getMerchantFinancialSummary,
  getMerchantKycDocuments,
  getMerchantSettlementLedger,
} from "@/lib/bank-payouts-service";

export const dynamic = "force-dynamic";

export default async function MerchantPaymentsPage() {
  const merchant = await requireActiveMerchant();

  const [bankDetails, financialSummary, settlements, kycDocuments] = await Promise.all([
    getMerchantBankDetails(merchant.businessId),
    getMerchantFinancialSummary(merchant.businessId),
    getMerchantSettlementLedger(merchant.businessId),
    getMerchantKycDocuments(merchant.businessId),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <MerchantPayoutsClient
        business={{
          id: merchant.businessId,
          name: merchant.businessName,
          city: merchant.city,
          businessType: merchant.businessType,
        }}
        bankDetails={bankDetails}
        financialSummary={financialSummary}
        settlements={settlements}
        kycDocuments={kycDocuments}
      >
        <PaymentHistory businessId={merchant.businessId} />
      </MerchantPayoutsClient>
    </div>
  );
}
