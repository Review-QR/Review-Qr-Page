import Link from "next/link";
import Image from "next/image";
import MerchantLoginForm from "./merchant-login-form";
import { merchantSignOutAction } from "./actions";
import { getActiveMerchant } from "@/lib/merchant-auth";

export const dynamic = "force-dynamic";

export default async function MerchantLoginPage() {
  const merchant = await getActiveMerchant();

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#eef4ff_0%,transparent_35%),radial-gradient(circle_at_92%_12%,#fff2d8_0%,transparent_30%),#f8fafc] text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-between p-4 sm:p-6 lg:p-8">
        {/* Top Navbar */}
        <header className="flex items-center justify-between py-2">
          <Link href="/trustit" className="flex items-center gap-2.5">
            <Image
              src="/trustit-icon.svg"
              alt="Trustit Logo"
              width={38}
              height={38}
              priority
              className="rounded-xl shadow-xs"
            />
            <span>
              <span className="block text-lg font-black tracking-tight text-slate-900">Trustit</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-blue-700">
                Merchant Partner Hub
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/order"
              className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 sm:inline-flex"
            >
              🛍️ Customer Portal
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700 transition"
            >
              Register Business →
            </Link>
          </div>
        </header>

        {/* Split Screen Container */}
        <div className="my-auto grid items-center gap-8 py-8 lg:grid-cols-12 lg:gap-12">
          {/* Left Column: Visual Showcase & Trust Elements */}
          <div className="space-y-6 lg:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50/80 px-3.5 py-1.5 text-xs font-bold text-blue-800 shadow-2xs backdrop-blur-xs">
              <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
              <span>बहराइच के स्थानीय व्यापार की डिजिटल शक्ति</span>
            </div>

            <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
              दुकान आपकी, <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent">
                डिजिटल स्पीड हमारी।
              </span>
            </h1>

            <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
              Trustit मर्चेंट कंसोल से अपने रेस्तरां का मेन्यू, किराना पर्चा बिलिंग, सैलून टोकन या कार वॉश स्लॉट्स को सीधे मैनेज करें। 25–35 मिनट की समर्पित डिलीवरी और 100% असली Google Reviews।
            </p>

            {/* Feature Highlights Grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-2xs backdrop-blur-xs">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-orange-50 text-xl text-orange-600">
                  🛵
                </span>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">25–35m डिलीवरी फ्लीट</h2>
                  <p className="mt-0.5 text-[11px] leading-tight text-slate-500">
                    आर्डर कन्फर्म होते ही नजदीकी राइडर दुकान पर पिकअप के लिए पहुँचेगा।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-2xs backdrop-blur-xs">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-xl text-blue-600">
                  🔔
                </span>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">लाउड साउंड अलर्ट्स</h2>
                  <p className="mt-0.5 text-[11px] leading-tight text-slate-500">
                    रसोई या काउंटर पर तेज बीप — व्यस्त समय में भी कभी कोई आर्डर नहीं छूटेगा।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-2xs backdrop-blur-xs">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-emerald-50 text-xl text-emerald-600">
                  📝
                </span>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">डिजिटल पर्चा कोटेशन</h2>
                  <p className="mt-0.5 text-[11px] leading-tight text-slate-500">
                    किराना व मेडिकल के लिए ग्राहक के हाथ के पर्चे पर सीधे बिल भेजें।
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-2xs backdrop-blur-xs">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-50 text-xl text-amber-600">
                  ⭐
                </span>
                <div>
                  <h2 className="text-xs font-bold text-slate-900">100% Genuine Reviews</h2>
                  <p className="mt-0.5 text-[11px] leading-tight text-slate-500">
                    स्मार्ट काउंटर QR स्टैंडी से ग्राहकों से सीधे 5-स्टार रेटिंग पाएं।
                  </p>
                </div>
              </div>
            </div>

            {/* Live Order Simulation Badge */}
            <div className="hidden rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50 p-3.5 sm:flex sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
                </span>
                <span className="text-xs font-black text-slate-800">
                  Live Dispatch Active: <span className="text-emerald-700">बहराइच के 11+ एक्टिव वेंडर्स लाइव आर्डर्स प्रोसेस कर रहे हैं</span>
                </span>
              </div>
              <span className="text-xs font-bold text-slate-600">⚡ Fast KOT</span>
            </div>
          </div>

          {/* Right Column: Secure Login Card */}
          <div className="lg:col-span-5">
            <section className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.12)]">
              <div className="text-center">
                <div
                  className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-lg font-black text-white shadow-md shadow-blue-200"
                  aria-hidden="true"
                >
                  QR
                </div>
                <p className="text-[11px] font-black uppercase tracking-wider text-blue-700">
                  Review-QR · Trustit
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-900">
                  {merchant ? "Merchant Sign-in Active" : "Merchant Sign In"}
                </h2>

                {merchant ? (
                  <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 text-center">
                    <span className="inline-block text-3xl">✅</span>
                    <h3 className="mt-2 text-sm font-bold text-slate-900">
                      Signed in as {merchant.businessName}
                    </h3>
                    <p className="mt-1 text-xs text-slate-600">
                      Business ID: <span className="font-mono font-bold text-blue-700">{merchant.businessId}</span>
                    </p>
                    <div className="mt-5 space-y-2.5">
                      <Link
                        href="/merchant/dashboard"
                        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-xs font-extrabold text-white shadow-xs hover:bg-blue-700 transition"
                      >
                        <span>Open Merchant Dashboard</span>
                        <span>→</span>
                      </Link>
                      <form action={merchantSignOutAction}>
                        <button className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">
                          Sign Out of Merchant Hub
                        </button>
                      </form>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-xs text-slate-500">
                      अपने 10-अंकों के मोबाइल नंबर या बिज़नेस ID से सुरक्षित लॉगिन करें।
                    </p>
                    <MerchantLoginForm />

                    <div className="mt-6 border-t border-slate-100 pt-5 text-center">
                      <p className="text-xs text-slate-600">
                        नया बिज़नेस रजिस्टर करना है?{" "}
                        <Link href="/register" className="font-extrabold text-blue-700 hover:underline">
                          Register New Business →
                        </Link>
                      </p>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <footer className="border-t border-slate-200/80 py-4 text-center text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Trustit Review-QR Partner Network. Bahraich, Uttar Pradesh.
          </p>
        </footer>
      </div>
    </main>
  );
}
