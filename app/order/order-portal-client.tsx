"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";

export type SuperAppBusiness = {
  id: string;
  name: string;
  city: string;
  type: string;
  address: string | null;
  phone: string | null;
  location_latitude: number | null;
  location_longitude: number | null;
};

export type SuperAppCatalogItem = {
  id: string;
  business_id: string;
  name: string;
  category: string;
  price: number;
  item_type: "veg" | "non_veg" | "egg" | "service" | "product";
  is_available: boolean;
  image_url: string | null;
  description: string | null;
};

export type ActiveHyperlocalOrder = {
  id: string;
  business_id: string;
  customer_name: string;
  customer_phone: string;
  customer_address: { street: string; locality?: string; city?: string };
  order_type: string;
  status: string;
  total_amount: number;
  subtotal_amount: number;
  delivery_fee: number;
  delivery_otp: string;
  created_at: string;
  businesses?: { name: string; city: string; address: string | null };
  delivery_riders?: { id: string; full_name: string; phone: string; vehicle_number?: string } | null;
};

export type ActiveServiceToken = {
  id: string;
  business_id: string;
  service_type: string;
  token_number: number;
  customer_name: string;
  customer_phone: string;
  vehicle_or_notes: string | null;
  status: string;
  estimated_wait_minutes: number;
  chair_or_bay_number?: string;
  created_at: string;
  businesses?: { name: string; city: string; address: string | null };
};

type ActiveParchaOrder = {
  order_id: string;
  handwritten_text: string | null;
  parcha_image_url: string | null;
  merchant_quote_amount: number | null;
  merchant_quote_items: Array<{ name: string; quantity: string; price: number }>;
  customer_approved: boolean;
  hyperlocal_orders?: {
    id: string;
    status: string;
    delivery_otp: string;
    total_amount: number;
    business_id: string;
  };
};

