"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveMerchantMessage,
  saveMerchantSocialIntegration,
  publishPostizSocialPost,
  type SaveMessageInput,
} from "./actions";
import { suggestMessage, templatesForBusiness, type MessageCategory } from "@/lib/merchant-message-templates";
import { generateSocialCaption } from "@/lib/merchant-social";
import { renderCreativePoster } from "@/lib/creative-canvas";

type Saved = {
  id: string;
  category: string;
  template_id: string;
  title: string;
  message: string;
  cta_text: string | null;
  starts_at: string | null;
  ends_at: string | null;
  updated_at: string;
  image_url?: string | null;
  creative_style?: string | null;
  dish_name?: string | null;
  dish_price?: string | null;
  social_channels?: string[] | null;
  publish_status?: string | null;
};

type CatalogItem = {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string | null;
  item_type: string;
  is_available: boolean;
  image_url: string | null;
};

type SocialIntegration = {
  id?: string;
  provider: string;
  postiz_api_url: string | null;
  postiz_api_key: string | null;
  facebook_page_name: string | null;
  instagram_username: string | null;
  auto_publish_enabled: boolean;
  default_schedule_time: string | null;
} | null;

const categories: MessageCategory[] = ["Festival", "Offer", "Announcement", "New Product", "Customer Appreciation", "Seasonal"];

