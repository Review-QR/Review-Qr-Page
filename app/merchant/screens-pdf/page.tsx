"use client";

import React from "react";

// Import all 48 production screens
import Screen01MainCockpit from "../components/screens/Screen01MainCockpit";
import Screen02IncomingOrderSiren from "../components/screens/Screen02IncomingOrderSiren";
import Screen03UrgentQueueDrawer from "../components/screens/Screen03UrgentQueueDrawer";
import Screen04OccasionDailyPulse from "../components/screens/Screen04OccasionDailyPulse";
import Screen05StoreBrandProfile from "../components/screens/Screen05StoreBrandProfile";
import Screen06GpsGeofence from "../components/screens/Screen06GpsGeofence";
import Screen07GoogleReviewGating from "../components/screens/Screen07GoogleReviewGating";
import Screen08OperatingHours from "../components/screens/Screen08OperatingHours";
import Screen09OrdersMasterBoard from "../components/screens/Screen09OrdersMasterBoard";
import Screen10OrderDetailDrawer from "../components/screens/Screen10OrderDetailDrawer";
import Screen11KotThermalReceipt from "../components/screens/Screen11KotThermalReceipt";
import Screen12RiderDispatchModal from "../components/screens/Screen12RiderDispatchModal";
import Screen13MenuExplorer from "../components/screens/Screen13MenuExplorer";
import Screen14AddProductModal from "../components/screens/Screen14AddProductModal";
import Screen15OutOfStockSwitcher from "../components/screens/Screen15OutOfStockSwitcher";
import Screen16CategoryMasterPreset from "../components/screens/Screen16CategoryMasterPreset";
import Screen17VectorQrDownload from "../components/screens/Screen17VectorQrDownload";
import Screen18StandeeTemplateGallery from "../components/screens/Screen18StandeeTemplateGallery";
import Screen19CustomerReviewsFeed from "../components/screens/Screen19CustomerReviewsFeed";
import Screen20ReviewReplyModal from "../components/screens/Screen20ReviewReplyModal";
import Screen21MerchandiseCatalog from "../components/screens/Screen21MerchandiseCatalog";
import Screen22MockupCustomizer from "../components/screens/Screen22MockupCustomizer";
import Screen23CartCheckout from "../components/screens/Screen23CartCheckout";
import Screen24OrderTrackingWaybill from "../components/screens/Screen24OrderTrackingWaybill";
import Screen25OccasionsCrmBoard from "../components/screens/Screen25OccasionsCrmBoard";
import Screen26AiPosterCreator from "../components/screens/Screen26AiPosterCreator";
import Screen27WhatsAppComposer from "../components/screens/Screen27WhatsAppComposer";
import Screen28ConnectWalletRecharge from "../components/screens/Screen28ConnectWalletRecharge";
import Screen29ScanFootfallTrends from "../components/screens/Screen29ScanFootfallTrends";
import Screen30HourlyRushHeatmap from "../components/screens/Screen30HourlyRushHeatmap";
import Screen31CustomerSentimentTags from "../components/screens/Screen31CustomerSentimentTags";
import Screen32ReportsDataExporter from "../components/screens/Screen32ReportsDataExporter";
import Screen33PlanStatusCockpit from "../components/screens/Screen33PlanStatusCockpit";
import Screen34ThreeTierMatrix from "../components/screens/Screen34ThreeTierMatrix";
import Screen35SubscriptionAutoPay from "../components/screens/Screen35SubscriptionAutoPay";
import Screen36GstTaxInvoices from "../components/screens/Screen36GstTaxInvoices";
import Screen37DailySettlementLedger from "../components/screens/Screen37DailySettlementLedger";
import Screen38SettlementBreakdownModal from "../components/screens/Screen38SettlementBreakdownModal";
import Screen39BankKycPennyDrop from "../components/screens/Screen39BankKycPennyDrop";
import Screen40PayoutExcelDownloader from "../components/screens/Screen40PayoutExcelDownloader";
import Screen41SecurityTwoFactor from "../components/screens/Screen41SecurityTwoFactor";
import Screen42MultiOutletSwitcher from "../components/screens/Screen42MultiOutletSwitcher";
import Screen43StaffRolesMatrix from "../components/screens/Screen43StaffRolesMatrix";
import Screen44AuditSessionsLog from "../components/screens/Screen44AuditSessionsLog";
import Screen45OperationsSupportHub from "../components/screens/Screen45OperationsSupportHub";
import Screen46ThermalPrinterWizard from "../components/screens/Screen46ThermalPrinterWizard";
import Screen47TicketDeskDisputes from "../components/screens/Screen47TicketDeskDisputes";
import Screen48OfflineSafeMode from "../components/screens/Screen48OfflineSafeMode";

