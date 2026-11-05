"use client";

import React, { useState } from "react";

interface Screen24Props {
  onBack?: () => void;
  onRaiseComplaint?: () => void;
  storeName?: string;
}

export default function Screen24OrderTrackingWaybill({
  onBack,
  onRaiseComplaint,
  storeName = "Shri Balaji Daily Needs",
}: Screen24Props) {
  const [showArtworkModal, setShowArtworkModal] = useState<boolean>(false);
  const steps = [
    { label: "Order Placed & Paid", time: "Today, 10:15 AM", done: true },
    { label: "Vector Artwork Approved", time: "Today, 11:30 AM", done: true },
    { label: "Laser UV Printing in Progress", time: "Today, 02:45 PM", done: true },
    { label: "Handed to BlueDart Express", time: "Expected Tomorrow", done: false },
    { label: "Delivered at Cafe Counter", time: "Thursday, Nov 05", done: false },
  ];

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              SHIPMENT TRACKER
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Order #KIT-9821-BLOSSOM
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ← Back
          </button>
        </div>

        {/* Courier Waybill Card */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Courier Partner
            </span>
            <span className="font-mono text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
              BlueDart / Shiprocket Air
            </span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-slate-100">
            <div>
              <span className="text-[10px] text-slate-500 block">Waybill / AWB No:</span>
              <span className="font-mono font-bold text-slate-900">BD-8849-2041-UP</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ● In Production
            </span>
          </div>
        </div>

        {/* Timeline Progression */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2.5">
            Production &amp; Dispatch Timeline
          </h3>

          <div className="space-y-3 relative pl-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {steps.map((st, i) => (
              <div key={i} className="relative flex items-start gap-2.5 text-xs">
                <span
                  className={`absolute -left-4 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center text-[8px] font-bold ${
                    st.done
                      ? "bg-blue-600 border-blue-600 text-white shadow-2xs"
                      : "bg-white border-slate-300 text-slate-300"
                  }`}
                >
                  {st.done ? "✓" : ""}
                </span>
                <div>
                  <h4 className={`font-bold ${st.done ? "text-slate-900" : "text-slate-400"}`}>
                    {st.label}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-mono">{st.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* View Artwork Proof */}
        <div className="mt-2.5 bg-slate-50 border border-slate-200 rounded-2xl p-2.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-base">🔍</span>
            <span className="font-bold text-slate-800">Final Laser UV Artwork Proof</span>
          </div>
          <button
            type="button"
            onClick={() => setShowArtworkModal(true)}
            className="text-[10px] font-bold text-blue-600 hover:text-blue-800 px-2 py-1 rounded-lg hover:bg-blue-50 transition cursor-pointer"
          >
            Inspect PDF →
          </button>
        </div>
      </div>

      {/* Footer Support */}
      <div className="pt-2">
        <button
          type="button"
          onClick={onRaiseComplaint}
          className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 font-bold text-xs border border-slate-200 transition cursor-pointer"
        >
          Raise Issue / Request Replacement
        </button>
      </div>

      {/* Artwork Inspection Modal */}
      {showArtworkModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200">
              <h4 className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                <span>🪪</span>
                <span>Standee Laser UV Proof</span>
              </h4>
              <button
                type="button"
                onClick={() => setShowArtworkModal(false)}
                className="w-6 h-6 rounded-full bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Official Blue Dart / DTDC Shipping Label & Standee Artwork Card */}
            <div className="p-3 bg-slate-900 text-white rounded-2xl border border-slate-700 space-y-2.5">
              <div className="flex justify-between items-center text-[10px] pb-2 border-b border-slate-800">
                <span className="font-bold text-amber-400">BLUE DART AIR CARGO</span>
                <span className="font-mono text-slate-300">AWB: BD-88914022-IN</span>
              </div>

              {/* Waybill Barcode Simulation */}
              <div className="bg-white p-2 rounded-xl text-center">
                <div className="font-mono text-[9px] text-slate-600 mb-0.5 tracking-wider font-bold">
                  *BD88914022IN*
                </div>
                <div className="h-7 w-full flex items-center justify-center gap-0.5 px-2">
                  {[3,1,4,2,1,3,2,1,4,1,2,3,1,2,4,1,3,2,1,4,2,1,3,2,4,1,2,3,1,4,2].map((w, i) => (
                    <div
                      key={i}
                      className="h-full bg-black"
                      style={{ width: `${w * 1.5}px` }}
                    />
                  ))}
                </div>
                <div className="text-[8px] font-mono text-slate-800 mt-1 font-bold">
                  DEST: BHR / BAHRAICH HUB • ROUTE: LKO-BHR-01
                </div>
              </div>

              {/* Laser Proof Specs */}
              <div className="text-[10px] space-y-1 text-slate-300 bg-slate-800/80 p-2.5 rounded-xl border border-slate-700">
                <div className="flex justify-between font-bold text-white">
                  <span>Merchant:</span>
                  <span className="text-amber-300">{storeName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Specification:</span>
                  <span>Cast Acrylic (3mm) + UV Print</span>
                </div>
                <div className="flex justify-between">
                  <span>Standee Type:</span>
                  <span>Dual QR (Google Review + UPI)</span>
                </div>
                <div className="flex justify-between">
                  <span>Laser Serial:</span>
                  <span className="font-mono text-blue-300">TR-UV-2026-9904</span>
                </div>
              </div>
            </div>

            <div className="pt-1 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const printWin = window.open("", "_blank");
                    if (printWin) {
                      printWin.document.write(`
                        <html>
                          <head>
                            <title>Waybill BD-88914022-IN - ${storeName}</title>
                            <style>
                              body { font-family: monospace; padding: 20px; font-size: 12px; }
                              .label { border: 2px solid black; padding: 15px; width: 380px; }
                              h2 { margin: 0 0 5px 0; }
                              .barcode { font-size: 24px; letter-spacing: 4px; font-weight: bold; margin: 10px 0; }
                            </style>
                          </head>
                          <body>
                            <div class="label">
                              <h2>BLUE DART AIR LOGISTICS</h2>
                              <p>AWB: BD-88914022-IN • EXPRESS EXPEDITE</p>
                              <hr/>
                              <p><strong>CONSIGNEE:</strong><br/>${storeName}<br/>Civil Lines near Indira Gandhi Stadium<br/>Bahraich, UP - 271801<br/>Phone: +91 91186 43415</p>
                              <div class="barcode">||| | |||| || ||| || ||||</div>
                              <p>CONTENTS: Acrylic Laser UV Standee & Stand<br/>WEIGHT: 0.450 KG • VALUE: PRE-PAID</p>
                            </div>
                            <script>window.onload = function() { window.print(); };</script>
                          </body>
                        </html>
                      `);
                      printWin.document.close();
                    }
                  }}
                  className="flex-1 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>🖨️</span>
                  <span>Print 4x6 Waybill</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Create direct downloadable vector proof
                    const blob = new Blob([`
                      <svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
                        <rect width="600" height="800" rx="30" fill="#0B132B"/>
                        <rect x="40" y="40" width="520" height="720" rx="20" fill="#1C2541" stroke="#F59E0B" stroke-width="4"/>
                        <text x="300" y="100" fill="#F59E0B" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">TRUSTIT VERIFIED MERCHANDISE</text>
                        <text x="300" y="160" fill="#FFFFFF" font-family="sans-serif" font-size="26" font-weight="900" text-anchor="middle">${storeName}</text>
                        <text x="300" y="200" fill="#94A3B8" font-family="sans-serif" font-size="14" text-anchor="middle">Civil Lines, Bahraich - 271801</text>
                        <rect x="150" y="250" width="300" height="300" rx="16" fill="#FFFFFF"/>
                        <text x="300" y="410" fill="#000000" font-family="monospace" font-size="24" font-weight="bold" text-anchor="middle">[ QR CODE ]</text>
                        <text x="300" y="600" fill="#38BDF8" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">SCAN TO PAY VIA UPI &amp; REVIEW ON GOOGLE</text>
                        <text x="300" y="660" fill="#64748B" font-family="monospace" font-size="12" text-anchor="middle">LASER SPEC: 3MM ACRYLIC • UV CURED INK • BASE: TEAK WOOD</text>
                      </svg>
                    `], { type: "image/svg+xml" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Waybill_Proof_${storeName.replace(/\s+/g, "_")}.svg`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="flex-1 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <span>⬇️</span>
                  <span>Download SVG Proof</span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowArtworkModal(false)}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Close Inspection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
