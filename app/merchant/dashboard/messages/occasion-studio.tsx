"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  saveMerchantOccasionDraftAction,
  updateMerchantOccasionScheduleAction,
  sendFast2SmsWhatsAppTestAction,
} from "./actions";
import { renderOccasionGreetingPoster, getCategoryEmblem } from "@/lib/creative-canvas";

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
  Record<LanguageMode, { headline: string; subtitle: string; messages: string[] }>
> = {
  birthday: {
    hinglish: {
      headline: "🎉 Happy Birthday!",
      subtitle: "Aapke is khas din par dhero shubh-kamnaye — hamari poori team ki taraf se!",
      messages: [
        "Aapke is khas janamdin par hamari taraf se dher saari shubh-kamnaye! 🎉 Aapka aane wala saal khushiyo se bhara ho. Hamare sang jude rehne ke liye dil se shukriya!",
        "Janmadin ki dher saari badhaiyan! 🎂 Aapka yeh khas din mangalmay ho. Is khas din ko aur bhi yaadgar banane ke liye hamari taraf se ek chhota sa uphar!",
        "Aapko janamdin ki hardik badhai! ✨ Ishwar se prarthna hai ki aap hamesha swasth aur khush rahein. Aaiye aur celebrate kijiye hamare special treat ke saath!",
      ],
    },
    hindi: {
      headline: "🎉 जन्मदिन की हार्दिक बधाई!",
      subtitle: "आपके उत्तम स्वास्थ्य और खुशियों की मंगलकामनाएं — हमारी पूरी टीम की ओर से!",
      messages: [
        "आपके इस पावन जन्मदिन पर हमारे पूरे प्रतिष्ठान की ओर से हार्दिक शुभकामनाएं! 🎂 ईश्वर आपको उत्तम स्वास्थ्य, दीर्घायु और अपार खुशियां प्रदान करें।",
        "जन्मदिन की अनंत बधाई! 🌟 आपका जीवन सदैव सुख, शांति और समृद्धि से परिपूर्ण रहे। आपके इस विशेष दिन को खास बनाने के लिए हमारी तरफ से यह उपहार!",
        "सदा मुस्कुराते रहें! 🎉 आपके जन्मदिन के पावन अवसर पर हमारी ओर से सप्रेम स्नेह व विशेष उपहार कूपन सादर भेंट है।",
      ],
    },
    english: {
      headline: "🎉 Happy Birthday!",
      subtitle: "Wishing you a joyful celebration and happiness — from our entire team!",
      messages: [
        "Wishing you a very Happy Birthday! 🌟 May this year bring you immense success, good health, and joyful moments. Thank you for being a wonderful patron!",
        "Warmest birthday wishes to you! 🎂 May your day be filled with laughter and cherished memories. Celebrate your day with our special treat!",
        "Happy Birthday from all of us! ✨ We hope your special day is as wonderful as you are. Enjoy this exclusive celebratory gift from our team!",
      ],
    },
  },
  anniversary: {
    hinglish: {
      headline: "💍 Happy Anniversary!",
      subtitle: "Wishing you both endless love and togetherness!",
      messages: [
        "Aapki Marriage Anniversary par aap dono ko dher saari shubh-kamnaye! 💍 Aapki jodi hamesha salamat rahe aur khushiyo se aangan mehkata rahe!",
        "Saalgirah ki hardik badhaiyan! 🥂 Prem aur vishwas ka yeh bandhan hamesha aise hi mazboot rahe. Celebrate with your loved ones with our special anniversary offer!",
        "Shubh Vivah Varshganth! ✨ Aap dono ka saath hamesha barkarar rahe. Is khas din par hamari taraf se aapke liye ek pyara sa gift coupon!",
      ],
    },
    hindi: {
      headline: "💍 विवाह वर्षगांठ की बधाई!",
      subtitle: "आप दोनों की जोड़ी सदा सलामत और खुशियों से परिपूर्ण रहे!",
      messages: [
        "आप दोनों को विवाह वर्षगांठ की हार्दिक शुभकामनाएं! 💍 प्रेम और विश्वास का यह पवित्र बंधन जन्म-जन्मांतर तक यूं ही प्रगाढ़ बना रहे।",
        "शादी की सालगिरh मुबारक! 🥂 ईश्वर आपके दांपत्य जीवन को सुख, शांति और आनंद से सदैव आलोकित रखे। हमारे विशेष उपहार के साथ जश्न मनाएं!",
        "सुखी दांपत्य जीवन की मंगलकामनाएं! ✨ आप दोनों की जोड़ी सदा सलामत रहे। इस पावन अवसर पर हमारी ओर से एक विशेष सौगात।",
      ],
    },
    english: {
      headline: "💍 Happy Wedding Anniversary!",
      subtitle: "Wishing a wonderful couple a lifetime of happiness!",
      messages: [
        "Happy Wedding Anniversary! 💍 Wishing you both a lifetime of love, laughter, and endless companionship. Celebrate your milestone with us!",
        "Warmest congratulations on your Anniversary! 🥂 May the love you share today grow even stronger with every passing year. Enjoy this special coupon!",
        "Wishing a wonderful couple a very Happy Anniversary! ✨ Cheers to another year of creating beautiful memories together!",
      ],
    },
  },
  festival: {
    hinglish: {
      headline: "🪔 Shubh Deepawali / Festive Greetings!",
      subtitle: "Tyohar ki khushiyan aapke aangan me sada mehkati rahein!",
      messages: [
        "Aapko aur aapke poore parivar ko tyohar ki dher saari shubh-kamnaye! 🪔 Is utsav ke mausam par paiye shandar offers aur khushiyon bhare treats.",
        "Utsav ke is shubh awasar par hamari taraf se badhaiyan! ✨ Tyohar ki mithas badhane aaiye hamare yahan aur lutf uthaiye special discounts ka.",
      ],
    },
    hindi: {
      headline: "🪔 पावन पर्व की हार्दिक शुभकामनाएं!",
      subtitle: "यह पावन त्यौहार आपके जीवन में सुख, शांति और समृद्धि लाए!",
      messages: [
        "आपको एवं आपके पूरे परिवार को पावन पर्व की हार्दिक शुभकामनाएं! 🪔 यह त्यौहार आपके जीवन में सुख, समृद्धि और नई उमंग लेकर आए।",
        "त्यौहारों की पावन बेला में खुशियां दोगुनी करें! 🌟 हमारी ओर से आपके लिए विशेष त्यौहारी छूट व सौगात उपलब्ध है। सपरिवार पधारें!",
      ],
    },
    english: {
      headline: "🪔 Festive Greetings & Joy!",
      subtitle: "May this festive season illuminate your life with joy!",
      messages: [
        "Wishing you and your family joy, peace, and prosperity this festive season! 🪔 Celebrate with our special handcrafted delights.",
        "Celebrate the festival of joy with exclusive festive savings! ✨ Wishing you and your loved ones sparkling celebrations.",
      ],
    },
  },
  offer: {
    hinglish: {
      headline: "🔥 Today's Chef Special Feast!",
      subtitle: "Freshly crafted delicacies waiting for you today!",
      messages: [
        "Aaj ka din khas hai! Hamari kitchen me aaj ban raha hai fresh aur special swadist menu. Aaiye aur enjoy kijiye special offer ke saath!",
        "Fresh flavours & sizzling discounts today! 🍴 Apne dosto aur parivar ke saath aaiye aur hamari signature recipe par paiye flat discount.",
      ],
    },
    hindi: {
      headline: "🔥 आज का विशेष स्वाद एवं छूट!",
      subtitle: "स्वाद के शौकीनों के लिए शेफ की खास पेशकश!",
      messages: [
        "स्वाद के शौकीनों के लिए आज का दिन बेहद खास! ताजा और लजीज व्यंजनों पर आज ही पाएं विशेष छूट। आपका स्वागत है!",
        "शेफ की विशेष पेशकश केवल आज के लिए! 🍴 अपने प्रियजनों के साथ आएं और लजीज भोजन का विशेष रियायती दरों पर आनंद लें।",
      ],
    },
    english: {
      headline: "🔥 Today's Chef Special!",
      subtitle: "Savor our freshest culinary creations at exclusive prices!",
      messages: [
        "Savor today's handcrafted chef specials at an irresistible limited-time discount! Visit today and treat your taste buds.",
        "Exclusive limited-time treat waiting for you! 🍴 Taste our freshest specialties crafted with passion and love at a special price today.",
      ],
    },
  },
};

