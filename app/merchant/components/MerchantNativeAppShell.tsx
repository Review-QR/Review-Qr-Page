"use client";

import React, { useState, useEffect, useRef } from "react";
import { merchantAudio } from "@/lib/audio/merchant-siren";
import { TrustitNative } from "@/lib/native/trustit-native-service";
import DongleSliderSwitch from "./DongleSliderSwitch";

// ============================================================
// ALL 68 MODULAR PRODUCTION SCREENS
// ============================================================

// Onboarding & Auth (4 screens)
import ScreenAuth01LandingBecomePartner from "./screens/ScreenAuth01LandingBecomePartner";
import ScreenAuth02BusinessCategoryWizard from "./screens/ScreenAuth02BusinessCategoryWizard";
import ScreenAuth03MobileKycRegistration from "./screens/ScreenAuth03MobileKycRegistration";
import ScreenAuth04PartnerLogin from "./screens/ScreenAuth04PartnerLogin";

// Kirana Mart (4 screens)
import ScreenK01KiranaCockpit from "./screens/ScreenK01KiranaCockpit";
import ScreenK02ParchaOrderViewer from "./screens/ScreenK02ParchaOrderViewer";
import ScreenK04KiranaReviewStandee from "./screens/ScreenK04KiranaReviewStandee";

// Chemist & Medical (4 screens)
import ScreenM01ChemistCockpit from "./screens/ScreenM01ChemistCockpit";
import ScreenM02PrescriptionRxViewer from "./screens/ScreenM02PrescriptionRxViewer";
import ScreenM03ChemistMedicineCatalog from "./screens/ScreenM03ChemistMedicineCatalog";
import ScreenM04ChemistReviewStandee from "./screens/ScreenM04ChemistReviewStandee";

// Salon & Spa (4 screens)
import ScreenS01SalonCockpit from "./screens/ScreenS01SalonCockpit";
import ScreenS02LiveChairTokenQueue from "./screens/ScreenS02LiveChairTokenQueue";
import ScreenS03SalonServicesRateCard from "./screens/ScreenS03SalonServicesRateCard";
import ScreenS04SalonMirrorReviewStandee from "./screens/ScreenS04SalonMirrorReviewStandee";

// Car Wash & Garage (4 screens)
import ScreenC01CarWashCockpit from "./screens/ScreenC01CarWashCockpit";
import ScreenC02WashingBayQueue from "./screens/ScreenC02WashingBayQueue";
import ScreenC03VehicleTypePackages from "./screens/ScreenC03VehicleTypePackages";
import ScreenC04CarWashReviewStandee from "./screens/ScreenC04CarWashReviewStandee";

// Core Operations & Restaurant (48 screens)
import Screen01MainCockpit from "./screens/Screen01MainCockpit";
import Screen02IncomingOrderSiren from "./screens/Screen02IncomingOrderSiren";
import Screen03UrgentQueueDrawer from "./screens/Screen03UrgentQueueDrawer";
import Screen04OccasionDailyPulse from "./screens/Screen04OccasionDailyPulse";
import Screen05StoreBrandProfile from "./screens/Screen05StoreBrandProfile";
import Screen06GpsGeofence from "./screens/Screen06GpsGeofence";
import Screen07GoogleReviewGating from "./screens/Screen07GoogleReviewGating";
import Screen08OperatingHours from "./screens/Screen08OperatingHours";
import Screen09OrdersMasterBoard from "./screens/Screen09OrdersMasterBoard";
import Screen10OrderDetailDrawer from "./screens/Screen10OrderDetailDrawer";
import Screen11KotThermalReceipt from "./screens/Screen11KotThermalReceipt";
import Screen12RiderDispatchModal from "./screens/Screen12RiderDispatchModal";
import Screen13MenuExplorer from "./screens/Screen13MenuExplorer";
import Screen14AddProductModal from "./screens/Screen14AddProductModal";
import Screen15OutOfStockSwitcher from "./screens/Screen15OutOfStockSwitcher";
import Screen16CategoryMasterPreset from "./screens/Screen16CategoryMasterPreset";
import Screen17VectorQrDownload from "./screens/Screen17VectorQrDownload";
import Screen18StandeeTemplateGallery from "./screens/Screen18StandeeTemplateGallery";
import Screen19CustomerReviewsFeed from "./screens/Screen19CustomerReviewsFeed";
import Screen20ReviewReplyModal from "./screens/Screen20ReviewReplyModal";
import Screen21MerchandiseCatalog from "./screens/Screen21MerchandiseCatalog";
import Screen22MockupCustomizer from "./screens/Screen22MockupCustomizer";
import Screen23CartCheckout from "./screens/Screen23CartCheckout";
import Screen24OrderTrackingWaybill from "./screens/Screen24OrderTrackingWaybill";
import Screen25OccasionsCrmBoard from "./screens/Screen25OccasionsCrmBoard";
import Screen26AiPosterCreator from "./screens/Screen26AiPosterCreator";
import Screen27WhatsAppComposer from "./screens/Screen27WhatsAppComposer";
import Screen28ConnectWalletRecharge from "./screens/Screen28ConnectWalletRecharge";
import Screen29ScanFootfallTrends from "./screens/Screen29ScanFootfallTrends";
import Screen30HourlyRushHeatmap from "./screens/Screen30HourlyRushHeatmap";
import Screen31CustomerSentimentTags from "./screens/Screen31CustomerSentimentTags";
import Screen32ReportsDataExporter from "./screens/Screen32ReportsDataExporter";
import Screen33PlanStatusCockpit from "./screens/Screen33PlanStatusCockpit";
import Screen34ThreeTierMatrix from "./screens/Screen34ThreeTierMatrix";
import Screen35SubscriptionAutoPay from "./screens/Screen35SubscriptionAutoPay";
import Screen36GstTaxInvoices from "./screens/Screen36GstTaxInvoices";
import Screen37DailySettlementLedger from "./screens/Screen37DailySettlementLedger";
import Screen38SettlementBreakdownModal from "./screens/Screen38SettlementBreakdownModal";
import Screen39BankKycPennyDrop from "./screens/Screen39BankKycPennyDrop";
import Screen40PayoutExcelDownloader from "./screens/Screen40PayoutExcelDownloader";
import Screen41SecurityTwoFactor from "./screens/Screen41SecurityTwoFactor";
import Screen42MultiOutletSwitcher from "./screens/Screen42MultiOutletSwitcher";
import Screen43StaffRolesMatrix from "./screens/Screen43StaffRolesMatrix";
import Screen44AuditSessionsLog from "./screens/Screen44AuditSessionsLog";
import Screen45OperationsSupportHub from "./screens/Screen45OperationsSupportHub";
import Screen46ThermalPrinterWizard from "./screens/Screen46ThermalPrinterWizard";
import Screen47TicketDeskDisputes from "./screens/Screen47TicketDeskDisputes";
import Screen48OfflineSafeMode from "./screens/Screen48OfflineSafeMode";

export type MerchantCategory = "kirana" | "restaurant" | "chemist" | "salon" | "carwash";
export type PrimaryTab = "cockpit" | "orders" | "menu" | "standee" | "more";

interface MerchantNativeAppShellProps {
  initialAuth?: boolean;
  initialAuthStep?: "pitch" | "category" | "kyc" | "login";
  initialCategory?: MerchantCategory;
  initialStoreName?: string;
  initialOwnerName?: string;
  initialPhone?: string;
  initialBusinessId?: string;
  initialSubScreen?: string | null;
  initialTab?: PrimaryTab;
  initialLandingVariant?: "A" | "B" | "C" | string;
  activeVariant?: string;
  forceStandalone?: boolean; // When true, forces full viewport (for APK)
}

