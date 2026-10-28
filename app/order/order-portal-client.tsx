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

export interface DishCustomization {
  portion: "half" | "full";
  portionLabel: string;
  portionPrice: number;
  addons: Array<{ id: string; name: string; price: number }>;
  cookingNotes: string;
}

export interface CartLineItem {
  cartKey: string;
  item: SuperAppCatalogItem;
  quantity: number;
  customization?: DishCustomization;
  itemUnitPrice: number;
}

export const AVAILABLE_ADDONS = [
  { id: "butter", name: "Extra Butter / Desi Ghee", price: 25 },
  { id: "salad", name: "Fresh Salad & Mint Chutney", price: 15 },
  { id: "roti_pav", name: "Butter Roti / Extra Pav (2 pcs)", price: 20 },
  { id: "raita", name: "Boondi Raita Cup", price: 30 },
];

export const QUICK_COOKING_NOTES = [
  "🌶️ Less Spicy / Kam Teekha",
  "🥘 Extra Gravy",
  "🚫 No Onion / Garlic (Jain style)",
  "🔥 Extra Crispy / Well Done",
];

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
  businesses?: { name: string; city: string; address: string | null; phone?: string | null };
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
  businesses?: { name: string; city: string; address: string | null; phone?: string | null };
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
  const [activeTab, setActiveTab] = useState<"food" | "dairy" | "kirana" | "medical" | "car_wash" | "salon">("food");
  const [selectedCity, setSelectedCity] = useState<string>("Bahraich");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Customer Profile stored in local storage
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  // Structured Address Fields (Point 4)
  const [addrHouseNo, setAddrHouseNo] = useState<string>("");
  const [addrMohalla, setAddrMohalla] = useState<string>("");
  const [addrRoad, setAddrRoad] = useState<string>("");
  const [addrPincode, setAddrPincode] = useState<string>("271801");
  const [addrDistrict, setAddrDistrict] = useState<string>("Bahraich");

  const buildAddressString = (h: string, m: string, r: string, p: string, d: string) => {
    return [h.trim(), m.trim(), r.trim(), p.trim() ? `Pin: ${p.trim()}` : "", d.trim() || "Bahraich"].filter(Boolean).join(", ");
  };
  const [isCustomerLoginOpen, setIsCustomerLoginOpen] = useState(false);
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  // Address Book & Multi-Address Management (Image 3 Benchmark)
  type CustomerSavedAddress = {
    id: string;
    tag: "Home" | "Work" | "Other";
    houseNo: string;
    mohalla: string;
    road: string;
    pincode: string;
    district: string;
  };
  const [savedAddresses, setSavedAddresses] = useState<CustomerSavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddressTag, setNewAddressTag] = useState<"Home" | "Work" | "Other">("Home");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isFastDeliveryOnly, setIsFastDeliveryOnly] = useState(false);
  const [isTopRatedOnly, setIsTopRatedOnly] = useState(false);

  // Cart for Food & Sweets
  const [cart, setCart] = useState<{ [cartKey: string]: CartLineItem }>({});
  const [activeStoreModal, setActiveStoreModal] = useState<SuperAppBusiness | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"online" | "cod" | "counter_cash">("online");

  // Customization Bottom Sheet State (Half/Full, Addons, Cooking Notes)
  const [customizingItem, setCustomizingItem] = useState<SuperAppCatalogItem | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<"half" | "full">("half");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [cookingInstruction, setCookingInstruction] = useState<string>("");
  const [riderTip, setRiderTip] = useState<number>(0);

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
      const sH = localStorage.getItem("trustit_cust_house");
      const sM = localStorage.getItem("trustit_cust_mohalla");
      const sR = localStorage.getItem("trustit_cust_road");
      const sP = localStorage.getItem("trustit_cust_pin");
      const sD = localStorage.getItem("trustit_cust_dist");
      if (sH) setAddrHouseNo(sH);
      if (sM) setAddrMohalla(sM);
      if (sR) setAddrRoad(sR);
      if (sP) setAddrPincode(sP);
      if (sD) setAddrDistrict(sD);

      const rawAddrs = localStorage.getItem("trustit_saved_addresses_v1");
      if (rawAddrs) {
        try {
          const parsed = JSON.parse(rawAddrs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
            setSelectedAddressId(parsed[0].id);
          }
        } catch {}
      } else if (sH || sM) {
        const initialAddr: CustomerSavedAddress = {
          id: "addr_default",
          tag: "Home",
          houseNo: sH || "",
          mohalla: sM || "",
          road: sR || "",
          pincode: sP || "271801",
          district: sD || "Bahraich",
        };
        setSavedAddresses([initialAddr]);
        setSelectedAddressId("addr_default");
      }
    } catch {
      // Ignore localStorage availability
    }
  }, []);

  // Save customer info
  const saveCustomerProfile = (
    name: string,
    phone: string,
    address: string,
    struct?: { house?: string; mohalla?: string; road?: string; pin?: string; dist?: string }
  ) => {
    try {
      localStorage.setItem("trustit_cust_name", name);
      localStorage.setItem("trustit_cust_phone", phone);
      localStorage.setItem("trustit_cust_addr", address);
      if (struct) {
        if (struct.house) localStorage.setItem("trustit_cust_house", struct.house);
        if (struct.mohalla) localStorage.setItem("trustit_cust_mohalla", struct.mohalla);
        if (struct.road) localStorage.setItem("trustit_cust_road", struct.road);
        if (struct.pin) localStorage.setItem("trustit_cust_pin", struct.pin);
        if (struct.dist) localStorage.setItem("trustit_cust_dist", struct.dist);
      }
    } catch {}
  };

  // Poll active bookings when customer phone is set
  const fetchActiveBookings = async (phone: string) => {
    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 5) return;
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
        setAddrDistrict("Bahraich");
        if (!addrPincode) setAddrPincode("271801");
        const detectedMohalla = addrMohalla || "Civil Lines / Chowk Area";
        setAddrMohalla(detectedMohalla);
        const auto = buildAddressString(addrHouseNo, detectedMohalla, addrRoad, addrPincode || "271801", "Bahraich");
        setCustomerAddress(auto);
      },
      () => {
        setIsDetectingGps(false);
        alert("GPS location permission denied or timed out.");
      },
      { timeout: 8000 },
    );
  };

  // Real-time Auto-Suggest matching dishes & stores (Image 1 Benchmark)
  const searchSuggestions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q.length < 2) return { dishes: [], stores: [] };

    const matchingDishes = catalogItems
      .filter((item) => item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q))
      .slice(0, 6)
      .map((item) => {
        const store = businesses.find((b) => b.id === item.business_id);
        return { item, storeName: store?.name || "Verified Restaurant", store };
      });

    const matchingStores = businesses
      .filter((b) => b.name.toLowerCase().includes(q) || (b.type || "").toLowerCase().includes(q))
      .slice(0, 4);

    return { dishes: matchingDishes, stores: matchingStores };
  }, [searchQuery, catalogItems, businesses]);

  // Filter businesses by active vertical AND catalog dishes (Image 1 Benchmark)
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      const type = (b.type || "").toLowerCase();
      const name = (b.name || "").toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      // Check if any catalog dish inside this store matches user query (e.g. 'chicken', 'thali')
      const hasMatchingDish = query
        ? catalogItems.some(
            (i) => i.business_id === b.id && (i.name.toLowerCase().includes(query) || i.category.toLowerCase().includes(query))
          )
        : false;

      const matchesSearch = !query || name.includes(query) || type.includes(query) || hasMatchingDish;
      if (!matchesSearch) return false;

      if (isVegOnly) {
        const isVegStore = type.includes("sweet") || type.includes("veg") || type.includes("bakery");
        const hasVegItems = catalogItems.some((i) => i.business_id === b.id && i.item_type === "veg");
        if (!isVegStore && !hasVegItems) return false;
      }

      if (activeTab === "food") {
        return (
          type.includes("restaurant") ||
          type.includes("sweet") ||
          type.includes("fast food") ||
          type.includes("cafe") ||
          type.includes("bakery") ||
          type.includes("cake") ||
          type.includes("food") ||
          type.includes("dhaba") ||
          type.includes("pizza") ||
          type.includes("biryani")
        );
      }
      if (activeTab === "dairy") {
        return (
          type.includes("dairy") ||
          type.includes("milk") ||
          type.includes("doodh") ||
          type.includes("paneer") ||
          type.includes("ghee") ||
          type.includes("sweet")
        );
      }
      if (activeTab === "kirana") {
        return (
          type.includes("supermarket") ||
          type.includes("grocery") ||
          type.includes("kirana") ||
          type.includes("mart") ||
          type.includes("ration") ||
          type.includes("store")
        );
      }
      if (activeTab === "medical") {
        return (
          type.includes("medical") ||
          type.includes("medicine") ||
          type.includes("pharmacy") ||
          type.includes("chemist") ||
          type.includes("clinic") ||
          type.includes("health") ||
          type.includes("hospital")
        );
      }
      if (activeTab === "car_wash") {
        return (
          type.includes("car wash") ||
          type.includes("automobile") ||
          type.includes("bike") ||
          type.includes("garage") ||
          type.includes("detailing")
        );
      }
      if (activeTab === "salon") {
        return (
          type.includes("salon") ||
          type.includes("parlour") ||
          type.includes("barber") ||
          type.includes("beauty") ||
          type.includes("grooming")
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

  // Cart calculations (Swiggy / Zomato Transparent Breakdown)
  const cartItemsList = useMemo(() => Object.values(cart), [cart]);
  const cartSubtotal = useMemo(() => {
    return cartItemsList.reduce((sum, line) => sum + line.itemUnitPrice * line.quantity, 0);
  }, [cartItemsList]);
  const cartPackagingCharge = cartSubtotal > 0 ? 15 : 0;
  const cartGstTax = cartSubtotal > 0 ? Math.round(cartSubtotal * 0.05) : 0;
  const cartDeliveryFee = cartSubtotal >= 499 ? 0 : cartSubtotal > 0 ? 25 : 0;
  const cartPlatformFee = cartSubtotal > 0 ? 3 : 0;
  const cartGrandTotal = cartSubtotal + cartPackagingCharge + cartGstTax + cartDeliveryFee + cartPlatformFee + riderTip;

  const openCustomizer = (item: SuperAppCatalogItem) => {
    setCustomizingItem(item);
    setSelectedPortion("half");
    setSelectedAddons([]);
    setCookingInstruction("");
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;
    const isHalf = selectedPortion === "half";
    const portionPrice = isHalf
      ? Math.max(20, Math.round((customizingItem.price * 0.6) / 5) * 5)
      : customizingItem.price;

    const chosenAddons = AVAILABLE_ADDONS.filter((a) => selectedAddons.includes(a.id));
    const addonsTotal = chosenAddons.reduce((s, a) => s + a.price, 0);
    const unitPrice = portionPrice + addonsTotal;

    const cartKey = `${customizingItem.id}_${selectedPortion}_${selectedAddons.sort().join("-")}_${cookingInstruction.trim().slice(0, 10)}`;

    setCart((prev) => {
      const existing = prev[cartKey];
      const nextQty = (existing?.quantity || 0) + 1;
      return {
        ...prev,
        [cartKey]: {
          cartKey,
          item: customizingItem,
          quantity: nextQty,
          itemUnitPrice: unitPrice,
          customization: {
            portion: selectedPortion,
            portionLabel: isHalf ? "Half Plate (Serves 1)" : "Full Plate (Serves 2-3)",
            portionPrice,
            addons: chosenAddons,
            cookingNotes: cookingInstruction.trim(),
          },
        },
      };
    });

    setCustomizingItem(null);
  };

  const updateCartLineQty = (cartKey: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[cartKey];
      if (!existing) return prev;
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[cartKey];
        return copy;
      }
      return {
        ...prev,
        [cartKey]: { ...existing, quantity: nextQty },
      };
    });
  };

  // Place Food Order
  const handlePlaceFoodOrder = () => {
    if (!customerName.trim() || !customerPhone.trim() || !customerAddress.trim()) {
      alert("Please fill in your Name, 10-digit Phone, and Delivery Address.");
      return;
    }
    const targetBizId = activeStoreModal?.id || cartItemsList[0]?.item?.business_id;
    if (cartItemsList.length === 0 || !targetBizId) {
      alert("Your cart is empty.");
      return;
    }

    startTransition(async () => {
      try {
        saveCustomerProfile(customerName, customerPhone, customerAddress, { house: addrHouseNo, mohalla: addrMohalla, road: addrRoad, pin: addrPincode, dist: addrDistrict });

        const res = await fetch("/api/hyperlocal/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: targetBizId,
            orderType: "food_delivery",
            customerName,
            customerPhone,
            customerAddress: { street: customerAddress, city: selectedCity },
            paymentMode,
            customerNotes: [
              customerAddress ? `Drop: ${customerAddress}` : "",
              riderTip > 0 ? `Rider Tip: ₹${riderTip}` : "",
            ].filter(Boolean).join(" | "),
            items: cartItemsList.map((c) => ({
              item_name: c.customization
                ? `${c.item.name} (${c.customization.portion === "half" ? "Half" : "Full"})`
                : c.item.name,
              quantity: c.quantity,
              unit_price: c.itemUnitPrice,
              is_veg: c.item.item_type === "veg",
              notes: [
                c.customization?.addons?.length
                  ? `Addons: ${c.customization.addons.map((a) => a.name).join(", ")}`
                  : "",
                c.customization?.cookingNotes
                  ? `Chef: ${c.customization.cookingNotes}`
                  : "",
              ]
                .filter(Boolean)
                .join(" | "),
            })),
          }),
        });

        const data = await res.json();
        if (data.success) {
          if (data.order) {
            setActiveOrders((prev) => [data.order, ...prev.filter((o) => o.id !== data.order.id)]);
          }
          setCart({});
          setRiderTip(0);
          setIsCheckoutOpen(false);
          setActiveStoreModal(null);
          setBookingSuccessNotice(
            `Order Placed Successfully (${paymentMode === "online" ? "Online Paid" : "Pay on Delivery"})! Your Order ID is #${data.orderId.slice(-8)}. Delivery OTP: ${data.deliveryOtp}`,
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
      {/* ── Top Super-App Header (Compact 44px Native Mobile Bar) ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-250 shadow-2xs">
        <div className="max-w-md mx-auto px-3 py-2 flex items-center justify-between gap-2">
          {/* Location Picker */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-blue-600 text-xs font-black text-white shadow-xs">
              ⚡
            </span>
            <div className="min-w-0 leading-tight">
              <div className="flex items-center gap-1">
                <span className="text-xs font-black text-slate-900 truncate">Bahraich</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = selectedCity === "Bahraich" ? "Lucknow" : "Bahraich";
                    setSelectedCity(next);
                  }}
                  className="text-[10px] text-blue-600 font-bold"
                >
                  ▼
                </button>
              </div>
              <span className="block text-[9px] text-slate-500 font-medium truncate">
                Uttar Pradesh · Verified Local
              </span>
            </div>
          </div>

          {/* Right Action Icons (Compact 32px pills) */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsMyBookingsOpen(true)}
              className="relative grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition text-sm"
              title="My Bookings"
              aria-label="My Bookings"
            >
              📋
              {totalActiveCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[9px] font-black text-slate-950 animate-pulse">
                  {totalActiveCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCustomerLoginOpen(true)}
              className="flex items-center gap-1 rounded-xl bg-slate-900 px-2.5 py-1.5 text-[11px] font-bold text-white shadow-xs hover:bg-slate-800 transition"
            >
              <span>👤</span>
              <span className="max-w-[65px] truncate">
                {customerPhone ? (customerName ? customerName.split(" ")[0] : "Account") : "Log In"}
              </span>
            </button>
          </div>
        </div>

        {/* ── Slim Search Bar (Height 34px) with Auto-Suggest (Image 1 Benchmark) ── */}
        <div className="max-w-md mx-auto px-3 pb-2 relative">
          <div className="relative flex items-center">
            <span className="absolute left-3 text-slate-400 text-xs">🔍</span>
            <input
              type="text"
              placeholder={
                activeTab === "food"
                  ? "Search chicken, thali, biryani, sweets..."
                  : activeTab === "salon"
                    ? "Search haircut, barber, facial..."
                    : activeTab === "car_wash"
                      ? "Search car foam wash, bike wash..."
                      : "Search atta, mustard oil, grocery parcha..."
              }
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-100/90 pl-8 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 grid h-5 w-5 place-items-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600 hover:bg-slate-300"
              >
                ✕
              </button>
            )}
          </div>

          {/* Real-time Predictive Dropdown Tray (Swiggy / Zomato Benchmark) */}
          {searchQuery.trim().length >= 2 && (searchSuggestions.dishes.length > 0 || searchSuggestions.stores.length > 0) && (
            <div className="absolute top-full left-3 right-3 mt-1.5 z-50 rounded-2xl bg-white border border-slate-200 shadow-2xl p-2 space-y-2 text-xs">
              {searchSuggestions.dishes.length > 0 && (
                <div>
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-0.5">
                    Dishes & Products ({searchSuggestions.dishes.length})
                  </span>
                  {searchSuggestions.dishes.map(({ item, storeName, store }) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        if (store) setActiveStoreModal(store);
                        openCustomizer(item);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-orange-50 text-left transition group"
                    >
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 group-hover:text-orange-600 flex items-center gap-1.5 truncate">
                          <span>{item.item_type === "veg" ? "🌱" : "🍗"}</span>
                          <span className="truncate">{item.name}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 truncate block">from {storeName}</span>
                      </div>
                      <span className="text-xs font-black text-slate-900 shrink-0 ml-2">₹{item.price}</span>
                    </button>
                  ))}
                </div>
              )}

              {searchSuggestions.stores.length > 0 && (
                <div className="border-t border-slate-100 pt-1.5">
                  <span className="block text-[10px] font-black uppercase tracking-wider text-slate-400 px-2 py-0.5">
                    Matching Restaurants & Stores
                  </span>
                  {searchSuggestions.stores.map((store) => (
                    <button
                      key={store.id}
                      type="button"
                      onClick={() => {
                        setActiveStoreModal(store);
                        setSearchQuery("");
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-left transition"
                    >
                      <div className="min-w-0">
                        <span className="font-bold text-slate-900 truncate block">{store.name}</span>
                        <span className="text-[10px] text-slate-500 capitalize">{store.type || "Store"} · Bahraich</span>
                      </div>
                      <span className="text-xs text-blue-600 font-bold shrink-0">View Menu →</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── 6 Hero Horizontal Applet Bubbles (Point 5 Sequence) ── */}
        <div className="max-w-xl mx-auto px-3 pb-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 min-w-max pb-0.5">
            {[
              { id: "food", label: "Food & Sweets", icon: "🍔", activeColor: "bg-orange-50 border-orange-300 text-orange-800" },
              { id: "dairy", label: "Milk & Products", icon: "🥛", activeColor: "bg-sky-50 border-sky-300 text-sky-800" },
              { id: "kirana", label: "Groceries", icon: "🛒", activeColor: "bg-purple-50 border-purple-300 text-purple-800" },
              { id: "medical", label: "Medical / Medicine 💊", icon: "💊", activeColor: "bg-rose-50 border-rose-300 text-rose-800" },
              { id: "car_wash", label: "Car Wash", icon: "🚗", activeColor: "bg-blue-50 border-blue-300 text-blue-800" },
              { id: "salon", label: "Salon & Grooming", icon: "✂️", activeColor: "bg-emerald-50 border-emerald-300 text-emerald-800" },
            ].map((cat) => {
              const active = activeTab === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveTab(cat.id as typeof activeTab)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-2 transition border text-xs font-bold shrink-0 ${
                    active
                      ? `${cat.activeColor} shadow-2xs font-black`
                      : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300"
                  }`}
                >
                  <span className="text-base leading-none">{cat.icon}</span>
                  <span className="whitespace-nowrap">{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick Swiggy / Zomato Filter Pills */}
        <div className="max-w-md mx-auto px-3 pb-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border transition shrink-0 ${
              isVegOnly
                ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>🌱</span>
            <span>Pure Veg</span>
          </button>

          <button
            type="button"
            onClick={() => setIsFastDeliveryOnly(!isFastDeliveryOnly)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border transition shrink-0 ${
              isFastDeliveryOnly
                ? "bg-amber-500 text-slate-950 border-amber-500 shadow-2xs font-black"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>⚡</span>
            <span>Fast Delivery</span>
          </button>

          <button
            type="button"
            onClick={() => setIsTopRatedOnly(!isTopRatedOnly)}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold border transition shrink-0 ${
              isTopRatedOnly
                ? "bg-blue-600 text-white border-blue-600 shadow-2xs font-black"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span>★</span>
            <span>Rating 4.0+</span>
          </button>
        </div>
      </header>

      {/* ── Notification Banner if any booking just created ── */}
      {bookingSuccessNotice && (
        <div className="max-w-md mx-auto px-3 pt-2">
          <div className="flex items-center justify-between rounded-xl bg-emerald-500 p-2.5 text-white shadow-sm text-xs">
            <div className="flex items-center gap-2">
              <span>🎉</span>
              <p className="text-[11px] font-bold leading-tight">{bookingSuccessNotice}</p>
            </div>
            <button
              onClick={() => setBookingSuccessNotice(null)}
              className="rounded bg-emerald-700 px-2 py-0.5 text-[10px] font-bold shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Main Listings Content (Native Mobile Card Scale) ── */}
      <main className="max-w-md mx-auto px-3 pt-2.5">
        {/* Slim Promotional Pill (Replaces the 60% viewport giant dark box) */}
        <div className="mb-3 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2 flex items-center justify-between text-xs text-amber-900 shadow-2xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-sm">⚡</span>
            <span className="text-[11px] font-bold truncate">
              {activeTab === "food" && "Free Delivery above ₹499 · 25-35m Express"}
              {activeTab === "salon" && "Live Token · Bina dukan me baithe number lagayein"}
              {activeTab === "car_wash" && "Bay 1 / Bay 2 Live Availability · No waiting"}
              {activeTab === "kirana" && "Parcha ki photo bhejein · Dukan se direct delivery"}
            </span>
          </div>
          <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-200/80 px-1.5 py-0.5 rounded">
            Live UP
          </span>
        </div>

        {/* ── Business Cards List (Refined Native Scale: 12-14px) ── */}
        <div className="space-y-2.5">
          {filteredBusinesses.map((biz) => {
            const bizItems = catalogItems.filter((i) => i.business_id === biz.id);

            return (
              <div
                key={biz.id}
                className="rounded-2xl border border-slate-200 bg-white p-3 shadow-2xs hover:border-slate-300 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-700">
                          {biz.type}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1 rounded">
                          ★ 4.8
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-bold text-slate-900 truncate">
                        {biz.name}
                      </h3>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">
                        📍 {biz.address || `${biz.city}, UP`}
                      </p>
                    </div>
                  </div>

                  {/* Highlights / Features per Vertical */}
                  <div className="mt-2 rounded-xl bg-slate-50 p-2 text-[11px] text-slate-700 space-y-0.5">
                    {activeTab === "food" && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">🛵 Delivery:</span>
                          <span className="font-bold text-slate-900">25–35 Mins</span>
                        </div>
                        <div className="text-[10px] text-slate-500 truncate pt-0.5">
                          {bizItems.length > 0
                            ? bizItems.slice(0, 3).map((i) => i.name).join(", ")
                            : "Freshly prepared dining & takeaway"}
                        </div>
                      </>
                    )}

                    {activeTab === "salon" && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">🟢 Serving Now:</span>
                          <span className="font-bold text-emerald-700">Token #04</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">Waiting in line:</span>
                          <span className="font-bold text-amber-700">2 Persons (~20m)</span>
                        </div>
                      </>
                    )}

                    {activeTab === "car_wash" && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">🚿 Bay 1:</span>
                          <span className="font-bold text-amber-700">Busy (10m left)</span>
                        </div>
                        <div className="flex items-center justify-between text-[10px]">
                          <span className="text-slate-500">🚿 Bay 2:</span>
                          <span className="font-bold text-emerald-700">Free Now 🟢</span>
                        </div>
                      </>
                    )}

                    {activeTab === "kirana" && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">📝 Parcha:</span>
                          <span className="font-bold text-purple-700">Photo / List Accepted</span>
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Atta, Oil, Sugar, Spices, Dairy & Daily Essentials
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Primary Action Button */}
                <div className="mt-2.5 pt-2 border-t border-slate-100">
                  {(activeTab === "food" || activeTab === "dairy") && (
                    <button
                      type="button"
                      onClick={() => setActiveStoreModal(biz)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 py-2 text-xs font-bold text-white shadow-xs hover:from-orange-600 hover:to-amber-600 transition"
                    >
                      <span>{activeTab === "dairy" ? "🥛 View Milk & Dairy Items" : "🍽️ View Menu & Order"}</span>
                      <span>→</span>
                    </button>
                  )}

                  {activeTab === "medical" && (
                    <button
                      type="button"
                      onClick={() => setKiranaModal(biz)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 py-2 text-xs font-bold text-white shadow-xs hover:from-rose-700 hover:to-pink-700 transition"
                    >
                      <span>💊 Send Medicine Parcha / Rx</span>
                      <span>→</span>
                    </button>
                  )}

                  {activeTab === "kirana" && (
                    <button
                      type="button"
                      onClick={() => setKiranaModal(biz)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2 text-xs font-bold text-white shadow-xs hover:from-purple-700 hover:to-pink-700 transition"
                    >
                      <span>📝 Send Grocery Parcha</span>
                      <span>→</span>
                    </button>
                  )}

                  {activeTab === "car_wash" && (
                    <button
                      type="button"
                      onClick={() => setCarWashModal(biz)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2 text-xs font-bold text-white shadow-xs hover:from-blue-700 hover:to-indigo-700 transition"
                    >
                      <span>🚗 Book Bay Slot</span>
                      <span>→</span>
                    </button>
                  )}

                  {activeTab === "salon" && (
                    <button
                      type="button"
                      onClick={() => setSalonModal(biz)}
                      className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-2 text-xs font-bold text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 transition"
                    >
                      <span>✂️ Book Queue Pass</span>
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
        <div className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-slate-200 p-3 shadow-2xl">
          <div className="max-w-md mx-auto flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] font-semibold text-slate-500">
                {cartItemsList.length} items in cart
              </span>
              <div className="text-base font-black text-slate-900">
                ₹{cartGrandTotal}{" "}
                <span className="text-[10px] font-normal text-slate-500">
                  (incl. fee)
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-5 py-2.5 text-xs font-black text-white shadow-md hover:from-orange-600 hover:to-amber-700 transition"
            >
              <span>Checkout</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* ── Native Sticky Bottom Navigation Bar (Zomato/Blinkit Mobile Scale) ── */}
      {cartItemsList.length === 0 && (
        <nav
          aria-label="Bottom Navigation"
          className="fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-slate-200 py-1 px-2 shadow-lg sm:hidden"
        >
          <div className="max-w-md mx-auto grid grid-cols-4 text-center">
            <button
              type="button"
              onClick={() => setActiveTab("food")}
              className={`flex flex-col items-center justify-center py-1 ${
                activeTab === "food" ? "text-orange-600 font-bold" : "text-slate-500"
              }`}
            >
              <span className="text-base leading-none">🍔</span>
              <span className="text-[10px] mt-0.5">Food</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("salon")}
              className={`flex flex-col items-center justify-center py-1 ${
                activeTab === "salon" ? "text-emerald-600 font-bold" : "text-slate-500"
              }`}
            >
              <span className="text-base leading-none">✂️</span>
              <span className="text-[10px] mt-0.5">Salon Queue</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMyBookingsOpen(true)}
              className="relative flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-900"
            >
              <span className="text-base leading-none">📋</span>
              <span className="text-[10px] mt-0.5">Bookings</span>
              {totalActiveCount > 0 && (
                <span className="absolute top-0 right-5 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-amber-500 px-0.5 text-[8px] font-black text-slate-950">
                  {totalActiveCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsCustomerLoginOpen(true)}
              className="flex flex-col items-center justify-center py-1 text-slate-500 hover:text-slate-900"
            >
              <span className="text-base leading-none">👤</span>
              <span className="text-[10px] mt-0.5">{customerPhone ? "Account" : "Log In"}</span>
            </button>
          </div>
        </nav>
      )}

      {/* ── Store Menu Modal for Food & Sweets ── */}
      {activeStoreModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 p-3.5 sm:p-4">
              <div>
                <span className="rounded-md bg-orange-100 px-2 py-0.5 text-[9px] font-black uppercase text-orange-800">
                  {activeStoreModal.type}
                </span>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5">{activeStoreModal.name}</h2>
                <p className="text-[11px] text-slate-500">📍 {activeStoreModal.address}</p>
              </div>
              <button
                onClick={() => setActiveStoreModal(null)}
                className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Menu Items List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
              {activeStoreItems.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <p className="text-xs">Store items are being updated by merchant.</p>
                </div>
              ) : (
                activeStoreItems.map((item) => {
                  const lineItemsForThisItem = cartItemsList.filter((c) => c.item.id === item.id);
                  const inCartQty = lineItemsForThisItem.reduce((s, c) => s + c.quantity, 0);

                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-2.5 sm:p-3 hover:bg-slate-50 transition"
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-0.5 grid h-3.5 w-3.5 place-items-center rounded-xs border text-[9px] font-black ${
                            item.item_type === "veg"
                              ? "border-emerald-600 text-emerald-600"
                              : "border-rose-600 text-rose-600"
                          }`}
                        >
                          ●
                        </span>
                        <div>
                          <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.name}</h4>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-xs font-black text-slate-800">₹{item.price}</span>
                            <span className="text-[9px] text-slate-400">· Full / Half available</span>
                          </div>
                          {item.description && (
                            <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                              {item.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {inCartQty > 0 ? (
                          <div className="flex items-center gap-2 rounded-xl bg-orange-600 px-2 py-1 text-white font-black text-xs shadow-xs">
                            <button
                              type="button"
                              onClick={() => {
                                if (lineItemsForThisItem.length > 0) {
                                  updateCartLineQty(lineItemsForThisItem[0].cartKey, -1);
                                }
                              }}
                              className="px-1.5 hover:scale-125 transition"
                            >
                              -
                            </button>
                            <span>{inCartQty}</span>
                            <button
                              type="button"
                              onClick={() => openCustomizer(item)}
                              className="px-1.5 hover:scale-125 transition"
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => openCustomizer(item)}
                            className="rounded-xl border border-orange-500 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 hover:bg-orange-500 hover:text-white transition shadow-2xs"
                          >
                            + ADD
                          </button>
                        )}
                        <span className="text-[9px] text-slate-400 font-medium">customisable</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer with Cart Summary */}
            {cartItemsList.length > 0 && (
              <div className="border-t border-slate-200 bg-slate-50 p-3 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-slate-500">{cartItemsList.length} items in cart</span>
                  <div className="text-sm font-black text-slate-900">₹{cartGrandTotal}</div>
                </div>
                <button
                  onClick={() => {
                    setIsCheckoutOpen(true);
                  }}
                  className="rounded-xl bg-orange-600 px-4 py-2 text-xs font-black text-white shadow-md hover:bg-orange-700 transition"
                >
                  Go to Checkout →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Dish Customization Modal (Half/Full Plate, Addons, Cooking Notes) ── */}
      {customizingItem && (
        <div className="fixed inset-0 z-60 flex items-end sm:items-center justify-center bg-slate-950/70 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl max-h-[88vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4">
            {/* Header */}
            <div className="p-3.5 border-b border-slate-100 flex items-start justify-between">
              <div>
                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                    customizingItem.item_type === "veg"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800"
                  }`}
                >
                  {customizingItem.item_type === "veg" ? "● Pure Veg" : "● Non-Veg"}
                </span>
                <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">{customizingItem.name}</h3>
                <p className="text-[10px] text-slate-500">Base full price: ₹{customizingItem.price}</p>
              </div>
              <button
                type="button"
                onClick={() => setCustomizingItem(null)}
                className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Options */}
            <div className="p-3.5 space-y-3 overflow-y-auto flex-1 text-xs">
              {/* 1. Portion / Quantity Size */}
              <div>
                <span className="block font-black text-slate-900 mb-1.5 uppercase text-[9px] tracking-wider">
                  1. Choose Portion Size (Required)
                </span>
                <div className="space-y-1.5">
                  <label
                    onClick={() => setSelectedPortion("half")}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      selectedPortion === "half"
                        ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-500"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedPortion === "half"}
                        onChange={() => setSelectedPortion("half")}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">Half Plate</span>
                        <span className="text-[9px] text-slate-500">Serves 1 person</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-xs">
                      ₹{Math.max(20, Math.round((customizingItem.price * 0.6) / 5) * 5)}
                    </span>
                  </label>

                  <label
                    onClick={() => setSelectedPortion("full")}
                    className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition ${
                      selectedPortion === "full"
                        ? "border-orange-500 bg-orange-50/60 ring-1 ring-orange-500"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        checked={selectedPortion === "full"}
                        onChange={() => setSelectedPortion("full")}
                        className="text-orange-600 focus:ring-orange-500"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block text-xs">Full Plate</span>
                        <span className="text-[9px] text-slate-500">Serves 2-3 persons</span>
                      </div>
                    </div>
                    <span className="font-black text-slate-900 text-xs">₹{customizingItem.price}</span>
                  </label>
                </div>
              </div>

              {/* 2. Add-ons & Extras */}
              <div>
                <span className="block font-black text-slate-900 mb-1.5 uppercase text-[9px] tracking-wider">
                  2. Add-ons & Extras (Optional)
                </span>
                <div className="space-y-1.5">
                  {AVAILABLE_ADDONS.map((addon) => {
                    const isChecked = selectedAddons.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        onClick={() => {
                          setSelectedAddons((prev) =>
                            isChecked ? prev.filter((id) => id !== addon.id) : [...prev, addon.id],
                          );
                        }}
                        className={`flex items-center justify-between p-2 rounded-xl border cursor-pointer transition ${
                          isChecked ? "border-orange-400 bg-orange-50/40" : "border-slate-200 bg-white"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {}}
                            className="rounded text-orange-600 focus:ring-orange-500"
                          />
                          <span className="text-slate-800 font-bold text-[10px]">{addon.name}</span>
                        </div>
                        <span className="font-black text-slate-900 text-[11px]">+₹{addon.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3. Cooking Instructions */}
              <div>
                <span className="block font-black text-slate-900 mb-1 uppercase text-[9px] tracking-wider">
                  3. Cooking Instructions (Chef Note)
                </span>
                <div className="flex flex-wrap gap-1 mb-1.5">
                  {QUICK_COOKING_NOTES.map((note) => (
                    <button
                      key={note}
                      type="button"
                      onClick={() =>
                        setCookingInstruction((prev) =>
                          prev.includes(note) ? prev : `${prev} ${note}`.trim(),
                        )
                      }
                      className="px-1.5 py-0.5 rounded-lg bg-slate-100 hover:bg-orange-100 hover:text-orange-800 text-slate-700 text-[9px] font-bold transition"
                    >
                      + {note}
                    </button>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder="e.g. Kam mirch rakhna, extra salad packet"
                  value={cookingInstruction}
                  onChange={(e) => setCookingInstruction(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Bottom Add CTA */}
            <div className="p-2.5 sm:p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-400 block font-medium">Item Total</span>
                <span className="text-sm font-black text-slate-900">
                  ₹
                  {(selectedPortion === "half"
                    ? Math.max(20, Math.round((customizingItem.price * 0.6) / 5) * 5)
                    : customizingItem.price) +
                    AVAILABLE_ADDONS.filter((a) => selectedAddons.includes(a.id)).reduce(
                      (s, a) => s + a.price,
                      0,
                    )}
                </span>
              </div>
              <button
                type="button"
                onClick={handleConfirmCustomization}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-600 text-white rounded-xl text-xs font-bold shadow-md hover:from-orange-600 hover:to-amber-700 transition"
              >
                Add Item to Cart →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Checkout Modal for Food Order ── */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-3.5 sm:p-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-sm font-black text-slate-900">🛵 Order Checkout</h3>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-600 text-xs hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-2.5">
              {/* Order Items Preview */}
              <div className="rounded-xl border border-slate-100 bg-slate-50 p-2.5 space-y-1.5 text-xs">
                <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
                  Items in Cart ({cartItemsList.length})
                </span>
                {cartItemsList.map((entry) => (
                  <div key={entry.cartKey} className="flex justify-between items-start gap-2 border-b border-slate-200/60 pb-1.5 last:border-0 last:pb-0">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{entry.item.name}</span>
                        {entry.customization && (
                          <span className="rounded bg-orange-100 px-1.5 py-0.2 text-[9px] font-bold text-orange-800">
                            {entry.customization.portion === "half" ? "Half" : "Full"}
                          </span>
                        )}
                      </div>
                      {entry.customization?.addons && entry.customization.addons.length > 0 && (
                        <p className="text-[9px] text-slate-500">
                          + {entry.customization.addons.map((a) => a.name).join(", ")}
                        </p>
                      )}
                      {entry.customization?.cookingNotes && (
                        <p className="text-[9px] text-amber-700 italic">
                          Note: {entry.customization.cookingNotes}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[11px] font-bold text-slate-800">
                        {entry.quantity} x ₹{entry.itemUnitPrice} = ₹{entry.quantity * entry.itemUnitPrice}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Kumar"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Mobile Number (10 digits)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-orange-500"
                />
              </div>

              {/* Customer Saved Address Book & Switcher (Image 3 Benchmark) */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs">📍</span>
                    <label className="text-[11px] font-black text-slate-900">Delivery Address</label>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(true)}
                    className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
                  >
                    + Add Another Address
                  </button>
                </div>

                {/* Saved Address Quick Selector Chips */}
                {savedAddresses.length > 0 && (
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {savedAddresses.map((addr) => {
                      const isSel = selectedAddressId === addr.id;
                      return (
                        <button
                          key={addr.id}
                          type="button"
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            setAddrHouseNo(addr.houseNo);
                            setAddrMohalla(addr.mohalla);
                            setAddrRoad(addr.road);
                            setAddrPincode(addr.pincode);
                            setAddrDistrict(addr.district);
                            const full = buildAddressString(addr.houseNo, addr.mohalla, addr.road, addr.pincode, addr.district);
                            setCustomerAddress(full);
                          }}
                          className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 border text-[10px] font-bold shrink-0 transition ${
                            isSel
                              ? "bg-orange-50 border-orange-400 text-orange-950 shadow-2xs font-black"
                              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          <span>{addr.tag === "Home" ? "🏠" : addr.tag === "Work" ? "💼" : "📍"}</span>
                          <span>{addr.tag}</span>
                          <span className="text-[9px] text-slate-400 font-normal truncate max-w-[80px]">({addr.mohalla || addr.houseNo})</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Active Deliver-to Card */}
                <div className="rounded-lg border border-slate-200 bg-white p-2 text-xs shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {addrHouseNo ? `${addrHouseNo}, ${addrMohalla || "Bahraich"}` : (addrMohalla || "Bahraich Location")}
                    </span>
                    <button
                      type="button"
                      onClick={handleDetectGps}
                      className="text-[10px] font-bold text-blue-600 hover:underline"
                    >
                      📍 {isDetectingGps ? "Detecting..." : "GPS Auto"}
                    </button>
                  </div>
                  <p className="mt-0.5 text-[10px] text-slate-600 font-mono">
                    {customerAddress || "House No, Mohalla, Road, Bahraich"}
                  </p>
                </div>
              </div>

              {/* Delivery Partner Tip (Swiggy / Zomato Feature) */}
              <div>
                <label className="block text-[10px] font-bold text-slate-700 mb-1">
                  🛵 Delivery Partner Tip (Optional)
                </label>
                <div className="flex items-center gap-1.5">
                  {[0, 10, 20, 30, 50].map((tip) => (
                    <button
                      key={tip}
                      type="button"
                      onClick={() => setRiderTip(tip)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                        riderTip === tip
                          ? "bg-amber-500 text-slate-950 shadow-xs"
                          : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {tip === 0 ? "No Tip" : `₹${tip}`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Swiggy / Zomato Transparent Bill Breakdown */}
              <div className="rounded-xl bg-slate-50 p-2.5 text-xs space-y-1 border border-slate-100">
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Items Total:</span>
                  <span className="font-bold text-slate-900">₹{cartSubtotal}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Restaurant Packaging Charges:</span>
                  <span className="font-bold text-slate-900">₹{cartPackagingCharge}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Govt. Taxes & GST (5%):</span>
                  <span className="font-bold text-slate-900">₹{cartGstTax}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Delivery Partner Fee:</span>
                  <span className="font-bold text-slate-900">
                    {cartDeliveryFee === 0 ? "FREE" : `₹${cartDeliveryFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Platform Convenience Fee:</span>
                  <span className="font-bold text-slate-900">₹{cartPlatformFee}</span>
                </div>
                {riderTip > 0 && (
                  <div className="flex justify-between text-[11px] text-emerald-700 font-medium">
                    <span>Delivery Tip:</span>
                    <span className="font-bold">₹{riderTip}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-slate-200 pt-1.5 text-xs font-black text-slate-900">
                  <span>Total Amount Payable:</span>
                  <span className="text-sm font-black text-orange-600">₹{cartGrandTotal}</span>
                </div>
              </div>

              {/* Payment Mode */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Payment Method</label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMode("cod")}
                    className={`rounded-xl border p-2 text-xs font-bold transition ${
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
                    className={`rounded-xl border p-2 text-xs font-bold transition ${
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
                className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:from-orange-600 hover:to-amber-700 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Placing Order..." : `Place Order (₹${cartGrandTotal}) →`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Salon Digital Queue Token Modal ── */}
      {salonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[9px] font-black uppercase text-emerald-800">
                  Live Queue Token
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-0.5">{salonModal.name}</h3>
              </div>
              <button
                onClick={() => setSalonModal(null)}
                className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-600 text-xs hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700">Select Service</label>
                <select
                  value={salonService}
                  onChange={(e) => setSalonService(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Executive Haircut & Styling (₹150)">Executive Haircut & Styling (₹150)</option>
                  <option value="Beard Trim & Shaper (₹80)">Beard Trim & Shaper (₹80)</option>
                  <option value="Haircut + Beard Combo (₹200)">Haircut + Beard Combo (₹200)</option>
                  <option value="O3+ D-Tan Facial (₹450)">O3+ D-Tan Facial (₹450)</option>
                  <option value="Keratin Hair Spa (₹750)">Keratin Hair Spa (₹750)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Barber / Stylist Preference</label>
                <select
                  value={salonStylist}
                  onChange={(e) => setSalonStylist(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="Any Available Stylist">Any First Available Stylist (Fastest)</option>
                  <option value="Master Barber Imran">Master Barber Imran</option>
                  <option value="Stylist Rahul">Stylist Rahul</option>
                  <option value="Senior Artist Sonu">Senior Artist Sonu</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Your Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Vicky Verma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Mobile Number (SMS/WhatsApp Token)</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="rounded-xl bg-emerald-50 p-2.5 text-[11px] text-emerald-950 border border-emerald-100">
                <span className="font-bold block mb-0.5">💡 Token Ka Fayda:</span>
                Dukan me wait karne ki zaroorat nahi. Token lein aur number aane par 5 minute pehle dukan pahuchein!
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBookSalonToken}
                className="w-full rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:from-emerald-700 hover:to-teal-800 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Issuing Digital Pass..." : "Confirm Live Queue Token (Free) →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Car Wash Bay Booking Modal ── */}
      {carWashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[9px] font-black uppercase text-blue-800">
                  Bay Slot Booking
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-0.5">{carWashModal.name}</h3>
              </div>
              <button
                onClick={() => setCarWashModal(null)}
                className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-600 text-xs hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700">Wash Package</label>
                <select
                  value={carWashPackage}
                  onChange={(e) => setCarWashPackage(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                >
                  <option value="Full Foam Car Wash & Vacuuming (₹350)">Full Foam Car Wash & Vacuuming (₹350)</option>
                  <option value="Bike Foam Wash & Chain Lube (₹100)">Bike Foam Wash & Chain Lube (₹100)</option>
                  <option value="Teflon Body Coating & Polish (₹1200)">Teflon Body Coating & Polish (₹1200)</option>
                  <option value="Interior Deep Steam Wash (₹700)">Interior Deep Steam Wash (₹700)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Vehicle Number (Required)</label>
                <input
                  type="text"
                  placeholder="e.g. UP 40 AB 1234"
                  value={vehicleNumber}
                  onChange={(e) => setVehicleNumber(e.target.value.toUpperCase())}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Vehicle Model (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Swift / Creta / Splendor"
                  value={vehicleModel}
                  onChange={(e) => setVehicleModel(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Your Mobile Number</label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleBookCarWashSlot}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-800 disabled:opacity-50 transition"
              >
                {isSubmitting ? "Allocating Bay..." : "Confirm Bay Slot Token →"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Kirana Handwritten Parcha Upload Modal ── */}
      {kiranaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-4 sm:p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="rounded-md bg-purple-100 px-2 py-0.5 text-[9px] font-black uppercase text-purple-800">
                  Kirana Handwritten Parcha
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-0.5">{kiranaModal.name}</h3>
              </div>
              <button
                onClick={() => setKiranaModal(null)}
                className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-600 text-xs hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-3 space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  📸 Parcha (Kagaz Ki Parchi) Ki Photo Upload Karein
                </label>
                <div className="relative rounded-xl border-2 border-dashed border-purple-200 bg-purple-50/50 p-3 text-center">
                  {parchaImagePreview ? (
                    <div className="relative">
                      <img
                        src={parchaImagePreview}
                        alt="Parcha preview"
                        className="max-h-36 mx-auto rounded-lg shadow-xs"
                      />
                      <button
                        type="button"
                        onClick={() => setParchaImagePreview(null)}
                        className="mt-1.5 text-[11px] font-bold text-rose-600 hover:underline"
                      >
                        Remove Photo
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-2xl">📷</span>
                      <p className="mt-0.5 text-[11px] text-slate-600 font-semibold">
                        Kagaz ki parchi ki photo kheinchein ya gallery se chunein
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
                <label className="block text-[11px] font-bold text-slate-700">
                  Ya Yahan Samaan Ki List Likh Dein (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 5kg Ashirvaad Atta, 1L Fortune Mustard Oil, 2kg Sugar..."
                  value={parchaText}
                  onChange={(e) => setParchaText(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700">Delivery Address</label>
                <textarea
                  rows={2}
                  placeholder="Makaan No., Mohalla, Landmark, Bahraich"
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Name</label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-700">Phone</label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-purple-50 p-2.5 text-[11px] text-purple-950 border border-purple-100">
                <span className="font-bold block mb-0.5">ℹ️ Dukandar Process:</span>
                Dukandar parcha dekh kar bill banayega aur rider delivery par payment receive karega.
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitParcha}
                className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 transition"
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
            <div className="flex items-center justify-between border-b border-slate-200 p-3.5 sm:p-4">
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900">📋 My Active Bookings</h3>
                <p className="text-[10px] text-slate-500">
                  Live updates for {customerPhone ? `+91 ${customerPhone}` : "your mobile number"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchActiveBookings(customerPhone)}
                  className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-700 hover:bg-slate-200"
                >
                  {isRefreshingBookings ? "↻ Syncing..." : "↻ Refresh"}
                </button>
                <button
                  onClick={() => setIsMyBookingsOpen(false)}
                  className="grid h-7 w-7 place-items-center rounded-full bg-slate-100 text-slate-600 text-xs"
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
                    {activeOrders.map((ord) => {
                      // 6-stage Swiggy / Zomato order stepper logic
                      let stepIndex = 0;
                      if (ord.status === "placed") stepIndex = 0;
                      else if (ord.status === "accepted_by_merchant" || ord.status === "preparing") stepIndex = 1;
                      else if (ord.status === "ready_for_pickup") stepIndex = 2;
                      else if (ord.status === "rider_assigned") stepIndex = 3;
                      else if (ord.status === "picked_up" || ord.status === "out_for_delivery" || ord.status === "arrived_at_doorstep") stepIndex = 4;
                      else if (ord.status === "delivered" || ord.status === "completed") stepIndex = 5;

                      const STEPS = [
                        { label: "Placed", icon: "📝" },
                        { label: "Kitchen", icon: "👨‍🍳" },
                        { label: "Packed", icon: "📦" },
                        { label: "Rider", icon: "🛵" },
                        { label: "On Way", icon: "🚀" },
                        { label: "Delivered", icon: "✅" },
                      ];

                      return (
                        <div
                          key={ord.id}
                          className="rounded-2xl border border-slate-200 bg-white p-3.5 space-y-3 shadow-xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                            <div>
                              <span className="text-[10px] font-mono font-bold text-slate-400">
                                #{ord.id.slice(-8)}
                              </span>
                              <h5 className="text-sm font-black text-slate-900 leading-tight">
                                {ord.businesses?.name || "Restaurant Partner"}
                              </h5>
                            </div>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${
                                ord.status === "delivered"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : ord.status === "out_for_delivery" || ord.status === "picked_up"
                                    ? "bg-blue-100 text-blue-800 animate-pulse"
                                    : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {ord.status.replace(/_/g, " ")}
                            </span>
                          </div>

                          {/* 6-Stage Visual Stepper */}
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <div className="grid grid-cols-6 gap-1 text-center">
                              {STEPS.map((step, idx) => {
                                const isDone = idx < stepIndex;
                                const isCurrent = idx === stepIndex;
                                return (
                                  <div key={step.label} className="flex flex-col items-center">
                                    <span
                                      className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold transition ${
                                        isDone
                                          ? "bg-emerald-500 text-white"
                                          : isCurrent
                                            ? "bg-orange-500 text-white animate-bounce ring-2 ring-orange-300"
                                            : "bg-slate-200 text-slate-500"
                                      }`}
                                    >
                                      {isDone ? "✓" : step.icon}
                                    </span>
                                    <span
                                      className={`text-[9px] mt-1 font-semibold leading-tight ${
                                        isCurrent
                                          ? "text-orange-600 font-black"
                                          : isDone
                                            ? "text-emerald-700"
                                            : "text-slate-400"
                                      }`}
                                    >
                                      {step.label}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Stepper Status Note */}
                            <p className="mt-2 text-center text-[10px] text-slate-500 font-medium">
                              {stepIndex === 0 && "Waiting for restaurant to accept your order."}
                              {stepIndex === 1 && "Kitchen is preparing your dishes fresh."}
                              {stepIndex === 2 && "Food is packed & waiting for delivery partner pickup."}
                              {stepIndex === 3 && `Rider assigned: ${ord.delivery_riders?.full_name || "Arriving at store"}.`}
                              {stepIndex === 4 && "Delivery partner is on the way to your doorstep!"}
                              {stepIndex === 5 && "Order delivered successfully. Enjoy your food!"}
                            </p>
                          </div>

                          {/* Delivery Handover OTP Card */}
                          <div className="rounded-xl border border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50 p-2.5 flex items-center justify-between shadow-2xs">
                            <div>
                              <span className="text-[9px] font-black uppercase text-amber-800 tracking-wider block">
                                Delivery Handover OTP
                              </span>
                              <span className="text-[10px] text-amber-900 font-medium">
                                Share only when rider arrives at your door
                              </span>
                            </div>
                            <span className="font-mono text-base font-black tracking-widest text-slate-950 bg-amber-400 px-3 py-1 rounded-lg shadow-2xs">
                              {ord.delivery_otp}
                            </span>
                          </div>

                          {/* Direct Contact Buttons */}
                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                            {ord.businesses?.phone && (
                              <a
                                href={`tel:${ord.businesses.phone}`}
                                className="flex-1 text-center py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-700 hover:bg-slate-100 transition"
                              >
                                📞 Call Restaurant
                              </a>
                            )}
                            {ord.delivery_riders?.phone && (
                              <a
                                href={`tel:${ord.delivery_riders.phone}`}
                                className="flex-1 text-center py-1.5 rounded-lg bg-purple-600 text-[10px] font-bold text-white hover:bg-purple-700 transition shadow-2xs"
                              >
                                🛵 Call Rider ({ord.delivery_riders.full_name})
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
      {/* ── Address Management Modal (+ Add Another Address) (Image 3 Benchmark) ── */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-3 sm:p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-white p-3.5 sm:p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <h3 className="text-xs sm:text-sm font-black text-slate-900">📍 Add Delivery Address</h3>
              <button
                type="button"
                onClick={() => setIsAddressModalOpen(false)}
                className="grid h-6 w-6 place-items-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            {/* Address Tag Selector */}
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-1">Save Address As:</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { tag: "Home", icon: "🏠" },
                  { tag: "Work", icon: "💼" },
                  { tag: "Other", icon: "📍" },
                ].map((item) => (
                  <button
                    key={item.tag}
                    type="button"
                    onClick={() => setNewAddressTag(item.tag as typeof newAddressTag)}
                    className={`py-1.5 rounded-lg text-xs font-bold border flex items-center justify-center gap-1 transition ${
                      newAddressTag === item.tag
                        ? "bg-blue-50 border-blue-400 text-blue-900 ring-1 ring-blue-300"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.tag}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Structured Address Form */}
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">House / Shop / Flat No.</label>
                  <input
                    type="text"
                    placeholder="e.g. Shop 14 / House 28"
                    value={addrHouseNo}
                    onChange={(e) => setAddrHouseNo(e.target.value)}
                    className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Colony / Mohalla / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Civil Lines / Chowk"
                    value={addrMohalla}
                    onChange={(e) => setAddrMohalla(e.target.value)}
                    className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500">Road / Landmark</label>
                <input
                  type="text"
                  placeholder="e.g. KDC Lucknow Road, Near Petrol Pump"
                  value={addrRoad}
                  onChange={(e) => setAddrRoad(e.target.value)}
                  className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">Pincode</label>
                  <input
                    type="text"
                    value={addrPincode}
                    onChange={(e) => setAddrPincode(e.target.value)}
                    className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500">District / City</label>
                  <input
                    type="text"
                    value={addrDistrict}
                    onChange={(e) => setAddrDistrict(e.target.value)}
                    className="mt-0.5 w-full rounded-xl border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const full = buildAddressString(addrHouseNo, addrMohalla, addrRoad, addrPincode, addrDistrict);
                setCustomerAddress(full);
                const newId = `addr_${Date.now()}`;
                const newEntry: CustomerSavedAddress = {
                  id: newId,
                  tag: newAddressTag,
                  houseNo: addrHouseNo,
                  mohalla: addrMohalla,
                  road: addrRoad,
                  pincode: addrPincode,
                  district: addrDistrict,
                };
                const updated = [newEntry, ...savedAddresses.filter(a => a.tag !== newAddressTag)];
                setSavedAddresses(updated);
                setSelectedAddressId(newId);
                try {
                  localStorage.setItem("trustit_saved_addresses_v1", JSON.stringify(updated));
                  localStorage.setItem("trustit_cust_addr", full);
                } catch {}
                setIsAddressModalOpen(false);
              }}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-2.5 text-xs font-black text-white shadow-md hover:from-blue-700 hover:to-indigo-700 transition"
            >
              Save Address &amp; Use for Delivery →
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
