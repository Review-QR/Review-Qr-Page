"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRiderWorkflow } from "@/app/rider/hooks/useRiderWorkflow";
import { riderAudio } from "@/lib/audio/rider-siren";

// 18 Core Screens
import Screen01AuthStart from "@/app/rider/components/screens/Screen01AuthStart";
import Screen02OtpVerify from "@/app/rider/components/screens/Screen02OtpVerify";
import Screen03Consent from "@/app/rider/components/screens/Screen03Consent";
import Screen04SelfieKyc from "@/app/rider/components/screens/Screen04SelfieKyc";
import Screen05VehicleDl from "@/app/rider/components/screens/Screen05VehicleDl";
import Screen06PayoutSetup from "@/app/rider/components/screens/Screen06PayoutSetup";
import Screen07DutyCockpit from "@/app/rider/components/screens/Screen07DutyCockpit";
import Screen08ShiftScorecard from "@/app/rider/components/screens/Screen08ShiftScorecard";
import Screen09CashCeiling from "@/app/rider/components/screens/Screen09CashCeiling";
import Screen10Radar from "@/app/rider/components/screens/Screen10Radar";
import Screen11SlideAccept from "@/app/rider/components/screens/Screen11SlideAccept";
import Screen12StorePickup from "@/app/rider/components/screens/Screen12StorePickup";
import Screen13Doorstep from "@/app/rider/components/screens/Screen13Doorstep";
import Screen14DynamicQr from "@/app/rider/components/screens/Screen14DynamicQr";
import Screen15Passbook from "@/app/rider/components/screens/Screen15Passbook";
import Screen16Milestones from "@/app/rider/components/screens/Screen16Milestones";
import Screen17SafetySos from "@/app/rider/components/screens/Screen17SafetySos";
import Screen18Profile from "@/app/rider/components/screens/Screen18Profile";

// Extended Deep-Dwell & Multi-Category Screens (19 to 39)
import Screen19VerificationPending from "@/app/rider/components/screens/Screen19VerificationPending";
import Screen20TrainingAcademy from "@/app/rider/components/screens/Screen20TrainingAcademy";
import Screen21LockscreenOrderPop from "@/app/rider/components/screens/Screen21LockscreenOrderPop";
import Screen22MultiOrderBatch from "@/app/rider/components/screens/Screen22MultiOrderBatch";
import Screen23MerchantDelay from "@/app/rider/components/screens/Screen23MerchantDelay";
import Screen24CustomerUnreachable from "@/app/rider/components/screens/Screen24CustomerUnreachable";
import Screen25ShiftBookingMg from "@/app/rider/components/screens/Screen25ShiftBookingMg";
import Screen26CashRemittanceHubs from "@/app/rider/components/screens/Screen26CashRemittanceHubs";
import Screen27MorningHelmetSelfie from "@/app/rider/components/screens/Screen27MorningHelmetSelfie";
import Screen28BreakdownRescue from "@/app/rider/components/screens/Screen28BreakdownRescue";
import Screen29CustomerRefusalRto from "@/app/rider/components/screens/Screen29CustomerRefusalRto";
import Screen30ContactlessPhotoPod from "@/app/rider/components/screens/Screen30ContactlessPhotoPod";
import Screen31PenaltyDispute from "@/app/rider/components/screens/Screen31PenaltyDispute";
import Screen32AccidentInsurance from "@/app/rider/components/screens/Screen32AccidentInsurance";
import Screen33HeatmapSurge from "@/app/rider/components/screens/Screen33HeatmapSurge";
import Screen34ReferAndBadges from "@/app/rider/components/screens/Screen34ReferAndBadges";
import Screen35PharmacyRxPickup from "@/app/rider/components/screens/Screen35PharmacyRxPickup";
import Screen36HeavyGroceryCrate from "@/app/rider/components/screens/Screen36HeavyGroceryCrate";
import Screen37P2pGenieCourier from "@/app/rider/components/screens/Screen37P2pGenieCourier";
import Screen38FragileCakeGuard from "@/app/rider/components/screens/Screen38FragileCakeGuard";
import Screen39CategoryToggles from "@/app/rider/components/screens/Screen39CategoryToggles";

// Navigation & On-Road Special Screens (40 to 44)
import Screen40TurnByTurnNav from "@/app/rider/components/screens/Screen40TurnByTurnNav";
import Screen41Last100mLandmark from "@/app/rider/components/screens/Screen41Last100mLandmark";
import Screen42TrafficReroute from "@/app/rider/components/screens/Screen42TrafficReroute";
import Screen43DigitalFleetIdPass from "@/app/rider/components/screens/Screen43DigitalFleetIdPass";
import Screen44InAppMaskedChat from "@/app/rider/components/screens/Screen44InAppMaskedChat";

// Ground-Zero Edge Cases & Emergency Screens (45 to 48)
import Screen45DoorstepChangeWallet from "@/app/rider/components/screens/Screen45DoorstepChangeWallet";
import Screen46MidTripCancellation from "@/app/rider/components/screens/Screen46MidTripCancellation";
import Screen47ParkingTollClaim from "@/app/rider/components/screens/Screen47ParkingTollClaim";
import Screen48LowBatterySafeMode from "@/app/rider/components/screens/Screen48LowBatterySafeMode";

type TabKey = "cockpit" | "orders" | "earnings" | "navigation" | "profile";

