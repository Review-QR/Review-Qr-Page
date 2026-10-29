import type { Metadata } from "next";
import Link from "next/link";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({
  title: "About Trustit | Bahraich's Hyperlocal Super-App, Dedicated Rider Fleet & Food Delivery",
  description:
    "Trustit is Bahraich's official hyperlocal super-app operating its own dedicated delivery rider fleet (like Swiggy, Zomato & Blinkit). We deliver restaurant food, pure sweets, groceries, fresh milk, and medicines straight to your doorstep in 25–35 minutes with 4-digit OTP handover.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <TrustitPublicPage
      title="About Trustit"
      intro="Trustit is Bahraich's unified hyperlocal super-app, fast doorstep delivery fleet, and smart local merchant ecosystem."
    >
      {/* ── Core Clarification: Dedicated Delivery Rider Fleet ── */}
      <div className="my-6 rounded-2xl border-2 border-amber-300 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-100/60 p-5 text-slate-900 shadow-sm">
        <h2 className="!mt-0 flex items-center gap-2 text-lg font-black text-amber-950">
          <span>🛵</span> Dedicated Delivery Fleet (हम खुद अपने राइडर्स से घर तक डिलीवरी करते हैं)
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-800">
          <strong>महत्वपूर्ण स्पष्टीकरण:</strong> Trustit केवल एक क्यूआर कोड या डायरेक्टरी वेबसाइट नहीं है। जैसे स्विगी (Swiggy),
          ज़ोमैटो (Zomato) और ब्लिंकिट (Blinkit) के अपने डिलीवरी राइडर्स होते हैं, <strong>ठीक उसी तरह Trustit की अपनी समर्पित और एक्टिव
          डिलीवरी राइडर फ्लीट (Dedicated Delivery Rider Fleet) है</strong>।
        </p>
        <p className="mt-2 text-sm leading-relaxed text-slate-800">
          Trustit पर जब कोई ग्राहक ऑर्डर करता है, तो दुकानदार को खुद डिलीवरी नहीं करनी पड़ती। हमारे वेरिफाइड राइडर्स तुरंत
          रेस्टोरेंट या दुकान पर पहुँचकर आर्डर कलेक्ट करते हैं और <strong>25 से 35 मिनट के अंदर</strong> ग्राहक के दरवाजे तक
          पूरी स्वच्छता, मेहनत और <strong>4-डिजिट डिलीवरी OTP</strong> के साथ सुरक्षित डिलीवरी पहुँचाते हैं।
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold">
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 rounded-xl bg-orange-600 px-4 py-2 text-white shadow-sm hover:bg-orange-700"
          >
            <span>⚡ Open Super-App Storefront</span>
          </Link>
          <Link
            href="/rider"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-white shadow-sm hover:bg-slate-800"
          >
            <span>🛵 Trustit Rider Partner Fleet</span>
          </Link>
          <Link
            href="/order?store=Deliciated+Cafe"
            className="inline-flex items-center gap-1.5 rounded-xl bg-white border border-amber-300 px-3 py-2 text-slate-900 hover:bg-amber-100"
          >
            <span>🍟 Deliciated Cafe (Crispy Corn &amp; Fast Food)</span>
          </Link>
        </div>
      </div>

      {/* ── 6 Core Super-App Verticals ── */}
      <h2>What Trustit Provides: Our 6 Core Super-App Verticals</h2>
      <p>
        Trustit unites all daily local commerce across Bahraich and Uttar Pradesh into one seamless super-app:
      </p>

      <h3>1. Online Food &amp; Sweets Delivery (Swiggy &amp; Zomato Equivalent for Bahraich)</h3>
      <p>
        Order hot meals, pure desi ghee sweets, bakery items, cakes, and fast food from Bahraich&apos;s most loved food destinations:
      </p>
      <ul>
        <li>
          <strong>Deliciated Cafe (Opp. KDC College, Mastan Complex):</strong> Famous for Crispy Corn, Veg Grilled Sandwich, Burgers, Cold Coffee &amp; Fries.
        </li>
        <li>
          <strong>Madhuram Pure Veg Restaurant (Ghanta Ghar, Sarafa Bazaar):</strong> Masala Dosa, Sambhar, Chole Bhature, Paneer Tikka &amp; Thali.
        </li>
        <li>
          <strong>Royal Awadh Dum Biryani Corner (Station Road, Bus Stand):</strong> Special Chicken Dum Biryani, Galawati Kebab with Paratha.
        </li>
        <li>
          <strong>Ramji Lal Mithai Bhandar (Chhawni Chauraha, Nanpara Road):</strong> Balushahi (Desi Ghee), Mathura Peda, Dahi Jalebi Combo.
        </li>
        <li>
          <strong>Pizza Nation &amp; Burger Hub (Main Market, Opp. Ghanta Ghar):</strong> Farmhouse Cheese Pizza, Crispy Burgers &amp; Shakes.
        </li>
        <li>
          <strong>The Cake Hub &amp; Shankar Cake World (Brahmnipura &amp; Station Road):</strong> Dutch Chocolate Truffle Cake, Birthday Cakes &amp; Pastries.
        </li>
        <li>
          <strong>Live Order Tracking &amp; KOT:</strong> Real-time cooking countdown timer, Kitchen Order Ticket (KOT), and doorstep OTP verification.
        </li>
      </ul>

      <h3>2. Quick Kirana, Grocery &amp; Ration Delivery (Blinkit &amp; Zepto Equivalent)</h3>
      <p>
        Get your daily groceries delivered straight from verified local supermarkets:
      </p>
      <ul>
        <li>
          <strong>Daily Essentials:</strong> Ashirvaad Atta, Fortune Mustard Oil, Fortune Refined, Desi Ghee, Sugar, Tea (Chai Patti), Daal, Rice &amp; Spices.
        </li>
        <li>
          <strong>Snacks &amp; Instant Food:</strong> Maggi, Biscuits, Chips, Namkeen, Cold Drinks &amp; Packaged Juices.
        </li>
        <li>
          <strong>Handwritten Parcha Upload:</strong> Simply take a photo of your handwritten grocery list (पर्चा) and upload it—Trustit riders assemble and deliver the entire list directly to your doorstep.
        </li>
      </ul>

      <h3>3. Fresh Dairy, Paneer &amp; Milk Delivery (Country Delight Equivalent)</h3>
      <p>
        Fresh morning and evening dairy supplies directly from local dairy farms:
      </p>
      <ul>
        <li>Fresh Cow Milk &amp; Buffalo Milk (गायों और भैंसों का शुद्ध ताजा दूध)</li>
        <li>Fresh Malai Paneer, Thick Dahi (दही), Pure Khoya &amp; Fresh Rabdi</li>
        <li>Dedicated early morning and evening delivery time slots.</li>
      </ul>

      <h3>4. Medicine, Pharmacy &amp; Healthcare Home Delivery (Apollo &amp; 1mg Equivalent)</h3>
      <p>
        Emergency healthcare delivered with urgent priority:
      </p>
      <ul>
        <li>Prescription medicines from verified local chemists and pharmacies.</li>
        <li>Fever, cold, pain-relief tablets, digestive care, first-aid, ORS &amp; band-aids.</li>
        <li>Baby care products, diapers, baby milk formula, sanitizers, and daily wellness items.</li>
      </ul>

      <h3>5. Digital Salon &amp; Parlour Queue Token (Zero Waiting Time)</h3>
      <p>
        Book your live digital token pass from home. See how many customers are ahead of you in real-time, and arrive at the salon right when your chair is ready. No more waiting 1–2 hours in crowded barber shops!
      </p>

      <h3>6. Car Wash &amp; Bike Foam Wash Bay Scheduling</h3>
      <p>
        Reserve Bay 1 or Bay 2 in advance for express foam washing, vacuum cleaning, and auto detailing without waiting in road queues.
      </p>

      {/* ── Merchant Reputation & Smart QR ── */}
      <h2>Smart Countertop Merchant QR Standees &amp; 100% Real Google Reviews</h2>
      <p>
        In addition to doorstep delivery, Trustit empowers brick-and-mortar merchants with premium acrylic QR standees.
        Every review submitted via Trustit requires an in-person physical scan at the merchant&apos;s checkout counter,
        preventing fake reviews, paid spam, and competitor attacks while boosting the merchant&apos;s Google Maps rank.
      </p>

      {/* ── Delivery Zones in Bahraich ── */}
      <h2>Areas &amp; Landmarks Covered in Bahraich (UP-40)</h2>
      <p>
        Trustit delivery riders actively operate across all major localities in Bahraich:
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 my-4 text-xs font-semibold text-slate-800">
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 KDC (Kisan Degree College)</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Mastan Complex</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Ghanta Ghar &amp; Sarafa Bazaar</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Civil Lines &amp; Stadium Ground</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Chhawni Chauraha &amp; Nanpara Stand</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Brahmnipura &amp; Derapurwa</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Hospital Road &amp; District Hospital</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Medical College Bahraich</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Station Road &amp; Bus Stand</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Lucknow Road &amp; Rajeev Chauk</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Qanoongopura &amp; Salarganj</div>
        <div className="p-2 rounded-lg bg-slate-100 border border-slate-200">📍 Peepal Chauraha &amp; Dargah Road</div>
      </div>

      {/* ── SEO Search Queries & Keywords Index ── */}
      <h2>Official Bahraich Delivery &amp; Search Keywords Index</h2>
      <p className="text-xs text-slate-600">
        Google Search, Gemini AI, and local shoppers map Trustit for the following high-intent queries:
      </p>
      <div className="my-3 flex flex-wrap gap-1.5 text-[11px] font-medium text-slate-700">
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
          <span key={kw} className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5">
            {kw}
          </span>
        ))}
      </div>

      {/* ── Business & Operator Info ── */}
      <h2>Business Operator &amp; Compliance</h2>
      <p>{trustitPublicInfo.legalName ?? "The legal operator name has not yet been configured for publication."}</p>
      <p>{trustitPublicInfo.businessAddress ?? "The operator's business address has not yet been configured for publication."}</p>
      <p>
        Explore our <Link href="/order" className="text-blue-600 font-bold hover:underline">Online Food &amp; Super-App Storefront</Link>,{" "}
        <Link href="/rider" className="text-blue-600 font-bold hover:underline">Rider Partner App</Link>,{" "}
        <Link href="/trustit" className="text-blue-600 font-bold hover:underline">Merchant Platform</Link>,{" "}
        <Link href="/pricing">Plans and Pricing</Link>, <Link href="/privacy-policy">Privacy Policy</Link>, and{" "}
        <Link href="/contact">Contact Information</Link>.
      </p>
    </TrustitPublicPage>
  );
}
