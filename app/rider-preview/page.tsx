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

export default function RiderPreviewGalleryPage() {
  const workflow = useRiderWorkflow();
  const {
    currentScreenId,
    setCurrentScreenId,
    rider,
    isOnline,
    cashInHand,
    cashCeiling,
    walletBalance,
    todayEarnings,
    todayTripsCount,
    activeOrder,
    incomingOrder,
    isSirenPlaying,
    soundEnabled,
    setSoundEnabled,
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
  } = workflow;

  const [viewMode, setViewMode] = useState<"interactive" | "gallery">("interactive");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [showTelemetryDock, setShowTelemetryDock] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<string>("19:04");

  // Dynamic Auth State
  const [authPhone, setAuthPhone] = useState<string>("");
  const [authChannel, setAuthChannel] = useState<"sms" | "whatsapp">("sms");
  const [previewOtp, setPreviewOtp] = useState<string>("547291");

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

  const screens = [
    // Stage 1: Onboarding Core
    {
      id: 1,
      title: "01. Auth & Mobile Entry",
      category: "onboarding",
      component: (
        <Screen01AuthStart
          onContinue={(phone, channel, otp) => {
            setAuthPhone(phone);
            setAuthChannel(channel);
            if (otp) setPreviewOtp(otp);
            setCurrentScreenId(2);
          }}
        />
      ),
    },
    {
      id: 2,
      title: "02. 6-Box OTP Verification",
      category: "onboarding",
      component: (
        <Screen02OtpVerify
          phone={authPhone}
          channel={authChannel}
          previewOtp={previewOtp}
          onVerified={(otp, riderObj) => {
            if (riderObj) {
              setCurrentScreenId(7); // Active rider jumps directly to Home Cockpit
            } else {
              setCurrentScreenId(3); // New rider proceeds to KYC consent
            }
          }}
          onBack={() => setCurrentScreenId(1)}
        />
      ),
    },
    { id: 3, title: "03. Terms & Road Safety", category: "onboarding", component: <Screen03Consent onAgree={() => setCurrentScreenId(4)} onBack={() => setCurrentScreenId(2)} /> },
    { id: 4, title: "04. Real Selfie KYC (Live Camera)", category: "onboarding", component: <Screen04SelfieKyc onSelfieCaptured={() => setCurrentScreenId(5)} onBack={() => setCurrentScreenId(3)} /> },
    { id: 5, title: "05. Vehicle RC & DL (UP 40)", category: "onboarding", component: <Screen05VehicleDl onVehicleSubmit={() => setCurrentScreenId(6)} onBack={() => setCurrentScreenId(4)} /> },
    { id: 6, title: "06. Cashfree UPI Payout Setup", category: "onboarding", component: <Screen06PayoutSetup onPayoutConfigured={() => setCurrentScreenId(19)} onBack={() => setCurrentScreenId(5)} /> },
    { id: 19, title: "19. Verification In-Progress Room", category: "onboarding", component: <Screen19VerificationPending onBack={() => setCurrentScreenId(6)} onProceedToAcademy={() => setCurrentScreenId(20)} /> },

    // Stage 2: Training & Daily Gate
    { id: 20, title: "20. Rider Training Academy & Quiz", category: "training", component: <Screen20TrainingAcademy onBack={() => setCurrentScreenId(19)} onCompleteAcademy={() => setCurrentScreenId(27)} /> },
    { id: 27, title: "27. Daily Morning Helmet Selfie Gate", category: "training", component: <Screen27MorningHelmetSelfie onBack={() => setCurrentScreenId(20)} onSelfieApproved={() => setCurrentScreenId(7)} /> },

    // Stage 3: Cockpit, Shifts & Heatmap
    {
      id: 7,
      title: "07. Duty Cockpit (Home)",
      category: "cockpit",
      component: (
        <Screen07DutyCockpit
          isOnlineProp={isOnline}
          onGoOnline={toggleDuty}
          onOpenRadar={() => triggerIncomingOrderRadar(false)}
          onOpenPassbook={() => setCurrentScreenId(15)}
          onOpenScorecard={() => setCurrentScreenId(8)}
          onOpenCeiling={() => setCurrentScreenId(9)}
          onOpenShiftBooking={() => setCurrentScreenId(25)}
          onOpenHeatmap={() => setCurrentScreenId(33)}
          onOpenProfile={() => setCurrentScreenId(18)}
          onOpenSos={() => setCurrentScreenId(17)}
        />
      ),
    },
    { id: 8, title: "08. Shift Scorecard & Telemetry", category: "cockpit", component: <Screen08ShiftScorecard onBack={() => setCurrentScreenId(7)} onOpenCeiling={() => setCurrentScreenId(9)} /> },
    { id: 9, title: "09. ₹1,500 Cash Ceiling Guard", category: "cockpit", component: <Screen09CashCeiling onBack={() => setCurrentScreenId(7)} onRemit={() => setCurrentScreenId(26)} /> },
    { id: 25, title: "25. Shift Slot Booking & Min Guarantee", category: "cockpit", component: <Screen25ShiftBookingMg onBack={() => setCurrentScreenId(7)} /> },
    { id: 33, title: "33. Bahraich Demand Heatmap & Alerts", category: "cockpit", component: <Screen33HeatmapSurge onBack={() => setCurrentScreenId(7)} onNavigateToSurgeZone={() => triggerIncomingOrderRadar(false)} /> },

    // Stage 4: Radar, Siren & Batching
    { id: 10, title: "10. 30s Proximity Siren Radar", category: "dispatch", component: <Screen10Radar onAccept={() => acceptOrder()} onDecline={() => declineOrder()} /> },
    { id: 21, title: "21. Lockscreen High-Siren Order Pop", category: "dispatch", component: <Screen21LockscreenOrderPop onAccept={() => acceptOrder()} onDecline={() => declineOrder()} /> },
    { id: 22, title: "22. 2-Order Same-Route Batch Radar", category: "dispatch", component: <Screen22MultiOrderBatch onAcceptBatch={() => acceptOrder()} onDecline={() => declineOrder()} /> },
    { id: 11, title: "11. Slide to Accept Order", category: "dispatch", component: <Screen11SlideAccept onAccepted={() => acceptOrder()} onBack={() => setCurrentScreenId(10)} /> },

    // Stage 5: Multi-Category Specialist Runs
    { id: 35, title: "35. Pharmacy Rx & Medical Verification", category: "category", component: <Screen35PharmacyRxPickup onBack={() => setCurrentScreenId(12)} onConfirmPickup={() => confirmPickup()} /> },
    { id: 36, title: "36. Heavy Grocery Crate & Weight Bonus", category: "category", component: <Screen36HeavyGroceryCrate onBack={() => setCurrentScreenId(12)} onConfirmCratePickup={() => confirmPickup()} /> },
    { id: 37, title: "37. P2P Genie Courier (Dual-OTP)", category: "category", component: <Screen37P2pGenieCourier onBack={() => setCurrentScreenId(12)} onProceedToDrop={() => confirmPickup()} /> },
    { id: 38, title: "38. Fragile Cake & Bakery Guard", category: "category", component: <Screen38FragileCakeGuard onBack={() => setCurrentScreenId(12)} onConfirmCakePickup={() => confirmPickup()} /> },
    { id: 39, title: "39. Delivery Category Opt-In Toggles", category: "category", component: <Screen39CategoryToggles onBack={() => setCurrentScreenId(18)} onSavePreferences={() => setCurrentScreenId(7)} /> },

    // Stage 6: Store Pickup & Delays
    {
      id: 12,
      title: "12. Store Pickup & Verification Checklist",
      category: "store",
      component: (
        <Screen12StorePickup
          onPickupConfirmed={() => confirmPickup()}
          onBack={() => setCurrentScreenId(11)}
          onMerchantDelay={() => setCurrentScreenId(23)}
        />
      ),
    },
    { id: 23, title: "23. Merchant Delay & Wait Compensation", category: "store", component: <Screen23MerchantDelay onBack={() => setCurrentScreenId(12)} onConfirmReady={() => confirmPickup()} onRequestReassign={() => declineOrder()} /> },

    // Stage 7: Turn-by-Turn Navigation & On-Road Special
    {
      id: 40,
      title: "40. Turn-by-Turn GPS Live Navigation",
      category: "nav",
      component: (
        <Screen40TurnByTurnNav
          onBack={() => setCurrentScreenId(12)}
          onViewLandmarks={() => setCurrentScreenId(41)}
          onArrivedAtLocation={() => setCurrentScreenId(13)}
          onTrafficReroute={() => setCurrentScreenId(42)}
          onInAppChat={() => setCurrentScreenId(44)}
          onPolicePass={() => setCurrentScreenId(43)}
          onLowBattery={() => setCurrentScreenId(48)}
        />
      ),
    },
    { id: 41, title: "41. Last 100m Alleyway & Gate Rescue", category: "nav", component: <Screen41Last100mLandmark onBack={() => setCurrentScreenId(40)} onContinueNavigation={() => setCurrentScreenId(13)} /> },
    { id: 42, title: "42. Railway Halt & Dynamic Reroute", category: "nav", component: <Screen42TrafficReroute onBack={() => setCurrentScreenId(40)} onAcceptReroute={() => setCurrentScreenId(40)} onStayOnCurrentRoute={() => setCurrentScreenId(40)} /> },
    { id: 43, title: "43. Digital Fleet ID & Police Pass", category: "nav", component: <Screen43DigitalFleetIdPass onBack={() => setCurrentScreenId(40)} /> },
    { id: 44, title: "44. In-App Masked Customer Chat", category: "nav", component: <Screen44InAppMaskedChat onBack={() => setCurrentScreenId(40)} /> },

    // Stage 8: Doorstep Delivery & Rescues
    {
      id: 13,
      title: "13. Customer Doorstep & 4-Digit OTP",
      category: "doorstep",
      component: (
        <Screen13Doorstep
          onShowDynamicQr={() => setCurrentScreenId(14)}
          onDelivered={(otp) => completeDeliveryWithOtp(otp)}
          onBack={() => setCurrentScreenId(40)}
          onDoorstepChangeRefund={() => setCurrentScreenId(45)}
          onCustomerUnreachable={() => setCurrentScreenId(24)}
          onContactlessPhotoPod={() => setCurrentScreenId(30)}
        />
      ),
    },
    { id: 14, title: "14. Dynamic Cashfree UPI QR (COD)", category: "doorstep", component: <Screen14DynamicQr onPaymentReceived={() => completeDeliveryWithOtp("4492")} onBack={() => setCurrentScreenId(13)} /> },
    { id: 24, title: "24. Customer Unreachable 5-Min Rescue", category: "doorstep", component: <Screen24CustomerUnreachable onBack={() => setCurrentScreenId(13)} onCompleteCancellation={() => setCurrentScreenId(15)} /> },
    { id: 28, title: "28. Breakdown & Buddy Handover Desk", category: "doorstep", component: <Screen28BreakdownRescue onBack={() => setCurrentScreenId(13)} onHandoverComplete={() => setCurrentScreenId(15)} /> },
    { id: 29, title: "29. Customer Refused (RTO Return Flow)", category: "doorstep", component: <Screen29CustomerRefusalRto onBack={() => setCurrentScreenId(13)} onConfirmMerchantReturn={() => setCurrentScreenId(15)} /> },
    { id: 30, title: "30. Contactless Photo POD Watermark", category: "doorstep", component: <Screen30ContactlessPhotoPod onBack={() => setCurrentScreenId(13)} onConfirmPod={() => completeDeliveryWithOtp("4492")} /> },

    // Stage 9: Ground-Zero Dilemmas & Rescues (Screens 45 to 48)
    {
      id: 45,
      title: "45. Doorstep Change Deficit (Wallet / UPI)",
      category: "rescue",
      component: (
        <Screen45DoorstepChangeWallet
          onBack={() => setCurrentScreenId(13)}
          onConfirmChangeRefund={(amt, method) => {
            refundDoorstepChange(amt, method);
            completeDeliveryWithOtp("4492");
          }}
        />
      ),
    },
    { id: 46, title: "46. Mid-Trip Cancel & Distance Pay", category: "rescue", component: <Screen46MidTripCancellation onBack={() => setCurrentScreenId(10)} onReturnToRadar={() => triggerIncomingOrderRadar(false)} /> },
    {
      id: 47,
      title: "47. Parking & Municipal Toll Claim",
      category: "rescue",
      component: (
        <Screen47ParkingTollClaim
          onBack={() => setCurrentScreenId(15)}
          onSubmitClaim={(amt) => {
            claimParkingReimbursement(amt);
            setCurrentScreenId(15);
          }}
        />
      ),
    },
    { id: 48, title: "48. Critical Battery (<15%) Safe Mode", category: "rescue", component: <Screen48LowBatterySafeMode onBack={() => setCurrentScreenId(40)} /> },

    // Stage 10: Earnings, Remittance & Claims
    {
      id: 15,
      title: "15. Daily Earnings Passbook & Ledger",
      category: "earnings",
      component: (
        <Screen15Passbook
          onBack={() => setCurrentScreenId(7)}
          onInstantPayout={() => setCurrentScreenId(6)}
          onRemitCash={() => setCurrentScreenId(26)}
          onClaimParking={() => setCurrentScreenId(47)}
          onDisputePenalty={() => setCurrentScreenId(31)}
          onMilestones={() => setCurrentScreenId(16)}
        />
      ),
    },
    { id: 16, title: "16. Milestone Targets & Rush Surge", category: "earnings", component: <Screen16Milestones onBack={() => setCurrentScreenId(7)} /> },
    { id: 26, title: "26. Cash Remittance & Deposit Hubs", category: "earnings", component: <Screen26CashRemittanceHubs onBack={() => setCurrentScreenId(9)} onPayViaUpi={() => remitCash()} /> },
    { id: 31, title: "31. Deduction & Detour Dispute Desk", category: "earnings", component: <Screen31PenaltyDispute onBack={() => setCurrentScreenId(15)} onSubmitDispute={() => setCurrentScreenId(15)} /> },
    { id: 34, title: "34. Tier Badges & Refer ₹500", category: "earnings", component: <Screen34ReferAndBadges onBack={() => setCurrentScreenId(18)} /> },

    // Stage 11: Safety, Insurance & Profile
    { id: 17, title: "17. Red 24x7 Safety SOS Shield", category: "safety", component: <Screen17SafetySos onBack={() => setCurrentScreenId(7)} /> },
    { id: 32, title: "32. Safe Driving Rules & Road Code", category: "safety", component: <Screen32AccidentInsurance onBack={() => setCurrentScreenId(18)} onConsentAccepted={() => setCurrentScreenId(7)} /> },
    { id: 18, title: "18. Rider Profile & Safe Shift Logout", category: "safety", component: <Screen18Profile onBack={() => setCurrentScreenId(7)} onLogout={() => setCurrentScreenId(1)} /> },
  ];

  // Quick Stages for Floating Pill Header (Matching User's Reference Layout)
  const quickStages = [
    { id: 7, label: "🛵 Cockpit (Home)", bg: "hover:bg-blue-900/60 text-blue-200 border-blue-500/40" },
    { id: 10, label: "🚨 Radar & Siren", bg: "hover:bg-amber-900/60 text-amber-200 border-amber-500/40" },
    { id: 12, label: "🏪 Store Pickup", bg: "hover:bg-cyan-900/60 text-cyan-200 border-cyan-500/40" },
    { id: 40, label: "🗺️ Live GPS HUD", bg: "hover:bg-emerald-900/60 text-emerald-200 border-emerald-500/40" },
    { id: 13, label: "🚪 Doorstep OTP #4492", bg: "hover:bg-teal-900/60 text-teal-200 border-teal-500/40" },
    { id: 45, label: "🪙 No-Change Wallet", bg: "hover:bg-indigo-900/60 text-indigo-200 border-indigo-500/40" },
    { id: 15, label: "💰 Daily Passbook", bg: "hover:bg-emerald-900/60 text-emerald-300 border-emerald-500/40" },
    { id: 32, label: "🦺 Safe Driving Code", bg: "hover:bg-blue-900/60 text-blue-200 border-blue-500/40" },
    { id: 20, label: "🪖 Academy & Gate", bg: "hover:bg-yellow-900/60 text-yellow-200 border-yellow-500/40" },
    { id: 35, label: "📦 Pharmacy Rx", bg: "hover:bg-rose-900/60 text-rose-200 border-rose-500/40" },
    { id: 48, label: "🪫 Safe Battery", bg: "hover:bg-red-900/60 text-red-300 border-red-500/40" },
    { id: 17, label: "🛡️ Red SOS Shield", bg: "hover:bg-red-900/60 text-red-200 border-red-500/40" },
    { id: 1, label: "📋 Auth & KYC", bg: "hover:bg-slate-800 text-slate-300 border-slate-700" },
  ];

  const categories = [
    { id: "all", label: "🌟 All 48 Screens" },
    { id: "rescue", label: "🚨 Ground Rescues (4)" },
    { id: "nav", label: "🗺️ Navigation & On-Road (5)" },
    { id: "onboarding", label: "📋 Onboarding (7)" },
    { id: "training", label: "🪖 Academy & Gate (2)" },
    { id: "cockpit", label: "🛵 Cockpit & Shifts (5)" },
    { id: "dispatch", label: "⚡ Radar & Siren (4)" },
    { id: "category", label: "📦 Multi-Category (5)" },
    { id: "store", label: "🏪 Store Pickup (2)" },
    { id: "doorstep", label: "🚪 Doorstep & Rescues (6)" },
    { id: "earnings", label: "💰 Earnings & Claims (5)" },
    { id: "safety", label: "🛡️ Safety & Health (3)" },
  ];

  const filteredScreens = filterCategory === "all" ? screens : screens.filter((s) => s.category === filterCategory);
  const activeScreenObj = screens.find((s) => s.id === currentScreenId) || screens[6]; // default to S07 Cockpit

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-blue-600 selection:text-white flex flex-col justify-between relative overflow-x-hidden">
      
      {/* Background Ambient Lighting & Glow */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_50%_20%,rgba(28,47,95,0.45)_0%,rgba(6,9,19,1)_80%)]"></div>

      {/* ========================================================= */}
      {/* 1. TOP FLOATING STAGE NAVIGATION PILLS (USER IMAGE STYLE) */}
      {/* ========================================================= */}
      <header className="relative z-30 pt-4 px-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col items-center gap-3">
          
          {/* Top Title & View Mode Switcher */}
          <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <strong className="font-black text-white tracking-wide uppercase text-[11px] sm:text-xs">
                Trustit Rider Fleet v2.0 · Bahraich (UP 40)
              </strong>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-blue-950/80 text-blue-300 border border-blue-800 text-[10px] font-mono">
                48 Production Screens · 100% Wired
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* Sound / Siren Engine Switch */}
              <button
                type="button"
                onClick={() => {
                  riderAudio.unlock();
                  const next = !soundEnabled;
                  setSoundEnabled(next);
                  if (next) {
                    riderAudio.playCashChime();
                  } else {
                    riderAudio.stopSiren();
                  }
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition border flex items-center gap-1.5 ${
                  soundEnabled
                    ? "bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30"
                    : "bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white"
                }`}
                title="Toggle WebAudio Proximity Siren & Hindi Speech Announcer"
              >
                <span>{soundEnabled ? "🔊 Sound Siren ON" : "🔇 Sound Siren Muted"}</span>
              </button>

              {/* View Mode Toggle */}
              <div className="bg-slate-900/90 border border-slate-800 p-1 rounded-xl flex items-center gap-1 shadow-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("interactive")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    viewMode === "interactive" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  📱 Phone Simulator
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("gallery")}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    viewMode === "gallery" ? "bg-blue-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
                  }`}
                >
                  🗂️ 48-Screen Grid
                </button>
              </div>

              {/* Telemetry Panel Toggle on Desktop */}
              <button
                type="button"
                onClick={() => setShowTelemetryDock(!showTelemetryDock)}
                className="hidden lg:flex px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold items-center gap-1"
                title="Toggle Side Telemetry & Simulation Remote"
              >
                <span>{showTelemetryDock ? "Hide Remote ✕" : "Show Remote 🛠️"}</span>
              </button>
            </div>
          </div>

          {/* User's Exact Floating Pill Cluster Bar */}
          <div className="w-full max-w-4xl bg-[#0B132B]/90 backdrop-blur-md border border-slate-800/90 rounded-2xl p-2 shadow-2xl overflow-x-auto scrollbar-none">
            <div className="flex items-center gap-1.5 min-w-max justify-center">
              {quickStages.map((stage) => {
                const isActive = currentScreenId === stage.id;
                return (
                  <button
                    key={stage.id}
                    type="button"
                    onClick={() => {
                      setCurrentScreenId(stage.id);
                      if (viewMode === "gallery") setViewMode("interactive");
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 border shadow-2xs ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-400 shadow-md scale-102"
                        : `bg-slate-900/80 ${stage.bg}`
                    }`}
                  >
                    <span>{stage.label}</span>
                    {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </header>

      {/* ========================================================= */}
      {/* 2. MAIN SIMULATOR VIEWPORT WITH REALISTIC PHONE FRAME     */}
      {/* ========================================================= */}
      <main className="relative z-20 flex-1 flex items-center justify-center py-6 px-3">
        {viewMode === "interactive" ? (
          <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8">
            
            {/* Center: Hyper-Realistic Mobile Smartphone Frame */}
            <div className="flex flex-col items-center">
              {/* Outer Metallic Bezel */}
              <div className="relative w-full max-w-[395px] bg-[#111827] rounded-[52px] p-3 shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95),0_0_50px_rgba(30,58,138,0.3)] border-[8px] border-[#1F2937] ring-1 ring-white/10 ring-offset-2 ring-offset-[#0A0F1E]">
                
                {/* Smartphone Hardware Rockers (Left Volume, Right Power) */}
                <div className="absolute -left-3 top-24 w-1 h-12 bg-slate-700 rounded-l-md"></div>
                <div className="absolute -left-3 top-40 w-1 h-12 bg-slate-700 rounded-l-md"></div>
                <div className="absolute -right-3 top-32 w-1 h-16 bg-slate-700 rounded-r-md"></div>

                {/* Inner Screen Container */}
                <div className="rider-simulator-frame rider-phone-viewport phone-screen-container no-scrollbar scrollbar-none bg-white rounded-[40px] overflow-hidden shadow-inner flex flex-col justify-between relative h-[720px] max-h-[84vh]">
                  
                  {/* Phone Status Bar (19:04, Center Punch-Hole Camera, Battery) */}
                  <div className="px-5 pt-2.5 pb-1 bg-slate-950 text-white flex items-center justify-between text-[11px] font-semibold shrink-0 select-none z-30">
                    <span className="font-mono font-bold">{currentTime}</span>
                    
                    {/* Centered Camera Punch-Hole */}
                    <div className="w-3.5 h-3.5 bg-black rounded-full border border-slate-800 shadow-inner ring-1 ring-slate-900 mx-auto"></div>

                    <div className="flex items-center gap-1.5 font-mono text-[10px]">
                      <span>5G</span>
                      <span>📶</span>
                      <span>🔋 94%</span>
                    </div>
                  </div>

                  {/* Active Screen Viewport (High-Contrast Kinetic Trust Theme - Scrollbar Hidden) */}
                  <div
                    className="rider-phone-viewport no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-1 overflow-y-auto bg-[#FAF8FF] text-[#0F172A] relative flex flex-col justify-between"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                  >
                    {activeScreenObj.component}
                  </div>

                  {/* Bottom Home Indicator Bar */}
                  <div className="py-1.5 bg-white/95 shrink-0 flex justify-center z-30 border-t border-slate-100">
                    <div className="w-32 h-1 bg-slate-300 rounded-full"></div>
                  </div>

                </div>

              </div>

              {/* Sub-Phone Screen Indicator Badge */}
              <div className="mt-3 text-center">
                <span className="text-xs font-mono font-bold text-slate-400">
                  Screen ID: S{String(activeScreenObj.id).padStart(2, "0")} / 48 · {activeScreenObj.title}
                </span>
              </div>
            </div>

            {/* Right: Floating Fleet Telemetry & Simulation Remote Deck */}
            {showTelemetryDock && (
              <div className="w-full max-w-md lg:max-w-sm space-y-4">
                
                {/* 1. Fleet Telemetry Card */}
                <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Active Fleet Partner</span>
                      <strong className="text-sm font-black text-white block mt-0.5">{rider.full_name || "New Fleet Partner"} · {rider.vehicle_number || "UP 40"}</strong>
                      <span className="text-[10px] text-emerald-400 font-bold">Gold Tier ⭐ 4.92 (Bahraich Fleet)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleDuty()}
                      className={`px-3 py-1.5 rounded-full text-xs font-black shadow-sm transition flex items-center gap-1.5 ${
                        isOnline
                          ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                          : "bg-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-slate-950 animate-ping" : "bg-slate-500"}`}></span>
                      <span>{isOnline ? "ONLINE" : "OFFLINE"}</span>
                    </button>
                  </div>

                  {/* Real-Time Balances */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-bold text-blue-400 uppercase block">Wallet Balance</span>
                      <strong className="text-base font-black text-white font-mono">₹{walletBalance}.00</strong>
                      <span className="text-[9px] text-emerald-400 block mt-0.5">+₹45 per delivery</span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                      <span className="text-[10px] font-bold text-amber-400 uppercase block">Cash in Hand (COD)</span>
                      <strong className="text-base font-black text-amber-300 font-mono">₹{cashInHand}</strong>
                      <span className="text-[9px] text-slate-400 block mt-0.5">Ceiling: ₹{cashCeiling}</span>
                    </div>
                  </div>

                  {/* Cash Ceiling Warning Meter */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Cash Limit Used</span>
                      <span>{Math.round((cashInHand / cashCeiling) * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          cashInHand >= cashCeiling ? "bg-red-500" : "bg-amber-400"
                        }`}
                        style={{ width: `${Math.min(100, (cashInHand / cashCeiling) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* 2. Interactive Simulation Workflow Triggers */}
                <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase text-white tracking-wider">⚡ 1-Tap Workflow Simulation</span>
                    <span className="text-[10px] text-blue-400 font-bold">Auto-Wiring</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => triggerIncomingOrderRadar(false)}
                      className="p-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-left transition flex items-center justify-between"
                    >
                      <span>🚨 Incoming Order Radar</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => confirmPickup()}
                      className="p-2.5 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-300 font-bold text-left transition flex items-center justify-between"
                    >
                      <span>🗺️ Live GPS Navigation</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentScreenId(13)}
                      className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-left transition flex items-center justify-between"
                    >
                      <span>🚪 Doorstep OTP (#4492)</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentScreenId(45)}
                      className="p-2.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-300 font-bold text-left transition flex items-center justify-between"
                    >
                      <span>🪙 Chutta / Wallet Refund</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentScreenId(15)}
                      className="p-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-bold text-left transition flex items-center justify-between"
                    >
                      <span>💰 Passbook Ledger</span>
                      <span>➔</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCurrentScreenId(48)}
                      className="p-2.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-bold text-left transition flex items-center justify-between"
                    >
                      <span>🪫 Critical Battery Safe</span>
                      <span>➔</span>
                    </button>
                  </div>
                </div>

                {/* 3. Screen Jump Selector Dropdown */}
                <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-4 shadow-xl space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
                    Jump to Any of the 48 Screens:
                  </label>
                  <select
                    value={currentScreenId}
                    onChange={(e) => setCurrentScreenId(Number(e.target.value))}
                    className="w-full text-xs font-bold bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-white focus:outline-none focus:border-blue-500"
                  >
                    {screens.map((sc) => (
                      <option key={sc.id} value={sc.id}>
                        S{String(sc.id).padStart(2, "0")} — {sc.title} [{sc.category.toUpperCase()}]
                      </option>
                    ))}
                  </select>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = screens.findIndex((s) => s.id === currentScreenId);
                        if (currentIndex > 0) setCurrentScreenId(screens[currentIndex - 1].id);
                      }}
                      className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-xs font-bold text-slate-300 transition"
                    >
                      ← Previous
                    </button>

                    <span className="text-[11px] font-mono text-slate-400">
                      {screens.findIndex((s) => s.id === currentScreenId) + 1} of 48
                    </span>

                    <button
                      type="button"
                      onClick={() => {
                        const currentIndex = screens.findIndex((s) => s.id === currentScreenId);
                        if (currentIndex < screens.length - 1) setCurrentScreenId(screens[currentIndex + 1].id);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-sm transition"
                    >
                      Next →
                    </button>
                  </div>
                </div>

              </div>
            )}

          </div>
        ) : (
          /* ========================================================= */
          /* VIEW 2: 48-SCREEN GRID GALLERY VIEW                       */
          /* ========================================================= */
          <div className="w-full max-w-7xl mx-auto space-y-6">
            
            {/* Category Filter Pills */}
            <div className="bg-[#0B132B]/90 backdrop-blur-md border border-slate-800 rounded-2xl p-2.5 shadow-xl overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setFilterCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      filterCategory === cat.id
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-slate-900/70 text-slate-400 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredScreens.map((screen) => (
                <div
                  key={screen.id}
                  className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl flex flex-col overflow-hidden hover:border-blue-500/60 transition group"
                >
                  {/* Card Header */}
                  <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-black text-white group-hover:text-blue-400 transition">
                        {screen.title}
                      </h3>
                      <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                        Stage: {screen.category}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setCurrentScreenId(screen.id);
                        setViewMode("interactive");
                      }}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-blue-600/30 text-blue-300 border border-blue-500/40 hover:bg-blue-600 hover:text-white transition"
                    >
                      Test in Simulator 📱
                    </button>
                  </div>

                  {/* Scaled Mini Phone Viewport */}
                  <div className="p-4 bg-slate-950/60 flex justify-center flex-1">
                    <div className="w-full max-w-[320px] bg-white rounded-2xl border border-slate-700 shadow-inner overflow-hidden min-h-[440px] max-h-[440px] flex flex-col no-scrollbar scrollbar-none">
                      <div
                        className="flex-1 overflow-y-auto transform scale-[0.88] origin-top text-slate-900 no-scrollbar scrollbar-none [&::-webkit-scrollbar]:hidden"
                        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                      >
                        {screen.component}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        )}
      </main>

      {/* ========================================================= */}
      {/* 3. PERSISTENT FOOTER STATUS BAR                           */}
      {/* ========================================================= */}
      <footer className="relative z-30 bg-[#060913]/90 border-t border-slate-800/80 py-3 px-4 text-xs">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-slate-400 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-semibold text-slate-300">Localhost Active:</span>
            <code className="bg-slate-900 px-2 py-0.5 rounded font-mono font-bold text-blue-400 border border-slate-800">
              http://localhost:3000/rider-preview
            </code>
          </div>

          <span className="text-[11px] text-slate-500">
            Trustit Hyperlocal Delivery Network · 48 Screens Kinetic Trust Architecture
          </span>
        </div>
      </footer>

    </div>
  );
}
