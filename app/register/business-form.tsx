"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import SearchableBusinessType from "@/app/components/searchable-business-type";
import { saveTrustitBusiness } from "./actions";
import type { UnifiedBusinessCategory } from "@/lib/business-category-catalog";

const cls =
  "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs sm:text-sm font-medium shadow-2xs outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

interface VisualCategory {
  id: string;
  name: string;
  emoji: string;
  title: string;
  subtitle: string;
  tag: string;
}

const VISUAL_CATEGORIES: VisualCategory[] = [
  {
    id: "restaurant",
    name: "Restaurant",
    emoji: "🍔",
    title: "Restaurant & Cafe",
    subtitle: "भोजन, मिठाई, स्नैक्स व फास्ट फूड",
    tag: "25–35m Doorstep",
  },
  {
    id: "grocery",
    name: "Grocery Store",
    emoji: "🛒",
    title: "Grocery & Kirana",
    subtitle: "आटा, दाल, तेल, मसाले, साबुन व राशन",
    tag: "Parcha + 50+ Items",
  },
  {
    id: "dairy",
    name: "Dairy",
    emoji: "🥛",
    title: "Dairy & Fresh Milk",
    subtitle: "गाय/भैंस का शुद्ध दूध, पनीर व दही",
    tag: "Morning & Evening Slots",
  },
  {
    id: "salon",
    name: "Salon",
    emoji: "✂️",
    title: "Salon & Barber Shop",
    subtitle: "हेयरकट, शेविंग, फेशियल व ग्रूमिंग",
    tag: "Live Token Queue",
  },
  {
    id: "car_wash",
    name: "Car Wash",
    emoji: "🚗",
    title: "Car Wash & Detailing",
    subtitle: "कार फोम वाश, बाइक वाश व इंटीरियर",
    tag: "Bay Management",
  },
  {
    id: "pharmacy",
    name: "Pharmacy",
    emoji: "💊",
    title: "Chemist & Medical",
    subtitle: "दवाइयां, हेल्थकेयर व प्राथमिक उपचार",
    tag: "Prescription (Rx) Only",
  },
];