export default function MessageDesigner({
  businessName,
  businessType,
  city = "Bahraich",
  phone = "",
  saved = [],
  catalogItems = [],
  socialIntegration = null,
}: {
  businessName: string;
  businessType: string | null;
  city?: string;
  phone?: string;
  saved: Saved[];
  catalogItems?: CatalogItem[];
  socialIntegration?: SocialIntegration;
}) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"ai_creative" | "templates" | "social_settings">("ai_creative");

  // Template State (Preserving all existing contracts)
  const templates = useMemo(() => templatesForBusiness(businessType), [businessType]);
  const [templateId, setTemplateId] = useState(templates[0]?.id ?? "universal-thanks");
  const selected = templates.find((item) => item.id === templateId) ?? templates[0] ?? templatesForBusiness(null)[0]!;
  const [category, setCategory] = useState<MessageCategory>(selected.category);
  const [title, setTitle] = useState(selected.title);
  const [message, setMessage] = useState(selected.message);
  const [cta, setCta] = useState(selected.cta);
  const [prompt, setPrompt] = useState("");
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | undefined>();

  // AI Creative Photo State
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null);
  const [creativeStyle, setCreativeStyle] = useState<"foodie_craving" | "festive_gold" | "discount_dhamaka" | "minimal_luxe">("foodie_craving");
  const [dishName, setDishName] = useState(catalogItems[0]?.name ?? "Special Dish");
  const [dishPrice, setDishPrice] = useState(catalogItems[0]?.price ? `${catalogItems[0].price}/${catalogItems[0].unit || "plate"}` : "220");
  const [badgeText, setBadgeText] = useState("🔥 TODAY'S SPECIAL");
  const [captionTone, setCaptionTone] = useState<"foodie" | "festive" | "offer" | "short">("foodie");
  const [selectedChannels, setSelectedChannels] = useState<string[]>(["instagram", "facebook", "whatsapp"]);
  const [publishing, setPublishing] = useState(false);

  // Social Integration Settings State
  const [postizUrl, setPostizUrl] = useState(socialIntegration?.postiz_api_url ?? "");
  const [postizKey, setPostizKey] = useState(socialIntegration?.postiz_api_key ?? "");
  const [fbPage, setFbPage] = useState(socialIntegration?.facebook_page_name ?? "");
  const [igUser, setIgUser] = useState(socialIntegration?.instagram_username ?? "");
  const [autoPublish, setAutoPublish] = useState(socialIntegration?.auto_publish_enabled ?? true);
  const [savingSettings, setSavingSettings] = useState(false);

  // Canvas Ref
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imageElementRef = useRef<HTMLImageElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  // Re-render canvas when creative attributes change
  useEffect(() => {
    if (!canvasRef.current) return;
    renderCreativePoster({
      canvas: canvasRef.current,
      image: imageElementRef.current,
      style: creativeStyle,
      businessName,
      dishName,
      price: dishPrice,
      badgeText,
      rating: 4.8,
      phone,
      city,
    });
  }, [creativeStyle, dishName, dishPrice, badgeText, businessName, phone, city, photoDataUrl]);

  // Handle Photo selection/capture
  function handlePhotoUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setPhotoDataUrl(dataUrl);

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageElementRef.current = img;
        if (canvasRef.current) {
          renderCreativePoster({
            canvas: canvasRef.current,
            image: img,
            style: creativeStyle,
            businessName,
            dishName,
            price: dishPrice,
            badgeText,
            rating: 4.8,
            phone,
            city,
          });
        }
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
    setNotice("Photo loaded! Creative poster generated.");
  }

  // Select catalog item
  function selectCatalogItem(itemId: string) {
    const item = catalogItems.find((ci) => ci.id === itemId);
    if (!item) return;
    setDishName(item.name);
    setDishPrice(item.unit ? `${item.price}/${item.unit}` : `${item.price}`);
    setTitle(`Special ${item.name} at ${businessName}`);
    if (item.image_url) {
      setPhotoDataUrl(item.image_url);
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        imageElementRef.current = img;
        if (canvasRef.current) {
          renderCreativePoster({
            canvas: canvasRef.current,
            image: img,
            style: creativeStyle,
            businessName,
            dishName: item.name,
            price: item.unit ? `${item.price}/${item.unit}` : `${item.price}`,
            badgeText,
            rating: 4.8,
            phone,
            city,
          });
        }
      };
      img.src = item.image_url;
    }
  }

  // Generate AI Social Caption
  function handleGenerateCaption(tone: "foodie" | "festive" | "offer" | "short") {
    setCaptionTone(tone);
    const result = generateSocialCaption({
      dishName,
      price: dishPrice,
      businessName,
      city,
      phone,
      tone,
      customNotes: prompt || undefined,
    });
    setTitle(result.headline.slice(0, 110));
    setMessage(result.fullCaption.slice(0, 1950));
    setCta(phone ? `WhatsApp +91 ${phone}` : "Visit Today");
    setNotice("AI Social Caption & Local Hashtags ready!");
  }

  // Download high-resolution PNG
  function downloadCreativePoster() {
    if (!canvasRef.current) return;
    const link = document.createElement("a");
    link.download = `${dishName.toLowerCase().replace(/[^a-z0-9]/g, "-")}-creative.png`;
    link.href = canvasRef.current.toDataURL("image/png");
    link.click();
    setNotice("HD Creative Poster downloaded!");
  }

  // Postiz Publish Action
  async function publishPost() {
    setError("");
    setNotice("");
    setPublishing(true);
    try {
      const result = await publishPostizSocialPost({
        caption: `${title}\n\n${message}`,
        imageUrl: photoDataUrl || undefined,
        channels: selectedChannels,
        scheduleTime: startsAt || undefined,
      });

      if (!result.ok) {
        setError(result.message || "Failed to publish post.");
        return;
      }

      setNotice(result.message);
      // Auto-save as published message
      await saveMerchantMessage({
        id: editingId,
        category,
        templateId,
        title,
        message,
        cta,
        startsAt,
        endsAt,
        imageUrl: photoDataUrl,
        creativeStyle,
        dishName,
        dishPrice,
        socialChannels: selectedChannels,
        publishStatus: startsAt ? "scheduled" : "published",
      });
      router.refresh();
    } finally {
      setPublishing(false);
    }
  }

  // Save Social Settings Action
  async function handleSaveSocialSettings() {
    setError("");
    setNotice("");
    setSavingSettings(true);
    try {
      const res = await saveMerchantSocialIntegration({
        postizApiUrl: postizUrl,
        postizApiKey: postizKey,
        facebookPageName: fbPage,
        instagramUsername: igUser,
        autoPublishEnabled: autoPublish,
      });
      if (!res.ok) {
        setError(res.message || "Failed to save settings.");
        return;
      }
      setNotice("Social accounts & Postiz settings saved successfully!");
    } finally {
      setSavingSettings(false);
    }
  }

  // Preserved template interactions
  function choose(id: string) {
    const item = templates.find((entry) => entry.id === id);
    if (!item) return;
    setTemplateId(id);
    setCategory(item.category);
    setTitle(item.title);
    setMessage(item.message);
    setCta(item.cta);
    setNotice("");
  }

  function changeCategory(next: MessageCategory) {
    const item = templates.find((entry) => entry.category === next) ?? templatesForBusiness(null).find((entry) => entry.category === next);
    if (!item) return;
    setTemplateId(item.id);
    setCategory(item.category);
    setTitle(item.title);
    setMessage(item.message);
    setCta(item.cta);
    setNotice("");
  }

  function assist(tone: "Friendly" | "Premium" | "Festive" | "Short") {
    const suggestion = suggestMessage(prompt, tone);
    setTitle(suggestion.title);
    setMessage(suggestion.message);
    setCta(suggestion.cta);
  }

  function localDate(value: string | null) {
    if (!value) return "";
    const date = new Date(value);
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
    return date.toISOString().slice(0, 16);
  }

  async function save() {
    setError("");
    setNotice("");
    if (startsAt && endsAt && Date.parse(endsAt)<=Date.parse(startsAt)) {
      setError("End date must be after the start date.");
      return;
    }
    setSaving(true);
    try {
      const input: SaveMessageInput = {
        id: editingId,
        category,
        templateId,
        title,
        message,
        cta,
        startsAt,
        endsAt,
        imageUrl: photoDataUrl,
        creativeStyle,
        dishName,
        dishPrice,
        socialChannels: selectedChannels,
        publishStatus: startsAt ? "scheduled" : "draft",
      };
      const result = await saveMerchantMessage(input);
      if ("message" in result && !result.ok) {
        setError(result.message ?? "We could not save this message.");
        return;
      }
      setNotice(editingId ? "Message updated." : "Message saved to your plans.");
      setEditingId(undefined);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  function edit(item: Saved) {
    setEditingId(item.id);
    setCategory(item.category as MessageCategory);
    setTemplateId(item.template_id);
    setTitle(item.title);
    setMessage(item.message);
    setCta(item.cta_text ?? "");
    setStartsAt(localDate(item.starts_at));
    setEndsAt(localDate(item.ends_at));
    if (item.image_url) setPhotoDataUrl(item.image_url);
    if (item.creative_style) setCreativeStyle(item.creative_style as any);
    if (item.dish_name) setDishName(item.dish_name);
    if (item.dish_price) setDishPrice(item.dish_price);
    setNotice("Editing saved message.");
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function share() {
    const data = {
      title,
      text: `${title}\n\n${message}${cta ? `\n\n${cta}` : ""}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(data.text);
        setNotice("Message copied. Choose where to share it.");
      }
    } catch {
      setNotice("Sharing was cancelled.");
    }
  }

  function shareWhatsAppStatus() {
    const text = encodeURIComponent(`${title}\n\n${message}\n\n${cta ? `📲 ${cta}` : ""}`);
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  }

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
                Merchant Marketing Studio
              </span>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                AI Powered ✨
              </span>
            </div>
            <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Message Designer & Social Creative Studio
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Create high-converting branded social media creatives, AI captions, and auto-post to Instagram & Facebook for <strong>{businessName}</strong>.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5 text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab("ai_creative")}
              className={`rounded-xl px-4 py-2.5 transition ${
                activeTab === "ai_creative" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📸 AI Creative Photo & Post
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("templates")}
              className={`rounded-xl px-4 py-2.5 transition ${
                activeTab === "templates" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📝 Text Announcements
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("social_settings")}
              className={`rounded-xl px-4 py-2.5 transition ${
                activeTab === "social_settings" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⚙️ Social Accounts (Postiz)
            </button>
          </div>
        </div>
      </header>

      {/* Global Alerts */}
      {error && (
        <div role="alert" className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-semibold text-rose-800 shadow-sm">
          ⚠️ {error}
        </div>
      )}
      {notice && (
        <div role="status" className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-sm">
          ✓ {notice}
        </div>
      )}

      {/* TAB 1: AI CREATIVE PHOTO & SOCIAL POST */}
      {activeTab === "ai_creative" && (
        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          {/* Left Column: Photo Capture & Creative Settings */}
          <div className="space-y-6">
            {/* Step 1: Snap Photo */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-slate-900">1 · Snap or Upload Dish Photo</h2>
              <p className="mt-1 text-xs text-slate-500">
                Click a photo directly from your shop camera, select from gallery, or choose from your menu items.
              </p>

              {/* Hidden File Inputs */}
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && handlePhotoUpload(e.target.files[0])}
              />

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => cameraInputRef.current?.click()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700"
                >
                  📷 Direct Camera Click
                </button>
                <button
                  type="button"
                  onClick={() => galleryInputRef.current?.click()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  📁 Upload Photo
                </button>
              </div>

              {/* Quick Select from Menu */}
              {catalogItems.length > 0 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                    Or Quick-Pick From Your Menu Catalog:
                  </label>
                  <select
                    onChange={(e) => selectCatalogItem(e.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 text-sm font-semibold text-slate-800"
                  >
                    <option value="">-- Choose item from your menu --</option>
                    {catalogItems.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} — ₹{item.price} {item.unit ? `/${item.unit}` : ""} ({item.category})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </section>

            {/* Step 2: Item Details & Creative Style */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-slate-900">2 · Dish Details & Poster Style</h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Dish / Item Name
                  <input
                    value={dishName}
                    maxLength={60}
                    onChange={(e) => setDishName(e.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                    placeholder="e.g. Special Kaju Katli"
                  />
                </label>
                <label className="block text-sm font-semibold text-slate-700">
                  Price & Unit
                  <input
                    value={dishPrice}
                    maxLength={30}
                    onChange={(e) => setDishPrice(e.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                    placeholder="e.g. 880/kg or 220"
                  />
                </label>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Badge / Ribbon Text
                  <input
                    value={badgeText}
                    maxLength={40}
                    onChange={(e) => setBadgeText(e.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                    placeholder="e.g. 🔥 TODAY'S SPECIAL or ✨ FRESHLY MADE"
                  />
                </label>
              </div>

              {/* 4 Creative Themes */}
              <div className="mt-5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Choose Creative Visual Style:
                </label>
                <div className="mt-2.5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { id: "foodie_craving", label: "🍕 Foodie Craving", desc: "Swiggy / Zomato Dark & Gold" },
                    { id: "festive_gold", label: "✨ Festive Royal", desc: "Traditional Celebration Border" },
                    { id: "discount_dhamaka", label: "🔥 Discount Deal", desc: "High-Energy Offer Banner" },
                    { id: "minimal_luxe", label: "💎 Minimal Luxe", desc: "Clean & Modern Studio" },
                  ].map((st) => (
                    <button
                      type="button"
                      key={st.id}
                      onClick={() => setCreativeStyle(st.id as any)}
                      className={`flex flex-col rounded-2xl border p-3 text-left transition ${
                        creativeStyle === st.id
                          ? "border-amber-500 bg-amber-50/70 ring-2 ring-amber-200"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <strong className="text-xs font-bold text-slate-900">{st.label}</strong>
                      <span className="mt-1 text-[11px] leading-tight text-slate-500">{st.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Step 3: AI Copywriter & Hashtags */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">3 · AI Social Caption & Local Hashtags</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Choose tone to instantly generate engaging copy with local hashtags.</p>
                </div>
                <span className="rounded-full bg-purple-100 px-2.5 py-1 text-xs font-bold text-purple-800">AI Assist ✨</span>
              </div>

              {/* Quick Tone Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { tone: "foodie", label: "😋 Foodie Cravings" },
                  { tone: "festive", label: "🪔 Festive & Traditional" },
                  { tone: "offer", label: "🔥 Weekend Special / Deal" },
                  { tone: "short", label: "⚡ Short & Crisp" },
                ].map((item) => (
                  <button
                    type="button"
                    key={item.tone}
                    onClick={() => handleGenerateCaption(item.tone as any)}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
                      captionTone === item.tone
                        ? "bg-purple-600 text-white shadow-sm"
                        : "border border-purple-200 bg-purple-50 text-purple-900 hover:bg-purple-100"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Post Headline
                <input
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                />
              </label>

              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Full Caption (Includes Local Hashtags & WhatsApp link)
                <textarea
                  value={message}
                  maxLength={2000}
                  rows={6}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3 text-xs leading-5"
                />
              </label>
            </section>
          </div>

          {/* Right Column: Live Poster Canvas & Publishing Controls */}
          <div className="space-y-6">
            {/* Live Canvas Preview */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Preview · Live Creative Poster</h2>
                  <p className="mt-0.5 text-xs text-slate-500">1080 × 1080 HD Instagram / Facebook Ready</p>
                </div>
                <button
                  type="button"
                  onClick={downloadCreativePoster}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  ⬇️ Download HD Poster
                </button>
              </div>

              <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 shadow-inner">
                <canvas
                  ref={canvasRef}
                  className="h-auto w-full object-contain"
                  style={{ maxHeight: "480px" }}
                />
              </div>
            </section>

            {/* Publishing & Scheduling Card */}
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-slate-900">4 · Publish or Schedule Post</h2>

              {/* Target Channels */}
              <div className="mt-4">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Publishing Channels:
                </label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {[
                    { id: "instagram", label: "📸 Instagram Feed" },
                    { id: "facebook", label: "📘 Facebook Page" },
                    { id: "whatsapp", label: "💬 WhatsApp Status" },
                  ].map((ch) => {
                    const active = selectedChannels.includes(ch.id);
                    return (
                      <button
                        type="button"
                        key={ch.id}
                        onClick={() =>
                          setSelectedChannels((prev) =>
                            active ? prev.filter((x) => x !== ch.id) : [...prev, ch.id]
                          )
                        }
                        className={`rounded-full px-3 py-1.5 text-xs font-bold transition ${
                          active
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 bg-slate-100 text-slate-600"
                        }`}
                      >
                        {active ? "✓ " : ""}{ch.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Schedule Dates */}
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Start / Schedule time
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 px-2.5 text-xs"
                  />
                </label>
                <label className="block text-xs font-semibold text-slate-700">
                  End / Validity time
                  <input
                    type="datetime-local"
                    min={startsAt || undefined}
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="mt-1 min-h-10 w-full rounded-xl border border-slate-200 px-2.5 text-xs"
                  />
                </label>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={publishing}
                  onClick={publishPost}
                  className="min-h-11 flex-1 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 text-sm font-bold text-white shadow-md transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
                >
                  {publishing ? "Publishing..." : "🚀 Post Now (via Postiz)"}
                </button>

                <button
                  type="button"
                  onClick={shareWhatsAppStatus}
                  className="min-h-11 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm hover:bg-emerald-700"
                  title="Share directly to WhatsApp"
                >
                  💬 1-Tap WhatsApp
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={save}
                  className="min-h-11 rounded-xl bg-amber-700 px-4 text-sm font-bold text-white disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save Plan"}
                </button>

                <button
                  type="button"
                  onClick={share}
                  className="min-h-11 rounded-xl border border-slate-300 bg-white px-4 text-sm font-bold text-slate-800 hover:bg-slate-50"
                >
                  Share…
                </button>
              </div>

              <p className="mt-3 text-[11px] leading-4 text-slate-500">
                Postiz API pushes to connected Instagram & Facebook accounts. WhatsApp opens with your full caption and allows attaching your downloaded creative.
              </p>
            </section>
          </div>
        </div>
      )}

      {/* TAB 2: TEXT ANNOUNCEMENTS & SEASONAL TEMPLATES (Preserving previous layout & tests) */}
      {activeTab === "templates" && (
        <div className="space-y-6">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-lg font-bold text-slate-900">1 · Choose a template</h2>
            <p className="mt-1 text-sm text-slate-500">Recommended for {businessType || "your business"}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {templates.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  aria-pressed={templateId===item.id}
                  onClick={() => choose(item.id)}
                  className={`overflow-hidden rounded-2xl border text-left transition ${
                    templateId === item.id ? "border-amber-500 ring-2 ring-amber-200" : "border-slate-200 hover:border-amber-300"
                  }`}
                >
                  <div className={`bg-gradient-to-br ${item.palette} p-4 text-white`}>
                    <div className="text-xs font-bold uppercase tracking-[.2em] opacity-80">{item.motif}</div>
                    <h3 className="mt-4 text-lg font-extrabold leading-tight">{item.title}</h3>
                    <p className="mt-2 line-clamp-2 text-sm text-white/90">{item.message}</p>
                    <span className="mt-3 inline-flex rounded-full bg-white/20 px-3 py-1 text-xs font-bold">{item.cta}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white px-3 py-2.5">
                    <span>
                      <strong className="block text-sm text-slate-900">{item.name}</strong>
                      <span className="text-xs text-slate-500">
                        {item.category} · {item.relevance}
                      </span>
                    </span>
                    <span className="text-xs font-bold text-amber-700">{templateId === item.id ? "Selected" : "Choose"}</span>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
              <h2 className="text-lg font-bold text-slate-900">2 · Edit your message</h2>
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Category
                <select
                  value={category}
                  onChange={(e) => changeCategory(e.target.value as MessageCategory)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3"
                >
                  {categories.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </label>
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Title
                <input
                  value={title}
                  maxLength={120}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3"
                />
              </label>
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Message
                <textarea
                  value={message}
                  maxLength={2000}
                  rows={4}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 p-3"
                />
              </label>
              <label className="mt-4 block text-sm font-semibold text-slate-700">
                Call to action (optional)
                <input
                  value={cta}
                  maxLength={80}
                  onChange={(e) => setCta(e.target.value)}
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3"
                />
              </label>
              <h3 className="mt-6 font-bold text-slate-900">AI message assist</h3>
              <p className="mt-1 text-xs text-slate-500">Suggestions stay editable and are never sent automatically.</p>
              <textarea
                value={prompt}
                maxLength={240}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Diwali ke liye sweets customers ko message banana hai"
                rows={2}
                className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm"
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {(["Friendly", "Premium", "Festive", "Short"] as const).map((tone) => (
                  <button
                    type="button"
                    onClick={() => assist(tone)}
                    key={tone}
                    className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900"
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-bold text-slate-900">3 · Preview</h2>
                <div className={`mt-4 min-h-64 rounded-3xl bg-gradient-to-br ${selected.palette} p-6 text-white shadow-lg`}>
                  <p className="text-xs font-bold uppercase tracking-[.22em] text-white/75">
                    {category} · {businessName}
                  </p>
                  <div className="my-7 text-3xl">{selected.motif}</div>
                  <h3 className="text-2xl font-extrabold leading-tight">{title || "Your title"}</h3>
                  <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/90">{message || "Your message"}</p>
                  {cta && <span className="mt-5 inline-flex rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-900">{cta}</span>}
                  <p className="mt-5 border-t border-white/25 pt-3 text-xs text-white/80">
                    {endsAt ? `Valid until ${new Date(endsAt).toLocaleString()}` : "Plan the dates below"}
                  </p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
                <h2 className="text-lg font-bold text-slate-900">4 · Dates / validity</h2>
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  Start date and time
                  <input
                    type="datetime-local"
                    value={startsAt}
                    onChange={(e) => setStartsAt(e.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>
                <label className="mt-4 block text-sm font-semibold text-slate-700">
                  End date and time
                  <input
                    type="datetime-local"
                    min={startsAt || undefined}
                    value={endsAt}
                    onChange={(e) => setEndsAt(e.target.value)}
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3"
                  />
                </label>
                <div className="mt-5 flex flex-wrap gap-3">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={save}
                    className="min-h-11 rounded-xl bg-amber-700 px-5 font-bold text-white disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "5 · Save plan"}
                  </button>
                  <button type="button" onClick={share} className="min-h-11 rounded-xl border border-slate-300 px-5 font-bold text-slate-800">
                    Share…
                  </button>
                </div>
                <p className="mt-3 text-xs leading-5 text-slate-500">
                  Sharing opens your device’s share choices, or copies the message. It does not send automatically. Offers are not linked to ratings or reviews.
                </p>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* TAB 3: SOCIAL ACCOUNTS & POSTIZ SETTINGS */}
      {activeTab === "social_settings" && (
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="max-w-2xl">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
              Postiz & Meta Integration
            </span>
            <h2 className="mt-2 text-xl font-bold text-slate-900">Connect Your Social Media Accounts</h2>
            <p className="mt-1 text-sm text-slate-600">
              Integrate Postiz to automatically plan, schedule, and publish creatives directly to your Facebook Page, Instagram, and more without leaving the Trustit dashboard.
            </p>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-slate-700">
                Postiz API Endpoint
                <input
                  value={postizUrl}
                  onChange={(e) => setPostizUrl(e.target.value)}
                  placeholder="https://api.postiz.com/v1/posts or self-hosted URL"
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-mono"
                />
              </label>

              <label className="block text-sm font-semibold text-slate-700">
                Postiz API Key
                <input
                  type="password"
                  value={postizKey}
                  onChange={(e) => setPostizKey(e.target.value)}
                  placeholder="pstz_live_..."
                  className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm font-mono"
                />
                <span className="mt-1 block text-xs text-slate-500">
                  Obtain your API Key from your Postiz account settings under Developers / API.
                </span>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-slate-700">
                  Connected Facebook Page Name
                  <input
                    value={fbPage}
                    onChange={(e) => setFbPage(e.target.value)}
                    placeholder="e.g. Shukla Misthan Bhandar"
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  />
                </label>

                <label className="block text-sm font-semibold text-slate-700">
                  Connected Instagram Username
                  <input
                    value={igUser}
                    onChange={(e) => setIgUser(e.target.value)}
                    placeholder="e.g. @shuklasweets_bahraich"
                    className="mt-1.5 min-h-11 w-full rounded-xl border border-slate-200 px-3 text-sm"
                  />
                </label>
              </div>

              <label className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-slate-800">
                  Enable automatic publishing when scheduling posts
                </span>
              </label>

              <div className="pt-4">
                <button
                  type="button"
                  disabled={savingSettings}
                  onClick={handleSaveSocialSettings}
                  className="min-h-11 rounded-xl bg-blue-600 px-6 font-bold text-white shadow-sm hover:bg-blue-700 disabled:opacity-60"
                >
                  {savingSettings ? "Saving Settings..." : "Save Social Configuration"}
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* SAVED PLANS SECTION (Preserved contract) */}
      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
        <h2 className="text-lg font-bold text-slate-900">Saved plans</h2>
        {saved.length ? (
          <ul className="mt-3 divide-y divide-slate-100">
            {saved.map((item) => {
              const now = Date.now();
              const state =
                item.ends_at && Date.parse(item.ends_at) < now
                  ? "Expired"
                  : item.starts_at && Date.parse(item.starts_at) > now
                  ? "Scheduled"
                  : "Valid now";

              return (
                <li key={item.id} className="py-4">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <strong className="text-sm text-slate-900">{item.title}</strong>
                      <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">{item.category}</span>
                      <span className="ml-2 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800">{state}</span>
                      {item.dish_name && (
                        <span className="ml-2 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800">
                          🍽️ {item.dish_name} {item.dish_price ? `(₹${item.dish_price})` : ""}
                        </span>
                      )}
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{item.message}</p>
                      <p className="mt-1 text-xs text-slate-400">
                        {item.starts_at ? `Starts ${new Date(item.starts_at).toLocaleString()}` : "Unscheduled"}
                        {item.ends_at ? ` · Ends ${new Date(item.ends_at).toLocaleString()}` : ""}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => edit(item)}
                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Edit plan
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-slate-500">Your saved plans will appear here.</p>
        )}
      </section>
    </div>
  );
}
