import type { Metadata } from "next";
import Link from "next/link";
import { TrustitPublicPage } from "@/app/components/trustit-public-page";
import { trustitInformationMetadata, trustitPublicInfo } from "@/lib/trustit-public-info";

export const metadata: Metadata = trustitInformationMetadata({
  title: "About Trustit | Bahraich's Hyperlocal Super-App & Dedicated Delivery Fleet",
  description:
    "Trustit is Bahraich's unified hyperlocal super-app operating its own dedicated delivery rider fleet. Championing 'Vocal for Local'—bringing your favorite neighborhood restaurants, trusted kirana stores, fresh dairy, and urgent medicines straight to your doorstep in 25–35 minutes with 4-digit OTP handover.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <TrustitPublicPage
      title="About Trustit"
      intro="Bahraich's unified hyperlocal super-app, dedicated delivery rider fleet, and verified neighborhood commerce ecosystem."
    >
      {/* ── Brand Manifesto Header ── */}
      <div className="border-b border-slate-100 pb-8 pt-2">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-700">
          The Trustit Manifesto · Vocal for Local
        </p>
        <h2 className="!mt-3 text-2xl font-black tracking-tight text-slate-950 sm:text-3xl lg:text-4xl">
          Should Tier-2 Cities Ever Have to Settle for Less?
        </h2>
        <p className="mt-4 text-base font-medium leading-relaxed text-slate-600 sm:text-lg">
          Our unequivocal answer is: <strong className="text-slate-900">Never.</strong>
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
          In metropolitan hubs like Bengaluru, Delhi, or Lucknow, everyday convenience has become second nature. 
          When families crave dinner, run out of kitchen essentials, or need emergency medicines, a courier partner 
          arrives at their doorstep in 25 minutes. 
        </p>
        <p className="mt-3 text-sm leading-relaxed text-slate-700 sm:text-base">
          Yet in vibrant regional cities like Bahraich, families were still expected to navigate congested streets in 
          scorching summer heat or winter fog, stand in crowded checkout queues, wait for hours on salon benches, or 
          worry about delivery reliability.
        </p>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-900 sm:text-base">
          Trustit was born to bridge this exact divide. We believe every household in Bahraich deserves the speed, 
          dignity, hygiene, and technological convenience of a modern metropolis—without sacrificing the warmth and 
          authenticity of our local heritage.
        </p>
      </div>

      {/* ── Key Pillars Strip ── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 my-8">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center">
          <div className="text-2xl">⚡</div>
          <div className="mt-2 text-xs font-black text-slate-950">25–35 Min Speed</div>
          <p className="mt-0.5 text-[11px] text-slate-500">Punctual doorstep dispatch</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center">
          <div className="text-2xl">🛡️</div>
          <div className="mt-2 text-xs font-black text-slate-950">4-Digit Secret OTP</div>
          <p className="mt-0.5 text-[11px] text-slate-500">Guaranteed secure handover</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center">
          <div className="text-2xl">🛵</div>
          <div className="mt-2 text-xs font-black text-slate-950">Dedicated Rider Fleet</div>
          <p className="mt-0.5 text-[11px] text-slate-500">Our own trained partners</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-center">
          <div className="text-2xl">🏪</div>
          <div className="mt-2 text-xs font-black text-slate-950">Vocal for Local</div>
          <p className="mt-0.5 text-[11px] text-slate-500">Real shops, no dark stores</p>
        </div>
      </div>

      {/* ── Vocal for Local Philosophy: No Dark Stores, Real Merchants ── */}
      <div className="my-8 rounded-3xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-blue-50/40 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-blue-600 text-lg font-black text-white">
            ★
          </span>
          <div>
            <h3 className="!mt-0 text-lg font-black text-blue-950 sm:text-xl">
              Championing &apos;Vocal for Local&apos;: Why We Reject Dark Stores
            </h3>
            <p className="text-xs text-blue-700 font-medium">
              Empowering neighborhood merchants instead of faceless corporate warehouses
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-700">
          <p>
            Large conglomerates often operate from opaque, windowless &ldquo;dark stores&rdquo; and centralized warehouses, 
            undermining local mom-and-pop businesses. <strong>Trustit takes the exact opposite approach.</strong>
          </p>
          <p>
            We believe the true backbone of our city is its hardworking local merchants. The neighborhood general store 
            that your family has trusted for generations; the beloved local restaurant whose dining tables you frequent 
            every weekend; the certified neighborhood pharmacist who knows your family&apos;s healthcare history—these 
            are the genuine pillars of community commerce.
          </p>
          <p className="font-semibold text-slate-900">
            Trustit gives these authentic local merchants the high-speed technological wings they need to thrive. 
            When you place an order on Trustit, you are directly supporting local entrepreneurship while enjoying 
            seamless doorstep convenience.
          </p>
        </div>
      </div>

      {/* ── Real Human Situations: Everyday Life Made Effortless ── */}
      <div className="my-10 space-y-8">
        <div className="border-b border-slate-100 pb-4">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Daily Life, Redefined</p>
          <h3 className="!mt-1 text-xl font-black text-slate-950 sm:text-2xl">
            Where Modern Convenience Meets Everyday Needs
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            Trustit is not merely an app; it is the everyday lifeline designed around real family moments.
          </p>
        </div>

        {/* 1. The Familiar Restaurant Dining Table, Now in Your Home */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-orange-100 text-2xl">
              🍽️
            </span>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-950 sm:text-lg">
                Your Favorite Restaurant Table, Served at Your Living Room
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                Think of that favorite local diner or cafe where you regularly sit with your loved ones to celebrate 
                weekends. On days when weather is harsh, workloads are heavy, or you simply wish to unwind at home, you 
                should not have to compromise on that signature taste.
              </p>
              <p className="text-xs font-semibold text-slate-800">
                Order your favorite dishes from your chosen local restaurant, freshly prepared to order, insulated in thermal 
                delivery bags, and served piping hot at your dinner table in 25–35 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* 2. Handwritten Kirana Parcha Upload */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-purple-100 text-2xl">
              📝
            </span>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-950 sm:text-lg">
                Your Trusted Kirana Store &amp; The Handwritten Grocery Parcha
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                Typing dozens of grocery items into a digital cart is tedious. We preserved the authentic way households 
                actually shop: simply write down your monthly ration or daily staples on a piece of paper, snap a photo, 
                and select your preferred neighborhood grocery store.
              </p>
              <p className="text-xs font-semibold text-slate-800">
                Your trusted merchant personally reviews the list, packs your preferred brands, generates the exact bill, 
                and our rider delivers the entire package directly to your kitchen.
              </p>
            </div>
          </div>
        </div>

        {/* 3. Care for Elders & Urgent Healthcare */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-2xl">
              💊
            </span>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-950 sm:text-lg">
                Elderly Care &amp; Express Prescription Healthcare Delivery
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                When elderly parents run out of vital medications, or a child suddenly develops a fever late in the evening, 
                stepping out in harsh weather or leaving family unattended is distressing.
              </p>
              <p className="text-xs font-semibold text-slate-800">
                Upload your doctor&apos;s prescription to verified local chemists. Trustit riders handle medical orders 
                with urgent priority, delivering essential prescriptions, baby care, and first-aid supplies within 20–25 minutes.
              </p>
            </div>
          </div>
        </div>

        {/* 4. Evening Cravings & Unexpected Guests */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-100 text-2xl">
              ☕
            </span>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-950 sm:text-lg">
                Evening Cravings, Work Snacks &amp; Unexpected Guests
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                Returning home exhausted after a long workday, entertaining surprise relatives who just dropped by, or 
                satisfying late-afternoon tea cravings with artisanal snacks—Trustit eliminates the stress of rushing to 
                the marketplace. Everything you need arrives promptly and effortlessly.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Farm-Fresh Dairy & Morning Cold-Chain */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sky-100 text-2xl">
              🥛
            </span>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-950 sm:text-lg">
                Farm-Fresh Dairy, Pure Milk &amp; Cold-Chain Purity
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                Ensuring pure, unadulterated milk for your children and family should never be a gamble. Trustit coordinates 
                with verified local dairy farms to deliver pure cow and buffalo milk, artisanal malai paneer, and thick 
                set curd in scheduled morning and evening windows straight to your doorstep.
              </p>
            </div>
          </div>
        </div>

        {/* 6. Digital Queue Pass for Salons & Grooming */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-emerald-100 text-2xl">
              ✂️
            </span>
            <div className="space-y-2">
              <h4 className="text-base font-extrabold text-slate-950 sm:text-lg">
                Zero-Wait Digital Queue Passes for Salons &amp; Hair Studios
              </h4>
              <p className="text-sm leading-relaxed text-slate-600">
                Wasting your precious Sunday waiting for 1 to 2 hours in a packed barber shop or salon lounge is a thing 
                of the past. Claim a digital queue token from home, check live seat availability and wait times on your phone, 
                and arrive right when your styling chair is ready.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dedicated Delivery Fleet Section: Our Operational Guarantee ── */}
      <div className="my-10 rounded-3xl border-2 border-amber-300 bg-gradient-to-br from-amber-50 via-orange-50/70 to-amber-100/50 p-6 sm:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-amber-500 text-xl text-white shadow-sm">
            🛵
          </span>
          <div>
            <h3 className="!mt-0 text-lg font-black text-amber-950 sm:text-xl">
              Our Operational Guarantee: 100% Dedicated Delivery Rider Fleet
            </h3>
            <p className="text-xs font-semibold text-amber-800">
              Never dependent on merchant staff, never left to uncoordinated WhatsApp messages
            </p>
          </div>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-relaxed text-slate-800">
          <p>
            A common pain point with traditional local ordering has been broken delivery promises—shopkeepers struggling 
            to spare staff, or unverified riders causing delays.
          </p>
          <p>
            <strong>Trustit operates its own active, dedicated delivery fleet.</strong> Our delivery partners are polite, 
            uniformed, and equipped with thermal-insulated bags. The moment a merchant finishes packing an order, our 
            system routes the nearest available rider for immediate pickup.
          </p>
          <p className="font-semibold text-slate-900">
            Every handover is guarded by a 4-Digit Secret OTP. Only after you physically inspect your parcel and share your 
            OTP with the rider is the delivery marked complete. Zero ambiguity, total peace of mind.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 text-xs font-bold">
          <Link
            href="/order"
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-3 text-white shadow-sm transition hover:brightness-105"
          >
            <span>⚡ Open Super-App Storefront</span>
          </Link>
          <Link
            href="/rider"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-3 text-white shadow-sm transition hover:bg-slate-800"
          >
            <span>🛵 Join as Rider Partner</span>
          </Link>
          <Link
            href="/trustit"
            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-white px-4 py-3 text-slate-900 shadow-2xs hover:bg-amber-100"
          >
            <span>🏪 Register Your Business</span>
          </Link>
        </div>
      </div>

      {/* ── Merchant Reputation & Smart QR Standees ── */}
      <div className="my-8 rounded-3xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8">
        <h3 className="!mt-0 text-lg font-black text-slate-950 sm:text-xl">
          Empowering Local Merchants: Countertop Acrylic QR Standees &amp; 100% Genuine Reviews
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-slate-600">
          Beyond doorstep logistics, Trustit provides local businesses with smart acrylic QR standees for their checkout 
          counters. Every customer review submitted through Trustit requires an authentic, in-person scan at the physical 
          outlet—permanently safeguarding honest local merchants from malicious competitor attacks and paid spam while 
          elevating their organic Google Maps ranking.
        </p>
      </div>

      {/* ── Mission & Vision ── */}
      <div className="my-10 grid gap-6 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-700">Our Mission</p>
          <h4 className="mt-2 text-lg font-extrabold text-slate-950">To Deliver Everyday Dignity &amp; Speed</h4>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
            To empower Tier-2 and regional Indian cities with lightning-fast, hygienic, and courteous doorstep delivery 
            within 30 minutes, keeping trusted local merchants at the heart of community commerce.
          </p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/60 p-6 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Our Vision</p>
          <h4 className="mt-2 text-lg font-extrabold text-slate-950">To Prove That Local is Truly Global</h4>
          <p className="mt-3 text-xs leading-relaxed text-slate-600 sm:text-sm">
            To build a resilient hyperlocal infrastructure where regional towns enjoy the world-class technological 
            convenience of global metropolises, proving that &apos;Vocal for Local&apos; is the future of Indian commerce.
          </p>
        </div>
      </div>

      {/* ── Legal & Compliance Footer ── */}
      <div className="mt-10 border-t border-slate-200 pt-6 text-xs text-slate-600 space-y-2">
        <h4 className="text-sm font-bold text-slate-900">Corporate Compliance &amp; Operator Notice</h4>
        <p>{trustitPublicInfo.legalName ?? "Trustit Hyperlocal Technologies · Operating in Bahraich (UP-40)."}</p>
        <p>{trustitPublicInfo.businessAddress ?? "Registered Operational Hub: Bahraich, Uttar Pradesh 271801."}</p>
        <p className="pt-2">
          Explore our{" "}
          <Link href="/order" className="text-blue-600 font-bold hover:underline">
            Online Food &amp; Super-App Storefront
          </Link>
          ,{" "}
          <Link href="/rider" className="text-blue-600 font-bold hover:underline">
            Rider Partner Portal
          </Link>
          ,{" "}
          <Link href="/trustit" className="text-blue-600 font-bold hover:underline">
            Merchant Solutions
          </Link>
          , <Link href="/pricing">Plans &amp; Pricing</Link>, <Link href="/privacy-policy">Privacy Policy</Link>, and{" "}
          <Link href="/contact">Contact Support</Link>.
        </p>
      </div>
    </TrustitPublicPage>
  );
}
