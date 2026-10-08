import type { Metadata } from "next";
import Link from "next/link";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({ title: "Refund Policy | Trustit", description: "How to contact Trustit about duplicate, failed or disputed plan payments.", path: "/refund-policy" });

export default function RefundPolicyPage() {
  return <TrustitPublicPage title="Refund Policy" intro="Contact Trustit promptly if a payment appears duplicated, remains unconfirmed, or does not match your selected plan.">
    <h2>Payment problems</h2><p>If checkout fails, an amount is debited but the order is not confirmed, or you believe you were charged more than once, contact Trustit with the business ID (if available), payment date, amount and Cashfree order/reference ID. Do not send card numbers, CVV, passwords or one-time codes.</p>
    <h2>Review and resolution</h2><p>Trustit will check the payment status with the payment provider and the account record, then respond about the next step. The application currently does not publish an automatic refund workflow, fixed response time, or blanket refund guarantee. Refund eligibility and processing depend on the transaction facts, provider process and applicable law. This policy does not limit any mandatory consumer rights.</p>
    <h2>Contact</h2>{trustitPublicInfo.supportEmail ? <p>Email <a href={`mailto:${trustitPublicInfo.supportEmail}`}>{trustitPublicInfo.supportEmail}</a> with the relevant order information.</p> : <p>The support email has not yet been configured. Trustit must publish a monitored customer support contact before accepting public payment submissions. For current contact channels, see <Link href="/contact">Contact Trustit</Link>.</p>}
  </TrustitPublicPage>;
}
