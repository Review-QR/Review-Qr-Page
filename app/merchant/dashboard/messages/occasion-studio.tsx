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
      let posterDataUrl: string | undefined = undefined;
      if (testCanvasRef.current) {
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
        posterDataUrl = testCanvasRef.current.toDataURL("image/jpeg", 0.9);
      }

      const activeState = occasionType === "birthday" ? autoBirthday : autoAnniversary;
      const res = await saveMerchantOccasionDraftAction({
        occasionType,
        templateStyle,
        headline,
        bodyText,
        discountPercent,
        couponValidityDays,
        isActive: activeState,
        posterDataUrl,
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
      let posterDataUrl: string | undefined = undefined;
      if (testCanvasRef.current) {
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
        posterDataUrl = testCanvasRef.current.toDataURL("image/jpeg", 0.9);
      }

      const res = await sendFast2SmsWhatsAppTestAction({
        phone: clean,
        customerName: "Lucky Ji",
        occasionType,
        discountPercent,
        couponValidityDays,
        customMessage: bodyText,
        posterDataUrl,
      });

      if (res.success) {
        setTestNotice({
          type: "success",
          text: `Fast2SMS WhatsApp Gateway Success! (Request ID: ${res.requestId || "Dispatched"})`,
          details: res.mediaUrl ? `Delivered Custom Poster: ${res.mediaUrl}` : undefined,
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
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-800 font-bold">
            🎉
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">Customer Occasion Greetings</h2>
            <p className="text-xs text-slate-500">
              Configure greeting template and daily automatic dispatch for registered customers.
            </p>
          </div>
        </div>

        {/* Connect Credits Pill */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700">
          <span>Balance:</span>
          <span className="font-bold text-slate-900">{creditsBalance} Credits</span>
        </div>
      </div>

      {/* Occasion Types Tab Bar (4 Categories - Formal & Rounded) */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <button
          type="button"
          onClick={() => handleOccasionSwitch("birthday")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
            occasionType === "birthday"
              ? "border-slate-900 bg-slate-900 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>🎂 Birthday</span>
          {draftsMap.birthday && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("anniversary")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
            occasionType === "anniversary"
              ? "border-slate-900 bg-slate-900 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>💍 Anniversary</span>
          {draftsMap.anniversary && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("festival")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
            occasionType === "festival"
              ? "border-slate-900 bg-slate-900 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>🪔 Festivals</span>
          {draftsMap.festival && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </button>

        <button
          type="button"
          onClick={() => handleOccasionSwitch("offer")}
          className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition ${
            occasionType === "offer"
              ? "border-slate-900 bg-slate-900 text-white shadow-xs"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <span>🔥 Special Offer</span>
          {draftsMap.offer && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
        </button>
      </div>

      {/* Main Designer Grid */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column: Slim Template Card + Mobile Test Dispatch (5 Cols) */}
        <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs">
          <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 text-xs font-bold text-slate-700">
            <span>Template Preview</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              Formal Pass
            </span>
          </div>

          {/* SLIM TEMPLATE CARD */}
          <div className="w-full max-w-[240px] mx-auto">
            {templateStyle === "royal_gold" ? (
              <div className="relative overflow-hidden rounded-xl border border-[#d4af37]/60 bg-gradient-to-b from-[#18140c] via-[#0d0c0a] to-[#1e170d] p-3 text-center shadow-xs transition flex flex-col justify-between min-h-[310px]">
                {/* Top Section: Circular Medallion Logo + Business Name */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#f5d77f] ring-1 ring-[#d4af37]/30 bg-[#140f09]">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={businessName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">{emblem.icon}</span>
                    )}
                  </div>
                  <span className="mt-1 text-xs font-bold uppercase tracking-wider text-[#e5c158]">
                    {businessName}
                  </span>
                  <span className="text-[9px] font-semibold text-[#d4af37]/80">
                    {emblem.label}
                  </span>
                </div>

                {/* Middle Section: Occasion Icon + Headline */}
                <div className="relative z-10 my-1">
                  <span className="text-xl">{occasionIcon}</span>
                  <h3 className="mt-0.5 text-xs font-bold text-white leading-snug">
                    {headline}
                  </h3>
                  <p className="font-serif text-[10px] italic text-[#f0dfaa] px-1 mt-1 leading-snug line-clamp-2">
                    &ldquo;{occasionSubtitle}&rdquo;
                  </p>
                </div>

                {/* Bottom Section: Coupon Ticket Box */}
                <div className="relative z-10 rounded-lg border border-[#d4af37]/40 bg-black/50 p-2 text-center">
                  <span className="block text-[8px] font-semibold uppercase tracking-wider text-[#e5c158]">
                    VALID {couponValidityDays} DAYS
                  </span>
                  <div className="mx-auto my-0.5 max-w-[150px] rounded bg-[#d4af37] py-0.5 px-2 font-mono text-[10px] font-bold text-[#1a1205]">
                    FLAT {discountPercent}% OFF
                  </div>
                  <span className="text-[9px] text-white block">On Your Visit</span>
                </div>
              </div>
            ) : (
              <div className="relative overflow-hidden rounded-xl border border-[#d8c7af] bg-gradient-to-b from-[#fdfbf7] via-[#f7f2ea] to-[#eee5d8] p-3 text-center shadow-xs transition flex flex-col justify-between min-h-[310px]">
                {/* Top Section: Circular Medallion Logo + Business Name */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-[#b59363] ring-1 ring-[#dfc698]/40 bg-[#1e140a]">
                    {logoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt={businessName} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-lg">{emblem.icon}</span>
                    )}
                  </div>
                  <span className="mt-1 text-xs font-bold uppercase tracking-wider text-[#2c1808]">
                    {businessName}
                  </span>
                  <span className="text-[9px] font-semibold text-[#704d28]">
                    {emblem.label}
                  </span>
                </div>

                {/* Middle Section: Occasion Icon + Headline */}
                <div className="relative z-10 my-1">
                  <span className="text-xl">{occasionIcon}</span>
                  <h3 className="mt-0.5 text-xs font-bold text-[#1e1107] leading-snug">
                    {headline}
                  </h3>
                  <p className="font-serif text-[10px] italic text-[#2e1a0b] px-1 mt-1 leading-snug line-clamp-2">
                    &ldquo;{occasionSubtitle}&rdquo;
                  </p>
                </div>

                {/* Bottom Section: Stitched Coupon Box */}
                <div className="relative z-10 rounded-lg border border-dashed border-[#bda278] bg-[#f8f2e7] p-2 text-center">
                  <span className="block text-[8px] font-semibold uppercase tracking-wider text-[#42250d]">
                    VALID {couponValidityDays} DAYS
                  </span>
                  <div className="mx-auto my-0.5 max-w-[150px] rounded bg-[#dfc698] py-0.5 px-2 font-mono text-[10px] font-bold text-[#281607] border border-[#cbb189]">
                    FLAT {discountPercent}% OFF
                  </div>
                  <span className="text-[9px] font-semibold text-[#1f1105] block">On Your Visit</span>
                </div>
              </div>
            )}
          </div>

          {/* ONLY 2 SOBER CONTROLS: Mobile Number + Test API */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <div className="relative flex-1 min-w-0">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-medium text-slate-400">
                  +91
                </span>
                <input
                  type="tel"
                  value={testPhone}
                  maxLength={10}
                  onChange={(e) => setTestPhone(e.target.value.replace(/\D/g, ""))}
                  placeholder="Mobile number"
                  className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-2 py-1.5 text-xs text-slate-900 outline-none focus:border-slate-500 transition"
                />
              </div>
              <button
                type="button"
                disabled={testingFast2Sms}
                onClick={handleSendFast2SmsApiTest}
                className="shrink-0 rounded-lg border border-slate-300 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-900 active:scale-95 transition disabled:opacity-50"
              >
                {testingFast2Sms ? "Testing..." : "Test API"}
              </button>
            </div>

            {testNotice && (
              <div
                className={`mt-2 rounded-lg p-2 text-[11px] font-medium ${
                  testNotice.type === "success"
                    ? "bg-slate-100 text-slate-800"
                    : testNotice.type === "pending"
                    ? "bg-slate-100 text-slate-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {testNotice.text}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Customization Controls & Approved Draft Actions (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Customize Greeting Template</h3>
              <p className="text-xs text-slate-500">Edit headline, greeting wish message, and discount offer for {occasionType}.</p>
            </div>

            <div className="mt-4 space-y-4">
              {/* Headline */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Greeting Headline:
                </label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Happy Birthday!"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300"
                />
              </div>

              {/* Message Body */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wide text-slate-700">
                  Greeting Message Body:
                </label>
                <textarea
                  rows={3}
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Enter greeting wish message..."
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-300 shadow-xs"
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
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
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
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-900 outline-none focus:border-slate-400"
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
                  className={`rounded-xl border p-3 text-xs font-semibold ${
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
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-sm font-bold text-white shadow-xs hover:bg-slate-800 disabled:opacity-50 transition"
                >
                  {saving ? "Saving Draft..." : `Save ${occasionType.toUpperCase()} Draft`}
                </button>
              </div>
            </div>
          </div>

          {/* Daily Timing & Auto-Schedule Configuration Card */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5">
            <h4 className="text-sm font-bold text-slate-900">Daily Auto-Dispatch Schedule</h4>
            <p className="mt-0.5 text-xs text-slate-500">
              Automatically dispatches approved greetings each morning at your selected time.
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
