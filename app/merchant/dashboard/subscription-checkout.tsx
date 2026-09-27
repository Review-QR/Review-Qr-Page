"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createMerchantCheckoutOrder,
  verifyMerchantCheckoutOrder,
} from "./checkout-actions";

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

type CashfreeCheckoutSdk = (options: { mode: "sandbox" }) => {
  checkout(options: {
    paymentSessionId: string;
    redirectTarget: "_modal";
  }): Promise<CashfreeCheckoutResult>;
};

const ORDER_ID_PATTERN = /^rqr_[a-f0-9]{32}$/;

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

  async function beginCheckout() {
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

      const checkoutResult = await window.Cashfree({ mode: "sandbox" }).checkout({
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
    if (!verificationOrderId || !verificationToken || verifying) return;

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
      } else if (result.status === "NOT_SUCCESS") {
        setMessage("Cashfree has not confirmed a successful payment. Your subscription remains unchanged.");
        setMessageTone("error");
      } else {
        setMessage("Payment status could not be verified. Please try again later; your subscription remains unchanged.");
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
      } else if (result.status === "NOT_SUCCESS") {
        setRecoveryMessage(
          "Cashfree has not confirmed a successful payment. Your subscription remains unchanged.",
        );
      } else {
        setRecoveryMessage(
          "Payment status could not be verified. Please try again later; your subscription remains unchanged.",
        );
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
        <h3 className="text-base font-semibold text-slate-900">Renew / Upgrade</h3>
        <p className="mt-1 text-sm text-slate-500">
          Choose an eligible plan to continue to Cashfree Sandbox Checkout.
        </p>
      </div>

      {plans.length ? (
        <fieldset className="mt-4 grid gap-3 sm:grid-cols-3">
          <legend className="sr-only">Choose a subscription plan</legend>
          {plans.map((plan) => (
            <label
              key={plan.id}
              className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition ${
                selectedPlanId === plan.id
                  ? "border-blue-500 bg-blue-50 ring-1 ring-blue-200"
                  : "border-slate-200 bg-white hover:border-blue-200"
              }`}
            >
              <input
                type="radio"
                name="subscriptionPlan"
                value={plan.id}
                checked={selectedPlanId === plan.id}
                onChange={() => setSelectedPlanId(plan.id)}
                disabled={pending}
                className="mt-1 accent-blue-600"
              />
              <span className="min-w-0">
                <span className="block font-semibold text-slate-900">
                  {plan.name}
                  {plan.isCurrent && (
                    <span className="ml-2 text-xs font-medium text-blue-700">Current plan</span>
                  )}
                </span>
                <span className="mt-1 block text-sm text-slate-600">
                  ₹{plan.price}/month
                </span>
              </span>
            </label>
          ))}
        </fieldset>
      ) : (
        <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
          No eligible plans are available for this account.
        </p>
      )}

      <button
        type="button"
        onClick={() => void beginCheckout()}
        disabled={pending || plans.length === 0}
        className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Preparing checkout…" : "Continue to Checkout"}
      </button>
      <p className="mt-2 text-xs text-slate-500">
        This Sandbox checkout does not update your subscription or expiry date.
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
