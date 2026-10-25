"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createMerchantCheckoutOrder,
  verifyMerchantCheckoutOrder,
} from "./checkout-actions";
import { TRUSTIT_PLAN_SPECIFICATIONS } from "@/lib/plan-specifications";

type CheckoutPlan = {
  id: string;
  name: string;
  price: number;
  isCurrent: boolean;
};

type CashfreeCheckoutResult = {
  error?: unknown;
  redirect?: unknown;
  paymentDetails?: unknown;
};

type CashfreeCheckoutSdk = (options: { mode: "sandbox" | "production" }) => {
  checkout(options: {
    paymentSessionId: string;
    redirectTarget: "_modal";
  }): Promise<CashfreeCheckoutResult>;
};

const ORDER_ID_PATTERN = /^rqr_(?:[a-f0-9]{32}|[a-f0-9]{33}|[a-f0-9]{34})$/;

function paymentVerificationMessage(result: {
  status: string;
  reason?: string;
  paymentState?: "pending" | "failed";
}): string {
  if (result.status === "ORDER_NOT_FOUND") {
    return "No order with this reference was found in the configured Cashfree environment. Check the reference and environment; your subscription remains unchanged.";
  }
  if (result.status === "ORDER_EXPIRED") {
    return "This Cashfree order has expired. Your subscription remains unchanged; start a new checkout only after confirming no payment was completed.";
  }
  if (result.status === "NOT_SUCCESS" && result.paymentState === "failed") {
    return "Cashfree reports that the payment attempts failed. Your subscription remains unchanged; check your bank statement before starting another checkout.";
  }
  if (result.status === "NOT_SUCCESS") {
    return "Cashfree has not confirmed a successful payment yet. It may still be pending; wait and check again. Your subscription remains unchanged.";
  }
  if (result.status === "VERIFICATION_ERROR" && result.reason === "configuration") {
    return "Payment verification is not configured in this environment. Your subscription remains unchanged; contact support before trying another payment.";
  }
  if (result.status === "VERIFICATION_ERROR" && result.reason === "mapping") {
    return "This payment could not be safely matched to your merchant account. Your subscription remains unchanged; contact support.";
  }
  return "Payment status could not be verified. Please try again later; your subscription remains unchanged.";
}

declare global {
  interface Window {
    Cashfree?: CashfreeCheckoutSdk;
  }
}

let cashfreeSdkPromise: Promise<void> | null = null;

function loadCashfreeSdk(): Promise<void> {
  if (window.Cashfree) return Promise.resolve();
  if (cashfreeSdkPromise) return cashfreeSdkPromise;

  cashfreeSdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if (window.Cashfree) resolve();
      else reject(new Error("Cashfree checkout could not be loaded."));
    };
    script.onerror = () => reject(new Error("Cashfree checkout could not be loaded."));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    cashfreeSdkPromise = null;
    throw error;
  });

  return cashfreeSdkPromise;
}

