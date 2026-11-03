"use client";

import React, { useState } from "react";
import Link from "next/link";

// ==========================================
// ALL MODULAR INTERACTIVE SCREENS (68 SCREENS)
// ==========================================

// ONBOARDING & AUTHENTICATION SCREENS (4 SCREENS)
import ScreenAuth01LandingBecomePartner from "@/app/merchant/components/screens/ScreenAuth01LandingBecomePartner";
import ScreenAuth02BusinessCategoryWizard from "@/app/merchant/components/screens/ScreenAuth02BusinessCategoryWizard";
import ScreenAuth03MobileKycRegistration from "@/app/merchant/components/screens/ScreenAuth03MobileKycRegistration";
import ScreenAuth04PartnerLogin from "@/app/merchant/components/screens/ScreenAuth04PartnerLogin";

// INDUSTRY SPECIALIZED SCREENS: KIRANA MART (4 SCREENS)
import ScreenK01KiranaCockpit from "@/app/merchant/components/screens/ScreenK01KiranaCockpit";
import ScreenK02ParchaOrderViewer from "@/app/merchant/components/screens/ScreenK02ParchaOrderViewer";
import ScreenK03KiranaMasterRates from "@/app/merchant/components/screens/ScreenK03KiranaMasterRates";
import ScreenK04KiranaReviewStandee from "@/app/merchant/components/screens/ScreenK04KiranaReviewStandee";

// INDUSTRY SPECIALIZED SCREENS: MEDICAL / CHEMIST (4 SCREENS)
import ScreenM01ChemistCockpit from "@/app/merchant/components/screens/ScreenM01ChemistCockpit";
import ScreenM02PrescriptionRxViewer from "@/app/merchant/components/screens/ScreenM02PrescriptionRxViewer";
import ScreenM03ChemistMedicineCatalog from "@/app/merchant/components/screens/ScreenM03ChemistMedicineCatalog";
import ScreenM04ChemistReviewStandee from "@/app/merchant/components/screens/ScreenM04ChemistReviewStandee";

// INDUSTRY SPECIALIZED SCREENS: SALON & SPA (4 SCREENS)
import ScreenS01SalonCockpit from "@/app/merchant/components/screens/ScreenS01SalonCockpit";
import ScreenS02LiveChairTokenQueue from "@/app/merchant/components/screens/ScreenS02LiveChairTokenQueue";
import ScreenS03SalonServicesRateCard from "@/app/merchant/components/screens/ScreenS03SalonServicesRateCard";
import ScreenS04SalonMirrorReviewStandee from "@/app/merchant/components/screens/ScreenS04SalonMirrorReviewStandee";

// INDUSTRY SPECIALIZED SCREENS: CAR WASH & GARAGE (4 SCREENS)
import ScreenC01CarWashCockpit from "@/app/merchant/components/screens/ScreenC01CarWashCockpit";
import ScreenC02WashingBayQueue from "@/app/merchant/components/screens/ScreenC02WashingBayQueue";
import ScreenC03VehicleTypePackages from "@/app/merchant/components/screens/ScreenC03VehicleTypePackages";
import ScreenC04CarWashReviewStandee from "@/app/merchant/components/screens/ScreenC04CarWashReviewStandee";

// RESTAURANT & CAFE / GENERAL CORE (48 SCREENS)
import Screen01MainCockpit from "@/app/merchant/components/screens/Screen01MainCockpit";
import Screen02IncomingOrderSiren from "@/app/merchant/components/screens/Screen02IncomingOrderSiren";
import Screen03UrgentQueueDrawer from "@/app/merchant/components/screens/Screen03UrgentQueueDrawer";
import Screen04OccasionDailyPulse from "@/app/merchant/components/screens/Screen04OccasionDailyPulse";
import Screen05StoreBrandProfile from "@/app/merchant/components/screens/Screen05StoreBrandProfile";
import Screen06GpsGeofence from "@/app/merchant/components/screens/Screen06GpsGeofence";
import Screen07GoogleReviewGating from "@/app/merchant/components/screens/Screen07GoogleReviewGating";
import Screen08OperatingHours from "@/app/merchant/components/screens/Screen08OperatingHours";
import Screen09OrdersMasterBoard from "@/app/merchant/components/screens/Screen09OrdersMasterBoard";
import Screen10OrderDetailDrawer from "@/app/merchant/components/screens/Screen10OrderDetailDrawer";
import Screen11KotThermalReceipt from "@/app/merchant/components/screens/Screen11KotThermalReceipt";
import Screen12RiderDispatchModal from "@/app/merchant/components/screens/Screen12RiderDispatchModal";
import Screen13MenuExplorer from "@/app/merchant/components/screens/Screen13MenuExplorer";
import Screen14AddProductModal from "@/app/merchant/components/screens/Screen14AddProductModal";
import Screen15OutOfStockSwitcher from "@/app/merchant/components/screens/Screen15OutOfStockSwitcher";
import Screen16CategoryMasterPreset from "@/app/merchant/components/screens/Screen16CategoryMasterPreset";
import Screen17VectorQrDownload from "@/app/merchant/components/screens/Screen17VectorQrDownload";
import Screen18StandeeTemplateGallery from "@/app/merchant/components/screens/Screen18StandeeTemplateGallery";
import Screen19CustomerReviewsFeed from "@/app/merchant/components/screens/Screen19CustomerReviewsFeed";
import Screen20ReviewReplyModal from "@/app/merchant/components/screens/Screen20ReviewReplyModal";
import Screen21MerchandiseCatalog from "@/app/merchant/components/screens/Screen21MerchandiseCatalog";
import Screen22MockupCustomizer from "@/app/merchant/components/screens/Screen22MockupCustomizer";
import Screen23CartCheckout from "@/app/merchant/components/screens/Screen23CartCheckout";
import Screen24OrderTrackingWaybill from "@/app/merchant/components/screens/Screen24OrderTrackingWaybill";
import Screen25OccasionsCrmBoard from "@/app/merchant/components/screens/Screen25OccasionsCrmBoard";
import Screen26AiPosterCreator from "@/app/merchant/components/screens/Screen26AiPosterCreator";
import Screen27WhatsAppComposer from "@/app/merchant/components/screens/Screen27WhatsAppComposer";
import Screen28ConnectWalletRecharge from "@/app/merchant/components/screens/Screen28ConnectWalletRecharge";
import Screen29ScanFootfallTrends from "@/app/merchant/components/screens/Screen29ScanFootfallTrends";
import Screen30HourlyRushHeatmap from "@/app/merchant/components/screens/Screen30HourlyRushHeatmap";
import Screen31CustomerSentimentTags from "@/app/merchant/components/screens/Screen31CustomerSentimentTags";
import Screen32ReportsDataExporter from "@/app/merchant/components/screens/Screen32ReportsDataExporter";
import Screen33PlanStatusCockpit from "@/app/merchant/components/screens/Screen33PlanStatusCockpit";
import Screen34ThreeTierMatrix from "@/app/merchant/components/screens/Screen34ThreeTierMatrix";
import Screen35SubscriptionAutoPay from "@/app/merchant/components/screens/Screen35SubscriptionAutoPay";
import Screen36GstTaxInvoices from "@/app/merchant/components/screens/Screen36GstTaxInvoices";
import Screen37DailySettlementLedger from "@/app/merchant/components/screens/Screen37DailySettlementLedger";
import Screen38SettlementBreakdownModal from "@/app/merchant/components/screens/Screen38SettlementBreakdownModal";
import Screen39BankKycPennyDrop from "@/app/merchant/components/screens/Screen39BankKycPennyDrop";
import Screen40PayoutExcelDownloader from "@/app/merchant/components/screens/Screen40PayoutExcelDownloader";
import Screen41SecurityTwoFactor from "@/app/merchant/components/screens/Screen41SecurityTwoFactor";
import Screen42MultiOutletSwitcher from "@/app/merchant/components/screens/Screen42MultiOutletSwitcher";
import Screen43StaffRolesMatrix from "@/app/merchant/components/screens/Screen43StaffRolesMatrix";
import Screen44AuditSessionsLog from "@/app/merchant/components/screens/Screen44AuditSessionsLog";
import Screen45OperationsSupportHub from "@/app/merchant/components/screens/Screen45OperationsSupportHub";
import Screen46ThermalPrinterWizard from "@/app/merchant/components/screens/Screen46ThermalPrinterWizard";
import Screen47TicketDeskDisputes from "@/app/merchant/components/screens/Screen47TicketDeskDisputes";
import Screen48OfflineSafeMode from "@/app/merchant/components/screens/Screen48OfflineSafeMode";
import UniversalUpgradeModal from "@/app/merchant/components/UniversalUpgradeModal";

