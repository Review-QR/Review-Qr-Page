import type { Metadata } from "next";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({ title: "Terms and Conditions | Trustit", description: "Terms for Trustit business QR, dashboard, review and subscription services.", path: "/terms" });

export default function TermsPage() {
  return <TrustitPublicPage title="Terms and Conditions" intro="These terms cover use of Trustit's business QR, review journey and merchant dashboard.">
    <p><strong>Service operator:</strong> {trustitPublicInfo.legalName ?? "The legal operator name must be configured before commercial submission."}{trustitPublicInfo.businessAddress ? `, ${trustitPublicInfo.businessAddress}` : " The operator address is not yet configured."}</p>
    <h2>Using Trustit</h2><p>Trustit provides business QR pages, links to a business's Google Review destination, QR scan information, and account/dashboard tools. You must provide accurate business information and use the service lawfully. Keep account credentials secure and notify Trustit if you suspect unauthorized access.</p>
    <h2>Plans, payment and service period</h2><p>Current plans and terms appear on the <a href="/pricing">Pricing page</a> and during checkout. A plan is paid once for its stated term. Recurring billing is not enabled. Activation follows payment-provider confirmation and application processing. Renewal requires a separate action. Continued access may be affected by expiration, account status or a security/legal requirement.</p>
    <h2>Reviews and external services</h2><p>Customers decide whether and what to review. Merchants must not condition benefits on a positive rating, pressure customers to submit a particular review, or misrepresent feedback. Google and other external services are operated under their own terms; Trustit does not control their availability, content, ranking or decisions.</p>
    <h2>Availability and account action</h2><p>We aim to operate the service reliably, but do not promise uninterrupted access or a particular business result, review volume or Google outcome. We may restrict access when needed to address misuse, security issues, payment disputes or legal obligations, consistent with applicable requirements.</p>
    <h2>Payments, refunds and contact</h2><p>Payment issue handling is described in the <a href="/refund-policy">Refund Policy</a>. Contact Trustit through the <a href="/contact">Contact page</a> for account or service questions. Any mandatory rights under applicable law remain unaffected.</p>
  </TrustitPublicPage>;
}
