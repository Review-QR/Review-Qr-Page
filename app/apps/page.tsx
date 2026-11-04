"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function AppsHubInstallationPage() {
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  // Dynamic origin so it works seamlessly on https://trustitreview.com on 4G/5G mobile internet
  const [baseUrl, setBaseUrl] = useState<string>("https://trustitreview.com");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setBaseUrl(window.location.origin);
    }
  }, []);

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2500);
  };

  const apps = [
    {
      id: "merchant",
      title: "Trustit Merchant Partner",
      subtitle: "For Shopkeepers, Cafe Owners & Counter POS",
      color: "from-amber-500 to-orange-600",
      accentBg: "bg-amber-50 border-amber-200 text-amber-900",
      icon: "/merchant-icon-192.png",
      apkUrl: "/downloads/Trustit-Merchant-Partner.apk",
      launchUrl: "/partner",
      manifestUrl: "/api/manifest/merchant",
      features: [
        "Store KYC & Category Selection Wizard",
        "Lifetime Free Review QR Standee (5 Themes)",
        "Add Items to Menu & Live Counter POS",
        "Loud 880Hz Kitchen Siren & 80mm KOT Print",
        "Cashfree Nodal Bank Settlement (0% Commission)",
      ],
      setupStep: "Step 1: Open, choose business type (Cafe/Kirana) and create Merchant Profile.",
    },
    {
      id: "customer",
      title: "Trustit Customer Super-App",
      subtitle: "For Local Consumers in Bahraich",
      color: "from-blue-600 to-indigo-600",
      accentBg: "bg-blue-50 border-blue-200 text-blue-900",
      icon: "/customer-icon-192.png",
      apkUrl: "/downloads/Trustit-Customer.apk",
      launchUrl: "/order",
      manifestUrl: "/api/manifest/customer",
      features: [
        "Browse local stores & Kirana Mandi rates",
        "Upload handwritten Kirana Parcha",
        "Contactless Cashfree UPI Checkout (GPay/PhonePe)",
        "Live GPS Order & Rider Tracking",
        "Doorstep 4-digit Delivery OTP Verification",
      ],
      setupStep: "Step 2: Open, select delivery address and place order for items added by merchant.",
    },
    {
      id: "rider",
      title: "Trustit Rider Fleet Partner",
      subtitle: "For Delivery Executives & Bike Fleet",
      color: "from-emerald-600 to-teal-700",
      accentBg: "bg-emerald-50 border-emerald-200 text-emerald-900",
      icon: "/rider-icon-192.png",
      apkUrl: "/downloads/Trustit-Rider-Partner.apk",
      launchUrl: "/rider",
      manifestUrl: "/api/manifest/rider",
      features: [
        "Rider DL, Bike & Live Selfie KYC",
        "Go Online / Offline Duty Switch",
        "Loud 960Hz Proximity Radar Sound Alert",
        "Counter Pickup Ding-Dong Bell Handover",
        "Instant UPI Settlement (₹35 base + ₹10 surge = ₹45)",
      ],
      setupStep: "Step 3: Open, complete KYC, toggle Duty Online and accept the incoming order.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0B132B] text-slate-100 font-sans p-4 sm:p-8 pb-24 selection:bg-blue-600 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="bg-[#1C2541] border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Cloud Internet Live · Works on Any 4G/5G Network
              </span>
              <span className="text-xs font-mono font-bold text-amber-300 bg-amber-500/20 px-2.5 py-0.5 rounded-full border border-amber-500/40">
                No Same Wi-Fi Needed · Public Online Mode
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white mt-2 tracking-tight">
              📲 Install Trustit on Your Phone (All 3 Apps)
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Real ground pilot test: Merchant in shop, Customer at home, and Rider on the road — sabhi apps mobile data / 4G / 5G par cloud database se live communicate karte hain!
            </p>
          </div>

          {/* Quick Wi-Fi Scan & Info */}
          <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-2xl text-center shrink-0 w-full md:w-auto">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block mb-1">
              📱 Open on Your Phone:
            </span>
            <code className="text-sm font-mono font-black text-emerald-400 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 block select-all">
              {baseUrl}/apps
            </code>
            <button
              type="button"
              onClick={() => copyToClipboard(`${baseUrl}/apps`)}
              className="mt-2 text-xs font-bold text-slate-300 hover:text-white underline cursor-pointer"
            >
              {copiedUrl ? "✓ Copied to clipboard!" : "Copy Mobile URL"}
            </button>
          </div>
        </div>

        {/* 2 Ways to Install Instruction Banner */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-emerald-950/70 to-slate-900 border border-emerald-500/40 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚡</span>
              <h3 className="text-sm font-black text-emerald-300">
                Method A: 1-Tap PWA Install (Instant &amp; Recommended)
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Phone ke Chrome browser me neeche diye link kholein ➔ 3 dots (⋮) par tap karein ➔ <strong>"Install App" / "Add to Home screen"</strong> dabayein. App ka icon phone screen par aa jayega aur full screen native app jaisa chalega!
            </p>
          </div>

          <div className="bg-gradient-to-r from-blue-950/70 to-slate-900 border border-blue-500/40 rounded-2xl p-4 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">📦</span>
              <h3 className="text-sm font-black text-blue-300">
                Method B: Direct APK File Download
              </h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Har app ke neeche <strong>"Download APK"</strong> button diya gaya hai. Seedha APK download karke install karein (Unknown Sources allow karein).
            </p>
          </div>
        </div>

        {/* The 3 Apps Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div
              key={app.id}
              className="bg-[#1C2541] border border-slate-700 rounded-3xl p-5 shadow-2xl flex flex-col justify-between space-y-5"
            >
              <div>
                {/* App Badge & Icon */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 p-1 flex items-center justify-center shrink-0 shadow-md">
                    <img
                      src={app.icon}
                      alt={app.title}
                      className="w-full h-full object-contain rounded-xl"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight">{app.title}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">{app.subtitle}</p>
                  </div>
                </div>

                {/* Profile Setup Instructions */}
                <div className="mt-4 bg-slate-900/90 border border-slate-700 rounded-2xl p-3 text-xs text-amber-300 font-medium">
                  {app.setupStep}
                </div>

                {/* Key Capabilities */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                    What You Can Test:
                  </span>
                  <ul className="space-y-1 text-xs text-slate-300">
                    {app.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center gap-1.5">
                        <span className="text-emerald-400 font-bold">✓</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-slate-700/80">
                {/* 1. Launch & Install PWA Button */}
                <Link
                  href={app.launchUrl}
                  className={`w-full py-3 rounded-2xl bg-gradient-to-r ${app.color} text-white font-black text-xs shadow-lg transition flex items-center justify-center gap-2 hover:opacity-95`}
                >
                  <span>🚀 Launch &amp; Install ({app.title.split(" ")[1]})</span>
                  <span>→</span>
                </Link>

                {/* 2. Download APK Button */}
                <a
                  href={app.apkUrl}
                  download
                  className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs transition flex items-center justify-center gap-2"
                >
                  <span>📥 Download Native APK (93 MB)</span>
                </a>

                {/* Phone Local Link Copy */}
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${baseUrl}${app.launchUrl}`)}
                  className="w-full text-center text-[11px] text-slate-400 hover:text-white transition py-1"
                >
                  {copiedUrl === `${baseUrl}${app.launchUrl}`
                    ? "✓ Copied phone link!"
                    : `Copy: ${baseUrl}${app.launchUrl}`}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Step-by-Step Testing Roadmap */}
        <div className="bg-[#1C2541] border border-slate-700 rounded-3xl p-6 shadow-2xl space-y-4">
          <h2 className="text-lg font-black text-white flex items-center gap-2">
            <span>📋 Aapka End-to-End Live Testing Protocol</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                1
              </span>
              <h4 className="font-black text-white text-sm">Merchant Profile</h4>
              <p className="text-slate-300">
                Merchant app kholkar business category chunein, dukaan ka naam &amp; WhatsApp OTP dalein. Counter QR Standee generate karein.
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs">
                2
              </span>
              <h4 className="font-black text-white text-sm">Add Item / Dish</h4>
              <p className="text-slate-300">
                Dashboard ke Menu/Products me jakar 1 naya item add karein (e.g. Masala Chai ₹20 ya Cold Coffee ₹99).
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-6 h-6 rounded-full bg-blue-500 text-white font-black flex items-center justify-center text-xs">
                3
              </span>
              <h4 className="font-black text-white text-sm">Customer Order</h4>
              <p className="text-slate-300">
                Customer app se dukaan kholein, wahi item cart me add karein aur Cashfree UPI se ₹ pay karein. Counter par 880Hz siren bajegi!
              </p>
            </div>

            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-700 space-y-2">
              <span className="w-6 h-6 rounded-full bg-emerald-500 text-slate-950 font-black flex items-center justify-center text-xs">
                4
              </span>
              <h4 className="font-black text-white text-sm">Rider Delivery</h4>
              <p className="text-slate-300">
                Rider app me radar alert aayega, accept karke store counter par jayenge, OTP verify karke doorstep deliver karenge!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
