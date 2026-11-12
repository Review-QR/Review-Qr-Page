"use client";

import { useState, useEffect, useMemo, useCallback, useTransition, useRef } from "react";
import { formatUnifiedOrderCode } from "@/lib/hyperlocal/order-id";
import GoogleConsentModal from "@/components/auth/GoogleConsentModal";
import WhatsAppOtpNotificationBanner from "@/components/auth/WhatsAppOtpNotificationBanner";
import { TrustitNative } from "@/lib/native/trustit-native-service";
import CustomerHomeAndDiscovery from "@/components/customer/CustomerHomeAndDiscovery";
import {
  CustomerBrandSplash,
  CustomerOnboardingModal,
} from "@/components/customer/CustomerOnboardingModals";
import CustomerStorefrontAndVerticals from "@/components/customer/CustomerStorefrontAndVerticals";
import CustomerCheckoutAndAddresses from "@/components/customer/CustomerCheckoutAndAddresses";
import CustomerOrdersAndSupport from "@/components/customer/CustomerOrdersAndSupport";
import CustomerProfileAndSettings from "@/components/customer/CustomerProfileAndSettings";
import {
  type SuperAppBusiness,
  type SuperAppCatalogItem,
  type DishCustomization,
  type CartLineItem,
  type ActiveHyperlocalOrder,
  type CustomerSavedAddress,
  type ActiveServiceToken,
  type ActiveParchaOrder,
  type CustomerNotificationItem,
  type CustomerLanguage,
  type VerticalTabId,
  type BottomNavTab,
  type OutOfStockRule,
  type PriceTierFilter,
  type StoreSortFilter,
  type DetectedGpsLocation,
  AVAILABLE_ADDONS,
  QUICK_COOKING_NOTES,
  DEFAULT_BAHRAICH_BUSINESSES,
  DEFAULT_BAHRAICH_ITEMS,
  getRestaurantThumbnail,
  estimateStoreEtaMinutes,
  getStoreRating,
  matchesCatalogQuery,
  matchesVertical,
} from "@/components/customer/customer-types";

export {
  type SuperAppBusiness,
  type SuperAppCatalogItem,
  type DishCustomization,
  type CartLineItem,
  type ActiveHyperlocalOrder,
  type CustomerSavedAddress,
  type ActiveServiceToken,
  AVAILABLE_ADDONS,
  QUICK_COOKING_NOTES,
  DEFAULT_BAHRAICH_BUSINESSES,
  DEFAULT_BAHRAICH_ITEMS,
  getRestaurantThumbnail,
};

let cashfreeSdkPromise: Promise<void> | null = null;
function loadCashfreeSdk(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).Cashfree) return Promise.resolve();
  if (cashfreeSdkPromise) return cashfreeSdkPromise;

  cashfreeSdkPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.onload = () => {
      if ((window as any).Cashfree) resolve();
      else reject(new Error("Cashfree checkout could not be loaded."));
    };
    script.onerror = () => reject(new Error("Cashfree checkout could not be loaded."));
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    cashfreeSdkPromise = null;
    throw error;
  });

  return cashfreeSdkPromise;
}

