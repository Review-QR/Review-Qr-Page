import type { Metadata } from "next";
import Link from "next/link";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({ title: "About Trustit", description: "Learn about Trustit's QR-led review journey and merchant tools.", path: "/about" });

export default function AboutPage() {
  return <TrustitPublicPage title="About Trustit" intro="Trustit helps businesses connect an in-person QR scan with their online review destination.">
    <h2>What the service provides</h2><p>A business can create a profile, add its Google Review link, and use a Trustit QR that opens the customer review journey. The merchant dashboard provides business, QR, scan and account/payment information. Customers choose whether to share feedback and whether to continue to the external Google page.</p>
    <h2>Business operator</h2><p>{trustitPublicInfo.legalName ?? "The legal operator name has not yet been configured for publication."}</p><p>{trustitPublicInfo.businessAddress ?? "The operator's business address has not yet been configured for publication."}</p>
    <p>See <Link href="/pricing">plans and pricing</Link>, our <Link href="/privacy-policy">Privacy Policy</Link>, and <Link href="/contact">contact information</Link>.</p>
  </TrustitPublicPage>;
}
