"use client";

import { useState } from "react";
import {
  saveMerchantOccasionDraftAction,
  updateMerchantOccasionScheduleAction,
} from "./actions";

export type OccasionDraft = {
  id?: string;
  occasion_type: "birthday" | "anniversary" | "festival" | "offer";
  template_style: string;
  headline: string;
  body_text: string;
  discount_percent: number;
  coupon_validity_days: number;
  is_active: boolean;
};

const DEFAULT_BIRTHDAY_MESSAGES = [
  "Aapke is khas janamdin par hamari taraf se dher saari shubh-kamnaye! 🎉 Aapka aane wala saal khushiyo se bhara ho. Hamare sang jude rehne ke liye dil se shukriya!",
  "Janmadin ki dher saari badhaiyan Lucky ji! 🎂 Aapka yeh khas din mangalmay ho. Is khas din ko aur bhi yaadgar banane ke liye hamari taraf se ek chhota sa uphar!",
  "Wishing you a very Happy Birthday! 🌟 May this year bring you immense success, health and joy. Celebrate your special day with our exclusive anniversary treat!",
];

const DEFAULT_ANNIVERSARY_MESSAGES = [
  "Aapki Marriage Anniversary par aap dono ko dher saari shubh-kamnaye! 💍 Aapki jodi hamesha salamat rahe aur khushiyo se aangan mehkata rahe!",
  "Saalgirah ki hardik badhaiyan! 🥂 Prem aur vishwas ka yeh bandhan hamesha aise hi mazboot rahe. Celebrate with your loved ones with our special anniversary offer!",
  "Happy Wedding Anniversary! ✨ Wishing you both a lifetime of love, laughter, and togetherness. Treat yourselves to something special today!",
];

