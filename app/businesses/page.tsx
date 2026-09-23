"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  addBusiness,
  deleteBusiness,
  getBusinesses,
} from "@/lib/data";
import type { Business } from "@/lib/types";

const BUSINESS_TYPES = [
  "Salon",
  "Medical",
  "Garage",
  "Library",
  "Restaurant",
  "Pan Shop",
  "Cafe",
  "Retail",
  "Other",
];

const PLANS = [
  { name: "Basic", price: 29 },
  { name: "Standard", price: 49 },
  { name: "Premium", price: 99 },
];

function generateBusinessId() {
  return `QR-${Date.now().toString().slice(-8)}`;
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    owner: "",
    phone: "",
    type: "Other",
    plan: "Basic",
    review_link: "",
    address: "",
    expiry: "",
  });

  async function loadBusinesses() {
    try {
      setLoading(true);
      const data = await getBusinesses();
      setBusinesses(data);
    } catch (error) {
      console.error(error);
      setMessage("Businesses load nahi ho paaye.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBusinesses();
  }, []);

  function handleChange(
    field: keyof typeof form,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.name.trim()) {
      setMessage("Business name required hai.");
      return;
    }

    if (!form.review_link.trim()) {
      setMessage("Google Review link required hai.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const selectedPlan = PLANS.find(
        (plan) => plan.name === form.plan
      );

      const business: Business = {
        id: generateBusinessId(),
        name: form.name.trim(),
        owner: form.owner.trim() || null,
        phone: form.phone.trim() || null,
        type: form.type,
        plan: form.plan,
        status: "active",
        expiry: form.expiry || null,
        scans: 0,
        qr_status: "active",
        qr_type: "review",
        review_link: form.review_link.trim(),
        address: form.address.trim() || null,
        created: new Date().toISOString().slice(0, 10),
      };

      await addBusiness(business);

      setMessage(
        `${business.name} successfully add ho gaya. Plan: ${selectedPlan?.name} ₹${selectedPlan?.price}`
      );

      setForm({
        name: "",
        owner: "",
        phone: "",
        type: "Other",
        plan: "Basic",
        review_link: "",
        address: "",
        expiry: "",
      });

      await loadBusinesses();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Business save nahi ho paaya."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Kya aap is business ko delete karna chahte hain?"
    );

    if (!confirmed) return;

    try {
      await deleteBusiness(id);
      setMessage("Business delete ho gaya.");
      await loadBusinesses();
    } catch (error) {
      console.error(error);
      setMessage("Business delete nahi ho paaya.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Business Management
          </h1>

          <p className="mt-2 text-slate-600">
            Review-QR businesses add aur manage karein.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
            {message}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
          {/* Add Business Form */}
          <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-5 text-xl font-semibold text-slate-900">
              Add Business
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Business Name *
                </label>

                <input
                  value={form.name}
                  onChange={(e) =>
                    handleChange("name", e.target.value)
                  }
                  placeholder="Example: Prakasha Pan Shop"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Owner Name
                </label>

                <input
                  value={form.owner}
                  onChange={(e) =>
                    handleChange("owner", e.target.value)
                  }
                  placeholder="Owner name"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Phone
                </label>

                <input
                  value={form.phone}
                  onChange={(e) =>
                    handleChange("phone", e.target.value)
                  }
                  placeholder="9876543210"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Business Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) =>
                    handleChange("type", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Plan
                </label>

                <select
                  value={form.plan}
                  onChange={(e) =>
                    handleChange("plan", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                >
                  {PLANS.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name} — ₹{plan.price}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Expiry Date
                </label>

                <input
                  type="date"
                  value={form.expiry}
                  onChange={(e) =>
                    handleChange("expiry", e.target.value)
                  }
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Google Review Link *
                </label>

                <textarea
                  value={form.review_link}
                  onChange={(e) =>
                    handleChange("review_link", e.target.value)
                  }
                  placeholder="https://g.page/r/..."
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Address
                </label>

                <textarea
                  value={form.address}
                  onChange={(e) =>
                    handleChange("address", e.target.value)
                  }
                  placeholder="Business address"
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? "Saving..." : "Add Business"}
              </button>
            </form>
          </section>

          {/* Business List */}
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Businesses
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Total: {businesses.length}
                  </p>
                </div>

                <button
                  onClick={loadBusinesses}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50"
                >
                  Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading businesses...
              </div>
            ) : businesses.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Abhi koi business nahi hai.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm">
                        Business
                      </th>
                      <th className="px-4 py-3 text-left text-sm">
                        Owner
                      </th>
                      <th className="px-4 py-3 text-left text-sm">
                        Type
                      </th>
                      <th className="px-4 py-3 text-left text-sm">
                        Plan
                      </th>
                      <th className="px-4 py-3 text-left text-sm">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-sm">
                        QR
                      </th>
                      <th className="px-4 py-3 text-right text-sm">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {businesses.map((business) => (
                      <tr
                        key={business.id}
                        className="border-t border-slate-100"
                      >
                        <td className="px-4 py-4">
                          <div className="font-medium text-slate-900">
                            {business.name}
                          </div>

                          <div className="text-xs text-slate-500">
                            {business.id}
                          </div>
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {business.owner || "—"}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {business.type || "—"}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {business.plan || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700">
                            {business.status || "pending"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                            {business.qr_status || "inactive"}
                          </span>
                        </td>

                        <td className="px-4 py-4 text-right">
                          <button
                            onClick={() =>
                              handleDelete(business.id)
                            }
                            className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