export default function CustomerSuperAppClient({
  businesses: propBusinesses,
  catalogItems: propCatalogItems,
  initialSearchQuery = "",
  initialStoreName = "",
}: {
  businesses?: SuperAppBusiness[];
  catalogItems?: SuperAppCatalogItem[];
  initialSearchQuery?: string;
  initialStoreName?: string;
}) {
  // ── Catalog & Businesses ──
  const [businesses, setBusinesses] = useState<SuperAppBusiness[]>(
    propBusinesses && propBusinesses.length > 0 ? propBusinesses : DEFAULT_BAHRAICH_BUSINESSES,
  );
  const [catalogItems, setCatalogItems] = useState<SuperAppCatalogItem[]>(
    propCatalogItems && propCatalogItems.length > 0 ? propCatalogItems : DEFAULT_BAHRAICH_ITEMS,
  );

  useEffect(() => {
    if (propBusinesses && propBusinesses.length > 0) setBusinesses(propBusinesses);
  }, [propBusinesses]);

  useEffect(() => {
    if (propCatalogItems && propCatalogItems.length > 0) setCatalogItems(propCatalogItems);
  }, [propCatalogItems]);

  useEffect(() => {
    fetch("/api/hyperlocal/businesses")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (Array.isArray(data.businesses) && data.businesses.length > 0) {
            setBusinesses(data.businesses);
          }
          if (Array.isArray(data.catalogItems) && data.catalogItems.length > 0) {
            setCatalogItems(data.catalogItems);
          }
        }
      })
      .catch(() => {});
  }, []);

  // ── N-01 Brand Splash (once per session) ──
  const [showSplash, setShowSplash] = useState<boolean>(false);
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("trustit_splash_seen");
      if (!seen) {
        setShowSplash(true);
        const timer = setTimeout(() => {
          setShowSplash(false);
          try {
            sessionStorage.setItem("trustit_splash_seen", "1");
          } catch {}
        }, 1000);
        return () => clearTimeout(timer);
      }
    } catch {}
  }, []);

  // ── UI Language & Navigation State ──
  const [lang, setLang] = useState<CustomerLanguage>("en");
  const [bottomTab, setBottomTab] = useState<BottomNavTab>("home");
  const [activeTab, setActiveTab] = useState<VerticalTabId>("food");
  const [selectedCity, setSelectedCity] = useState<string>("Bahraich");
  const [searchQuery, setSearchQuery] = useState<string>(initialSearchQuery || initialStoreName);

  const bottomTabHistoryRef = useRef<BottomNavTab[]>([]);
  const verticalTabHistoryRef = useRef<VerticalTabId[]>([]);
  const homeSubBackRef = useRef<(() => boolean) | null>(null);
  const storeSubBackRef = useRef<(() => boolean) | null>(null);
  const ordersSubBackRef = useRef<(() => boolean) | null>(null);
  const addressSubBackRef = useRef<(() => boolean) | null>(null);
  const profileSubBackRef = useRef<(() => boolean) | null>(null);

  const navigateBottomTab = useCallback(
    (nextTab: BottomNavTab) => {
      if (nextTab === bottomTab) return;
      bottomTabHistoryRef.current = [...bottomTabHistoryRef.current.slice(-14), bottomTab];
      setBottomTab(nextTab);
    },
    [bottomTab],
  );

  const navigateVerticalTab = useCallback(
    (nextTab: VerticalTabId) => {
      if (nextTab === activeTab) return;
      verticalTabHistoryRef.current = [...verticalTabHistoryRef.current.slice(-14), activeTab];
      setActiveTab(nextTab);
    },
    [activeTab],
  );

  const initialStore = useMemo(() => {
    if (!initialStoreName && !initialSearchQuery) return null;
    const target = (initialStoreName || initialSearchQuery).trim().toLowerCase();
    return businesses.find((b) => b.name.toLowerCase().includes(target)) || null;
  }, [businesses, initialStoreName, initialSearchQuery]);

  // ── Filter States (N-11) ──
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [isFastDeliveryOnly, setIsFastDeliveryOnly] = useState(false);
  const [isTopRatedOnly, setIsTopRatedOnly] = useState(false);
  const [priceTier, setPriceTier] = useState<PriceTierFilter>("all");
  const [sortBy, setSortBy] = useState<StoreSortFilter>("recommended");
  const [verifiedStandeeOnly, setVerifiedStandeeOnly] = useState(true);

  // ── Customer Identity & Auth State (N-02 to N-06) ──
  const [customerId, setCustomerId] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerAddress, setCustomerAddress] = useState<string>("");
  const [addressVerified, setAddressVerified] = useState<boolean>(false);
  const [guestMode, setGuestMode] = useState<boolean>(false);
  const [rewardPoints, setRewardPoints] = useState<number>(0);
  const [seenNotifKeys, setSeenNotifKeys] = useState<string[]>([]);
  const [rememberedUser, setRememberedUser] = useState<{
    id: string;
    name: string;
    phone: string;
    email: string;
  } | null>(null);

  const [userLiveLocation, setUserLiveLocation] = useState<string>("Detecting pinpoint GPS...");
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>({
    lat: 27.5744,
    lng: 81.5977,
  });
  const [addrPincode, setAddrPincode] = useState<string>("271801");
  const [isDetectingGps, setIsDetectingGps] = useState(false);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<
    "welcome_back" | "login" | "otp" | "name_push" | "gps_lock"
  >("login");
  const loginStep: "email" | "otp" | "name_prompt" =
    onboardingStep === "otp"
      ? "otp"
      : onboardingStep === "name_push"
        ? "name_prompt"
        : "email";
  const setLoginStep = (step: "email" | "otp" | "name_prompt") => {
    setOnboardingStep(
      step === "otp" ? "otp" : step === "name_prompt" ? "name_push" : "login",
    );
  };
  const isLoginEntryStep = loginStep === "email";
  const isNamePromptStep = loginStep === "name_prompt";
  const [authMode, setAuthMode] = useState<"phone" | "email">("phone");
  const [loginPhone, setLoginPhone] = useState("");
  const [loginEmail, setLoginEmail] = useState("");
  const [pendingCustomerEmail, setPendingCustomerEmail] = useState("");
  const [loginOtp, setLoginOtp] = useState("");
  const [loginOtpCountdown, setLoginOtpCountdown] = useState(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [activeWhatsAppOtp, setActiveWhatsAppOtp] = useState<string | null>(null);
  const [otpError, setOtpError] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [newCustomerName, setNewCustomerName] = useState("");
  const [pushEnabled, setPushEnabled] = useState(false);

  // ── Wallet, SpeedPass, Favorites & Profile (N-31, N-32) ──
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [accountView, setAccountView] = useState<"menu" | "past_orders" | "addresses" | "payments">("menu");
  const openAccountSection = (view: "past_orders" | "addresses") => {
    setAccountView(view);
    if (view === "past_orders") setIsMyBookingsOpen(true);
    if (view === "addresses") setIsAddressModalOpen(true);
  };
  const activeAccountSectionLabel =
    accountView === "addresses"
      ? "addresses"
      : accountView === "past_orders"
        ? "past_orders"
        : "menu";
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [speedPassActive, setSpeedPassActive] = useState<boolean>(false);
  const [favoriteStoreIds, setFavoriteStoreIds] = useState<string[]>([]);

  // ── Saved Addresses (N-21, N-22) ──
  const [savedAddresses, setSavedAddresses] = useState<CustomerSavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);

  // ── Storefront, Customizer & Vertical Modals (N-13 to N-19) ──
  const [activeStoreModal, setActiveStoreModal] = useState<SuperAppBusiness | null>(initialStore);
  const [isStandeeModalOpen, setIsStandeeModalOpen] = useState(false);
  const [customizingItem, setCustomizingItem] = useState<SuperAppCatalogItem | null>(null);
  const [selectedPortion, setSelectedPortion] = useState<"half" | "full">("half");
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [cookingInstruction, setCookingInstruction] = useState("");

  const [kiranaModal, setKiranaModal] = useState<SuperAppBusiness | null>(null);
  const [medicalModal, setMedicalModal] = useState<SuperAppBusiness | null>(null);
  const [parchaText, setParchaText] = useState("");
  const [parchaImagePreview, setParchaImagePreview] = useState<string | null>(null);
  const [parchaNotes, setParchaNotes] = useState("");

  const [salonModal, setSalonModal] = useState<SuperAppBusiness | null>(null);
  const [salonService, setSalonService] = useState("Executive Haircut & Styling (₹150)");
  const [salonStylist, setSalonStylist] = useState("Any Available Stylist");

  const [carWashModal, setCarWashModal] = useState<SuperAppBusiness | null>(null);
  const [carWashPackage, setCarWashPackage] = useState("Full Foam Car Wash & Vacuuming (₹350)");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");

  // ── Strict Single-Store Cart & Checkout (N-20, N-23, N-24, N-25) ──
  const [cart, setCart] = useState<{ [cartKey: string]: CartLineItem }>({});
  const [pendingCartReplace, setPendingCartReplace] = useState<{
    item: SuperAppCatalogItem;
    line: CartLineItem;
    pendingStoreName: string;
    currentStoreName: string;
  } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [outOfStockRule, setOutOfStockRule] = useState<OutOfStockRule>("call_me");
  const [storeNote, setStoreNote] = useState("");
  const [deliveryScheduleSlot, setDeliveryScheduleSlot] = useState("standard_25m");
  const [riderTip, setRiderTip] = useState<number>(0);
  const [promoCode, setPromoCode] = useState("");
  const [paymentMethodChoice, setPaymentMethodChoice] = useState<"online_cashfree" | "cod">(
    "online_cashfree",
  );
  const [isPaymentLaunching, setIsPaymentLaunching] = useState(false);
  const [paymentRetryState, setPaymentRetryState] = useState<{
    orderId: string;
    amount: number;
    storeName: string;
    reason: string;
  } | null>(null);
  const [confirmedOrderOverlay, setConfirmedOrderOverlay] = useState<{
    orderId: string;
    displayCode: string;
    storeName: string;
    deliveryOtp: string;
    paymentLabel: string;
  } | null>(null);

  // ── Orders, Tokens, Parchas & Notifications (N-26 to N-30) ──
  const [isMyBookingsOpen, setIsMyBookingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [activeOrders, setActiveOrders] = useState<ActiveHyperlocalOrder[]>([]);
  const [customerPastOrders, setCustomerPastOrders] = useState<ActiveHyperlocalOrder[]>([]);
  const [activeTokens, setActiveTokens] = useState<ActiveServiceToken[]>([]);
  const [activeParchas, setActiveParchas] = useState<ActiveParchaOrder[]>([]);
  const [isRefreshingBookings, setIsRefreshingBookings] = useState(false);
  const [foodRatings, setFoodRatings] = useState<{ [orderId: string]: number }>({});
  const [deliveryRatings, setDeliveryRatings] = useState<{ [orderId: string]: number }>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [isSubmitting, startTransition] = useTransition();

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage((cur) => (cur === msg ? null : cur)), 3600);
  }, []);

  // Preload Cashfree JS SDK
  useEffect(() => {
    loadCashfreeSdk().catch(() => {});
  }, []);

  // OTP countdown
  useEffect(() => {
    if (loginOtpCountdown <= 0) return;
    const tmr = setInterval(() => {
      setLoginOtpCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(tmr);
  }, [loginOtpCountdown]);

  const saveCustomerProfile = (
    name: string,
    phone: string,
    address: string,
    email?: string,
    id?: string,
  ) => {
    try {
      if (name) localStorage.setItem("trustit_cust_name", name);
      if (phone) localStorage.setItem("trustit_cust_phone", phone);
      if (address) localStorage.setItem("trustit_cust_addr", address);
      if (email) localStorage.setItem("trustit_cust_email", email);
      if (id) localStorage.setItem("trustit_cust_id", id);
      if (name && (phone || email)) {
        localStorage.setItem(
          "trustit_last_customer",
          JSON.stringify({ id: id || "", name, phone: phone || "", email: email || "" }),
        );
      }
    } catch {}
  };

  // Fetch Customer Past & Running Orders
  const fetchCustomerPoints = useCallback(async (cId?: string, phone?: string) => {
    const targetId = cId || "";
    const targetPhone = phone || "";
    if (!targetId && targetPhone.length < 10) return;
    try {
      const params = new URLSearchParams();
      if (targetId) params.set("customerId", targetId);
      if (targetPhone) params.set("phone", targetPhone);
      params.set("_ts", String(Date.now()));
      const res = await fetch(`/api/customer/points?${params.toString()}`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => null);
      if (data?.success && typeof data.rewardPoints === "number") {
        setRewardPoints(data.rewardPoints);
      }
    } catch {}
  }, []);

  const fetchCustomerOrders = useCallback(async (cId?: string, phone?: string) => {
    const targetId = cId || customerId;
    const targetPhone = phone || customerPhone;
    if (!targetId && !targetPhone) return;
    try {
      const params = new URLSearchParams();
      if (targetId) params.set("customerId", targetId);
      if (targetPhone) params.set("phone", targetPhone);
      const res = await fetch(`/api/hyperlocal/orders?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        const orders: ActiveHyperlocalOrder[] = data.orders || [];
        setCustomerPastOrders(orders);
        setActiveOrders(
          orders.filter(
            (o) => !["delivered", "completed", "cancelled", "rejected"].includes(o.status),
          ),
        );
      }
    } catch {}
  }, [customerId, customerPhone]);

  // Poll Active Bookings (Orders + Tokens + Parchas)
  const fetchActiveBookings = useCallback(async (phone: string) => {
    const cleanPhone = (phone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) return;
    setIsRefreshingBookings(true);
    try {
      const [orderRes, tokenRes, parchaRes] = await Promise.all([
        fetch(`/api/hyperlocal/orders?phone=${encodeURIComponent(cleanPhone)}`),
        fetch(`/api/hyperlocal/tokens?phone=${encodeURIComponent(cleanPhone)}`),
        fetch(`/api/hyperlocal/parcha`),
      ]);
      if (orderRes.ok) {
        const data = await orderRes.json();
        const all = data.orders || [];
        setCustomerPastOrders(all);
        setActiveOrders(
          all.filter(
            (o: any) => !["delivered", "completed", "cancelled", "rejected"].includes(o.status),
          ),
        );
      }
      if (tokenRes.ok) {
        const data = await tokenRes.json();
        setActiveTokens(
          (data.tokens || []).filter((t: any) => !["completed", "cancelled"].includes(t.status)),
        );
      }
      if (parchaRes.ok) {
        const data = await parchaRes.json();
        const myParchas = (data.parchas || []).filter(
          (p: any) => p.hyperlocal_orders?.customer_phone === cleanPhone,
        );
        setActiveParchas(
          myParchas.filter((p: any) => {
            const st = String(p.hyperlocal_orders?.status || "").toLowerCase();
            if (["cancelled", "rejected", "delivered", "completed"].includes(st)) return false;
            return !st || st === "placed" || !p.merchant_quote_amount;
          }),
        );
      }
    } catch {
    } finally {
      setIsRefreshingBookings(false);
    }
  }, []);

  // Restore Session & Preferences from localStorage
  useEffect(() => {
    try {
      const savedId = localStorage.getItem("trustit_cust_id") || "";
      const savedEmail = localStorage.getItem("trustit_cust_email") || "";
      const savedName = localStorage.getItem("trustit_cust_name") || "";
      const savedPhone = localStorage.getItem("trustit_cust_phone") || "";
      const savedAddr = localStorage.getItem("trustit_cust_addr") || "";
      const savedGuest = localStorage.getItem("trustit_guest_mode") === "1";
      const savedAddrVerified = localStorage.getItem("trustit_addr_verified") === "1";
      const savedSeenNotifs = localStorage.getItem("trustit_seen_notifs");
      const savedLast = localStorage.getItem("trustit_last_customer");
      const savedLang = localStorage.getItem("trustit_cust_lang");
      const savedWallet = localStorage.getItem("trustit_money_balance");
      const savedPass = localStorage.getItem("trustit_speedpass");
      const savedFavs = localStorage.getItem("trustit_favorite_stores");
      const savedPush = localStorage.getItem("trustit_push_enabled");

      if (savedId) setCustomerId(savedId);
      if (savedEmail) {
        setCustomerEmail(savedEmail);
        setLoginEmail(savedEmail);
      }
      if (savedName) setCustomerName(savedName);
      if (savedPhone && savedPhone.length === 10) setCustomerPhone(savedPhone);
      if (savedAddr) setCustomerAddress(savedAddr);
      if (savedLang === "hi" || savedLang === "en") setLang(savedLang);
      if (savedWallet) setWalletBalance(Number(savedWallet) || 0);
      if (savedPass === "1") setSpeedPassActive(true);
      if (savedPush === "1") setPushEnabled(true);
      if (savedFavs) {
        try {
          const arr = JSON.parse(savedFavs);
          if (Array.isArray(arr)) setFavoriteStoreIds(arr);
        } catch {}
      }
      if (savedLast) {
        try {
          setRememberedUser(JSON.parse(savedLast));
        } catch {}
      }

      const rawAddrs = localStorage.getItem("trustit_saved_addresses_v1");
      if (rawAddrs) {
        try {
          const parsed = JSON.parse(rawAddrs);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSavedAddresses(parsed);
            setSelectedAddressId(parsed[0].id);
          }
        } catch {}
      }

      if (savedId) {
        fetchCustomerPoints(savedId, savedPhone);
        fetch(`/api/customer/addresses?customerId=${encodeURIComponent(savedId)}`)
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d && Array.isArray(d.addresses) && d.addresses.length > 0) {
              const formatted: CustomerSavedAddress[] = d.addresses.map((a: any) => ({
                id: a.id,
                customerId: a.customer_id,
                label: a.label || "Home",
                tag: a.label || "Home",
                street: a.street,
                landmark: a.landmark,
                city: a.city || "Bahraich",
                pincode: a.pincode || "271801",
                latitude: a.latitude,
                longitude: a.longitude,
                isDefault: Boolean(a.is_default),
              }));
              setSavedAddresses(formatted);
              setAddressVerified(true);
              const def = formatted.find((a) => a.isDefault) || formatted[0];
              if (def) {
                setSelectedAddressId(def.id);
                setCustomerAddress(def.street);
              }
              try {
                localStorage.setItem("trustit_addr_verified", "1");
                localStorage.setItem("trustit_saved_addresses_v1", JSON.stringify(formatted));
              } catch {}
            }
          })
          .catch(() => {});
        fetchCustomerOrders(savedId, savedPhone);
      } else if (savedPhone) {
        fetchCustomerPoints(undefined, savedPhone);
      }

      if (savedGuest) setGuestMode(true);
      if (savedAddrVerified) setAddressVerified(true);
      if (savedSeenNotifs) {
        try {
          const parsedSeen = JSON.parse(savedSeenNotifs);
          if (Array.isArray(parsedSeen)) setSeenNotifKeys(parsedSeen);
        } catch {}
      }

      if (!savedId && !savedPhone && !savedGuest) {
        setOnboardingStep(savedLast ? "welcome_back" : "login");
        setIsOnboardingOpen(true);
      }
    } catch {}
  }, [fetchCustomerOrders, fetchCustomerPoints]);

  useEffect(() => {
    if (customerPhone && customerPhone.length >= 10) {
      fetchActiveBookings(customerPhone);
      const interval = setInterval(() => fetchActiveBookings(customerPhone), 12000);
      return () => clearInterval(interval);
    }
  }, [customerPhone, fetchActiveBookings]);

  const resolveReverseGeocodeAndApply = useCallback(
    async (
      lat: number,
      lng: number,
      fallback?: { mohalla?: string; city?: string; pincode?: string },
    ) => {
      setUserCoords({ lat, lng });
      let geocodeData: any = null;
      try {
        const path = `/api/hyperlocal/reverse-geocode?lat=${lat}&lng=${lng}&_ts=${Date.now()}`;
        const res = await TrustitNative.nativeFetch(path);
        if (res.ok) geocodeData = await res.json();
      } catch {}

      const resolvedName =
        geocodeData?.locationName && !String(geocodeData.locationName).includes("GPS:")
          ? geocodeData.locationName
          : fallback?.mohalla || geocodeData?.locationName || `Live GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      const mohalla = geocodeData?.mohalla || fallback?.mohalla || resolvedName;
      const district = geocodeData?.district || geocodeData?.city || fallback?.city || "Bahraich";
      const pincode = geocodeData?.pincode || fallback?.pincode || "271801";
      const formatted = geocodeData?.formattedAddress || resolvedName;

      setUserLiveLocation(resolvedName);
      setSelectedCity(district);
      setAddrPincode(pincode);
      setCustomerAddress((prev) => prev || formatted);

      try {
        localStorage.setItem(
          "trustit_customer_location",
          JSON.stringify({
            locationName: resolvedName,
            city: district,
            district,
            pincode,
            formatted,
            lat,
            lng,
            time: Date.now(),
          }),
        );
      } catch {}

      return {
        lat,
        lng,
        locationName: resolvedName,
        mohalla,
        street: formatted || mohalla || resolvedName,
        city: district,
        pincode,
        formattedAddress: formatted,
      };
    },
    [],
  );

  // ── N-06 Early GPS Detection (Matches Rider App Pinpoint Accuracy) ──
  const detectLiveLocation = useCallback(
    async (silent = false): Promise<DetectedGpsLocation | null> => {
      if (!silent) setIsDetectingGps(true);
      try {
        const loc = await TrustitNative.getPreciseLocation();
        const lat = loc.latitude;
        const lng = loc.longitude;
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || (Math.abs(lat) < 0.01 && Math.abs(lng) < 0.01)) {
          if (!silent) showToast("Please enable GPS location permission on your device.");
          return null;
        }
        const result = await resolveReverseGeocodeAndApply(lat, lng, {
          mohalla: loc.mohalla,
          city: loc.city,
          pincode: loc.pincode,
        });
        if (!silent) TrustitNative.playHapticFeedback("click");
        return result;
      } catch {
        return null;
      } finally {
        if (!silent) setIsDetectingGps(false);
      }
    },
    [resolveReverseGeocodeAndApply, showToast],
  );

  useEffect(() => {
    let hasRecentManualPin = false;
    try {
      const saved = localStorage.getItem("trustit_customer_location");
      if (saved) {
        const parsed = JSON.parse(saved);
        const ageMs = typeof parsed.time === "number" ? Date.now() - parsed.time : Number.MAX_SAFE_INTEGER;
        if (parsed.manualPin && ageMs < 15 * 60_000 && parsed.locationName && !String(parsed.locationName).includes("0.0000")) {
          hasRecentManualPin = true;
          setUserLiveLocation(parsed.locationName);
          if (parsed.district || parsed.city) setSelectedCity(parsed.district || parsed.city);
          if (parsed.pincode) setAddrPincode(parsed.pincode);
          if (parsed.lat && parsed.lng && Math.abs(parsed.lat) > 0.01) {
            setUserCoords({ lat: parsed.lat, lng: parsed.lng });
          }
        }
      }
    } catch {}

    if (!hasRecentManualPin) {
      detectLiveLocation(true);
    }

    const handleVisibilityRefresh = () => {
      if (document.visibilityState !== "visible") return;
      if (customerId || (customerPhone && customerPhone.length >= 10)) {
        fetchCustomerPoints(customerId, customerPhone);
      }
      try {
        const saved = localStorage.getItem("trustit_customer_location");
        const parsed = saved ? JSON.parse(saved) : null;
        const ageMs = typeof parsed?.time === "number" ? Date.now() - parsed.time : Number.MAX_SAFE_INTEGER;
        if (parsed?.manualPin && ageMs < 15 * 60_000) return;
      } catch {}
      detectLiveLocation(true);
    };

    document.addEventListener("visibilitychange", handleVisibilityRefresh);
    window.addEventListener("focus", handleVisibilityRefresh);

    let watchId: number | null = null;
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      let lastWatchedLat = 0;
      let lastWatchedLng = 0;
      watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (pos.coords.accuracy > 250) return;
          if (Math.abs(lat - lastWatchedLat) < 0.0011 && Math.abs(lng - lastWatchedLng) < 0.0011) return;
          try {
            const saved = localStorage.getItem("trustit_customer_location");
            const parsed = saved ? JSON.parse(saved) : null;
            const ageMs = typeof parsed?.time === "number" ? Date.now() - parsed.time : Number.MAX_SAFE_INTEGER;
            if (parsed?.manualPin && ageMs < 15 * 60_000) return;
          } catch {}
          lastWatchedLat = lat;
          lastWatchedLng = lng;
          await resolveReverseGeocodeAndApply(lat, lng);
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 15000 },
      );
    }

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityRefresh);
      window.removeEventListener("focus", handleVisibilityRefresh);
      if (watchId !== null && typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [detectLiveLocation, resolveReverseGeocodeAndApply, customerId, customerPhone, fetchCustomerPoints]);

  // ── Auth Handlers (N-02 to N-05) ──
  const openLoginOrResume = () => {
    setOtpError("");
    setOtpNotice("");
    setLoginOtp("");
    setOnboardingStep(rememberedUser ? "welcome_back" : "login");
    setIsOnboardingOpen(true);
  };

  const handleContinueRemembered = () => {
    if (!rememberedUser) return;
    setCustomerId(rememberedUser.id);
    setCustomerName(rememberedUser.name);
    setCustomerPhone(rememberedUser.phone);
    setCustomerEmail(rememberedUser.email);
    setGuestMode(false);
    try {
      localStorage.removeItem("trustit_guest_mode");
    } catch {}
    saveCustomerProfile(
      rememberedUser.name,
      rememberedUser.phone,
      customerAddress,
      rememberedUser.email,
      rememberedUser.id,
    );
    fetchCustomerOrders(rememberedUser.id, rememberedUser.phone);
    fetchCustomerPoints(rememberedUser.id, rememberedUser.phone);
    if (addressVerified || savedAddresses.length > 0) {
      setIsOnboardingOpen(false);
      showToast(`Welcome back, ${rememberedUser.name}!`);
    } else {
      setOnboardingStep("gps_lock");
    }
  };

  const handleSendOtp = async (overrideIdentifier?: string, overrideChannel?: "sms" | "whatsapp") => {
    const channelToUse = overrideChannel || "whatsapp";
    setOtpError("");
    setOtpNotice("");
    setIsSendingOtp(true);
    try {
      if (authMode === "phone" && !overrideIdentifier?.includes("@")) {
        const raw = (overrideIdentifier || loginPhone || "").replace(/\D/g, "");
        const phone10 = raw.length === 12 && raw.startsWith("91") ? raw.slice(2) : raw;
        if (phone10.length !== 10) {
          setOtpError("Please enter a valid 10-digit Indian mobile number.");
          return;
        }
        const res = await fetch("/api/customer/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phone10, channel: channelToUse }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          setOtpError(data.message || "Could not send WhatsApp OTP.");
          return;
        }
        setLoginPhone(phone10);
        setLoginOtp("");
        setLoginStep("otp");
        setLoginOtpCountdown(30);
        if (data.previewOtp) setActiveWhatsAppOtp(data.previewOtp);
        setOtpNotice(data.message || `WhatsApp OTP sent to +91 ${phone10}`);
        return;
      }

      const targetEmail = (overrideIdentifier || loginEmail || "").trim().toLowerCase();
      if (!targetEmail.includes("@")) {
        setOtpError("Please enter a valid email address.");
        return;
      }
      const res = await fetch("/api/customer/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.message || "Could not send Email OTP.");
        return;
      }
      setLoginEmail(targetEmail);
      setLoginOtp("");
      setLoginStep("otp");
      setLoginOtpCountdown(30);
      setOtpNotice(data.message || `Verification code sent to ${targetEmail}`);
    } catch {
      setOtpError("Network error sending OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const code = loginOtp.trim();
    if (code.length !== 6) {
      setOtpError("Please enter the 6-digit OTP.");
      return;
    }
    setOtpError("");
    setIsVerifyingOtp(true);
    try {
      const payload: Record<string, string> = { otp: code };
      if (authMode === "phone" && loginPhone) payload.phone = loginPhone;
      else payload.email = loginEmail;

      const res = await fetch("/api/customer/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.message || "Invalid or expired OTP.");
        return;
      }

      if (data.isNewCustomer) {
        setPendingCustomerEmail(data.customer?.email || `${loginPhone}@customer.trustitreview.com`);
        setLoginStep("name_prompt");
        setOtpNotice("Verified! Enter your name & enable live order alerts.");
        return;
      }

      const cust = data.customer;
      if (cust) {
        setCustomerId(cust.id);
        setCustomerEmail(cust.email);
        const nameToUse = cust.fullName || "Customer";
        setCustomerName(nameToUse);
        if (cust.phone) setCustomerPhone(cust.phone);
        setGuestMode(false);
        setRewardPoints(Number(cust.rewardPoints ?? 0));
        fetchCustomerPoints(cust.id, cust.phone || loginPhone);
        try {
          localStorage.removeItem("trustit_guest_mode");
        } catch {}
        saveCustomerProfile(nameToUse, cust.phone || loginPhone, customerAddress, cust.email, cust.id);
        fetchCustomerOrders(cust.id, cust.phone || loginPhone);
      }

      if (Array.isArray(data.addresses) && data.addresses.length > 0) {
        const formatted: CustomerSavedAddress[] = data.addresses.map((a: any) => ({
          id: a.id,
          customerId: a.customerId,
          label: a.label || "Home",
          tag: a.label || "Home",
          street: a.street,
          city: a.city || selectedCity || "Bahraich",
          pincode: a.pincode || addrPincode || "271801",
          isDefault: Boolean(a.isDefault),
        }));
        setSavedAddresses(formatted);
        setAddressVerified(true);
        const def = formatted.find((a) => a.isDefault) || formatted[0];
        if (def) {
          setSelectedAddressId(def.id);
          setCustomerAddress(def.street);
        }
        try {
          localStorage.setItem("trustit_addr_verified", "1");
          localStorage.setItem("trustit_saved_addresses_v1", JSON.stringify(formatted));
        } catch {}
        setIsOnboardingOpen(false);
        showToast(`Welcome back, ${cust?.fullName || "Customer"}!`);
        return;
      }
      if (cust?.fullName && addressVerified && customerAddress.trim()) {
        setIsOnboardingOpen(false);
        showToast(`Welcome back, ${cust.fullName}!`);
        return;
      }
      setOnboardingStep("gps_lock");
    } catch {
      setOtpError("Network error verifying OTP.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleCreateProfile = async (
    allowPush = true,
    addressDetails?: {
      locality: string;
      houseStreet: string;
      fullAddress: string;
      landmark?: string;
      cityPincode?: string;
      tag: "Home" | "Work" | "Other";
    },
  ) => {
    const cleanName = newCustomerName.trim();
    if (!cleanName) {
      setOtpError("Please enter your full name.");
      return;
    }
    if (allowPush) {
      try {
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
          await Notification.requestPermission();
        }
        setPushEnabled(true);
        localStorage.setItem("trustit_push_enabled", "1");
      } catch {}
    }
    setIsVerifyingOtp(true);
    try {
      const emailToSave =
        pendingCustomerEmail ||
        loginEmail ||
        (loginPhone ? `${loginPhone}@customer.trustitreview.com` : "");
      const res = await fetch("/api/customer/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_profile",
          email: emailToSave,
          fullName: cleanName,
          phone: loginPhone || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setOtpError(data.message || "Failed to save profile.");
        return;
      }
      const cust = data.customer;
      const pinMatch = addressDetails?.cityPincode?.match(/\b\d{6}\b/)?.[0];
      const extractedCity = addressDetails?.cityPincode
        ? addressDetails.cityPincode.replace(/\b\d{6}\b/, "").replace(/[,\s-]+$/, "").trim()
        : "";
      const cityToSave = extractedCity || selectedCity || "Bahraich";
      const pincodeToSave = pinMatch || addrPincode || "271801";
      if (extractedCity) setSelectedCity(extractedCity);
      if (pinMatch) setAddrPincode(pinMatch);

      const combinedAddress =
        addressDetails?.fullAddress?.trim() ||
        [
          addressDetails?.houseStreet?.trim(),
          addressDetails?.locality?.trim(),
          addressDetails?.landmark?.trim() ? `Near ${addressDetails.landmark.trim()}` : "",
          addressDetails?.cityPincode?.trim(),
        ]
          .filter(Boolean)
          .join(", ");

      if (combinedAddress) {
        setCustomerAddress(combinedAddress);
        if (addressDetails?.locality?.trim()) {
          setUserLiveLocation(addressDetails.locality.trim());
        }
      }

      if (cust) {
        setCustomerId(cust.id);
        setCustomerEmail(cust.email);
        setCustomerName(cust.fullName);
        if (cust.phone) setCustomerPhone(cust.phone);
        setGuestMode(false);
        setRewardPoints(Number(cust.rewardPoints ?? 0));
        fetchCustomerPoints(cust.id, cust.phone || loginPhone);
        try {
          localStorage.removeItem("trustit_guest_mode");
        } catch {}
        saveCustomerProfile(
          cust.fullName,
          cust.phone || loginPhone,
          combinedAddress || customerAddress,
          cust.email,
          cust.id,
        );
      }

      if (cust?.id && combinedAddress) {
        setAddressVerified(true);
        try {
          localStorage.setItem("trustit_addr_verified", "1");
        } catch {}
        try {
          const addrRes = await fetch("/api/customer/addresses", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerId: cust.id,
              address: {
                label: addressDetails?.tag || "Home",
                street: combinedAddress,
                city: cityToSave,
                pincode: pincodeToSave,
                latitude: userCoords?.lat,
                longitude: userCoords?.lng,
                isDefault: true,
              },
            }),
          });
          const addrJson = await addrRes.json().catch(() => null);
          if (addrJson?.success && addrJson.address) {
            const formattedAddr: CustomerSavedAddress = {
              id: addrJson.address.id,
              customerId: cust.id,
              label: addrJson.address.label || addressDetails?.tag || "Home",
              tag: (addrJson.address.label || addressDetails?.tag || "Home") as "Home" | "Work" | "Other",
              street: addrJson.address.street,
              city: addrJson.address.city || cityToSave,
              pincode: addrJson.address.pincode || pincodeToSave,
              latitude: addrJson.address.latitude,
              longitude: addrJson.address.longitude,
              isDefault: true,
            };
            setSavedAddresses([formattedAddr]);
            setSelectedAddressId(formattedAddr.id);
            try {
              localStorage.setItem("trustit_saved_addresses_v1", JSON.stringify([formattedAddr]));
            } catch {}
          }
        } catch {}
        setIsOnboardingOpen(false);
        showToast(`Welcome, ${cust?.fullName || cleanName}!`);
        return;
      }

      setOnboardingStep("gps_lock");
    } catch {
      setOtpError("Network error creating profile.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleGoogleSignIn = async (overrideEmail?: string, overrideName?: string) => {
    setIsGoogleLoading(true);
    setOtpError("");
    try {
      const emailToUse =
        overrideEmail || (loginPhone ? `user.${loginPhone}@gmail.com` : "customer.google@gmail.com");
      const nameToUse = overrideName || customerName || "Google Customer";
      const res = await fetch("/api/customer/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "google_login",
          email: emailToUse,
          fullName: nameToUse,
          phone: loginPhone || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.customer) {
        const cust = data.customer;
        setCustomerId(cust.id);
        setCustomerEmail(cust.email);
        setCustomerName(cust.fullName || nameToUse);
        if (cust.phone) setCustomerPhone(cust.phone);
        setGuestMode(false);
        setRewardPoints(Number(cust.rewardPoints ?? 0));
        fetchCustomerPoints(cust.id, cust.phone || "");
        try {
          localStorage.removeItem("trustit_guest_mode");
        } catch {}
        saveCustomerProfile(cust.fullName || nameToUse, cust.phone || "", customerAddress, cust.email, cust.id);
        fetchCustomerOrders(cust.id, cust.phone || "");
        setOnboardingStep("gps_lock");
      } else {
        setOtpError(data.message || "Google Sign-In failed.");
      }
    } catch {
      setOtpError("Network error with Google Sign-In.");
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSignOut = () => {
    try {
      localStorage.removeItem("trustit_cust_name");
      localStorage.removeItem("trustit_cust_phone");
      localStorage.removeItem("trustit_cust_email");
      localStorage.removeItem("trustit_cust_id");
      localStorage.removeItem("trustit_cust_addr");
      localStorage.removeItem("trustit_saved_addresses_v1");
      localStorage.removeItem("trustit_addr_verified");
      localStorage.removeItem("trustit_guest_mode");
    } catch {}
    setCustomerId("");
    setCustomerEmail("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
    setAddressVerified(false);
    setGuestMode(false);
    setRewardPoints(0);
    setSavedAddresses([]);
    setCustomerPastOrders([]);
    setActiveOrders([]);
    setActiveTokens([]);
    setActiveParchas([]);
    setIsProfileOpen(false);
    setOtpError("");
    setOtpNotice("");
    setLoginOtp("");
    setOnboardingStep("login");
    setIsOnboardingOpen(true);
    showToast("Logged out safely.");
  };

  const handleDeleteAccount = () => {
    try {
      localStorage.removeItem("trustit_last_customer");
    } catch {}
    setRememberedUser(null);
    handleSignOut();
    showToast("Account data cleared per DPDP Act 2023.");
  };

  // ── Filtered & Sorted Businesses (N-09, N-11) ──
  const filteredBusinesses = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = businesses.filter((b) => {
      const type = (b.type || "").toLowerCase();
      const name = (b.name || "").toLowerCase();

      const hasMatchingDish = q
        ? catalogItems.some((i) => i.business_id === b.id && matchesCatalogQuery(i, q))
        : false;

      if (q && !name.includes(q) && !type.includes(q) && !hasMatchingDish) return false;
      if (!q && !matchesVertical(b.type || "", activeTab)) return false;

      if (isVegOnly) {
        const isVegStore = type.includes("sweet") || type.includes("veg") || type.includes("bakery");
        const hasVeg = catalogItems.some((i) => i.business_id === b.id && i.item_type === "veg");
        if (!isVegStore && !hasVeg) return false;
      }

      if (isFastDeliveryOnly && estimateStoreEtaMinutes(b, userCoords) > 30) return false;
      if (isTopRatedOnly && parseFloat(getStoreRating(b.id)) < 4.0) return false;

      if (priceTier !== "all") {
        const items = catalogItems.filter((i) => i.business_id === b.id);
        const avg = items.length ? items.reduce((s, i) => s + i.price, 0) / items.length : 150;
        if (priceTier === "budget" && avg > 150) return false;
        if (priceTier === "mid" && (avg <= 100 || avg > 280)) return false;
        if (priceTier === "premium" && avg <= 220) return false;
      }

      return verifiedStandeeOnly ? true : true;
    });

    if (sortBy === "fastest") {
      return [...list].sort(
        (a, b) => estimateStoreEtaMinutes(a, userCoords) - estimateStoreEtaMinutes(b, userCoords),
      );
    }
    // Sort admin-verified merchants first, then keep rating sort if selected
    if (sortBy === "rating") {
      return [...list].sort(
        (a, b) =>
          Number(Boolean(b.is_verified)) - Number(Boolean(a.is_verified)) ||
          parseFloat(getStoreRating(b.id)) - parseFloat(getStoreRating(a.id)),
      );
    }
    return [...list].sort(
      (a, b) => Number(Boolean(b.is_verified)) - Number(Boolean(a.is_verified)),
    );
  }, [
    businesses,
    catalogItems,
    searchQuery,
    activeTab,
    isVegOnly,
    isFastDeliveryOnly,
    isTopRatedOnly,
    priceTier,
    sortBy,
    verifiedStandeeOnly,
    userCoords,
  ]);

  const activeStoreItems = useMemo(() => {
    if (!activeStoreModal) return [];
    const items = catalogItems.filter((i) => i.business_id === activeStoreModal.id);
    if (items.length > 0) return items;
    return DEFAULT_BAHRAICH_ITEMS.filter((i) => i.business_id === activeStoreModal.id);
  }, [catalogItems, activeStoreModal]);

  // ── Single-Store Cart Math (Matches server createHyperlocalOrder!) ──
  const cartItemsList = useMemo(() => Object.values(cart), [cart]);
  const cartStoreId = cartItemsList[0]?.item.business_id || activeStoreModal?.id || "";
  const cartStore = useMemo(
    () => businesses.find((b) => b.id === cartStoreId) || activeStoreModal || null,
    [businesses, cartStoreId, activeStoreModal],
  );
  const cartSubtotal = useMemo(
    () => cartItemsList.reduce((sum, line) => sum + line.itemUnitPrice * line.quantity, 0),
    [cartItemsList],
  );
  const cartDeliveryFee = cartSubtotal >= 499 ? 0 : cartSubtotal > 0 ? 35 : 0;
  const cartPlatformFee = cartSubtotal > 0 ? 5 : 0;
  const cartGrandTotal = cartSubtotal + cartDeliveryFee + cartPlatformFee;

  const addLineWithSingleStoreGuard = (item: SuperAppCatalogItem, line: CartLineItem) => {
    const existingStoreId = cartItemsList[0]?.item.business_id;
    if (existingStoreId && existingStoreId !== item.business_id) {
      const currentName =
        businesses.find((b) => b.id === existingStoreId)?.name || "Previous Store";
      const pendingName =
        businesses.find((b) => b.id === item.business_id)?.name || "New Store";
      setPendingCartReplace({
        item,
        line,
        currentStoreName: currentName,
        pendingStoreName: pendingName,
      });
      return;
    }

    setCart((prev) => {
      const ex = prev[line.cartKey];
      return {
        ...prev,
        [line.cartKey]: ex ? { ...ex, quantity: ex.quantity + 1 } : line,
      };
    });
    TrustitNative.playHapticFeedback("click");
    showToast(`Added ${item.name} to cart`);
  };

  const handleQuickAddItem = (item: SuperAppCatalogItem) => {
    addLineWithSingleStoreGuard(item, {
      cartKey: `${item.id}_std`,
      item,
      quantity: 1,
      itemUnitPrice: item.price,
    });
  };

  const handleConfirmCustomization = () => {
    if (!customizingItem) return;
    const isHalf = selectedPortion === "half";
    const portionPrice = isHalf
      ? Math.max(20, Math.round((customizingItem.price * 0.6) / 5) * 5)
      : customizingItem.price;
    const chosenAddons = AVAILABLE_ADDONS.filter((a) => selectedAddons.includes(a.id));
    const unitPrice = portionPrice + chosenAddons.reduce((s, a) => s + a.price, 0);
    const cartKey = `${customizingItem.id}_${selectedPortion}_${selectedAddons.sort().join("-")}`;

    addLineWithSingleStoreGuard(customizingItem, {
      cartKey,
      item: customizingItem,
      quantity: 1,
      itemUnitPrice: unitPrice,
      customization: {
        portion: selectedPortion,
        portionLabel: isHalf ? "Half / Regular" : "Full / Family",
        portionPrice,
        addons: chosenAddons,
        cookingNotes: cookingInstruction.trim(),
      },
    });
    setCustomizingItem(null);
  };

  const updateCartLineQty = (cartKey: string, delta: number) => {
    TrustitNative.playHapticFeedback("click");
    setCart((prev) => {
      const existing = prev[cartKey];
      if (!existing) return prev;
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        const copy = { ...prev };
        delete copy[cartKey];
        if (Object.keys(copy).length === 0) showToast("Cart cleared");
        return copy;
      }
      return { ...prev, [cartKey]: { ...existing, quantity: nextQty } };
    });
  };

  // ── Smart Vertical Opening ──
  const handleSelectStore = (store: SuperAppBusiness) => {
    const tLower = (store.type || "").toLowerCase();
    if (tLower.includes("salon") || tLower.includes("parlour") || tLower.includes("barber")) {
      setSalonModal(store);
      return;
    }
    if (tLower.includes("car wash") || tLower.includes("automobile") || tLower.includes("garage")) {
      setCarWashModal(store);
      return;
    }
    setActiveStoreModal(store);
  };

  const handleOpenSmartParcha = () => {
    const k =
      businesses.find((b) => matchesVertical(b.type || "", "kirana")) || businesses[0] || null;
    setKiranaModal(k);
  };

  const handleOpenMedicalRx = () => {
    const m =
      businesses.find((b) => matchesVertical(b.type || "", "medical")) || businesses[0] || null;
    setMedicalModal(m);
  };

  // ── Order Placement (COD & Cashfree 1-Tap) ──
  const buildOrderPayload = (targetBizId: string, mode: "cod" | "online_cashfree") => ({
    businessId: targetBizId,
    customerId: customerId || undefined,
    orderType: "food_delivery",
    customerName: customerName || "Bahraich Customer",
    customerPhone,
    customerAddress: {
      street: customerAddress || userLiveLocation,
      city: selectedCity,
      latitude: userCoords?.lat,
      longitude: userCoords?.lng,
    },
    paymentMode: mode,
    customerNotes: [
      `Out-of-stock rule: ${outOfStockRule}`,
      deliveryScheduleSlot !== "standard_25m" ? `Scheduled: ${deliveryScheduleSlot}` : "Standard 25m",
      "Handover: Call at Gate + 4-Digit PIN",
      riderTip > 0 ? `Rider Tip Note: ₹${riderTip}` : "",
      promoCode ? `Promo: ${promoCode}` : "",
      storeNote.trim(),
    ]
      .filter(Boolean)
      .join(" | "),
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
        c.customization?.cookingNotes ? `Chef: ${c.customization.cookingNotes}` : "",
      ]
        .filter(Boolean)
        .join(" | "),
    })),
  });

  const handlePlaceCodOrder = (targetBizId: string) => {
    startTransition(async () => {
      try {
        const res = await fetch("/api/hyperlocal/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(buildOrderPayload(targetBizId, "cod")),
        });
        const data = await res.json();
        if (data.success) {
          TrustitNative.playHapticFeedback("success");
          const storeName = businesses.find((b) => b.id === targetBizId)?.name || "Bahraich Partner";
          setCart({});
          setRiderTip(0);
          setIsCheckoutOpen(false);
          setActiveStoreModal(null);
          setConfirmedOrderOverlay({
            orderId: data.orderId,
            displayCode: formatUnifiedOrderCode(data.orderId, storeName),
            storeName,
            deliveryOtp: data.deliveryOtp || "4821",
            paymentLabel: "Cash on Delivery",
          });
          fetchActiveBookings(customerPhone);
        } else {
          showToast(data.error || "Could not place order.");
        }
      } catch {
        showToast("Network error placing COD order.");
      }
    });
  };

  const handleInitiateCashfreeGateway = (targetBizId: string, existingOrderId?: string) => {
    setIsPaymentLaunching(true);
    startTransition(async () => {
      try {
        let currentOrderId = existingOrderId;
        let deliveryOtp = "";

        if (!currentOrderId) {
          const resOrder = await fetch("/api/hyperlocal/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(buildOrderPayload(targetBizId, "online_cashfree")),
          });
          const orderData = await resOrder.json();
          if (!orderData.success) {
            setIsPaymentLaunching(false);
            showToast(orderData.error || "Order initialization failed.");
            return;
          }
          currentOrderId = orderData.orderId;
          deliveryOtp = orderData.deliveryOtp;
        }

        const storeName = businesses.find((b) => b.id === targetBizId)?.name || "Bahraich Partner";
        const resSession = await fetch("/api/hyperlocal/payment/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: currentOrderId,
            amount: cartGrandTotal || 100,
            businessId: targetBizId,
            businessName: storeName,
            customerName: customerName || "Trustit Customer",
            customerPhone,
            customerEmail: customerEmail || undefined,
          }),
        });
        const sessionData = await resSession.json();
        if (!sessionData.success || !sessionData.paymentSessionId) {
          setIsPaymentLaunching(false);
          setPaymentRetryState({
            orderId: currentOrderId!,
            amount: cartGrandTotal,
            storeName,
            reason: sessionData.error || "Payment session initialization timed out.",
          });
          return;
        }

        await loadCashfreeSdk();
        setIsPaymentLaunching(false);

        if ((window as any).Cashfree) {
          const cashfree = (window as any).Cashfree({ mode: sessionData.checkoutMode || "sandbox" });
          await cashfree.checkout({
            paymentSessionId: sessionData.paymentSessionId,
            redirectTarget: "_modal",
          });
        }

        const resVerify = await fetch(
          `/api/hyperlocal/payment/verify?orderId=${encodeURIComponent(currentOrderId!)}`,
        );
        const verifyData = await resVerify.json();

        if (verifyData.status === "VERIFIED_SUCCESS") {
          TrustitNative.playHapticFeedback("success");
          setCart({});
          setRiderTip(0);
          setPaymentRetryState(null);
          setIsCheckoutOpen(false);
          setActiveStoreModal(null);
          setConfirmedOrderOverlay({
            orderId: currentOrderId!,
            displayCode: formatUnifiedOrderCode(currentOrderId, storeName),
            storeName,
            deliveryOtp: deliveryOtp || "4821",
            paymentLabel: "Cashfree Paid ✓",
          });
          fetchActiveBookings(customerPhone);
        } else {
          setPaymentRetryState({
            orderId: currentOrderId!,
            amount: cartGrandTotal,
            storeName,
            reason: verifyData.reason || "UPI verification pending. Retry or switch to COD.",
          });
        }
      } catch {
        setIsPaymentLaunching(false);
        showToast("Error launching Cashfree payment.");
      } finally {
        setIsPaymentLaunching(false);
      }
    });
  };

  const handleReorder = (ord: ActiveHyperlocalOrder) => {
    const store = businesses.find((b) => b.id === ord.business_id);
    if (!store) return;
    const newCart: { [key: string]: CartLineItem } = {};
    (ord.hyperlocal_order_items || []).forEach((it, idx) => {
      const catItem: SuperAppCatalogItem = catalogItems.find(
        (c) => c.business_id === ord.business_id && c.name.toLowerCase() === it.item_name.toLowerCase(),
      ) || {
        id: `re_${idx}_${Date.now()}`,
        business_id: ord.business_id,
        category: "Food",
        name: it.item_name,
        price: it.unit_price,
        item_type: it.is_veg ? "veg" : "non_veg",
        is_available: true,
        image_url: null,
        description: null,
      };
      const k = `${catItem.id}_re`;
      newCart[k] = {
        cartKey: k,
        item: catItem,
        quantity: it.quantity || 1,
        itemUnitPrice: it.unit_price || catItem.price,
      };
    });
    setCart(newCart);
    setActiveStoreModal(store);
    setIsMyBookingsOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (customerId) {
      try {
        await fetch(
          `/api/customer/addresses?customerId=${encodeURIComponent(customerId)}&addressId=${encodeURIComponent(addressId)}`,
          { method: "DELETE" },
        );
      } catch {}
    }
    const updated = savedAddresses.filter((a) => a.id !== addressId);
    setSavedAddresses(updated);
    try {
      localStorage.setItem("trustit_saved_addresses_v1", JSON.stringify(updated));
    } catch {}
  };

  const handleCheckoutPayment = () => {
    if (!customerPhone.trim() || customerPhone.length < 10) {
      openLoginOrResume();
      showToast("Please sign in with +91 mobile number to place order.");
      return;
    }
    if ((!addressVerified && savedAddresses.length === 0) || !customerAddress.trim()) {
      setIsAddressModalOpen(true);
      showToast(`Please verify your ${selectedCity || "delivery"} address before placing order.`);
      return;
    }
    if (cartItemsList.length === 0 || !cartStoreId) return;

    if (paymentMethodChoice === "cod") handlePlaceCodOrder(cartStoreId);
    else handleInitiateCashfreeGateway(cartStoreId);
  };

  // ── Parcha (N-17) & Pharmacy Rx (N-18) ──
  const handleSubmitParcha = (isMedicalRx = false) => {
    const targetStore = isMedicalRx ? medicalModal : kiranaModal;
    if (!targetStore) return;
    if (!customerPhone.trim() || customerPhone.length < 10) {
      openLoginOrResume();
      showToast("Sign in with +91 mobile to send Parcha / Rx.");
      return;
    }
    if ((!addressVerified && savedAddresses.length === 0) || !customerAddress.trim()) {
      setIsAddressModalOpen(true);
      showToast(`Please verify your ${selectedCity || "delivery"} address first.`);
      return;
    }
    if (!parchaText.trim() && !parchaImagePreview) {
      showToast("Please upload photo or write item/medicine names.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await fetch("/api/hyperlocal/parcha", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: targetStore.id,
            customerName: customerName || "Bahraich Customer",
            customerPhone,
            customerAddress: { street: customerAddress || userLiveLocation, city: selectedCity },
            handwrittenText: isMedicalRx ? `[MEDICAL RX] ${parchaText}` : parchaText,
            parchaImageUrl: parchaImagePreview,
            customerNotes: isMedicalRx
              ? `[Schedule-H Rx Verification Required] ${parchaNotes}`
              : parchaNotes,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setKiranaModal(null);
          setMedicalModal(null);
          setParchaText("");
          setParchaImagePreview(null);
          setParchaNotes("");
          setConfirmedOrderOverlay({
            orderId: data.orderId,
            displayCode: formatUnifiedOrderCode(data.orderId, targetStore.name),
            storeName: targetStore.name,
            deliveryOtp: data.deliveryOtp || "4821",
            paymentLabel: isMedicalRx ? "Rx Sent to Chemist" : "Parcha Sent (5m Quote)",
          });
          fetchActiveBookings(customerPhone);
        } else {
          showToast(data.error || "Failed to submit.");
        }
      } catch {
        showToast("Network error submitting Parcha/Rx.");
      }
    });
  };

  // ── Salon & Car Wash Token Bookings (N-19) ──
  const handleBookSalonToken = () => {
    if (!salonModal) return;
    if (!customerPhone.trim() || customerPhone.length < 10) {
      openLoginOrResume();
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/hyperlocal/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: salonModal.id,
            serviceType: "salon_haircut",
            customerName: customerName || "Guest",
            customerPhone,
            vehicleOrNotes: `Service: ${salonService} • Stylist: ${salonStylist}`,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setSalonModal(null);
          showToast(`Salon Token #${data.tokenNumber} Confirmed!`);
          setIsMyBookingsOpen(true);
          fetchActiveBookings(customerPhone);
        } else {
          showToast(data.error || "Failed to book token.");
        }
      } catch {
        showToast("Error booking salon token.");
      }
    });
  };

  const handleBookCarWashSlot = () => {
    if (!carWashModal) return;
    if (!customerPhone.trim() || customerPhone.length < 10) {
      openLoginOrResume();
      return;
    }
    if (!vehicleNumber.trim()) {
      showToast("Enter vehicle number (e.g. UP 40 AB 1234).");
      return;
    }
    startTransition(async () => {
      try {
        const res = await fetch("/api/hyperlocal/tokens", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            businessId: carWashModal.id,
            serviceType: "car_foam_wash",
            customerName: customerName || "Guest",
            customerPhone,
            vehicleOrNotes: `Vehicle: ${vehicleNumber} (${vehicleModel || "Car"}) • ${carWashPackage}`,
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCarWashModal(null);
          setVehicleNumber("");
          setVehicleModel("");
          showToast(`Wash Bay Token #${data.tokenNumber} Confirmed!`);
          setIsMyBookingsOpen(true);
          fetchActiveBookings(customerPhone);
        } else {
          showToast(data.error || "Failed to book bay.");
        }
      } catch {
        showToast("Error booking wash bay.");
      }
    });
  };

  // ── Notifications Feed (N-30) ──
  const notificationsList: CustomerNotificationItem[] = useMemo(() => {
    const items: CustomerNotificationItem[] = [
      {
        id: "deal_speedpass",
        title: "⚡ Trustit SpeedPass Active in Bahraich",
        body: "Enjoy priority 20-min rider dispatch on Food, Kirana & Medical Rx.",
        timeLabel: "Today",
        kind: "deal",
      },
      {
        id: "deal_qr",
        title: "📷 Earn ₹10 Trustit Money Cashback",
        body: "Scan any verified shop counter Standee QR after your visit.",
        timeLabel: "Offer",
        kind: "deal",
      },
    ];
    activeParchas.forEach((p) => {
      items.unshift({
        id: `p_${p.order_id}`,
        title: p.merchant_quote_amount ? "📝 Parcha Quote Ready!" : "📝 Parcha Sent to Store",
        body: p.merchant_quote_amount
          ? `Your Kirana quote is ₹${p.merchant_quote_amount}. Tap Orders to view.`
          : "Kirana partner is preparing your 5-minute quote.",
        timeLabel: "Live",
        kind: "parcha",
      });
    });
    return items;
  }, [activeParchas]);

  const lastBackPressRef = useRef<number>(0);

  const registerHomeSubBack = useCallback((fn: (() => boolean) | null) => {
    homeSubBackRef.current = fn;
  }, []);
  const registerStoreSubBack = useCallback((fn: (() => boolean) | null) => {
    storeSubBackRef.current = fn;
  }, []);
  const registerOrdersSubBack = useCallback((fn: (() => boolean) | null) => {
    ordersSubBackRef.current = fn;
  }, []);
  const registerAddressSubBack = useCallback((fn: (() => boolean) | null) => {
    addressSubBackRef.current = fn;
  }, []);
  const registerProfileSubBack = useCallback((fn: (() => boolean) | null) => {
    profileSubBackRef.current = fn;
  }, []);

  const handleHardwareBack = useCallback((): boolean => {
    if (isGoogleModalOpen) {
      setIsGoogleModalOpen(false);
      return true;
    }
    if (customizingItem) {
      setCustomizingItem(null);
      return true;
    }
    if (pendingCartReplace) {
      setPendingCartReplace(null);
      return true;
    }
    if (paymentRetryState) {
      setPaymentRetryState(null);
      return true;
    }
    if (confirmedOrderOverlay) {
      setConfirmedOrderOverlay(null);
      return true;
    }
    if (isStandeeModalOpen) {
      setIsStandeeModalOpen(false);
      return true;
    }
    if (isAddressModalOpen) {
      if (addressSubBackRef.current?.()) return true;
      setIsAddressModalOpen(false);
      return true;
    }
    if (isProfileOpen) {
      if (profileSubBackRef.current?.()) return true;
      setIsProfileOpen(false);
      return true;
    }
    if (isCheckoutOpen) {
      setIsCheckoutOpen(false);
      return true;
    }
    if (isMyBookingsOpen) {
      if (ordersSubBackRef.current?.()) return true;
      setIsMyBookingsOpen(false);
      return true;
    }
    if (isNotificationsOpen) {
      setIsNotificationsOpen(false);
      return true;
    }
    if (kiranaModal) {
      setKiranaModal(null);
      return true;
    }
    if (medicalModal) {
      setMedicalModal(null);
      return true;
    }
    if (salonModal) {
      setSalonModal(null);
      return true;
    }
    if (carWashModal) {
      setCarWashModal(null);
      return true;
    }
    if (activeStoreModal) {
      if (storeSubBackRef.current?.()) return true;
      setActiveStoreModal(null);
      return true;
    }
    if (isOnboardingOpen) {
      if (onboardingStep === "otp") {
        setOnboardingStep("login");
        return true;
      }
      if (!customerId && !guestMode) return true;
      setIsOnboardingOpen(false);
      return true;
    }
    if (homeSubBackRef.current?.()) {
      return true;
    }
    if (searchQuery.trim().length > 0) {
      setSearchQuery("");
      return true;
    }
    if (bottomTabHistoryRef.current.length > 0) {
      const prevTab = bottomTabHistoryRef.current.pop()!;
      setBottomTab(prevTab);
      return true;
    }
    if (bottomTab !== "home") {
      setBottomTab("home");
      return true;
    }
    if (verticalTabHistoryRef.current.length > 0) {
      const prevVert = verticalTabHistoryRef.current.pop()!;
      setActiveTab(prevVert);
      return true;
    }
    const now = Date.now();
    if (now - lastBackPressRef.current < 2000) {
      return false;
    }
    lastBackPressRef.current = now;
    showToast("Press back again to exit");
    return true;
  }, [
    isGoogleModalOpen,
    customizingItem,
    pendingCartReplace,
    paymentRetryState,
    confirmedOrderOverlay,
    isStandeeModalOpen,
    isAddressModalOpen,
    isProfileOpen,
    isCheckoutOpen,
    isMyBookingsOpen,
    isNotificationsOpen,
    kiranaModal,
    medicalModal,
    salonModal,
    carWashModal,
    activeStoreModal,
    isOnboardingOpen,
    onboardingStep,
    searchQuery,
    bottomTab,
    showToast,
  ]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as any).__handleTrustitBack = handleHardwareBack;
    try {
      window.history.pushState({ trustitOrderNav: true }, "", window.location.pathname);
    } catch {}
    const onPopState = () => {
      try {
        window.history.pushState({ trustitOrderNav: true }, "", window.location.pathname);
      } catch {}
      handleHardwareBack();
    };
    window.addEventListener("popstate", onPopState);
    let capHandle: any = null;
    try {
      const capApp = (window as any).Capacitor?.Plugins?.App;
      if (capApp?.addListener) {
        capApp
          .addListener("backButton", () => {
            const handled = handleHardwareBack();
            if (!handled) capApp.exitApp?.();
          })
          .then((h: any) => {
            capHandle = h;
          });
      }
    } catch {}
    return () => {
      window.removeEventListener("popstate", onPopState);
      capHandle?.remove?.();
    };
  }, [handleHardwareBack]);

  const totalActiveCount = activeOrders.length + activeTokens.length + activeParchas.length;
  const unreadNotifCount = useMemo(
    () =>
      notificationsList.filter((n) => !seenNotifKeys.includes(`${n.id}:${n.body}`)).length,
    [notificationsList, seenNotifKeys],
  );

  const markAllNotificationsSeen = useCallback(() => {
    const keys = notificationsList.map((n) => `${n.id}:${n.body}`);
    setSeenNotifKeys((prev) => {
      const merged = Array.from(new Set([...prev, ...keys]));
      try {
        localStorage.setItem("trustit_seen_notifs", JSON.stringify(merged.slice(-80)));
      } catch {}
      return merged;
    });
  }, [notificationsList]);

  return (
    <>
      {/* N-01 Brand Splash */}
      <CustomerBrandSplash
        visible={showSplash}
        onFinish={() => {
          setShowSplash(false);
          try {
            sessionStorage.setItem("trustit_splash_seen", "1");
          } catch {}
        }}
      />

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-[80] rounded-full bg-[#001945] text-white px-4 py-2 text-xs font-bold shadow-xl border border-[#9cf0ff]/30">
          {toastMessage}
        </div>
      )}

      {/* N-07 to N-12 Home, Categories, Search & Store Cards */}
      <CustomerHomeAndDiscovery
        lang={lang}
        bottomTab={bottomTab}
        setBottomTab={navigateBottomTab}
        activeTab={activeTab}
        setActiveTab={navigateVerticalTab}
        userLiveLocation={userLiveLocation}
        districtName={selectedCity}
        rewardPoints={rewardPoints}
        isAuthenticated={Boolean(customerId || customerPhone)}
        onRequestLogin={openLoginOrResume}
        userCoords={userCoords}
        customerName={customerName}
        totalActiveCount={totalActiveCount}
        unreadNotifCount={unreadNotifCount}
        onOpenLocationLock={() => {
          detectLiveLocation(false);
          setOnboardingStep("gps_lock");
          setIsOnboardingOpen(true);
        }}
        onOpenNotifications={() => {
          markAllNotificationsSeen();
          setIsNotificationsOpen(true);
        }}
        onOpenActiveOrders={() => {
          setIsMyBookingsOpen(true);
          if (customerPhone) fetchActiveBookings(customerPhone);
        }}
        onOpenProfile={() => {
          setIsProfileOpen(true);
          fetchCustomerPoints(customerId, customerPhone);
        }}
        onOpenStandeeScanner={() => setIsStandeeModalOpen(true)}
        onOpenSmartParcha={handleOpenSmartParcha}
        onOpenMedicalRx={handleOpenMedicalRx}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        businesses={businesses}
        filteredBusinesses={filteredBusinesses}
        catalogItems={catalogItems}
        favoriteStoreIds={favoriteStoreIds}
        onSelectStore={handleSelectStore}
        onQuickAddItem={handleQuickAddItem}
        cartCount={cartItemsList.reduce((s, l) => s + l.quantity, 0)}
        cartGrandTotal={cartGrandTotal}
        cartStoreName={cartStore?.name || "Store"}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onRegisterSubBack={registerHomeSubBack}
      />

      {/* N-02 to N-06 Onboarding, Login +91, WhatsApp OTP, Name+Push, GPS Lock */}
      <CustomerOnboardingModal
        isOpen={isOnboardingOpen}
        onClose={() => {
          if (!customerId && !guestMode) return;
          setIsOnboardingOpen(false);
        }}
        onContinueAsGuest={() => {
          setGuestMode(true);
          try {
            localStorage.setItem("trustit_guest_mode", "1");
          } catch {}
          setIsOnboardingOpen(false);
          showToast(`Exploring ${selectedCity || "local"} stores as Guest`);
        }}
        requireAuthChoice={!customerId && !guestMode}
        districtName={selectedCity}
        lang={lang}
        step={onboardingStep}
        setStep={setOnboardingStep}
        rememberedUser={rememberedUser}
        onContinueRemembered={handleContinueRemembered}
        authMode={authMode}
        setAuthMode={setAuthMode}
        loginPhone={loginPhone}
        setLoginPhone={setLoginPhone}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginOtp={loginOtp}
        setLoginOtp={setLoginOtp}
        loginOtpCountdown={loginOtpCountdown}
        isSendingOtp={isSendingOtp}
        isVerifyingOtp={isVerifyingOtp}
        isGoogleLoading={isGoogleLoading}
        otpError={otpError}
        otpNotice={otpNotice}
        onSendOtp={handleSendOtp}
        onVerifyOtp={handleVerifyOtp}
        onOpenGoogleModal={() => setIsGoogleModalOpen(true)}
        newCustomerName={newCustomerName}
        setNewCustomerName={setNewCustomerName}
        pushEnabled={pushEnabled}
        onEnablePushAndSaveName={handleCreateProfile}
        userLiveLocation={userLiveLocation}
        addrPincode={addrPincode}
        isDetectingGps={isDetectingGps}
        onDetectGps={() => detectLiveLocation(false)}
        onSelectBahraichArea={(area) => {
          setUserLiveLocation(area.name);
          setSelectedCity("Bahraich");
          setAddrPincode(area.pincode);
          setUserCoords({ lat: area.lat, lng: area.lng });
          setCustomerAddress(area.name);
          setAddressVerified(true);
          try {
            localStorage.setItem("trustit_addr_verified", "1");
            localStorage.setItem(
              "trustit_customer_location",
              JSON.stringify({
                locationName: area.name,
                city: "Bahraich",
                district: "Bahraich",
                pincode: area.pincode,
                formatted: area.name,
                lat: area.lat,
                lng: area.lng,
                manualPin: true,
                time: Date.now(),
              }),
            );
          } catch {}
          setIsOnboardingOpen(false);
          showToast(`Location set to ${area.mohalla}`);
        }}
      />

      {/* N-13 to N-19 Storefront, Info/Translate, Verified Reviews/Standee, Customizer, Parcha, Rx, Salon/Wash */}
      <CustomerStorefrontAndVerticals
        lang={lang}
        onToggleLanguage={() => {
          const next: CustomerLanguage = lang === "en" ? "hi" : "en";
          setLang(next);
          try {
            localStorage.setItem("trustit_cust_lang", next);
          } catch {}
          showToast(next === "hi" ? "भाषा हिन्दी में बदली गई" : "Language set to English");
        }}
        userCoords={userCoords}
        userLiveLocation={userLiveLocation}
        activeStore={activeStoreModal}
        onCloseStore={() => setActiveStoreModal(null)}
        storeItems={activeStoreItems}
        favoriteStoreIds={favoriteStoreIds}
        onToggleFavorite={(id) => {
          setFavoriteStoreIds((prev) => {
            const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            try {
              localStorage.setItem("trustit_favorite_stores", JSON.stringify(next));
            } catch {}
            return next;
          });
        }}
        cartItemsList={cartItemsList}
        cartGrandTotal={cartGrandTotal}
        onQuickAddItem={handleQuickAddItem}
        onOpenCustomizer={(item) => {
          setCustomizingItem(item);
          setSelectedPortion("half");
          setSelectedAddons([]);
          setCookingInstruction("");
        }}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
        onOpenStandeeScanner={() => setIsStandeeModalOpen(true)}
        onClaimStandeeReward={() => {
          setWalletBalance((prev) => {
            const next = prev + 10;
            try {
              localStorage.setItem("trustit_money_balance", String(next));
            } catch {}
            return next;
          });
        }}
        isStandeeOpen={isStandeeModalOpen}
        onCloseStandee={() => setIsStandeeModalOpen(false)}
        customizingItem={customizingItem}
        onCloseCustomizer={() => setCustomizingItem(null)}
        selectedPortion={selectedPortion}
        setSelectedPortion={setSelectedPortion}
        selectedAddons={selectedAddons}
        setSelectedAddons={setSelectedAddons}
        cookingInstruction={cookingInstruction}
        setCookingInstruction={setCookingInstruction}
        onConfirmCustomization={handleConfirmCustomization}
        kiranaModal={kiranaModal}
        onCloseKirana={() => setKiranaModal(null)}
        parchaText={parchaText}
        setParchaText={setParchaText}
        parchaImagePreview={parchaImagePreview}
        setParchaImagePreview={setParchaImagePreview}
        parchaNotes={parchaNotes}
        setParchaNotes={setParchaNotes}
        onSubmitParcha={handleSubmitParcha}
        medicalModal={medicalModal}
        onCloseMedical={() => setMedicalModal(null)}
        salonModal={salonModal}
        onCloseSalon={() => setSalonModal(null)}
        salonService={salonService}
        setSalonService={setSalonService}
        salonStylist={salonStylist}
        setSalonStylist={setSalonStylist}
        onBookSalonToken={handleBookSalonToken}
        carWashModal={carWashModal}
        onCloseCarWash={() => setCarWashModal(null)}
        carWashPackage={carWashPackage}
        setCarWashPackage={setCarWashPackage}
        vehicleNumber={vehicleNumber}
        setVehicleNumber={setVehicleNumber}
        vehicleModel={vehicleModel}
        setVehicleModel={setVehicleModel}
        onBookCarWashSlot={handleBookCarWashSlot}
        isSubmitting={isSubmitting}
        onRegisterSubBack={registerStoreSubBack}
      />

      {/* N-20 to N-25 Cart, Saved Addresses, Map Pin, Checkout, Retry 08:42 & Order Confirmed PIN */}
      <CustomerCheckoutAndAddresses
        lang={lang}
        cartConflictPrompt={
          pendingCartReplace
            ? {
                pendingStoreName: pendingCartReplace.pendingStoreName,
                currentStoreName: pendingCartReplace.currentStoreName,
              }
            : null
        }
        onConfirmReplaceCart={() => {
          if (!pendingCartReplace) return;
          setCart({ [pendingCartReplace.line.cartKey]: pendingCartReplace.line });
          showToast(`Cart switched to ${pendingCartReplace.pendingStoreName}`);
          setPendingCartReplace(null);
        }}
        onCancelReplaceCart={() => setPendingCartReplace(null)}
        isCheckoutOpen={isCheckoutOpen}
        onCloseCheckout={() => setIsCheckoutOpen(false)}
        cartStore={cartStore}
        cartItemsList={cartItemsList}
        onUpdateCartQty={updateCartLineQty}
        onClearCart={() => {
          setCart({});
          showToast("Cart cleared");
        }}
        outOfStockRule={outOfStockRule}
        setOutOfStockRule={setOutOfStockRule}
        storeNote={storeNote}
        setStoreNote={setStoreNote}
        deliveryScheduleSlot={deliveryScheduleSlot}
        setDeliveryScheduleSlot={setDeliveryScheduleSlot}
        riderTip={riderTip}
        setRiderTip={setRiderTip}
        promoCode={promoCode}
        setPromoCode={setPromoCode}
        subtotal={cartSubtotal}
        deliveryFee={cartDeliveryFee}
        platformFee={cartPlatformFee}
        grandTotal={cartGrandTotal}
        paymentMethodChoice={paymentMethodChoice}
        setPaymentMethodChoice={setPaymentMethodChoice}
        customerAddress={customerAddress}
        savedAddresses={savedAddresses}
        selectedAddressId={selectedAddressId}
        onSelectAddress={(addr) => {
          setSelectedAddressId(addr.id);
          setCustomerAddress(addr.street);
          if (addr.latitude && addr.longitude) {
            setUserCoords({ lat: addr.latitude, lng: addr.longitude });
          }
        }}
        onOpenAddressManager={() => setIsAddressModalOpen(true)}
        onPlaceOrder={handleCheckoutPayment}
        isSubmitting={isSubmitting}
        isPaymentLaunching={isPaymentLaunching}
        isAddressModalOpen={isAddressModalOpen}
        onCloseAddressModal={() => setIsAddressModalOpen(false)}
        customerId={customerId}
        userCoords={userCoords}
        onSaveAddressRecord={async (payload) => {
          const full = [
            payload.houseNo.trim(),
            payload.mohalla.trim(),
            payload.road.trim(),
            payload.pincode ? `Pin: ${payload.pincode}` : "",
            payload.district || "Bahraich",
          ]
            .filter(Boolean)
            .join(", ");
          setCustomerAddress(full);
          setAddressVerified(true);
          try {
            localStorage.setItem("trustit_addr_verified", "1");
          } catch {}
          if (payload.lat && payload.lng) {
            setUserCoords({ lat: payload.lat, lng: payload.lng });
          }
          if (customerId) {
            try {
              const res = await fetch("/api/customer/addresses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  customerId,
                  address: {
                    label: payload.tag,
                    street: full,
                    city: payload.district || "Bahraich",
                    pincode: payload.pincode || "271801",
                    latitude: payload.lat,
                    longitude: payload.lng,
                    isDefault: true,
                  },
                }),
              });
              const d = await res.json();
              if (d.success && d.address) {
                const updated = [
                  { ...d.address, tag: d.address.label },
                  ...savedAddresses.filter((a) => a.id !== d.address.id),
                ];
                setSavedAddresses(updated);
                setSelectedAddressId(d.address.id);
                localStorage.setItem("trustit_saved_addresses_v1", JSON.stringify(updated));
                showToast("Bahraich address & Gate pin saved!");
                return;
              }
            } catch {}
          }
          const localEntry: CustomerSavedAddress = {
            id: `addr_${Date.now()}`,
            tag: payload.tag,
            label: payload.tag,
            street: full,
            city: payload.district || "Bahraich",
            pincode: payload.pincode || "271801",
            latitude: payload.lat,
            longitude: payload.lng,
            isDefault: true,
          };
          const updated = [localEntry, ...savedAddresses];
          setSavedAddresses(updated);
          setSelectedAddressId(localEntry.id);
          try {
            localStorage.setItem("trustit_saved_addresses_v1", JSON.stringify(updated));
          } catch {}
          showToast("Address saved!");
        }}
        onDeleteAddress={handleDeleteAddress}
        onUseGpsForPin={() => detectLiveLocation(false)}
        onRegisterSubBack={registerAddressSubBack}
        paymentRetryState={paymentRetryState}
        onRetryCashfree={(orderId) => {
          const targetBiz = cartStoreId || businesses[0]?.id || "";
          setPaymentRetryState(null);
          handleInitiateCashfreeGateway(targetBiz, orderId);
        }}
        onSwitchOrderToCod={async (orderId) => {
          try {
            const res = await fetch("/api/hyperlocal/orders", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "switch_to_cod", orderId }),
            });
            const d = await res.json();
            if (d.success) {
              setPaymentRetryState(null);
              setCart({});
              setIsCheckoutOpen(false);
              setActiveStoreModal(null);
              showToast("Switched to Cash on Delivery (COD)!");
              setIsMyBookingsOpen(true);
              fetchActiveBookings(customerPhone);
            }
          } catch {
            showToast("Could not switch payment mode.");
          }
        }}
        onDismissPaymentRetry={() => setPaymentRetryState(null)}
        confirmedOrderOverlay={confirmedOrderOverlay}
        onTrackConfirmedOrder={() => {
          setConfirmedOrderOverlay(null);
          setIsMyBookingsOpen(true);
          fetchActiveBookings(customerPhone);
        }}
        onCloseConfirmedOverlay={() => setConfirmedOrderOverlay(null)}
      />

      {/* N-26 to N-30 Live Route Map, GST Receipt, Orders Hub, Cancel/UTR/Chat & Notifications */}
      <CustomerOrdersAndSupport
        isOrdersOpen={isMyBookingsOpen}
        onCloseOrders={() => setIsMyBookingsOpen(false)}
        customerPhone={customerPhone}
        userCoords={userCoords}
        activeOrders={activeOrders}
        pastOrders={customerPastOrders}
        activeTokens={activeTokens}
        activeParchas={activeParchas}
        isRefreshing={isRefreshingBookings}
        onRefreshBookings={() => fetchActiveBookings(customerPhone)}
        onRetryPendingPayment={(ord) => handleInitiateCashfreeGateway(ord.business_id, ord.id)}
        onReorder={handleReorder}
        onCustomerCancelOrder={async (orderId, reason) => {
          try {
            const res = await fetch("/api/hyperlocal/orders", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ action: "customer_cancel", orderId, reason }),
            });
            const d = await res.json();
            if (d.success) fetchActiveBookings(customerPhone);
            return d;
          } catch {
            return { success: false, error: "Network error cancelling order." };
          }
        }}
        foodRatings={foodRatings}
        setFoodRatings={setFoodRatings}
        deliveryRatings={deliveryRatings}
        setDeliveryRatings={setDeliveryRatings}
        isNotificationsOpen={isNotificationsOpen}
        onCloseNotifications={() => {
          markAllNotificationsSeen();
          setIsNotificationsOpen(false);
        }}
        notifications={notificationsList}
        onOpenOrdersFromNotif={() => setIsMyBookingsOpen(true)}
        onRegisterSubBack={registerOrdersSubBack}
      />

      {/* N-31 & N-32 Profile Hub, Trustit Money, SpeedPass & DPDP Account Settings */}
      <CustomerProfileAndSettings
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        lang={lang}
        onToggleLanguage={() => {
          const next: CustomerLanguage = lang === "en" ? "hi" : "en";
          setLang(next);
          try {
            localStorage.setItem("trustit_cust_lang", next);
          } catch {}
        }}
        customerId={customerId}
        customerName={customerName}
        customerPhone={customerPhone}
        customerEmail={customerEmail}
        walletBalance={walletBalance}
        rewardPoints={rewardPoints}
        speedPassActive={speedPassActive}
        onActivateSpeedPass={() => {
          setSpeedPassActive(true);
          try {
            localStorage.setItem("trustit_speedpass", "1");
          } catch {}
          showToast("⚡ Trustit SpeedPass Activated!");
        }}
        pushEnabled={pushEnabled}
        onTogglePush={async () => {
          const next = !pushEnabled;
          if (next && typeof window !== "undefined" && "Notification" in window) {
            try {
              await Notification.requestPermission();
            } catch {}
          }
          setPushEnabled(next);
          try {
            localStorage.setItem("trustit_push_enabled", next ? "1" : "0");
          } catch {}
        }}
        onUpdateCustomerName={(newName) => {
          const clean = newName.trim();
          if (!clean) return;
          setCustomerName(clean);
          saveCustomerProfile(clean, customerPhone, customerAddress, customerEmail, customerId);
          showToast("Profile name updated!");
        }}
        onOpenPastOrders={() => openAccountSection("past_orders")}
        onOpenAddresses={() => openAccountSection("addresses")}
        onOpenStandeeQr={() => setIsStandeeModalOpen(true)}
        onOpenLogin={() => {
          if (isLoginEntryStep || isNamePromptStep || activeAccountSectionLabel) {
            openLoginOrResume();
          }
        }}
        onSignOut={handleSignOut}
        onDeleteAccount={handleDeleteAccount}
        onRegisterSubBack={registerProfileSubBack}
      />

      {/* Cashfree Instant Launcher Modal (Zero Perceived Lag) */}
      {isPaymentLaunching && (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xs rounded-3xl bg-white p-5 text-center shadow-2xl space-y-3 border border-[#c3c6d4]">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#f2f3ff] text-2xl flex items-center justify-center text-[#003178]">
              ⚡
            </div>
            <div>
              <h4 className="text-sm font-black text-[#003178]">Connecting to Cashfree</h4>
              <p className="text-[11px] text-[#434652] mt-0.5">
                Pay Online via UPI, PhonePe, GPay, Cards &amp; NetBanking
              </p>
            </div>
            <div className="h-1.5 w-full bg-[#eaedff] rounded-full overflow-hidden">
              <div className="h-full bg-[#003178] rounded-full animate-pulse w-3/4" />
            </div>
            <p className="text-[10px] text-[#737783]">100% RBI Compliant &amp; Encrypted</p>
          </div>
        </div>
      )}

      {/* Google 1-Tap Consent Modal */}
      <GoogleConsentModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        role="customer"
        defaultName={customerName}
        defaultEmail={customerEmail}
        onSuccess={({ email, fullName }) => {
          handleGoogleSignIn(email, fullName);
        }}
      />

      {/* WhatsApp Notification Banner with 1-Tap Auto-Fill */}
      <WhatsAppOtpNotificationBanner
        otpCode={activeWhatsAppOtp}
        phone={loginPhone}
        onAutoFill={(code) => setLoginOtp(code)}
        onDismiss={() => setActiveWhatsAppOtp(null)}
      />
    </>
  );
}
