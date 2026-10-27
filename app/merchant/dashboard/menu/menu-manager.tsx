"use client";

import { useState, useTransition } from "react";
import {
  saveCatalogItemAction,
  deleteCatalogItemAction,
  toggleItemAvailabilityAction,
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
}: {
  initialItems: MenuItem[];
  businessName: string;
}) {
  const [items, setItems] = useState<MenuItem[]>(initialItems);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
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
        const savedItem = res.item as unknown as {
          id: string;
          business_id: string;
          name: string;
          category: string;
          price: number;
          unit: string | null;
          item_type: CatalogItemInput["itemType"];
          image_url: string | null;
          description: string | null;
          is_available: boolean;
        };

        if (savedItem) {
          const formatted: MenuItem = {
            id: savedItem.id,
            businessId: savedItem.business_id,
            name: savedItem.name,
            category: savedItem.category,
            price: Number(savedItem.price),
            unit: savedItem.unit,
            itemType: savedItem.item_type,
            imageUrl: savedItem.image_url,
            description: savedItem.description,
            isAvailable: savedItem.is_available,
          };

          if (editingItem) {
            setItems((prev) => prev.map((i) => (i.id === editingItem.id ? formatted : i)));
          } else {
            setItems((prev) => [formatted, ...prev]);
          }
        }
        setTimeout(() => setIsModalOpen(false), 600);
      }
    });
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}" from your menu?`)) return;

    startTransition(async () => {
      const res = await deleteCatalogItemAction(id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
      } else {
        alert(res.message || "Failed to delete item.");
      }
    });
  }

  function handleToggleAvailability(item: MenuItem) {
    const nextState = !item.isAvailable;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isAvailable: nextState } : i))
    );

    startTransition(async () => {
      const res = await toggleItemAvailabilityAction(item.id, nextState);
      if (!res.success) {
        // Revert on failure
        setItems((prev) =>
          prev.map((i) => (i.id === item.id ? { ...i, isAvailable: !nextState } : i))
        );
      }
    });
  }

  const filteredItems = items.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      item.name.toLowerCase().includes(search.toLowerCase().trim()) ||
      item.category.toLowerCase().includes(search.toLowerCase().trim());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Digital Catalog</p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">Menu & Item Catalog</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600">
            Add items, rates, and services for <strong>{businessName}</strong>. These appear on your customer discovery page.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs hover:bg-blue-800 transition active:scale-95"
        >
          <span>➕</span>
          <span>Add New Item</span>
        </button>
      </div>

      {/* ── Stats Strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Total Items</p>
          <p className="mt-1 text-xl font-black text-slate-900">{items.length}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Categories</p>
          <p className="mt-1 text-xl font-black text-blue-700">{categories.length - 1}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">In Stock / Active</p>
          <p className="mt-1 text-xl font-black text-emerald-600">
            {items.filter((i) => i.isAvailable).length}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500">Pure Veg Items</p>
          <p className="mt-1 text-xl font-black text-slate-900">
            {items.filter((i) => i.itemType === "veg").length}
          </p>
        </div>
      </div>

      {/* ── Filter & Search Toolbar ── */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
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
            placeholder="Search items in menu..."
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

      {/* ── Items Grid ── */}
      {filteredItems.length ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`group flex flex-col justify-between rounded-2xl border p-4.5 transition-all shadow-2xs ${
                item.isAvailable
                  ? "border-slate-200/90 bg-white hover:border-blue-300 hover:shadow-xs"
                  : "border-slate-200 bg-slate-50/60 opacity-60"
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

                  {/* Available Switch */}
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-extrabold transition ${
                      item.isAvailable
                        ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-600/20 hover:bg-emerald-100"
                        : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                    }`}
                    title="Click to toggle availability"
                  >
                    <span>{item.isAvailable ? "✓ In Stock" : "✕ Out of Stock"}</span>
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

                <div className="mt-3 flex items-baseline gap-1.5">
                  <span className="text-lg font-black text-slate-950">₹{item.price}</span>
                  {item.unit && (
                    <span className="text-xs font-semibold text-slate-500">{item.unit}</span>
                  )}
                </div>
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
          ))}
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
              : "Your menu is currently empty. Add your first dish, product, or service!"}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white hover:bg-blue-800 transition"
          >
            <span>➕ Add Item Now</span>
          </button>
        </div>
      )}

      {/* ── Add / Edit Item Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
              <h2 className="text-lg font-black text-slate-900">
                {editingItem ? "Edit Menu Item" : "Add New Menu Item"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="grid size-8 place-items-center rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              {errorMsg && (
                <div className="rounded-xl bg-rose-50 p-3 text-xs font-bold text-rose-800 border border-rose-200">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="rounded-xl bg-emerald-50 p-3 text-xs font-bold text-emerald-800 border border-emerald-200">
                  {successMsg}
                </div>
              )}

              {/* Item Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Kaju Katli, Chicken Dum Biryani"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-700 focus:outline-hidden"
                />
              </div>

              {/* Category & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Category *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sweets, Starters"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Item Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as CatalogItemInput["itemType"])}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-700 focus:outline-hidden bg-white"
                  >
                    <option value="veg">🟢 Pure Veg</option>
                    <option value="non_veg">🔴 Non-Veg</option>
                    <option value="egg">🟡 With Egg</option>
                    <option value="service">✂️ Service</option>
                    <option value="product">📦 Product</option>
                  </select>
                </div>
              </div>

              {/* Price & Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 450"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-700 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Unit / Quantity
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. per kg, per plate, per pc"
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs sm:text-sm text-slate-900 focus:border-blue-700 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation, portion size..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-hidden resize-none"
                />
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Item Photo URL (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-hidden"
                />
                {formImageUrl && (
                  <div className="mt-2 flex items-center gap-2">
                    <img
                      src={formImageUrl}
                      alt="Preview"
                      className="size-12 rounded-lg object-cover border border-slate-200"
                      onError={(e) => ((e.target as HTMLElement).style.display = "none")}
                    />
                    <span className="text-[11px] text-slate-500">Image preview</span>
                  </div>
                )}
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="rounded-xl bg-blue-700 px-5 py-2 text-xs font-bold text-white hover:bg-blue-800 transition disabled:opacity-50"
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
