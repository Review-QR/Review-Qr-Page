import type { Metadata } from "next";
import Link from "next/link";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo, trustitPublicPlans } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({ title: "Pricing | Trustit", description: "Trustit business plans, current prices, service term, payment and renewal information.", path: "/pricing" });

export default function PricingPage() {
  return <TrustitPublicPage title="Plans and pricing" intro="Choose a Trustit plan for your business QR and merchant dashboard.">
    <p>Each plan is a one-time payment for the stated service term. Automatic recurring billing is not enabled; a renewal is a separate action.</p>
    <div className="not-prose mt-6 grid gap-4 sm:grid-cols-3">{trustitPublicPlans.map((plan) => <section key={plan.name} className="rounded-2xl border border-slate-200 p-5"><h2 className="font-semibold text-slate-900">{plan.name}</h2><p className="mt-3 text-3xl font-bold text-blue-800">₹{plan.price}</p><p className="mt-1 text-sm text-slate-600">{plan.durationDays} days</p><p className="mt-4 text-sm leading-6 text-slate-600">Trustit business QR and merchant dashboard access for the selected term.</p></section>)}</div>
    <p>The current product flow lists the three plan names, prices and service terms above; it does not define different feature entitlements between these plan tiers.</p>
    <h2>Payment and activation</h2><p>Payment is processed through the checkout presented during registration. The business and QR are activated after the payment is confirmed by the payment provider and the application completes activation. You can check account and payment details in the merchant dashboard.</p>
    <h2>Renewals and taxes</h2><p>Renewals are separate from the initial payment. AutoPay and recurring charges are not enabled. The displayed plan prices are the amounts currently configured in the registration flow.</p>{trustitPublicInfo.taxDisclosure ? <p>{trustitPublicInfo.taxDisclosure}</p> : <p>Tax treatment is not separately specified in the current registration flow. Contact Trustit before paying if you need a tax invoice or clarification.</p>}
    <p>For questions before purchasing, use the <Link href="/contact">Contact page</Link>. See the <Link href="/refund-policy">Refund Policy</Link> for payment issue handling.</p>
  </TrustitPublicPage>;
}
