"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { selectTrustitPlan } from "../actions";
import { trustitPublicPlans } from "@/lib/trustit-public-info";
import { TRUSTIT_PLAN_SPECIFICATIONS, type PlanSpecification } from "@/lib/plan-specifications";

const plans = trustitPublicPlans.map((plan) => {
  const id = plan.name.toLowerCase() as keyof typeof TRUSTIT_PLAN_SPECIFICATIONS;
  const spec: PlanSpecification | undefined = TRUSTIT_PLAN_SPECIFICATIONS[id];
  return {
    ...plan,
    id,
    tag: spec?.tagline ?? "For your business",
    badge: spec?.badge,
    popular: spec?.badge === "Most Popular",
    features: spec?.features ?? [],
  };
});

export default function PlanPicker({ selected }: { selected: string | null }) {
  const router = useRouter();
  const [plan, setPlan] = useState(selected?.toLowerCase() ?? "");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function submit() {
    if (!plan) return;
    setBusy(true);
    setMessage("");
    try {
      const result = await selectTrustitPlan(plan);
      if (!result.success) {
        setMessage(result.message);
        return;
      }
      router.push("/register/payment");
      router.refresh();
    } catch {
      setMessage("We could not save your plan just now. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="mt-7 grid gap-5 md:grid-cols-3">
        {plans.map((p) => (
          <label
            key={p.id}
            className={`relative flex cursor-pointer flex-col justify-between rounded-3xl border p-6 shadow-sm transition focus-within:ring-2 focus-within:ring-blue-300 ${
              plan === p.id
                ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-100 shadow-[0_18px_40px_-28px_rgba(37,99,235,0.35)]"
                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
            }`}
          >
            {p.badge && (
              <span
                className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white shadow-sm ${
                  p.popular ? "bg-blue-600" : "bg-emerald-600"
                }`}
              >
                {p.badge}
              </span>
            )}

            <div>
              <div className="flex items-center justify-between gap-3">
                <strong className="text-xl font-bold text-slate-900">{p.name}</strong>
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  checked={plan === p.id}
                  onChange={() => setPlan(p.id)}
                  className="h-5 w-5 accent-blue-600"
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">{p.tag}</p>

              <div className="mt-4 flex items-baseline">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900">
                  ₹{p.price}
                </span>
                <span className="ml-1 text-xs font-medium text-slate-500">
                  / {p.durationDays} days
                </span>
              </div>

              <hr className="my-4 border-slate-100" />

              <ul className="space-y-2 text-xs">
                {p.features.map((feat, idx) => (
                  <li
                    key={idx}
                    className={`flex items-start gap-2 ${
                      feat.included ? "text-slate-700" : "text-slate-400 line-through opacity-70"
                    }`}
                  >
                    {feat.included ? (
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                        ✓
                      </span>
                    ) : (
                      <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-400">
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

            <div className="mt-5 pt-3">
              <div
                className={`rounded-xl py-2 text-center text-xs font-semibold transition ${
                  plan === p.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {plan === p.id ? "Selected Plan" : `Choose ${p.name}`}
              </div>
            </div>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={!plan || busy}
        className="mt-7 min-h-13 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-3.5 text-sm font-bold text-white shadow-[0_14px_28px_-16px_rgba(37,99,235,0.35)] transition hover:from-blue-700 hover:to-blue-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-700 focus-visible:ring-offset-2 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Continue to payment →"}
      </button>

      {message && (
        <p role="alert" className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {message}
        </p>
      )}
    </>
  );
}
