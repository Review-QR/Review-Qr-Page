import type { Metadata } from "next";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({ title: "Contact Trustit", description: "Contact details for Trustit merchant, payment and privacy questions.", path: "/contact" });

export default function ContactPage() {
  const hasContact = trustitPublicInfo.supportEmail || trustitPublicInfo.supportPhone;
  return <TrustitPublicPage title="Contact Trustit" intro="For business account, payment, privacy or service questions, use the published contact channel below.">
    {hasContact ? <div className="space-y-3">{trustitPublicInfo.supportEmail && <p>Email: <a href={`mailto:${trustitPublicInfo.supportEmail}`}>{trustitPublicInfo.supportEmail}</a></p>}{trustitPublicInfo.supportPhone && <p>Phone: <a href={`tel:${trustitPublicInfo.supportPhone}`}>{trustitPublicInfo.supportPhone}</a></p>}</div> : <div className="rounded-2xl border border-amber-300 bg-amber-50 p-5 text-amber-950"><h2 className="font-semibold">Support contact not configured</h2><p className="mt-2">A monitored customer support email or phone number has not been configured for public display. The site operator must set one before submitting the site for payment-provider review or accepting public payments.</p></div>}
    <h2>Business operator</h2><p>{trustitPublicInfo.legalName ?? "The legal business/operator name is not yet configured for public display."}</p><p>{trustitPublicInfo.businessAddress ?? "The business contact address is not yet configured for public display."}</p>
    <h2>Helpful information to include</h2><p>For a payment question, include the order/reference ID, date, amount and business ID if available. Never send a password, OTP, full payment card number or CVV.</p>
  </TrustitPublicPage>;
}