export default function RiderAppShellPage() {
  const workflow = useRiderWorkflow();
  const {
    currentScreenId,
    setCurrentScreenId,
    rider,
    isOnline,
    cashInHand,
    setCashInHand,
    cashCeiling,
    walletBalance,
    setWalletBalance,
    todayEarnings,
    todayTripsCount,
    soundEnabled,
    setSoundEnabled,
    remoteConfig,
    updateRemoteConfigLive,
    toggleDuty,
    triggerIncomingOrderRadar,
    acceptOrder,
    declineOrder,
    confirmPickup,
    completeDeliveryWithOtp,
    claimWaitCompensation,
    refundDoorstepChange,
    claimParkingReimbursement,
    remitCash,
    handleGoogleLogin,
    requestInstantPayout,
  } = workflow;

  // Active Bottom Tab
  const [activeTab, setActiveTab] = useState<TabKey>("cockpit");
  const [currentTime, setCurrentTime] = useState<string>("19:04");
  const [showRemoteDeck, setShowRemoteDeck] = useState<boolean>(true);
  const [activeDeckTab, setActiveDeckTab] = useState<"ota" | "workflow" | "screens">("ota");
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  // Dynamic Auth State for Testing
  const [authPhone, setAuthPhone] = useState<string>("9876543210");
  const [authChannel, setAuthChannel] = useState<"sms" | "whatsapp">("whatsapp");
  const [previewOtp, setPreviewOtp] = useState<string>("547291");

  // OTA Edit State
  const [editingTicker, setEditingTicker] = useState<string>(
    remoteConfig.adminBroadcastTicker.message || ""
  );

  // Keep Clock Updated
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, "0");
      const mins = String(now.getMinutes()).padStart(2, "0");
      setCurrentTime(`${hrs}:${mins}`);
    };
    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, []);

  // Sync editing ticker with remote config
  useEffect(() => {
    if (remoteConfig.adminBroadcastTicker?.message) {
      setEditingTicker(remoteConfig.adminBroadcastTicker.message);
    }
  }, [remoteConfig.adminBroadcastTicker?.message]);

  // ─────────────────────────────────────────────────────────────
  // 5 PERMANENT TABS MAPPING (ALL 48 SCREENS ALLOCATED)
  // ─────────────────────────────────────────────────────────────
  const tabConfigs = [
    {
      key: "cockpit" as TabKey,
      label: "Cockpit",
      icon: "🛵",
      badge: isOnline ? "ON" : "OFF",
      screens: [7, 8, 9, 25, 33, 39],
    },
    {
      key: "orders" as TabKey,
      label: "Live Orders",
      icon: "⚡",
      badge: "14",
      screens: [10, 21, 22, 11, 12, 23, 35, 36, 37, 38, 13, 14, 24, 28, 29, 30, 45, 46],
    },
    {
      key: "earnings" as TabKey,
      label: "Passbook",
      icon: "💰",
      badge: `₹${walletBalance}`,
      screens: [15, 16, 26, 6, 31, 34, 47],
    },
    {
      key: "navigation" as TabKey,
      label: "Navigation",
      icon: "🗺️",
      badge: "GPS",
      screens: [40, 41, 42, 44, 48],
    },
    {
      key: "profile" as TabKey,
      label: "Fleet ID",
      icon: "👤",
      badge: "UP 40",
      screens: [18, 43, 32, 17, 1, 2, 3, 4, 5, 19, 20, 27],
    },
  ];

  // Helper to sync tab with active screen
  const handleSelectScreen = (screenId: number) => {
    setCurrentScreenId(screenId);
    const foundTab = tabConfigs.find((tab) => tab.screens.includes(screenId));
    if (foundTab) setActiveTab(foundTab.key);
  };

  // Helper when clicking bottom tab
  const handleTabClick = (tabKey: TabKey) => {
    setActiveTab(tabKey);
    const targetTab = tabConfigs.find((t) => t.key === tabKey);
    if (targetTab && !targetTab.screens.includes(currentScreenId)) {
      // Jump to the primary screen of that tab
      setCurrentScreenId(targetTab.screens[0]);
    }
  };

  // ─────────────────────────────────────────────────────────────
  // ALL 48 SCREENS CATALOG WITH INTERACTIVE CALLBACKS (ZERO DUMMY BUTTONS)
  // ─────────────────────────────────────────────────────────────
  const screens = [
    // Stage 1: Onboarding Core
    {
      id: 1,
      title: "01. Auth & Mobile Entry",
      tab: "profile",
      component: (
        <Screen01AuthStart
          onContinue={(phone, channel, otp) => {
            setAuthPhone(phone);
            setAuthChannel(channel);
            if (otp) setPreviewOtp(otp);
            handleSelectScreen(2);
          }}
          onGoogleLogin={async () => {
            const ok = await handleGoogleLogin();
            if (ok) handleSelectScreen(7);
          }}
        />
      ),
    },
    {
      id: 2,
      title: "02. 6-Box OTP Verification",
      tab: "profile",
      component: (
        <Screen02OtpVerify
          phone={authPhone}
          channel={authChannel}
          previewOtp={previewOtp}
          onVerified={(otp, riderObj) => {
            if (riderObj) {
              handleSelectScreen(7);
            } else {
              handleSelectScreen(3);
            }
          }}
          onBack={() => handleSelectScreen(1)}
        />
      ),
    },
    { id: 3, title: "03. Terms & Road Safety", tab: "profile", component: <Screen03Consent onAgree={() => handleSelectScreen(4)} onBack={() => handleSelectScreen(2)} /> },
    { id: 4, title: "04. Real Selfie KYC (Live Camera)", tab: "profile", component: <Screen04SelfieKyc onSelfieCaptured={() => handleSelectScreen(5)} onBack={() => handleSelectScreen(3)} /> },
    { id: 5, title: "05. Vehicle RC & DL (UP 40)", tab: "profile", component: <Screen05VehicleDl onVehicleSubmit={() => handleSelectScreen(6)} onBack={() => handleSelectScreen(4)} /> },
    { id: 6, title: "06. Cashfree UPI Payout Setup", tab: "earnings", component: <Screen06PayoutSetup onPayoutConfigured={() => handleSelectScreen(19)} onBack={() => handleSelectScreen(5)} /> },
    { id: 19, title: "19. Verification In-Progress Room", tab: "profile", component: <Screen19VerificationPending onBack={() => handleSelectScreen(6)} onProceedToAcademy={() => handleSelectScreen(20)} /> },

    // Stage 2: Training & Daily Gate
    { id: 20, title: "20. Rider Training Academy & Quiz", tab: "profile", component: <Screen20TrainingAcademy onBack={() => handleSelectScreen(19)} onCompleteAcademy={() => handleSelectScreen(27)} /> },
    { id: 27, title: "27. Daily Morning Helmet Selfie Gate", tab: "profile", component: <Screen27MorningHelmetSelfie onBack={() => handleSelectScreen(20)} onSelfieApproved={() => handleSelectScreen(7)} /> },

    // Stage 3: Cockpit, Shifts & Heatmap (Tab 1: Cockpit)
    {
      id: 7,
      title: "07. Duty Cockpit (Home)",
      tab: "cockpit",
      component: (
        <Screen07DutyCockpit
          isOnlineProp={isOnline}
          cashInHandProp={cashInHand}
          cashCeilingProp={cashCeiling}
          remoteConfig={remoteConfig}
          onGoOnline={toggleDuty}
          onOpenRadar={() => {
            triggerIncomingOrderRadar(false);
            handleSelectScreen(10);
          }}
          onOpenPassbook={() => handleSelectScreen(15)}
          onOpenScorecard={() => handleSelectScreen(8)}
          onOpenCeiling={() => handleSelectScreen(9)}
          onOpenShiftBooking={() => handleSelectScreen(25)}
          onOpenHeatmap={() => handleSelectScreen(33)}
          onOpenProfile={() => handleSelectScreen(18)}
          onOpenSos={() => handleSelectScreen(17)}
          onOpenRemit={() => handleSelectScreen(26)}
          onOpenTargetScreen={(id) => handleSelectScreen(id)}
        />
      ),
    },
    { id: 8, title: "08. Shift Scorecard & Telemetry", tab: "cockpit", component: <Screen08ShiftScorecard onBack={() => handleSelectScreen(7)} onOpenCeiling={() => handleSelectScreen(9)} /> },
    {
      id: 9,
      title: "09. ₹1,500 Cash Ceiling Guard",
      tab: "cockpit",
      component: (
        <Screen09CashCeiling
          cashInHandProp={cashInHand}
          cashCeilingProp={cashCeiling}
          onBack={() => handleSelectScreen(7)}
          onRemit={() => handleSelectScreen(26)}
        />
      ),
    },
    { id: 25, title: "25. Shift Slot Booking & Min Guarantee", tab: "cockpit", component: <Screen25ShiftBookingMg onBack={() => handleSelectScreen(7)} /> },
    { id: 33, title: "33. Bahraich Demand Heatmap & Alerts", tab: "cockpit", component: <Screen33HeatmapSurge onBack={() => handleSelectScreen(7)} onNavigateToSurgeZone={() => triggerIncomingOrderRadar(false)} /> },
    { id: 39, title: "39. Delivery Category Opt-In Toggles", tab: "cockpit", component: <Screen39CategoryToggles onBack={() => handleSelectScreen(18)} onSavePreferences={() => handleSelectScreen(7)} /> },

    // Stage 4: Radar, Siren & Batching (Tab 2: Orders)
    { id: 10, title: "10. 30s Proximity Siren Radar", tab: "orders", component: <Screen10Radar onAccept={() => { acceptOrder(); handleSelectScreen(12); }} onDecline={() => { declineOrder(); handleSelectScreen(7); }} /> },
    { id: 21, title: "21. Lockscreen High-Siren Order Pop", tab: "orders", component: <Screen21LockscreenOrderPop onAccept={() => { acceptOrder(); handleSelectScreen(12); }} onDecline={() => { declineOrder(); handleSelectScreen(7); }} /> },
    { id: 22, title: "22. 2-Order Same-Route Batch Radar", tab: "orders", component: <Screen22MultiOrderBatch onAcceptBatch={() => { acceptOrder(); handleSelectScreen(12); }} onDecline={() => { declineOrder(); handleSelectScreen(7); }} /> },
    { id: 11, title: "11. Slide to Accept Order", tab: "orders", component: <Screen11SlideAccept onAccepted={() => { acceptOrder(); handleSelectScreen(12); }} onBack={() => handleSelectScreen(10)} /> },

    // Stage 5: Multi-Category Specialist Runs (Tab 2: Orders)
    { id: 35, title: "35. Pharmacy Rx & Medical Verification", tab: "orders", component: <Screen35PharmacyRxPickup onBack={() => handleSelectScreen(12)} onConfirmPickup={() => { confirmPickup(); handleSelectScreen(40); }} /> },
    { id: 36, title: "36. Heavy Grocery Crate & Weight Bonus", tab: "orders", component: <Screen36HeavyGroceryCrate onBack={() => handleSelectScreen(12)} onConfirmCratePickup={() => { confirmPickup(); handleSelectScreen(40); }} /> },
    { id: 37, title: "37. P2P Genie Courier (Dual-OTP)", tab: "orders", component: <Screen37P2pGenieCourier onBack={() => handleSelectScreen(12)} onProceedToDrop={() => { confirmPickup(); handleSelectScreen(40); }} /> },
    { id: 38, title: "38. Fragile Cake & Bakery Guard", tab: "orders", component: <Screen38FragileCakeGuard onBack={() => handleSelectScreen(12)} onConfirmCakePickup={() => { confirmPickup(); handleSelectScreen(40); }} /> },

    // Stage 6: Store Pickup & Delays (Tab 2: Orders)
    {
      id: 12,
      title: "12. Store Pickup & Verification Checklist",
      tab: "orders",
      component: (
        <Screen12StorePickup
          onPickupConfirmed={() => { confirmPickup(); handleSelectScreen(40); }}
          onBack={() => handleSelectScreen(11)}
          onMerchantDelay={() => handleSelectScreen(23)}
        />
      ),
    },
    { id: 23, title: "23. Merchant Delay & Wait Compensation", tab: "orders", component: <Screen23MerchantDelay onBack={() => handleSelectScreen(12)} onConfirmReady={() => { confirmPickup(); handleSelectScreen(40); }} onRequestReassign={() => { declineOrder(); handleSelectScreen(7); }} /> },

    // Stage 7: Turn-by-Turn Navigation & On-Road Special (Tab 4: Navigation)
    {
      id: 40,
      title: "40. Turn-by-Turn GPS Live Navigation",
      tab: "navigation",
      component: (
        <Screen40TurnByTurnNav
          onBack={() => handleSelectScreen(12)}
          onViewLandmarks={() => handleSelectScreen(41)}
          onArrivedAtLocation={() => handleSelectScreen(13)}
          onTrafficReroute={() => handleSelectScreen(42)}
          onInAppChat={() => handleSelectScreen(44)}
          onPolicePass={() => handleSelectScreen(43)}
          onLowBattery={() => handleSelectScreen(48)}
        />
      ),
    },
    { id: 41, title: "41. Last 100m Alleyway & Gate Rescue", tab: "navigation", component: <Screen41Last100mLandmark onBack={() => handleSelectScreen(40)} onContinueNavigation={() => handleSelectScreen(13)} /> },
    { id: 42, title: "42. Railway Halt & Dynamic Reroute", tab: "navigation", component: <Screen42TrafficReroute onBack={() => handleSelectScreen(40)} onAcceptReroute={() => handleSelectScreen(40)} onStayOnCurrentRoute={() => handleSelectScreen(40)} /> },
    { id: 43, title: "43. Digital Fleet ID & Police Pass", tab: "profile", component: <Screen43DigitalFleetIdPass onBack={() => handleSelectScreen(18)} /> },
    { id: 44, title: "44. In-App Masked Customer Chat", tab: "navigation", component: <Screen44InAppMaskedChat onBack={() => handleSelectScreen(40)} /> },

    // Stage 8: Doorstep Delivery & Rescues (Tab 2: Orders)
    {
      id: 13,
      title: "13. Customer Doorstep & 4-Digit OTP",
      tab: "orders",
      component: (
        <Screen13Doorstep
          onShowDynamicQr={() => handleSelectScreen(14)}
          onDelivered={(otp) => { completeDeliveryWithOtp(otp); handleSelectScreen(15); }}
          onBack={() => handleSelectScreen(40)}
          onDoorstepChangeRefund={() => handleSelectScreen(45)}
          onCustomerUnreachable={() => handleSelectScreen(24)}
          onContactlessPhotoPod={() => handleSelectScreen(30)}
        />
      ),
    },
    { id: 14, title: "14. Dynamic Cashfree UPI QR (COD)", tab: "orders", component: <Screen14DynamicQr onPaymentReceived={() => { completeDeliveryWithOtp("4492"); handleSelectScreen(15); }} onBack={() => handleSelectScreen(13)} /> },
    { id: 24, title: "24. Customer Unreachable 5-Min Rescue", tab: "orders", component: <Screen24CustomerUnreachable onBack={() => handleSelectScreen(13)} onCompleteCancellation={() => handleSelectScreen(15)} /> },
    { id: 28, title: "28. Breakdown & Buddy Handover Desk", tab: "orders", component: <Screen28BreakdownRescue onBack={() => handleSelectScreen(13)} onHandoverComplete={() => handleSelectScreen(15)} /> },
    { id: 29, title: "29. Customer Refused (RTO Return Flow)", tab: "orders", component: <Screen29CustomerRefusalRto onBack={() => handleSelectScreen(13)} onConfirmMerchantReturn={() => handleSelectScreen(15)} /> },
    { id: 30, title: "30. Contactless Photo POD Watermark", tab: "orders", component: <Screen30ContactlessPhotoPod onBack={() => handleSelectScreen(13)} onConfirmPod={() => { completeDeliveryWithOtp("4492"); handleSelectScreen(15); }} /> },

    // Stage 9: Ground-Zero Dilemmas & Rescues (Tab 2: Orders & Tab 4: Nav)
    {
      id: 45,
      title: "45. Doorstep Change Deficit (Wallet / UPI)",
      tab: "orders",
      component: (
        <Screen45DoorstepChangeWallet
          onBack={() => handleSelectScreen(13)}
          onConfirmChangeRefund={(amt, method) => {
            refundDoorstepChange(amt, method);
            completeDeliveryWithOtp("4492");
            handleSelectScreen(15);
          }}
        />
      ),
    },
    { id: 46, title: "46. Mid-Trip Cancel & Distance Pay", tab: "orders", component: <Screen46MidTripCancellation onBack={() => handleSelectScreen(10)} onReturnToRadar={() => triggerIncomingOrderRadar(false)} /> },
    {
      id: 47,
      title: "47. Parking & Municipal Toll Claim",
      tab: "earnings",
      component: (
        <Screen47ParkingTollClaim
          onBack={() => handleSelectScreen(15)}
          onSubmitClaim={(amt) => {
            claimParkingReimbursement(amt);
            handleSelectScreen(15);
          }}
        />
      ),
    },
    { id: 48, title: "48. Critical Battery (<15%) Safe Mode", tab: "navigation", component: <Screen48LowBatterySafeMode onBack={() => handleSelectScreen(40)} /> },

    // Stage 10: Earnings, Remittance & Claims (Tab 3: Earnings)
    {
      id: 15,
      title: "15. Daily Earnings Passbook & Ledger",
      tab: "earnings",
      component: (
        <Screen15Passbook
          onBack={() => handleSelectScreen(7)}
          onInstantPayout={() => requestInstantPayout()}
          onRemitCash={() => handleSelectScreen(26)}
          onClaimParking={() => handleSelectScreen(47)}
          onDisputePenalty={() => handleSelectScreen(31)}
          onMilestones={() => handleSelectScreen(16)}
          walletBalanceProp={walletBalance}
          todayEarningsProp={todayEarnings}
          todayTripsCountProp={todayTripsCount}
        />
      ),
    },
    { id: 16, title: "16. Milestone Targets & Rush Surge", tab: "earnings", component: <Screen16Milestones onBack={() => handleSelectScreen(7)} /> },
    {
      id: 26,
      title: "26. Cash Remittance & Deposit Hubs",
      tab: "earnings",
      component: (
        <Screen26CashRemittanceHubs
          onBack={() => handleSelectScreen(9)}
          onPayViaUpi={() => remitCash()}
          cashDueProp={cashInHand}
          cashCeilingProp={cashCeiling}
        />
      ),
    },
    {
      id: 31,
      title: "31. Deduction & Detour Dispute Desk",
      tab: "earnings",
      component: (
        <Screen31PenaltyDispute
          onBack={() => handleSelectScreen(15)}
          onSubmitDispute={() => {
            setWalletBalance((w) => w + 30);
            setTimeout(() => handleSelectScreen(15), 1500);
          }}
        />
      ),
    },
    { id: 34, title: "34. Tier Badges & Refer ₹500", tab: "earnings", component: <Screen34ReferAndBadges onBack={() => handleSelectScreen(18)} /> },

    // Stage 11: Safety, Insurance & Profile (Tab 5: Fleet & Safety)
    { id: 17, title: "17. Red 24x7 Safety SOS Shield", tab: "profile", component: <Screen17SafetySos onBack={() => handleSelectScreen(7)} /> },
    { id: 32, title: "32. Safe Driving Rules & Road Code", tab: "profile", component: <Screen32AccidentInsurance onBack={() => handleSelectScreen(18)} onConsentAccepted={() => handleSelectScreen(7)} /> },
    {
      id: 18,
      title: "18. Rider Profile & Safe Shift Logout",
      tab: "profile",
      component: (
        <Screen18Profile
          onBack={() => handleSelectScreen(7)}
          onLogout={() => handleSelectScreen(1)}
          onEditKyc={() => handleSelectScreen(4)}
          onOpenPayoutSetup={() => handleSelectScreen(6)}
          onOpenDisputes={() => handleSelectScreen(31)}
          onOpenSafetyRules={() => handleSelectScreen(32)}
          onOpenFleetId={() => handleSelectScreen(43)}
        />
      ),
    },
  ];

  const activeScreenObj = screens.find((s) => s.id === currentScreenId) || screens[6];

  // Current tab's screens for the quick stage carousel inside the active tab
  const currentTabScreens = screens.filter((s) =>
    tabConfigs.find((t) => t.key === activeTab)?.screens.includes(s.id)
  );

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between relative overflow-x-hidden p-2 sm:p-6">
      
      {/* Background Radial Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_15%,rgba(28,47,95,0.45)_0%,rgba(6,9,19,1)_85%)]"></div>

      {/* ── Top Bar for Laptop Testing ── */}
      <div className="relative z-30 max-w-6xl mx-auto w-full flex flex-wrap items-center justify-between gap-3 text-xs mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <strong className="text-white font-black text-sm uppercase tracking-wide">
            Trustit Rider App · Live Phone Simulator
          </strong>
          <span className="px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-mono">
            Phase 2: 100% Wired Engine (Zero Dummy)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Real Mobile Device Test Button */}
          <button
            type="button"
            onClick={() => setShowQrModal(true)}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition flex items-center gap-1.5 active:scale-95 animate-pulse"
          >
            <span>📱 Test on Real Mobile (Scan QR)</span>
          </button>

          {/* Sound / Siren Engine Switch */}
          <button
            type="button"
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              if (next) riderAudio.playCashChime();
              else riderAudio.stopSiren();
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
              soundEnabled
                ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
            }`}
          >
            <span>{soundEnabled ? "🔊 Siren Audio ON" : "🔇 Siren Audio Muted"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRemoteDeck(!showRemoteDeck)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold"
          >
            {showRemoteDeck ? "Hide Remote ✕" : "Show Remote 🛠️"}
          </button>
        </div>
      </div>

      {/* ── Main Simulator Viewport: Smartphone Frame & Side Inspector ── */}
      <main className="relative z-20 flex-1 flex items-center justify-center py-2 px-1">
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6">
          
          {/* ══════════════════════════════════════════════════════════ */}
          {/* CENTER: ULTRA-REALISTIC SMARTPHONE DEVICE FRAME            */}
          {/* ══════════════════════════════════════════════════════════ */}
          <div className="flex flex-col items-center">
            
            {/* Phone Outer Chassis with Metallic Edge & Rockers */}
            <div className="relative w-full max-w-[400px] bg-[#111827] rounded-[52px] p-2.5 shadow-[0_25px_75px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(30,58,138,0.25)] border-[8px] border-[#1F2937] ring-1 ring-white/10 ring-offset-2 ring-offset-[#0A0F1E]">
              
              {/* Phone Hardware Rockers */}
              <div className="absolute -left-3 top-24 w-1 h-12 bg-slate-700 rounded-l-md"></div>
              <div className="absolute -left-3 top-40 w-1 h-12 bg-slate-700 rounded-l-md"></div>
              <div className="absolute -right-3 top-32 w-1 h-16 bg-slate-700 rounded-r-md"></div>

              {/* Inner Screen Container */}
              <div className="rider-simulator-frame rider-phone-viewport phone-screen-container bg-[#FAF8FF] rounded-[42px] overflow-hidden shadow-inner flex flex-col justify-between relative h-[740px] max-h-[86vh] text-[#0F172A] select-none">
                
                {/* 1. Phone Top Status Bar (Time, Punch Hole, 5G, Battery) */}
                <div className="px-5 pt-2 pb-1 bg-slate-950 text-white flex items-center justify-between text-[11px] font-semibold shrink-0 select-none z-30">
                  <span className="font-mono font-bold">{currentTime}</span>
                  <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800 shadow-inner ring-1 ring-slate-900 mx-auto"></div>
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span>5G</span>
                    <span>📶</span>
                    <span className="text-emerald-400">🔋 94%</span>
                  </div>
                </div>

                {/* 2. Top Header: Online/Offline Duty Switch & Cash Limit */}
                <div className="bg-[#0D47A1] text-white px-3.5 py-2.5 flex items-center justify-between shrink-0 shadow-sm z-20">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleDuty()}
                      className={`px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition flex items-center gap-1.5 active:scale-95 ${
                        isOnline
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          : "bg-slate-800 text-slate-300 hover:text-white"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-slate-950 animate-ping" : "bg-slate-500"}`}></span>
                      <span>{isOnline ? "ONLINE DUTY" : "GO ONLINE"}</span>
                    </button>
                    <span className="text-[10px] text-blue-200 font-mono hidden sm:inline">Bahraich UP 40</span>
                  </div>

                  {/* Cash Limit Indicator */}
                  <button
                    type="button"
                    onClick={() => handleSelectScreen(9)}
                    className="text-right hover:opacity-90 transition active:scale-95"
                    title="View Cash Ceiling Limit"
                  >
                    <div className="flex items-center gap-1 text-[10px] font-bold text-amber-200">
                      <span>💵 Cash: ₹{cashInHand}</span>
                      <span className="text-[9px] text-blue-200">/ ₹{cashCeiling}</span>
                    </div>
                    <div className="w-24 h-1.5 bg-blue-950 rounded-full overflow-hidden mt-0.5 ml-auto">
                      <div
                        className={`h-full transition-all duration-300 ${cashInHand >= cashCeiling ? "bg-red-400" : "bg-amber-300"}`}
                        style={{ width: `${Math.min(100, (cashInHand / cashCeiling) * 100)}%` }}
                      ></div>
                    </div>
                  </button>
                </div>

                {/* 3. Quick Sub-Screen Pills inside Active Tab */}
                <div className="bg-white/95 border-b border-slate-200 px-2.5 py-1.5 shrink-0 overflow-x-auto scrollbar-none z-10">
                  <div className="flex items-center gap-1.5 min-w-max">
                    <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider mr-0.5">
                      {activeTab}:
                    </span>
                    {currentTabScreens.map((sc) => {
                      const isCurrent = sc.id === currentScreenId;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => handleSelectScreen(sc.id)}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition ${
                            isCurrent
                              ? "bg-[#0D47A1] text-white shadow-2xs"
                              : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          }`}
                        >
                          {sc.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. Main Screen Viewport (Kinetic Trust Light Content) */}
                <div
                  className="rider-phone-viewport no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1 overflow-y-auto bg-[#FAF8FF] text-[#0F172A] relative flex flex-col justify-between"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {activeScreenObj.component}
                </div>

                {/* 5. Bottom 5 Permanent Navigation Tabs (Zomato/Swiggy Fleet Style) */}
                <nav className="bg-white border-t border-slate-200/90 px-1 py-1 shrink-0 grid grid-cols-5 text-center shadow-lg z-30">
                  {tabConfigs.map((tab) => {
                    const isTabActive = activeTab === tab.key;
                    return (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => handleTabClick(tab.key)}
                        className={`flex flex-col items-center justify-center py-1 px-0.5 rounded-xl transition relative ${
                          isTabActive ? "text-[#0D47A1]" : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span className="text-base leading-none block">{tab.icon}</span>
                        <span className={`text-[9px] mt-0.5 block truncate max-w-full ${isTabActive ? "font-black" : "font-semibold"}`}>
                          {tab.label}
                        </span>
                        {isTabActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0D47A1] mt-0.5 block"></span>
                        )}
                      </button>
                    );
                  })}
                </nav>

                {/* 6. Phone Bottom Home Indicator */}
                <div className="py-1 bg-white shrink-0 flex justify-center z-30 border-t border-slate-100">
                  <div className="w-28 h-1 bg-slate-300 rounded-full"></div>
                </div>

              </div>

            </div>

            {/* Sub-Phone Screen Title Badge */}
            <div className="mt-2 text-center">
              <span className="text-xs font-mono font-bold text-slate-400">
                Active: S{String(activeScreenObj.id).padStart(2, "0")} · {activeScreenObj.title} [{activeTab.toUpperCase()}]
              </span>
            </div>

          </div>

          {/* ══════════════════════════════════════════════════════════ */}
          {/* RIGHT: DESKTOP SIMULATOR REMOTE & TEST CONTROL DECK        */}
          {/* ══════════════════════════════════════════════════════════ */}
          {showRemoteDeck && (
            <div className="w-full max-w-md lg:max-w-sm space-y-3">
              
              {/* Telemetry Status Card */}
              <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fleet Partner</span>
                    <strong className="text-sm font-black text-white block mt-0.5">Arjun Singh · UP 40 AB 2345</strong>
                    <span className="text-[10px] text-emerald-400 font-bold">Gold Tier ⭐ 4.92 · Civil Lines</span>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${isOnline ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "bg-slate-800 text-slate-400"}`}>
                    {isOnline ? "DUTY ON" : "DUTY OFF"}
                  </span>
                </div>

                {/* Real-time Balances */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] font-bold text-blue-400 uppercase block">Wallet Balance</span>
                    <strong className="text-base font-black text-white font-mono">₹{walletBalance}.00</strong>
                    <span className="text-[9px] text-emerald-400 block mt-0.5">1-Tap UPI Ready</span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-[10px] font-bold text-amber-400 uppercase block">Cash in Hand</span>
                    <strong className={`text-base font-black font-mono ${cashInHand >= cashCeiling ? "text-rose-400" : "text-amber-300"}`}>
                      ₹{cashInHand}
                    </strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Ceiling: ₹{cashCeiling}</span>
                  </div>
                </div>
              </div>

              {/* Sub-Tabs: OTA Switchboard vs 1-Tap Workflow vs 48 Screens */}
              <div className="grid grid-cols-3 gap-1 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-bold text-center">
                <button
                  type="button"
                  onClick={() => setActiveDeckTab("ota")}
                  className={`py-1.5 rounded-lg transition ${activeDeckTab === "ota" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                >
                  📡 OTA Config
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeckTab("workflow")}
                  className={`py-1.5 rounded-lg transition ${activeDeckTab === "workflow" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                >
                  ⚡ Workflow
                </button>
                <button
                  type="button"
                  onClick={() => setActiveDeckTab("screens")}
                  className={`py-1.5 rounded-lg transition ${activeDeckTab === "screens" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"}`}
                >
                  📑 48 Screens
                </button>
              </div>

              {/* ── 1. OTA REMOTE CONFIG SWITCHBOARD ── */}
              {activeDeckTab === "ota" && (
                <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <div>
                      <strong className="text-white text-xs block font-black">OTA Real-Time Switchboard</strong>
                      <span className="text-[10px] text-slate-400">Updates app live without APK rebuild</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-blue-900/60 text-blue-300 border border-blue-700">
                      v2.4-OTA
                    </span>
                  </div>

                  {/* Surge Pricing Toggle */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <strong className="text-white text-xs block">Rush Hour Surge Pay</strong>
                      <span className="text-[10px] text-slate-400">Extra +₹{remoteConfig.surgeBonusAmount} per delivery</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => updateRemoteConfigLive({ isSurgeActive: !remoteConfig.isSurgeActive })}
                      className={`px-3 py-1 rounded-lg font-black text-xs transition ${
                        remoteConfig.isSurgeActive
                          ? "bg-amber-400 text-slate-950 hover:bg-amber-300"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {remoteConfig.isSurgeActive ? "ACTIVE (+₹15)" : "OFF (₹0)"}
                    </button>
                  </div>

                  {/* Cash Ceiling Adjuster */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <strong className="text-white text-xs">Cash Ceiling Limit</strong>
                      <span className="text-amber-400 font-mono font-bold text-xs">₹{cashCeiling}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 pt-0.5">
                      {[800, 1500, 2500].map((amt) => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => updateRemoteConfigLive({ cashCeilingLimit: amt })}
                          className={`py-1 rounded-lg font-mono text-xs font-bold transition border ${
                            cashCeiling === amt
                              ? "bg-blue-600 text-white border-blue-400"
                              : "bg-slate-800/80 text-slate-400 border-slate-700 hover:text-white"
                          }`}
                        >
                          ₹{amt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Admin Broadcast Ticker Editor */}
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5">
                    <strong className="text-white text-xs block">Admin Broadcast Ticker (Live)</strong>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={editingTicker}
                        onChange={(e) => setEditingTicker(e.target.value)}
                        placeholder="Broadcast message to fleet..."
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          updateRemoteConfigLive({
                            adminBroadcastTicker: {
                              ...remoteConfig.adminBroadcastTicker,
                              enabled: true,
                              message: editingTicker,
                            },
                          });
                          riderAudio.playCashChime();
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition shrink-0"
                      >
                        Push 📢
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── 2. 1-TAP WORKFLOW TEST DECK ── */}
              {activeDeckTab === "workflow" && (
                <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                    <span className="text-xs font-black uppercase text-white tracking-wider">⚡ 1-Tap Pipeline Testing</span>
                    <span className="text-[10px] text-emerald-400 font-bold">Zero Dummy</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        triggerIncomingOrderRadar(false);
                        handleSelectScreen(10);
                      }}
                      className="p-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-left transition flex items-center justify-between text-[11px]"
                    >
                      <span>🚨 Radar Siren (S10)</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        confirmPickup();
                        handleSelectScreen(40);
                      }}
                      className="p-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold text-left transition flex items-center justify-between text-[11px]"
                    >
                      <span>🗺️ GPS HUD (S40)</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSelectScreen(13)}
                      className="p-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-left transition flex items-center justify-between text-[11px]"
                    >
                      <span>🚪 Doorstep OTP (S13)</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        completeDeliveryWithOtp("4492");
                        handleSelectScreen(15);
                      }}
                      className="p-2 rounded-xl bg-teal-500/20 hover:bg-teal-500/30 border border-teal-500/40 text-teal-300 font-bold text-left transition flex items-center justify-between text-[11px]"
                    >
                      <span>🏁 Fast Deliver (#4492)</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => requestInstantPayout()}
                      className="p-2 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 font-bold text-left transition flex items-center justify-between text-[11px]"
                    >
                      <span>⚡ Cashfree Payout</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => remitCash()}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-left transition flex items-center justify-between text-[11px]"
                    >
                      <span>🔄 Clear Cash Limit</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>
              )}

              {/* ── 3. 48-SCREEN CATALOG SELECTOR ── */}
              {activeDeckTab === "screens" && (
                <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Jump Directly to Any Screen (1 to 48):
                  </label>
                  <select
                    value={currentScreenId}
                    onChange={(e) => handleSelectScreen(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {screens.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        S{String(sc.id).padStart(2, "0")} — {sc.title} [{sc.tab.toUpperCase()}]
                      </option>
                    ))}
                  </select>

                  <div className="pt-1 flex items-center justify-between text-xs">
                    <button
                      type="button"
                      onClick={() => {
                        const idx = screens.findIndex((s) => s.id === currentScreenId);
                        if (idx > 0) handleSelectScreen(screens[idx - 1].id);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-bold"
                    >
                      ← Prev
                    </button>

                    <span className="text-[11px] font-mono text-slate-400">
                      {screens.findIndex((s) => s.id === currentScreenId) + 1} of 48
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const idx = screens.findIndex((s) => s.id === currentScreenId);
                        if (idx < screens.length - 1) handleSelectScreen(screens[idx + 1].id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                    >
                      Next →
                    </button>
                  </div>
                </div>
              )}

              {/* Direct Links to Full Native PWA & WhatsApp Recruitment Hub */}
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                <Link href="/rider" className="hover:text-blue-400 font-bold">
                  📱 Full Native PWA ↗
                </Link>
                <Link href="/rider/join" className="hover:text-emerald-400 font-bold">
                  🤝 Join / Share Hub ↗
                </Link>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ── Persistent Bottom Status Footer ── */}
      <footer className="relative z-30 bg-[#060913]/90 border-t border-slate-800/80 py-2.5 px-4 text-xs mt-3">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-300">Phase 2 Engine Wired:</span>
            <code className="bg-slate-900 px-2 py-0.5 rounded font-mono font-bold text-blue-400 border border-slate-800">
              http://localhost:3000/rider-app
            </code>
          </div>

          <span className="text-[11px] text-slate-500">
            Trustit Fleet Partner Architecture · 5 Permanent Tabs · Zero Web Redirects · OTA Config Active
          </span>
        </div>
      </footer>

      {/* ── Real Mobile Test QR Modal ── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#0B132B] border border-blue-600/40 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl relative">
            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800">
                100% REAL HARDWARE TEST
              </span>
              <h3 className="text-base font-black text-white">Scan with Your Phone Camera</h3>
              <p className="text-xs text-slate-400">
                Open your Android phone&apos;s camera or Google Lens to test live on real mobile hardware!
              </p>
            </div>

            {/* QR Code Container */}
            <div className="bg-white p-3 rounded-2xl w-56 h-56 mx-auto flex items-center justify-center shadow-lg border-2 border-emerald-500">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/rider-mobile-qr.png"
                alt="Scan to Open Trustit Rider App on Mobile"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Direct HTTPS Link */}
            <div className="space-y-2">
              <a
                href="https://choices-crm-appropriations-reserve.trycloudflare.com/rider"
                target="_blank"
                rel="noreferrer"
                className="block text-xs font-mono font-bold text-blue-400 hover:text-blue-300 underline break-all"
              >
                https://choices-crm-appropriations-reserve.trycloudflare.com/rider
              </a>

              {/* Hardware Features Checklist */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-left text-[11px] text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span>✓</span> Real Front/Rear Camera (KYC &amp; Helmet)
                </div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span>✓</span> Real Mobile GPS &amp; High-Accuracy Radar
                </div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span>✓</span> Loud WebAudio Siren &amp; Hindi Alerts
                </div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span>✓</span> Screen Permanent Wake-Lock
                </div>
                <div className="flex items-center gap-1.5 font-bold text-emerald-400">
                  <span>✓</span> Real Device Battery &amp; Safe Mode
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition"
            >
              Done Testing / Close
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
