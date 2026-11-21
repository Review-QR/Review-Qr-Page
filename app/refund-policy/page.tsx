import type { Metadata } from "next";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({ title: "Refund Policy", description: "Trustit refund policy for online and cash-on-delivery orders.", path: "/refund-policy" });

export default function RefundPolicyPage() {
  return (
    <TrustitPublicPage
      title="Refund Policy"
      intro="Effective 2026-11-21. Below is the full refund policy for Trustit orders."
    >
      <div className="space-y-6">
        <section>
          <h2>Online Payment Refunds</h2>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li><strong>Full refund</strong> for orders cancelled before the merchant starts preparing.</li>
            <li><strong>Proportional refund</strong> for partially prepared orders cancelled during preparation.</li>
            <li>Refunds are processed via Cashfree and appear in your account within 5–7 business days.</li>
            <li>Refund status is visible in your Order History under each cancelled order.</li>
          </ul>
        </section>

        <section>
          <h2>Cash on Delivery</h2>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>If you cancel an order and the rider has not yet picked up, no charge is applied.</li>
            <li>If the rider picked up but the order is refused at doorstep, a ₹35 convenience fee may apply.</li>
            <li>Cash refunds are processed via UPI within 24–48 hours.</li>
          </ul>
        </section>

        <section>
          <h2>When You Are Entitled to a Refund</h2>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Order cancelled before merchant acceptance</li>
            <li>Merchant cancelled the order (your fault: no charge)</li>
            <li>Rider was not able to complete delivery (your fault: no charge)</li>
            <li>Wrong item delivered (full or partial refund via support)</li>
            <li>Payment failed but money was deducted (auto-refund within 5–7 business days)</li>
          </ul>
        </section>

        <section>
          <h2>When You Are Not Entitled to a Refund</h2>
          <ul className="mt-2 space-y-1 list-disc pl-5">
            <li>Order was completed and delivered successfully</li>
            <li>You cancelled after the rider started the trip (convenience fee may apply)</li>
            <li>Payment method was insufficient at COD (no charge for the failed attempt)</li>
          </ul>
        </section>

        <section>
          <h2>How to Request a Refund</h2>
          <ol className="mt-2 space-y-1 list-decimal pl-5">
            <li>Go to <strong>Order History</strong> in the app</li>
            <li>Select the order you want to dispute</li>
            <li>Tap <strong>"Report Issue"</strong></li>
            <li>Select the reason and add a comment if needed</li>
            <li>Our support team will review and process the refund</li>
          </ol>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            For refund queries, email{" "}
            <a href={`mailto:${trustitPublicInfo.supportEmail ?? "support@trustit.in"}`} className="text-blue-600 hover:underline">
              {trustitPublicInfo.supportEmail ?? "support@trustit.in"}
            </a>{" "}
            with your order reference ID.
          </p>
        </section>
      </div>
    </TrustitPublicPage>
  );
}
