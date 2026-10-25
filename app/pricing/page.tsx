import type { Metadata } from "next";
import Link from "next/link";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo, trustitPublicPlans } from "@/lib/trustit-public-info";
import { TRUSTIT_PLAN_SPECIFICATIONS } from "@/lib/plan-specifications";

export const metadata: Metadata = trustitInformationMetadata({
  title: "Pricing | Trustit",
  description: "Trustit business plans, current prices, service term, payment and renewal information.",
  path: "/pricing",
});

export default function PricingPage() {
  return (
    <TrustitPublicPage
      title="Plans and pricing"
      intro="Choose a Trustit plan for your business QR and merchant dashboard."
    >
      <p>
        Each plan is a one-time payment for the stated service term. Automatic recurring billing is
        not enabled; a renewal is a separate action.
      </p>

      <div className="not-prose mt-6 grid gap-5 sm:grid-cols-3">
        {trustitPublicPlans.map((plan) => {
          const spec = TRUSTIT_PLAN_SPECIFICATIONS[plan.name.toLowerCase() as keyof typeof TRUSTIT_PLAN_SPECIFICATIONS];
          return (
            <section
              key={plan.name}
              className="flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-slate-900">{plan.name}</h2>
                  {spec?.badge && (
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                      {spec.badge}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">{spec?.tagline}</p>
                <div className="mt-3 flex items-baseline">
                  <span className="text-3xl font-extrabold text-blue-900">₹{plan.price}</span>
                  <span className="ml-1 text-xs text-slate-500">/ {plan.durationDays} days</span>
                </div>

                <hr className="my-3 border-slate-100" />

                <ul className="space-y-1.5 text-xs">
                  {spec?.features.map((feat, idx) => (
                    <li
                      key={idx}
                      className={`flex items-start gap-1.5 ${
                        feat.included ? "text-slate-700" : "text-slate-400 line-through opacity-70"
                      }`}
                    >
                      {feat.included ? (
                        <span className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[9px] font-bold text-emerald-700">
                          ✓
                        </span>
                      ) : (
                        <span className="mt-0.5 inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[9px] font-bold text-slate-400">
                          ✕
                        </span>
                      )}
                      <span className={feat.highlight ? "font-semibold text-blue-900" : ""}>
                        {feat.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 pt-2">
                <Link
                  href="/register"
                  className="block rounded-xl bg-blue-600 py-2 text-center text-xs font-semibold text-white transition hover:bg-blue-700"
                >
                  Get Started with {plan.name}
                </Link>
              </div>
            </section>
          );
        })}
      </div>

      <h2>Payment and activation</h2>
      <p>
        Payment is processed through the checkout presented during registration. The business and QR
        are activated after the payment is confirmed by the payment provider and the application
        completes activation. You can check account and payment details in the merchant dashboard.
      </p>

      <h2>Renewals and taxes</h2>
      <p>
        Renewals are separate from the initial payment. AutoPay and recurring charges are not enabled.
        The displayed plan prices are the amounts currently configured in the registration flow.
      </p>
      {trustitPublicInfo.taxDisclosure ? (
        <p>{trustitPublicInfo.taxDisclosure}</p>
      ) : (
        <p>
          Tax treatment is not separately specified in the current registration flow. Contact Trustit
          before paying if you need a tax invoice or clarification.
        </p>
      )}

      <p>
        For questions before purchasing, use the <Link href="/contact">Contact page</Link>. See the{" "}
        <Link href="/refund-policy">Refund Policy</Link> for payment issue handling.
      </p>
    </TrustitPublicPage>
  );
}
