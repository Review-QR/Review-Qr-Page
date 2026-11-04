"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { merchantAudio } from "@/lib/audio/merchant-siren";
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
import ScreenK03KiranaMasterRates from "./screens/ScreenK03KiranaMasterRates";
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
  initialSubScreen?: string | null;
  forceStandalone?: boolean; // When true, forces full viewport (for APK)
}

export default function MerchantNativeAppShell({
  initialAuth = true,
  initialAuthStep = "pitch",
  initialCategory = "kirana",
  initialStoreName = "Gupta Kirana & General Store",
  initialOwnerName = "Merchant Partner",
  initialSubScreen = null,
  forceStandalone = false,
}: MerchantNativeAppShellProps) {
  // Authentication & Profile State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(initialAuth);
  const [authStep, setAuthStep] = useState<"pitch" | "category" | "kyc" | "login">(initialAuthStep);
  const [storeCategory, setStoreCategory] = useState<MerchantCategory>(initialCategory);
  const [storeName, setStoreName] = useState<string>(initialStoreName);
  const [ownerName, setOwnerName] = useState<string>(initialOwnerName);
  const [merchantPhone, setMerchantPhone] = useState<string>("");
  const [isStoreOnline, setIsStoreOnline] = useState<boolean>(true);
  const [unreadOrders, setUnreadOrders] = useState<number>(2);

  // Live Data State
  const [liveOrders, setLiveOrders] = useState<any[]>([]);
  const [liveCatalog, setLiveCatalog] = useState<any[]>([]);
  const [todayGrossEarnings, setTodayGrossEarnings] = useState<number>(8450);
  const [activeIncomingOrder, setActiveIncomingOrder] = useState<any>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [merchantConfig, setMerchantConfig] = useState<any>(null);

  // Navigation State
  const [activeTab, setActiveTab] = useState<PrimaryTab>("cockpit");
  const [activeSubScreen, setActiveSubScreen] = useState<string | null>(initialSubScreen);

  // Laptop Simulator View State
  const [isSimulatorFrame, setIsSimulatorFrame] = useState<boolean>(!forceStandalone);
  const [isSirenActive, setIsSirenActive] = useState<boolean>(false);
  const [statusNotification, setStatusNotification] = useState<string | null>(null);

  // Notification helper
  const showToast = (msg: string) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(null), 3500);
  };

  // Fetch Dashboard & Live Orders from Supabase
  const fetchDashboard = async () => {
    try {
      const res = await fetch("/api/merchant/app-operations");
      const data = await res.json();
      if (data.success) {
        if (data.config) {
          setMerchantConfig(data.config);
          if (data.config.ownerName && initialOwnerName === "Merchant Partner") setOwnerName(data.config.ownerName);
          if (data.config.phone) setMerchantPhone(data.config.phone);
          if (data.config.businessCategory) {
            const rawCat = (data.config.businessCategory || "").toLowerCase();
            if (rawCat.includes("kirana") || rawCat.includes("groc")) setStoreCategory("kirana");
            else if (rawCat.includes("chem") || rawCat.includes("pharm") || rawCat.includes("med")) setStoreCategory("chemist");
            else if (rawCat.includes("salon") || rawCat.includes("spa") || rawCat.includes("beauty")) setStoreCategory("salon");
            else if (rawCat.includes("car") || rawCat.includes("auto") || rawCat.includes("wash")) setStoreCategory("carwash");
            else setStoreCategory("restaurant");
          }
        }
        if (data.business?.name && initialStoreName === "Gupta Kirana & General Store") setStoreName(data.business.name);
        if (data.business?.owner && initialOwnerName === "Merchant Partner") setOwnerName(data.business.owner);
        if (data.business?.phone) setMerchantPhone(data.business.phone);
        if (data.business?.type) {
          const rawType = (data.business.type || "").toLowerCase();
          if (rawType.includes("kirana") || rawType.includes("groc")) setStoreCategory("kirana");
          else if (rawType.includes("chem") || rawType.includes("pharm") || rawType.includes("med")) setStoreCategory("chemist");
          else if (rawType.includes("salon") || rawType.includes("spa") || rawType.includes("beauty")) setStoreCategory("salon");
          else if (rawType.includes("car") || rawType.includes("auto") || rawType.includes("wash")) setStoreCategory("carwash");
        }
        if (data.business?.is_outlet_open !== undefined) setIsStoreOnline(data.business.is_outlet_open);
        if (data.orders) setLiveOrders(data.orders);
        if (data.catalog) setLiveCatalog(data.catalog);
        if (data.stats?.todayEarnings) setTodayGrossEarnings(data.stats.todayEarnings);
        if (data.stats?.pendingCount !== undefined) setUnreadOrders(data.stats.pendingCount);
      }
    } catch {}
  };

  useEffect(() => {
    fetchDashboard();
    const timer = setInterval(fetchDashboard, 10000);
    return () => clearInterval(timer);
  }, []);

  // 1. Toggle Store Online / Offline Status
  const toggleStoreStatus = async () => {
    const next = !isStoreOnline;
    setIsStoreOnline(next);
    showToast(next ? "🟢 Dukaan ab ONLINE hai (Orders Active)" : "🔴 Dukaan ab OFFLINE hai (Orders Paused)");
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_outlet", data: { isOpen: next } }),
      });
    } catch {}
  };

  // 2. Incoming Siren Alert & Real Simulation Order Trigger
  const triggerTestSiren = async () => {
    setIsSirenActive(true);
    merchantAudio.playIncomingOrderSiren(7);
    showToast("🚨 Incoming Order Siren Alert Triggered!");
    try {
      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_sample_order",
          data: {
            customerName: "Aman Sharma",
            customerPhone: "9118643415",
            customerAddress: "Civil Lines near Gandhi Park, Bahraich",
            items: [
              { name: storeCategory === "kirana" ? "Sharbati Chakki Atta (5kg)" : "Special Shahi Paneer", quantity: 1, price: 240 },
              { name: storeCategory === "kirana" ? "Madhur Sugar (2kg)" : "Butter Naan (2 pcs)", quantity: 2, price: 90 },
            ],
          },
        }),
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
    setTimeout(() => setIsSirenActive(false), 7000);
  };

  // 3. Accept Incoming Order
  const handleAcceptOrder = async (prepMins = 20) => {
    showToast(`Order Accepted! Cooking Prep Time: ${prepMins} mins`);
    const orderId = activeIncomingOrder?.id || "ORD-7783-09";
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "order_accept",
          orderId,
          data: { prepTimeMinutes: prepMins },
        }),
      });
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
    setActiveTab("orders");
  };

  // 4. Reject Incoming Order
  const handleRejectOrder = async (reason = "Kitchen Rush") => {
    showToast("Order Declined.");
    const orderId = activeIncomingOrder?.id || "ORD-7783-09";
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "order_reject",
          orderId,
          data: { reason },
        }),
      });
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 5. Add Product Handler
  const handleAddProduct = async (productData: any) => {
    showToast(`"${productData.name}" item published to customer app!`);
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add_product", data: productData }),
      });
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 6. Toggle Stock Handler
  const handleToggleItemStock = async (itemId: string | number, isAvailable: boolean) => {
    showToast(isAvailable ? "Item marked IN-STOCK" : "Item marked OUT-OF-STOCK");
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle_item_stock", itemId, data: { isAvailable } }),
      });
      fetchDashboard();
    } catch {}
  };

  // 6b. Delete Product Handler
  const handleDeleteProduct = async (itemId: string | number) => {
    showToast("Deleting item from catalog...");
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete_product", itemId }),
      });
      showToast("✓ Item deleted from catalog!");
      fetchDashboard();
    } catch {}
  };



  // 7. Save Store Profile
  const handleSaveProfile = async (profileData: any) => {
    showToast("Saving store profile...");
    try {
      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_profile", data: profileData }),
      });
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
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_location",
          data: { latitude: locData.lat, longitude: locData.lng, deliveryRadiusKm: locData.radius },
        }),
      });
      showToast("✓ GPS Location & Radius Saved!");
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 9. Save Operating Hours
  const handleSaveOperatingHours = async (hoursData: any) => {
    showToast("Saving operating hours...");
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update_operating_hours", data: hoursData }),
      });
      showToast("✓ Operating Hours Saved!");
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 10. Save Google Review Gating
  const handleSaveGating = async (gatingData: any) => {
    showToast("Saving review gating link...");
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_review_gating",
          data: {
            googlePlaceId: gatingData.googlePlaceId,
            reviewShortLink: gatingData.reviewLink,
            smartGatingMinStars: gatingData.minStars,
          },
        }),
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
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "order_ready", orderId }),
      });
      fetchDashboard();
    } catch {}
  };

  // 12. Assign Rider
  const handleRiderAssigned = async (orderId: string, riderName: string) => {
    showToast(`Rider ${riderName} assigned to #${orderId.slice(-6)}!`);
    try {
      await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "order_dispatch", orderId, data: { riderName } }),
      });
      fetchDashboard();
    } catch {}
    setActiveSubScreen(null);
  };

  // 13. Verify Handover OTP & Deliver
  const handleVerifyDeliver = async (orderId: string, otp: string) => {
    try {
      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "order_deliver", orderId, data: { otp } }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`✓ Order #${orderId.slice(-6)} delivered!`);
        fetchDashboard();
      } else {
        showToast(`⚠️ ${d.message}`);
      }
    } catch {}
  };

  // 14. Cashfree Wallet Recharge
  const handleInitiateCashfree = async (amount: number, credits: number) => {
    try {
      const res = await fetch("/api/merchant/app-operations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recharge_wallet", data: { amount, credits } }),
      });
      const d = await res.json();
      if (d.success) {
        showToast(`✓ Cashfree UPI session ${d.orderId?.slice(-6)} created!`);
        fetchDashboard();
      } else {
        showToast(`⚠️ ${d.message}`);
      }
    } catch {}
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
          {activeSubScreen === "s02" && (
            <Screen02IncomingOrderSiren
              onAccept={handleAcceptOrder}
              onDecline={() => handleRejectOrder("Kitchen Rush")}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
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
            <Screen24OrderTrackingWaybill onBack={() => setActiveSubScreen(null)} />
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
            <Screen36GstTaxInvoices onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s38" && (
            <Screen38SettlementBreakdownModal onBack={() => setActiveSubScreen(null)} />
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
            <Screen40PayoutExcelDownloader onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s41" && (
            <Screen41SecurityTwoFactor onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s42" && (
            <Screen42MultiOutletSwitcher onBack={() => setActiveSubScreen(null)} />
          )}
          {activeSubScreen === "s43" && (
            <Screen43StaffRolesMatrix
              ownerName={ownerName}
              phone={merchantPhone}
              onBack={() => setActiveSubScreen(null)}
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
              initialOwnerName={merchantConfig?.ownerName || "Aman Sharma"}
              initialBusinessType={storeCategory}
              initialPhone={merchantConfig?.phone || "+919118643415"}
              onSaveProfile={handleSaveProfile}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s06" && (
            <Screen06GpsGeofence
              initialRadius={merchantConfig?.deliveryRadiusKm || 5.0}
              initialLat={merchantConfig?.latitude ? String(merchantConfig.latitude) : "27.5744"}
              initialLng={merchantConfig?.longitude ? String(merchantConfig.longitude) : "81.5977"}
              onSaveLocation={handleSaveLocation}
              onBack={() => setActiveSubScreen(null)}
            />
          )}
          {activeSubScreen === "s07" && (
            <Screen07GoogleReviewGating
              initialPlaceId={merchantConfig?.googlePlaceId || "ChIJ_TrustitShriBalajiBahraich"}
              initialReviewLink={merchantConfig?.reviewShortLink || `https://trustitreview.com/r/${merchantConfig?.businessId || 'm_9118643415_0601'}`}
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
            <ScreenK03KiranaMasterRates
              onBack={() => setActiveSubScreen(null)}
              onSave={() => {
                showToast("Kirana master mandi rates updated!");
                setActiveSubScreen(null);
              }}
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
            onOpenParcha={() => setActiveSubScreen("kirana_02")}
            onOpenRates={() => setActiveSubScreen("kirana_03")}
            onOpenStandee={() => setActiveSubScreen("kirana_04")}
            onBack={() => setAuthStep("category")}
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
            onBack={() => setAuthStep("category")}
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
            onBack={() => setAuthStep("category")}
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
            onBack={() => setAuthStep("category")}
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
            catalogCount={liveCatalog.length}
            todayEarnings={todayGrossEarnings}
            onOpenOrders={() => setActiveTab("orders")}
            onOpenMenu={() => setActiveTab("menu")}
            onOpenSiren={() => setActiveSubScreen("s02")}
            onOpenOccasion={() => setActiveSubScreen("s04")}
          />
        );
    }
  };

  // Tab 2: Orders Master Board + Quick Siren / KOT Shortcuts
  const renderOrdersTab = () => {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* Quick Orders Bar */}
        <div className="bg-white border-b border-slate-200 p-2.5 flex items-center justify-between gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
          <button
            type="button"
            onClick={triggerTestSiren}
            className="px-2.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[11px] flex items-center gap-1 shadow-xs shrink-0 active:scale-95 transition"
          >
            <span>🚨</span>
            <span>Incoming Siren</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s11")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>🖨️</span>
            <span>Thermal KOT</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s03")}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>⏳</span>
            <span>Urgent Queue</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s12")}
            className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>🛵</span>
            <span>Rider Dispatch</span>
          </button>
          {storeCategory === "kirana" && (
            <button
              type="button"
              onClick={() => setActiveSubScreen("kirana_02")}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
            >
              <span>📝</span>
              <span>Parcha Viewer</span>
            </button>
          )}
          {storeCategory === "chemist" && (
            <button
              type="button"
              onClick={() => setActiveSubScreen("chemist_02")}
              className="px-2.5 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
            >
              <span>💊</span>
              <span>Rx Doctor Slip</span>
            </button>
          )}
        </div>

        {/* Master Kanban Orders Board */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Screen09OrdersMasterBoard
            liveOrders={liveOrders}
            onInspectOrder={(orderId) => {
              const ord = liveOrders.find((o) => o.id === orderId);
              setSelectedOrder(ord || liveOrders[0]);
              setActiveSubScreen("s10");
            }}
            onPrintKot={(orderId) => {
              const ord = liveOrders.find((o) => o.id === orderId);
              setSelectedOrder(ord || liveOrders[0]);
              handleOrderReady(orderId || liveOrders[0]?.id || "ord_sample");
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

  // Tab 3: Menu, Inventory & Mandi Rates
  const renderMenuTab = () => {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* Menu Actions Header */}
        <div className="bg-white border-b border-slate-200 p-2.5 flex items-center justify-between gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubScreen("s14")}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-[11px] flex items-center gap-1 shadow-xs shrink-0 active:scale-95 transition"
          >
            <span>+</span>
            <span>Add Item / Dish</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s15")}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-300 font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>⚡</span>
            <span>Out-of-Stock Switch</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s16")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>🏷️</span>
            <span>Categories</span>
          </button>
          {storeCategory === "kirana" && (
            <button
              type="button"
              onClick={() => setActiveSubScreen("kirana_03")}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300 font-black text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
            >
              <span>🌾</span>
              <span>Mandi 50+ Rates</span>
            </button>
          )}
          {storeCategory === "chemist" && (
            <button
              type="button"
              onClick={() => setActiveSubScreen("chemist_03")}
              className="px-2.5 py-1.5 rounded-xl bg-teal-50 text-teal-800 border border-teal-300 font-black text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
            >
              <span>🧪</span>
              <span>Medicine Catalog</span>
            </button>
          )}
          {storeCategory === "salon" && (
            <button
              type="button"
              onClick={() => setActiveSubScreen("salon_03")}
              className="px-2.5 py-1.5 rounded-xl bg-pink-50 text-pink-800 border border-pink-300 font-black text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
            >
              <span>✂️</span>
              <span>Grooming Rates</span>
            </button>
          )}
          {storeCategory === "carwash" && (
            <button
              type="button"
              onClick={() => setActiveSubScreen("carwash_03")}
              className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 border border-indigo-300 font-black text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
            >
              <span>🚗</span>
              <span>Vehicle Packages</span>
            </button>
          )}
        </div>

        {/* Menu Explorer Body */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {storeCategory === "kirana" ? (
            <ScreenK03KiranaMasterRates
              onBack={() => setActiveTab("cockpit")}
              onSave={() => showToast("Kirana Mandi rates saved!")}
            />
          ) : storeCategory === "chemist" ? (
            <ScreenM03ChemistMedicineCatalog onBack={() => setActiveTab("cockpit")} />
          ) : storeCategory === "salon" ? (
            <ScreenS03SalonServicesRateCard
              onBack={() => setActiveTab("cockpit")}
              onAddService={() => setActiveSubScreen("s14")}
            />
          ) : storeCategory === "carwash" ? (
            <ScreenC03VehicleTypePackages
              onBack={() => setActiveTab("cockpit")}
              onAddPackage={() => setActiveSubScreen("s14")}
            />
          ) : (
            <Screen13MenuExplorer
              liveCatalog={liveCatalog}
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

  // Tab 4: QR Standee, Reviews & CRM Marketing
  const renderStandeeTab = () => {
    return (
      <div className="flex flex-col h-full bg-[#F8FAFC]">
        {/* Top Marketing Action Strip */}
        <div className="bg-white border-b border-slate-200 p-2.5 flex items-center justify-between gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden shrink-0">
          <button
            type="button"
            onClick={() => setActiveSubScreen("s17")}
            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-600 text-white font-black text-[11px] flex items-center gap-1 shadow-xs shrink-0 active:scale-95 transition"
          >
            <span>📥</span>
            <span>Download Vector QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s18")}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>🖼️</span>
            <span>Standee Gallery</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s26")}
            className="px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>🎨</span>
            <span>AI Festival Poster</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s27")}
            className="px-2.5 py-1.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>💬</span>
            <span>WhatsApp Wishes</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s21")}
            className="px-2.5 py-1.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>🎁</span>
            <span>Acrylic Standee Order</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubScreen("s25")}
            className="px-2.5 py-1.5 rounded-xl bg-pink-50 text-pink-900 border border-pink-200 font-bold text-[11px] flex items-center gap-1 shrink-0 active:scale-95 transition"
          >
            <span>🎂</span>
            <span>Occasions CRM</span>
          </button>
        </div>

        {/* Customer Reviews Live Feed */}
        <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Screen19CustomerReviewsFeed
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
                  0% Commission Payouts
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
                  {liveOrders.length || 34} Orders · 0% Fee Auto-Settled via NEFT / UPI
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveSubScreen("s39")}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
              >
                <span>🏦</span>
                <span>Bank Verified</span>
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
                  Bank Account KYC
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">₹1 Penny Drop Verified</span>
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
                setIsAuthenticated(false);
                setAuthStep("login");
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
    return (
      <div className="h-full flex flex-col justify-between bg-white overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {authStep === "pitch" && (
          <ScreenAuth01LandingBecomePartner
            onStartRegistration={() => setAuthStep("category")}
            onGoToLogin={() => setAuthStep("login")}
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
            category={storeCategory}
            disableRedirect={true}
            onBack={() => setAuthStep("category")}
            onRegisterComplete={(details) => {
              if (details?.storeName) setStoreName(details.storeName);
              if (details?.ownerName) setOwnerName(details.ownerName);
              if (details?.phone) setMerchantPhone(details.phone);
              if (details?.category) {
                const rawCat = (details.category || "").toLowerCase();
                if (rawCat.includes("kirana") || rawCat.includes("groc")) setStoreCategory("kirana");
                else if (rawCat.includes("chem") || rawCat.includes("pharm") || rawCat.includes("med")) setStoreCategory("chemist");
                else if (rawCat.includes("salon") || rawCat.includes("spa") || rawCat.includes("beauty")) setStoreCategory("salon");
                else if (rawCat.includes("car") || rawCat.includes("auto") || rawCat.includes("wash")) setStoreCategory("carwash");
                else setStoreCategory("restaurant");
              }
              setIsAuthenticated(true);
              setActiveTab("cockpit");
              showToast(`Dukaan "${details?.storeName || storeName}" safalta se register ho gayi!`);
            }}
          />
        )}

        {authStep === "login" && (
          <ScreenAuth04PartnerLogin
            disableRedirect={true}
            onGoToRegister={() => setAuthStep("pitch")}
            onLoginSuccess={(details) => {
              if (details?.storeName) setStoreName(details.storeName);
              if (details?.ownerName) setOwnerName(details.ownerName);
              if (details?.phone) setMerchantPhone(details.phone);
              setIsAuthenticated(true);
              setActiveTab("cockpit");
              showToast("Swagatam! Merchant Console me aapka swagat hai.");
            }}
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
        {/* Realistic Mobile Status Bar (9:41, 5G, Battery) */}
        <div className="bg-slate-950 text-white px-5 pt-2 pb-1.5 flex items-center justify-between text-[11px] font-black tracking-tight shrink-0">
          <span>9:41 AM</span>
          <div className="w-24 h-4 bg-black rounded-full mx-auto flex items-center justify-center gap-1.5 px-2">
            <span className="w-2 h-2 rounded-full bg-slate-800"></span>
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px]">5G</span>
            <span className="w-2.5 h-2 bg-white rounded-xs"></span>
            <span className="text-emerald-400 font-bold">100%</span>
          </div>
        </div>

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
            {/* Top Merchant App Bar */}
            <header className="bg-white border-b border-slate-200 px-3.5 py-2 flex items-center justify-between shrink-0 shadow-xs z-10">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-xs shrink-0">
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
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-slate-900 truncate block">
                      {storeName}
                    </span>
                  </div>
                  <span className="text-[9px] font-black uppercase text-blue-700 tracking-wider block">
                    {storeCategory.toUpperCase()} CONSOLE
                  </span>
                </div>
              </div>

              {/* Online / Offline Status Hardware Dongle Slider Switch */}
              <div className="flex items-center gap-1.5 shrink-0">
                <DongleSliderSwitch
                  isOn={isStoreOnline}
                  onToggle={toggleStoreStatus}
                />

                <button
                  type="button"
                  onClick={triggerTestSiren}
                  title="Test Siren Audio"
                  className="w-7 h-7 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center text-xs border border-slate-200 transition active:scale-95"
                >
                  🔔
                </button>
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
            <nav className="bg-white border-t border-slate-200/90 px-2 py-1.5 flex items-center justify-around shrink-0 z-20 shadow-md">
              {/* Tab 1: Cockpit */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubScreen(null);
                  setActiveTab("cockpit");
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                  activeTab === "cockpit" && !activeSubScreen
                    ? "text-blue-700 font-black bg-blue-50/80"
                    : "text-slate-500 hover:text-slate-900 font-bold"
                }`}
              >
                <span className="text-base leading-none">🏠</span>
                <span className="text-[10px] mt-0.5">Cockpit</span>
              </button>

              {/* Tab 2: Orders */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubScreen(null);
                  setActiveTab("orders");
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition relative ${
                  activeTab === "orders" && !activeSubScreen
                    ? "text-blue-700 font-black bg-blue-50/80"
                    : "text-slate-500 hover:text-slate-900 font-bold"
                }`}
              >
                <span className="text-base leading-none">📦</span>
                <span className="text-[10px] mt-0.5">Orders</span>
                {unreadOrders > 0 && (
                  <span className="absolute top-0.5 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse shadow-2xs">
                    {unreadOrders}
                  </span>
                )}
              </button>

              {/* Tab 3: Menu / Rates */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubScreen(null);
                  setActiveTab("menu");
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
                  activeTab === "menu" && !activeSubScreen
                    ? "text-blue-700 font-black bg-blue-50/80"
                    : "text-slate-500 hover:text-slate-900 font-bold"
                }`}
              >
                <span className="text-base leading-none">📋</span>
                <span className="text-[10px] mt-0.5">Menu</span>
              </button>

              {/* Tab 4: QR Standee */}
              <button
                type="button"
                onClick={() => {
                  setActiveSubScreen(null);
                  setActiveTab("standee");
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
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
                onClick={() => {
                  setActiveSubScreen(null);
                  setActiveTab("more");
                }}
                className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition ${
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
  if (!isSimulatorFrame) {
    return (
      <div className="w-full h-screen bg-[#F8FAFC]">
        {!forceStandalone && (
          <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>Trustit Merchant Mobile App</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSimulatorFrame(true)}
              className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black transition"
            >
              📱 Switch to Laptop Phone Simulator
            </button>
          </div>
        )}
        <div className={`w-full ${!forceStandalone ? "h-[calc(100vh-36px)] max-w-md mx-auto shadow-2xl border-x border-slate-200" : "h-full"}`}>
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
                if (cat === "kirana") setStoreName("Gupta Kirana & General Store");
                else if (cat === "chemist") setStoreName("Sanjivani Medicos & Pharmacy");
                else if (cat === "salon") setStoreName("Looks Unisex Salon & Spa");
                else if (cat === "carwash") setStoreName("SpeedX Auto Foam Detailing");
                else setStoreName("Golden Blossom Cafe & Dining");
                showToast(`Switched to ${cat.toUpperCase()} Cockpit`);
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

          <button
            type="button"
            onClick={() => {
              setIsAuthenticated(!isAuthenticated);
              setAuthStep(isAuthenticated ? "login" : "login");
            }}
            className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition border border-slate-700"
            title="Toggle between Logged In and Auth screen"
          >
            {isAuthenticated ? "🔄 Relog" : "🔑 Auto-Login"}
          </button>
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
