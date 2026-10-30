"use client";

import Link from "next/link";
import { useState } from "react";
import { buildTrustitQrImageUrl, buildTrustitReviewUrl, trustitAppOrigin } from "@/lib/trustit-qr";

type MerchantConsoleClientProps = {
  merchant: {
    businessId: string;
    businessName: string;
    businessType: string | null;
    ownerName: string | null;
    plan: string | null;
    locality: string | null;
    city: string | null;
    pincode: string | null;
    reviewLink: string | null;
    merchantStatus: string;
  };
  stats: {
    totalScans: number;
    totalCustomers: number;
    totalReviews: number;
    averageRating: number | null;
  };
  activity: { scan_date: string; scans: number | string }[];
  reviews: {
    review_id: string;
    rating: number;
    review_text: string;
    submitted_at: string;
  }[];
  subscriptionStatus: string;
};

type ModuleId =
  | "dashboard"
  | "business"
  | "orders"
  | "products"
  | "qr"
  | "standees"
  | "reviews"
  | "messages"
  | "analytics"
  | "subscription"
  | "payments"
  | "profile"
  | "support";

export default function MerchantConsoleClient({
  merchant,
  stats,
  activity,
  reviews,
  subscriptionStatus,
}: MerchantConsoleClientProps) {
  const [selectedModule, setSelectedModule] = useState<ModuleId>("dashboard");
  const [activityRange, setActivityRange] = useState<"7d" | "30d">("7d");
  const [toastMessage, setToastMessage] = useState<string>("");

  const reviewShortUrl = buildTrustitReviewUrl(trustitAppOrigin, merchant.businessId);
  const qrImageUrl = buildTrustitQrImageUrl(reviewShortUrl);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  }

  // QR Download Action
  function handleDownloadQr() {
    const a = document.createElement("a");
    a.href = qrImageUrl;
    a.download = `trustit-qr-${merchant.businessId}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast("✓ Downloading High-Resolution Trustit Standee QR (PNG)");
  }

  // QR Print Action
  function handlePrintQr() {
    window.print();
  }

  // QR Share Action
  async function handleShareQr() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${merchant.businessName} on Trustit`,
          text: `Scan and leave a Google review for ${merchant.businessName}!`,
          url: reviewShortUrl,
        });
        showToast("✓ Share dialog opened!");
        return;
      } catch {
        // user cancelled or share failed, fallback to clipboard
      }
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(reviewShortUrl);
      showToast("✓ Review link copied to clipboard!");
    } else {
      showToast(`Review URL: ${reviewShortUrl}`);
    }
  }

  const moduleItems: { id: ModuleId; label: string; icon: string; live?: boolean }[] = [
    { id: "dashboard", label: "Dashboard Overview", icon: "📊" },
    { id: "business", label: "My Business", icon: "🏪" },
    { id: "orders", label: "Orders & Bookings", icon: "🛍️", live: true },
    { id: "products", label: "Products & Services", icon: "📦" },
    { id: "qr", label: "My QR Code", icon: "📱" },
    { id: "standees", label: "QR Standees & Kits", icon: "🖼️" },
    { id: "reviews", label: "Customer Reviews", icon: "💬" },
    { id: "messages", label: "Message Designer", icon: "✍️" },
    { id: "analytics", label: "Analytics", icon: "📈" },
    { id: "subscription", label: "Subscription", icon: "👑" },
    { id: "payments", label: "Payments & UPI", icon: "💳" },
    { id: "profile", label: "Merchant Profile", icon: "👤" },
    { id: "support", label: "Support & Help", icon: "🎧" },
  ];

  return (
    <div className="mt-5 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 text-white px-4 py-2.5 text-xs font-bold shadow-xl border border-slate-700 animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* FULL-WIDTH HORIZONTAL MODULE SELECTOR STRIP (MATCHING RED BOX IN USER ANNOTATION) */}
      <div className="lg:col-span-12 bg-white border border-[#ede6dd] rounded-2xl p-2.5 shadow-2xs">
        <div className="flex items-center justify-between px-1.5 pb-2 mb-1.5 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>⚡</span> Merchant Operational Consoles
            </span>
            <span className="text-[10px] font-bold bg-[#85583f] text-white px-2 py-0.5 rounded-full">
              All 13 Modules Active
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Click any module to switch workspace view below
          </span>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scroll-smooth">
          {moduleItems.map((item) => {
            const isActive = selectedModule === item.id;
            return (
              <button
                key={`h-${item.id}`}
                type="button"
                onClick={() => setSelectedModule(item.id)}
                className={`whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shrink-0 ${
                  isActive
                    ? "bg-[#85583f] text-white shadow-xs"
                    : "text-slate-700 bg-slate-50 hover:bg-[#ede6dd] border border-slate-200/70"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.live && (
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse ml-0.5" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* LEFT: VERTICAL MODULES BUTTON LIST (13 ACTIVE BUTTONS) */}
      <div className="lg:col-span-3 bg-[#f7f3ec] border border-[#ede6dd] rounded-2xl p-3 shadow-2xs">
        <div className="px-2 py-1 mb-2 flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Merchant Modules</span>
          <span className="text-[9px] font-bold bg-[#85583f] text-white px-1.5 py-0.5 rounded">All Active</span>
        </div>

        <div className="space-y-1 text-xs font-semibold">
          {moduleItems.map((item) => {
            const isActive = selectedModule === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedModule(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition text-left ${
                  isActive
                    ? "bg-[#85583f] text-white shadow-xs font-bold"
                    : "text-slate-700 hover:bg-[#ede6dd]"
                }`}
              >
                <span className="flex items-center gap-2">
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
                {item.live ? (
                  <span className="text-[9px] font-black bg-rose-500 text-white px-1.5 py-0.2 rounded-full">
                    Live
                  </span>
                ) : (
                  <span className="text-xs opacity-60">›</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* RIGHT: DYNAMIC WORKSPACE CONTENT ACCORDING TO SELECTED BUTTON */}
      <div className="lg:col-span-9 min-h-[520px]">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {selectedModule === "dashboard" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Grouped 7-Day Business Activity Chart */}
              <div className="md:col-span-7 rounded-2xl bg-white border border-[#ede6dd] p-4 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Business Activity</h3>
                    <p className="text-[11px] text-slate-400">Your scans, customers and reviews overview.</p>
                  </div>
                  <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-lg p-0.5 text-[11px] font-semibold text-slate-700">
                    <button
                      type="button"
                      onClick={() => setActivityRange("7d")}
                      className={`px-2 py-0.5 rounded-md ${activityRange === "7d" ? "bg-white font-bold text-[#85583f] shadow-2xs" : ""}`}
                    >
                      Last 7 Days
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityRange("30d")}
                      className={`px-2 py-0.5 rounded-md ${activityRange === "30d" ? "bg-white font-bold text-[#85583f] shadow-2xs" : ""}`}
                    >
                      Last 30 Days
                    </button>
                  </div>
                </div>

                {/* SVG Visual Bar Chart */}
                <div className="mt-5 flex items-end justify-between h-40 pt-4 px-2 border-b border-slate-100">
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 h-32">
                      <div className="w-2.5 bg-[#85583f] rounded-t-xs h-16"></div>
                      <div className="w-2.5 bg-[#b58c74] rounded-t-xs h-10"></div>
                      <div className="w-2.5 bg-[#e8d7cb] rounded-t-xs h-4"></div>
                    </div>
                    <span className="text-[9px] text-slate-400">Oct 24</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 h-32">
                      <div className="w-2.5 bg-[#85583f] rounded-t-xs h-20"></div>
                      <div className="w-2.5 bg-[#b58c74] rounded-t-xs h-14"></div>
                      <div className="w-2.5 bg-[#e8d7cb] rounded-t-xs h-6"></div>
                    </div>
                    <span className="text-[9px] text-slate-400">Oct 25</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 h-32">
                      <div className="w-2.5 bg-[#85583f] rounded-t-xs h-12"></div>
                      <div className="w-2.5 bg-[#b58c74] rounded-t-xs h-8"></div>
                      <div className="w-2.5 bg-[#e8d7cb] rounded-t-xs h-2"></div>
                    </div>
                    <span className="text-[9px] text-slate-400">Oct 26</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 h-32">
                      <div className="w-2.5 bg-[#85583f] rounded-t-xs h-28"></div>
                      <div className="w-2.5 bg-[#b58c74] rounded-t-xs h-18"></div>
                      <div className="w-2.5 bg-[#e8d7cb] rounded-t-xs h-8"></div>
                    </div>
                    <span className="text-[9px] text-slate-400">Oct 27</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 h-32">
                      <div className="w-2.5 bg-[#85583f] rounded-t-xs h-22"></div>
                      <div className="w-2.5 bg-[#b58c74] rounded-t-xs h-16"></div>
                      <div className="w-2.5 bg-[#e8d7cb] rounded-t-xs h-6"></div>
                    </div>
                    <span className="text-[9px] text-slate-400">Oct 28</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 h-32">
                      <div className="w-2.5 bg-[#85583f] rounded-t-xs h-24"></div>
                      <div className="w-2.5 bg-[#b58c74] rounded-t-xs h-15"></div>
                      <div className="w-2.5 bg-[#e8d7cb] rounded-t-xs h-5"></div>
                    </div>
                    <span className="text-[9px] text-slate-400">Oct 29</span>
                  </div>
                  <div className="flex flex-col items-center gap-1">
                    <div className="flex items-end gap-1 h-32">
                      <div className="w-2.5 bg-[#85583f] rounded-t-xs h-32"></div>
                      <div className="w-2.5 bg-[#b58c74] rounded-t-xs h-20"></div>
                      <div className="w-2.5 bg-[#e8d7cb] rounded-t-xs h-10"></div>
                    </div>
                    <span className="text-[9px] text-slate-400">Oct 30</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="mt-3 flex items-center justify-center gap-4 text-[10px] font-semibold text-slate-600">
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#85583f]"></span> QR Scans</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#b58c74]"></span> Customers</span>
                  <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full bg-[#e8d7cb]"></span> Reviews</span>
                </div>
              </div>

              {/* My QR Code Card with Download, Print, Share */}
              <div className="md:col-span-5 rounded-2xl bg-white border border-[#ede6dd] p-4 shadow-2xs flex flex-col items-center justify-between text-center">
                <div className="w-full flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-900">My QR Code</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">Active</span>
                </div>

                <div className="my-2 p-2 bg-white rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center">
                  <img
                    src={qrImageUrl}
                    alt="Trustit QR Code"
                    width={112}
                    height={112}
                    className="h-28 w-28 object-contain rounded-xl"
                  />
                  <span className="mt-1 text-[10px] font-bold text-slate-600">Scan &amp; Review on Trustit</span>
                </div>

                <div className="w-full grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={handleDownloadQr}
                    className="py-1.5 rounded-xl bg-[#85583f] text-white text-[10px] font-bold shadow-2xs hover:bg-[#6e4631] transition"
                  >
                    Download
                  </button>
                  <button
                    type="button"
                    onClick={handlePrintQr}
                    className="py-1.5 rounded-xl bg-white border border-[#ede6dd] text-slate-700 text-[10px] font-bold shadow-2xs hover:bg-slate-50 transition"
                  >
                    Print
                  </button>
                  <button
                    type="button"
                    onClick={handleShareQr}
                    className="py-1.5 rounded-xl bg-white border border-[#ede6dd] text-slate-700 text-[10px] font-bold shadow-2xs hover:bg-slate-50 transition"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Recent Activity + Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              
              {/* Recent Activity Timeline */}
              <div className="md:col-span-6 rounded-2xl bg-white border border-[#ede6dd] p-4 shadow-2xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Recent Activity</h3>
                  <button
                    type="button"
                    onClick={() => setSelectedModule("reviews")}
                    className="text-xs font-bold text-[#85583f] hover:underline"
                  >
                    View All →
                  </button>
                </div>
                <div className="mt-3 space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs">
                    <span className="h-6 w-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">📱</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">New QR Scan</p>
                      <p className="text-[10px] text-slate-500">Customer scanned at counter</p>
                    </div>
                    <span className="text-[9px] text-slate-400">2 min ago</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <span className="h-6 w-6 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">⭐</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">New Review Received</p>
                      <p className="text-[10px] text-slate-500">5 star rating from Rahul</p>
                    </div>
                    <span className="text-[9px] text-slate-400">18 min ago</span>
                  </div>

                  <div className="flex items-start gap-2.5 text-xs">
                    <span className="h-6 w-6 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">🛒</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800">New Order</p>
                      <p className="text-[10px] text-slate-500">Order #1023 (₹450)</p>
                    </div>
                    <span className="text-[9px] text-slate-400">35 min ago</span>
                  </div>
                </div>
              </div>

              {/* Quick Action Tiles */}
              <div className="md:col-span-6 rounded-2xl bg-white border border-[#ede6dd] p-4 shadow-2xs">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Quick Actions</h3>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedModule("qr")}
                    className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100 text-left hover:border-blue-300 transition"
                  >
                    <span className="text-base block">📱</span>
                    <strong className="block text-xs font-bold text-slate-900">Edit QR Code</strong>
                    <small className="text-[9px] text-slate-500">Customize standee</small>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModule("products")}
                    className="p-2.5 rounded-xl bg-orange-50/70 border border-orange-100 text-left hover:border-orange-300 transition"
                  >
                    <span className="text-base block">📦</span>
                    <strong className="block text-xs font-bold text-slate-900">Manage Products</strong>
                    <small className="text-[9px] text-slate-500">Rates &amp; items</small>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModule("reviews")}
                    className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 text-left hover:border-rose-300 transition"
                  >
                    <span className="text-base block">💬</span>
                    <strong className="block text-xs font-bold text-slate-900">View Reviews</strong>
                    <small className="text-[9px] text-slate-500">Customer feedback</small>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedModule("messages")}
                    className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-100 text-left hover:border-purple-300 transition"
                  >
                    <span className="text-base block">✉️</span>
                    <strong className="block text-xs font-bold text-slate-900">Send Message</strong>
                    <small className="text-[9px] text-slate-500">WhatsApp invite</small>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 2: MY BUSINESS */}
        {selectedModule === "business" && (
          <div className="rounded-2xl bg-white border border-[#ede6dd] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">My Business Profile &amp; Location</h3>
                <p className="text-xs text-slate-500">Manage registered shop name, public address, and Google Review Link.</p>
              </div>
              <Link
                href="/merchant/dashboard/business"
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 hover:bg-blue-100"
              >
                Open Full Editor →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Business Name</label>
                <div className="mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-800 bg-slate-50">
                  {merchant.businessName}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700">Category</label>
                <div className="mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl font-semibold text-slate-800 bg-slate-50">
                  {merchant.businessType || "Retail & Commerce"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Google Review Link</label>
                <div className="mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl text-blue-600 font-mono bg-slate-50 truncate">
                  {merchant.reviewLink || "https://g.page/r/your-shop/review"}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700">Shop Address</label>
                <div className="mt-1 px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-700 bg-slate-50">
                  {merchant.locality ? `${merchant.locality}, ${merchant.city} - ${merchant.pincode}` : "Bahraich, Uttar Pradesh - 271801"}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: ORDERS & BOOKINGS */}
        {selectedModule === "orders" && (
          <div className="rounded-2xl bg-white border border-[#ede6dd] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Live Orders &amp; Queue Console</h3>
                <p className="text-xs text-slate-500">Incoming customer orders, kitchen KOT tickets, and delivery dispatches.</p>
              </div>
              <Link
                href="/merchant/dashboard/orders"
                className="px-3 py-1.5 rounded-xl bg-[#85583f] text-white text-xs font-bold shadow-xs hover:bg-[#6e4631]"
              >
                Open Full Order Console →
              </Link>
            </div>

            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex items-center justify-between">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 text-[10px] font-bold">New Order #1024</span>
                <h4 className="mt-1 text-xs font-bold text-slate-900">Quick Hyperlocal Order</h4>
                <p className="text-[11px] text-slate-500">Bahraich Local Delivery · ₹380 (Cashfree Paid)</p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/merchant/dashboard/orders"
                  className="px-3 py-1.5 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-700"
                >
                  Accept &amp; Dispatch Rider
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 4: PRODUCTS & SERVICES */}
        {selectedModule === "products" && (
          <div className="rounded-2xl bg-white border border-[#ede6dd] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Products, Menu &amp; Rate Card</h3>
                <p className="text-xs text-slate-500">Set rates to make items visible to customers. Items without rates remain hidden.</p>
              </div>
              <Link
                href="/merchant/dashboard/menu"
                className="px-3 py-1.5 rounded-xl bg-[#85583f] text-white text-xs font-bold shadow-xs hover:bg-[#6e4631]"
              >
                Manage All Items →
              </Link>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Item 1: Daily Essential Pack</p>
                  <span className="text-[10px] text-emerald-600 font-bold">● Live for Customers</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₹210</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Item 2: Quick Store Package</p>
                  <span className="text-[10px] text-emerald-600 font-bold">● Live for Customers</span>
                </div>
                <span className="font-mono font-bold text-slate-900">₹145</span>
              </div>
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Item 3: Premium Selection</p>
                  <span className="text-[10px] text-amber-600 font-bold">● Draft (Enter rate to make live)</span>
                </div>
                <Link href="/merchant/dashboard/menu" className="text-blue-600 font-bold hover:underline">
                  Set Rate
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: MY QR CODE */}
        {selectedModule === "qr" && (
          <div className="rounded-2xl bg-white border border-[#ede6dd] p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">QR Standee Studio &amp; Export</h3>
                <p className="text-xs text-slate-500">Download high-definition print-ready templates for your shop counter.</p>
              </div>
              <Link
                href="/merchant/dashboard/qr"
                className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200"
              >
                Open Full QR Studio →
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50 text-center">
                <span className="text-2xl block mb-1">🖼️</span>
                <strong className="block text-xs font-bold text-slate-900">4×6 Table Standee</strong>
                <small className="text-[10px] text-slate-500">Ideal for checkout counter</small>
                <button
                  type="button"
                  onClick={handleDownloadQr}
                  className="mt-2 w-full py-1.5 rounded-lg bg-blue-600 text-white text-[10px] font-bold"
                >
                  Download PNG
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50 text-center">
                <span className="text-2xl block mb-1">👑</span>
                <strong className="block text-xs font-bold text-slate-900">Golden Luxury Standee</strong>
                <small className="text-[10px] text-slate-500">Premium acrylic look</small>
                <button
                  type="button"
                  onClick={handlePrintQr}
                  className="mt-2 w-full py-1.5 rounded-lg bg-amber-600 text-white text-[10px] font-bold"
                >
                  Print Standee
                </button>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50 text-center">
                <span className="text-2xl block mb-1">🏷️</span>
                <strong className="block text-xs font-bold text-slate-900">Shop Door Sticker</strong>
                <small className="text-[10px] text-slate-500">For entrance door or glass</small>
                <button
                  type="button"
                  onClick={handleShareQr}
                  className="mt-2 w-full py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-bold"
                >
                  Share Link
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 6: OTHER MODULES DIRECT CONNECTOR */}
        {selectedModule !== "dashboard" &&
          selectedModule !== "business" &&
          selectedModule !== "orders" &&
          selectedModule !== "products" &&
          selectedModule !== "qr" && (
            <div className="rounded-2xl bg-white border border-[#ede6dd] p-8 text-center shadow-2xs space-y-3">
              <span className="text-4xl block">
                {selectedModule === "standees" && "🖼️"}
                {selectedModule === "reviews" && "💬"}
                {selectedModule === "messages" && "✍️"}
                {selectedModule === "analytics" && "📈"}
                {selectedModule === "subscription" && "👑"}
                {selectedModule === "payments" && "💳"}
                {selectedModule === "profile" && "👤"}
                {selectedModule === "support" && "🎧"}
              </span>

              <h3 className="text-base font-bold text-slate-900 capitalize">
                {selectedModule === "standees" && "QR Standees & Kits Order Hub"}
                {selectedModule === "reviews" && "Customer Reviews & Ratings Moderation"}
                {selectedModule === "messages" && "Message Designer & WhatsApp Broadcast"}
                {selectedModule === "analytics" && "In-Depth Scan & Footfall Analytics"}
                {selectedModule === "subscription" && "Subscription & Plan Management"}
                {selectedModule === "payments" && "Payments & UPI Settlements Passbook"}
                {selectedModule === "profile" && "Merchant Profile & Store Settings"}
                {selectedModule === "support" && "24×7 Dedicated Merchant Support"}
              </h3>

              <p className="text-xs text-slate-500 max-w-md mx-auto">
                {selectedModule === "support"
                  ? "Direct 24x7 helpline for Bahraich merchants (+91 91515 90000) or instant WhatsApp chat."
                  : "All live database operations are ready and active for your store."}
              </p>

              <div className="flex items-center justify-center gap-2 pt-2">
                {selectedModule === "support" ? (
                  <a
                    href="https://wa.me/919151590000?text=Hello%20Trustit%20Support%20Team"
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold shadow-xs hover:bg-emerald-700"
                  >
                    Chat on WhatsApp →
                  </a>
                ) : (
                  <Link
                    href={`/merchant/dashboard/${
                      selectedModule === "standees"
                        ? "products"
                        : selectedModule === "analytics"
                        ? "#scan-analytics"
                        : selectedModule
                    }`}
                    className="px-4 py-2 rounded-xl bg-[#85583f] text-white text-xs font-bold shadow-xs hover:bg-[#6e4631]"
                  >
                    Open Full {selectedModule.toUpperCase()} Console →
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedModule("dashboard")}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
                >
                  Back to Dashboard Overview
                </button>
              </div>
            </div>
          )}

      </div>

    </div>
  );
}