export default function OccasionStudio({
  businessName,
  businessType = null,
  merchantPhone,
  logoUrl,
  initialDrafts = [],
  dailyDispatchTime = "09:00",
  creditsBalance = 0,
}: {
  businessName: string;
  businessType?: string | null;
  merchantPhone?: string;
  logoUrl: string | null;
  initialDrafts?: OccasionDraft[];
  dailyDispatchTime?: string;
  creditsBalance?: number;
}) {
  const router = useRouter();
  const emblem = getCategoryEmblem(businessType);

  // In-memory drafts map initialized with props
  const [draftsMap, setDraftsMap] = useState<Record<string, OccasionDraft>>(() => {
    const map: Record<string, OccasionDraft> = {};
    for (const d of initialDrafts) {
      if (d.occasion_type) map[d.occasion_type] = d;
    }
    return map;
  });

  const [occasionType, setOccasionType] = useState<"birthday" | "anniversary" | "festival" | "offer">("birthday");
  const [selectedLang, setSelectedLang] = useState<LanguageMode>("english");

  // Active Draft based on occasionType
  const currentDraft = draftsMap[occasionType];

  // Card Template Style: "ivory_cream" (Card 1 Default) or "royal_gold" (Card 2)
  const initialStyle =
    currentDraft?.template_style === "royal_gold"
      ? "royal_gold"
      : "ivory_cream";
  const [templateStyle, setTemplateStyle] = useState<"royal_gold" | "ivory_cream">(initialStyle);

  // Form states
  const [headline, setHeadline] = useState(
    currentDraft?.headline || TEMPLATE_MESSAGES.birthday.english.headline
  );
  const [bodyText, setBodyText] = useState(
    currentDraft?.body_text || TEMPLATE_MESSAGES.birthday.english.messages[0]
  );
  const [discountPercent, setDiscountPercent] = useState<number>(currentDraft?.discount_percent ?? 15);
  const [couponValidityDays, setCouponValidityDays] = useState<number>(currentDraft?.coupon_validity_days ?? 7);
  const [dispatchTime, setDispatchTime] = useState(dailyDispatchTime);
  const [autoBirthday, setAutoBirthday] = useState(draftsMap.birthday?.is_active ?? true);
  const [autoAnniversary, setAutoAnniversary] = useState(draftsMap.anniversary?.is_active ?? true);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ text: string; error: boolean } | null>(null);

  // When switching occasion tab (Birthday, Anniversary, Festival, Offer)
  function handleOccasionSwitch(type: "birthday" | "anniversary" | "festival" | "offer") {
    setOccasionType(type);
    setSaveMsg(null);

    const saved = draftsMap[type];
    if (saved) {
      // Load saved draft
      setHeadline(saved.headline);
      setBodyText(saved.body_text);
      setDiscountPercent(saved.discount_percent);
      setCouponValidityDays(saved.coupon_validity_days);
      setTemplateStyle(saved.template_style === "royal_gold" ? "royal_gold" : "ivory_cream");
    } else {
      // Load default for this occasion in selected language
      const tmpl = TEMPLATE_MESSAGES[type][selectedLang];
      setHeadline(tmpl.headline);
      setBodyText(tmpl.messages[0]);
      if (type === "birthday") setDiscountPercent(15);
      else if (type === "anniversary") setDiscountPercent(20);
      else if (type === "festival") setDiscountPercent(25);
      else setDiscountPercent(10);
      setTemplateStyle("ivory_cream");
    }
  }

  // 1-Click Language Switcher
  function handleLanguageSwitch(lang: LanguageMode) {
    setSelectedLang(lang);
    setSaveMsg(null);
    const tmpl = TEMPLATE_MESSAGES[occasionType][lang];
    setHeadline(tmpl.headline);
    setBodyText(tmpl.messages[0]);
  }

  // Regenerate variations in chosen language
  function handleRegenerateText() {
    const list = TEMPLATE_MESSAGES[occasionType][selectedLang].messages;
    const remaining = list.filter((m) => m !== bodyText);
    const next = remaining.length > 0 ? remaining[Math.floor(Math.random() * remaining.length)] : list[0];
    setBodyText(next);
  }

  // Save draft action with in-memory sync and router.refresh()
  async function handleSaveDraft() {
    setSaveMsg(null);
    setSaving(true);
    try {
      const activeState = occasionType === "birthday" ? autoBirthday : autoAnniversary;
      const res = await saveMerchantOccasionDraftAction({
        occasionType,
        templateStyle,
        headline,
        bodyText,
        discountPercent,
        couponValidityDays,
        isActive: activeState,
      });

      if (res.success) {
        // Update in-memory state so subsequent tab switches or edits retain saved values
        const updated: OccasionDraft = {
          occasion_type: occasionType,
          template_style: templateStyle,
          headline,
          body_text: bodyText,
          discount_percent: discountPercent,
          coupon_validity_days: couponValidityDays,
          is_active: activeState,
        };
        setDraftsMap((prev) => ({ ...prev, [occasionType]: updated }));
        setSaveMsg({ text: res.message, error: false });
        router.refresh();
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
        router.refresh();
      } else {
        setSaveMsg({ text: res.message, error: true });
      }
    } catch {
      setSaveMsg({ text: "Failed to update schedule.", error: true });
    } finally {
      setSaving(false);
    }
  }

  // Active occasion icon & prefix
  const occasionIcon =
    occasionType === "birthday"
      ? "🎂"
      : occasionType === "anniversary"
      ? "💍"
      : occasionType === "festival"
      ? "🪔"
      : "🔥";

  const couponCode = `${
    occasionType === "birthday"
      ? "BDAY"
      : occasionType === "anniversary"
      ? "ANNIV"
      : occasionType === "festival"
      ? "FESTIVE"
      : "SPECIAL"
  }-LUCKY-${discountPercent}`;

  const occasionSubtitle = TEMPLATE_MESSAGES[occasionType][selectedLang].subtitle;

  // Canvas and WhatsApp Test Dispatch
  const testCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const [testPhone, setTestPhone] = useState(merchantPhone || "7388184925");
  const [testNotice, setTestNotice] = useState<{
    type: "success" | "pending" | "error" | "info";
    text: string;
    details?: string;
  } | null>(null);

  useEffect(() => {
    if (merchantPhone) {
      setTestPhone(merchantPhone);
    }
  }, [merchantPhone]);

  useEffect(() => {
    if (logoUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        logoImgRef.current = img;
      };
      img.src = logoUrl;
    }
  }, [logoUrl]);

  function handleDownloadPosterImage() {
    if (!testCanvasRef.current) return;
    renderOccasionGreetingPoster({
      canvas: testCanvasRef.current,
      style: templateStyle,
      businessName,
      businessType,
      logoImg: logoImgRef.current,
      occasionType,
      headline,
      subtitle: occasionSubtitle,
      couponCode,
      discountPercent,
      couponValidityDays,
    });
    const link = document.createElement("a");
    link.download = `${occasionType}-${businessName.toLowerCase().replace(/\s+/g, "-")}-greeting-card.png`;
    link.href = testCanvasRef.current.toDataURL("image/png");
    link.click();
    setTestNotice({
      type: "info",
      text: "HD Card Poster downloaded to your device!",
    });
  }

  function handleSendWhatsAppTest() {
    const clean = testPhone.replace(/\D/g, "");
    if (clean.length < 10) {
      alert("Kripya 10-digit mobile number enter karein.");
      return;
    }
    const targetPhone = clean.length === 10 ? `91${clean}` : clean;

    // Trigger poster card download so merchant has the image file
    handleDownloadPosterImage();

    // Clean body text (strip out any bracket artifacts)
    const cleanBody = bodyText.replace(/\[.*?\]/g, "").trim();
    const formattedMsg = `🎉 *${headline} MR LUCKY !!* ${occasionIcon}\n\n*${businessName}:* Dear Lucky ji, ${cleanBody}\n\n🎁 *EXCLUSIVE GIFT COUPON:* ${couponCode}\n✨ *Flat ${discountPercent}% OFF On Your Visit!* (Valid for ${couponValidityDays} days)\n\n_"${occasionSubtitle}"_\n\n— Team ${businessName} ❤️`;

    const waUrl = `https://api.whatsapp.com/send?phone=${targetPhone}&text=${encodeURIComponent(formattedMsg)}`;
    window.open(waUrl, "_blank");
    setTestNotice({
      type: "success",
      text: "WhatsApp opened & Card downloaded! You can attach the card image and send.",
    });
  }

  const [testingFast2Sms, setTestingFast2Sms] = useState(false);

  async function handleSendFast2SmsApiTest() {
    const clean = testPhone.replace(/\D/g, "");
    if (clean.length < 10) {
      alert("Kripya 10-digit mobile number enter karein.");
      return;
    }
    setTestingFast2Sms(true);
    setTestNotice(null);
    try {
      const res = await sendFast2SmsWhatsAppTestAction({
        phone: clean,
        customerName: "Lucky Ji",
        occasionType,
        discountPercent,
        couponValidityDays,
      });

      if (res.success) {
        setTestNotice({
          type: "success",
          text: `Fast2SMS WhatsApp Gateway Success! (Request ID: ${res.requestId || "Dispatched"})`,
        });
      } else if (res.isPendingMetaApproval) {
        setTestNotice({
          type: "pending",
          text: "Fast2SMS WhatsApp Template: Pending Meta Review",
          details: res.message,
        });
      } else {
        setTestNotice({
          type: "error",
          text: res.message || "Fast2SMS dispatch failed.",
        });
      }
    } catch (err: unknown) {
      setTestNotice({
        type: "error",
        text: `API Error: ${err instanceof Error ? err.message : "Failed to contact Fast2SMS"}`,
      });
    } finally {
      setTestingFast2Sms(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Offscreen Canvas for HD Poster Rendering */}
      <canvas ref={testCanvasRef} className="hidden" />
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

      {/* Occasion Types Tab Bar (4 Categories - Compact & Rounded) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => handleOccasionSwitch("birthday")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-2xs ${
            occasionType === "birthday"
              ? "border-orange-500 bg-orange-600 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="text-sm">🎂</span>
          <span>Birthday (Auto)</span>
          {draftsMap.birthday && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />}
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("anniversary")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-2xs ${
            occasionType === "anniversary"
              ? "border-rose-500 bg-rose-600 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="text-sm">💍</span>
          <span>Anniversary (Auto)</span>
          {draftsMap.anniversary && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />}
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("festival")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-2xs ${
            occasionType === "festival"
              ? "border-indigo-500 bg-indigo-600 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="text-sm">🪔</span>
          <span>Festivals (Manual)</span>
          {draftsMap.festival && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />}
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("offer")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition shadow-2xs ${
            occasionType === "offer"
              ? "border-emerald-500 bg-emerald-600 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span className="text-sm">🔥</span>
          <span>Today&apos;s Special</span>
          {draftsMap.offer && <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />}
        </button>
      </div>

      {/* Main Designer Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: WhatsApp Sticker Poster Preview + Bottom Dots Carousel (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-3xl border border-slate-200 bg-slate-900 p-5 text-white shadow-xl">
            <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-2.5 text-xs text-slate-400">
              <span className="flex items-center gap-2 font-bold text-amber-300 text-sm">
                <span>📱</span> WhatsApp Greeting Poster
              </span>
              <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                Sticker Fit
              </span>
            </div>

            {/* CARD 1: ROYAL DARK GOLD LUXURY */}
            {templateStyle === "royal_gold" && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-[#d4af37]/70 bg-gradient-to-b from-[#18140c] via-[#0d0c0a] to-[#1e170d] p-6 text-center shadow-[0_12px_40px_rgba(212,175,55,0.28)] transition min-h-[470px] flex flex-col justify-between">
                {/* Curved Gold Ribbon Waves on Top Corners */}
                <div className="pointer-events-none absolute -left-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-br from-[#f5d77f]/30 via-[#d4af37]/20 to-transparent blur-xl" />
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-gradient-to-bl from-[#f5d77f]/30 via-[#d4af37]/20 to-transparent blur-xl" />
                <div className="pointer-events-none absolute -bottom-10 -right-10 h-36 w-36 rounded-full bg-gradient-to-tl from-[#d4af37]/25 to-transparent blur-xl" />

                {/* Top Section: Circular Medallion Logo + Business Name + Category Emblem */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#f5d77f] ring-4 ring-[#d4af37]/35 bg-[#140f09] shadow-[0_8px_25px_rgba(212,175,55,0.45)]">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={businessName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">{emblem.icon}</span>
                    )}
                  </div>
                  <span className="mt-2 text-xs sm:text-sm font-black uppercase tracking-[0.22em] text-[#e5c158] drop-shadow-sm">
                    {businessName}
                  </span>
                  <span className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-[#d4af37]/80">
                    ✦ {emblem.label} ✦
                  </span>
                </div>

                {/* Middle Section: Occasion Icon + Headline + Ornate Divider */}
                <div className="relative z-10 my-3">
                  <span className="text-5xl drop-shadow-md">{occasionIcon}</span>

                  {/* Headline */}
                  <h3 className="mt-2.5 text-xl sm:text-2xl font-black tracking-tight text-white drop-shadow-md leading-snug">
                    {headline}
                  </h3>

                  {/* Golden Ornate Divider */}
                  <div className="my-2.5 flex items-center justify-center gap-2 text-[#d4af37]">
                    <span className="h-[1px] w-12 bg-gradient-to-r from-transparent to-[#d4af37]" />
                    <span className="text-sm">‹ ❖ ›</span>
                    <span className="h-[1px] w-12 bg-gradient-to-l from-transparent to-[#d4af37]" />
                  </div>

                  {/* Subtitle / Wishes */}
                  <p className="font-serif text-xs sm:text-sm italic text-[#f0dfaa] px-2 leading-relaxed">
                    &ldquo;{occasionSubtitle}&rdquo;
                  </p>
                </div>

                {/* Bottom Section: Coupon Ticket Box */}
                <div className="relative z-10 rounded-2xl border border-[#d4af37]/60 bg-black/50 p-3.5 backdrop-blur-sm shadow-inner">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-[#e5c158]">
                    EXCLUSIVE GIFT COUPON (VALID {couponValidityDays} DAYS)
                  </span>

                  {/* Universal VIP Ticket Pill */}
                  <div className="relative mx-auto my-1.5 max-w-[230px] rounded-xl bg-gradient-to-r from-[#d4af37] via-[#f7e8b6] to-[#d4af37] py-1.5 px-4 font-mono text-sm sm:text-base font-black tracking-wider text-[#1a1205] shadow-[0_4px_12px_rgba(212,175,55,0.4)]">
                    VIP PASS · FLAT {discountPercent}% OFF
                  </div>

                  <span className="text-xs font-bold text-white block">Flat {discountPercent}% OFF On Your Visit!</span>
                  <span className="text-[10px] text-amber-200/80 block mt-0.5">Show message code below to redeem</span>
                </div>

                {/* Golden Ribbon Bow at the Bottom Center */}
                <div className="relative z-10 -mb-2 mt-2 flex justify-center">
                  <div className="flex items-center justify-center text-2xl drop-shadow-[0_2px_8px_rgba(212,175,55,0.5)]">
                    🎀
                  </div>
                </div>
              </div>
            )}

            {/* CARD 1 (DEFAULT): WARM IVORY CREAM ELEGANCE */}
            {templateStyle === "ivory_cream" && (
              <div className="relative overflow-hidden rounded-3xl border-2 border-[#cfb894] bg-gradient-to-b from-[#fdfbf7] via-[#f7f2ea] to-[#eee5d8] p-6 text-center shadow-[0_12px_40px_rgba(180,150,110,0.25)] transition min-h-[470px] flex flex-col justify-between">
                {/* Botanical Leaves Accents on Corners */}
                <div className="pointer-events-none absolute -right-2 -top-2 text-4xl opacity-80">
                  🌿
                </div>
                <div className="pointer-events-none absolute -left-2 -bottom-2 text-4xl opacity-80">
                  🍃
                </div>

                {/* Top Section: Circular Medallion Logo + Dominant Business Name + Category Emblem */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-[#b59363] ring-4 ring-[#dfc698]/50 bg-[#1e140a] shadow-[0_8px_25px_rgba(140,105,65,0.28)]">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={businessName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl">{emblem.icon}</span>
                    )}
                  </div>
                  {/* Dominant Bolder Business Name */}
                  <span className="mt-2.5 text-base sm:text-lg font-black uppercase tracking-[0.16em] text-[#2c1808] drop-shadow-xs">
                    {businessName}
                  </span>
                  <span className="mt-0.5 text-[11px] font-extrabold uppercase tracking-widest text-[#6d4d29]">
                    ✦ {emblem.label} ✦
                  </span>
                </div>

                {/* Middle Section: Occasion Icon + Darker Headline + Divider */}
                <div className="relative z-10 my-3">
                  <span className="text-5xl drop-shadow-sm">{occasionIcon}</span>

                  {/* Headline (Darker, rich tone) */}
                  <h3 className="mt-2 text-xl sm:text-2xl font-black tracking-tight text-[#1e1107] leading-snug drop-shadow-xs">
                    {headline}
                  </h3>

                  {/* Warm Bronze Ornate Divider */}
                  <div className="my-2.5 flex items-center justify-center gap-2 text-[#997340]">
                    <span className="h-[1.5px] w-12 bg-gradient-to-r from-transparent to-[#997340]" />
                    <span className="text-sm font-bold">‹ ❖ ›</span>
                    <span className="h-[1.5px] w-12 bg-gradient-to-l from-transparent to-[#997340]" />
                  </div>

                  {/* Subtitle / Wishes (Darker, crisper readability) */}
                  <p className="font-serif text-sm sm:text-[15px] font-semibold italic text-[#2e1a0b] px-2 leading-relaxed">
                    &ldquo;{occasionSubtitle}&rdquo;
                  </p>
                </div>

                {/* Bottom Section: Stitched Coupon Box */}
                <div className="relative z-10 rounded-2xl border-2 border-dashed border-[#bda278] bg-[#f8f2e7] p-3.5 shadow-sm">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-[#42250d]">
                    EXCLUSIVE GIFT COUPON (VALID {couponValidityDays} DAYS)
                  </span>

                  {/* Universal Cream/Golden Ticket Pill */}
                  <div className="relative mx-auto my-1.5 max-w-[240px] rounded-xl bg-gradient-to-r from-[#edd39f] via-[#fae6c3] to-[#e4c287] py-1.5 px-4 font-mono text-sm sm:text-base font-black tracking-wider text-[#281607] shadow-sm border border-[#d2b37c]">
                    VIP PASS · FLAT {discountPercent}% OFF
                  </div>

                  <span className="text-xs font-black text-[#1f1105] block">Flat {discountPercent}% OFF On Your Visit!</span>
                  <span className="text-[10px] font-medium text-[#4a2b10] block mt-0.5">Show message code below to redeem</span>
                </div>
              </div>
            )}

            {/* CAROUSEL SLIDER POINTS (Directly underneath the card) */}
            <div className="mt-4 flex flex-col items-center gap-2 border-t border-white/10 pt-3">
              {/* Pagination Dots: Dot 1 = Ivory Cream (Default), Dot 2 = Royal Dark Gold */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTemplateStyle("ivory_cream")}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    templateStyle === "ivory_cream"
                      ? "w-8 bg-amber-400 shadow-md ring-2 ring-amber-300/40"
                      : "w-3 bg-slate-600 hover:bg-slate-500"
                  }`}
                  aria-label="Card 1: Ivory Cream (Default)"
                />
                <button
                  type="button"
                  onClick={() => setTemplateStyle("royal_gold")}
                  className={`h-3 rounded-full transition-all duration-300 ${
                    templateStyle === "royal_gold"
                      ? "w-8 bg-amber-400 shadow-md ring-2 ring-amber-300/40"
                      : "w-3 bg-slate-600 hover:bg-slate-500"
                  }`}
                  aria-label="Card 2: Royal Dark Gold"
                />
              </div>

              {/* Sub-label & slide hints */}
              <div className="flex items-center justify-between w-full max-w-[280px] text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setTemplateStyle("ivory_cream")}
                  className={`transition ${
                    templateStyle === "ivory_cream"
                      ? "text-amber-300 font-extrabold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  ‹ 1. Ivory Cream (Default)
                </button>
                <button
                  type="button"
                  onClick={() => setTemplateStyle("royal_gold")}
                  className={`transition ${
                    templateStyle === "royal_gold"
                      ? "text-amber-300 font-extrabold"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  2. Royal Dark Gold ›
                </button>
              </div>
              <p className="text-[10px] text-slate-400">
                👆 Slide / click dots below card to switch style
              </p>
            </div>

            {/* Simulated WhatsApp Caption Text */}
            <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-left text-xs sm:text-sm leading-relaxed text-slate-100 shadow-md">
              <div className="mb-2 flex items-center justify-between border-b border-white/10 pb-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                  📱 WhatsApp Caption Sent Below Poster:
                </span>
                <span className="rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  Auto-Personalized
                </span>
              </div>
              <p className="font-medium text-slate-100">
                <strong className="text-amber-300">{businessName}:</strong> Dear <span className="font-bold underline text-amber-200">[Customer Name 👤]</span> ji, {bodyText}
              </p>
              <div className="mt-3 rounded-xl bg-amber-950/70 border border-amber-400/40 p-2.5 text-xs text-amber-200">
                🎁 <strong>Special Gift Code:</strong> {couponCode} (Valid {couponValidityDays} days)
              </div>
            </div>

            {/* Interactive Real Test on WhatsApp Panel via Cloud API */}
            <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/70 to-slate-900 p-4 text-left shadow-lg">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-300">
                  <span>📱</span> Fast2SMS WhatsApp Cloud API &amp; Test
                </span>
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  Official Gateway
                </span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                Type mobile number to test WhatsApp greeting with dynamic coupon code:
              </p>

              <div className="mt-3 flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-emerald-400 font-bold">+91</span>
                  <input
                    type="tel"
                    value={testPhone}
                    maxLength={10}
                    onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter mobile number"
                    className="w-full rounded-xl border border-emerald-500/40 bg-slate-950/80 pl-11 pr-3 py-2 text-xs font-bold text-white placeholder-slate-500 outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    disabled={testingFast2Sms}
                    onClick={handleSendFast2SmsApiTest}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-95 transition disabled:opacity-50"
                  >
                    <span>⚡</span>
                    <span>{testingFast2Sms ? "Dispatching..." : "Send via API"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSendWhatsAppTest}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/80 px-3 py-2 text-xs font-bold text-emerald-200 hover:bg-emerald-900/60 active:scale-95 transition"
                    title="Open directly in WhatsApp Web or App"
                  >
                    <span>📲</span>
                    <span>Open in WhatsApp</span>
                  </button>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-white/10 text-[11px]">
                <button
                  type="button"
                  onClick={handleDownloadPosterImage}
                  className="inline-flex items-center gap-1 font-bold text-amber-300 hover:text-amber-200 transition"
                >
                  <span>⬇️</span> Download HD Card Poster
                </button>
                <span className="text-[10px] text-slate-400">
                  Fast2SMS Template ID: 41350
                </span>
              </div>

              {testNotice && (
                <div
                  className={`mt-2.5 rounded-xl border p-2.5 text-[11px] font-medium leading-relaxed ${
                    testNotice.type === "success"
                      ? "bg-emerald-900/60 border-emerald-500/50 text-emerald-200"
                      : testNotice.type === "pending"
                      ? "bg-amber-950/70 border-amber-500/50 text-amber-200"
                      : testNotice.type === "info"
                      ? "bg-blue-950/60 border-blue-500/50 text-blue-200"
                      : "bg-rose-950/60 border-rose-500/50 text-rose-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>
                      {testNotice.type === "success"
                        ? "✓"
                        : testNotice.type === "pending"
                        ? "⏳"
                        : testNotice.type === "info"
                        ? "ℹ️"
                        : "⚠️"}
                    </span>
                    <span>{testNotice.text}</span>
                  </div>
                  {testNotice.details && (
                    <p className="mt-1 text-[10px] text-amber-100/90 border-t border-amber-500/20 pt-1">
                      {testNotice.details}
                    </p>
                  )}
                  {testNotice.type === "pending" && (
                    <div className="mt-2 flex items-center justify-between border-t border-amber-500/30 pt-1.5">
                      <span className="text-[10px] text-amber-300">Live test WhatsApp par karein:</span>
                      <button
                        type="button"
                        onClick={handleSendWhatsAppTest}
                        className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[10px] font-bold text-white shadow hover:bg-emerald-700 transition"
                      >
                        <span>📲</span> Open Direct in WhatsApp
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Customization Controls & Approved Draft Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Customize Draft &amp; Styling</h3>
                <p className="text-xs text-slate-500">Edit headline, greetings, and discount coupon for {occasionType}.</p>
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
              {/* Headline (Free Text Input for Universal Card Poster) */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Greeting Card Headline:
                  </label>
                  <span className="text-[11px] font-bold text-amber-700 flex items-center gap-1">
                    <span>{templateStyle === "ivory_cream" ? "🌿" : "👑"}</span>
                    <span>
                      {templateStyle === "ivory_cream"
                        ? "Universal Ivory Elegance Poster"
                        : "Universal Royal Dark Gold Poster"}
                    </span>
                  </span>
                </div>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. 🎉 Happy Birthday!"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100"
                />
                <span className="mt-1 block text-[11px] text-slate-500">
                  Yeh headline aapke universal poster par print hogi (sab customer ke liye timeless aur consistent).
                </span>
              </div>

              {/* Message Body with Dynamic Customer Personalization */}
              <div>
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                    Greeting Message Body:
                  </label>
                  <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                    <span>⚡</span> Smart Personalization
                  </span>
                </div>

                {/* Personalization Info Box */}
                <div className="mt-1.5 flex flex-col gap-1.5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1 rounded-lg bg-emerald-200 px-2.5 py-1 text-xs font-black text-emerald-950 border border-emerald-300 shadow-sm">
                      👤 [ Customer Name (Auto-Inserted in WhatsApp) ]
                    </span>
                    <span className="text-xs font-bold text-slate-700">+ Aapka Customized Message Niche:</span>
                  </div>
                  <p className="text-[11px] text-emerald-900">
                    💡 <strong>Universal Card + Dynamic Personalization:</strong> Card poster ek timeless luxury poster rahega, jabki customer ka personal naam (jaise: <strong>Rahul ji</strong> ya <strong>Priya ji</strong>) WhatsApp message me har customer ke hisab se dynamically deliver hoga!
                  </p>
                </div>

                <textarea
                  rows={3}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Yahan aapna shubh-kamna sandesh likhein..."
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 shadow-sm"
                />

                {/* Language Selector: English (Auto-Selected Permanently) */}
                <div className="mt-2.5 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/90 px-3.5 py-2 shadow-2xs">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <span>🌐</span> Language:
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-extrabold text-slate-800 shadow-2xs">
                    <span>🇬🇧</span> English (Auto-Selected)
                  </span>
                </div>
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
                  {saving ? "Saving Draft..." : `✓ Approve & Save ${occasionType.toUpperCase()} Draft`}
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

      {/* 📋 SAVED OCCASION PLANS & ACTIVE SCHEMES */}
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-xl">
              📋
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Saved Occasion Plans &amp; Active Schemes
              </h3>
              <p className="text-xs text-slate-500">
                View your 4 configured occasion schemes — discount %, coupon code, validity period, and automatic dispatch schedule.
              </p>
            </div>
          </div>

          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-800">
            ✓ 4 Occasions Configured
          </span>
        </div>

        {/* 4 Occasion Plans Grid */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Plan 1: Birthday Plan */}
          <div className="flex flex-col justify-between rounded-2xl border border-orange-200 bg-gradient-to-b from-orange-50/50 to-white p-4 shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🎂</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    autoBirthday
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {autoBirthday ? "Auto Active" : "Paused"}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-extrabold text-slate-900">Birthday Scheme</h4>
              <p className="text-[11px] text-slate-500">Daily automated customer wish</p>

              <div className="mt-3 space-y-1.5 border-t border-orange-100 pt-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount:</span>
                  <span className="font-extrabold text-orange-600">
                    Flat {draftsMap.birthday?.discount_percent ?? 15}% OFF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coupon:</span>
                  <span className="font-mono font-bold text-slate-800">
                    BDAY-LUCKY-{draftsMap.birthday?.discount_percent ?? 15}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validity:</span>
                  <span className="font-semibold text-slate-700">
                    {draftsMap.birthday?.coupon_validity_days ?? 7} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatch Time:</span>
                  <span className="font-semibold text-slate-700">{dispatchTime} AM</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleOccasionSwitch("birthday");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="mt-4 w-full rounded-xl border border-orange-200 bg-white py-2 text-xs font-bold text-orange-700 hover:bg-orange-50 transition"
            >
              ✏️ Edit Birthday Plan
            </button>
          </div>

          {/* Plan 2: Anniversary Plan */}
          <div className="flex flex-col justify-between rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/50 to-white p-4 shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">💍</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase tracking-wider ${
                    autoAnniversary
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {autoAnniversary ? "Auto Active" : "Paused"}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-extrabold text-slate-900">Anniversary Scheme</h4>
              <p className="text-[11px] text-slate-500">Wedding anniversary greeting</p>

              <div className="mt-3 space-y-1.5 border-t border-rose-100 pt-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount:</span>
                  <span className="font-extrabold text-rose-600">
                    Flat {draftsMap.anniversary?.discount_percent ?? 20}% OFF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coupon:</span>
                  <span className="font-mono font-bold text-slate-800">
                    ANNIV-LUCKY-{draftsMap.anniversary?.discount_percent ?? 20}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validity:</span>
                  <span className="font-semibold text-slate-700">
                    {draftsMap.anniversary?.coupon_validity_days ?? 7} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Dispatch Time:</span>
                  <span className="font-semibold text-slate-700">{dispatchTime} AM</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleOccasionSwitch("anniversary");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="mt-4 w-full rounded-xl border border-rose-200 bg-white py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 transition"
            >
              ✏️ Edit Anniversary Plan
            </button>
          </div>

          {/* Plan 3: Festival Plan */}
          <div className="flex flex-col justify-between rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/50 to-white p-4 shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🪔</span>
                <span className="rounded-full bg-indigo-100 border border-indigo-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-indigo-800">
                  {draftsMap.festival ? "Plan Saved" : "Default Ready"}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-extrabold text-slate-900">Festival Campaign</h4>
              <p className="text-[11px] text-slate-500">Festivals &amp; seasonal greetings</p>

              <div className="mt-3 space-y-1.5 border-t border-indigo-100 pt-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount:</span>
                  <span className="font-extrabold text-indigo-600">
                    Flat {draftsMap.festival?.discount_percent ?? 25}% OFF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coupon:</span>
                  <span className="font-mono font-bold text-slate-800">
                    FESTIVE-LUCKY-{draftsMap.festival?.discount_percent ?? 25}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validity:</span>
                  <span className="font-semibold text-slate-700">
                    {draftsMap.festival?.coupon_validity_days ?? 7} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="font-semibold text-slate-700">Festival Broadcast</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleOccasionSwitch("festival");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="mt-4 w-full rounded-xl border border-indigo-200 bg-white py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-50 transition"
            >
              ✏️ Edit Festival Plan
            </button>
          </div>

          {/* Plan 4: Special Offer Plan */}
          <div className="flex flex-col justify-between rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/50 to-white p-4 shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-2xl">🔥</span>
                <span className="rounded-full bg-emerald-100 border border-emerald-200 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-emerald-800">
                  {draftsMap.offer ? "Plan Saved" : "Default Ready"}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-extrabold text-slate-900">Today&apos;s Special Offer</h4>
              <p className="text-[11px] text-slate-500">Flash discount &amp; dining vouchers</p>

              <div className="mt-3 space-y-1.5 border-t border-emerald-100 pt-2.5 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Discount:</span>
                  <span className="font-extrabold text-emerald-600">
                    Flat {draftsMap.offer?.discount_percent ?? 10}% OFF
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coupon:</span>
                  <span className="font-mono font-bold text-slate-800">
                    SPECIAL-LUCKY-{draftsMap.offer?.discount_percent ?? 10}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Validity:</span>
                  <span className="font-semibold text-slate-700">
                    {draftsMap.offer?.coupon_validity_days ?? 3} Days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode:</span>
                  <span className="font-semibold text-slate-700">Special Promotion</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                handleOccasionSwitch("offer");
                window.scrollTo({ top: 120, behavior: "smooth" });
              }}
              className="mt-4 w-full rounded-xl border border-emerald-200 bg-white py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 transition"
            >
              ✏️ Edit Offer Plan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
