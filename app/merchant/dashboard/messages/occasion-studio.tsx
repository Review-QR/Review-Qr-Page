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

export type LanguageMode = "hinglish" | "hindi" | "english";

export const TEMPLATE_MESSAGES: Record<
  "birthday" | "anniversary" | "festival" | "offer",
  Record<LanguageMode, { headline: string; messages: string[] }>
> = {
  birthday: {
    hinglish: {
      headline: "🎉 Happy Birthday! Janmadin Ki Dhero Shubh-kamnaye",
      messages: [
        "Aapke is khas janamdin par hamari taraf se dher saari shubh-kamnaye! 🎉 Aapka aane wala saal khushiyo se bhara ho. Hamare sang jude rehne ke liye dil se shukriya!",
        "Janmadin ki dher saari badhaiyan! 🎂 Aapka yeh khas din mangalmay ho. Is khas din ko aur bhi yaadgar banane ke liye hamari taraf se ek chhota sa uphar!",
        "Aapko janamdin ki hardik badhai! ✨ Ishwar se prarthna hai ki aap hamesha swasth aur khush rahein. Aaiye aur celebrate kijiye hamare special treat ke saath!",
      ],
    },
    hindi: {
      headline: "🎉 जन्मदिन की हार्दिक शुभकामनाएं एवं मंगलकामनाएं!",
      messages: [
        "आपके इस पावन जन्मदिन पर हमारे पूरे प्रतिष्ठान की ओर से हार्दिक शुभकामनाएं! 🎂 ईश्वर आपको उत्तम स्वास्थ्य, दीर्घायु और अपार खुशियां प्रदान करें।",
        "जन्मदिन की अनंत बधाई! 🌟 आपका जीवन सदैव सुख, शांति और समृद्धि से परिपूर्ण रहे। आपके इस विशेष दिन को खास बनाने के लिए हमारी तरफ से यह उपहार!",
        "सदा मुस्कुराते रहें! 🎉 आपके जन्मदिन के पावन अवसर पर हमारी ओर से सप्रेम स्नेह व विशेष उपहार कूपन सादर भेंट है।",
      ],
    },
    english: {
      headline: "🎉 Wishing You A Very Happy Birthday!",
      messages: [
        "Wishing you a very Happy Birthday! 🌟 May this year bring you immense success, good health, and joyful moments. Thank you for being a wonderful patron!",
        "Warmest birthday wishes to you! 🎂 May your day be filled with laughter and cherished memories. Celebrate your day with our special treat!",
        "Happy Birthday from all of us! ✨ We hope your special day is as wonderful as you are. Enjoy this exclusive celebratory gift from our team!",
      ],
    },
  },
  anniversary: {
    hinglish: {
      headline: "💍 Happy Marriage Anniversary! Saalgirah Mubarak",
      messages: [
        "Aapki Marriage Anniversary par aap dono ko dher saari shubh-kamnaye! 💍 Aapki jodi hamesha salamat rahe aur khushiyo se aangan mehkata rahe!",
        "Saalgirah ki hardik badhaiyan! 🥂 Prem aur vishwas ka yeh bandhan hamesha aise hi mazboot rahe. Celebrate with your loved ones with our special anniversary offer!",
        "Shubh Vivah Varshganth! ✨ Aap dono ka saath hamesha barkarar rahe. Is khas din par hamari taraf se aapke liye ek pyara sa gift coupon!",
      ],
    },
    hindi: {
      headline: "💍 वैवाहिक वर्षगांठ की अशेष शुभकामनाएं!",
      messages: [
        "आप दोनों को विवाह वर्षगांठ की हार्दिक शुभकामनाएं! 💍 प्रेम और विश्वास का यह पवित्र बंधन जन्म-जन्मांतर तक यूं ही प्रगाढ़ बना रहे।",
        "शादी की सालगिरह मुबारक! 🥂 ईश्वर आपके दांपत्य जीवन को सुख, शांति और आनंद से सदैव आलोकित रखे। हमारे विशेष उपहार के साथ जश्न मनाएं!",
        "सुखी दांपत्य जीवन की मंगलकामनाएं! ✨ आप दोनों की जोड़ी सदा सलामत रहे। इस पावन अवसर पर हमारी ओर से एक विशेष सौगात।",
      ],
    },
    english: {
      headline: "💍 Happy Wedding Anniversary!",
      messages: [
        "Happy Wedding Anniversary! 💍 Wishing you both a lifetime of love, laughter, and endless companionship. Celebrate your milestone with us!",
        "Warmest congratulations on your Anniversary! 🥂 May the love you share today grow even stronger with every passing year. Enjoy this special coupon!",
        "Wishing a wonderful couple a very Happy Anniversary! ✨ Cheers to another year of creating beautiful memories together!",
      ],
    },
  },
  festival: {
    hinglish: {
      headline: "🪔 Festive Greetings & Grand Celebration Offers!",
      messages: [
        "Aapko aur aapke poore parivar ko tyohar ki dher saari shubh-kamnaye! 🪔 Is utsav ke mausam par paiye shandar offers aur khushiyon bhare treats.",
        "Utsav ke is shubh awasar par hamari taraf se badhaiyan! ✨ Tyohar ki mithas badhane aaiye hamare yahan aur lutf uthaiye special discounts ka.",
      ],
    },
    hindi: {
      headline: "🪔 पावन पर्व एवं उत्सव की हार्दिक मंगलकामनाएं!",
      messages: [
        "आपको एवं आपके पूरे परिवार को पावन पर्व की हार्दिक शुभकामनाएं! 🪔 यह त्यौहार आपके जीवन में सुख, समृद्धि और नई उमंग लेकर आए।",
        "त्यौहारों की पावन बेला में खुशियां दोगुनी करें! 🌟 हमारी ओर से आपके लिए विशेष त्यौहारी छूट व सौगात उपलब्ध है। सपरिवार पधारें!",
      ],
    },
    english: {
      headline: "🪔 Season's Greetings & Festive Special Offers!",
      messages: [
        "Wishing you and your family joy, peace, and prosperity this festive season! 🪔 Celebrate with our special handcrafted delights.",
        "Celebrate the festival of joy with exclusive festive savings! ✨ Wishing you and your loved ones sparkling celebrations.",
      ],
    },
  },
  offer: {
    hinglish: {
      headline: "🔥 Today's Special Dish & Chef's Exclusive Discount",
      messages: [
        "Aaj ka din khas hai! Hamari kitchen me aaj ban raha hai fresh aur special swadist menu. Aaiye aur enjoy kijiye special offer ke saath!",
        "Fresh flavours & sizzling discounts today! 🍴 Apne dosto aur parivar ke saath aaiye aur hamari signature recipe par paiye flat discount.",
      ],
    },
    hindi: {
      headline: "🔥 आज का विशेष स्वाद एवं स्पेशल छूट!",
      messages: [
        "स्वाद के शौकीनों के लिए आज का दिन बेहद खास! ताजा और लजीज व्यंजनों पर आज ही पाएं विशेष छूट। आपका स्वागत है!",
        "शेफ की विशेष पेशकश केवल आज के लिए! 🍴 अपने प्रियजनों के साथ आएं और लजीज भोजन का विशेष रियायती दरों पर आनंद लें।",
      ],
    },
    english: {
      headline: "🔥 Today's Chef Special & Exclusive Discounts!",
      messages: [
        "Savor today's handcrafted chef specials at an irresistible limited-time discount! Visit today and treat your taste buds.",
        "Exclusive limited-time treat waiting for you! 🍴 Taste our freshest specialties crafted with passion and love at a special price today.",
      ],
    },
  },
};

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
  const [selectedLang, setSelectedLang] = useState<LanguageMode>("hinglish");

  // Find existing draft or set defaults
  const bDraft = initialDrafts.find((d) => d.occasion_type === "birthday");
  const aDraft = initialDrafts.find((d) => d.occasion_type === "anniversary");

  // Form states
  const [headline, setHeadline] = useState(
    occasionType === "birthday"
      ? bDraft?.headline || TEMPLATE_MESSAGES.birthday.hinglish.headline
      : aDraft?.headline || TEMPLATE_MESSAGES.anniversary.hinglish.headline
  );
  const [bodyText, setBodyText] = useState(
    occasionType === "birthday"
      ? bDraft?.body_text || TEMPLATE_MESSAGES.birthday.hinglish.messages[0]
      : aDraft?.body_text || TEMPLATE_MESSAGES.anniversary.hinglish.messages[0]
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
    const tmpl = TEMPLATE_MESSAGES[type][selectedLang];
    setHeadline(tmpl.headline);
    setBodyText(tmpl.messages[0]);
    if (type === "birthday") {
      setDiscountPercent(bDraft?.discount_percent ?? 15);
    } else if (type === "anniversary") {
      setDiscountPercent(aDraft?.discount_percent ?? 20);
    } else if (type === "festival") {
      setDiscountPercent(25);
    } else {
      setDiscountPercent(10);
    }
  }

  function handleLanguageSwitch(lang: LanguageMode) {
    setSelectedLang(lang);
    setSaveMsg(null);
    const tmpl = TEMPLATE_MESSAGES[occasionType][lang];
    setHeadline(tmpl.headline);
    setBodyText(tmpl.messages[0]);
  }

  function handleRegenerateText() {
    const list = TEMPLATE_MESSAGES[occasionType][selectedLang].messages;
    const remaining = list.filter((m) => m !== bodyText);
    const next = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : list[0];
    setBodyText(next);
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
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Enlarged Visual WhatsApp Poster Card Preview (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-6 text-white shadow-xl">
            <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3 text-xs text-slate-400">
              <span className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <span>📱</span> WhatsApp Greeting Poster
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                HD Preview
              </span>
            </div>

            {/* Poster Canvas Representation (Slightly larger, taller, and more prominent) */}
            <div
              className={`relative overflow-hidden rounded-2xl p-7 sm:p-8 text-center shadow-2xl transition min-h-[440px] flex flex-col justify-between ${
                templateStyle === "gold_celebration"
                  ? "border-2 border-amber-400/50 bg-gradient-to-br from-amber-950 via-slate-900 to-amber-900"
                  : templateStyle === "rose_luxury"
                  ? "border-2 border-rose-400/50 bg-gradient-to-br from-rose-950 via-slate-900 to-rose-900"
                  : "border-2 border-indigo-400/50 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-900"
              }`}
            >
              {/* Corner Ornaments */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-amber-400/20 blur-2xl" />
              <div className="pointer-events-none absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-rose-400/20 blur-2xl" />

              {/* Shop Logo & Name */}
              <div className="flex flex-col items-center">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border-2 border-amber-300/60 bg-white shadow-lg">
                  {logoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={logoUrl} alt={businessName} className="h-full w-full object-contain p-1" />
                  ) : (
                    <span className="text-3xl">🏪</span>
                  )}
                </div>
                <span className="mt-2 text-sm font-black uppercase tracking-widest text-amber-300">
                  {businessName}
                </span>
              </div>

              {/* Occasion Big Icon & Headline */}
              <div className="my-4">
                <span className="text-5xl drop-shadow-md">
                  {occasionType === "birthday" ? "🎂" : occasionType === "anniversary" ? "💍" : "✨"}
                </span>
                <h3 className="mt-3 text-xl font-black tracking-tight text-white drop-shadow-md leading-snug">
                  {headline}
                </h3>
                <p className="mt-2 font-serif text-sm italic text-amber-200">
                  &ldquo;Dear <span className="underline decoration-amber-400">[Customer Name 👤]</span>, wishes from our entire team!&rdquo;
                </p>
              </div>

              {/* Coupon Box with Gift Emoji */}
              <div className="mt-4 rounded-2xl border-2 border-dashed border-amber-400/70 bg-amber-400/15 p-4 shadow-lg backdrop-blur-sm">
                <span className="flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-300">
                  <span>🎁</span> EXCLUSIVE GIFT COUPON (VALID {couponValidityDays} DAYS)
                </span>
                <div className="mt-1.5 font-mono text-lg font-black tracking-widest text-amber-100">
                  {occasionType === "birthday" ? "BDAY" : "ANNIV"}-CUSTOMER-{discountPercent}
                </div>
                <span className="mt-1 block text-sm font-extrabold text-white">Flat {discountPercent}% OFF On Your Visit!</span>
              </div>
            </div>

            {/* Simulated WhatsApp Caption Text (Enlarged and crystal clear) */}
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-left text-sm leading-relaxed text-slate-100 shadow-md">
              <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  📱 WhatsApp Caption Sent to Customer:
                </span>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Auto-Personalized
                </span>
              </div>
              <p className="font-medium text-slate-100">
                <strong className="text-amber-300">{businessName}:</strong> Dear <span className="font-bold underline text-amber-200">[Customer Name 👤]</span> ji, {bodyText}
              </p>
              <div className="mt-3 rounded-xl bg-amber-950/70 border border-amber-400/40 p-2.5 text-xs text-amber-200">
                🎁 <strong>Special Gift Code:</strong> {occasionType === "birthday" ? "BDAY" : "ANNIV"}-[NAME]-{discountPercent} (Valid for {couponValidityDays} days)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls & Approved Draft Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Customize Draft &amp; Styling</h3>
                <p className="text-xs text-slate-500">Edit headline, heartfelt greetings, and discount coupon.</p>
              </div>
              <button
                type="button"
                onClick={handleRegenerateText}
                className="inline-flex items-center gap-1.5 rounded-xl border border-orange-200 bg-orange-50 px-3.5 py-2 text-xs font-bold text-orange-800 hover:bg-orange-100 shadow-sm transition"
              >
                <span>🔄 Regenerate AI Copy</span>
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* 1-Click Language Selector Bar */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Select Draft Language (1-Click Switch):
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch("hinglish")}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-xs font-bold transition ${
                      selectedLang === "hinglish"
                        ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>🇮🇳</span>
                    <span>Hinglish (Phonetic)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch("hindi")}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-xs font-bold transition ${
                      selectedLang === "hindi"
                        ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>🪔</span>
                    <span>Pure Hindi (हिंदी)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleLanguageSwitch("english")}
                    className={`flex items-center justify-center gap-1.5 rounded-2xl border p-2.5 text-xs font-bold transition ${
                      selectedLang === "english"
                        ? "border-orange-500 bg-orange-500 text-white shadow-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>🇬🇧</span>
                    <span>English</span>
                  </button>
                </div>
              </div>

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

              {/* Message Body with Locked Customer Name Indicator */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Greeting Message Body:
                  </label>
                  <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    <span>🔒</span> Customer Name Locked
                  </span>
                </div>

                {/* Locked Indicator Box: Guarantees customer name cannot be accidentally broken/deleted */}
                <div className="mt-1.5 flex flex-col gap-1.5 rounded-2xl border border-amber-200 bg-amber-50/80 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-amber-200 px-2.5 py-1 text-xs font-black text-amber-950 border border-amber-300 shadow-sm">
                      🔒 [ Customer Name 👤 ]
                    </span>
                    <span className="text-xs font-bold text-slate-700">+ Aapka Customized Message Niche:</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    💡 <strong>Safe Mode Active:</strong> Customer ka actual naam live customer records se WhatsApp bhejte samay automatic jud jayega. Yeh space locked hai taaki merchant dwara koi syntax error na ho.
                  </p>
                </div>

                <textarea
                  rows={3}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Yahan aapna shubh-kamna sandesh likhein..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-sm"
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
                  className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 py-3.5 text-sm font-bold text-white shadow-md hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 transition"
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