export default function OccasionStudio({
  businessName,
  logoUrl,
  initialDrafts = [],
  dailyDispatchTime = "09:00",
  creditsBalance = 0,
}: {
  businessName: string;
  logoUrl: string | null;
  initialDrafts?: OccasionDraft[];
  dailyDispatchTime?: string;
  creditsBalance?: number;
}) {
  const [occasionType, setOccasionType] = useState<"birthday" | "anniversary" | "festival" | "offer">("birthday");

  // Find existing draft or set defaults
  const bDraft = initialDrafts.find((d) => d.occasion_type === "birthday");
  const aDraft = initialDrafts.find((d) => d.occasion_type === "anniversary");

  // Form states
  const [headline, setHeadline] = useState(
    occasionType === "birthday"
      ? bDraft?.headline || "🎉 Happy Birthday! Janmadin Ki Dhero Shubh-kamnaye"
      : aDraft?.headline || "💍 Happy Marriage Anniversary! Saalgirah Mubarak"
  );
  const [bodyText, setBodyText] = useState(
    occasionType === "birthday"
      ? bDraft?.body_text || DEFAULT_BIRTHDAY_MESSAGES[0]
      : aDraft?.body_text || DEFAULT_ANNIVERSARY_MESSAGES[0]
  );
  const [templateStyle, setTemplateStyle] = useState<string>("gold_celebration");
  const [discountPercent, setDiscountPercent] = useState<number>(15);
  const [couponValidityDays, setCouponValidityDays] = useState<number>(7);
  const [dispatchTime, setDispatchTime] = useState(dailyDispatchTime);
  const [autoBirthday, setAutoBirthday] = useState(bDraft?.is_active ?? true);
  const [autoAnniversary, setAutoAnniversary] = useState(aDraft?.is_active ?? true);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; error: boolean } | null>(null);

  function handleOccasionSwitch(type: "birthday" | "anniversary" | "festival" | "offer") {
    setOccasionType(type);
    setSaveMsg(null);
    if (type === "birthday") {
      setHeadline(bDraft?.headline || "🎉 Happy Birthday! Janmadin Ki Dhero Shubh-kamnaye");
      setBodyText(bDraft?.body_text || DEFAULT_BIRTHDAY_MESSAGES[0]);
      setDiscountPercent(bDraft?.discount_percent ?? 15);
    } else if (type === "anniversary") {
      setHeadline(aDraft?.headline || "💍 Happy Marriage Anniversary! Saalgirah Mubarak");
      setBodyText(aDraft?.body_text || DEFAULT_ANNIVERSARY_MESSAGES[0]);
      setDiscountPercent(aDraft?.discount_percent ?? 20);
    } else if (type === "festival") {
      setHeadline("🪔 Shubh Deepawali / Festive Wishes & Grand Offers");
      setBodyText("Aapko aur aapke poore parivar ko tyohar ki hardik shubhkamnaye! Is utsav ke mausam par paiye shandar offers aur chhut.");
      setDiscountPercent(25);
    } else {
      setHeadline("🔥 Today's Special Dish & Chef's Exclusive Discount");
      setBodyText("Aaj ka din khas hai! Hamari kitchen me aaj ban raha hai fresh aur special swadist menu.");
      setDiscountPercent(10);
    }
  }

  function handleRegenerateText() {
    if (occasionType === "birthday") {
      const remaining = DEFAULT_BIRTHDAY_MESSAGES.filter((m) => m !== bodyText);
      const next = remaining[Math.floor(Math.random() * remaining.length)];
      setBodyText(next || DEFAULT_BIRTHDAY_MESSAGES[0]);
    } else if (occasionType === "anniversary") {
      const remaining = DEFAULT_ANNIVERSARY_MESSAGES.filter((m) => m !== bodyText);
      const next = remaining[Math.floor(Math.random() * remaining.length)];
      setBodyText(next || DEFAULT_ANNIVERSARY_MESSAGES[0]);
    }
  }

  async function handleSaveDraft() {
    setSaveMsg(null);
    setSaving(true);
    try {
      const res = await saveMerchantOccasionDraftAction({
        occasionType,
        templateStyle,
        headline,
        bodyText,
        discountPercent,
        couponValidityDays,
        isActive: occasionType === "birthday" ? autoBirthday : autoAnniversary,
      });

      if (res.success) {
        setSaveMsg({ text: res.message, error: false });
      } else {
        setSaveMsg({ text: res.message, error: true });
      }
    } catch {
      setSaveMsg({ text: "Failed to save draft. Please try again.", error: true });
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveSchedule() {
    setSaveMsg(null);
    setSaving(true);
    try {
      const res = await updateMerchantOccasionScheduleAction({
        dailyDispatchTime: dispatchTime,
        birthdayActive: autoBirthday,
        anniversaryActive: autoAnniversary,
      });
      if (res.success) {
        setSaveMsg({ text: res.message, error: false });
      } else {
        setSaveMsg({ text: res.message, error: true });
      }
    } catch {
      setSaveMsg({ text: "Failed to update schedule.", error: true });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Occasion Selection Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-2xl text-white shadow-md">
            ✨
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">Occasion Greeting Studio &amp; Auto-Drafts</h2>
            <p className="text-xs text-slate-500">
              Approved drafts are automatically dispatched to customers on WhatsApp on their special day.
            </p>
          </div>
        </div>

        {/* Connect Credits Pill */}
        <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-3.5 py-2">
          <span className="text-lg">🪙</span>
          <div>
            <div className="text-xs font-bold text-amber-900">{creditsBalance} Connect Credits</div>
            <div className="text-[10px] text-amber-700">1 Credit / Dispatched Wish</div>
          </div>
        </div>
      </div>

      {/* Occasion Types Tab Bar */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => handleOccasionSwitch("birthday")}
          className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-bold transition ${
            occasionType === "birthday"
              ? "border-orange-500 bg-orange-600 text-white shadow-md"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="text-base">🎂</span>
          <span>Birthday (Auto)</span>
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("anniversary")}
          className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-bold transition ${
            occasionType === "anniversary"
              ? "border-rose-500 bg-rose-600 text-white shadow-md"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="text-base">💍</span>
          <span>Anniversary (Auto)</span>
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("festival")}
          className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-bold transition ${
            occasionType === "festival"
              ? "border-indigo-500 bg-indigo-600 text-white shadow-md"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="text-base">🪔</span>
          <span>Festivals (Manual)</span>
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("offer")}
          className={`flex items-center justify-center gap-2 rounded-2xl border p-3.5 text-xs font-bold transition ${
            occasionType === "offer"
              ? "border-emerald-500 bg-emerald-600 text-white shadow-md"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="text-base">🔥</span>
          <span>Today&apos;s Special (Manual)</span>
        </button>
      </div>

      {/* Main Designer Grid */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left Column: Visual WhatsApp Poster Card Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2 text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-bold text-amber-300">
                <span>📱</span> WhatsApp Greeting Poster Preview
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                High Definition
              </span>
            </div>

            {/* Poster Canvas Representation */}
            <div
              className={`relative overflow-hidden rounded-2xl p-6 text-center shadow-inner transition ${
                templateStyle === "gold_celebration"
                  ? "border-2 border-amber-400/40 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900"
                  : templateStyle === "rose_luxury"
                  ? "border-2 border-rose-400/40 bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900"
                  : "border-2 border-indigo-400/40 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900"
              }`}
            >
              {/* Corner Ornaments */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-400/20 blur-xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-rose-400/20 blur-xl" />

              {/* Shop Logo & Name */}
              <div className="mb-4 flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-300/50 bg-white shadow-md">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt={businessName} className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-2xl">🏪</span>
                  )}
                </div>
                <span className="mt-2 text-xs font-black uppercase tracking-widest text-amber-300">
                  {businessName}
                </span>
              </div>

              {/* Occasion Big Icon & Headline */}
              <div className="my-2">
                <span className="text-4xl">
                  {occasionType === "birthday" ? "🎂" : occasionType === "anniversary" ? "💍" : "✨"}
                </span>
                <h3 className="mt-2 text-lg font-black tracking-tight text-white drop-shadow-md">
                  {headline}
                </h3>
                <p className="mt-1 font-serif text-sm italic text-amber-200">
                  &ldquo;Dear Lucky Ji, wishes from our entire team!&rdquo;
                </p>
              </div>

              {/* Coupon Box */}
              <div className="mt-5 rounded-xl border border-dashed border-amber-400/60 bg-amber-400/10 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Exclusive Gift Coupon (Valid {couponValidityDays} Days)
                </span>
                <div className="mt-1 font-mono text-base font-black tracking-wider text-amber-200">
                  {occasionType === "birthday" ? "BDAY" : "ANNIV"}-LUCKY-{discountPercent}
                </div>
                <span className="text-xs font-bold text-white">Flat {discountPercent}% OFF On Your Visit!</span>
              </div>
            </div>

            {/* Simulated WhatsApp Caption Text */}
            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3.5 text-left text-xs leading-relaxed text-slate-200">
              <span className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Personalized Caption:
              </span>
              <p>
                <strong>{businessName}:</strong> {bodyText}
              </p>
              <p className="mt-2 text-amber-300">
                🎁 <strong>Special Gift Code:</strong> BDAY-LUCKY-{discountPercent} (Valid for {couponValidityDays} days)
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls & Approved Draft Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">Customize Draft &amp; Styling</h3>
              <button
                type="button"
                onClick={handleRegenerateText}
                className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-800 hover:bg-orange-100"
              >
                <span>🔄 Regenerate AI Copy</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Card Style Selector */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Select Visual Card Style:
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {[
                    { id: "gold_celebration", label: "🌟 Gold Luxury", desc: "Warm celebration" },
                    { id: "rose_luxury", label: "🌹 Rose Velvet", desc: "Anniversary special" },
                    { id: "modern_minimal", label: "🎨 Modern Indigo", desc: "Contemporary vibe" },
                  ].map((style) => (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => setTemplateStyle(style.id)}
                      className={`flex flex-col items-center justify-center rounded-2xl border p-2.5 text-center transition ${
                        templateStyle === style.id
                          ? "border-orange-500 bg-orange-50/60 ring-2 ring-orange-200"
                          : "border-slate-200 bg-white hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs font-bold text-slate-900">{style.label}</span>
                      <span className="text-[10px] text-slate-500">{style.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Greeting Card Headline:
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Greeting Message Body (Customer Name automatically added):
                </label>
                <textarea
                  rows={3}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              {/* Discount Coupon Settings */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Discount Gift (%):
                  </label>
                  <select
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-500"
                  >
                    <option value={10}>10% OFF</option>
                    <option value={15}>15% OFF (Recommended)</option>
                    <option value={20}>20% OFF</option>
                    <option value={25}>25% OFF</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Coupon Validity:
                  </label>
                  <select
                    value={couponValidityDays}
                    onChange={(e) => setCouponValidityDays(Number(e.target.value))}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-500"
                  >
                    <option value={3}>3 Days</option>
                    <option value={5}>5 Days</option>
                    <option value={7}>7 Days (Standard)</option>
                    <option value={14}>14 Days</option>
                  </select>
                </div>
              </div>

              {saveMsg && (
                <div
                  className={`rounded-2xl border p-3 text-xs font-semibold ${
                    saveMsg.error
                      ? "border-rose-200 bg-rose-50 text-rose-700"
                      : "border-emerald-200 bg-emerald-50 text-emerald-800"
                  }`}
                >
                  {saveMsg.text}
                </div>
              )}

              {/* Save Approved Draft Button */}
              <div className="pt-2">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveDraft}
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-3 text-sm font-bold text-white shadow-md hover:from-orange-700 hover:to-amber-700 disabled:opacity-50"
                >
                  {saving ? "Saving Draft..." : "✓ Approve & Save as Active Occasion Draft"}
                </button>
              </div>
            </div>
          </div>

          {/* Daily Timing & Auto-Schedule Configuration Card */}
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
            <h4 className="text-sm font-bold text-slate-900">⏰ Daily Auto-Dispatch Schedule &amp; Controls</h4>
            <p className="mt-0.5 text-xs text-slate-500">
              Trustit will check your customers every morning and dispatch greetings at your selected time.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-700">Dispatch Time:</label>
                <select
                  value={dispatchTime}
                  onChange={(e) => setDispatchTime(e.target.value)}
                  className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-bold text-slate-900 outline-none focus:border-orange-500"
                >
                  <option value="08:00">08:00 AM</option>
                  <option value="08:30">08:30 AM</option>
                  <option value="09:00">09:00 AM (Recommended)</option>
                  <option value="09:30">09:30 AM</option>
                  <option value="10:00">10:00 AM</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoBirthday}
                    onChange={(e) => setAutoBirthday(e.target.checked)}
                    className="h-4 w-4 rounded accent-orange-600"
                  />
                  <span>Auto Birthday</span>
                </label>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoAnniversary}
                    onChange={(e) => setAutoAnniversary(e.target.checked)}
                    className="h-4 w-4 rounded accent-orange-600"
                  />
                  <span>Auto Anniversary</span>
                </label>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleSaveSchedule}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-50"
              >
                Update Schedule
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
