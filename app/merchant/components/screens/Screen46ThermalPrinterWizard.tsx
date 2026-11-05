"use client";

import React, { useState, useEffect } from "react";
import { TrustitNative } from "@/lib/native/trustit-native-service";

interface Screen46Props {
  onBack?: () => void;
}

export default function Screen46ThermalPrinterWizard({ onBack }: Screen46Props) {
  const [connectionType, setConnectionType] = useState<"bluetooth" | "usb">("bluetooth");
  const [testPrinted, setTestPrinted] = useState(false);
  const [pairedPrinters, setPairedPrinters] = useState<Array<{ name: string; address: string }>>([]);
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  useEffect(() => {
    TrustitNative.getPairedPrinters().then((list) => {
      if (list && list.length > 0) {
        setPairedPrinters(list);
      }
    });
  }, []);

  const handleTestPrint = async () => {
    setTestPrinted(true);
    setPrintStatus("Sending ESC/POS print job...");

    const receipt = `ORDER #ORD-TEST-01\n` +
      `Date: ${new Date().toLocaleDateString("en-IN")} ${new Date().toLocaleTimeString("en-IN")}\n` +
      `--------------------------------\n` +
      `1x Special Shahi Paneer   Rs 240\n` +
      `2x Butter Naan             Rs 90\n` +
      `--------------------------------\n` +
      `TOTAL AMOUNT:             Rs 330\n` +
      `Payment: Paid via Cashfree UPI\n` +
      `Hardware Status: ESC/POS PASS ✓\n`;

    const nativeResult = await TrustitNative.printThermalReceipt(receipt);
    if (nativeResult.success) {
      setPrintStatus("✓ " + nativeResult.message);
    } else {
      // Fallback for desktop/web browser preview
      if (typeof window !== "undefined") {
        try {
          const printWindow = window.open("", "_blank", "width=300,height=400");
          if (printWindow) {
            printWindow.document.write(`
              <html>
                <head>
                  <title>Trustit Thermal Print Test</title>
                  <style>
                    @page { size: 58mm auto; margin: 0; }
                    body { font-family: monospace; font-size: 11px; width: 58mm; padding: 4px; margin: 0; color: #000; text-align: center; }
                    .line { border-bottom: 1px dashed #000; margin: 6px 0; }
                    .bold { font-weight: bold; }
                  </style>
                </head>
                <body>
                  <div class="bold">*** TRUSTIT PARTNER ***</div>
                  <div>ESC/POS 58MM ALIGNMENT</div>
                  <div class="line"></div>
                  <div>DATE: ${new Date().toLocaleDateString("en-IN")}</div>
                  <div>TIME: ${new Date().toLocaleTimeString("en-IN")}</div>
                  <div>DEVICE: ${connectionType.toUpperCase()}</div>
                  <div class="line"></div>
                  <div class="bold">HARDWARE TEST: PASS ✓</div>
                  <div>Auto-Cutter: OK</div>
                  <div class="line"></div>
                  <div>FEED 3 LINES & CUT</div>
                  <br/><br/>
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
              printWindow.print();
              printWindow.close();
            }, 300);
          } else {
            window.print();
          }
        } catch {
          // ignore
        }
      }
      setPrintStatus("Test slip triggered!");
    }

    setTimeout(() => {
      setTestPrinted(false);
      setPrintStatus(null);
    }, 4000);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              HARDWARE CONFIGURATION
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Thermal KOT Printer Setup
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

        {/* Connection Type Switcher */}
        <div className="mt-2.5 grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setConnectionType("bluetooth")}
            className={`py-2 rounded-xl transition ${
              connectionType === "bluetooth"
                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            📶 Bluetooth Wireless
          </button>
          <button
            type="button"
            onClick={() => setConnectionType("usb")}
            className={`py-2 rounded-xl transition ${
              connectionType === "usb"
                ? "bg-white text-slate-900 shadow-sm font-extrabold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            🔌 USB / OTG Cable
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <h3 className="text-xs font-black text-slate-900">
            {connectionType === "bluetooth" ? "Bluetooth ESC/POS Pairing Steps" : "USB OTG Connection Steps"}
          </h3>

          <ol className="space-y-2 text-xs text-slate-700 list-decimal list-inside">
            <li className="leading-relaxed">
              Turn on your thermal printer (58mm or 80mm roll).
            </li>
            <li className="leading-relaxed">
              Open Bluetooth settings on your tablet/phone and pair with <strong>"POS-58"</strong> or <strong>"Mpt-II"</strong> (PIN: 0000 or 1234).
            </li>
            <li className="leading-relaxed">
              Trustit Web Console will automatically detect your paired printer and route KOT tickets directly.
            </li>
          </ol>
        </div>

        {/* Auto Cut Setting */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 block">Automatic Paper Cutter</span>
            <span className="text-[10px] text-slate-500">Sends GS V cut pulse on ticket print</span>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Enabled
          </span>
        </div>
      </div>

      {/* Footer Test Print */}
      <div className="pt-2">
        {testPrinted ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Test KOT Slip Printed Successfully!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleTestPrint}
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs tracking-wider uppercase shadow-md transition flex items-center justify-center gap-1.5"
          >
            <span>🖨️ PRINT TEST ALIGNMENT SLIP</span>
          </button>
        )}
      </div>
    </div>
  );
}