export const dynamic = "force-dynamic";

const sampleOrder = {
  id: "ORD-9118-09",
  customer_name: "Aman Sharma",
  customer_phone: "+91 91186 43415",
  customer_address: "Civil Lines, Near Gandhi Stadium, Bahraich (UP)",
  total_amount: 340,
  payment_mode: "online_cashfree",
  payment_status: "paid",
  delivery_otp: "5708",
  created_at: new Date().toISOString(),
  items: [
    { name: "Special Shahi Paneer", quantity: 1, price: 240 },
    { name: "Butter Naan (2 pcs)", quantity: 2, price: 90 },
  ],
};

const sampleCatalog = [
  { id: "1", name: "Madhur Pure Sugar", price: 44, category: "Grocery", is_available: true, unit: "kg" },
  { id: "2", name: "Fortune Soyabean Oil", price: 135, category: "Edible Oil", is_available: true, unit: "ltr" },
  { id: "3", name: "Aashirvaad Shudh Chakki Atta", price: 215, category: "Flour", is_available: false, unit: "5kg" },
  { id: "4", name: "Tata Salt Vacuum Evaporated", price: 28, category: "Salt & Spices", is_available: true, unit: "1kg" },
];

interface ScreenMeta {
  num: number;
  id: string;
  title: string;
  category: string;
  description: string;
  keyButtons: string[];
  component: React.ReactNode;
}