export default function BusinessForm({
  initialBusinessName = "",
  categories = [],
}: {
  initialBusinessName?: string;
  categories?: UnifiedBusinessCategory[];
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initialBusinessName);
  const [businessType, setBusinessType] = useState("Restaurant");
  const [address, setAddress] = useState("");
  const [reviewLink, setReviewLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  // Category-specific sub-panel states
  const [prepTime, setPrepTime] = useState("20");
  const [foodType, setFoodType] = useState<"pure_veg" | "both">("both");
  const [parchaMode, setParchaMode] = useState(true);
  const [morningSlot, setMorningSlot] = useState(true);
  const [eveningSlot, setEveningSlot] = useState(true);
  const [chairCount, setChairCount] = useState("2");
  const [tokenPassActive, setTokenPassActive] = useState(true);
  const [bayCount, setBayCount] = useState("2");
  const [drugLicense, setDrugLicense] = useState("");

  // GPS auto-capture state
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string>("");

  useEffect(() => {
    if (initialBusinessName) return;
    const savedName = window.sessionStorage.getItem("trustit_business_name");
    if (savedName) setBusinessName(savedName);
  }, [initialBusinessName]);

  function handleCaptureGps() {
    if (!navigator.geolocation) {
      setGpsStatus("आपके ब्राउज़र में GPS सुविधा उपलब्ध नहीं है। कृपया हाथ से पता लिखें।");
      return;
    }
    setGpsLoading(true);
    setGpsStatus("सटीक GPS लोकेशन जांची जा रही है...");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(6));
        const lng = Number(pos.coords.longitude.toFixed(6));
        setGpsCoords({ lat, lng });
        setGpsLoading(false);
        setGpsStatus(`✓ GPS लोकेशन कैप्चर हो गई (${lat}° N, ${lng}° E) — राइडर सीधे काउंटर पर पहुँचेगा!`);
        if (!address.trim()) {
          setAddress(`Near Verified GPS (${lat}, ${lng}), Bahraich`);
        }
      },
      (err) => {
        setGpsLoading(false);
        setGpsStatus(`लोकेशन अनुमति नहीं मिली (${err.message})। कृपया नीचे पता टाइप करें।`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const result = await saveTrustitBusiness({
        name: businessName.trim(),
        type: businessType.trim(),
        address: address.trim(),
        reviewLink: reviewLink.trim(),
      });

      if (!result.success) {
        setMessage(result.message);
        return;
      }

      window.sessionStorage.removeItem("trustit_business_name");
      router.push("/register/plan");
      router.refresh();
    } catch {
      setMessage("हम अभी ये विवरण सुरक्षित नहीं कर सके। कृपया पुनः प्रयास करें।");
    } finally {
      setBusy(false);
    }
  }

  const selectedCategory = VISUAL_CATEGORIES.find((c) => c.name === businessType);

  return (
    <form onSubmit={submit} className="mt-8 space-y-6">
      {/* 1. Business Trade Name */}
      <div>
        <label htmlFor="businessNameInput" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          दुकान / प्रतिष्ठान का नाम (Business Legal or Brand Name) *
        </label>
        <input
          id="businessNameInput"
          name="name"
          autoComplete="organization"
          maxLength={160}
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          placeholder="उदा. श्याम दूध भंडार, गुप्ता किराना, लुक्स हेयर स्टूडियो..."
          className={cls}
          required
        />
        <p className="mt-1 text-[11px] text-slate-500">यह नाम ग्राहकों को Trustit ऐप और काउंटर QR स्टैंडी पर दिखेगा।</p>
      </div>

      {/* 2. Visual 6 Interactive Category Cards */}
      <div>
        <div className="flex items-center justify-between">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            बिज़नेस टाइप व कार्यप्रणाली चुनें (Choose Your Category) *
          </label>
          <span className="text-[11px] font-bold text-blue-700">
            {selectedCategory ? `${selectedCategory.emoji} ${selectedCategory.title}` : businessType}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-slate-500">
          आपके द्वारा चुनी गई कैटेगरी के आधार पर ही आपका डैशबोर्ड, आर्डर सिस्टम व कैटलॉग तैयार होगा:
        </p>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {VISUAL_CATEGORIES.map((cat) => {
            const isSelected = businessType === cat.name;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setBusinessType(cat.name)}
                className={`group relative flex flex-col justify-between rounded-2xl border p-3.5 text-left transition ${
                  isSelected
                    ? "border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/30"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl">{cat.emoji}</span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wider ${
                        isSelected ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {isSelected ? "Selected ✓" : cat.tag.split(" ")[0]}
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-bold text-slate-900 group-hover:text-blue-700">{cat.title}</h3>
                  <p className="mt-0.5 text-[10px] leading-tight text-slate-500">{cat.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Category-Smart Dynamic Sub-Panels */}
      {businessType === "Restaurant" && (
        <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50/60 to-white p-4.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🍔</span>
            <h4 className="text-xs font-bold text-slate-900">Restaurant & Kitchen Operations (KOT Settings)</h4>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700">⏱️ औसत कुकिंग समय (Avg Kitchen Prep Time)</label>
              <select
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-blue-500"
              >
                <option value="15">15 मिनट (फास्ट फूड / स्नैक्स)</option>
                <option value="20">20 मिनट (मानक भोजन - डिफ़ॉल्ट)</option>
                <option value="30">30 मिनट (तंदूर / स्पेशल डिशेस)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700">🍽️ मेन्यू प्रकार</label>
              <div className="mt-1.5 flex items-center gap-3 text-xs font-semibold text-slate-800">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="restaurantDiet"
                    checked={foodType === "pure_veg"}
                    onChange={() => setFoodType("pure_veg")}
                    className="accent-emerald-600"
                  />
                  <span>🟢 Pure Veg</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="restaurantDiet"
                    checked={foodType === "both"}
                    onChange={() => setFoodType("both")}
                    className="accent-blue-600"
                  />
                  <span>🔴 Veg & Non-Veg Both</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-white p-2.5 text-[11px] text-blue-900">
            <span>⚡</span>
            <span><strong>राइडर फ्लो:</strong> जैसे ही आप आर्डर 'Accept' करेंगे, राइडर तुरंत रवाना होगा। खाना तैयार होते ही 'Order Ready' दबाएं।</span>
          </div>
        </div>
      )}

      {businessType === "Grocery Store" && (
        <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/60 to-white p-4.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🛒</span>
            <h4 className="text-xs font-bold text-slate-900">Kirana Master Rates & Smart Parcha Settings</h4>
          </div>
          <div className="mt-3 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={parchaMode}
                onChange={(e) => setParchaMode(e.target.checked)}
                className="h-4 w-4 rounded accent-emerald-600"
              />
              <span className="text-xs font-bold text-slate-800">📝 हाथ का लिखा पर्चा (Smart Parcha Upload) सक्रिय रखें</span>
            </label>
            <p className="text-[11px] text-slate-600 pl-6">
              ग्राहक अपने पर्चे की फोटो खींचकर भेजेंगे, आप 1 क्लिक में बिल कोट करेंगे।
            </p>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-emerald-200 bg-white p-2.5 text-[11px] text-emerald-950">
            <span>✨</span>
            <span><strong>प्री-सीडेड कैटलॉग:</strong> 50+ दैनिक किराना सामान (आटा, दाल, चीनी, सर्फ एक्सेल, कोलगेट) लोड मिलेंगे। आपको सिर्फ रेट दर्ज करना है।</span>
          </div>
        </div>
      )}

      {businessType === "Dairy" && (
        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-50/60 to-white p-4.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🥛</span>
            <h4 className="text-xs font-bold text-slate-900">Dairy Milk & Cold-Chain Delivery Slots</h4>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-slate-800">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={morningSlot}
                onChange={(e) => setMorningSlot(e.target.checked)}
                className="h-4 w-4 rounded accent-sky-600"
              />
              <span>🌅 सुबह का स्लॉट (6:00 AM - 8:30 AM)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={eveningSlot}
                onChange={(e) => setEveningSlot(e.target.checked)}
                className="h-4 w-4 rounded accent-sky-600"
              />
              <span>🌇 शाम का स्लॉट (5:00 PM - 7:30 PM)</span>
            </label>
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-sky-200 bg-white p-2.5 text-[11px] text-sky-950">
            <span>🥛</span>
            <span><strong>प्री-लोडेड आइटम्स:</strong> शुद्ध भैंस का दूध, गाय का दूध, ताजा मलाई पनीर, दही और घी पहले से ड्राफ्ट में तैयार रहेंगे।</span>
          </div>
        </div>
      )}

      {businessType === "Salon" && (
        <div className="rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/60 to-white p-4.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">✂️</span>
            <h4 className="text-xs font-bold text-slate-900">Salon Queue & Live Token Pass Configuration</h4>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700">🪑 काम करने वाली कुर्सियों की संख्या (Stylists/Chairs)</label>
              <input
                type="number"
                min={1}
                max={20}
                value={chairCount}
                onChange={(e) => setChairCount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-purple-500"
              />
              <p className="mt-0.5 text-[10px] text-slate-500">इससे ग्राहकों को घर बैठे सटीक वेटिंग टाइम का अंदाजा मिलता है।</p>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700">🎫 डिजिटल टोकन पास</label>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={tokenPassActive}
                  onChange={(e) => setTokenPassActive(e.target.checked)}
                  className="h-4 w-4 rounded accent-purple-600"
                />
                <span className="text-xs font-semibold text-slate-800">ग्राहक ऑनलाइन टोकन ले सकेंगे</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {businessType === "Car Wash" && (
        <div className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white p-4.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">🚗</span>
            <h4 className="text-xs font-bold text-slate-900">Auto Detailing & Bay Booking Settings</h4>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700">🚿 वाशिंग बे (Washing Bays) की संख्या</label>
              <input
                type="number"
                min={1}
                max={10}
                value={bayCount}
                onChange={(e) => setBayCount(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-indigo-500"
              />
            </div>
            <div className="text-xs text-slate-600">
              <p className="font-bold text-slate-800">प्री-लोडेड पैकेजेस:</p>
              <p className="mt-1 text-[11px]">बाइक प्रेशर वाश, कार फोम वाश, इंटीरियर वैक्यूमिंग व टेफ्लॉन कोटिंग।</p>
            </div>
          </div>
        </div>
      )}

      {businessType === "Pharmacy" && (
        <div className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/60 to-white p-4.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="text-lg">💊</span>
            <h4 className="text-xs font-bold text-slate-900">Pharmacy & Prescription (Rx) Operations</h4>
          </div>
          <div className="mt-3">
            <label className="block text-[11px] font-bold text-slate-700">📄 ड्रग लाइसेंस नंबर (DL Number - Optional)</label>
            <input
              type="text"
              value={drugLicense}
              onChange={(e) => setDrugLicense(e.target.value)}
              placeholder="उदा. UP/BHR/2024/00129"
              className="mt-1 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 outline-none focus:border-rose-500"
            />
          </div>
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-white p-2.5 text-[11px] text-rose-950">
            <span>🛡️</span>
            <span><strong>ज़ीरो कैटलॉग नियम:</strong> दवाइयों की लिस्ट अपलोड करने की जरूरत नहीं है। मरीज केवल डॉक्टर का पर्चा अपलोड करेगा, आप बिल कोट करेंगे।</span>
          </div>
        </div>
      )}

      {/* Hidden and fallback SearchableBusinessType for full catalog & test compatibility */}
      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3.5">
        <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600">
          या 256+ विशिष्ट श्रेणियों में से खोजें (Search All Categories):
        </label>
        <SearchableBusinessType
          name="type"
          value={businessType}
          onChange={setBusinessType}
          inputClassName={cls}
          categories={categories}
        />
      </div>

      {/* 4. Store Address & GPS Capture */}
      <div>
        <div className="flex items-center justify-between">
          <label htmlFor="addressInput" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
            दुकान का सटीक पता (Store Address & Street) *
          </label>
          <button
            type="button"
            onClick={handleCaptureGps}
            disabled={gpsLoading}
            className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition disabled:opacity-50"
          >
            <span>📍</span>
            <span>{gpsLoading ? "GPS खोज रहे हैं..." : "Use Current GPS Location"}</span>
          </button>
        </div>
        <input
          id="addressInput"
          name="address"
          autoComplete="street-address"
          maxLength={1000}
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="उदा. दुकान नं. 4, मस्तान कॉम्प्लेक्स, KDC कॉलेज के सामने, बहराइच"
          className={cls}
          required
        />
        {gpsStatus && (
          <p
            className={`mt-1.5 flex items-center gap-1.5 text-xs font-semibold ${
              gpsCoords ? "text-emerald-700" : "text-amber-700"
            }`}
          >
            <span>{gpsCoords ? "🎯" : "ℹ️"}</span>
            <span>{gpsStatus}</span>
          </p>
        )}
      </div>

      {/* 5. Google Review Link (Optional) */}
      <div>
        <label htmlFor="reviewLinkInput" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
          Google Review Link <span className="font-normal text-slate-500">(वैकल्पिक / Optional)</span>
        </label>
        <input
          id="reviewLinkInput"
          name="reviewLink"
          type="url"
          inputMode="url"
          value={reviewLink}
          onChange={(e) => setReviewLink(e.target.value)}
          placeholder="https://g.page/r/... (यदि हो तो दर्ज करें, इसे बाद में भी जोड़ सकते हैं)"
          maxLength={2048}
          className={cls}
        />
        <p className="mt-1 text-[11px] text-slate-500">
          यदि आपके पास Google Business प्रोफ़ाइल का लिंक है तो डालें, ताकि हम काउंटर स्टैंडी के लिए QR कोड तैयार कर सकें।
        </p>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={busy || !businessName.trim() || !address.trim()}
        className="flex min-h-10 sm:min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow-xs transition hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50"
      >
        {busy ? (
          <>
            <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>डेटा सुरक्षित हो रहा है...</span>
          </>
        ) : (
          <>
            <span>आगे बढ़ें: प्लान चुनें (Save & Select Plan)</span>
            <span>→</span>
          </>
        )}
      </button>

      {message && (
        <div role="alert" className="flex items-center gap-2 rounded-2xl bg-rose-50 p-4 text-xs font-bold text-rose-800">
          <span>⚠️</span>
          <span>{message}</span>
        </div>
      )}
    </form>
  );
}
