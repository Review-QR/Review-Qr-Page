import type { Metadata } from "next";
import Link from "next/link";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({
  title: "About Trustit | Bahraich's Hyperlocal Super-App, Dedicated Delivery Fleet & Food Delivery",
  description:
    "Trustit is Bahraich's unified hyperlocal super-app operating its own dedicated delivery rider fleet (like Swiggy, Zomato & Blinkit). We deliver restaurant food, pure dairy, groceries, and medicines straight to your doorstep in 25–35 minutes with 4-digit OTP handover.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <TrustitPublicPage
      title="About Trustit"
      intro="Bahraich's unified hyperlocal super-app, dedicated delivery rider fleet, and verified local merchant ecosystem."
    >
      {/* ── 4 Pillar Trust Metrics Strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 my-2">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-center">
          <div className="text-xl">⚡</div>
          <div className="mt-1 text-xs font-black text-blue-950">25–35 Min Delivery</div>
          <p className="mt-0.5 text-[10px] text-blue-700 leading-tight">Fast doorstep dispatch</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-3.5 text-center">
          <div className="text-xl">🛡️</div>
          <div className="mt-1 text-xs font-black text-emerald-950">4-Digit OTP</div>
          <p className="mt-0.5 text-[10px] text-emerald-700 leading-tight">Secure contactless handover</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-3.5 text-center">
          <div className="text-xl">🛵</div>
          <div className="mt-1 text-xs font-black text-amber-950">Dedicated Fleet</div>
          <p className="mt-0.5 text-[10px] text-amber-700 leading-tight">Own verified rider network</p>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50/70 p-3.5 text-center">
          <div className="text-xl">📍</div>
          <div className="mt-1 text-xs font-black text-purple-950">100% Bahraich UP-40</div>
          <p className="mt-0.5 text-[10px] text-purple-700 leading-tight">Hyperlocal coverage</p>
        </div>
      </div>

      {/* ── Core Clarification: Dedicated Delivery Rider Fleet ── */}
      <div className="my-6 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/80 to-amber-100/60 p-6 text-slate-900 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-amber-500 text-xl text-white shadow-sm">
            🛵
          </span>
          <div>
            <h2 className="!mt-0 text-lg font-black text-amber-950 tracking-tight">
              Dedicated Delivery Rider Fleet (हमारा अपना समर्पित डिलीवरी नेटवर्क)
            </h2>
            <p className="text-xs font-semibold text-amber-800">
              Swiggy, Zomato एवं Blinkit की तरह Trustit का अपना सक्रिय डिलीवरी राइडर फ्लीट
            </p>
          </div>
        </div>

        <div className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-800">
          <p>
            <strong>आधिकारिक स्पष्टीकरण:</strong> Trustit केवल एक क्यूआर कोड या बिजनेस डायरेक्टरी नहीं है।
            जिस प्रकार स्विगी (Swiggy), ज़ोमैटो (Zomato) और ब्लिंकिट (Blinkit) की अपनी समर्पित राइडर टीम होती है,{" "}
            <strong>ठीक उसी प्रकार Trustit बहराइच शहर में अपनी स्वयं की वेरिफाइड डिलीवरी राइडर फ्लीट (Dedicated Delivery Fleet) संचालित करता है</strong>।
          </p>
          <p>
            जब ग्राहक Trustit सुपर-ऐप पर भोजन, ग्रोसरी, दूध या दवाइयाँ ऑर्डर करता है, तो डिलीवरी की ज़िम्मेदारी दुकानदार की नहीं होती।
            हमारे प्रशिक्षित राइडर्स तुरंत मर्चेंट आउटलेट पर पहुँचकर आर्डर कलेक्ट करते हैं और{" "}
            <strong>25 से 35 मिनट के भीतर</strong> पूरी स्वच्छता, गति और <strong>4-डिजिट डिलीवरी OTP</strong> के साथ ग्राहक के घर तक सुरक्षित डिलीवर करते हैं।
          </p>
        </div>

        <div className="mt-5 flex flex-wrap gap-2.5 text-xs font-bold">
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-4 py-2.5 text-white shadow-sm transition hover:brightness-105"
          >
            <span>⚡ Open Super-App Storefront</span>
          </Link>
          <Link
            href="/rider"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2.5 text-white shadow-sm transition hover:bg-slate-800"
          >
            <span>🛵 Trustit Rider Partner Fleet</span>
          </Link>
          <Link
            href="/order?store=Deliciated+Cafe"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-3.5 py-2.5 text-slate-900 shadow-2xs hover:bg-amber-100"
          >
            <span>🍟 Deliciated Cafe (Crispy Corn &amp; Fast Food)</span>
          </Link>
        </div>
      </div>

      {/* ── 6 Core Super-App Verticals in Modern Cards ── */}
      <div className="pt-2">
        <div className="text-center sm:text-left mb-6">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Unified Hyperlocal Super-App</p>
          <h2 className="!mt-1 text-2xl font-black text-slate-950">Our 6 Core Service Verticals</h2>
          <p className="text-sm text-slate-600 mt-1">
            Trustit consolidates everyday local commerce across Bahraich into six dedicated high-speed verticals:
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Vertical 1: Food Delivery */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-100 text-xl text-orange-700">
                🍔
              </span>
              <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[10px] font-bold text-orange-800 border border-orange-200">
                25–35m Doorstep
              </span>
            </div>
            <h3 className="!mt-3 text-base font-extrabold text-slate-950">
              1. Gourmet Food &amp; Sweets Delivery
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Bahraich&apos;s Swiggy &amp; Zomato equivalent. Order hot meals, sweets, and fast food with real-time cooking countdown timer and insulated thermal bags:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              <li>
                <strong>Deliciated Cafe (Opp. KDC, Mastan Complex):</strong> Crispy Corn (₹10), Farmhouse Pizza, Veg Grilled Sandwich, Cold Coffee.
              </li>
              <li>
                <strong>Madhuram Pure Veg (Ghanta Ghar):</strong> Masala Dosa, Chole Bhature, Paneer Special &amp; Executive Thali.
              </li>
              <li>
                <strong>Royal Awadh Dum Biryani (Station Road):</strong> Authentic Chicken Dum Biryani &amp; Galawati Kebabs.
              </li>
              <li>
                <strong>Ramji Lal Mithai Bhandar (Chhawni Chauraha):</strong> Pure Desi Ghee Balushahi &amp; Dahi Jalebi combo.
              </li>
              <li>
                <strong>The Cake Hub &amp; Fresh Bakery:</strong> Dutch Chocolate Truffle Cake, Birthday Cakes &amp; Pastries.
              </li>
            </ul>
          </div>

          {/* Vertical 2: Kirana & Groceries */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-purple-100 text-xl text-purple-700">
                🛒
              </span>
              <span className="rounded-full bg-purple-50 px-2.5 py-0.5 text-[10px] font-bold text-purple-800 border border-purple-200">
                Blinkit / Zepto Model
              </span>
            </div>
            <h3 className="!mt-3 text-base font-extrabold text-slate-950">
              2. Quick Supermarket Kirana &amp; Provisions
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Daily groceries delivered straight from trusted local marts with itemized billing:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              <li>
                <strong>Staples &amp; Daily Cooking:</strong> Aashirvaad Atta, Fortune Mustard &amp; Refined Oils, Pure Desi Ghee, Daal, Basmati Rice &amp; Spices.
              </li>
              <li>
                <strong>Packaged Food &amp; Snacks:</strong> Maggi, Biscuits, Namkeen, Tea (Chai Patti), Juices &amp; Cold Drinks.
              </li>
              <li>
                <strong>Smart Parcha (Handwritten List) Upload:</strong> Take a photo of your paper grocery slip—Trustit riders assemble, verify rates, and deliver to your door.
              </li>
            </ul>
          </div>

          {/* Vertical 3: Fresh Dairy & Milk Supplies */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-sky-100 text-xl text-sky-700">
                🥛
              </span>
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-bold text-sky-800 border border-sky-200">
                Pure Cold-Chain
              </span>
            </div>
            <h3 className="!mt-3 text-base font-extrabold text-slate-950">
              3. Farm-Fresh Dairy &amp; Cold-Chain Milk Supplies
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Bahraich&apos;s Country Delight model. Direct procurement from local dairy farms tested for strict purity and hygiene:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              <li>
                <strong>Pure Cow &amp; Buffalo Milk (शुद्ध एवं पाश्चुरीकृत दूध):</strong> Farm-fresh morning and evening batches tested for purity.
              </li>
              <li>
                <strong>Artisanal Dairy Products:</strong> Fresh Soft Malai Paneer, Creamy Thick Set Dahi, Traditional Bilona Desi Ghee, Pure Mawa / Khoya.
              </li>
              <li>
                <strong>Scheduled Slots:</strong> Dedicated early morning (6:00 AM – 8:30 AM) and evening delivery windows straight to your doorstep.
              </li>
            </ul>
          </div>

          {/* Vertical 4: Medicine & Healthcare */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-rose-100 text-xl text-rose-700">
                💊
              </span>
              <span className="rounded-full bg-rose-50 px-2.5 py-0.5 text-[10px] font-bold text-rose-800 border border-rose-200">
                Urgent Priority
              </span>
            </div>
            <h3 className="!mt-3 text-base font-extrabold text-slate-950">
              4. Pharmacy, Healthcare &amp; Emergency Wellness
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Rapid prescription medicine home delivery from verified chemist partners (Sanjeevani Medicos, Apollo Partner):
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              <li>
                <strong>Prescription &amp; OTC Essentials:</strong> Fever, cold, pain relief, digestive care, ORS, antiseptic lotions &amp; first-aid kits.
              </li>
              <li>
                <strong>Maternal &amp; Baby Care:</strong> Diapers, baby wipes, baby milk formula, sanitizers &amp; pediatric nutrition.
              </li>
              <li>
                <strong>Express Medical Dispatch:</strong> High-priority 20–30 minute delivery for urgent prescriptions and medical necessities.
              </li>
            </ul>
          </div>

          {/* Vertical 5: Salon Live Queue Token */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-emerald-100 text-xl text-emerald-700">
                ✂️
              </span>
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800 border border-emerald-200">
                Zero Waiting Time
              </span>
            </div>
            <h3 className="!mt-3 text-base font-extrabold text-slate-950">
              5. Salon &amp; Hair Studio Digital Queue Token
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Eliminate salon waiting queues. Book your digital token pass online from home:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              <li>
                <strong>Real-Time Seat Tracking:</strong> View exactly how many clients are ahead in line and live estimated wait minutes (~15–25m).
              </li>
              <li>
                <strong>Zero Waiting in Crowded Parlours:</strong> Arrive at the salon right when your chair is ready.
              </li>
              <li>
                <strong>Featured Partners:</strong> Looks &amp; Style Hair Studio, Roopam Herbal &amp; Glamour Touch Parlour.
              </li>
            </ul>
          </div>

          {/* Vertical 6: Car Wash Bay Scheduling */}
          <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-5 shadow-xs transition hover:shadow-md">
            <div className="flex items-center justify-between">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-indigo-100 text-xl text-indigo-700">
                🚗
              </span>
              <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold text-indigo-800 border border-indigo-200">
                Bay Reservation
              </span>
            </div>
            <h3 className="!mt-3 text-base font-extrabold text-slate-950">
              6. Automobile Foam Wash &amp; Detailing Bay
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Pre-book Bay 1 or Bay 2 for express pressure foam washing and interior detailing:
            </p>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              <li>
                <strong>Scheduled Wash Bays:</strong> Avoid roadside traffic and long vehicle queues.
              </li>
              <li>
                <strong>Complete Care:</strong> High-pressure foam wash, underbody rinse, interior vacuuming &amp; tire dressing.
              </li>
              <li>
                <strong>Featured Outlets:</strong> Speed Shine Car Wash &amp; Detailing, MRF Tyre Care &amp; Automobile Garage.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Merchant Countertop QR & Google Reviews ── */}
      <div className="my-6 rounded-3xl border border-blue-200 bg-blue-50/60 p-6 text-slate-900 shadow-xs">
        <h2 className="!mt-0 flex items-center gap-2 text-lg font-black text-blue-950">
          <span>⭐</span> Smart Merchant Countertop QR Standees &amp; 100% Genuine Google Reviews
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-700">
          In addition to doorstep delivery, Trustit empowers brick-and-mortar merchants with premium acrylic QR standees.
          Every review submitted via Trustit requires an in-person physical scan at the merchant&apos;s checkout counter,
          preventing fake reviews, paid spam, and competitor attacks while boosting the merchant&apos;s Google Maps rank organically.
        </p>
      </div>

      {/* ── Delivery Zones in Bahraich ── */}
      <div className="my-6">
        <h2 className="text-xl font-extrabold text-slate-950">
          Localities &amp; Landmarks Covered Across Bahraich (UP-40)
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Trustit delivery riders actively service all primary residential, commercial, and college sectors across the city:
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 my-4 text-xs font-semibold text-slate-800">
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 KDC (Kisan Degree College)</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Mastan Complex</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Ghanta Ghar &amp; Sarafa Bazaar</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Civil Lines &amp; Stadium Ground</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Chhawni Chauraha &amp; Nanpara Stand</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Brahmnipura &amp; Derapurwa</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Hospital Road &amp; District Hospital</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Medical College Bahraich</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Station Road &amp; Bus Stand</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Lucknow Road &amp; Rajeev Chauk</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Qanoongopura &amp; Salarganj</div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200 shadow-2xs">📍 Peepal Chauraha &amp; Dargah Road</div>
        </div>
      </div>

      {/* ── SEO Search Queries & Keywords Index ── */}
      <div className="my-6 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
        <h2 className="!mt-0 text-base font-extrabold text-slate-950">
          Official Bahraich Delivery &amp; High-Intent Keywords Index
        </h2>
        <p className="text-xs text-slate-600 mt-1">
          Google Search, Gemini AI, and local shoppers discover Trustit for the following targeted search queries:
        </p>
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-700">
          {[
            "Online Food Delivery Bahraich",
            "Swiggy Bahraich",
            "Zomato Bahraich",
            "Blinkit Bahraich",
            "Zepto Bahraich",
            "Trusted Food Delivery",
            "Trusted Home Delivery",
            "Trusted Order",
            "Deliciated Cafe Bahraich Crispy Corn",
            "Madhuram Restaurant Bahraich",
            "Royal Awadh Dum Biryani Bahraich",
            "Pizza Delivery Bahraich",
            "Cake Delivery Bahraich",
            "Home Delivery Grocery Bahraich",
            "Kirana Delivery Bahraich",
            "Milk Delivery Bahraich",
            "Medicine Home Delivery Bahraich",
            "Chemist Delivery Bahraich",
            "Cash on Delivery Food Bahraich",
            "Pure Veg Restaurant Bahraich",
            "Fast Food Delivery Bahraich",
            "Trustit Delivery Rider Partner Bahraich",
            "KDC Bahraich Food Delivery",
            "Ghanta Ghar Bahraich Sweet Delivery",
            "Best Restaurants in Bahraich UP",
            "Trustit Super-App Storefront",
          ].map((kw) => (
            <span key={kw} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 shadow-2xs">
              {kw}
            </span>
          ))}
        </div>
      </div>

      {/* ── Business & Operator Info ── */}
      <div className="mt-8 pt-6 border-t border-slate-200 text-xs text-slate-600 space-y-2">
        <h2 className="!mt-0 text-sm font-bold text-slate-900">Business Operator &amp; Compliance</h2>
        <p>{trustitPublicInfo.legalName ?? "The legal operator name has not yet been configured for publication."}</p>
        <p>{trustitPublicInfo.businessAddress ?? "The operator's business address has not yet been configured for publication."}</p>
        <p>
          Explore our{" "}
          <Link href="/order" className="text-blue-600 font-bold hover:underline">
            Online Food &amp; Super-App Storefront
          </Link>
          ,{" "}
          <Link href="/rider" className="text-blue-600 font-bold hover:underline">
            Rider Partner App
          </Link>
          ,{" "}
          <Link href="/trustit" className="text-blue-600 font-bold hover:underline">
            Merchant Platform
          </Link>
          , <Link href="/pricing">Plans and Pricing</Link>, <Link href="/privacy-policy">Privacy Policy</Link>, and{" "}
          <Link href="/contact">Contact Information</Link>.
        </p>
      </div>
    </TrustitPublicPage>
  );
}