export default function MerchantPdfExportPage() {
  const screens: ScreenMeta[] = [
    {
      num: 1,
      id: "S01",
      title: "Main Cockpit (Business Control Center)",
      category: "DASHBOARD & OPERATIONS",
      description: "Dynamic SaaS cockpit with hardware DongleSliderSwitch for Online/Offline state, gross sales, and quick shortcuts.",
      keyButtons: ["DongleSliderSwitch (Online/Offline)", "Live Parchas", "Mandi Rates", "KOT Shortcuts"],
      component: <Screen01MainCockpit storeName="Shri Balaji Daily Needs" ownerName="Aman Sharma" phone="+919118643415" />,
    },
    {
      num: 2,
      id: "S02",
      title: "Incoming Order Siren Alert",
      category: "ORDER DISPATCH",
      description: "High-urgency full-screen incoming order siren alert with pulsating emergency badge and timer.",
      keyButtons: ["Accept Order (15/20/30 mins)", "Decline Order (Kitchen Rush)", "Mute Siren Alert"],
      component: <Screen02IncomingOrderSiren />,
    },
    {
      num: 3,
      id: "S03",
      title: "Urgent Kitchen Queue Drawer",
      category: "ORDER DISPATCH",
      description: "Priority queue showing orders approaching preparation deadlines with audio ping.",
      keyButtons: ["Quick Accept Order", "Trigger Audio Alert", "Dismiss Drawer"],
      component: <Screen03UrgentQueueDrawer />,
    },
    {
      num: 4,
      id: "S04",
      title: "Occasion Daily Pulse & CRM",
      category: "CUSTOMER CRM",
      description: "Daily customer birthdays, anniversaries, and automated WhatsApp greeting campaign trigger.",
      keyButtons: ["Auto-Dispatch Toggle", "Recharge CRM Credits", "Send Custom Wishes"],
      component: <Screen04OccasionDailyPulse />,
    },
    {
      num: 5,
      id: "S05",
      title: "Store Brand Profile Settings",
      category: "SETTINGS & BRANDING",
      description: "Store name, owner identity, business category selection, and verified phone binding.",
      keyButtons: ["Save Profile Details", "Change Category Wizard", "Close / Back"],
      component: <Screen05StoreBrandProfile initialStoreName="Shri Balaji Daily Needs" initialOwnerName="Aman Sharma" />,
    },
    {
      num: 6,
      id: "S06",
      title: "GPS Geofence Radar Boundary",
      category: "HYPERLOCAL LOGISTICS",
      description: "Radial delivery geofence slider (1 to 15 KM) and live coordinate pinning.",
      keyButtons: ["Save Geofence Radius", "Detect Current GPS", "Delivery Range Slider"],
      component: <Screen06GpsGeofence initialRadius={5.5} initialLat="27.5744" initialLng="81.5977" />,
    },
    {
      num: 7,
      id: "S07",
      title: "Google Review Smart Gating",
      category: "GROWTH & REPUTATION",
      description: "Smart gating threshold: 4-5 stars redirect to Google Maps, 1-3 stars routed to private owner feedback.",
      keyButtons: ["Save Review Gating Link", "Star Threshold Selector (4★ / 5★)", "Verify Google Place ID"],
      component: <Screen07GoogleReviewGating initialPlaceId="ChIJ_TrustitShriBalajiBahraich" />,
    },
    {
      num: 8,
      id: "S08",
      title: "Store Operating Hours & Shifts",
      category: "STORE CONFIGURATION",
      description: "Daily opening/closing schedule, afternoon lunch break toggles, and festival mode switch.",
      keyButtons: ["Save Operating Hours", "Festival Mode Switch", "Lunch Pause Toggle"],
      component: <Screen08OperatingHours initialOpening="08:00 AM" initialClosing="10:30 PM" />,
    },
    {
      num: 9,
      id: "S09",
      title: "Live Orders & KOT Master Board",
      category: "ORDER MANAGEMENT",
      description: "Real-time Kanban pipeline: New Orders, In-Prep, Food Ready, and Delivered filters.",
      keyButtons: ["Print KOT Thermal Slip", "Assign Delivery Rider", "View Full Details", "Date Filter Pills"],
      component: <Screen09OrdersMasterBoard liveOrders={[sampleOrder]} />,
    },
    {
      num: 10,
      id: "S10",
      title: "Order Details & Prep Timer Drawer",
      category: "ORDER MANAGEMENT",
      description: "Itemized order bill, customer delivery address, payment badge, and delivery OTP input.",
      keyButtons: ["Mark Food Ready", "Print Kitchen KOT", "Verify Delivery OTP (4-digits)", "Assign Rider"],
      component: <Screen10OrderDetailDrawer order={sampleOrder} />,
    },
    {
      num: 11,
      id: "S11",
      title: "KOT Kitchen Thermal Receipt",
      category: "HARDWARE & PRINTING",
      description: "Clean 58mm / 80mm thermal receipt slip preview formatted for kitchen cooks and packing staff.",
      keyButtons: ["Print Thermal Slip", "Download PDF Ticket", "Close Receipt Preview"],
      component: <Screen11KotThermalReceipt order={sampleOrder} storeName="Shri Balaji Daily Needs" />,
    },
    {
      num: 12,
      id: "S12",
      title: "Rider Dispatch & Assignment Modal",
      category: "FLEET & DELIVERY",
      description: "Dispatch modal with available Trustit EV fleet riders, proximity ETA, and 1-tap assign.",
      keyButtons: ["Assign Selected Rider", "Auto-Broadcast to Nearest Fleet", "Call Delivery Rider"],
      component: <Screen12RiderDispatchModal order={sampleOrder} />,
    },
    {
      num: 13,
      id: "S13",
      title: "Menu & Catalog Explorer",
      category: "CATALOG MANAGEMENT",
      description: "Full store catalog with search, category filtering, stock toggles, and deletion options.",
      keyButtons: ["+ Add New Item", "Stock Toggle Switch", "Delete Product", "Price Quick Editor"],
      component: <Screen13MenuExplorer liveCatalog={sampleCatalog} />,
    },
    {
      num: 14,
      id: "S14",
      title: "Add Product / Dish Modal",
      category: "CATALOG MANAGEMENT",
      description: "Clean modal for adding new item with photo upload, selling price, MRP, category, and food type.",
      keyButtons: ["Upload Product Photo", "Veg / Non-Veg Switch", "Save & Publish Product", "Cancel"],
      component: <Screen14AddProductModal />,
    },
    {
      num: 15,
      id: "S15",
      title: "Instant Out-of-Stock Switcher",
      category: "INVENTORY CONTROL",
      description: "High-speed stock management screen to pause out-of-stock items in real time with 1 tap.",
      keyButtons: ["In-Stock / Out-of-Stock Toggles", "Search Catalog Items", "Bulk Turn Off"],
      component: <Screen15OutOfStockSwitcher catalogItems={sampleCatalog} />,
    },
    {
      num: 16,
      id: "S16",
      title: "Category Master Presets",
      category: "CATALOG MANAGEMENT",
      description: "Pre-configured industry category presets (Spices, Dairy, Beverages, Snacks) for 1-click catalog import.",
      keyButtons: ["Select Preset Package", "Import All Items", "Custom Category Creator"],
      component: <Screen16CategoryMasterPreset />,
    },
    {
      num: 17,
      id: "S17",
      title: "Official Vector QR Download",
      category: "QR & BRANDING",
      description: "High-resolution vector QR generator with official Trustit brand frame, SVG export, and print presets.",
      keyButtons: ["Download High-Res SVG", "Download Print-Ready PDF", "Copy Direct Review Link"],
      component: <Screen17VectorQrDownload />,
    },
    {
      num: 18,
      id: "S18",
      title: "Standee Template Gallery",
      category: "MARKETING & MERCHANDISE",
      description: "Gallery of premium acrylic counter standees, wooden blocks, and mirror decal designs.",
      keyButtons: ["Select Standee Style", "Preview with Store Logo", "Proceed to Mockup Customizer"],
      component: <Screen18StandeeTemplateGallery />,
    },
    {
      num: 19,
      id: "S19",
      title: "Customer Reviews Live Feed",
      category: "REPUTATION & RATINGS",
      description: "Real-time feed of incoming customer ratings, sentiment badges, and response status.",
      keyButtons: ["1-Click AI Reply", "Filter by 5-Star / Critical", "Export Feedback Sheet"],
      component: <Screen19CustomerReviewsFeed />,
    },
    {
      num: 20,
      id: "S20",
      title: "1-Click AI Review Reply Modal",
      category: "REPUTATION & RATINGS",
      description: "AI-powered personalized review response generator tailored to customer comments.",
      keyButtons: ["Generate AI Reply", "Publish to Google Maps", "Edit Reply Text"],
      component: <Screen20ReviewReplyModal />,
    },
    {
      num: 21,
      id: "S21",
      title: "Acrylic Standee Merchandise Catalog",
      category: "PHYSICAL MERCHANDISE",
      description: "Catalog of physical NFC & QR tabletop standees, door stickers, and table tents with direct ordering.",
      keyButtons: ["Customize Design", "View Standee Specs", "Add Merchandise to Cart"],
      component: <Screen21MerchandiseCatalog />,
    },
    {
      num: 22,
      id: "S22",
      title: "Branded Standee 3D Mockup Customizer",
      category: "PHYSICAL MERCHANDISE",
      description: "Interactive visual preview of physical standee featuring custom store name, logo, and UPI QR code.",
      keyButtons: ["Toggle Golden Acrylic / Wood", "Upload Brand Logo", "Add to Cart & Checkout"],
      component: <Screen22MockupCustomizer />,
    },
    {
      num: 23,
      id: "S23",
      title: "Cart & Standee Checkout",
      category: "ECOMMERCE & BILLING",
      description: "Checkout screen for physical standees with delivery address input and Cashfree UPI payment.",
      keyButtons: ["Pay via Cashfree UPI", "Apply Promo Code", "Edit Delivery Address"],
      component: <Screen23CartCheckout />,
    },
    {
      num: 24,
      id: "S24",
      title: "Courier Waybill Tracking",
      category: "LOGISTICS & TRACKING",
      description: "Shipment status for dispatched physical QR standees with courier tracking number and timeline.",
      keyButtons: ["Track on BlueDart / DTDC", "Download Dispatch Invoice", "Contact Logistics Desk"],
      component: <Screen24OrderTrackingWaybill />,
    },
    {
      num: 25,
      id: "S25",
      title: "Customer Occasions CRM Board",
      category: "GROWTH & RETENTION",
      description: "Customer database mapped with birthdays, anniversaries, total visits, and greeting history.",
      keyButtons: ["Send WhatsApp Greeting", "+ Add New Customer", "Filter Upcoming Occasions"],
      component: <Screen25OccasionsCrmBoard />,
    },
    {
      num: 26,
      id: "S26",
      title: "AI Festival Poster Creator",
      category: "MARKETING & CREATIVE",
      description: "Automated festival poster generator embedding store branding for Diwali, Eid, Holi, and New Year.",
      keyButtons: ["Generate AI Poster", "Download HD Image (1080x1080)", "Share on WhatsApp Status"],
      component: <Screen26AiPosterCreator />,
    },
    {
      num: 27,
      id: "S27",
      title: "WhatsApp Message Composer",
      category: "MARKETING & MESSAGING",
      description: "Broadcast composer with pre-approved Meta WhatsApp templates for discounts and greetings.",
      keyButtons: ["Send Test to My WhatsApp", "Schedule Broadcast", "Select Message Template"],
      component: <Screen27WhatsAppComposer />,
    },
    {
      num: 28,
      id: "S28",
      title: "Connect Wallet Recharge (Cashfree UPI)",
      category: "WALLET & BILLING",
      description: "Real Cashfree UPI PG wallet top-up for SMS/WhatsApp credits and promotional boosts.",
      keyButtons: ["Pay ₹199 (250 Credits)", "Pay ₹499 (700 Credits)", "Custom Amount Recharge", "View Ledger"],
      component: <Screen28ConnectWalletRecharge />,
    },
    {
      num: 29,
      id: "S29",
      title: "Scan Footfall Analytics & Trends",
      category: "ANALYTICS & BI",
      description: "Visual charts for daily counter QR scans, conversion rates, and repeat customer retention.",
      keyButtons: ["7-Day / 30-Day Toggle", "Export Trend Data", "Compare Scan vs Order"],
      component: <Screen29ScanFootfallTrends />,
    },
    {
      num: 30,
      id: "S30",
      title: "Hourly Rush Heatmap",
      category: "ANALYTICS & BI",
      description: "Heatmap matrix identifying store peak rush hours (morning, lunch, evening peak) to optimize staff.",
      keyButtons: ["Select Day of Week", "Toggle Weekday / Weekend", "Print Schedule Guide"],
      component: <Screen30HourlyRushHeatmap />,
    },
    {
      num: 31,
      id: "S31",
      title: "Customer Sentiment Tags",
      category: "ANALYTICS & BI",
      description: "Word cloud and sentiment percentage breakdown analyzing customer feedback keywords.",
      keyButtons: ["Filter Positive / Negative", "Refresh AI Analysis", "Download Summary"],
      component: <Screen31CustomerSentimentTags />,
    },
    {
      num: 32,
      id: "S32",
      title: "Reports & Data Exporter",
      category: "FINANCIAL REPORTS",
      description: "Consolidated financial report exporter for sales, customer data, and tax summaries.",
      keyButtons: ["Export Excel (.xlsx)", "Download PDF Report", "Select Custom Date Range"],
      component: <Screen32ReportsDataExporter />,
    },
    {
      num: 33,
      id: "S33",
      title: "Subscription Plan Cockpit",
      category: "PLANS & BILLING",
      description: "Overview of merchant active plan, next renewal date, active quota, and VIP badges.",
      keyButtons: ["Upgrade Plan Tier", "Manage Payment Mandate", "View Plan Invoices"],
      component: <Screen33PlanStatusCockpit />,
    },
    {
      num: 34,
      id: "S34",
      title: "3-Tier Upgrade Matrix (₹29 / ₹49)",
      category: "PLANS & BILLING",
      description: "Side-by-side tier comparison: Free Starter, Growth (₹29/mo), and Enterprise Pro (₹49/mo).",
      keyButtons: ["Select Starter (₹0)", "Choose Growth (₹29/mo)", "Choose Pro VIP (₹49/mo)"],
      component: <Screen34ThreeTierMatrix />,
    },
    {
      num: 35,
      id: "S35",
      title: "Subscription AutoPay Setup",
      category: "PLANS & BILLING",
      description: "Automated recurring UPI autopay mandate setup via NPCI e-Mandate / Cashfree.",
      keyButtons: ["Set Up UPI AutoPay", "Change Mandate Bank", "Cancel AutoPay Mandate"],
      component: <Screen35SubscriptionAutoPay />,
    },
    {
      num: 36,
      id: "S36",
      title: "GST Tax Invoices Archive",
      category: "COMPLIANCE & TAX",
      description: "Searchable table of all GST tax invoices for platform subscriptions and standee purchases.",
      keyButtons: ["Download GST Invoice PDF", "Email Invoice to CA", "Add GSTIN Number"],
      component: <Screen36GstTaxInvoices />,
    },
    {
      num: 37,
      id: "S37",
      title: "Daily Settlement Ledger (Instant Bank Payouts)",
      category: "PAYOUTS & LEDGER",
      description: "Transaction-level payout ledger showing transparent instant direct-to-bank settlements.",
      keyButtons: ["Filter by Date", "View Bank Reference ID", "Download Daily Ledger"],
      component: <Screen37DailySettlementLedger />,
    },
    {
      num: 38,
      id: "S38",
      title: "Settlement Breakdown Modal",
      category: "PAYOUTS & LEDGER",
      description: "Itemized breakdown modal explaining gross order total, platform fee (₹0), and net payout.",
      keyButtons: ["Close Breakdown", "Download Payout Voucher", "Dispute Transaction"],
      component: <Screen38SettlementBreakdownModal />,
    },
    {
      num: 39,
      id: "S39",
      title: "Bank KYC & Penny Drop Verification",
      category: "BANKING & KYC",
      description: "Real NPCI IMPS ₹1 Penny Drop instant bank verification with masked account numbers.",
      keyButtons: ["Verify Bank via ₹1 Penny Drop", "Edit IFSC & Account No", "Save Bank Details"],
      component: <Screen39BankKycPennyDrop initialBeneficiary="Aman Sharma" initialIfsc="SBIN0000024" />,
    },
    {
      num: 40,
      id: "S40",
      title: "CA Payout Excel Downloader",
      category: "ACCOUNTING & AUDIT",
      description: "1-Click monthly financial Excel sheet generator formatted specifically for Chartered Accountants.",
      keyButtons: ["Download Excel (.xlsx)", "Send Direct to CA Email", "Select Month / Quarter"],
      component: <Screen40PayoutExcelDownloader />,
    },
    {
      num: 41,
      id: "S41",
      title: "2FA & Cashier PIN Security",
      category: "SECURITY & ACCESS",
      description: "Two-factor authentication setup and 4-digit Cashier PIN locks for counter terminals.",
      keyButtons: ["Enable 2FA Verification", "Change 4-Digit Cashier PIN", "Reset Manager Password"],
      component: <Screen41SecurityTwoFactor />,
    },
    {
      num: 42,
      id: "S42",
      title: "Multi-Outlet Branch Switcher",
      category: "ENTERPRISE & CHAINS",
      description: "Multi-branch switcher for merchants managing multiple outlets or chain stores from one login.",
      keyButtons: ["Switch Active Outlet", "+ Add New Outlet Branch", "Sync Global Catalog"],
      component: <Screen42MultiOutletSwitcher />,
    },
    {
      num: 43,
      id: "S43",
      title: "Staff Roles & Permissions Matrix",
      category: "STAFF & PERMISSIONS",
      description: "Role-based access matrix granting permissions to Cashier, Kitchen Cook, Delivery Manager, and Owner.",
      keyButtons: ["+ Invite Staff Member", "Save Role Permissions", "Revoke Device Access"],
      component: <Screen43StaffRolesMatrix ownerName="Aman Sharma" phone="+919118643415" />,
    },
    {
      num: 44,
      id: "S44",
      title: "Audit Sessions & Device Log",
      category: "SECURITY & ACCESS",
      description: "Security audit trail displaying all active logins, device models, IP addresses, and locations.",
      keyButtons: ["Log Out All Other Devices", "Refresh Session List", "Report Suspicious Login"],
      component: <Screen44AuditSessionsLog />,
    },
    {
      num: 45,
      id: "S45",
      title: "24x7 Operations Support Hub",
      category: "SUPPORT & HELPDESK",
      description: "Direct helpline hub with 1-tap call to Trustit local manager, WhatsApp support, and ticket desk.",
      keyButtons: ["Call Priority Helpline", "Open WhatsApp Chat", "Open Support Ticket", "Printer Setup"],
      component: <Screen45OperationsSupportHub />,
    },
    {
      num: 46,
      id: "S46",
      title: "Thermal Printer Wizard (USB / Bluetooth)",
      category: "HARDWARE SETUP",
      description: "Pairing wizard for 58mm / 80mm ESC/POS Bluetooth and USB kitchen thermal receipt printers.",
      keyButtons: ["Scan Bluetooth Printers", "Print Test Thermal Slip", "Toggle Auto-Print KOT"],
      component: <Screen46ThermalPrinterWizard />,
    },
    {
      num: 47,
      id: "S47",
      title: "Dispute Tickets & Helpdesk",
      category: "SUPPORT & HELPDESK",
      description: "Dispute resolution ticketing system for rider delays, customer cancellations, and payout inquiries.",
      keyButtons: ["Submit Support Ticket", "Upload Evidence Photo", "View Ticket Status"],
      component: <Screen47TicketDeskDisputes />,
    },
    {
      num: 48,
      id: "S48",
      title: "Offline Safe Mode Switch",
      category: "STORE CONFIGURATION",
      description: "Emergency offline safe mode enabling local cash-and-carry billing when internet connectivity is down.",
      keyButtons: ["Activate Offline Safe Mode", "Sync Local Queue", "Reconnect Cloud Sync"],
      component: <Screen48OfflineSafeMode />,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans print:bg-white print:text-black">
      {/* Non-Printable Floating Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shadow-xl print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
            T
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white tracking-wide uppercase">
                Trustit Merchant Partner Suite
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                48 SCREENS COMPLETE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Complete UI Blueprint • Screen 01 to Screen 48 • High-Resolution Print Ready
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/Trustit-Merchant-Partner-48-Screens.pdf"
            download
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
          >
            <span>📥</span>
            <span>Download Offline PDF</span>
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg transition active:scale-95"
          >
            <span>🖨️</span>
            <span>Print / Save as PDF (Ctrl + P)</span>
          </button>
        </div>
      </header>

      {/* Main Container with 48 Page Blocks */}
      <main className="max-w-5xl mx-auto py-8 px-4 sm:px-6 space-y-12 print:max-w-none print:p-0 print:m-0 print:space-y-0">
        {/* Cover Page */}
        <section className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-2xl print:border-none print:shadow-none print:p-8 print:break-after-page print:h-screen print:flex print:flex-col print:justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-600 to-orange-500 text-white mx-auto flex items-center justify-center font-black text-4xl shadow-2xl mb-6">
            T
          </div>
          <span className="text-xs font-black tracking-widest uppercase text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3.5 py-1 rounded-full">
            Official Production UI Specifications
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white mt-4 tracking-tight print:text-black">
            Trustit Merchant Partner Suite
          </h1>
          <p className="text-base text-slate-300 mt-2 max-w-xl mx-auto print:text-slate-700">
            Complete Architectural Blueprint &amp; Interface Manual of All 48 Modular Screens for Hyperlocal Retail, Kirana, Restaurants, Chemists, and Salons.
          </p>

          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto text-left">
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 print:bg-slate-100 print:border-slate-300">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Screens</span>
              <span className="text-lg font-black text-white print:text-black">48 Screens</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 print:bg-slate-100 print:border-slate-300">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Package ID</span>
              <span className="text-xs font-mono font-bold text-amber-300 print:text-amber-700 block truncate">com.trustit.partner</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 print:bg-slate-100 print:border-slate-300">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Live Backend</span>
              <span className="text-lg font-black text-emerald-400 print:text-emerald-700">100% Real API</span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 print:bg-slate-100 print:border-slate-300">
              <span className="text-[10px] text-slate-400 font-bold block uppercase">Build Status</span>
              <span className="text-lg font-black text-blue-400 print:text-blue-700">Signed v2.2.0</span>
            </div>
          </div>
        </section>

        {/* 48 Consecutive Screens */}
        {screens.map((screen) => (
          <section
            key={screen.id}
            id={`screen-${screen.num}`}
            className="bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl print:border-none print:shadow-none print:p-6 print:break-after-page print:h-screen print:flex print:flex-col print:justify-between"
          >
            {/* Screen Header Info Banner */}
            <div className="border-b border-slate-800 pb-4 mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 print:border-slate-300">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-blue-600 text-white font-mono text-xs font-black">
                    PAGE {screen.num} / 48
                  </span>
                  <span className="text-xs font-black text-amber-400 uppercase tracking-wider print:text-amber-800">
                    {screen.category}
                  </span>
                </div>
                <h2 className="text-lg font-black text-white mt-1 print:text-black">
                  {screen.id}: {screen.title}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5 max-w-2xl print:text-slate-600">
                  {screen.description}
                </p>
              </div>

              {/* Key Buttons Pill Badges */}
              <div className="flex flex-wrap gap-1.5 max-w-sm sm:justify-end">
                {screen.keyButtons.map((btn, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 print:bg-slate-100 print:text-slate-800 print:border-slate-300"
                  >
                    🔘 {btn}
                  </span>
                ))}
              </div>
            </div>

            {/* Mobile Phone Mockup Container displaying live Screen */}
            <div className="flex justify-center items-center flex-1 py-2">
              <div className="w-full max-w-[380px] h-[640px] bg-white rounded-3xl border-4 border-slate-700 shadow-2xl overflow-hidden flex flex-col relative print:border-2 print:border-slate-400 print:shadow-none">
                {/* Simulated Phone Top Status Bar */}
                <div className="bg-slate-900 text-white px-4 py-1.5 flex items-center justify-between text-[10px] font-bold shrink-0 select-none">
                  <span>9:41 AM</span>
                  <div className="flex items-center gap-1.5 text-[9px]">
                    <span>5G</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Rendered Component Viewport */}
                <div className="flex-1 overflow-y-auto bg-[#F8FAFC] select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {screen.component}
                </div>
              </div>
            </div>

            {/* Screen Page Footer */}
            <div className="border-t border-slate-800 pt-3 mt-4 flex items-center justify-between text-[10px] text-slate-500 font-mono print:border-slate-200">
              <span>Trustit Merchant Partner Suite v2.2.0 • Screen ID: {screen.id}</span>
              <span>CONFIDENTIAL • BAHRAICH HYPERLOCAL ENGINE</span>
              <span>Page {screen.num} of 48</span>
            </div>
          </section>
        ))}
      </main>

      {/* Global Print Style Injection */}
      <style jsx global>{`
        @media print {
          body {
            background-color: #ffffff !important;
            color: #000000 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>
    </div>
  );
}
