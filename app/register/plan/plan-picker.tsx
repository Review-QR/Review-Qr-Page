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
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {plans.map((p) => (
          <label
            key={p.id}
            className={`relative flex cursor-pointer flex-col justify-between rounded-2xl border p-3.5 sm:p-4 shadow-2xs transition focus-within:ring-2 focus-within:ring-blue-300 ${
              plan === p.id
                ? "border-blue-500 bg-blue-50/70 ring-2 ring-blue-100 shadow-[0_12px_24px_-16px_rgba(37,99,235,0.35)]"
                : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-xs"
            }`}
          >
            {p.badge && (
              <span
                className={`absolute -top-2.5 left-4 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-xs ${
                  p.popular ? "bg-blue-600" : "bg-emerald-600"
                }`}
              >
                {p.badge}
              </span>
            )}

            <div>
              <div className="flex items-center justify-between gap-2">
                <strong className="text-sm sm:text-base font-bold text-slate-900">{p.name}</strong>
                <input
                  type="radio"
                  name="plan"
                  value={p.id}
                  checked={plan === p.id}
                  onChange={() => setPlan(p.id)}
                  className="h-4 w-4 accent-blue-600"
                />
              </div>
              <p className="mt-0.5 text-[11px] text-slate-500">{p.tag}</p>

              <div className="mt-2.5 flex items-baseline">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  ₹{p.price}
                </span>
                <span className="ml-1 text-[10px] font-medium text-slate-500">
                  / {p.durationDays} days
                </span>
              </div>

              <hr className="my-2.5 border-slate-100" />

              <ul className="space-y-1.5 text-[11px]">
                {p.features.map((feat, idx) => (
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

            <div className="mt-3 pt-2">
              <div
                className={`rounded-lg py-1.5 text-center text-xs font-semibold transition ${
                  plan === p.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {plan === p.id ? "Selected Plan ✓" : `Choose ${p.name}`}
              </div>
            </div>
          </label>
        ))}
      </div>

      <button
        type="button"
        onClick={() => void submit()}
        disabled={!plan || busy}
        className="mt-4 min-h-10 sm:min-h-11 w-full rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50"
      >
        {busy ? "Saving…" : "Continue to payment (आगे बढ़ें) →"}
      </button>

      {message && (
        <p role="alert" className="mt-3 rounded-xl bg-rose-50 px-3 py-2 text-xs text-rose-800">
          {message}
        </p>
      )}
    </>
  );
}
