"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  addBusiness,
  deleteBusiness,
  getBusinesses,
  updateBusiness,
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

const STATUSES = ["active", "expiring soon", "expired", "suspended"];
const QR_STATUSES = ["active", "disabled"];

function generateBusinessId() {
  return `QR-${Date.now().toString().slice(-8)}`;
}

function getStatusClass(status?: string | null) {
  switch ((status || "").toLowerCase()) {
    case "active":
      return "bg-green-100 text-green-700";
    case "expiring soon":
      return "bg-amber-100 text-amber-700";
    case "expired":
      return "bg-red-100 text-red-700";
    case "suspended":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getQrStatusClass(status?: string | null) {
  return (status || "").toLowerCase() === "active"
    ? "bg-blue-100 text-blue-700"
    : "bg-slate-200 text-slate-700";
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(
    null
  );

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

  function handleChange(field: keyof typeof form, value: string) {
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

      const selectedPlan = PLANS.find((plan) => plan.name === form.plan);

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

  function startEdit(business: Business) {
    setEditingBusiness(business);
    setMessage("");
  }

  async function handleEditSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!editingBusiness) return;

    if (!editingBusiness.name?.trim()) {
      setMessage("Business name required hai.");
      return;
    }

    if (!editingBusiness.review_link?.trim()) {
      setMessage("Google Review link required hai.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      await updateBusiness(editingBusiness.id, {
        name: editingBusiness.name.trim(),
        owner: editingBusiness.owner?.trim() || null,
        phone: editingBusiness.phone?.trim() || null,
        type: editingBusiness.type || "Other",
        plan: editingBusiness.plan || "Basic",
        status: editingBusiness.status || "active",
        expiry: editingBusiness.expiry || null,
        qr_status: editingBusiness.qr_status || "active",
        review_link: editingBusiness.review_link.trim(),
        address: editingBusiness.address?.trim() || null,
      });

      setEditingBusiness(null);
      setMessage("Business successfully update ho gaya.");
      await loadBusinesses();
    } catch (error) {
      console.error(error);
      setMessage(
        error instanceof Error
          ? error.message
          : "Business update nahi ho paaya."
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

  const filteredBusinesses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return businesses.filter((business) => {
      const matchesSearch =
        !query ||
        [
          business.id,
          business.name,
          business.owner,
          business.phone,
          business.type,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "all" ||
        (business.status || "").toLowerCase() === statusFilter;

      const matchesPlan =
        planFilter === "all" ||
        (business.plan || "").toLowerCase() === planFilter.toLowerCase();

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [businesses, search, statusFilter, planFilter]);

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6">
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

        <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
          {/* ADD BUSINESS */}
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
                  onChange={(e) => handleChange("name", e.target.value)}
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
                  onChange={(e) => handleChange("owner", e.target.value)}
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
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="9876543210"
                  inputMode="numeric"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Business Type
                </label>

                <select
                  value={form.type}
                  onChange={(e) => handleChange("type", e.target.value)}
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
                  onChange={(e) => handleChange("plan", e.target.value)}
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
                  onChange={(e) => handleChange("expiry", e.target.value)}
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
                  onChange={(e) => handleChange("address", e.target.value)}
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

          {/* BUSINESS LIST */}
          <section className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5 sm:p-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    Businesses
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Showing {filteredBusinesses.length} of {businesses.length}
                  </p>
                </div>

                <button
                  onClick={loadBusinesses}
                  disabled={loading}
                  className="rounded-lg border border-slate-300 px-4 py-2 text-sm hover:bg-slate-50 disabled:opacity-60"
                >
                  {loading ? "Refreshing..." : "Refresh"}
                </button>
              </div>

              {/* SEARCH + FILTER */}
              <div className="mt-5 grid gap-3 md:grid-cols-[1fr_180px_180px]">
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search name, owner, phone or QR ID..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="all">All Status</option>

                  {STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/\b\w/g, (char) =>
                        char.toUpperCase()
                      )}
                    </option>
                  ))}
                </select>

                <select
                  value={planFilter}
                  onChange={(e) => setPlanFilter(e.target.value)}
                  className="rounded-lg border border-slate-300 px-3 py-2"
                >
                  <option value="all">All Plans</option>

                  {PLANS.map((plan) => (
                    <option key={plan.name} value={plan.name}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-slate-500">
                Loading businesses...
              </div>
            ) : filteredBusinesses.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                Koi matching business nahi mila.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px]">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Business
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Owner
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Type
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Plan
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Expiry
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        Status
                      </th>

                      <th className="px-4 py-3 text-left text-sm font-semibold">
                        QR
                      </th>

                      <th className="px-4 py-3 text-right text-sm font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredBusinesses.map((business) => (
                      <tr
                        key={business.id}
                        className="border-t border-slate-100 hover:bg-slate-50"
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
                          <div>{business.owner || "—"}</div>

                          {business.phone && (
                            <div className="text-xs text-slate-500">
                              {business.phone}
                            </div>
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {business.type || "—"}
                        </td>

                        <td className="px-4 py-4 text-sm font-medium">
                          {business.plan || "—"}
                        </td>

                        <td className="px-4 py-4 text-sm">
                          {business.expiry || "—"}
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                              business.status
                            )}`}
                          >
                            {business.status || "pending"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getQrStatusClass(
                              business.qr_status
                            )}`}
                          >
                            {business.qr_status || "inactive"}
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            {business.review_link && (
                              <a
                                href={business.review_link}
                                target="_blank"
                                rel="noreferrer"
                                className="rounded-lg border border-blue-200 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50"
                              >
                                Review
                              </a>
                            )}

                            <button
                              onClick={() => startEdit(business)}
                              className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(business.id)}
                              className="rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                            >
                              Delete
                            </button>
                          </div>
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

      {/* EDIT MODAL */}
      {editingBusiness && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 p-4">
          <div className="mx-auto my-8 max-w-2xl rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 p-5">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Edit Business
                </h2>

                <p className="text-sm text-slate-500">
                  {editingBusiness.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingBusiness(null)}
                className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleEditSave} className="space-y-4 p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Business Name *
                  </label>

                  <input
                    value={editingBusiness.name || ""}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        name: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Owner Name
                  </label>

                  <input
                    value={editingBusiness.owner || ""}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        owner: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Phone
                  </label>

                  <input
                    value={editingBusiness.phone || ""}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        phone: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Business Type
                  </label>

                  <select
                    value={editingBusiness.type || "Other"}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        type: e.target.value,
                      })
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
                    value={editingBusiness.plan || "Basic"}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        plan: e.target.value,
                      })
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
                    value={editingBusiness.expiry || ""}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        expiry: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    Status
                  </label>

                  <select
                    value={editingBusiness.status || "active"}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        status: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium">
                    QR Status
                  </label>

                  <select
                    value={editingBusiness.qr_status || "active"}
                    onChange={(e) =>
                      setEditingBusiness({
                        ...editingBusiness,
                        qr_status: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border border-slate-300 px-3 py-2"
                  >
                    {QR_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/\b\w/g, (char) =>
                          char.toUpperCase()
                        )}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Google Review Link *
                </label>

                <textarea
                  value={editingBusiness.review_link || ""}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      review_link: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Address
                </label>

                <textarea
                  value={editingBusiness.address || ""}
                  onChange={(e) =>
                    setEditingBusiness({
                      ...editingBusiness,
                      address: e.target.value,
                    })
                  }
                  rows={3}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setEditingBusiness(null)}
                  className="rounded-lg border border-slate-300 px-5 py-3 text-sm font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