export default function CustomerSuperAppClient({
  businesses,
  catalogItems,
}: {
  businesses: SuperAppBusiness[];
  catalogItems: SuperAppCatalogItem[];
}) {
  // Navigation & Category Tab
  const [activeTab, setActiveTab] = useState<"food" | "salon" | "car_wash" | "kirana">("food");
  const [selectedCity, setSelectedCity] = useState<string>("Bahraich");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Customer Profile stored in local storage
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Cart for Food & Sweets
  const [cart, setCart] = useState<{ [itemId: string]: { item: SuperAppCatalogItem; quantity: number } }>({});
  const [activeStoreModal, setActiveStoreModal] = useState<SuperAppBusiness | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"cod" | "counter_cash">("cod");

  // Salon Token Booking Modal
  const [salonModal, setSalonModal] = useState<SuperAppBusiness | null>(null);
  const [salonService, setSalonService] = useState<string>("Executive Haircut & Styling");
  const [salonStylist, setSalonStylist] = useState<string>("Any Available Stylist");

  // Car Wash Bay Booking Modal
  const [carWashModal, setCarWashModal] = useState<SuperAppBusiness | null>(null);
  const [carWashPackage, setCarWashPackage] = useState<string>("Full Foam Car Wash & Vacuuming (₹350)");
  const [vehicleNumber, setVehicleNumber] = useState<string>("");
  const [vehicleModel, setVehicleModel] = useState<string>("");

  // Kirana Parcha Upload Modal
  const [kiranaModal, setKiranaModal] = useState<SuperAppBusiness | null>(null);
  const [parchaText, setParchaText] = useState<string>("");
  const [parchaImagePreview, setParchaImagePreview] = useState<string | null>(null);
  const [parchaNotes, setParchaNotes] = useState<string>("");

  // "My Bookings & Live Orders" Drawer
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [activeOrders, setActiveOrders] = useState<ActiveHyperlocalOrder[]>([]);
  const [activeTokens, setActiveTokens] = useState<ActiveServiceToken[]>([]);
  const [activeParchas, setActiveParchas] = useState<ActiveParchaOrder[]>([]);
  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);

  // Form Submission Pending
  const [isSubmitting, startTransition] = useTransition();
  const [bookingSuccessNotice, setBookingSuccessNotice] = useState<string | null>(null);

  // Load customer info from localStorage
  useEffect(() => {
    try {
      const savedName = localStorage.getItem("trustit_cust_name");
      const savedPhone = localStorage.getItem("trustit_cust_phone");
      const savedAddr = localStorage.getItem("trustit_cust_addr");
      if (savedName) setCustomerName(savedName);
      if (savedPhone) setCustomerPhone(savedPhone);
      if (savedAddr) setCustomerAddress(savedAddr);
    } catch {
      // Ignore localStorage availability
    }
  }, []);

  // Save customer info
  const saveCustomerProfile = (name: string, phone: string, address: string) => {
    try {
      localStorage.setItem("trustit_cust_name", name);
      localStorage.setItem("trustit_cust_phone", phone);
      localStorage.setItem("trustit_cust_addr", address);
    } catch {}
  };

  // Poll active bookings when customer phone is set
  const fetchActiveBookings = async (phone: string) => {
    if (!phone || phone.length < 10) return;
    setIsRefreshingBookings(true);
    try {
      // 1. Fetch Orders
      const orderRes = await fetch(`/api/hyperlocal/orders?phone=${encodeURIComponent(phone)}`);
      if (orderRes.ok) {
        const data = await orderRes.json();
        setActiveOrders(data.orders || []);
      }

      // 2. Fetch Tokens
      const tokenRes = await fetch(`/api/hyperlocal/tokens?phone=${encodeURIComponent(phone)}`);
      if (tokenRes.ok) {
        const data = await tokenRes.json();
        setActiveTokens(data.tokens || []);
      }

      // 3. Fetch Parchas
      const parchaRes = await fetch(`/api/hyperlocal/parcha`);
      if (parchaRes.ok) {
        const data = await parchaRes.json();
        const myParchas = (data.parchas || []).filter(
          (p: any) => p.hyperlocal_orders?.customer_phone === phone,
        );
        setActiveParchas(myParchas);
      }
    } catch {
      // Ignore network errors
    } finally {
      setIsRefreshingBookings(false);
    }
  };

  useEffect(() => {
    if (customerPhone && customerPhone.length >= 10) {
      fetchActiveBookings(customerPhone);
      const interval = setInterval(() => fetchActiveBookings(customerPhone), 12000);
      return () => clearInterval(interval);
    }
  }, [customerPhone]);

  // GPS auto-detect for delivery address
  const handleDetectGps = () => {
    if (!navigator.geolocation) {
      alert("GPS not supported on this device.");
      return;
    }
    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsDetectingGps(false);
        const auto = `Near GPS Lat: ${pos.coords.latitude.toFixed(4)}, Lng: ${pos.coords.longitude.toFixed(4)}, Bahraich`;
        setCustomerAddress(auto);
      },
      () => {
        setIsDetectingGps(false);
        alert("GPS location permission denied or timed out.");
      },
      { timeout: 8000 },
    );
  };

  // Filter businesses by active vertical
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const type = (b.type || "").toLowerCase();
      const name = (b.name || "").toLowerCase();
      const query = searchQuery.toLowerCase();

      const matchesSearch = !query || name.includes(query) || type.includes(query);
      if (!matchesSearch) return false;

      if (activeTab === "food") {
        return (
          type.includes("restaurant") ||
          type.includes("sweet") ||
          type.includes("fast food") ||
          type.includes("cafe") ||
          type.includes("bakery") ||
          type.includes("cake")
        );
      }
      if (activeTab === "salon") {
        return type.includes("salon") || type.includes("parlour") || type.includes("barber");
      }
      if (activeTab === "car_wash") {
        return (
          type.includes("car wash") ||
          type.includes("automobile") ||
          type.includes("bike") ||
          type.includes("garage")
        );
      }
      if (activeTab === "kirana") {
        return (
          type.includes("supermarket") ||
          type.includes("grocery") ||
          type.includes("kirana") ||
          type.includes("mart")
        );
      }
      return true;
    });
  }, [businesses, activeTab, searchQuery]);

  // Catalog items for the currently opened store modal
  const activeStoreItems = useMemo(() => {
    if (!activeStoreModal) return [];
    return catalogItems.filter((i) => i.business_id === activeStoreModal.id);
  }, [catalogItems, activeStoreModal]);

  // Cart calculations
  const cartItemsList = useMemo(() => Object.values(cart), [cart]);
  const cartSubtotal = useMemo(() => {
    return cartItemsList.reduce((sum, item) => sum + item.item.price * item.quantity, 0);
  }, [cartItemsList]);
  const cartDeliveryFee = cartSubtotal >= 499 ? 0 : cartSubtotal > 0 ? 35 : 0;
  const cartPlatformFee = cartSubtotal > 0 ? 5 : 0;
  const cartGrandTotal = cartSubtotal + cartDeliveryFee + cartPlatformFee;

  const updateCartQty = (item: SuperAppCatalogItem, delta: number) => {
    setCart((prev) => {
      const existing = prev[item.id];
      const newQty = (existing?.quantity || 0) + delta;
      if (newQty <= 0) {
        const copy = { ...prev };
        delete copy[item.id];
        return copy;
      }
      return {
        ...prev,
        [item.id]: { item, quantity: newQty },
      };
    });
  };

  // Place Food Order
  const handlePlaceFoodOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Please fill in your Name, 10-digit Phone, and Delivery Address.");
      return;
    }
    if (cartItemsList.length === 0 || !activeStoreModal) {
      alert("Your cart is empty.");
      return;
    }

    startTransition(async () => {
      try {
        saveCustomerProfile(customerName, customerPhone, customerAddress);

        const res = await fetch("/api/hyperlocal/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: activeStoreModal.id,
            orderType: "food_delivery",
            customerName,
            customerPhone,
            customerAddress: { street: customerAddress, city: selectedCity },
            paymentMode,
            items: cartItemsList.map((c) => ({
              item_name: c.item.name,
              quantity: c.quantity,
              unit_price: c.item.price,
              is_veg: c.item.item_type === "veg",
            })),
          }),
        });

        const data = await res.json();
        if (data.success) {
          setCart({});
          setIsCheckoutOpen(false);
          setActiveStoreModal(null);
          setBookingSuccessNotice(
            `Order Placed Successfully! Your Order ID is #${data.orderId.slice(-8)}. Delivery OTP: ${data.deliveryOtp}`,
          );
          setIsMyBookingsOpen(true);
          fetchActiveBookings(customerPhone);
        } else {
          alert(`Order failed: ${data.error || "Please try again."}`);
        }
      } catch (err) {
        alert("Network error while placing order.");
      }
    });
  };

  // Book Salon Token
  const handleBookSalonToken = () => {
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Please provide your Name and 10-digit Mobile Number.");
      return;
    }
    if (!salonModal) return;

    startTransition(async () => {
      try {
        saveCustomerProfile(customerName, customerPhone, customerAddress);

        const res = await fetch("/api/hyperlocal/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: salonModal.id,
            serviceType: "salon_haircut",
            customerName,
            customerPhone,
            vehicleOrNotes: `Service: ${salonService} • Preference: ${salonStylist}`,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setSalonModal(null);
          setBookingSuccessNotice(
            `Salon Digital Token Confirmed! Your Token is #${data.tokenNumber}. Approx wait: ${data.estimatedWaitMinutes} mins.`,
          );
          setIsMyBookingsOpen(true);
          fetchActiveBookings(customerPhone);
        } else {
          alert(`Failed to book token: ${data.error}`);
        }
      } catch {
        alert("Failed to book salon token.");
      }
    });
  };

  // Book Car Wash Bay Slot
  const handleBookCarWashSlot = () => {
    if (!customerName.trim() || !customerPhone.trim() || !vehicleNumber.trim()) {
      alert("Please provide Name, Phone, and Vehicle Number (e.g. UP 40 AB 1234).");
      return;
    }
    if (!carWashModal) return;

    startTransition(async () => {
      try {
        saveCustomerProfile(customerName, customerPhone, customerAddress);

        const res = await fetch("/api/hyperlocal/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: carWashModal.id,
            serviceType: "car_foam_wash",
            customerName,
            customerPhone,
            vehicleOrNotes: `Vehicle: ${vehicleNumber.toUpperCase()} (${vehicleModel || "Car"}) • Package: ${carWashPackage}`,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setCarWashModal(null);
          setVehicleNumber("");
          setVehicleModel("");
          setBookingSuccessNotice(
            `Car Wash Bay Confirmed! Bay Token #${data.tokenNumber}. Please reach in approx ${data.estimatedWaitMinutes} mins.`,
          );
          setIsMyBookingsOpen(true);
          fetchActiveBookings(customerPhone);
        } else {
          alert(`Failed to book car wash bay: ${data.error}`);
        }
      } catch {
        alert("Failed to book car wash bay.");
      }
    });
  };

  // Submit Kirana Handwritten Parcha
  const handleSubmitParcha = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Please enter your Name, Phone, and Delivery Address.");
      return;
    }
    if (!parchaText.trim() && !parchaImagePreview) {
      alert("Please write your grocery list or upload a photo of your handwritten parcha.");
      return;
    }
    if (!kiranaModal) return;

    startTransition(async () => {
      try {
        saveCustomerProfile(customerName, customerPhone, customerAddress);

        const res = await fetch("/api/hyperlocal/parcha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: kiranaModal.id,
            customerName,
            customerPhone,
            customerAddress: { street: customerAddress, city: selectedCity },
            handwrittenText: parchaText,
            parchaImageUrl: parchaImagePreview,
            customerNotes: parchaNotes,
          }),
        });

        const data = await res.json();
        if (data.success) {
          setKiranaModal(null);
          setParchaText("");
          setParchaImagePreview(null);
          setParchaNotes("");
          setBookingSuccessNotice(
            `Parcha Sent to Dukandar! Order ID #${data.orderId.slice(-8)}. Delivery OTP: ${data.deliveryOtp}. Dukandar will prepare bill and dispatch rider.`,
          );
          setIsMyBookingsOpen(true);
          fetchActiveBookings(customerPhone);
        } else {
          alert(`Failed to submit parcha: ${data.error}`);
        }
      } catch {
        alert("Failed to submit handwritten parcha.");
      }
    });
  };

  const totalActiveCount = activeOrders.length + activeTokens.length + activeParchas.length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-28">
      {/* ── Top Super-App Header ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 text-lg font-black text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition">
                ⚡
              </span>
              <div>
                <span className="text-lg font-black tracking-tight text-slate-950 flex items-center gap-1.5">
                  Trustit Super-App
                  <span className="rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-blue-800">
                    Live
                  </span>
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  📍 {selectedCity}, UP
                  <button
                    onClick={() => {
                      const next = selectedCity === "Bahraich" ? "Lucknow" : "Bahraich";
                      setSelectedCity(next);
                    }}
                    className="text-[10px] text-blue-600 hover:underline font-bold"
                  >
                    Change
                  </button>
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMyBookingsOpen(true)}
              className="relative inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-md hover:bg-slate-800 transition"
            >
              <span>📋 My Bookings</span>
              {totalActiveCount > 0 && (
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-black text-slate-950 animate-pulse">
                  {totalActiveCount}
                </span>
              )}
            </button>

            {customerPhone ? (
              <button
                onClick={() => setIsCustomerLoginOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-xs hover:bg-slate-50 transition"
              >
                <span>👤 {customerName ? customerName.split(" ")[0] : "Account"}</span>
              </button>
            ) : (
              <button
                onClick={() => setIsCustomerLoginOpen(true)}
                className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 px-3.5 py-2 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
              >
                <span>👤 Log In</span>
              </button>
            )}
          </div>
        </div>

        {/* ── 4 Hero Multi-Service Verticals Selector ── */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-2 pb-3 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-2 min-w-max">
            <button
              onClick={() => setActiveTab("food")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "food"
                  ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-md shadow-orange-500/25 scale-[1.02]"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">🍔</span>
              <span>Food & Mithai Delivery</span>
              <span className="text-[10px] opacity-80">· 25m</span>
            </button>

            <button
              onClick={() => setActiveTab("salon")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "salon"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-500/25 scale-[1.02]"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">✂️</span>
              <span>Salon & Barber Queue</span>
              <span className="text-[10px] opacity-80">· Live Token</span>
            </button>

            <button
              onClick={() => setActiveTab("car_wash")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "car_wash"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/25 scale-[1.02]"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">🚗</span>
              <span>Car & Bike Wash</span>
              <span className="text-[10px] opacity-80">· Bay Slots</span>
            </button>

            <button
              onClick={() => setActiveTab("kirana")}
              className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black transition ${
                activeTab === "kirana"
                  ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-500/25 scale-[1.02]"
                  : "bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50"
              }`}
            >
              <span className="text-base">🛒</span>
              <span>Kirana Parcha (Chitthi)</span>
              <span className="text-[10px] opacity-80">· Photo Upload</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── Notification Banner if any booking just created ── */}
      {bookingSuccessNotice && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
          <div className="flex items-center justify-between rounded-2xl bg-emerald-500 p-4 text-white shadow-lg">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎉</span>
              <p className="text-xs sm:text-sm font-bold">{bookingSuccessNotice}</p>
            </div>
            <button
              onClick={() => setBookingSuccessNotice(null)}
              className="rounded-lg bg-emerald-700 px-3 py-1 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Main Vertical Content ── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* Vertical Hero Card */}
        <div className="mb-6 rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 p-6 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <span className="inline-block rounded-full bg-white/10 backdrop-blur px-3 py-1 text-[11px] font-bold text-amber-300 uppercase tracking-wider mb-2">
              {activeTab === "food" && "⚡ 25-35 Mins Hyperlocal Food & Sweets Delivery"}
              {activeTab === "salon" && "✂️ No Physical Waiting · Live Digital Queue Pass"}
              {activeTab === "car_wash" && "🚗 Live Bay Slot Booking · Foam Wash & Detailing"}
              {activeTab === "kirana" && "📝 Handwritten Grocery List · Dukandar Billing & Delivery"}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {activeTab === "food" && "Bahraich Ke Best Restaurants & Halwai Se Order Karein"}
              {activeTab === "salon" && "Bina Dukan Me Baithe Chair Number Lagayein"}
              {activeTab === "car_wash" && "Gaadi Dhulwane Ka Bay Slot Book Karein"}
              {activeTab === "kirana" && "Kagaz Ki Parchi Upload Karein, Samaan Ghar Mangawein"}
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
              {activeTab === "food" &&
                "Zaika, Brijwasi Sweets, Al-Bake Biryani aur sabhi verified places se fresh delivery. Live rider tracking aur 4-digit OTP handover."}
              {activeTab === "salon" &&
                "Looks & Style, Roopam Parlour me kitne log aage hain live dekhein. Aapka number aane par notification payein."}
              {activeTab === "car_wash" &&
                "Speed Shine Car Wash ke Bay 1 / Bay 2 ka live status dekhein. Gaadi ka number daalein aur seedhe slot par pahuchein."}
              {activeTab === "kirana" &&
                "Parcha ki photo kheenchiye ya likhiye, dukan parcha dekh kar samaan pack karegi aur bill banakar rider se bhejegi."}
            </p>
          </div>

          <div className="mt-4 flex items-center gap-2">
            <input
              type="text"
              placeholder={`Search ${activeTab === "food" ? "biryani, mithai, restaurant..." : activeTab === "salon" ? "barber, parlour, haircut..." : activeTab === "car_wash" ? "car wash, bike foam..." : "kirana, grocery, mart..."}`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full max-w-md rounded-2xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>

        {/* ── Business Cards Grid ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBusinesses.map((biz) => {
            const bizItems = catalogItems.filter((i) => i.business_id === biz.id);

            return (
              <div
                key={biz.id}
                className="group flex flex-col justify-between rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs transition hover:shadow-lg hover:border-blue-300"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-block rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase text-slate-700">
                        {biz.type}
                      </span>
                      <h3 className="mt-1.5 text-lg font-black text-slate-900 group-hover:text-blue-600 transition">
                        {biz.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        📍 {biz.address || `${biz.city}, Uttar Pradesh`}
                      </p>
                    </div>

                    <span className="flex items-center gap-1 rounded-xl bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">
                      ★ 4.8
                    </span>
                  </div>

                  {/* Highlights / Features per Vertical */}
                  <div className="mt-3.5 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700 space-y-1">
                    {activeTab === "food" && (
                      <>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">🛵 Delivery in:</span>
                          <span className="font-black text-slate-900">25–35 Mins</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">Free Delivery:</span>
                          <span className="font-black text-emerald-700">Orders above ₹499</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                          {bizItems.length > 0
                            ? `${bizItems.slice(0, 3).map((i) => i.name).join(", ")} +more`
                            : "Freshly prepared dining & takeaway"}
                        </div>
                      </>
                    )}

                    {activeTab === "salon" && (
                      <>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">🟢 Current Serving:</span>
                          <span className="font-black text-emerald-700">Token #04</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">⏳ Waiting in Line:</span>
                          <span className="font-black text-amber-700">2 Persons (~20m)</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                          Haircut ₹150 · Beard Trim ₹80 · Facial ₹450
                        </div>
                      </>
                    )}

                    {activeTab === "car_wash" && (
                      <>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">🚿 Bay 1 Status:</span>
                          <span className="font-black text-amber-700">Busy (10m left)</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">🚿 Bay 2 Status:</span>
                          <span className="font-black text-emerald-700">Available Now 🟢</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                          Foam Wash ₹350 · Bike Wash ₹100 · Teflon Detailing
                        </div>
                      </>
                    )}

                    {activeTab === "kirana" && (
                      <>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">📝 Parcha Processing:</span>
                          <span className="font-black text-purple-700">Instant Verification</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-slate-600">🛵 Rider Delivery:</span>
                          <span className="font-black text-slate-900">Direct to Doorstep</span>
                        </div>
                        <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200">
                          Atta, Oil, Sugar, Spices, Dairy & Daily Essentials
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  {activeTab === "food" && (
                    <button
                      onClick={() => setActiveStoreModal(biz)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 py-3 text-xs font-black text-white shadow-md hover:from-orange-600 hover:to-amber-700 transition"
                    >
                      <span>🍽️ View Menu & Order</span>
                      <span>→</span>
                    </button>
                  )}

                  {activeTab === "salon" && (
                    <button
                      onClick={() => setSalonModal(biz)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 py-3 text-xs font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-800 transition"
                    >
                      <span>✂️ Book Digital Queue Pass</span>
                      <span>→</span>
                    </button>
                  )}

                  {activeTab === "car_wash" && (
                    <button
                      onClick={() => setCarWashModal(biz)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-800 transition"
                    >
                      <span>🚗 Book Bay Slot</span>
                      <span>→</span>
                    </button>
                  )}

                  {activeTab === "kirana" && (
                    <button
                      onClick={() => setKiranaModal(biz)}
                      className="w-full flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 text-xs font-black text-white shadow-md hover:from-purple-700 hover:to-pink-700 transition"
                    >
                      <span>📝 Upload / Send Parcha</span>
                      <span>→</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredBusinesses.length === 0 && (
          <div className="mt-12 text-center rounded-3xl border border-slate-200 bg-white p-12">
            <span className="text-4xl">🔍</span>
            <h3 className="mt-3 text-lg font-bold text-slate-800">No matching places found</h3>
            <p className="mt-1 text-xs text-slate-500">
              Try changing the search term or check in {selectedCity}.
            </p>
          </div>
        )}
      </main>

      {/* ── Sticky Bottom Cart Strip for Food ── */}
      {cartItemsList.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 p-4 shadow-2xl">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-slate-500">
                {cartItemsList.length} items in cart
              </span>
              <div className="text-lg font-black text-slate-900">
                ₹{cartGrandTotal}{" "}
                <span className="text-xs font-normal text-slate-500">
                  (incl. ₹35 delivery + ₹5 fee)
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/30 hover:scale-105 transition"
            >
              <span>Continue to Checkout</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Store Menu Modal for Food & Sweets ── */}
      {activeStoreModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5">
              <div>
                <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[10px] font-black uppercase text-orange-800">
                  {activeStoreModal.type}
                </span>
                <h2 className="text-xl font-black text-slate-900">{activeStoreModal.name}</h2>
                <p className="text-xs text-slate-500">📍 {activeStoreModal.address}</p>
              </div>
              <button
                onClick={() => setActiveStoreModal(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {activeStoreItems.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <p className="text-sm">Store items are being updated by merchant.</p>
                </div>
              ) : (
                activeStoreItems.map((item) => {
                  const inCartQty = cart[item.id]?.quantity || 0;
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-3.5 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start gap-3">
                        <span
                          className={`mt-1 grid h-4 w-4 place-items-center rounded-xs border text-[10px] font-black ${
                            item.item_type === "veg"
                              ? "border-emerald-600 text-emerald-600"
                              : "border-rose-600 text-rose-600"
                          }`}
                        >
                          ●
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{item.name}</h4>
                          <span className="text-xs font-extrabold text-slate-700">₹{item.price}</span>
                          {item.description && (
                            <p className="text-[11px] text-slate-500 line-clamp-1">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {inCartQty > 0 ? (
                          <div className="flex items-center gap-2 rounded-xl bg-orange-600 px-2 py-1 text-white font-black text-xs shadow-sm">
                            <button
                              onClick={() => updateCartQty(item, -1)}
                              className="px-1.5 hover:scale-125 transition"
                            >
                              -
                            </button>
                            <span>{inCartQty}</span>
                            <button
                              onClick={() => updateCartQty(item, 1)}
                              className="px-1.5 hover:scale-125 transition"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => updateCartQty(item, 1)}
                            className="rounded-xl border border-orange-500 bg-orange-50 px-3.5 py-1.5 text-xs font-black text-orange-700 hover:bg-orange-500 hover:text-white transition"
                          >
                            + ADD
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer with Cart Summary */}
            {cartItemsList.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">{cartItemsList.length} items</span>
                  <div className="text-base font-black text-slate-900">₹{cartGrandTotal}</div>
                </div>
                <button
                  onClick={() => {
                    setActiveStoreModal(null);
                    setIsCheckoutOpen(true);
                  }}
                  className="rounded-2xl bg-orange-600 px-6 py-2.5 text-xs font-black text-white shadow-md hover:bg-orange-700"
                >
                  Go to Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Checkout Modal for Food Order ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-lg font-black text-slate-900">🛵 Delivery Checkout</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Mobile Number (10 digits)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">Delivery Address</label>
                  <button
                    type="button"
                    onClick={handleDetectGps}
                    className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                  >
                    📍 {isDetectingGps ? "Detecting GPS..." : "Auto-fill with GPS"}
                  </button>
                </div>
                <textarea
                  rows={2}
                  placeholder="House/Shop No., Mohalla, Landmark, Bahraich"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Bill Details */}
              <div className="rounded-2xl bg-slate-50 p-4 text-xs space-y-2 border border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Items Total:</span>
                  <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee:</span>
                  <span className="font-bold text-slate-900">
                    {cartDeliveryFee === 0 ? "FREE" : `₹${cartDeliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Platform Fee:</span>
                  <span className="font-bold text-slate-900">₹{cartPlatformFee}</span>
                </div>
                <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-black text-slate-900">
                  <span>Total Amount Payable:</span>
                  <span className="text-orange-600">₹{cartGrandTotal}</span>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Payment Method</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("cod")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      paymentMode === "cod"
                        ? "border-orange-500 bg-orange-50 text-orange-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    💵 Cash on Delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMode("counter_cash")}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition ${
                      paymentMode === "counter_cash"
                        ? "border-orange-500 bg-orange-50 text-orange-900"
                        : "border-slate-200 bg-white text-slate-700"
                    }`}
                  >
                    ⚡ UPI to Rider / Counter
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePlaceFoodOrder}
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 py-3.5 text-sm font-black text-white shadow-lg shadow-orange-500/25 hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Placing Order..." : `Place Order (₹${cartGrandTotal}) →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Salon Digital Queue Token Modal ── */}
      {salonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-800">
                  Live Queue Token
                </span>
                <h3 className="text-lg font-black text-slate-900">{salonModal.name}</h3>
              </div>
              <button
                onClick={() => setSalonModal(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Select Service</label>
                <select
                  value={salonService}
                  onChange={(e) => setSalonService(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Executive Haircut & Styling (₹150)">Executive Haircut & Styling (₹150)</option>
                  <option value="Beard Trim & Shaper (₹80)">Beard Trim & Shaper (₹80)</option>
                  <option value="Haircut + Beard Combo (₹200)">Haircut + Beard Combo (₹200)</option>
                  <option value="O3+ D-Tan Facial (₹450)">O3+ D-Tan Facial (₹450)</option>
                  <option value="Keratin Hair Spa (₹750)">Keratin Hair Spa (₹750)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Barber / Stylist Preference</label>
                <select
                  value={salonStylist}
                  onChange={(e) => setSalonStylist(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Any Available Stylist">Any First Available Stylist (Fastest)</option>
                  <option value="Master Barber Imran">Master Barber Imran</option>
                  <option value="Stylist Rahul">Stylist Rahul</option>
                  <option value="Senior Artist Sonu">Senior Artist Sonu</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vicky Verma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Mobile Number (SMS/WhatsApp Token)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="rounded-2xl bg-emerald-50 p-4 text-xs text-emerald-950 border border-emerald-100">
                <span className="font-bold block mb-1">💡 Token Ka Fayda:</span>
                Aapko dukan me baith kar wait karne ki zaroorat nahi. Token book karein, live status dekhein aur number aane par 5 minute pehle dukan pahuchein!
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBookSalonToken}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 py-3.5 text-sm font-black text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Issuing Digital Pass..." : "Confirm Live Queue Token (Free) →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Car Wash Bay Booking Modal ── */}
      {carWashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-800">
                  Bay Slot Booking
                </span>
                <h3 className="text-lg font-black text-slate-900">{carWashModal.name}</h3>
              </div>
              <button
                onClick={() => setCarWashModal(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700">Wash Package</label>
                <select
                  value={carWashPackage}
                  onChange={(e) => setCarWashPackage(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                >
                  <option value="Full Foam Car Wash & Vacuuming (₹350)">Full Foam Car Wash & Vacuuming (₹350)</option>
                  <option value="Bike Foam Wash & Chain Lube (₹100)">Bike Foam Wash & Chain Lube (₹100)</option>
                  <option value="Teflon Body Coating & Polish (₹1200)">Teflon Body Coating & Polish (₹1200)</option>
                  <option value="Interior Deep Steam Wash (₹700)">Interior Deep Steam Wash (₹700)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Vehicle Number (Required)</label>
                <input
                  type="text"
                  placeholder="e.g. UP 40 AB 1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Vehicle Model (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Swift / Creta / Splendor"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Your Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBookCarWashSlot}
                className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Allocating Bay..." : "Confirm Bay Slot Token →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kirana Handwritten Parcha Upload Modal ── */}
      {kiranaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[10px] font-black uppercase text-purple-800">
                  Kirana Handwritten Parcha
                </span>
                <h3 className="text-lg font-black text-slate-900">{kiranaModal.name}</h3>
              </div>
              <button
                onClick={() => setKiranaModal(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  📸 Parcha (Kagaz Ki Parchi) Ki Photo Upload Karein
                </label>
                <div className="relative rounded-2xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-4 text-center">
                  {parchaImagePreview ? (
                    <div className="relative">
                      <img
                        src={parchaImagePreview}
                        alt="Parcha preview"
                        className="max-h-40 mx-auto rounded-xl shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setParchaImagePreview(null)}
                        className="mt-2 text-xs font-bold text-rose-600 hover:underline"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-3xl">📷</span>
                      <p className="mt-1 text-xs text-slate-600 font-semibold">
                        Kagaz ki parchi ki saaf photo kheinchein ya gallery se chunein
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setParchaImagePreview(ev.target?.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">
                  Ya Yahan Samaan Ki List Likh Dein (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 5kg Ashirvaad Atta, 1L Fortune Mustard Oil, 2kg Sugar, 1 Dettol Soap..."
                  value={parchaText}
                  onChange={(e) => setParchaText(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700">Delivery Address</label>
                <textarea
                  rows={2}
                  placeholder="Makaan No., Mohalla, Landmark, Bahraich"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700">Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="rounded-2xl bg-purple-50 p-3.5 text-xs text-purple-950 border border-purple-100">
                <span className="font-bold block mb-0.5">ℹ️ Dukandar Process:</span>
                Dukandar parcha dekh kar bill banayega aur rider aapke ghar samaan deliver karke payment receive karega.
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitParcha}
                className="w-full rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 py-3.5 text-sm font-black text-white shadow-lg shadow-purple-500/25 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Sending to Dukandar..." : "Send Parcha to Dukandar →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── My Active Bookings & Passes Drawer ── */}
      {isMyBookingsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-4 sm:p-5">
              <div>
                <h3 className="text-lg font-black text-slate-900">📋 My Active Bookings</h3>
                <p className="text-xs text-slate-500">
                  Live updates for {customerPhone ? `+91 ${customerPhone}` : "your mobile number"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchActiveBookings(customerPhone)}
                  className="rounded-xl bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-200"
                >
                  {isRefreshingBookings ? "↻ Syncing..." : "↻ Refresh"}
                </button>
                <button
                  onClick={() => setIsMyBookingsOpen(false)}
                  className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Content List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!customerPhone && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
                  Enter your mobile number during booking or above to sync all your active tokens and orders automatically.
                </div>
              )}

              {/* Food Orders */}
              {activeOrders.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    🍔 Food & Mithai Orders
                  </h4>
                  <div className="space-y-3">
                    {activeOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-slate-500">
                            #{ord.id.slice(-8)}
                          </span>
                          <span
                            className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                              ord.status === "delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : ord.status === "out_for_delivery"
                                  ? "bg-blue-100 text-blue-800 animate-pulse"
                                  : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.status.replace(/_/g, " ")}
                          </span>
                        </div>

                        <div className="text-sm font-black text-slate-900">
                          {ord.businesses?.name || "Restaurant Partner"}
                        </div>

                        {/* Delivery Handover OTP */}
                        <div className="rounded-xl border border-amber-300 bg-amber-50 p-2.5 flex items-center justify-between">
                          <span className="text-xs font-bold text-amber-900">
                            Rider Delivery OTP:
                          </span>
                          <span className="font-mono text-base font-black tracking-widest text-amber-950 bg-amber-200/80 px-2.5 py-0.5 rounded-lg">
                            {ord.delivery_otp}
                          </span>
                        </div>

                        {ord.delivery_riders && (
                          <div className="text-xs text-slate-600 flex items-center justify-between border-t border-slate-200 pt-2">
                            <span>🛵 Rider: {ord.delivery_riders.full_name}</span>
                            <a
                              href={`tel:${ord.delivery_riders.phone}`}
                              className="font-bold text-blue-600"
                            >
                              📞 Call Rider
                            </a>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Salon & Car Wash Tokens */}
              {activeTokens.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    ✂️🚗 Digital Queue & Bay Tokens
                  </h4>
                  <div className="space-y-3">
                    {activeTokens.map((tok) => (
                      <div
                        key={tok.id}
                        className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="rounded-lg bg-emerald-600 px-2 py-0.5 text-xs font-black text-white">
                            TOKEN #{tok.token_number}
                          </span>
                          <span className="text-[10px] font-bold text-emerald-900 uppercase">
                            {tok.status}
                          </span>
                        </div>
                        <div className="text-sm font-black text-emerald-950">
                          {tok.businesses?.name || "Service Partner"}
                        </div>
                        <p className="text-xs text-emerald-800">{tok.vehicle_or_notes}</p>
                        <div className="text-xs font-semibold text-emerald-900 pt-1 border-t border-emerald-200">
                          ⏳ Approx wait time: ~{tok.estimated_wait_minutes} mins
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Kirana Parchas */}
              {activeParchas.length > 0 && (
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2">
                    🛒 Kirana Parcha Orders
                  </h4>
                  <div className="space-y-3">
                    {activeParchas.map((parcha) => (
                      <div
                        key={parcha.order_id}
                        className="rounded-2xl border border-purple-200 bg-purple-50/70 p-4 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-bold text-purple-900">
                            #{parcha.order_id.slice(-8)}
                          </span>
                          <span className="rounded-md bg-purple-200 px-2 py-0.5 text-[10px] font-black text-purple-900 uppercase">
                            {parcha.hyperlocal_orders?.status || "Parcha Sent"}
                          </span>
                        </div>
                        {parcha.handwritten_text && (
                          <p className="text-xs text-slate-700 italic bg-white/60 p-2 rounded-lg">
                            &ldquo;{parcha.handwritten_text}&rdquo;
                          </p>
                        )}
                        {parcha.merchant_quote_amount ? (
                          <div className="text-xs font-bold text-emerald-700">
                            Dukandar Bill: ₹{parcha.merchant_quote_amount}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-500">
                            Dukandar is preparing the bill...
                          </div>
                        )}
                        {parcha.hyperlocal_orders?.delivery_otp && (
                          <div className="text-xs text-slate-700 flex justify-between border-t border-purple-200 pt-1">
                            <span>Delivery OTP:</span>
                            <span className="font-mono font-black">
                              {parcha.hyperlocal_orders.delivery_otp}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {totalActiveCount === 0 && (
                <div className="text-center py-12 text-slate-400">
                  <span className="text-3xl">📭</span>
                  <p className="text-xs mt-2 font-semibold">No active bookings yet.</p>
                  <p className="text-[11px] mt-0.5">
                    Order food, book a salon queue token, car wash bay, or send a kirana parcha!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Customer Account & Login Modal ── */}
      {isCustomerLoginOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-black uppercase text-blue-800">
                  Customer Profile
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  {customerPhone ? "My Customer Account" : "Sign In to Super-App"}
                </h3>
              </div>
              <button
                onClick={() => setIsCustomerLoginOpen(false)}
                className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {customerPhone ? (
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-blue-50/70 border border-blue-100 p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-black text-slate-900">{customerName || "Customer"}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Active Account
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-mono">📱 +91 {customerPhone}</p>
                  {customerAddress && <p className="text-xs text-slate-500 pt-1">📍 {customerAddress}</p>}
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCustomerLoginOpen(false);
                      setIsMyBookingsOpen(true);
                    }}
                    className="flex-1 rounded-2xl bg-slate-900 py-3 text-xs font-black text-white shadow-md hover:bg-slate-800 transition"
                  >
                    View My Bookings & Passes →
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.removeItem("trustit_cust_name");
                        localStorage.removeItem("trustit_cust_phone");
                        localStorage.removeItem("trustit_cust_addr");
                      } catch {}
                      setCustomerName("");
                      setCustomerPhone("");
                      setCustomerAddress("");
                      setActiveOrders([]);
                      setActiveTokens([]);
                      setActiveParchas([]);
                      setIsCustomerLoginOpen(false);
                    }}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <p className="text-xs text-slate-500">
                  Enter your mobile number to sync your food orders, salon queue tokens, and kirana parchas automatically.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Kumar"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Mobile Number (10 digits)</label>
                  <div className="flex rounded-xl border border-slate-200 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
                    <span className="px-3 py-2 bg-slate-50 text-xs font-bold text-slate-500 border-r border-slate-200">
                      +91
                    </span>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      className="w-full px-3 py-2 text-xs text-slate-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">Delivery Address</label>
                    <button
                      type="button"
                      onClick={handleDetectGps}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      📍 {isDetectingGps ? "Detecting GPS..." : "Auto-fill with GPS"}
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="House/Shop No., Mohalla, Landmark, Bahraich"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900"
                  />
                </div>

                {/* 1-Tap Quick Select Pills */}
                <div>
                  <span className="block text-[11px] font-semibold text-slate-400 mb-1.5">
                    ⚡ Quick 1-Tap Customer Profiles:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const name = "Ramesh Kumar";
                        const phone = "9876543210";
                        const addr = "Civil Lines, Near KDC Chauraha, Bahraich";
                        setCustomerName(name);
                        setCustomerPhone(phone);
                        setCustomerAddress(addr);
                        saveCustomerProfile(name, phone, addr);
                        fetchActiveBookings(phone);
                        setIsCustomerLoginOpen(false);
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-left hover:border-blue-400 hover:bg-blue-50 transition"
                    >
                      <div className="text-xs font-bold text-slate-900">Ramesh Kumar</div>
                      <div className="text-[10px] text-slate-500">+91 98765 43210</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const name = "Priya Sharma";
                        const phone = "9876543211";
                        const addr = "Hospital Road, Salarganj, Bahraich";
                        setCustomerName(name);
                        setCustomerPhone(phone);
                        setCustomerAddress(addr);
                        saveCustomerProfile(name, phone, addr);
                        fetchActiveBookings(phone);
                        setIsCustomerLoginOpen(false);
                      }}
                      className="rounded-xl border border-slate-200 bg-slate-50 p-2 text-left hover:border-blue-400 hover:bg-blue-50 transition"
                    >
                      <div className="text-xs font-bold text-slate-900">Priya Sharma</div>
                      <div className="text-[10px] text-slate-500">+91 98765 43211</div>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={customerPhone.length < 10}
                  onClick={() => {
                    saveCustomerProfile(customerName || "Customer", customerPhone, customerAddress);
                    fetchActiveBookings(customerPhone);
                    setIsCustomerLoginOpen(false);
                  }}
                  className="w-full rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition"
                >
                  Save & Log In →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
