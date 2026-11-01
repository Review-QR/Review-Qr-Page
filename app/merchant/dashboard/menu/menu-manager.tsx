"use client";

import { useState, useTransition, useRef } from "react";
import {
  saveCatalogItemAction,
  deleteCatalogItemAction,
  toggleItemAvailabilityAction,
  seedCategoryTemplatesAction,
  quickUpdateRateAction,
  uploadCatalogItemImageAction,
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
  const [imageUploading, setImageUploading] = useState(false);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setErrorMsg("");
    setImageUploading(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const res = await uploadCatalogItemImageAction(fd);
      if (res.success && res.imageUrl) {
        setFormImageUrl(res.imageUrl);
      } else {
        setErrorMsg(res.message || "Failed to upload image.");
      }
    } catch {
      setErrorMsg("Failed to upload image. Please try again.");
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  }

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
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
            {businessType ? `${businessType} Catalog & Rates` : "Merchant Catalog Manager"}
          </span>
          <h1 className="mt-0.5 text-xl font-bold text-slate-950 sm:text-2xl">
            Menu, Items &amp; Pricing
          </h1>
          <p className="mt-0.5 text-xs text-slate-600">
            Manage your items for <strong>{businessName}</strong>. Turn items ON/OFF in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openAddModal}
            className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl bg-blue-700 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-800 transition active:scale-95 cursor-pointer"
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
      <div className="flex flex-col gap-2.5 rounded-2xl border border-slate-200/90 bg-white p-3 shadow-2xs sm:flex-row sm:items-center sm:justify-between sm:p-3.5">
        {/* Status Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setStatusFilter("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              statusFilter === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              statusFilter === "active" ? "bg-emerald-600 text-white" : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
            }`}
          >
            🟢 In Stock ({activeCount})
          </button>
          <button
            onClick={() => setStatusFilter("draft")}
            className={`rounded-lg px-2.5 py-1 text-xs font-bold transition cursor-pointer ${
              statusFilter === "draft" ? "bg-rose-600 text-white" : "bg-rose-50 text-rose-800 hover:bg-rose-100"
            }`}
          >
            🔴 Out of Stock / Draft ({draftCount})
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative shrink-0 sm:w-72">
          <input
            type="text"
            placeholder="Search item, ingredient or rate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-blue-700"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ── Line-by-Line Items List ── */}
      {filteredItems.length ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs divide-y divide-slate-100">
          {/* Optional Table Header on Desktop */}
          <div className="hidden sm:grid sm:grid-cols-12 gap-3 bg-slate-50/80 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80">
            <div className="col-span-1 text-center">Image</div>
            <div className="col-span-4 flex items-center gap-2">Item &amp; Description</div>
            <div className="col-span-2 text-center">Portion / Unit</div>
            <div className="col-span-2 text-right">Price (₹)</div>
            <div className="col-span-2 text-center">Stock Status</div>
            <div className="col-span-1 text-right">Actions</div>
          </div>

          {filteredItems.map((item) => {
            const isLive = item.price > 0 && item.isAvailable;
            return (
              <div
                key={item.id}
                className={`group flex flex-col sm:grid sm:grid-cols-12 gap-2.5 sm:gap-3 items-start sm:items-center px-4 py-3 transition hover:bg-slate-50/70 ${
                  !item.isAvailable ? "bg-slate-50/40 opacity-75 hover:opacity-100" : ""
                }`}
              >
                {/* Col 0: Image Box (Col-span 1) */}
                <div className="sm:col-span-1 flex items-center justify-start sm:justify-center shrink-0">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      onClick={() => openEditModal(item)}
                      className="size-11 sm:size-12 rounded-xl object-cover border border-slate-200 bg-slate-100 shadow-2xs cursor-pointer hover:opacity-90 transition"
                      title="Click to view/edit photo"
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="grid size-11 sm:size-12 place-items-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-slate-400 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 cursor-pointer transition shadow-2xs"
                      title="Add photo"
                    >
                      <span className="text-base">📸</span>
                    </button>
                  )}
                </div>

                {/* Col 1: Veg/Non-Veg + Name + Category + Description (Col-span 4) */}
                <div className="sm:col-span-4 flex items-start gap-2.5 min-w-0 w-full">
                  <div className="mt-0.5 shrink-0">
                    {item.itemType === "veg" && (
                      <span className="grid size-4 place-items-center rounded border border-emerald-600 bg-emerald-50/60 p-0.5" title="Pure Veg">
                        <span className="size-2 rounded-full bg-emerald-600" />
                      </span>
                    )}
                    {item.itemType === "non_veg" && (
                      <span className="grid size-4 place-items-center rounded border border-rose-600 bg-rose-50/60 p-0.5" title="Non-Veg">
                        <span className="size-2 rounded-full bg-rose-600" />
                      </span>
                    )}
                    {item.itemType === "egg" && (
                      <span className="grid size-4 place-items-center rounded border border-amber-600 bg-amber-50/60 p-0.5" title="Egg">
                        <span className="size-2 rounded-full bg-amber-600" />
                      </span>
                    )}
                    {item.itemType === "service" && (
                      <span className="text-sm" title="Service">✂️</span>
                    )}
                    {item.itemType === "product" && (
                      <span className="text-sm" title="Product">📦</span>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 transition">
                        {item.name}
                      </span>
                      {item.category && item.category !== "General" && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.2 text-[10px] font-semibold text-slate-600">
                          {item.category}
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="mt-0.5 text-[11px] text-slate-500 line-clamp-1">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Col 2: Portion / Unit (Col-span 2) */}
                <div className="sm:col-span-2 text-left sm:text-center shrink-0">
                  <span className="inline-block rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-medium text-slate-700">
                    {item.unit || "Standard / 1 Piece"}
                  </span>
                </div>

                {/* Col 3: Price / Inline Rate (Col-span 2) */}
                <div className="sm:col-span-2 text-left sm:text-right shrink-0">
                  {item.price > 0 ? (
                    <span className="text-sm font-black text-slate-950">₹{item.price}</span>
                  ) : (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        placeholder="Rate ₹"
                        defaultValue=""
                        onChange={(e) => setInlineRates({ ...inlineRates, [item.id]: e.target.value })}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleQuickRateSave(item, inlineRates[item.id] || "", true);
                          }
                        }}
                        className="w-16 rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-xs font-bold text-slate-900 focus:outline-blue-600"
                      />
                      <button
                        onClick={() => handleQuickRateSave(item, inlineRates[item.id] || "", true)}
                        disabled={isPending}
                        className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-emerald-700 cursor-pointer"
                      >
                        Set
                      </button>
                    </div>
                  )}
                </div>

                {/* Col 4: Live Stock Toggle Button (Col-span 2) */}
                <div className="sm:col-span-2 flex justify-start sm:justify-center shrink-0">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    disabled={isPending}
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-extrabold transition shadow-2xs cursor-pointer ${
                      item.isAvailable
                        ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100"
                        : "bg-slate-100 text-slate-600 border border-slate-300 hover:bg-slate-200"
                    }`}
                    title="Click to toggle In Stock / Out of Stock"
                  >
                    <span className={`size-2 rounded-full ${item.isAvailable ? "bg-emerald-600 animate-pulse" : "bg-slate-400"}`} />
                    <span>{item.isAvailable ? "In Stock" : "Out of Stock"}</span>
                  </button>
                </div>

                {/* Col 5: Actions (Col-span 1) */}
                <div className="sm:col-span-1 flex items-center justify-end gap-1.5 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-blue-700 transition cursor-pointer"
                    title="Edit item"
                  >
                    <span className="material-symbols-outlined text-[17px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
                    title="Delete item"
                  >
                    <span className="material-symbols-outlined text-[17px]">delete</span>
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
              {!editingItem && (
                <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-amber-950">⚡ Need standard items quickly?</p>
                    <p className="text-[11px] text-amber-800">Load pre-seeded category catalog in 1 click.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLoadCategoryTemplates}
                    disabled={isPending}
                    className="shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs px-3 py-1.5 shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {isPending ? "Loading…" : "Load Templates"}
                  </button>
                </div>
              )}

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
                    placeholder="e.g. 1 Kg, Full, 1 Piece..."
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {["1 Piece", "Standard", "Half", "Full", "Per Plate", "1 Kg", "500 ml"].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setFormUnit(preset)}
                        className="rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Item Type (Veg / Non-Veg / Service) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Item Food / Service Type *
                </label>
                <select
                  value={formType}
                  onChange={(e) => setFormType(e.target.value as CatalogItemInput["itemType"])}
                  className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none font-medium"
                >
                  <option value="veg">🟢 Pure Veg</option>
                  <option value="non_veg">🔴 Non-Veg</option>
                  <option value="egg">🟡 Egg</option>
                  <option value="product">📦 Packaged Grocery / Product</option>
                  <option value="service">✂️ Service (Salon / Wash / Repair)</option>
                </select>
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

              {/* Item Photo & Live Camera Box */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Item Photo (आइटम की फोटो)
                </label>
                <div className="mt-1.5 rounded-2xl border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    {/* Photo Box / Preview */}
                    <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-300 bg-white shadow-2xs">
                      {formImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={formImageUrl} alt="Item Preview" className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-400 p-1 text-center">
                          <span className="text-xl">📷</span>
                          <span className="text-[9px] font-semibold mt-0.5">No photo</span>
                        </div>
                      )}
                      {imageUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-xs">
                          <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        </div>
                      )}
                    </div>

                    {/* Action Buttons: Direct Camera & Choose from Files */}
                    <div className="flex-1 space-y-1.5 w-full">
                      <p className="text-xs font-semibold text-slate-800">
                        {formImageUrl ? "Item photo attached ✓" : "Take live photo or upload from device"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Camera se live photo lein ya folder se select karein.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {/* Hidden Inputs */}
                        <input
                          ref={cameraInputRef}
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <input
                          ref={galleryInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg,image/webp"
                          onChange={handleImageUpload}
                          className="hidden"
                        />

                        {/* Direct Camera Button */}
                        <button
                          type="button"
                          disabled={imageUploading}
                          onClick={() => cameraInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-2xs cursor-pointer transition active:scale-95 disabled:opacity-50"
                        >
                          <span>📸</span>
                          <span>Click from Camera</span>
                        </button>

                        {/* Choose File (Upload) Button */}
                        <button
                          type="button"
                          disabled={imageUploading}
                          onClick={() => galleryInputRef.current?.click()}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold shadow-2xs cursor-pointer transition active:scale-95 disabled:opacity-50"
                        >
                          <span>📁</span>
                          <span>Choose from Files</span>
                        </button>

                        {/* Remove Photo Button */}
                        {formImageUrl && (
                          <button
                            type="button"
                            disabled={imageUploading}
                            onClick={() => setFormImageUrl("")}
                            className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold cursor-pointer transition disabled:opacity-50"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
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