export default function MerchantNativeAppShell({
  initialAuth = true,
  initialAuthStep = "pitch",
  initialCategory = "kirana",
  initialStoreName = "My Store",
  initialOwnerName = "Merchant Partner",
  initialPhone = "",
  initialBusinessId = "",
  initialSubScreen = null,
  initialTab = "cockpit",
  initialLandingVariant = "opt1_bharatpe",
  activeVariant,
  forceStandalone = false,
}: MerchantNativeAppShellProps) {
  // Authentication & Profile State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuth);
  const [authStep, setAuthStep] = useState<"pitch" | "category" | "kyc" | "login">(initialAuthStep);
  const [businessId, setBusinessId] = useState<string>(initialBusinessId);
  const [storeCategory, setStoreCategory] = useState<MerchantCategory>(initialCategory);
  const [storeName, setStoreName] = useState<string>(initialStoreName);
  const [ownerName, setOwnerName] = useState<string>(initialOwnerName);
  const [merchantPhone, setMerchantPhone] = useState<string>(initialPhone);
  const [isStoreOnline, setIsStoreOnline] = useState<boolean>(true);
  const [unreadOrders, setUnreadOrders] = useState<number>(0);

  // Live Data State (Strictly isolated per merchant businessId)
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [liveCatalog, setLiveCatalog] = useState<any[]>([]);
  const [liveReviews, setLiveReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<{
    totalReviews?: number;
    averageRating?: number | null;
    totalScans?: number;
    positivePct?: number | null;
  }>({});
  const [todayGrossEarnings, setTodayGrossEarnings] = useState<number>(0);
  const [activeIncomingOrder, setActiveIncomingOrder] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [merchantConfig, setMerchantConfig] = useState<any>(null);

  // Navigation State with Back Stack History
  const [activeTab, setActiveTab] = useState<PrimaryTab>(initialTab);
  const [tabHistory, setTabHistory] = useState<PrimaryTab[]>([initialTab]);
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(initialSubScreen);

  // Ref for fresh identity inside polling intervals & native back listeners
  const identityRef = useRef({ businessId: initialBusinessId, phone: initialPhone });
  useEffect(() => {
    identityRef.current = { businessId, phone: merchantPhone };
  }, [businessId, merchantPhone]);

  // Laptop Simulator View State
  const [isSimulatorFrame, setIsSimulatorFrame] = useState<boolean>(!forceStandalone);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  const dismissedSirenOrderIdsRef = useRef<Set<string>>(new Set());
  const activeIncomingOrderRef = useRef<any>(null);
  const activeSubScreenRef = useRef<string | null>(initialSubScreen);

  useEffect(() => {
    activeIncomingOrderRef.current = activeIncomingOrder;
  }, [activeIncomingOrder]);

  useEffect(() => {
    activeSubScreenRef.current = activeSubScreen;
  }, [activeSubScreen]);

  const acknowledgeSirenOrder = (orderId?: string | null) => {
    TrustitNative.stopOrderSiren();
    setIsSirenActive(false);
    if (orderId) {
      dismissedSirenOrderIdsRef.current.add(orderId);
    }
  };

  // Notification helper
  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Tab navigation helpers with real back history stack (e.g. Items -> Standee -> Back returns to Items)
  const navigateToTab = (nextTab: PrimaryTab) => {
    setActiveSubScreen(null);
    if (nextTab === activeTab) return;
    setActiveTab(nextTab);
    setTabHistory((prev) => {
      const next = [...prev, nextTab];
      return next.length > 20 ? next.slice(-20) : next;
    });
  };

  const navigateTabBack = (): boolean => {
    if (tabHistory.length > 1) {
      const nextHistory = tabHistory.slice(0, -1);
      const prevTab = nextHistory[nextHistory.length - 1];
      setTabHistory(nextHistory);
      setActiveTab(prevTab);
      return true;
    }
    if (activeTab !== "cockpit") {
      setTabHistory(["cockpit"]);
      setActiveTab("cockpit");
      return true;
    }
    return false;
  };

  // Shared helper for authenticated multi-tenant POST operations
  const postMerchantOp = async (action: string, payload: Record<string, any> = {}) => {
    const activeBiz = identityRef.current.businessId || businessId;
    return TrustitNative.nativeFetch("/api/merchant/app-operations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        businessId: activeBiz,
        ...payload,
      }),
    });
  };

  // Fetch Dashboard & Live Orders strictly for the active merchant from Supabase
  const fetchDashboard = async (overrideBizId?: string, overridePhone?: string) => {
    const activeBiz = overrideBizId ?? identityRef.current.businessId;
    const activePhone = overridePhone ?? identityRef.current.phone;

    // Fallback: inspect localStorage if React state hasn't received ID yet
    let resolvedBiz = activeBiz;
    let resolvedPhone = activePhone;
    if ((!resolvedBiz || !resolvedPhone) && typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("trustit_merchant_session") || "null");
        if (stored) {
          if (!resolvedBiz && stored.businessId) resolvedBiz = stored.businessId;
          if (!resolvedPhone && stored.phone) resolvedPhone = stored.phone;
        }
      } catch {}
    }

    if (!resolvedBiz && !resolvedPhone) return;

    try {
      const qs = new URLSearchParams();
      if (resolvedBiz) qs.set("businessId", resolvedBiz);
      if (resolvedPhone) qs.set("phone", resolvedPhone);

      const res = await TrustitNative.nativeFetch(`/api/merchant/app-operations?${qs.toString()}`, {
        method: "GET",
      });
      const data = await res.json();
        if (res.status === 401 || res.status === 403) {
          setIsAuthenticated(false);
          setAuthStep("login");
          return;
        }
        if (data.success) {
          if (data.business?.id && !resolvedBiz) {
            setBusinessId(data.business.id);
          }
        if (data.config) {
          setMerchantConfig(data.config);
          if (data.config.ownerName && ownerName === "Merchant Partner") setOwnerName(data.config.ownerName);
          if (data.config.phone && !merchantPhone) setMerchantPhone(data.config.phone);
          if (data.config.businessCategory) {
            const rawCat = (data.config.businessCategory || "").toLowerCase();
            if (rawCat.includes("kirana") || rawCat.includes("groc")) setStoreCategory("kirana");
            else if (rawCat.includes("chem") || rawCat.includes("pharm") || rawCat.includes("med")) setStoreCategory("chemist");
            else if (rawCat.includes("salon") || rawCat.includes("spa") || rawCat.includes("beauty")) setStoreCategory("salon");
            else if (rawCat.includes("car") || rawCat.includes("auto") || rawCat.includes("wash")) setStoreCategory("carwash");
            else setStoreCategory("restaurant");
          }
        }
        if (data.business?.name && (storeName === "My Store" || initialStoreName === "My Store")) setStoreName(data.business.name);
        if (data.business?.owner && ownerName === "Merchant Partner") setOwnerName(data.business.owner);
        if (data.business?.phone && !merchantPhone) setMerchantPhone(data.business.phone);
        if (data.business?.type) {
          const rawType = (data.business.type || "").toLowerCase();
          if (rawType.includes("kirana") || rawType.includes("groc")) setStoreCategory("kirana");
          else if (rawType.includes("chem") || rawType.includes("pharm") || rawType.includes("med")) setStoreCategory("chemist");
          else if (rawType.includes("salon") || rawType.includes("spa") || rawType.includes("beauty")) setStoreCategory("salon");
          else if (rawType.includes("car") || rawType.includes("auto") || rawType.includes("wash")) setStoreCategory("carwash");
        }
        if (data.business?.is_outlet_open !== undefined) {
          setIsStoreOnline(
            Boolean(data.business.is_outlet_open) &&
              data.business.is_taking_orders !== false &&
              data.business.allow_taking_orders !== false,
          );
        }
        const ordersList: any[] = Array.isArray(data.orders) ? data.orders : [];
        setLiveOrders(ordersList);
        setLiveCatalog(data.catalog || []);
        setLiveReviews(data.reviews || []);
        if (data.stats) {
          setTodayGrossEarnings(Number(data.stats.todayEarnings || 0));
          setUnreadOrders(Number(data.stats.pendingCount || 0));
          setReviewStats({
            totalReviews: Number(data.stats.totalReviews || 0),
            averageRating: data.stats.averageRating ?? null,
            totalScans: Number(data.stats.totalScans || 0),
            positivePct: data.stats.positivePct ?? null,
          });
        }

        // Auto-open incoming order siren ONLY once per newly detected 'placed' order ID
        const nextPendingOrder = ordersList.find(
          (o) => o?.status === "placed" && o?.id && !dismissedSirenOrderIdsRef.current.has(o.id)
        );
        if (nextPendingOrder) {
          if (activeIncomingOrderRef.current?.id !== nextPendingOrder.id) {
            setActiveIncomingOrder(nextPendingOrder);
          }
          if (activeSubScreenRef.current !== "s02") {
            setActiveSubScreen("s02");
          }
        } else if (
          activeIncomingOrderRef.current &&
          !ordersList.some(
            (o) => o?.id === activeIncomingOrderRef.current.id && o?.status === "placed"
          )
        ) {
          setActiveIncomingOrder(null);
          if (activeSubScreenRef.current === "s02") {
            TrustitNative.stopOrderSiren();
            setActiveSubScreen(null);
          }
        }
      }
    } catch {}
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchDashboard();
    }
    const timer = setInterval(() => {
      if (isAuthenticated) fetchDashboard();
    }, 10000);

    // Silent Background OTA Live Update Check (Swiggy/Zomato pattern)
    TrustitNative.checkAndApplyOta({
      app: "partner",
      currentVersion: "3.6.0",
    }).catch(() => {});

    return () => clearInterval(timer);
  }, [isAuthenticated, businessId, merchantPhone]);

  // Android Hardware Back Button Navigator (Respects real tab & subscreen history)
  useEffect(() => {
    let lastBackPress = 0;
    const handleRootBack = () => {
      // 1. If incoming order modal or selected order drawer is open
      if (selectedOrder) {
        setSelectedOrder(null);
        return true;
      }
      if (activeIncomingOrder) {
        acknowledgeSirenOrder(activeIncomingOrder.id);
        setActiveIncomingOrder(null);
        if (activeSubScreen === "s02") {
          setActiveSubScreen(null);
        }
        return true;
      }
      // 2. If inside a sub-screen
      if (activeSubScreen) {
        if (activeSubScreen === "s02") {
          const pendingId = activeIncomingOrder?.id || liveOrders.find((o) => o.status === "placed")?.id;
          acknowledgeSirenOrder(pendingId);
        }
        setActiveSubScreen(null);
        return true;
      }
      // 3. If in unauthenticated flow
      if (!isAuthenticated) {
        if (authStep === "kyc" || authStep === "login" || authStep === "category") {
          setAuthStep("pitch");
          return true;
        }
      } else {
        // 4. Navigate back through real tab history stack first
        if (navigateTabBack()) {
          return true;
        }
        // 5. If at cockpit root, double press back to exit
        const now = Date.now();
        if (now - lastBackPress < 2500) {
          return false; // Let Android exit cleanly
        }
        lastBackPress = now;
        showToast("Press back again to exit");
        return true;
      }
      return false;
    };

    (window as any).__handleTrustitBack = handleRootBack;
    return () => {
      delete (window as any).__handleTrustitBack;
    };
  }, [selectedOrder, activeIncomingOrder, activeSubScreen, isAuthenticated, authStep, activeTab, tabHistory]);

  // 1. Toggle Store Online / Offline Status
  const toggleStoreStatus = async () => {
    const next = !isStoreOnline;
    setIsStoreOnline(next);
    try {
      const res = await postMerchantOp("toggle_outlet", { data: { isOpen: next } });
      const d = await res.json().catch(() => null);
      if (!res.ok || !d?.success) {
        setIsStoreOnline(!next);
        showToast(`⚠️ ${d?.message || "Could not update outlet status."}`);
        return;
      }
      showToast(next ? "🟢 Orders Active" : "🔴 Orders Paused");
    } catch {
      setIsStoreOnline(!next);
      showToast("⚠️ Network error updating outlet status.");
    }
  };

  // 2. Incoming Siren Alert & Real Simulation Order Trigger
  const triggerTestSiren = async () => {
    setIsSirenActive(true);
    showToast("🚨 Incoming Order Siren Alert Triggered!");
    try {
      const res = await postMerchantOp("create_sample_order", {
        data: {
          customerName: "Aman Sharma",
          customerPhone: "9118643415",
          customerAddress: "Civil Lines near Gandhi Park, Bahraich",
          items: [
            { name: storeCategory === "kirana" ? "Sharbati Chakki Atta (5kg)" : "Special Shahi Paneer", quantity: 1, price: 240 },
            { name: storeCategory === "kirana" ? "Madhur Sugar (2kg)" : "Butter Naan (2 pcs)", quantity: 2, price: 90 },
          ],
        },
      });
      const data = await res.json();
      if (data.success && data.order) {
        setActiveIncomingOrder(data.order);
        setSelectedOrder(data.order);
        setUnreadOrders((prev) => prev + 1);
        fetchDashboard();
      }
    } catch {}
    setActiveSubScreen("s02");
  };

  // 3. Accept Incoming Order
  const handleAcceptOrder = async (prepMins = 20) => {
    const targetOrder = activeIncomingOrder || liveOrders.find((o) => o.status === "placed") || null;
    const orderId = targetOrder?.id || "";
    acknowledgeSirenOrder(orderId);
    setActiveIncomingOrder(null);
    showToast(`Order Accepted! Prep Time: ${prepMins} mins`);
    try {
      if (orderId) {
        await postMerchantOp("order_accept", { orderId, data: { prepTimeMinutes: prepMins } });
        fetchDashboard();
      }
    } catch {}
    navigateToTab("orders");
  };

  // 4. Reject Incoming Order
  const handleRejectOrder = async (reason = "Out of stock") => {
    const targetOrder = activeIncomingOrder || liveOrders.find((o) => o.status === "placed") || null;
    const orderId = targetOrder?.id || "";
    acknowledgeSirenOrder(orderId);
    setActiveIncomingOrder(null);
    showToast("Order Declined.");
    try {
      if (orderId) {
        await postMerchantOp("order_reject", { orderId, data: { reason } });
        fetchDashboard();
      }
    } catch {}
    setActiveSubScreen(null);
  };

  // 5. Add Product Handler
  const handleAddProduct = async (productData: any) => {
    showToast(`"${productData.name}" added to your store catalog!`);
    try {
      await postMerchantOp("add_product", { data: productData });
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 6. Toggle Stock Handler
  const handleToggleItemStock = async (itemId: string | number, isAvailable: boolean) => {
    showToast(isAvailable ? "Item marked In Stock" : "Item marked Out of Stock");
    try {
      await postMerchantOp("toggle_item_stock", { itemId, data: { isAvailable } });
      fetchDashboard();
    } catch {}
  };

  // 6b. Delete Product Handler
  const handleDeleteProduct = async (itemId: string | number) => {
    showToast("Removing item from catalog...");
    try {
      await postMerchantOp("delete_product", { itemId });
      showToast("✓ Item deleted from catalog!");
      fetchDashboard();
    } catch {}
  };

  // 7. Save Store Profile
  const handleSaveProfile = async (profileData: any) => {
    showToast("Saving store profile...");
    try {
      const res = await postMerchantOp("update_profile", { data: profileData });
      const d = await res.json();
      if (d.success) {
        if (profileData.storeName) setStoreName(profileData.storeName);
        showToast("✓ Store Profile Saved!");
        fetchDashboard();
      }
    } catch {}
    setActiveSubScreen(null);
  };

  // 8. Save GPS Location & Radius
  const handleSaveLocation = async (locData: any) => {
    showToast(`Updating Geofence (${locData.radius} KM)...`);
    try {
      await postMerchantOp("update_location", {
        data: {
          latitude: locData.lat,
          longitude: locData.lng,
          deliveryRadiusKm: locData.radius,
          address: locData.address,
        },
      });
      showToast("✓ GPS Location & Radius Saved!");
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 9. Save Operating Hours
  const handleSaveOperatingHours = async (hoursData: any) => {
    showToast(hoursData?.autoSave ? "✓ Shift updated in real-time!" : "Saving operating hours...");
    try {
      await postMerchantOp("update_operating_hours", { data: hoursData });
      if (!hoursData?.autoSave) {
        showToast("✓ Operating Hours Saved!");
      }
      fetchDashboard();
    } catch {}
    if (!hoursData?.autoSave) {
      setActiveSubScreen(null);
    }
  };

  // 10. Save Google Review Gating
  const handleSaveGating = async (gatingData: any) => {
    showToast("Saving review gating link...");
    try {
      await postMerchantOp("update_review_gating", {
        data: {
          googlePlaceId: gatingData.googlePlaceId,
          reviewShortLink: gatingData.reviewLink,
          smartGatingMinStars: gatingData.minStars,
        },
      });
      showToast("✓ Google Review Gating Saved!");
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 11. Mark Order Food Ready
  const handleOrderReady = async (orderId: string) => {
    showToast(`Order #${orderId.slice(-6)} marked ready!`);
    try {
      await postMerchantOp("order_ready", { orderId });
      fetchDashboard();
    } catch {}
  };

  // 12. Assign Rider
  const handleRiderAssigned = async (orderId: string, riderName: string) => {
    showToast(`Rider ${riderName} assigned to #${orderId.slice(-6)}!`);
    try {
      await postMerchantOp("order_dispatch", { orderId, data: { riderName } });
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 13. Verify Handover OTP & Deliver
  const handleVerifyDeliver = async (orderId: string, otp: string) => {
    try {
      const res = await postMerchantOp("order_deliver", { orderId, data: { otp } });
      const d = await res.json();
      if (d.success) {
        showToast(`✓ Order #${orderId.slice(-6)} delivered!`);
        fetchDashboard();
      } else {
        showToast(`⚠️ ${d.message}`);
      }
    } catch {}
  };

  // 14. Cashfree Wallet Recharge (Supports Native Drop SDK + Cashfree Dynamic QR)
  const handleInitiateCashfree = async (amount: number, credits: number) => {
    try {
      const res = await postMerchantOp("recharge_wallet", {
        data: { amount, credits, includeQr: true },
      });
      const d = await res.json();
      if (d.success) {
        if (d.paymentSessionId && typeof window !== "undefined") {
          const dropRes = await TrustitNative.startNativeDropCheckout({
            paymentSessionId: d.paymentSessionId,
            orderId: d.orderId,
            environment: d.checkoutMode === "sandbox" ? "SANDBOX" : "PRODUCTION",
          });
          if (dropRes.launched) {
            showToast(`✓ Cashfree checkout opened (${d.orderId?.slice(-6)})`);
          }
        }
        return d;
      }
      showToast(`⚠️ ${d.message || "Cashfree recharge failed."}`);
      return d;
    } catch {
      showToast("⚠️ Network error initializing Cashfree recharge.");
      return { success: false, message: "Network error" };
    }
  };

  // Title formatting helper
  const getSubScreenTitle = (screenKey: string): { title: string; tag: string } => {
    switch (screenKey) {
      case "s02":
        return { title: "Incoming Order Siren Alert", tag: "S02" };
      case "s03":
        return { title: "Urgent Kitchen Queue Drawer", tag: "S03" };
      case "s10":
        return { title: "Order Details & Prep Timer", tag: "S10" };
      case "s11":
        return { title: "KOT Kitchen Thermal Receipt", tag: "S11" };
      case "s12":
        return { title: "Rider Dispatch & Assignment", tag: "S12" };
      case "s14":
        return { title: "Add New Product / Dish", tag: "S14" };
      case "s15":
        return { title: "Instant Out-of-Stock Switcher", tag: "S15" };
      case "s16":
        return { title: "Category Master Presets", tag: "S16" };
      case "s17":
        return { title: "Official Vector QR Download", tag: "S17" };
      case "s18":
        return { title: "Standee Template Gallery", tag: "S18" };
      case "s20":
        return { title: "1-Click AI Review Reply", tag: "S20" };
      case "s21":
        return { title: "Acrylic Standee Merchandise", tag: "S21" };
      case "s22":
        return { title: "Custom Standee Mockup", tag: "S22" };
      case "s23":
        return { title: "Cart & Standee Checkout", tag: "S23" };
      case "s24":
        return { title: "Courier Waybill Tracking", tag: "S24" };
      case "s25":
        return { title: "Customer Occasions CRM", tag: "S25" };
      case "s26":
        return { title: "AI Festival Poster Creator", tag: "S26" };
      case "s27":
        return { title: "WhatsApp Greetings Composer", tag: "S27" };
      case "s28":
        return { title: "Connect Wallet Recharge", tag: "S28" };
      case "s29":
        return { title: "Scan Footfall Analytics", tag: "S29" };
      case "s30":
        return { title: "Hourly Rush Heatmap", tag: "S30" };
      case "s31":
        return { title: "Customer Sentiment Tags", tag: "S31" };
      case "s32":
        return { title: "Export Reports & Statements", tag: "S32" };
      case "s33":
        return { title: "Subscription Plan Cockpit", tag: "S33" };
      case "s34":
        return { title: "3-Tier Upgrade Matrix (₹29/₹49)", tag: "S34" };
      case "s35":
        return { title: "Subscription AutoPay Setup", tag: "S35" };
      case "s36":
        return { title: "GST Tax Invoices", tag: "S36" };
      case "s38":
        return { title: "Settlement Breakdown Modal", tag: "S38" };
      case "s39":
        return { title: "Bank KYC Penny Drop Verification", tag: "S39" };
      case "s40":
        return { title: "CA Payout Excel Downloader", tag: "S40" };
      case "s41":
        return { title: "2FA & Cashier PIN Security", tag: "S41" };
      case "s42":
        return { title: "Multi-Outlet Branch Switcher", tag: "S42" };
      case "s43":
        return { title: "Staff Roles & Permissions", tag: "S43" };
      case "s44":
        return { title: "Device Sessions & Audit Log", tag: "S44" };
      case "s45":
        return { title: "24x7 Operations Support Hub", tag: "S45" };
      case "s46":
        return { title: "Thermal Printer Wizard (USB/Bluetooth)", tag: "S46" };
      case "s47":
        return { title: "Dispute Tickets & Helpdesk", tag: "S47" };
      case "s48":
        return { title: "Offline Safe Mode Switch", tag: "S48" };
      case "s04":
        return { title: "Daily Pulse & Occasions", tag: "S04" };
      case "s05":
        return { title: "Store Brand Profile Settings", tag: "S05" };
      case "s06":
        return { title: "GPS Geofence Radar Boundary", tag: "S06" };
      case "s07":
        return { title: "Google Review Smart Gating", tag: "S07" };
      case "s08":
        return { title: "Store Operating Hours", tag: "S08" };
      // Kirana
      case "kirana_02":
        return { title: "Handwritten Parcha (List) Viewer", tag: "K02" };
      case "kirana_03":
        return { title: "Kirana Mandi Price Master Editor", tag: "K03" };
      case "kirana_04":
        return { title: "Kirana Counter QR Standee Mockup", tag: "K04" };
      // Chemist
      case "chemist_02":
        return { title: "Doctor Prescription Rx Inspector", tag: "M02" };
      case "chemist_03":
        return { title: "Chemist Medicine Inventory Catalog", tag: "M03" };
      case "chemist_04":
        return { title: "Pharmacy Glass Counter Standee", tag: "M04" };
      // Salon
      case "salon_02":
        return { title: "Live Salon Chair Token Queue", tag: "S_S02" };
      case "salon_03":
        return { title: "Salon Grooming Rate Card", tag: "S_S03" };
      case "salon_04":
        return { title: "Salon Mirror Decal & Standee", tag: "S_S04" };
      // Car Wash
      case "carwash_02":
        return { title: "Washing Bay Job Queue", tag: "C02" };
      case "carwash_03":
        return { title: "Vehicle Type Wash Packages", tag: "C03" };
      case "carwash_04":
        return { title: "Car Wash Lounge Table Standee", tag: "C04" };
      default:
        return { title: "Feature View", tag: "APP" };
    }
  };

  // ============================================================
  // RENDER SUB-SCREEN
  // ============================================================
  const renderActiveSubScreen = () => {
    if (!activeSubScreen) return null;

    const info = getSubScreenTitle(activeSubScreen);

    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* Sticky Sub-Header with Back Button */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3.5 py-2.5 flex items-center justify-between shadow-xs">
          <button
            type="button"
            onClick={() => {
              if (activeSubScreen === "s02") {
                const pendingId = activeIncomingOrder?.id || liveOrders.find((o) => o.status === "placed")?.id;
                acknowledgeSirenOrder(pendingId);
                setActiveIncomingOrder(null);
              }
              setActiveSubScreen(null);
            }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-black transition border border-slate-200 active:scale-95"
          >
            <span>←</span>
            <span>Back</span>
          </button>
          <div className="text-center truncate px-2">
            <span className="text-[10px] font-black uppercase text-blue-700 block tracking-wider">
              {info.tag}
            </span>
            <h3 className="text-xs font-black text-slate-900 truncate">{info.title}</h3>
          </div>
          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
            Active
          </span>
        </div>

        {/* Subscreen Content */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {activeSubScreen === "s02" && (() => {
            const currentSirenOrder =
              activeIncomingOrder || liveOrders.find((o) => o.status === "placed") || null;
            return (
              <Screen02IncomingOrderSiren
                order={currentSirenOrder}
                onAccept={handleAcceptOrder}
                onDecline={() => handleRejectOrder("Kitchen Rush")}
                onMute={() => acknowledgeSirenOrder(currentSirenOrder?.id)}
                onBack={() => {
                  acknowledgeSirenOrder(currentSirenOrder?.id);
                  setActiveIncomingOrder(null);
                  setActiveSubScreen(null);
                }}
              />
            );
          })()}
          {activeSubScreen === "s03" && (
            <Screen03UrgentQueueDrawer
              onAcceptOrder={() => handleAcceptOrder(20)}
              onOpenSiren={() => setActiveSubScreen("s02")}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s10" && (
            <Screen10OrderDetailDrawer
              order={selectedOrder || liveOrders[0]}
              onBack={() => setActiveSubScreen(null)}
              onPrintKot={(ord) => {
                setSelectedOrder(ord || selectedOrder || liveOrders[0]);
                handleOrderReady(ord?.id || selectedOrder?.id || liveOrders[0]?.id);
                setActiveSubScreen("s11");
              }}
              onDispatchRider={(ord) => {
                setSelectedOrder(ord || selectedOrder || liveOrders[0]);
                setActiveSubScreen("s12");
              }}
              onMarkReady={handleOrderReady}
              onVerifyDeliver={handleVerifyDeliver}
            />
          )}
          {activeSubScreen === "s11" && (
            <Screen11KotThermalReceipt
              order={selectedOrder || liveOrders[0]}
              storeName={storeName}
              initialPaperSize={merchantConfig?.printerSettings?.paperSize || "80mm"}
              onBack={() => setActiveSubScreen(null)}
              onPrintDone={() => {
                showToast("Thermal KOT Print command dispatched!");
                setActiveSubScreen(null);
              }}
            />
          )}
          {activeSubScreen === "s12" && (
            <Screen12RiderDispatchModal
              order={selectedOrder || liveOrders[0]}
              onBack={() => setActiveSubScreen(null)}
              onRiderAssigned={handleRiderAssigned}
            />
          )}
          {activeSubScreen === "s14" && (
            <Screen14AddProductModal
              onBack={() => setActiveSubScreen(null)}
              onSaveProduct={handleAddProduct}
            />
          )}
          {activeSubScreen === "s15" && (
            <Screen15OutOfStockSwitcher
              catalogItems={liveCatalog}
              onToggleItem={handleToggleItemStock}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s16" && (
            <Screen16CategoryMasterPreset onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s17" && (
            <Screen17VectorQrDownload onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s18" && (
            <Screen18StandeeTemplateGallery
              onBack={() => setActiveSubScreen(null)}
              onSelectTemplate={() => setActiveSubScreen("s21")}
            />
          )}
          {activeSubScreen === "s20" && (
            <Screen20ReviewReplyModal
              onBack={() => setActiveSubScreen(null)}
              onSendReply={() => {
                showToast("Google Review Reply published via API!");
                setActiveSubScreen(null);
              }}
            />
          )}
          {activeSubScreen === "s21" && (
            <Screen21MerchandiseCatalog
              onBack={() => setActiveSubScreen(null)}
              onCustomizeProduct={() => setActiveSubScreen("s22")}
            />
          )}
          {activeSubScreen === "s22" && (
            <Screen22MockupCustomizer
              onBack={() => setActiveSubScreen("s21")}
              onAddToCart={() => setActiveSubScreen("s23")}
            />
          )}
          {activeSubScreen === "s23" && (
            <Screen23CartCheckout
              onBack={() => setActiveSubScreen("s22")}
              onPaySuccess={() => setActiveSubScreen("s24")}
            />
          )}
          {activeSubScreen === "s24" && (
            <Screen24OrderTrackingWaybill
              storeName={storeName}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s25" && (
            <Screen25OccasionsCrmBoard onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s26" && (
            <Screen26AiPosterCreator onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s27" && (
            <Screen27WhatsAppComposer onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s28" && (
            <Screen28ConnectWalletRecharge
              onBack={() => setActiveSubScreen(null)}
              onRechargeSuccess={() => {
                showToast("✓ Wallet recharged successfully!");
                setActiveSubScreen(null);
              }}
              onInitiateCashfree={handleInitiateCashfree}
            />
          )}
          {activeSubScreen === "s29" && (
            <Screen29ScanFootfallTrends onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s30" && (
            <Screen30HourlyRushHeatmap onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s31" && (
            <Screen31CustomerSentimentTags onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s32" && (
            <Screen32ReportsDataExporter onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s33" && (
            <Screen33PlanStatusCockpit
              onBack={() => setActiveSubScreen(null)}
              onUpgrade={() => setActiveSubScreen("s34")}
            />
          )}
          {activeSubScreen === "s34" && (
            <Screen34ThreeTierMatrix
              onBack={() => setActiveSubScreen(null)}
              onSelectTier={() => setActiveSubScreen("s35")}
            />
          )}
          {activeSubScreen === "s35" && (
            <Screen35SubscriptionAutoPay onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s36" && (
            <Screen36GstTaxInvoices
              storeName={storeName}
              city={merchantConfig?.city || ""}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s38" && (
            <Screen38SettlementBreakdownModal
              storeName={storeName}
              grossSales={todayGrossEarnings}
              ordersCount={liveOrders.filter((o) => o.status === "delivered" || o.status === "completed").length}
              bankAccountMask={merchantConfig?.bankAccount?.accountNumberMask || ""}
              ifscCode={merchantConfig?.bankAccount?.ifsc || ""}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s39" && (
            <Screen39BankKycPennyDrop
              initialAccountNo={merchantConfig?.bankAccount?.accountNumberMask || ""}
              initialIfsc={merchantConfig?.bankAccount?.ifsc || ""}
              initialBeneficiary={merchantConfig?.bankAccount?.holderName || ownerName || ""}
              isInitiallyVerified={Boolean(merchantConfig?.bankAccount?.isVerified)}
              onBack={() => setActiveSubScreen(null)}
              onVerifySuccess={() => {
                showToast("₹1 Penny Drop verification successful! Bank account linked.");
                fetchDashboard();
                setActiveSubScreen(null);
              }}
            />
          )}
          {activeSubScreen === "s40" && (
            <Screen40PayoutExcelDownloader
              orders={liveOrders}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s41" && (
            <Screen41SecurityTwoFactor
              initialTwoFactor={merchantConfig?.twoFactorEnabled !== false}
              initialLoginAlerts={merchantConfig?.loginAlerts !== false}
              onBack={() => setActiveSubScreen(null)}
              onSave={() => {
                showToast("✓ Security Settings Saved!");
                fetchDashboard();
                setActiveSubScreen(null);
              }}
            />
          )}
          {activeSubScreen === "s42" && (
            <Screen42MultiOutletSwitcher
              initialBranches={merchantConfig?.branches}
              onSelectOutlet={(name) => {
                setStoreName(name);
                showToast(`✓ Switched outlet to ${name}!`);
                fetchDashboard();
              }}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s43" && (
            <Screen43StaffRolesMatrix
              ownerName={ownerName}
              phone={merchantPhone}
              initialStaffList={merchantConfig?.staffList}
              onBack={() => setActiveSubScreen(null)}
              onInviteStaff={() => fetchDashboard()}
            />
          )}
          {activeSubScreen === "s44" && (
            <Screen44AuditSessionsLog onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s45" && (
            <Screen45OperationsSupportHub
              onBack={() => setActiveSubScreen(null)}
              onOpenPrinterWizard={() => setActiveSubScreen("s46")}
              onOpenTicket={() => setActiveSubScreen("s47")}
            />
          )}
          {activeSubScreen === "s46" && (
            <Screen46ThermalPrinterWizard onBack={() => setActiveSubScreen("s45")} />
          )}
          {activeSubScreen === "s47" && (
            <Screen47TicketDeskDisputes onBack={() => setActiveSubScreen("s45")} />
          )}
          {activeSubScreen === "s48" && (
            <Screen48OfflineSafeMode onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s04" && (
            <Screen04OccasionDailyPulse onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s05" && (
            <Screen05StoreBrandProfile
              initialStoreName={storeName}
              initialOwnerName={ownerName || merchantConfig?.ownerName || "Merchant Partner"}
              initialBusinessType={storeCategory}
              initialPhone={merchantPhone || merchantConfig?.phone || ""}
              initialLogoUrl={merchantConfig?.logoUrl}
              onSaveProfile={handleSaveProfile}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s06" && (
            <Screen06GpsGeofence
              initialRadius={merchantConfig?.deliveryRadiusKm || 5.0}
              initialLat={merchantConfig?.latitude ? String(merchantConfig.latitude) : "27.5744"}
              initialLng={merchantConfig?.longitude ? String(merchantConfig.longitude) : "81.5977"}
              initialAddress={merchantConfig?.address || ""}
              onSaveLocation={handleSaveLocation}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s07" && (
            <Screen07GoogleReviewGating
              initialPlaceId={merchantConfig?.googlePlaceId || ""}
              initialReviewLink={merchantConfig?.reviewShortLink || `https://trustitreview.com/r/${businessId || "store"}`}
              initialMinStars={merchantConfig?.smartGatingMinStars || 4}
              onSaveGating={handleSaveGating}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s08" && (
            <Screen08OperatingHours
              initialOpening={merchantConfig?.openingTime || "08:00 AM"}
              initialClosing={merchantConfig?.closingTime || "10:30 PM"}
              initialFestival={merchantConfig?.isFestivalMode || false}
              initialLunchPause={merchantConfig?.isLunchPause || false}
              onSaveOperatingHours={handleSaveOperatingHours}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {/* Kirana sub-screens */}
          {activeSubScreen === "kirana_02" && (
            <ScreenK02ParchaOrderViewer
              onBack={() => setActiveSubScreen(null)}
              onConfirmBill={() => {
                showToast("Parcha bill sent to customer WhatsApp!");
                setActiveSubScreen(null);
              }}
            />
          )}
          {activeSubScreen === "kirana_03" && (
            <Screen13MenuExplorer
              liveCatalog={liveCatalog}
              onBack={() => setActiveSubScreen(null)}
              onAddProduct={() => setActiveSubScreen("s14")}
              onStockToggle={() => setActiveSubScreen("s15")}
              onToggleItemStock={handleToggleItemStock}
              onDeleteItem={handleDeleteProduct}
            />
          )}
          {activeSubScreen === "kirana_04" && (
            <ScreenK04KiranaReviewStandee
              storeName={storeName}
              ownerName={ownerName}
              phone={merchantPhone}
              onBack={() => setActiveSubScreen(null)}
              onDownloadStandee={() => showToast("Kirana Counter Standee PDF Ready!")}
            />
          )}
          {/* Chemist sub-screens */}
          {activeSubScreen === "chemist_02" && (
            <ScreenM02PrescriptionRxViewer
              onBack={() => setActiveSubScreen(null)}
              onApproveRx={() => {
                showToast("Prescription medicines verified & packed!");
                setActiveSubScreen(null);
              }}
            />
          )}
          {activeSubScreen === "chemist_03" && (
            <ScreenM03ChemistMedicineCatalog onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "chemist_04" && (
            <ScreenM04ChemistReviewStandee
              storeName={storeName}
              ownerName={ownerName}
              phone={merchantPhone}
              onBack={() => setActiveSubScreen(null)}
              onDownloadStandee={() => showToast("Pharmacy Glass Standee PDF Ready!")}
            />
          )}
          {/* Salon sub-screens */}
          {activeSubScreen === "salon_02" && (
            <ScreenS02LiveChairTokenQueue
              onBack={() => setActiveSubScreen(null)}
              onCallNext={() => {
                showToast("Token #14 called for Haircut!");
              }}
            />
          )}
          {activeSubScreen === "salon_03" && (
            <ScreenS03SalonServicesRateCard
              onBack={() => setActiveSubScreen(null)}
              onAddService={() => setActiveSubScreen("s14")}
            />
          )}
          {activeSubScreen === "salon_04" && (
            <ScreenS04SalonMirrorReviewStandee
              storeName={storeName}
              ownerName={ownerName}
              phone={merchantPhone}
              onBack={() => setActiveSubScreen(null)}
              onDownloadStandee={() => showToast("Salon Mirror Decal PDF Ready!")}
            />
          )}
          {/* Car wash sub-screens */}
          {activeSubScreen === "carwash_02" && (
            <ScreenC02WashingBayQueue
              onBack={() => setActiveSubScreen(null)}
              onCompleteWash={() => {
                showToast("Bay 1 vehicle wash inspection passed!");
                setActiveSubScreen(null);
              }}
            />
          )}
          {activeSubScreen === "carwash_03" && (
            <ScreenC03VehicleTypePackages
              onBack={() => setActiveSubScreen(null)}
              onAddPackage={() => setActiveSubScreen("s14")}
            />
          )}
          {activeSubScreen === "carwash_04" && (
            <ScreenC04CarWashReviewStandee
              storeName={storeName}
              ownerName={ownerName}
              phone={merchantPhone}
              onBack={() => setActiveSubScreen(null)}
              onDownloadStandee={() => showToast("Car Wash Lounge Standee PDF Ready!")}
            />
          )}
        </div>
      </div>
    );
  };

  // ============================================================
  // RENDER PRIMARY TABS (WHEN NO SUB-SCREEN IS OPEN)
  // ============================================================

  // Tab 1: Industry-Specific Cockpit
  const renderCockpitTab = () => {
    const activeOwner = ownerName || merchantConfig?.ownerName || (storeName ? storeName.split(" ")[0] : "Merchant Partner");
    const activePhone = merchantPhone || merchantConfig?.phone || "";

    switch (storeCategory) {
      case "kirana":
        return (
          <ScreenK01KiranaCockpit
            storeName={storeName}
            ownerName={activeOwner}
            phone={activePhone}
            isStoreOnline={isStoreOnline}
            onToggleStoreOnline={toggleStoreStatus}
            liveOrdersCount={unreadOrders}
            catalogCount={liveCatalog.length}
            todayEarnings={todayGrossEarnings}
            reviewStats={reviewStats}
            onOpenParcha={() => setActiveSubScreen("kirana_02")}
            onOpenRates={() => navigateToTab("menu")}
            onOpenStandee={() => setActiveSubScreen("kirana_04")}
          />
        );
      case "chemist":
        return (
          <ScreenM01ChemistCockpit
            storeName={storeName}
            ownerName={activeOwner}
            phone={activePhone}
            isStoreOnline={isStoreOnline}
            onToggleStoreOnline={toggleStoreStatus}
            onOpenRx={() => setActiveSubScreen("chemist_02")}
            onOpenMedicines={() => setActiveSubScreen("chemist_03")}
            onOpenStandee={() => setActiveSubScreen("chemist_04")}
          />
        );
      case "salon":
        return (
          <ScreenS01SalonCockpit
            storeName={storeName}
            ownerName={activeOwner}
            phone={activePhone}
            isStoreOnline={isStoreOnline}
            onToggleStoreOnline={toggleStoreStatus}
            liveOrdersCount={unreadOrders}
            catalogCount={liveCatalog.length}
            todayEarnings={todayGrossEarnings}
            onOpenQueue={() => setActiveSubScreen("salon_02")}
            onOpenServices={() => setActiveSubScreen("salon_03")}
            onOpenStandee={() => setActiveSubScreen("salon_04")}
          />
        );
      case "carwash":
        return (
          <ScreenC01CarWashCockpit
            storeName={storeName}
            ownerName={activeOwner}
            phone={activePhone}
            isStoreOnline={isStoreOnline}
            onToggleStoreOnline={toggleStoreStatus}
            liveOrdersCount={unreadOrders}
            catalogCount={liveCatalog.length}
            todayEarnings={todayGrossEarnings}
            onOpenBays={() => setActiveSubScreen("carwash_02")}
            onOpenPackages={() => setActiveSubScreen("carwash_03")}
            onOpenStandee={() => setActiveSubScreen("carwash_04")}
          />
        );
      case "restaurant":
      default:
        return (
          <Screen01MainCockpit
            storeName={storeName}
            ownerName={activeOwner}
            phone={activePhone}
            isStoreOnline={isStoreOnline}
            onToggleStoreOnline={toggleStoreStatus}
            liveOrdersCount={unreadOrders}
            preparingCount={
              liveOrders.filter(
                (o) => o.status === "accepted_by_merchant" || o.status === "accepted" || o.status === "preparing",
              ).length
            }
            outCount={
              liveOrders.filter(
                (o) =>
                  o.status === "rider_assigned" ||
                  o.status === "picked_up" ||
                  o.status === "out_for_delivery",
              ).length
            }
            catalogCount={liveCatalog.length}
            todayEarnings={todayGrossEarnings}
            reviewStats={reviewStats}
            onOpenOrders={() => navigateToTab("orders")}
            onOpenMenu={() => navigateToTab("menu")}
            onOpenSiren={() => {
              const firstPending = liveOrders.find((o) => o.status === "placed");
              if (firstPending) {
                setActiveIncomingOrder(firstPending);
                setActiveSubScreen("s02");
              } else {
                navigateToTab("orders");
              }
            }}
            onOpenOccasion={() => setActiveSubScreen("s04")}
          />
        );
    }
  };

  // Tab 2: Live Store Orders Master Board (Clean, no extra top bar)
  const renderOrdersTab = () => {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Screen09OrdersMasterBoard
            liveOrders={liveOrders}
            onBack={() => navigateTabBack()}
            onInspectOrder={(orderId) => {
              const ord = liveOrders.find((o) => o.id === orderId);
              setSelectedOrder(ord || liveOrders[0]);
              setActiveSubScreen("s10");
            }}
            onPrintKot={(orderId) => {
              const ord = liveOrders.find((o) => o.id === orderId);
              setSelectedOrder(ord || liveOrders[0]);
              if (orderId) handleOrderReady(orderId);
              setActiveSubScreen("s11");
            }}
            onDispatchRider={(orderId) => {
              const ord = liveOrders.find((o) => o.id === orderId);
              setSelectedOrder(ord || liveOrders[0]);
              setActiveSubScreen("s12");
            }}
          />
        </div>
      </div>
    );
  };

  // Tab 3: Store Rates & Items Catalog
  const renderMenuTab = () => {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {storeCategory === "chemist" ? (
            <ScreenM03ChemistMedicineCatalog onBack={() => navigateTabBack()} />
          ) : storeCategory === "salon" ? (
            <ScreenS03SalonServicesRateCard
              onBack={() => navigateTabBack()}
              onAddService={() => setActiveSubScreen("s14")}
            />
          ) : storeCategory === "carwash" ? (
            <ScreenC03VehicleTypePackages
              onBack={() => navigateTabBack()}
              onAddPackage={() => setActiveSubScreen("s14")}
            />
          ) : (
            <Screen13MenuExplorer
              liveCatalog={liveCatalog}
              onBack={() => navigateTabBack()}
              onAddProduct={() => setActiveSubScreen("s14")}
              onStockToggle={() => setActiveSubScreen("s15")}
              onToggleItemStock={handleToggleItemStock}
              onDeleteItem={handleDeleteProduct}
            />
          )}
        </div>
      </div>
    );
  };

  // Tab 4: QR Standee & Verified Reviews (Compact Non-Scrolling 3x2 Button Grid)
  const renderStandeeTab = () => {
    const standeeTools: Array<{
      id: string;
      icon: string;
      label: string;
      cls: string;
    }> = [
      { id: "s17", icon: "📥", label: "Download QR", cls: "bg-blue-600 text-white border-blue-700" },
      { id: "s18", icon: "🖼️", label: "Gallery", cls: "bg-slate-900 text-white border-slate-900" },
      { id: "s26", icon: "🎨", label: "AI Poster", cls: "bg-purple-50 text-purple-900 border-purple-200" },
      { id: "s27", icon: "💬", label: "Wishes", cls: "bg-emerald-50 text-emerald-900 border-emerald-200" },
      { id: "s21", icon: "🎁", label: "Order Standee", cls: "bg-amber-50 text-amber-900 border-amber-200" },
      { id: "s25", icon: "🎂", label: "Occasions", cls: "bg-pink-50 text-pink-900 border-pink-200" },
    ];

    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* Compact 3x2 Non-Scrolling Tool Grid */}
        <div className="bg-white border-b border-slate-200 p-2 grid grid-cols-3 gap-1.5 shrink-0">
          {standeeTools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => setActiveSubScreen(tool.id)}
              className={`px-2 py-1.5 rounded-xl border text-[10px] font-black flex items-center justify-center gap-1 shadow-2xs active:scale-95 transition truncate ${tool.cls}`}
            >
              <span className="text-xs leading-none shrink-0">{tool.icon}</span>
              <span className="truncate">{tool.label}</span>
            </button>
          ))}
        </div>

        {/* Customer Reviews Live Feed */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Screen19CustomerReviewsFeed
            reviews={liveReviews}
            reviewStats={reviewStats}
            onBack={() => navigateTabBack()}
            onOpenStandeeQr={() => setActiveSubScreen(storeCategory === "kirana" ? "kirana_04" : "s17")}
            onOpenReply={() => setActiveSubScreen("s20")}
          />
        </div>
      </div>
    );
  };

  // Tab 5: Dukaan More & Financials Hub
  const renderMoreTab = () => {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* Settlement & Daily Ledger Overview */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden p-3.5 space-y-4">
          {/* Daily Settlement Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-4 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Direct Bank Payouts
                </span>
                <h3 className="text-sm font-black text-slate-900 mt-1">Aaj Ki Kul Bikri (Net Payout)</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubScreen("s38")}
                className="text-xs font-black text-blue-700 hover:text-blue-800 underline"
              >
                Breakdown →
              </button>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-slate-900">
                  ₹{todayGrossEarnings.toLocaleString("en-IN")}.00
                </span>
                <span className="text-[11px] font-bold text-slate-500 block">
                  {liveOrders.length} Live Order(s) · Manual Settlement Mode
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubScreen("s39")}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
              >
                <span>🏦</span>
                <span>{merchantConfig?.bankAccount?.isVerified ? "Bank Linked" : "Bank Details"}</span>
              </button>
            </div>
          </div>

          {/* Operational Modules Matrix */}
          <div>
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2.5 px-1">
              Dukaan Management &amp; Hardware
            </h4>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setActiveSubScreen("s39")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">🏦</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Bank Account Details
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {merchantConfig?.bankAccount?.accountNumberMask || "Manual Settlement Account"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s46")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">🖨️</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Thermal Printer
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Bluetooth / USB 58mm</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s40")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">📊</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  CA Payout Excel
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Download Monthly Sheet</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s34")}
                className="p-3 bg-gradient-to-br from-amber-50 to-white border border-amber-200 hover:border-amber-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">⭐</span>
                <span className="text-xs font-black text-amber-950 block leading-tight">
                  Subscription Plans
                </span>
                <span className="text-[10px] text-amber-700 block mt-0.5">₹29 / ₹49 VIP Access</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s36")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">🧾</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  GST Invoices
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Tax Invoices Archive</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s43")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">👥</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Staff Roles Matrix
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Cashier, Cook, Manager</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s42")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">🏢</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Multi-Outlet Hub
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Switch Branch Console</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s41")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">🔐</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  2FA &amp; Security PIN
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Cashier Safe Lock</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s08")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">⏰</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Operating Hours
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Opening &amp; Closing Time</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s06")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">📍</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  GPS Geofence Radar
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Delivery Radius Pin</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s29")}
                className="p-3 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">📈</span>
                <span className="text-xs font-black text-slate-900 block leading-tight">
                  Scan Footfall Trends
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Weekly Customer Stats</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveSubScreen("s48")}
                className="p-3 bg-rose-50 border border-rose-200 hover:border-rose-400 rounded-2xl text-left shadow-xs transition active:scale-98"
              >
                <span className="text-xl block mb-1">🔌</span>
                <span className="text-xs font-black text-rose-950 block leading-tight">
                  Offline Safe Mode
                </span>
                <span className="text-[10px] text-rose-700 block mt-0.5">Power / Net Cut Protection</span>
              </button>
            </div>
          </div>

          {/* Support & Logout Section */}
          <div className="space-y-2 pt-2 pb-6">
            <button
              type="button"
              onClick={() => setActiveSubScreen("s45")}
              className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition"
            >
              <span>🎧 24x7 Partner Hotline &amp; WhatsApp Support</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  localStorage.removeItem("trustit_merchant_session");
                }
                setBusinessId("");
                setStoreName("My Store");
                setOwnerName("Merchant Partner");
                setMerchantPhone("");
                setLiveOrders([]);
                setLiveCatalog([]);
                setLiveReviews([]);
                setReviewStats({});
                setTodayGrossEarnings(0);
                setUnreadOrders(0);
                setTabHistory(["cockpit"]);
                setActiveTab("cockpit");
                setActiveSubScreen(null);
                setIsAuthenticated(false);
                setAuthStep("pitch");
                showToast("Merchant logged out successfully.");
              }}
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 font-bold text-xs transition border border-slate-200 flex items-center justify-center gap-1.5"
            >
              <span>🚪</span>
              <span>Logout Dukaan Session</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // UN-AUTHENTICATED ONBOARDING / LOGIN VIEW
  // ============================================================
  const renderAuthStack = () => {
    const activateMerchantSession = (
      details: { businessId?: string; storeName?: string; ownerName?: string; phone?: string; category?: string } | undefined,
      toastText: string
    ) => {
      const finalStore = details?.storeName || storeName;
      const finalOwner = details?.ownerName || ownerName;
      const finalPhone = details?.phone || merchantPhone;
      const finalBizId = details?.businessId || businessId;

      let cat: MerchantCategory = storeCategory;
      if (details?.category) {
        const rawCat = details.category.toLowerCase();
        if (rawCat.includes("kirana") || rawCat.includes("groc")) cat = "kirana";
        else if (rawCat.includes("chem") || rawCat.includes("pharm") || rawCat.includes("med")) cat = "chemist";
        else if (rawCat.includes("salon") || rawCat.includes("spa") || rawCat.includes("beauty")) cat = "salon";
        else if (rawCat.includes("car") || rawCat.includes("auto") || rawCat.includes("wash")) cat = "carwash";
        else cat = "restaurant";
        setStoreCategory(cat);
      }

      if (finalBizId) setBusinessId(finalBizId);
      setStoreName(finalStore);
      setOwnerName(finalOwner);
      if (finalPhone) setMerchantPhone(finalPhone);
      setLiveOrders([]);
      setLiveCatalog([]);
      setLiveReviews([]);
      setReviewStats({});
      setTodayGrossEarnings(0);
      setUnreadOrders(0);
      setTabHistory(["cockpit"]);
      setActiveTab("cockpit");
      setActiveSubScreen(null);
      setIsAuthenticated(true);

      if (typeof window !== "undefined") {
        localStorage.setItem(
          "trustit_merchant_session",
          JSON.stringify({
            isAuthenticated: true,
            businessId: finalBizId,
            storeName: finalStore,
            ownerName: finalOwner,
            phone: finalPhone,
            category: cat,
          })
        );
      }
      showToast(toastText);
      fetchDashboard(finalBizId, finalPhone);
    };

    return (
      <div className="h-full flex flex-col justify-between bg-white overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {authStep === "pitch" && (
          <ScreenAuth01LandingBecomePartner
            initialVariant={activeVariant || initialLandingVariant}
            onStartRegistration={() => setAuthStep("kyc")}
            onGoToLogin={() => setAuthStep("kyc")}
          />
        )}

        {authStep === "category" && (
          <ScreenAuth02BusinessCategoryWizard
            onBack={() => setAuthStep("pitch")}
            onSelectCategory={(cat) => {
              if (cat === "kirana") setStoreCategory("kirana");
              else if (cat === "chemist") setStoreCategory("chemist");
              else if (cat === "salon") setStoreCategory("salon");
              else if (cat === "carwash") setStoreCategory("carwash");
              else setStoreCategory("restaurant");
              setAuthStep("kyc");
            }}
          />
        )}

        {authStep === "kyc" && (
          <ScreenAuth03MobileKycRegistration
            disableRedirect={true}
            onBack={() => setAuthStep("pitch")}
            onLoginSuccess={(details) =>
              activateMerchantSession(details, `Welcome back, ${details?.storeName || storeName}!`)
            }
            onRegisterComplete={(details) =>
              activateMerchantSession(details, `Store "${details?.storeName || storeName}" registered successfully!`)
            }
          />
        )}

        {authStep === "login" && (
          <ScreenAuth04PartnerLogin
            disableRedirect={true}
            onGoToRegister={() => setAuthStep("kyc")}
            onLoginSuccess={(details) =>
              activateMerchantSession(details, `Login successful: ${details?.storeName || storeName}`)
            }
          />
        )}
      </div>
    );
  };

  // ============================================================
  // AUTHENTICATED PHONE INTERFACE
  // ============================================================
  const renderPhoneApp = () => {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC] text-slate-900 font-sans select-none overflow-hidden relative">

        {/* Global Floating Toast Alert */}
        {statusNotification && (
          <div className="absolute top-10 left-3 right-3 z-50 bg-slate-950/95 text-white text-xs font-black p-2.5 rounded-2xl shadow-2xl flex items-center justify-between border border-slate-700 animate-in fade-in slide-in-from-top-2 duration-200">
            <span className="truncate">{statusNotification}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0 ml-2"></span>
          </div>
        )}

        {/* Not Authenticated -> Show Auth Stack */}
        {!isAuthenticated ? (
          <div className="flex-1 overflow-hidden">{renderAuthStack()}</div>
        ) : (
          <>
            {/* Persistent Clean Native Header (Store Info + Online/Offline Switch only) */}
            <header className="bg-white border-b border-slate-200 px-3 py-1.5 flex items-center justify-between shrink-0 shadow-2xs z-10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0">
                  {storeCategory === "kirana"
                    ? "🛒"
                    : storeCategory === "chemist"
                    ? "💊"
                    : storeCategory === "salon"
                    ? "✂️"
                    : storeCategory === "carwash"
                    ? "🚗"
                    : "🍔"}
                </div>
                <div className="min-w-0 flex items-center gap-1.5">
                  <span className="text-[11px] font-black text-slate-900 truncate">
                    {storeName}
                  </span>
                  <span className="text-[8px] font-black uppercase text-blue-700 bg-blue-50 border border-blue-200 px-1.5 py-0.2 rounded shrink-0">
                    {storeCategory}
                  </span>
                </div>
              </div>

              {/* Online / Offline Status Hardware Dongle Slider Switch */}
              <div className="flex items-center shrink-0">
                <DongleSliderSwitch
                  isOn={isStoreOnline}
                  onToggle={toggleStoreStatus}
                />
              </div>
            </header>

            {/* Main Dynamic View Area */}
            <main className="flex-1 overflow-hidden relative">
              {activeSubScreen !== null ? (
                renderActiveSubScreen()
              ) : (
                <>
                  {activeTab === "cockpit" && renderCockpitTab()}
                  {activeTab === "orders" && renderOrdersTab()}
                  {activeTab === "menu" && renderMenuTab()}
                  {activeTab === "standee" && renderStandeeTab()}
                  {activeTab === "more" && renderMoreTab()}
                </>
              )}
            </main>

            {/* Bottom 5-Tab Native Navigation Bar */}
            <nav className="bg-white border-t border-slate-200/90 px-2 py-1 flex items-center justify-around shrink-0 z-20 shadow-md">
              {/* Tab 1: Cockpit */}
              <button
                type="button"
                onClick={() => navigateToTab("cockpit")}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "cockpit" && !activeSubScreen
                    ? "text-blue-700 font-black bg-blue-50/80"
                    : "text-slate-500 hover:text-slate-900 font-bold"
                }`}
              >
                <span className="text-base leading-none">🏠</span>
                <span className="text-[10px] mt-0.5">Cockpit</span>
              </button>

              {/* Tab 2: Menu / Items Catalog */}
              <button
                type="button"
                onClick={() => navigateToTab("menu")}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "menu" && !activeSubScreen
                    ? "text-blue-700 font-black bg-blue-50/80"
                    : "text-slate-500 hover:text-slate-900 font-bold"
                }`}
              >
                <span className="text-base leading-none">📋</span>
                <span className="text-[10px] mt-0.5">
                  {storeCategory === "kirana" || storeCategory === "chemist" ? "Items" : "Menu"}
                </span>
              </button>

              {/* Tab 3: ELEVATED CENTER ORDERS BUTTON */}
              <div className="relative -top-3.5 flex flex-col items-center">
                <button
                  type="button"
                  onClick={() => navigateToTab("orders")}
                  className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer relative ${
                    activeTab === "orders" && !activeSubScreen
                      ? "bg-gradient-to-tr from-blue-700 to-indigo-600 text-white ring-4 ring-blue-100"
                      : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                  title="Live Incoming Orders"
                >
                  <span className="text-xl leading-none">📦</span>
                  {unreadOrders > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse border-2 border-white shadow-xs">
                      {unreadOrders}
                    </span>
                  )}
                </button>
                <span
                  className={`text-[10px] mt-0.5 font-black ${
                    activeTab === "orders" && !activeSubScreen ? "text-blue-700" : "text-slate-600"
                  }`}
                >
                  Orders
                </span>
              </div>

              {/* Tab 4: QR Standee */}
              <button
                type="button"
                onClick={() => navigateToTab("standee")}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "standee" && !activeSubScreen
                    ? "text-blue-700 font-black bg-blue-50/80"
                    : "text-slate-500 hover:text-slate-900 font-bold"
                }`}
              >
                <span className="text-base leading-none">🎯</span>
                <span className="text-[10px] mt-0.5">Standee</span>
              </button>

              {/* Tab 5: Dukaan More */}
              <button
                type="button"
                onClick={() => navigateToTab("more")}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition cursor-pointer ${
                  activeTab === "more" && !activeSubScreen
                    ? "text-blue-700 font-black bg-blue-50/80"
                    : "text-slate-500 hover:text-slate-900 font-bold"
                }`}
              >
                <span className="text-base leading-none">⚙️</span>
                <span className="text-[10px] mt-0.5">More</span>
              </button>
            </nav>
          </>
        )}
      </div>
    );
  };

  // ============================================================
  // ROOT RENDER: LAPTOP SIMULATOR VS FULL SCREEN
  // ============================================================
  if (forceStandalone || !isSimulatorFrame) {
    return (
      <div className="w-full h-screen bg-[#F8FAFC]">
        <div className="w-full h-full max-w-md mx-auto shadow-2xl border-x border-slate-200">
          {renderPhoneApp()}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 font-sans p-3 sm:p-5 flex flex-col justify-between items-center">
      {/* Top Simulator Control Deck (Laptop Tools) */}
      <div className="w-full max-w-5xl bg-slate-900/90 backdrop-blur-md border border-slate-800 rounded-2xl p-3 shadow-xl mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white font-black text-sm flex items-center justify-center shadow-xs">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm text-white tracking-tight">
                Merchant Partner App · Laptop Live Studio
              </span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                68 Screens Integrated
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block">
              Test all screens, tabs, and buttons directly on your laptop with live hot-reload
            </span>
          </div>
        </div>

        {/* Quick Category Switcher for Live Testing */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 px-1.5 uppercase">Switch:</span>
          {(["kirana", "restaurant", "chemist", "salon", "carwash"] as MerchantCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => {
                setStoreCategory(cat);
                showToast(`Viewing ${cat.toUpperCase()} Cockpit`);
              }}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-black transition capitalize ${
                storeCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {cat === "kirana"
                ? "🛒 Kirana"
                : cat === "chemist"
                ? "💊 Chemist"
                : cat === "salon"
                ? "✂️ Salon"
                : cat === "carwash"
                ? "🚗 Wash"
                : "🍔 Food"}
            </button>
          ))}
        </div>

        {/* Quick Tools */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={triggerTestSiren}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <span>🚨</span>
            <span>Test Siren Sound</span>
          </button>

          <button
            type="button"
            onClick={() => setIsSimulatorFrame(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition border border-slate-700"
          >
            🖥️ Full View
          </button>

          {isAuthenticated && (
            <button
              type="button"
              onClick={() => {
                setIsAuthenticated(false);
                setAuthStep("login");
              }}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
              title="Sign out to login screen"
            >
              🔄 Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Modern Smartphone Device Frame (Bezel, Notch, Dynamic Island) */}
      <div className="relative w-full max-w-[400px] h-[820px] max-h-[86vh] bg-slate-950 rounded-[52px] shadow-[0_25px_80px_rgba(0,0,0,0.8)] border-[10px] border-slate-900 flex flex-col overflow-hidden select-none ring-1 ring-slate-800">
        {/* Phone Speaker Earpiece Slit */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-14 h-1 bg-slate-800 rounded-full z-40"></div>

        {/* Inner Phone Screen */}
        <div className="w-full h-full flex flex-col bg-white overflow-hidden rounded-[42px]">
          {renderPhoneApp()}
        </div>
      </div>

      {/* Bottom Footer Note */}
      <div className="mt-4 text-center text-xs text-slate-400">
        <span>Trustit Merchant Partner Console · Zero Web Redirects · Standalone Native APK Ready</span>
      </div>
    </div>
  );
}
