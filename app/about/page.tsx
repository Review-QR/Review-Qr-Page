import type { Metadata } from "next";
import Link from "next/link";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({
  title: "About Trustit | Hyperlocal Super-App, Dedicated Delivery Rider Fleet & Local Merchant QR",
  description:
    "Trustit is Bahraich's verified hyperlocal super-app with its own trusted delivery rider fleet delivering food, sweets, groceries, healthcare, and daily essentials with hygiene, speed, and dedication directly to your doorstep.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <TrustitPublicPage
      title="About Trustit"
      intro="Trustit is Bahraich's unified hyperlocal super-app, fast doorstep delivery fleet, and smart merchant ecosystem."
    >
      <h2>Hyperlocal Super-App & Dedicated Delivery Fleet</h2>
      <p>
        Trustit is far more than a QR platform. We operate our own active, dedicated fleet of trusted delivery riders
        across Bahraich and Uttar Pradesh. Our verified delivery partners deliver restaurant food, pure desi sweets,
        fresh groceries, prescription healthcare, milk, and daily household needs directly to customers&apos; doorsteps
        with unmatched hygiene, speed, and complete trust.
      </p>
      <p>
        Customers can place orders, track live rider movement, and verify delivery handovers with secure 4-digit OTPs via
        the <Link href="/order" className="text-blue-600 font-bold hover:underline">Trustit Super-App &amp; Food Delivery Storefront</Link>.
        Local delivery partners can onboard, manage their daily earnings, and accept delivery tasks through the{" "}
        <Link href="/rider" className="text-blue-600 font-bold hover:underline">Trustit Rider Partner App</Link>.
      </p>

      <h2>Smart QR &amp; Local Merchant Reputation Ecosystem</h2>
      <p>
        In addition to doorstep delivery, Trustit empowers brick-and-mortar merchants with smart QR standees and real-time
        reputation tools. Local stores, clinics, salons, and restaurants use Trustit QR codes at checkout counters to
        connect customers with authentic Google Reviews and manage order queues through their dedicated merchant dashboard.
      </p>

      <h2>What Trustit Provides</h2>
      <ul>
        <li>
          <strong>Doorstep Home Delivery:</strong> Hot meals, bakery, fresh dairy, kirana essentials, and medical supplies delivered in 25–35 minutes by our verified rider fleet.
        </li>
        <li>
          <strong>Merchant QR &amp; Reputation Tools:</strong> Countertop acrylic QR standees, scan analytics, and customer review journeys for local shopkeepers.
        </li>
        <li>
          <strong>Local Super-App Services:</strong> Digital salon queue passes, car wash bay scheduling, and handwritten kirana grocery slip uploads.
        </li>
      </ul>

      <h2>Business operator</h2>
      <p>{trustitPublicInfo.legalName ?? "The legal operator name has not yet been configured for publication."}</p>
      <p>{trustitPublicInfo.businessAddress ?? "The operator's business address has not yet been configured for publication."}</p>
      <p>
        Explore our <Link href="/order">Online Storefront</Link>, <Link href="/rider">Rider Partner Portal</Link>,{" "}
        <Link href="/pricing">Plans and Pricing</Link>, <Link href="/privacy-policy">Privacy Policy</Link>, and{" "}
        <Link href="/contact">Contact Information</Link>.
      </p>
    </TrustitPublicPage>
  );
}
