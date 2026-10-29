import Link from "next/link";
import { Download, Bike, Store, ShoppingBag, CheckCircle, ShieldCheck, Smartphone, RefreshCw } from "lucide-react";

export const metadata = {
  title: "Download Trustit Android Apps | Customer, Rider & Merchant",
  description: "Download the official Trustit Android applications for Customers, Delivery Riders, and Merchant Partners in Bahraich.",
};

export default function AppPage() {
  const apps = [
    {
      id: "rider",
      title: "Trustit Rider Partner",
      badge: "Delivery Partner App",
      badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
      icon: Bike,
      iconBg: "bg-amber-500/20 text-amber-400",
      description: "राइडर भाइयों के लिए: 30s लाउड सायरन अलर्ट, नजदीकी दुकान से डिलीवरी, 4-डिजिट ऑर्डर ट्रैकिंग और इंस्टेंट UPI कमाई।",
      features: [
        "⚡ 30-Second Proximity Loud Radar Siren",
        "📍 0-3km Auto Escalation & GPS Ping",
        "🔢 Easy 4-Digit Order Code (#4492)",
        "💰 Instant Daily Earnings & Passbook",
      ],
      fileName: "Trustit-Rider-Partner.apk",
      downloadUrl: "/downloads/Trustit-Rider-Partner.apk",
      webUrl: "/rider",
      webLabel: "Open Web App",
      size: "2.1 MB",
      version: "v2.4.0 (Latest)",
    },
    {
      id: "merchant",
      title: "Trustit Merchant Console",
      badge: "Restaurant & Shop",
      badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      icon: Store,
      iconBg: "bg-blue-500/20 text-blue-400",
      description: "रेस्टोरेंट और स्टोर मालिकों के लिए: लाइव ऑर्डर बेल, KOT प्रिंटिंग, मेनू मैनेजमेंट और डायरेक्ट बैंक सेटलमेंट।",
      features: [
        "🔔 Incoming Order Loud Sound Alert",
        "🧾 4-Digit KOT Slips with Token Numbers",
        "🍲 1-Tap 'Food Ready' Rider Summoning",
        "📊 Cashfree Verified Paid Queue",
      ],
      fileName: "Trustit-Merchant-Partner.apk",
      downloadUrl: "/downloads/Trustit-Merchant-Partner.apk",
      webUrl: "/merchant/dashboard/orders",
      webLabel: "Open Console",
      size: "2.1 MB",
      version: "v2.4.0 (Latest)",
    },
    {
      id: "customer",
      title: "Trustit Customer App",
      badge: "Food & Grocery SuperApp",
      badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      icon: ShoppingBag,
      iconBg: "bg-emerald-500/20 text-emerald-400",
      description: "ग्राहकों के लिए: बहराइच के टॉप रेस्टोरेंट्स और किराना से 15-30 मिनट में सुपरफास्ट डिलीवरी और आसान UPI पेमेंट।",
      features: [
        "🍔 Deliciated Cafe & Local Stores Menu",
        "🚀 Live Rider Tracking on Map",
        "🔒 Secure Cashfree UPI Payments",
        "📧 1-Tap Gmail OTP Login & Saved Addresses",
      ],
      fileName: "Trustit-Customer.apk",
      downloadUrl: "/downloads/Trustit-Customer.apk",
      webUrl: "/order",
      webLabel: "Order Online Now",
      size: "2.1 MB",
      version: "v2.4.0 (Latest)",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-amber-400 selection:text-slate-950 pb-16">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-2.5 py-1 text-xs font-black text-slate-950 shadow-md">
              TRUSTIT
            </span>
            <span className="text-xs font-bold text-slate-400">Android App Store</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Cloud Sync
            </span>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="relative overflow-hidden px-4 pt-10 pb-6 text-center sm:px-6 sm:pt-14 sm:pb-10">
        <div className="mx-auto max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-bold text-amber-300">
            <Smartphone className="h-3.5 w-3.5" />
            Official Android APK Downloads (Bahraich City)
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Trustit <span className="text-amber-400">Updated Mobile Apps</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            अपने मोबाइल पर सीधे Trustit APK डाउनलोड करें। ये ऐप्स ऑटो-क्लाउड सिंक के साथ आती हैं, यानी हर नया फीचर बिना बार-बार इंस्टॉल किए तुरंत अपने आप अपडेट हो जाता है।
          </p>
        </div>
      </section>

      {/* App Cards Grid */}
      <main className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="grid gap-6 md:grid-cols-3">
          {apps.map((app) => {
            const Icon = app.icon;
            return (
              <div
                key={app.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl transition-all duration-200 hover:border-slate-700 hover:shadow-2xl"
              >
                <div className="space-y-4">
                  {/* Top Row */}
                  <div className="flex items-center justify-between">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${app.iconBg} shadow-inner`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${app.badgeColor}`}>
                      {app.badge}
                    </span>
                  </div>

                  {/* Title & Info */}
                  <div>
                    <h2 className="text-lg font-bold text-white">{app.title}</h2>
                    <p className="mt-1 text-xs text-slate-400 leading-relaxed">{app.description}</p>
                  </div>

                  {/* Features */}
                  <div className="space-y-1.5 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Key Highlights:
                    </span>
                    {app.features.map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Version & Size Meta */}
                  <div className="flex items-center justify-between border-t border-slate-800/60 pt-2 text-[10px] text-slate-400">
                    <span>Package: <strong className="text-slate-300">{app.size}</strong></span>
                    <span>Status: <strong className="text-emerald-400">{app.version}</strong></span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-5 space-y-2">
                  <a
                    href={app.downloadUrl}
                    download={app.fileName}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-4 py-2.5 text-xs font-black text-slate-950 shadow-lg shadow-amber-500/20 transition hover:from-amber-300 hover:to-amber-400"
                  >
                    <Download className="h-4 w-4" />
                    Download APK ({app.size})
                  </a>
                  <Link
                    href={app.webUrl}
                    className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2 text-[11px] font-bold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    {app.webLabel} &rarr;
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* How to Install Guidance */}
        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-amber-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">मोबाइल में इनस्टॉल कैसे करें (Quick Guide)</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 text-xs text-slate-300">
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <span className="font-mono text-[10px] font-bold text-amber-400">STEP 1</span>
              <p className="font-semibold text-white">APK डाउनलोड करें</p>
              <p className="text-[11px] text-slate-400">ऊपर पीले बटन पर क्लिक करके अपने फोन में APK फ़ाइल सेव करें।</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <span className="font-mono text-[10px] font-bold text-amber-400">STEP 2</span>
              <p className="font-semibold text-white">Allow Permissions</p>
              <p className="text-[11px] text-slate-400">अगर क्रोम चेतावनी दे, तो <strong>"Download Anyway"</strong> और <strong>"Install from Unknown Sources"</strong> Allow करें।</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-3.5 space-y-1">
              <span className="font-mono text-[10px] font-bold text-amber-400">STEP 3</span>
              <p className="font-semibold text-white">GPS & Sound Allow करें</p>
              <p className="text-[11px] text-slate-400">ऐप खोलते ही लोकेशन की अनुमति दें ताकि नजदीकी ऑर्डर और सायरन बिल्कुल सही समय पर बजें।</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-amber-400/10 border border-amber-400/20 p-3 text-[11px] text-amber-300">
            <RefreshCw className="h-4 w-4 shrink-0 text-amber-400 animate-spin" />
            <span>
              <strong>स्मार्ट लाइव सिंक:</strong> यह ऐप ट्रस्टिट के लाइव क्लाउड सर्वर से जुड़ी है। जब भी नया अपडेट जारी होता है, ऐप को अनइंस्टॉल करने की आवश्यकता नहीं होती — ऐप खोलते ही नया वर्ज़न अपने आप लोड हो जाता है!
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}
