import Link from "next/link";

export const metadata = {
  title: "Help & Support | Trustit",
  description: "Get help with your Trustit orders, payments, and account.",
  robots: { index: false, follow: false },
};

const FAQ_ITEMS = [
  {
    q: "How do I track my order?",
    a: "Open the Trustit app, tap the Orders tab, and select your active order. You'll see live rider status, estimated arrival, and the 4-digit handover PIN.",
  },
  {
    q: "My order is taking too long. What should I do?",
    a: "Check the Orders tab for the latest status. If the order is stuck for more than 30 minutes, tap the Help button on your order card to contact our support team directly.",
  },
  {
    q: "How does COD (Cash on Delivery) work?",
    a: "You can pay in cash when the rider arrives. Keep the exact amount ready for faster delivery. The rider will share a dynamic QR code if you prefer UPI payment at doorstep.",
  },
  {
    q: "I paid online but my order didn't confirm. What happened?",
    a: "Online payments are confirmed via webhook within 30 seconds. If you see 'Payment pending', the order is still being verified. Refresh the order page after 1 minute. If it still shows pending, contact support with your payment reference ID.",
  },
  {
    q: "Can I cancel an order after placing it?",
    a: "You can cancel within 2 minutes of placing the order for free. After that, cancellation depends on whether the merchant has started preparing. Contact support immediately if you need help cancelling.",
  },
  {
    q: "How do I use my Trustit Wallet?",
    a: "Top up your wallet from the Wallet tab. At checkout, select 'Pay from Wallet' instead of UPI or COD. Your balance is auto-deducted on successful delivery.",
  },
  {
    q: "How are loyalty points earned?",
    a: "You earn 1 point per ₹10 spent on every delivered order. 350 points = ₹100 in value. Points appear in your account after the order is marked as delivered.",
  },
  {
    q: "I received the wrong item. What should I do?",
    a: "Take a photo of the order, go to your order history, and tap 'Report Issue'. Select 'Wrong item' and upload the photo. Our support team will process a refund or replacement within 24 hours.",
  },
  {
    q: "How do I contact a merchant directly?",
    a: "Tap the business card in the app to open their profile. You'll find their phone number (masked for privacy) and in-app chat option for non-urgent queries.",
  },
  {
    q: "My payment failed but money was deducted from my bank.",
    a: "This is a network issue between your bank and the payment gateway. The amount will be auto-refunded within 3-5 business days. No action needed on your side. Check your order page for the latest status.",
  },
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div className="mx-auto max-w-3xl px-4 py-8">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Help &amp; Support
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Frequently asked questions and how to reach our team.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        {/* FAQ Accordion */}
        <section>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <details
                key={i}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm overflow-hidden"
              >
                <summary className="flex cursor-pointer items-center justify-between px-4 py-3 text-sm font-medium text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-700/50">
                  {item.q}
                  <span className="ml-3 text-slate-400 transition-transform group-open:rotate-180">
                    ↓
                  </span>
                </summary>
                <div className="px-4 pb-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mt-10 rounded-2xl bg-blue-600 dark:bg-blue-800 p-6 text-white">
          <h2 className="text-lg font-bold">Still need help?</h2>
          <p className="mt-1 text-sm opacity-90">
            Our support team is available 8 AM – 10 PM, 7 days a week.
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <a
              href="mailto:support@trustit.in"
              className="rounded-lg bg-white text-blue-700 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-50"
            >
              Email Support
            </a>
            <Link
              href="/contact"
              className="rounded-lg border border-white/40 text-white px-5 py-2.5 text-sm font-semibold transition hover:bg-white/10 text-center"
            >
              Contact Page
            </Link>
          </div>
        </section>

        {/* Links */}
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
            Useful Links
          </h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Privacy Policy", href: "/privacy-policy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Refund Policy", href: "/refund-policy" },
              { label: "About Trustit", href: "/about" },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-center text-xs font-medium text-slate-600 dark:text-slate-300 transition hover:bg-slate-50 dark:hover:bg-slate-700"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