export default function SubscriptionCheckout({
  plans,
}: {
  plans: CheckoutPlan[];
}) {
  const router = useRouter();
  const [selectedPlanId, setSelectedPlanId] = useState(plans[0]?.id ?? "");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [messageTone, setMessageTone] = useState<"error" | "info">("error");
  const [verificationOrderId, setVerificationOrderId] = useState<string | null>(null);
  const [verificationToken, setVerificationToken] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [recoveryOrderId, setRecoveryOrderId] = useState("");
  const [recoveryMessage, setRecoveryMessage] = useState("");

  const activeSelectedPlan = plans.find((p) => p.id === selectedPlanId);
  const isUpgrade = activeSelectedPlan && !activeSelectedPlan.isCurrent;

  async function beginCheckout() {
    if (pending || verifying) return;

    const selectedPlan = plans.find((plan) => plan.id === selectedPlanId);
    if (!selectedPlan) {
      setMessage("Select an available plan to continue.");
      return;
    }

    setPending(true);
    setMessage("");
    setMessageTone("error");
    setVerificationOrderId(null);
    setVerificationToken(null);

    try {
      const result = await createMerchantCheckoutOrder(selectedPlan.id);
      if (!result.success) {
        setMessage(result.message);
        return;
      }

      setVerificationOrderId(result.orderId);
      setVerificationToken(result.verificationToken);
      await loadCashfreeSdk();
      if (!window.Cashfree) throw new Error("Cashfree checkout is unavailable.");

      const checkoutResult = await window.Cashfree({ mode: result.checkoutMode }).checkout({
        paymentSessionId: result.paymentSessionId,
        redirectTarget: "_modal",
      });

      if (checkoutResult?.paymentDetails) {
        setMessageTone("info");
        setMessage(
          "Payment submitted. Your subscription remains unchanged until payment is verified.",
        );
      } else if (checkoutResult?.error) {
        setMessageTone("error");
        setMessage(
          "Checkout was closed or an issue occurred. Payment status is unverified; your subscription is unchanged.",
        );
      } else if (checkoutResult?.redirect) {
        setMessageTone("info");
        setMessage(
          "Checkout is continuing. Your subscription remains unchanged until payment is verified.",
        );
      } else {
        setMessageTone("info");
        setMessage(
          "Checkout ended without a confirmed result. Your subscription is unchanged.",
        );
      }
    } catch {
      setMessageTone("error");
      setMessage(
        "Checkout could not be completed. Payment status is unverified, and your subscription is unchanged.",
      );
    } finally {
      setPending(false);
    }
  }

  async function checkPaymentStatus() {
    if (!verificationOrderId || !verificationToken || pending || verifying) return;

    setVerifying(true);
    setMessageTone("info");
    setMessage("Checking payment status with Cashfree…");
    try {
      const result = await verifyMerchantCheckoutOrder(
        verificationOrderId,
        verificationToken,
      );
      if (result.status === "VERIFIED_SUCCESS") {
        setMessage(
          result.applied
            ? "Payment verified and your subscription was renewed."
            : "This verified payment was already applied. Your subscription was not renewed twice.",
        );
        setMessageTone("info");
        router.refresh();
      } else {
        setMessage(paymentVerificationMessage(result));
        setMessageTone("error");
      }
    } catch {
      setMessage("Payment status could not be verified. Please try again later; your subscription remains unchanged.");
      setMessageTone("error");
    } finally {
      setVerifying(false);
    }
  }

  async function recoverExistingPayment() {
    const orderId = recoveryOrderId.trim();
    if (!ORDER_ID_PATTERN.test(orderId)) {
      setRecoveryMessage("Enter a valid Review-QR payment reference.");
      return;
    }
    if (pending || verifying) return;

    setVerifying(true);
    setRecoveryMessage("Checking payment status with Cashfree…");
    try {
      const result = await verifyMerchantCheckoutOrder(orderId, "");
      if (result.status === "VERIFIED_SUCCESS") {
        setRecoveryMessage(
          result.applied
            ? "Payment verified and your subscription was renewed."
            : "This verified payment was already applied. Your subscription was not renewed twice.",
        );
        router.refresh();
      } else {
        setRecoveryMessage(paymentVerificationMessage(result));
      }
    } catch {
      setRecoveryMessage(
        "Payment status could not be verified. Please try again later; your subscription remains unchanged.",
      );
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="mt-6 border-t border-slate-100 pt-5">
      <div>
        <h3 className="text-base font-semibold text-slate-900">Renew / Upgrade Plan</h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose an eligible plan below to renew or upgrade your Trustit business subscription.
        </p>
      </div>

      {plans.length ? (
        <fieldset className="mt-5 grid gap-4 lg:grid-cols-3">
          <legend className="sr-only">Choose a subscription plan</legend>
          {plans.map((plan) => {
            const spec = TRUSTIT_PLAN_SPECIFICATIONS[plan.id as keyof typeof TRUSTIT_PLAN_SPECIFICATIONS];
            const isSelected = selectedPlanId === plan.id;
            return (
              <label
                key={plan.id}
                className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border p-5 transition ${
                  isSelected
                    ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-200 shadow-sm"
                    : "border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="block text-base font-bold text-slate-900">
                        {plan.name}
                      </span>
                      <p className="mt-0.5 text-xs text-slate-500">{spec?.tagline}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <input
                        type="radio"
                        name="subscriptionPlan"
                        value={plan.id}
                        checked={isSelected}
                        onChange={() => setSelectedPlanId(plan.id)}
                        disabled={pending || verifying}
                        className="mt-0.5 h-4 w-4 accent-blue-600"
                      />
                      {plan.isCurrent ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          Current Plan
                        </span>
                      ) : spec?.badge ? (
                        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                          {spec.badge}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-3 flex items-baseline">
                    <span className="text-2xl font-extrabold text-slate-900">₹{plan.price}</span>
                    <span className="ml-1 text-xs text-slate-500">/ 30 days</span>
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

                <div className="mt-4 pt-2">
                  <div
                    className={`rounded-xl py-1.5 text-center text-xs font-semibold transition ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {isSelected
                      ? plan.isCurrent
                        ? "Selected (Renew)"
                        : "Selected (Upgrade)"
                      : plan.isCurrent
                        ? "Renew Current"
                        : `Upgrade to ${plan.name}`}
                  </div>
                </div>
              </label>
            );
          })}
        </fieldset>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          No eligible plans are available for this account.
        </p>
      )}

      <button
        type="button"
        onClick={() => void beginCheckout()}
        disabled={pending || verifying || plans.length === 0}
        className="mt-5 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Preparing checkout…"
          : isUpgrade
            ? `Upgrade to ${activeSelectedPlan.name} (₹${activeSelectedPlan.price})`
            : activeSelectedPlan
              ? `Renew ${activeSelectedPlan.name} (₹${activeSelectedPlan.price})`
              : "Continue to Checkout"}
      </button>
      <p className="mt-2 text-xs text-slate-500">
        Your subscription updates only after Cashfree confirms payment and Review-QR verifies and applies it.
      </p>
      {message && (
        <p
          role="status"
          aria-live="polite"
          className={`mt-3 text-sm ${messageTone === "error" ? "text-rose-700" : "text-blue-700"}`}
        >
          {message}
        </p>
      )}
      {verificationOrderId && (
        <div className="mt-3">
          <p className="break-all text-xs text-slate-500">
            Payment reference: {verificationOrderId}
          </p>
          <button
            type="button"
            onClick={() => void checkPaymentStatus()}
            disabled={pending || verifying}
            className="mt-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {verifying ? "Verifying…" : "Check payment status"}
          </button>
        </div>
      )}
      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="text-sm font-semibold text-slate-900">
          Recover an existing payment
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Enter the Review-QR payment reference to check an existing order.
        </p>
        <label
          htmlFor="existing-payment-order-id"
          className="mt-3 block text-sm font-medium text-slate-700"
        >
          Payment reference
        </label>
        <input
          id="existing-payment-order-id"
          type="text"
          autoComplete="off"
          value={recoveryOrderId}
          onChange={(event) => setRecoveryOrderId(event.target.value)}
          placeholder="rqr_…"
          disabled={pending || verifying}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-50 sm:max-w-md"
        />
        <button
          type="button"
          onClick={() => void recoverExistingPayment()}
          disabled={pending || verifying}
          className="mt-3 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {verifying ? "Checking…" : "Recover & Check"}
        </button>
        {recoveryMessage && (
          <p
            role="status"
            aria-live="polite"
            className={`mt-3 text-sm ${recoveryMessage.startsWith("Payment verified") || recoveryMessage.startsWith("This verified payment") ? "text-blue-700" : "text-rose-700"}`}
          >
            {recoveryMessage}
          </p>
        )}
      </div>
    </div>
  );
}
