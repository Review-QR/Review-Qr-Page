"use client";

import { useState, useTransition } from "react";
import {
  saveCatalogItemAction,
  deleteCatalogItemAction,
  toggleItemAvailabilityAction,
  seedCategoryTemplatesAction,
  quickUpdateRateAction,
  type CatalogItemInput,
} from "./actions";

export type MenuItem = {
  id: string;
  businessId: string;
  name: string;
  category: string;
  price: number;
  unit: string | null;
  itemType: "veg" | "non_veg" | "egg" | "service" | "product";
  imageUrl: string | null;
  description: string | null;
  isAvailable: boolean;
};

export default function MenuManager({
  initialItems,
  businessName,
  businessType = null,
}: {
  initialItems: MenuItem[];
  businessName: string;
  businessType?: string | null;
}) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "draft">("all");
  const [inlineRates, setInlineRates] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [formName, setFormName] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formPrice, setFormPrice] = useState("");
  const [formUnit, setFormUnit] = useState("");
  const [formType, setFormType] = useState<CatalogItemInput["itemType"]>("veg");
  const [formDescription, setFormDescription] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");

  const categories = ["All", ...Array.from(new Set(items.map((i) => i.category || "General")))];

  const activeCount = items.filter((i) => i.price > 0 && i.isAvailable).length;
  const draftCount = items.filter((i) => i.price <= 0 || !i.isAvailable).length;

  function openAddModal() {
    setEditingItem(null);
    setFormName("");
    setFormCategory("General");
    setFormPrice("");
    setFormUnit("");
    setFormType("veg");
    setFormDescription("");
    setFormImageUrl("");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  }

  function openEditModal(item: MenuItem) {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category || "General");
    setFormPrice(String(item.price));
    setFormUnit(item.unit || "");
    setFormType(item.itemType || "veg");
    setFormDescription(item.description || "");
    setFormImageUrl(item.imageUrl || "");
    setErrorMsg("");
    setSuccessMsg("");
    setIsModalOpen(true);
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");

    const priceNum = parseFloat(formPrice);
    if (!formName.trim()) {
      setErrorMsg("Please enter an item name.");
      return;
    }
    if (isNaN(priceNum) || priceNum < 0) {
      setErrorMsg("Please enter a valid price (₹).");
      return;
    }

    startTransition(async () => {
      const res = await saveCatalogItemAction({
        id: editingItem?.id,
        name: formName.trim(),
        category: formCategory.trim() || "General",
        price: priceNum,
        unit: formUnit.trim() || null,
        itemType: formType,
        description: formDescription.trim() || null,
        imageUrl: formImageUrl.trim() || null,
        isAvailable: editingItem ? editingItem.isAvailable : true,
      });

      if (!res.success) {
        setErrorMsg(res.message || "Failed to save item.");
      } else {
        setSuccessMsg(res.message || "Saved successfully!");
        if (editingItem) {
          setItems((prev) =>
            prev.map((item) =>
              item.id === editingItem.id
                ? {
                    ...item,
                    name: formName.trim(),
                    category: formCategory.trim() || "General",
                    price: priceNum,
                    unit: formUnit.trim() || null,
                    itemType: formType,
                    description: formDescription.trim() || null,
                    imageUrl: formImageUrl.trim() || null,
                  }
                : item,
            ),
          );
        } else if (res.item) {
          const newItem: MenuItem = {
            id: String(res.item.id),
            businessId: String(res.item.business_id),
            name: String(res.item.name),
            category: String(res.item.category || "General"),
            price: Number(res.item.price) || 0,
            unit: res.item.unit ? String(res.item.unit) : null,
            itemType: (res.item.item_type as MenuItem["itemType"]) ?? "veg",
            imageUrl: res.item.image_url ? String(res.item.image_url) : null,
            description: res.item.description ? String(res.item.description) : null,
            isAvailable: res.item.is_available === true,
          };
          setItems((prev) => [newItem, ...prev]);
        }
        setIsModalOpen(false);
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}" from your menu?`)) return;

    startTransition(async () => {
      const res = await deleteCatalogItemAction(id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        setSuccessMsg(`"${name}" removed from menu.`);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(res.message || "Failed to delete item.");
      }
    });
  }

  function handleToggleAvailability(item: MenuItem) {
    const nextState = !item.isAvailable;
    startTransition(async () => {
      const res = await toggleItemAvailabilityAction(item.id, nextState);
      if (res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: nextState } : i)),
        );
      } else {
        alert("Failed to toggle stock availability.");
      }
    });
  }

  function handleQuickRateSave(item: MenuItem, priceInput: string, makeLive = true) {
    const p = parseFloat(priceInput);
    if (isNaN(p) || p < 0) {
      alert("Please enter a valid rate (₹).");
      return;
    }

    startTransition(async () => {
      const res = await quickUpdateRateAction(item.id, p, makeLive);
      if (res.success) {
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, price: p, isAvailable: makeLive } : i)),
        );
        setSuccessMsg(`"${item.name}" rate updated to ₹${p}${makeLive ? " & Live on app!" : ""}`);
        setTimeout(() => setSuccessMsg(""), 3500);
      } else {
        setErrorMsg(res.message || "Failed to update rate.");
      }
    });
  }

  function handleLoadCategoryTemplates() {
    startTransition(async () => {
      setErrorMsg("");
      setSuccessMsg("");
      const res = await seedCategoryTemplatesAction();
      if (res.success) {
        setSuccessMsg(res.message || "Standard items loaded!");
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setErrorMsg(res.message || "Could not load templates.");
      }
    });
  }

  const filteredItems = items.filter((item) => {
    // 1. Status Filter
    if (statusFilter === "active" && (item.price <= 0 || !item.isAvailable)) return false;
    if (statusFilter === "draft" && item.price > 0 && item.isAvailable) return false;

    // 2. Category Filter
    if (selectedCategory !== "All" && item.category !== selectedCategory) return false;

    // 3. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        item.category.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col gap-3 rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-700">
            {businessType ? `${businessType} Catalog & Rates` : "Merchant Catalog Manager"}
          </span>
          <h1 className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
            Menu, Items &amp; Pricing
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Manage your items for <strong>{businessName}</strong>. Items with prices and stock toggled ON appear live for customer orders.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLoadCategoryTemplates}
            disabled={isPending}
            className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3.5 py-2 text-xs sm:text-sm font-bold text-amber-900 shadow-xs hover:bg-amber-100 transition active:scale-95"
            title="Load category master list of staples, grocery brands, or services"
          >
            <span>⚡</span>
            <span>Pre-Seeded Catalog (बनी-बनाई लिस्ट)</span>
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-800 transition active:scale-95"
          >
            <span>➕</span>
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* ── Status Messages ── */}
      {errorMsg && (
        <div className="rounded-2xl border border-rose-300 bg-rose-50 p-4 text-xs font-bold text-rose-800 shadow-xs">
          ⚠️ {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 shadow-xs">
          ✓ {successMsg}
        </div>
      )}

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Total Items</p>
          <p className="mt-1 text-xl font-black text-slate-900">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Live for Customers</p>
          <p className="mt-1 text-xl font-black text-emerald-600">{activeCount}</p>
          <span className="text-[10px] text-emerald-700">Visible on /order</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Draft / Rate Missing</p>
          <p className="mt-1 text-xl font-black text-amber-600">{draftCount}</p>
          <span className="text-[10px] text-slate-400">Hidden until rate set</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Categories</p>
          <p className="mt-1 text-xl font-black text-blue-700">{categories.length - 1}</p>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Visibility:</span>
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              statusFilter === "active" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            🟢 Live for Customers ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
              statusFilter === "draft" ? "bg-amber-600 text-white" : "bg-amber-50 text-amber-800 hover:bg-amber-100"
            }`}
          >
            ⚪ Draft / Missing Rate ({draftCount})
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition shrink-0 ${
                  selectedCategory === cat
                    ? "bg-blue-700 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Quick Search in Menu */}
          <div className="relative shrink-0 sm:w-64">
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-blue-700"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Items Grid ── */}
      {filteredItems.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const isLive = item.price > 0 && item.isAvailable;
            return (
              <div
                key={item.id}
                className={`group flex flex-col justify-between rounded-2xl border p-4.5 transition-all shadow-2xs ${
                  isLive
                    ? "border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-xs"
                    : "border-amber-200 bg-amber-50/20"
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {item.itemType === "veg" && (
                        <span className="grid size-3.5 place-items-center rounded border border-emerald-600 p-0.5" title="Pure Veg">
                          <span className="size-1.5 rounded-full bg-emerald-600" />
                        </span>
                      )}
                      {item.itemType === "non_veg" && (
                        <span className="grid size-3.5 place-items-center rounded border border-rose-600 p-0.5" title="Non-Veg">
                          <span className="size-1.5 rounded-full bg-rose-600" />
                        </span>
                      )}
                      {item.itemType === "service" && (
                        <span className="text-xs">✂️</span>
                      )}
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600 truncate">
                        {item.category}
                      </span>
                    </div>

                    {/* Stock Switch */}
                    <button
                      onClick={() => handleToggleAvailability(item)}
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition ${
                        item.isAvailable
                          ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 hover:bg-emerald-100"
                          : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                      }`}
                      title="Click to toggle availability"
                    >
                      <span>{item.isAvailable ? "✓ Open" : "✕ Off"}</span>
                    </button>
                  </div>

                  <h3 className="mt-2.5 text-base font-bold text-slate-900 group-hover:text-blue-700 transition leading-snug">
                    {item.name}
                  </h3>

                  {item.description && (
                    <p className="mt-1 text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}

                  {/* Pricing or Inline Rate Editor */}
                  {item.price > 0 ? (
                    <div className="mt-3 flex items-baseline justify-between border-t border-slate-100 pt-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-slate-950">₹{item.price}</span>
                        {item.unit && (
                          <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                        )}
                      </div>
                      <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                        item.isAvailable ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-600"
                      }`}>
                        {item.isAvailable ? "Live on App" : "Turned Off"}
                      </span>
                    </div>
                  ) : (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-2.5 space-y-1.5">
                      <div className="flex items-center justify-between text-[11px] font-bold text-amber-900">
                        <span>⚠️ Rate Missing (Draft)</span>
                        <span className="text-[10px] text-amber-700">Enter rate to publish</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-700">₹</span>
                        <input
                          type="number"
                          min="0"
                          placeholder="Rate"
                          defaultValue=""
                          onChange={(e) => setInlineRates({ ...inlineRates, [item.id]: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleQuickRateSave(item, inlineRates[item.id] || "", true);
                            }
                          }}
                          className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs font-bold text-slate-900 focus:outline-blue-600"
                        />
                        <button
                          onClick={() => handleQuickRateSave(item, inlineRates[item.id] || "", true)}
                          disabled={isPending}
                          className="rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 shadow-2xs"
                        >
                          ✓ Set Live
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    onClick={() => openEditModal(item)}
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-blue-700 transition"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-2xs">
          <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-blue-50 text-2xl">
            📋
          </span>
          <h3 className="mt-3 text-base font-bold text-slate-900">No items found</h3>
          <p className="mt-1 text-xs text-slate-500">
            {search || selectedCategory !== "All"
              ? "Try adjusting your category filter or search query."
              : "Your catalog is empty. Click 'Pre-Seeded Catalog' above to instantly load standard items for your business category!"}
          </p>
        </div>
      )}

      {/* ── Add / Edit Item Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-7 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingItem ? "Edit Catalog Item" : "Add New Item"}
                </h2>
                <p className="text-xs text-slate-500">
                  Add details, rate, and customer availability.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="grid size-8 place-items-center rounded-xl bg-slate-100 text-sm font-bold text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-5 space-y-4">
              {errorMsg && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-bold text-rose-700">
                  {errorMsg}
                </div>
              )}

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crispy Corn, Surf Excel 1kg, Haircut..."
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Price & Unit Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Rate / Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="e.g. 140"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Unit / Portion
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1 Kg, Full, 1 Pc..."
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category & Item Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fast Food, Detergent..."
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as CatalogItemInput["itemType"])}
                    className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  >
                    <option value="veg">Pure Veg</option>
                    <option value="non_veg">Non-Veg</option>
                    <option value="egg">Egg</option>
                    <option value="product">Product / Packaged</option>
                    <option value="service">Service</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, size, brand, or details..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Image URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-blue-800 disabled:opacity-50"
                >
                  {isPending ? "Saving..." : editingItem ? "Update Item" : "Add to Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