export default function MerchantPreviewGalleryPage() {
  const [selectedScreenId, setSelectedScreenId] = useState<string>("auth_01"); // Default to Become a Partner Landing!
  const [viewMode, setViewMode] = useState<"interactive" | "gallery">("interactive");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [deviceFrame, setDeviceFrame] = useState<"mobile" | "tablet">("mobile");
  const [isTestUpgradeOpen, setIsTestUpgradeOpen] = useState<boolean>(false);

  const allScreens = [
    // GROUP 0: ONBOARDING & AUTH FLOW
    {
      id: "auth_01",
      num: "A01",
      title: "Become a Trustit Partner — Landing & Pitch",
      category: "auth",
      description: "Public registration landing page with 0% commission pitch, free standee promo, 42k customer reach, and partner benefits.",
      highlights: ["0% commission in-store QR pitch", "4-Pillars merchant benefits card", "Register My Shop (Free) CTA", "Already Registered? Login Partner link"],
      component: (
        <ScreenAuth01LandingBecomePartner
          onStartRegistration={() => setSelectedScreenId("auth_02")}
          onGoToLogin={() => setSelectedScreenId("auth_04")}
        />
      ),
    },
    {
      id: "auth_02",
      num: "A02",
      title: "Business Category Selection Wizard",
      category: "auth",
      description: "Step 1 of 3: Merchant selects their exact business vertical (Kirana Mart, Medical Store, Salon, Car Wash, or Cafe).",
      highlights: ["Kirana Mart (Parcha & Weight Scale)", "Medical Pharmacy (Rx Prescriptions)", "Salon & Spa (Live Chairs & Tokens)", "Car Wash (Bays & Vehicle Rates)", "Restaurant (KOT & Dining Tables)"],
      component: (
        <ScreenAuth02BusinessCategoryWizard
          onBack={() => setSelectedScreenId("auth_01")}
          onSelectCategory={(cat) => {
            if (cat === "kirana") setSelectedScreenId("kirana_01");
            else if (cat === "chemist") setSelectedScreenId("chemist_01");
            else if (cat === "salon") setSelectedScreenId("salon_01");
            else if (cat === "carwash") setSelectedScreenId("carwash_01");
            else setSelectedScreenId("auth_03");
          }}
        />
      ),
    },
    {
      id: "auth_03",
      num: "A03",
      title: "Store KYC & WhatsApp OTP Verification",
      category: "auth",
      description: "Step 2 of 3: Official shop name, proprietor name, GPS location detection, and 6-box WhatsApp OTP verification.",
      highlights: ["Shop & owner name inputs", "6-box auto-detected OTP simulator", "One-click GPS location detection", "Direct route to custom console"],
      component: (
        <ScreenAuth03MobileKycRegistration
          category="kirana"
          onBack={() => setSelectedScreenId("auth_02")}
          onRegisterComplete={() => setSelectedScreenId("kirana_01")}
        />
      ),
    },
    {
      id: "auth_04",
      num: "A04",
      title: "Partner Login — Already Registered Portal",
      category: "auth",
      description: "Sign-in portal for registered partners with dual tab: Mobile Number (SMS/WhatsApp OTP) or Business ID + Master Password.",
      highlights: ["Mobile OTP vs Business ID dual tab", "Demo merchant credentials tip", "24x7 Help desk hotline shortcut", "New Merchant? Register Shop link"],
      component: (
        <ScreenAuth04PartnerLogin
          onLoginSuccess={() => setSelectedScreenId("s01")}
          onGoToRegister={() => setSelectedScreenId("auth_01")}
        />
      ),
    },

    // GROUP 1: KIRANA MART & GROCERY MART FLOW (4 SCREENS)
    {
      id: "kirana_01",
      num: "K01",
      title: "Kirana Mart Cockpit & Parcha Pipeline",
      category: "kirana",
      description: "Tailored for grocery marts: Live Parcha count, grain sack inventory status, mandi daily rates, and store open/close switch.",
      highlights: ["Handwritten Parcha order pipeline", "Dukaan Khuli / Band fast toggle", "Critical grain stock alerts (Atta, Dal, Oil)", "Mandi price sync indicator"],
      component: (
        <ScreenK01KiranaCockpit
          onOpenParcha={() => setSelectedScreenId("kirana_02")}
          onOpenRates={() => setSelectedScreenId("kirana_03")}
          onOpenStandee={() => setSelectedScreenId("kirana_04")}
          onBack={() => setSelectedScreenId("auth_02")}
        />
      ),
    },
    {
      id: "kirana_02",
      num: "K02",
      title: "Handwritten Parcha (List Photo) Inspector",
      category: "kirana",
      description: "Customer uploads photo of handwritten grocery list. Merchant views high-res photo, ticks weighed items, and sends payment link.",
      highlights: ["Parcha photo zoom simulator", "Digital weight & price tick-off (Atta, Dal, Oil)", "Dynamic grocery total calculator", "Pack in bag & send payment link"],
      component: (
        <ScreenK02ParchaOrderViewer
          onBack={() => setSelectedScreenId("kirana_01")}
          onConfirmBill={() => setSelectedScreenId("kirana_01")}
        />
      ),
    },
    {
      id: "kirana_03",
      num: "K03",
      title: "Kirana Mandi Price Master (Per Kg/Ltr)",
      category: "kirana",
      description: "Master price list for loose commodities (Atta, Sugar, Mustard Oil, Basmati Rice) with mandi daily market price updates.",
      highlights: ["Per Kg / Per Litre commodity rates", "Bahraich Galla Mandi market trends", "Inline price editor", "Auto-updates customer parcha bill calculation"],
      component: (
        <ScreenK03KiranaMasterRates
          onBack={() => setSelectedScreenId("kirana_01")}
          onSave={() => setSelectedScreenId("kirana_01")}
        />
      ),
    },
    {
      id: "kirana_04",
      num: "K04",
      title: "Kirana Counter QR Standee & Google Review",
      category: "kirana",
      description: "Specialized Kirana Standee: 'Shuddh Samagri & Sahi Daam — Scan for UPI Bill & Google Review' with electronic scale placement guide.",
      highlights: ["A5 Acrylic Standee mockup for Kirana", "Galla Mandi counter branding", "'Shuddh Samagri & Sahi Daam' tagline", "Electronic weighing scale placement tips"],
      component: (
        <ScreenK04KiranaReviewStandee
          onBack={() => setSelectedScreenId("kirana_01")}
          onDownloadStandee={() => alert("Kirana Counter Standee PDF downloaded!")}
        />
      ),
    },

    // GROUP 2: MEDICAL STORE & CHEMIST FLOW (4 SCREENS)
    {
      id: "chemist_01",
      num: "M01",
      title: "Chemist & Pharmacy Control Cockpit",
      category: "chemist",
      description: "Tailored for pharmacies: Prescription Rx queue, Drug License (DL) status, insulin cold-chain temperature tracker, and store toggle.",
      highlights: ["Prescription Rx order pipeline", "Registered Pharmacist DL badge", "Cold-storage vaccine fridge sensor (4.2°C)", "Quick prescription inspection CTA"],
      component: (
        <ScreenM01ChemistCockpit
          onOpenRx={() => setSelectedScreenId("chemist_02")}
          onOpenMedicines={() => setSelectedScreenId("chemist_03")}
          onOpenStandee={() => setSelectedScreenId("chemist_04")}
          onBack={() => setSelectedScreenId("auth_02")}
        />
      ),
    },
    {
      id: "chemist_02",
      num: "M02",
      title: "Doctor's Prescription (Rx) Verification",
      category: "chemist",
      description: "Doctor handwritten prescription inspector with high-res slip view, dosage checking, batch expiry review, and pharmacist sign-off.",
      highlights: ["Doctor prescription slip viewer (Reg: MCI-40912)", "Medicine dosage recognition (BD, OD, SOS)", "Batch & expiry date verification", "Pharmacist digital sign-off and dispatch approval"],
      component: (
        <ScreenM02PrescriptionRxViewer
          onBack={() => setSelectedScreenId("chemist_01")}
          onApproveRx={() => setSelectedScreenId("chemist_01")}
        />
      ),
    },
    {
      id: "chemist_03",
      num: "M03",
      title: "Chemist Medicine Salt & Drug Master",
      category: "chemist",
      description: "Medicine catalog searchable by brand name or chemical salt composition with strip pricing and manufacturer info.",
      highlights: ["Brand (e.g. Dolo) & Salt (e.g. Paracetamol) search", "Manufacturer details (GSK, Alkem, Sun Pharma)", "Strip pricing & available stock", "Expiry date monitor"],
      component: (
        <ScreenM03ChemistMedicineCatalog
          onBack={() => setSelectedScreenId("chemist_01")}
          onAddMedicine={() => alert("Opening Barcode Medicine Scanner")}
        />
      ),
    },
    {
      id: "chemist_04",
      num: "M04",
      title: "Chemist Counter Standee & Review QR",
      category: "chemist",
      description: "Pharmacy Counter Standee: '100% Genuine Medicines Verified by Registered Pharmacist' with Hospital Road placement guide.",
      highlights: ["Medical grade acrylic standee mockup", "Drug license UP-40-20B-8819 display", "'100% Genuine Medicines' authentic trust seal", "Medicine dispensing glass counter placement guide"],
      component: (
        <ScreenM04ChemistReviewStandee
          onBack={() => setSelectedScreenId("chemist_01")}
          onDownloadStandee={() => alert("Pharmacy Counter Standee PDF downloaded!")}
        />
      ),
    },

    // GROUP 3: SALON, BARBER & BEAUTY SPA FLOW (4 SCREENS)
    {
      id: "salon_01",
      num: "S_S01",
      title: "Salon Styling & Token Station Cockpit",
      category: "salon",
      description: "Tailored for unisex salons & spas: Occupied chairs, lounge waiting tokens, beautician assignments, and daily client counter.",
      highlights: ["Live Chair queue (4 Busy, 2 Waiting)", "Haircut, Beard & Spa status", "Lounge token bell call", "Mirror review incentive banner"],
      component: (
        <ScreenS01SalonCockpit
          onOpenQueue={() => setSelectedScreenId("salon_02")}
          onOpenServices={() => setSelectedScreenId("salon_03")}
          onOpenStandee={() => setSelectedScreenId("salon_04")}
          onBack={() => setSelectedScreenId("auth_02")}
        />
      ),
    },
    {
      id: "salon_02",
      num: "S_S02",
      title: "Live Salon Chair & Lounge Token Queue",
      category: "salon",
      description: "Live chair management (Chair 1: Fade Cut by Rohit, Chair 2: Beard Grooming by Dinesh) and Token #14 lounge chime bell call.",
      highlights: ["Individual chair technician assignments", "Service timer countdowns", "Waiting lounge token list with estimated wait", "One-click 'Call Next Token' audio chime bell"],
      component: (
        <ScreenS02LiveChairTokenQueue
          onBack={() => setSelectedScreenId("salon_01")}
          onCallNext={() => setSelectedScreenId("salon_01")}
        />
      ),
    },
    {
      id: "salon_03",
      num: "S_S03",
      title: "Salon Grooming Rate Card & Packages",
      category: "salon",
      description: "Service menu for Men, Women, and Unisex: Executive Haircut, Hot Towel Shave, Charcoal D-Tan, Hair Spa, and Bridal Makeup.",
      highlights: ["Service duration time (Mins)", "Gender tags (Men, Women, Unisex)", "Hot bestseller service badges", "+ Add New Grooming Service button"],
      component: (
        <ScreenS03SalonServicesRateCard
          onBack={() => setSelectedScreenId("salon_01")}
          onAddService={() => alert("Opening Add Service Modal")}
        />
      ),
    },
    {
      id: "salon_04",
      num: "S_S04",
      title: "Salon Mirror Decal & Reception QR Standee",
      category: "salon",
      description: "Mirror Sticker & Reception Standee: 'Loved Your New Look? Scan mirror QR for 5★ Google Review & get ₹50 off next haircut!'",
      highlights: ["Mirror decal & counter standee mockup", "'Loved Your New Look?' styling tagline", "₹50 discount coupon incentive for Google review", "Haircut mirror eye-level placement guide"],
      component: (
        <ScreenS04SalonMirrorReviewStandee
          onBack={() => setSelectedScreenId("salon_01")}
          onDownloadStandee={() => alert("Salon Mirror Decal PDF downloaded!")}
        />
      ),
    },

    // GROUP 4: CAR WASH & AUTOMOBILE DETAILING FLOW (4 SCREENS)
    {
      id: "carwash_01",
      num: "C01",
      title: "Car Wash Bay Command Cockpit",
      category: "carwash",
      description: "Tailored for automobile detailing centers: Active washing bays (Bay 1, 2, 3), lot vehicle queue, and foam gun pressure sensor.",
      highlights: ["Active washing bay statuses (Foam, Vacuum, Lube)", "Vehicles waiting in parking lot", "High-pressure foam gun 180 bar sensor", "Daily washed rides revenue counter"],
      component: (
        <ScreenC01CarWashCockpit
          onOpenBays={() => setSelectedScreenId("carwash_02")}
          onOpenPackages={() => setSelectedScreenId("carwash_03")}
          onOpenStandee={() => setSelectedScreenId("carwash_04")}
          onBack={() => setSelectedScreenId("auth_02")}
        />
      ),
    },
    {
      id: "carwash_02",
      num: "C02",
      title: "Washing Bay Job Cards & Queue",
      category: "carwash",
      description: "Bay allocation: Bay 1 (Foam wash for i20), Bay 2 (Interior vacuum for Creta), Bay 3 (Bike wash) and quality inspection checklist.",
      highlights: ["Vehicle number plate & model tracker", "Technician assignments", "Quality inspection gate (Tire shine, windshield wipe)", "Pass inspection & customer handover trigger"],
      component: (
        <ScreenC02WashingBayQueue
          onBack={() => setSelectedScreenId("carwash_01")}
          onCompleteWash={() => setSelectedScreenId("carwash_01")}
        />
      ),
    },
    {
      id: "carwash_03",
      num: "C03",
      title: "Vehicle Type Wash Packages Rate Matrix",
      category: "carwash",
      description: "Price matrix categorized by car size: Hatchback (₹249), Sedan (₹349), Compact SUV (₹449), Full SUV (₹599), and Two-Wheelers.",
      highlights: ["Hatchback vs Sedan vs SUV pricing", "Foam wash vs Deep Detailing rates", "Underbody wash inclusion tags", "+ Add Ceramic Coating package button"],
      component: (
        <ScreenC03VehicleTypePackages
          onBack={() => setSelectedScreenId("carwash_01")}
          onAddPackage={() => alert("Opening Add Detailing Package Modal")}
        />
      ),
    },
    {
      id: "carwash_04",
      num: "C04",
      title: "Car Wash Lounge Standee & Bay QR",
      category: "carwash",
      description: "Customer Lounge Standee: 'Car Shining Like New? Scan for UPI Bill & get ₹100 off next foam wash on Google Review!'",
      highlights: ["Waiting lounge table acrylic standee mockup", "'Car Shining Like New?' garage tagline", "₹100 discount coupon for Google review", "AC customer lounge placement guide"],
      component: (
        <ScreenC04CarWashReviewStandee
          onBack={() => setSelectedScreenId("carwash_01")}
          onDownloadStandee={() => alert("Car Wash Lounge Standee PDF downloaded!")}
        />
      ),
    },

    // GROUP 5: RESTAURANT & CAFE CONSOLE (Screens S01 to S48)
    {
      id: "s01",
      num: "S01",
      title: "Main Business Cockpit & Quick Toggles",
      category: "restaurant",
      description: "Mission-control dashboard with store open/pause switches, 4s auto-sync order pipeline, and occasion CRM.",
      highlights: ["Outlet OPEN/CLOSED live toggle", "Orders PAUSED throttle for kitchen rush", "Auto-sync 4s live order pipeline", "Today's occasion & credit wallet card"],
      component: (
        <Screen01MainCockpit
          onOpenOrders={() => setSelectedScreenId("s09")}
          onOpenMenu={() => setSelectedScreenId("s13")}
          onOpenSiren={() => setSelectedScreenId("s02")}
          onOpenOccasion={() => setSelectedScreenId("s04")}
        />
      ),
    },
    {
      id: "s02",
      num: "S02",
      title: "Live Order Alert & Siren Modal",
      category: "restaurant",
      description: "High-attention flashing emergency alert with audio chime toggle, itemized bill, online payment verification, and prep duration.",
      highlights: ["Attentive crimson/rose alert design (No black dullness)", "Emergency siren chime with audio toggle", "15m / 25m / 40m prep time selection", "Cashfree UPI online payment badge"],
      component: (
        <Screen02IncomingOrderSiren
          onAccept={() => setSelectedScreenId("s09")}
          onDecline={() => setSelectedScreenId("s01")}
          onBack={() => setSelectedScreenId("s01")}
        />
      ),
    },
    {
      id: "s03",
      num: "S03",
      title: "Urgent Orders Bottom Queue Drawer",
      category: "restaurant",
      description: "Slide-up persistent tray for pending orders needing fast acceptance before 3-minute auto-cancellation.",
      highlights: ["High-visibility alert styling", "3-minute auto-cancel countdown timers", "Civil Lines & KDC Road customer addresses", "Quick accept without opening modal"],
      component: (
        <Screen03UrgentQueueDrawer
          onAcceptOrder={() => setSelectedScreenId("s09")}
          onOpenSiren={() => setSelectedScreenId("s02")}
          onBack={() => setSelectedScreenId("s01")}
        />
      ),
    },
    {
      id: "s04",
      num: "S04",
      title: "Occasions & Daily Wish Pulse",
      category: "restaurant",
      description: "Automated morning customer wish desk sending WhatsApp birthday coupons with cafe branding at 09:30 AM.",
      highlights: ["Customer birthdays & wedding anniversary list", "Special coupon code generator (e.g. BDAY-RAHUL)", "100 Connect Credits wallet & top-up", "09:30 AM automated dispatch scheduler"],
      component: (
        <Screen04OccasionDailyPulse
          onBack={() => setSelectedScreenId("s01")}
          onTopup={() => setSelectedScreenId("s28")}
        />
      ),
    },
    {
      id: "s05",
      num: "S05",
      title: "Store Branding & Official Credentials",
      category: "restaurant",
      description: "Store name, official logo uploader, owner name, category, and OTP-verified registered contact number.",
      highlights: ["Logo uploader with circular preview", "Store name & business category fields", "Owner proprietor name", "Verified mobile with security badge"],
      component: (
        <Screen05StoreBrandProfile
          onBack={() => setSelectedScreenId("s01")}
          onSave={() => setSelectedScreenId("s06")}
        />
      ),
    },
    {
      id: "s06",
      num: "S06",
      title: "GPS Location Pin & Geofence Radius",
      category: "restaurant",
      description: "Map pin selector, street address, locality, landmark, and 1-12 km delivery geofence radius slider.",
      highlights: ["Interactive GPS coordinate tracker", "One-click 'Re-Detect GPS' button", "1.0 km to 12.0 km delivery boundary slider", "Bahraich 42,000 household coverage radius"],
      component: (
        <Screen06GpsGeofence
          onBack={() => setSelectedScreenId("s05")}
          onSave={() => setSelectedScreenId("s07")}
        />
      ),
    },
    {
      id: "s07",
      num: "S07",
      title: "Google Business & Smart Review Gating",
      category: "restaurant",
      description: "Smart review routing shield: pushes 4-5 star reviews to Google Maps while catching 1-3 star feedback privately.",
      highlights: ["Google Place ID & Verified Maps link", "Direct customer review shortlink", "Smart-Gating shield toggle", "Interactive 1★ to 5★ routing simulator"],
      component: (
        <Screen07GoogleReviewGating
          onBack={() => setSelectedScreenId("s06")}
          onSave={() => setSelectedScreenId("s08")}
        />
      ),
    },
    {
      id: "s08",
      num: "S08",
      title: "Operating Hours & Split Shifts",
      category: "restaurant",
      description: "Weekly opening/closing hours, afternoon kitchen pause for staff rest, and festival holiday mode toggle.",
      highlights: ["Mon-Sun operating schedule matrix", "Afternoon 3:30 - 4:30 PM kitchen break pause", "Festival holiday mode emergency closure switch", "Auto-reopen scheduled timing"],
      component: (
        <Screen08OperatingHours
          onBack={() => setSelectedScreenId("s07")}
          onSave={() => setSelectedScreenId("s01")}
        />
      ),
    },
    {
      id: "s09",
      num: "S09",
      title: "Live Orders Master Command Board",
      category: "restaurant",
      description: "Order pipeline command board with 5 date filters (Today, Yesterday, Week, Month) and kitchen status tabs.",
      highlights: ["Today, Yesterday, Week, Month filter tabs", "Placed, In Prep, Food Ready status filters", "Print KOT slip action button", "Rider dispatch and inspection shortcuts"],
      component: (
        <Screen09OrdersMasterBoard
          onInspectOrder={() => setSelectedScreenId("s10")}
          onPrintKot={() => setSelectedScreenId("s11")}
          onDispatchRider={() => setSelectedScreenId("s12")}
          onBack={() => setSelectedScreenId("s01")}
        />
      ),
    },
    {
      id: "s10",
      num: "S10",
      title: "Order Itemized Inspection Drawer",
      category: "restaurant",
      description: "Complete itemized bill sheet with customer phone, delivery address, cooking notes, and tax breakdown.",
      highlights: ["Customer direct phone call button", "Kitchen preparation instruction note", "Itemized add-ons (Hazelnut Frappe, Paneer Sandwich)", "Discount, packaging & Cashfree UPI paid breakdown"],
      component: (
        <Screen10OrderDetailDrawer
          onBack={() => setSelectedScreenId("s09")}
          onPrintKot={() => setSelectedScreenId("s11")}
          onDispatchRider={() => setSelectedScreenId("s12")}
        />
      ),
    },
    {
      id: "s11",
      num: "S11",
      title: "58mm / 80mm KOT Thermal Receipt Preview",
      category: "restaurant",
      description: "Hardware print simulation for 58mm and 80mm ESC/POS thermal receipt printers with kitchen instructions.",
      highlights: ["80mm standard vs 58mm compact roll toggle", "Monospaced high-contrast kitchen ticket layout", "Bold item quantities and table/delivery badge", "Web print trigger (CSS @media print)"],
      component: (
        <Screen11KotThermalReceipt onBack={() => setSelectedScreenId("s09")} />
      ),
    },
    {
      id: "s12",
      num: "S12",
      title: "Rider Fleet Dispatch & Tracking Modal",
      category: "restaurant",
      description: "Dispatch selector between Trustit Fleet riders (with ETA and bike details) and in-house staff delivery.",
      highlights: ["Trustit Fleet vs In-House self-delivery toggle", "Rider card with vehicle number & 4.9★ rating", "4-digit food handover verification OTP", "Live ETA tracking (3 mins to arrival)"],
      component: (
        <Screen12RiderDispatchModal
          onBack={() => setSelectedScreenId("s09")}
          onConfirmDispatch={() => setSelectedScreenId("s09")}
        />
      ),
    },
    {
      id: "s13",
      num: "S13",
      title: "Menu Explorer & Category Filter Bar",
      category: "restaurant",
      description: "Interactive catalog manager with category pills, Veg/Non-Veg badges, search bar, and instant stock counters.",
      highlights: ["Category selector pills (Beverages, Snacks, Combos)", "Veg / Non-Veg / Egg filter chips", "Search item by keyword", "+ Add New Item button"],
      component: (
        <Screen13MenuExplorer
          onAddProduct={() => setSelectedScreenId("s14")}
          onStockToggle={() => setSelectedScreenId("s15")}
          onBack={() => setSelectedScreenId("s01")}
        />
      ),
    },
    {
      id: "s14",
      num: "S14",
      title: "Add / Edit Product Modal",
      category: "restaurant",
      description: "Modal to add or edit item title, selling price, MRP strike-off, image upload, food category, and prep time.",
      highlights: ["Item image uploader", "Selling Price & MRP fields", "Veg/Non-Veg radio selector", "Kitchen prep time (mins)"],
      component: (
        <Screen14AddProductModal
          onBack={() => setSelectedScreenId("s13")}
          onSave={() => setSelectedScreenId("s13")}
        />
      ),
    },
    {
      id: "s15",
      num: "S15",
      title: "Instant Out-of-Stock Switcher (86-List)",
      category: "restaurant",
      description: "Rapid single-tap stock toggler to immediately disable dishes when kitchen ingredients run out.",
      highlights: ["Bulk stock manager", "One-tap disable item", "Auto-reenable next morning", "Inventory status alert"],
      component: (
        <Screen15OutOfStockSwitcher onBack={() => setSelectedScreenId("s13")} />
      ),
    },
    {
      id: "s16",
      num: "S16",
      title: "Category Master & Industry Preset Seeder",
      category: "restaurant",
      description: "Add, reorder, or seed full menu templates for Cafes, Salons, Kirana Grocery, and Automobile Garages.",
      highlights: ["1-Click Cafe Starter Kit", "Salon & Parlour service templates", "Kirana grocery catalog seeder", "Drag and drop category priority"],
      component: (
        <Screen16CategoryMasterPreset
          onBack={() => setSelectedScreenId("s13")}
          onSeeded={() => setSelectedScreenId("s13")}
        />
      ),
    },
    {
      id: "s17",
      num: "S17",
      title: "Vector QR Generator & Print Download",
      category: "restaurant",
      description: "Dynamic QR code with central cafe logo, SVG vector export, high-res PNG, and A4/A5 print PDF.",
      highlights: ["High-res SVG / PNG download", "Print-Ready Vector PDF (A4/A5)", "Custom brand logo watermark", "Copy scan shortlink"],
      component: (
        <Screen17VectorQrDownload
          onBack={() => setSelectedScreenId("s01")}
          onCustomizeStandee={() => setSelectedScreenId("s18")}
        />
      ),
    },
    {
      id: "s18",
      num: "S18",
      title: "Standee Template Designer Gallery",
      category: "restaurant",
      description: "Gallery of 6 designer standee templates (Modern Minimal, Gold Luxury, Neon, Healthcare, Salon).",
      highlights: ["Template gallery selector", "Custom tagline editor", "Color palette customizer", "Save custom template"],
      component: (
        <Screen18StandeeTemplateGallery
          onBack={() => setSelectedScreenId("s17")}
          onSelectTemplate={() => setSelectedScreenId("s21")}
        />
      ),
    },
    {
      id: "s19",
      num: "S19",
      title: "Customer Reviews Stream & Sentiment Bar",
      category: "restaurant",
      description: "Customer feedback feed with verified scan badges, experience tags (Hygiene, Taste, Staff), and star counts.",
      highlights: ["5-Star distribution chart", "Verified scan badges", "Staff, Taste & Value tags", "Direct reply button"],
      component: (
        <Screen19CustomerReviewsFeed
          onBack={() => setSelectedScreenId("s01")}
          onOpenReply={() => setSelectedScreenId("s20")}
        />
      ),
    },
    {
      id: "s20",
      num: "S20",
      title: "Public Review Reply & Resolution Modal",
      category: "restaurant",
      description: "Modal allowing merchants to publicly reply to customer reviews to build digital trust.",
      highlights: ["Owner reply text editor", "Resolution offer coupon", "Post to public business profile", "SMS notification to customer"],
      component: (
        <Screen20ReviewReplyModal
          onBack={() => setSelectedScreenId("s19")}
          onSendReply={() => setSelectedScreenId("s19")}
        />
      ),
    },
    {
      id: "s21",
      num: "S21",
      title: "Merchandise Storefront Catalog",
      category: "restaurant",
      description: "Doorstep merchandise store with Acrylic A5 standees, wooden blocks, NFC tap pucks, and vinyl stickers.",
      highlights: ["Acrylic A5 Counter Standee", "Wooden Tabletop Block (Pack of 5)", "NFC One-Tap Google Puck", "Doorstep delivery across UP"],
      component: (
        <Screen21MerchandiseCatalog
          onBack={() => setSelectedScreenId("s01")}
          onCustomizeProduct={() => setSelectedScreenId("s22")}
          onViewCart={() => setSelectedScreenId("s23")}
        />
      ),
    },
    {
      id: "s22",
      num: "S22",
      title: "3D Standee Mockup Customizer",
      category: "restaurant",
      description: "Live 3D preview rendering the cafe name, official logo, and generated QR code embedded on physical standee.",
      highlights: ["Live 3D standee mockup", "Custom brand color border", "Size selector (A5 / A4)", "Quantity discount selector"],
      component: (
        <Screen22MockupCustomizer
          onBack={() => setSelectedScreenId("s21")}
          onAddToCart={() => setSelectedScreenId("s23")}
        />
      ),
    },
    {
      id: "s23",
      num: "S23",
      title: "Shipping Address, Cart & Cashfree Checkout",
      category: "restaurant",
      description: "Doorstep shipping confirmation and online payment via Cashfree Gateway with GST invoice generation.",
      highlights: ["Delivery address confirmation", "Shipping fee waiver progress", "Cashfree UPI / Card gateway", "Instant order confirmation"],
      component: (
        <Screen23CartCheckout
          onBack={() => setSelectedScreenId("s21")}
          onPaySuccess={() => setSelectedScreenId("s24")}
        />
      ),
    },
    {
      id: "s24",
      num: "S24",
      title: "Physical Order Tracking & Waybill Timeline",
      category: "restaurant",
      description: "Order fulfillment tracker: Order Placed -> Artwork Approved -> In Printing -> Shipped -> Delivered.",
      highlights: ["Shiprocket waybill tracking link", "Artwork proof inspector", "Courier delivery ETA", "Raise replacement ticket"],
      component: (
        <Screen24OrderTrackingWaybill
          onBack={() => setSelectedScreenId("s21")}
          onRaiseComplaint={() => setSelectedScreenId("s47")}
        />
      ),
    },
    {
      id: "s25",
      num: "S25",
      title: "Automated Occasions CRM Board",
      category: "restaurant",
      description: "Upcoming customer birthdays and anniversaries queue with 09:30 AM daily WhatsApp blast switch.",
      highlights: ["Birthday & anniversary timeline", "Auto-dispatch daily toggle", "Birthday discount coupon rule", "WhatsApp delivery logs"],
      component: (
        <Screen25OccasionsCrmBoard
          onBack={() => setSelectedScreenId("s01")}
          onOpenPoster={() => setSelectedScreenId("s26")}
          onOpenComposer={() => setSelectedScreenId("s27")}
        />
      ),
    },
    {
      id: "s26",
      num: "S26",
      title: "AI Festival & Seasonal Poster Creator",
      category: "restaurant",
      description: "Auto-generates Diwali, Eid, New Year, and weekend special social posters with cafe logo and QR.",
      highlights: ["Festival poster generator", "Custom food photos insertion", "Auto-branded watermark", "Download & Instagram Share"],
      component: (
        <Screen26AiPosterCreator
          onBack={() => setSelectedScreenId("s25")}
          onDownloadPoster={() => alert("Poster saved for WhatsApp Status!")}
        />
      ),
    },
    {
      id: "s27",
      num: "S27",
      title: "WhatsApp Message & Coupon Composer",
      category: "restaurant",
      description: "Rich WhatsApp message editor with instant preview and discount coupon codes.",
      highlights: ["Rich text emoji editor", "Coupon code generator", "WhatsApp bubble live simulator", "Recipient filter (All / Top 20%)"],
      component: (
        <Screen27WhatsAppComposer
          onBack={() => setSelectedScreenId("s25")}
          onSendTest={() => setSelectedScreenId("s25")}
        />
      ),
    },
    {
      id: "s28",
      num: "S28",
      title: "Connect Credits Wallet & Recharge Modal",
      category: "restaurant",
      description: "Wallet balance manager with ₹199 (250 credits) and ₹499 (700 credits) top-up options.",
      highlights: ["Credit balance display", "Recharge packs selector", "Cashfree instant recharge", "Cost breakdown (₹0.70/msg)"],
      component: (
        <Screen28ConnectWalletRecharge
          onBack={() => setSelectedScreenId("s25")}
          onRechargeSuccess={() => setSelectedScreenId("s25")}
        />
      ),
    },
    {
      id: "s29",
      num: "S29",
      title: "Scan Footfall & Growth Trends",
      category: "restaurant",
      description: "7D/30D/90D analytics graphs showing QR scans, unique visitors, and customer repeat ratios.",
      highlights: ["Date range dropdown", "Total scan metric card", "Unique customer counter", "Repeat scan conversion rate"],
      component: (
        <Screen29ScanFootfallTrends
          onBack={() => setSelectedScreenId("s01")}
          onOpenHeatmap={() => setSelectedScreenId("s30")}
        />
      ),
    },
    {
      id: "s30",
      num: "S30",
      title: "24-Hour Rush-Hour Footfall Heatmap",
      category: "restaurant",
      description: "Hourly scan bar chart revealing exact store peak footfall hours (e.g. 6:00 PM - 9:00 PM rush).",
      highlights: ["24-Hour time bar chart", "Peak rush hour highlight", "Kitchen staffing optimization", "Daily order correlation"],
      component: (
        <Screen30HourlyRushHeatmap
          onBack={() => setSelectedScreenId("s29")}
          onOpenSentiment={() => setSelectedScreenId("s31")}
        />
      ),
    },
    {
      id: "s31",
      num: "S31",
      title: "Customer Sentiment & Tag Analysis",
      category: "restaurant",
      description: "Percentage breakdown of customer feedback: Food Taste, Cleanliness, Staff Hospitality, and Pricing.",
      highlights: ["Sentiment percentage bar", "Positive vs critical highlights", "Experience tag cloud", "Actionable improvement tips"],
      component: (
        <Screen31CustomerSentimentTags
          onBack={() => setSelectedScreenId("s30")}
          onOpenExporter={() => setSelectedScreenId("s32")}
        />
      ),
    },
    {
      id: "s32",
      num: "S32",
      title: "Data Export & Reports Downloader",
      category: "restaurant",
      description: "Download monthly customer scan analytics and order revenue spreadsheets for accounting.",
      highlights: ["Excel / CSV export", "Financial summary sheet", "Customer visit records", "Monthly performance report"],
      component: (
        <Screen32ReportsDataExporter onBack={() => setSelectedScreenId("s29")} />
      ),
    },
    {
      id: "s33",
      num: "S33",
      title: "Current Plan Status & Expiry Banner",
      category: "restaurant",
      description: "Active plan badge, days remaining countdown, auto-renew switch, and expiry warning alerts.",
      highlights: ["Standard / Premium plan badge", "Remaining days countdown", "Auto-renew toggle switch", "Plan renewal status"],
      component: (
        <Screen33PlanStatusCockpit
          onBack={() => setSelectedScreenId("s01")}
          onUpgrade={() => setSelectedScreenId("s34")}
          onViewInvoices={() => setSelectedScreenId("s36")}
        />
      ),
    },
    {
      id: "s34",
      num: "S34",
      title: "3-Tier Feature Matrix (Basic vs ₹49 vs ₹99)",
      category: "restaurant",
      description: "Side-by-side comparison of Basic (Free), Standard (₹49/mo), and Premium (₹99/mo) plan features.",
      highlights: ["3-Tier feature comparison", "Unlocked modules checklist", "Upgrade to Premium CTA", "Annual 20% discount switch"],
      component: (
        <Screen34ThreeTierMatrix
          onBack={() => setSelectedScreenId("s33")}
          onSelectTier={() => setSelectedScreenId("s35")}
        />
      ),
    },
    {
      id: "s35",
      num: "S35",
      title: "Subscription Checkout & UPI AutoPay",
      category: "restaurant",
      description: "Cashfree Subscriptions checkout with UPI AutoPay mandate setup for seamless recurring billing.",
      highlights: ["UPI AutoPay QR & VPA setup", "Card recurring authorization", "Instant activation", "Zero manual hassle"],
      component: (
        <Screen35SubscriptionAutoPay
          onBack={() => setSelectedScreenId("s34")}
          onSuccess={() => setSelectedScreenId("s33")}
        />
      ),
    },
    {
      id: "s36",
      num: "S36",
      title: "GST Tax Invoices & Payment Receipts",
      category: "restaurant",
      description: "Download monthly GST tax invoices with Trustit legal entity details for tax deduction filing.",
      highlights: ["GST invoice list", "Download PDF button", "B2B input tax credit details", "Transaction UTR codes"],
      component: (
        <Screen36GstTaxInvoices onBack={() => setSelectedScreenId("s33")} />
      ),
    },
    {
      id: "s37",
      num: "S37",
      title: "Daily Settlements Ledger",
      category: "restaurant",
      description: "Daily 10:00 AM bank payout summary, today's gross collection, platform deductions, and net transferred amount.",
      highlights: ["Today's net payout card", "This week & month payouts", "Bank transfer 10:00 AM schedule", "Daily settlement table with UTR"],
      component: (
        <Screen37DailySettlementLedger
          onBack={() => setSelectedScreenId("s01")}
          onInspectSettlement={() => setSelectedScreenId("s38")}
          onOpenBankKyc={() => setSelectedScreenId("s39")}
        />
      ),
    },
    {
      id: "s38",
      num: "S38",
      title: "Settlement Detail Breakdown Modal",
      category: "restaurant",
      description: "Granular deduction sheet: Gross Customer Payments - Gateway MDR - Trustit Platform Fee = Net Bank Payout.",
      highlights: ["Transparent fee breakdown", "Order-by-order calculation", "Cashfree nodal escrow confirmation", "Dispute discrepancy button"],
      component: (
        <Screen38SettlementBreakdownModal onBack={() => setSelectedScreenId("s37")} />
      ),
    },
    {
      id: "s39",
      num: "S39",
      title: "Bank Account KYC & Penny Drop",
      category: "restaurant",
      description: "Merchant bank account verification (Beneficiary Name, IFSC, Account Number) with Penny Drop ₹1 deposit check.",
      highlights: ["Bank account input form", "Penny Drop verification badge", "IFSC auto branch detector", "Update bank details modal"],
      component: (
        <Screen39BankKycPennyDrop
          onBack={() => setSelectedScreenId("s37")}
          onVerifySuccess={() => setSelectedScreenId("s37")}
        />
      ),
    },
    {
      id: "s40",
      num: "S40",
      title: "Payout Excel Statement Downloader",
      category: "restaurant",
      description: "Export daily and monthly bank settlement sheets formatted for Chartered Accountants and audit books.",
      highlights: ["Custom date range exporter", "Includes order IDs, UTRs & net payouts", "Excel .xlsx and CSV formats", "Audit reconciliation summary"],
      component: (
        <Screen40PayoutExcelDownloader onBack={() => setSelectedScreenId("s37")} />
      ),
    },
    {
      id: "s41",
      num: "S41",
      title: "Account Security & 2-Factor Authentication",
      category: "restaurant",
      description: "Password reset, registered mobile OTP verification, 2FA security switch, and login alerts.",
      highlights: ["Change password modal", "Registered phone OTP re-authentication", "2FA SMS/WhatsApp security switch", "Active session monitor"],
      component: (
        <Screen41SecurityTwoFactor
          onBack={() => setSelectedScreenId("s01")}
          onSave={() => setSelectedScreenId("s01")}
        />
      ),
    },
    {
      id: "s42",
      num: "S42",
      title: "Multi-Branch Outlet Switcher Console",
      category: "restaurant",
      description: "For owners running multiple branches (e.g. Civil Lines branch & Medical College branch) to switch consoles in 1 click.",
      highlights: ["Branch switcher dropdown", "Multi-store overview card", "Add new outlet button", "Shared owner master billing"],
      component: (
        <Screen42MultiOutletSwitcher
          onBack={() => setSelectedScreenId("s01")}
          onSelectOutlet={() => setSelectedScreenId("s01")}
        />
      ),
    },
    {
      id: "s43",
      num: "S43",
      title: "Staff Role Permissions Matrix",
      category: "restaurant",
      description: "Granular access control: Cashier (Orders & Menu only), Kitchen Master (KOT only), and Owner (Full access).",
      highlights: ["Role assignment table", "Invite staff member via phone", "Permissions toggles (Hide payments from staff)", "Revoke staff access button"],
      component: (
        <Screen43StaffRolesMatrix
          onBack={() => setSelectedScreenId("s01")}
          onInviteStaff={() => alert("Invite link sent to staff phone via SMS!")}
        />
      ),
    },
    {
      id: "s44",
      num: "S44",
      title: "Audit Log & Device Sessions",
      category: "restaurant",
      description: "List of currently logged-in POS tablets, phones, and browsers with remote logout capabilities.",
      highlights: ["Logged-in device list", "IP address & location", "Timestamp of last activity", "Remote logout all other devices"],
      component: (
        <Screen44AuditSessionsLog onBack={() => setSelectedScreenId("s01")} />
      ),
    },
    {
      id: "s45",
      num: "S45",
      title: "24x7 Operations Support Hub",
      category: "restaurant",
      description: "Direct WhatsApp priority channel and emergency phone hotline (+91-9118643415) for live order assistance.",
      highlights: ["Direct WhatsApp escalation button", "Toll-free emergency phone helpline", "Current operations desk status", "Average response time: 2 mins"],
      component: (
        <Screen45OperationsSupportHub
          onBack={() => setSelectedScreenId("s01")}
          onOpenPrinterWizard={() => setSelectedScreenId("s46")}
          onOpenTicket={() => setSelectedScreenId("s47")}
        />
      ),
    },
    {
      id: "s46",
      num: "S46",
      title: "Thermal Printer Setup Wizard (USB/Bluetooth)",
      category: "restaurant",
      description: "Step-by-step connection wizard for 58mm and 80mm thermal receipt printers with browser print test.",
      highlights: ["USB / Bluetooth connection guide", "RawBT & Web Bluetooth support", "Print test slip button", "Auto-cut and paper feed calibration"],
      component: (
        <Screen46ThermalPrinterWizard onBack={() => setSelectedScreenId("s45")} />
      ),
    },
    {
      id: "s47",
      num: "S47",
      title: "Support Ticket Desk & Dispute Tracker",
      category: "restaurant",
      description: "Submit dispute tickets for delayed riders, customer payment queries, or standee replacement requests.",
      highlights: ["Raise new ticket modal", "Dispute category selector", "Ticket resolution status tracker", "Photo proof attachment"],
      component: (
        <Screen47TicketDeskDisputes onBack={() => setSelectedScreenId("s45")} />
      ),
    },
    {
      id: "s48",
      num: "S48",
      title: "Store Offline Emergency Safe Mode",
      category: "restaurant",
      description: "Failsafe safety protocol when cafe internet disconnects or power fails, protecting merchant ratings.",
      highlights: ["Offline emergency safe switch", "Auto-pause incoming orders to avoid cancellation penalties", "SMS alert sent to owner phone", "1-Tap recovery when power resumes"],
      component: (
        <Screen48OfflineSafeMode onBack={() => setSelectedScreenId("s01")} />
      ),
    },
  ];

  const categories = [
    { id: "all", label: "🌟 All Screens (68)" },
    { id: "auth", label: "🚀 Become a Partner & Login (4)" },
    { id: "kirana", label: "🛒 Kirana Mart Flow (4)" },
    { id: "chemist", label: "💊 Medical & Chemist Flow (4)" },
    { id: "salon", label: "✂️ Salon & Spa Flow (4)" },
    { id: "carwash", label: "🚗 Car Wash & Garage (4)" },
    { id: "restaurant", label: "☕ Restaurant & Cafe (48)" },
  ];

  const filteredScreens = filterCategory === "all" ? allScreens : allScreens.filter((s) => s.category === filterCategory);
  const activeScreenObj = allScreens.find((s) => s.id === selectedScreenId) || allScreens[0];

  const currentIndex = allScreens.findIndex((s) => s.id === selectedScreenId);
  const handlePrev = () => {
    const nextIdx = currentIndex > 0 ? currentIndex - 1 : allScreens.length - 1;
    setSelectedScreenId(allScreens[nextIdx].id);
  };

  const handleNext = () => {
    const nextIdx = currentIndex < allScreens.length - 1 ? currentIndex + 1 : 0;
    setSelectedScreenId(allScreens[nextIdx].id);
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-[#0F172A] font-sans p-3 sm:p-6 pb-24">
      {/* Top Banner & Control Deck */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                Multi-Vertical Merchant Partner Console · 68 Complete Modular Screens
              </span>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Auth + Kirana + Chemist + Salon + Car Wash + Restaurant
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 tracking-tight">
              Merchant Operating System — Grouped Industry Showroom
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Test 'Become a Partner' registration, Login portal, and industry-specific workflows for Kirana, Chemist, Salon, Car Wash &amp; Cafe.
            </p>
          </div>

          {/* Mode Switcher & Device Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* View Mode Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode("interactive")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                  viewMode === "interactive" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📱 Single Screen Simulator
              </button>
              <button
                type="button"
                onClick={() => setViewMode("gallery")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shadow-xs ${
                  viewMode === "gallery" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🗂️ Grid Gallery
              </button>
            </div>

            {/* Device Frame Switcher */}
            {viewMode === "interactive" && (
              <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDeviceFrame("mobile")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    deviceFrame === "mobile" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="Mobile Console View (Portrait)"
                >
                  📱 Mobile Phone
                </button>
                <button
                  type="button"
                  onClick={() => setDeviceFrame("tablet")}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition ${
                    deviceFrame === "tablet" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                  title="POS Counter / Tablet View (Landscape)"
                >
                  💻 POS Counter
                </button>
              </div>
            )}

            {/* Live /test-flight & /partner Link & Paywall Test Modal Trigger */}
            <div className="flex items-center gap-1.5">
              <Link
                href="/apps"
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-xs transition flex items-center gap-1"
                title="Install All 3 Apps on Mobile Phone"
              >
                <span>📲 Install Apps</span>
                <span>↗</span>
              </Link>
              <Link
                href="/test-flight"
                className="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-xs transition flex items-center gap-1"
                title="Launch 3-Sided End-to-End Hyperlocal Test Flight"
              >
                <span>🚀 Live Test Flight</span>
                <span>↗</span>
              </Link>
              <Link
                href="/partner"
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition flex items-center gap-1"
                title="Open Public Self-Serve Partner Onboarding"
              >
                <span>🏪 /partner Route</span>
                <span>↗</span>
              </Link>
              <button
                type="button"
                onClick={() => setIsTestUpgradeOpen(true)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-500 text-slate-950 shadow-xs transition flex items-center gap-1"
                title="Test ₹29/₹49/₹99 Universal Paywall Upgrade Sheet"
              >
                <span>💎 Test Upgrade Sheet</span>
              </button>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-right hidden sm:block">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">Localhost Live</span>
              <span className="text-xs font-mono font-bold text-emerald-700">Port :3000 Active</span>
            </div>
          </div>
        </div>

        {/* Grouped Industry Filter Tabs */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-2.5 shadow-sm overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1.5 min-w-max">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setFilterCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  filterCategory === cat.id
                    ? "bg-[#0F172A] text-white shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Horizontal Screen Selector Chips */}
        <div className="mt-2 bg-white/70 border border-slate-200 rounded-2xl p-2 shadow-2xs overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="flex items-center gap-1.5 min-w-max">
            {filteredScreens.map((screen) => (
              <button
                key={screen.id}
                type="button"
                onClick={() => {
                  setSelectedScreenId(screen.id);
                  if (viewMode === "gallery") setViewMode("interactive");
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition ${
                  selectedScreenId === screen.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <span className="font-mono mr-1 text-[10px] opacity-75">{screen.num}</span>
                <span>{screen.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW 1: INTERACTIVE SINGLE SCREEN SIMULATOR                */}
      {/* ========================================================= */}
      {viewMode === "interactive" && (
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Device Mockup Column */}
          <div className={`${deviceFrame === "mobile" ? "lg:col-span-5" : "lg:col-span-7"} flex justify-center transition-all`}>
            {deviceFrame === "mobile" ? (
              /* Mobile Phone Device Frame (Portrait) */
              <div className="w-full max-w-[380px] bg-slate-950 border-4 border-slate-800 rounded-[44px] p-3 shadow-2xl">
                {/* Speaker Notch */}
                <div className="w-32 h-5 bg-slate-900 rounded-full mx-auto mb-2 flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-slate-950 border border-slate-800"></div>
                  <div className="w-10 h-1 rounded-full bg-slate-800"></div>
                </div>

                {/* Mobile Screen Container */}
                <div className="bg-white rounded-[32px] overflow-hidden min-h-[660px] max-h-[660px] flex flex-col justify-between shadow-inner merchant-simulator-frame no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {activeScreenObj.component}
                </div>
              </div>
            ) : (
              /* POS Counter / Tablet Device Frame (Landscape) */
              <div className="w-full max-w-[740px] bg-slate-950 border-4 border-slate-800 rounded-[36px] p-3.5 shadow-2xl">
                {/* Tablet Top Camera Notch */}
                <div className="w-4 h-4 rounded-full bg-slate-900 border border-slate-800 mx-auto mb-2.5"></div>

                {/* Tablet Screen Container */}
                <div className="bg-white rounded-[24px] overflow-hidden min-h-[520px] max-h-[520px] flex flex-col justify-between shadow-inner merchant-simulator-frame no-scrollbar [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {activeScreenObj.component}
                </div>
              </div>
            )}
          </div>

          {/* Screen Inspector Column */}
          <div className={`${deviceFrame === "mobile" ? "lg:col-span-7" : "lg:col-span-5"} space-y-4`}>
            
            {/* Inspector Meta Card */}
            <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-black uppercase tracking-wider text-blue-700">
                  ACTIVE SCREEN INSPECTOR • {activeScreenObj.category.toUpperCase()}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-blue-50 text-blue-800 border border-blue-200">
                  Screen ID: {activeScreenObj.num}
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                {activeScreenObj.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeScreenObj.description}
              </p>

              {/* Highlights & Sub-Buttons Tested */}
              <div className="mt-4 bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-[11px] font-black uppercase text-slate-600 tracking-wider block">
                  Sub-Buttons &amp; Functional Logic Tested:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {activeScreenObj.highlights?.map((h: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-800 font-medium">
                      <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                      <span>{h}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Jump Dropdown */}
              <div className="pt-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  Quick Jump to Any Screen:
                </label>
                <select
                  value={selectedScreenId}
                  onChange={(e) => setSelectedScreenId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-hidden focus:border-blue-600"
                >
                  {allScreens.map((s) => (
                    <option key={s.id} value={s.id}>
                      [{s.num}] {s.title} ({s.category.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Navigation Previous / Next */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span>← Previous</span>
                </button>
                <span className="text-xs font-mono text-slate-500">
                  screen {currentIndex + 1} of {allScreens.length}
                </span>
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-xs flex items-center gap-1.5"
                >
                  <span>Next Screen →</span>
                </button>
              </div>
            </div>

            {/* Verification Status Card */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-5 shadow-xs flex items-start gap-3">
              <span className="text-2xl">🎖️</span>
              <div>
                <h3 className="text-xs font-black text-emerald-950 uppercase tracking-wide">
                  Complete Multi-Industry Architecture Ready!
                </h3>
                <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                  अब इसमें <strong>Become a Partner Sign-Up, Category Selection Wizard, Partner Login</strong> के साथ-साथ <strong>Kirana Mart, Medical Chemist, Salon &amp; Spa, Car Wash</strong> और <strong>Restaurant</strong> के सभी स्पेसिफिक स्क्रीन्स और कस्टम Review QR स्टैंडीज़ पूरी तरह लाइव और इंटरएक्टिव हैं!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 2: 68-SCREEN GRID GALLERY                             */}
      {/* ========================================================= */}
      {viewMode === "gallery" && (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredScreens.map((screen) => (
              <div
                key={screen.id}
                className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                  <span className="text-xs font-black font-mono">
                    {screen.num}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-300">
                    {screen.category}
                  </span>
                </div>

                <div className="h-[460px] overflow-hidden bg-slate-50 relative pointer-events-none border-y border-slate-200">
                  <div className="scale-75 origin-top w-[133%] h-[133%]">
                    {screen.component}
                  </div>
                </div>

                <div className="p-4 bg-white space-y-2">
                  <h3 className="text-xs font-black text-slate-900 line-clamp-1">{screen.title}</h3>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedScreenId(screen.id);
                      setViewMode("interactive");
                    }}
                    className="w-full py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200"
                  >
                    Open in Interactive Simulator →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Universal Paywall & Upgrade Modal for Testing */}
      <UniversalUpgradeModal
        isOpen={isTestUpgradeOpen}
        onClose={() => setIsTestUpgradeOpen(false)}
        reason="general"
      />
    </div>
  );
}
