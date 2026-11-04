"use client";

import React, { useState } from "react";

interface Screen10Props {
  order?: any;
  onBack?: () => void;
  onPrintKot?: (order: any) => void;
  onDispatchRider?: (order: any) => void;
  onMarkReady?: (orderId: string) => void;
  onVerifyDeliver?: (orderId: string, otp: string) => void;
}

export default function Screen10OrderDetailDrawer({
  order,
  onBack,
  onPrintKot,
  onDispatchRider,
  onMarkReady,
  onVerifyDeliver,
}: Screen10Props) {
  const [deliveryOtpInput, setDeliveryOtpInput] = useState("");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccess, setOtpSuccess] = useState<boolean>(false);

  const orderId = order?.id || "ORD-7783-09";
  const customerName = order?.customer_name || "Aman Sharma";
  const customerPhone = order?.customer_phone || "9118643415";
  const customerAddress = order?.customer_address || "Civil Lines, Near Indira Gandhi Stadium, Bahraich";
  const paymentMode = order?.payment_mode === "cod" ? "Cash on Delivery" : "Cashfree UPI Paid";
  const isPaid = order?.payment_status === "paid" || order?.payment_mode !== "cod";
  const status = order?.status || "placed";
  const rawItems = order?.hyperlocal_order_items || order?.items || [];
  const items = Array.isArray(rawItems) && rawItems.length > 0 ? rawItems : [
    { item_name: "Madhur Pure Sugar (5kg)", quantity: 1, unit_price: 215, total_price: 215 },
    { item_name: "Aashirvaad Shudh Chakki Atta (10kg)", quantity: 1, unit_price: 410, total_price: 410 },
  ];
  const totalAmount = order?.total_amount || items.reduce((acc: number, it: any) => acc + (it.total_price || 0), 0);

  const handleVerifyOtp = () => {
    if (!deliveryOtpInput.trim() || deliveryOtpInput.trim().length !== 4) {
      setOtpError("Kripya 4-digit numeric OTP daalein.");
      return;
    }
    setOtpError(null);
    if (onVerifyDeliver) {
      onVerifyDeliver(orderId, deliveryOtpInput.trim());
      setOtpSuccess(true);
    }
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              ORDER INSPECTOR • LIVE
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Order #{orderId.slice(-8)}
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200 cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* Customer & Address Card */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-extrabold text-slate-900 text-sm">{customerName}</h2>
              <p className="text-[10px] text-slate-500">Hyperlocal Delivery • Status: <span className="uppercase font-bold text-blue-700">{status}</span></p>
            </div>
            <a
              href={`tel:${customerPhone}`}
              className="px-2.5 py-1 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
            >
              📞 Call {customerPhone.slice(-4)}
            </a>
          </div>

          <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span className="font-bold text-slate-800 block">Delivery Address:</span>
            <span>{customerAddress}</span>
          </div>

          {order?.delivery_otp && (
            <div className="mt-1 p-2 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-900 uppercase">Customer Handover OTP:</span>
              <span className="font-mono font-black text-xs text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-300">
                {order.delivery_otp}
              </span>
            </div>
          )}
        </div>

        {/* Itemized Order Table */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
            Itemized Bill ({items.length} Items)
          </h3>

          <div className="space-y-2 text-xs">
            {items.map((it: any, idx: number) => (
              <div key={idx} className="flex justify-between items-start pb-2 border-b border-slate-100 last:border-b-0">
                <div>
                  <p className="font-bold text-slate-900">
                    {it.quantity || 1} × {it.item_name || it.name || "Item"}
                  </p>
                  <span className="text-[10px] text-slate-500 font-mono">₹{it.unit_price || it.price} each</span>
                </div>
                <span className="font-mono font-bold text-slate-800">₹{it.total_price || (it.unit_price || it.price) * (it.quantity || 1)}</span>
              </div>
            ))}
          </div>

          {/* Pricing Breakdown */}
          <div className="pt-2 space-y-1 text-[11px] text-slate-600 border-t border-slate-100">
            <div className="flex justify-between text-xs font-black text-slate-950 pt-1.5 border-t border-slate-200">
              <div className="flex items-center gap-1.5">
                <span>Total Bill:</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                  isPaid ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}>
                  {paymentMode}
                </span>
              </div>
              <span className="font-mono text-sm text-emerald-700">₹{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* Delivery OTP Handover Verification Box */}
        {status !== "delivered" && (
          <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
            <span className="text-[10px] font-black uppercase text-slate-700 block">
              Handover Customer Delivery OTP (4 Digits)
            </span>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={deliveryOtpInput}
                onChange={(e) => setDeliveryOtpInput(e.target.value.replace(/\D/g, ""))}
                placeholder="Enter 4-digit OTP"
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-center tracking-widest bg-slate-50 focus:outline-hidden focus:border-blue-600"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                ✓ Verify &amp; Handover
              </button>
            </div>
            {otpError && <p className="text-[10px] text-rose-600 font-bold">{otpError}</p>}
            {otpSuccess && <p className="text-[10px] text-emerald-700 font-bold">✓ Order successfully marked delivered!</p>}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-3 grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={() => onPrintKot?.(order)}
          className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>🖨️ KOT</span>
        </button>
        <button
          type="button"
          onClick={() => onMarkReady?.(orderId)}
          className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>✓ Ready</span>
        </button>
        <button
          type="button"
          onClick={() => onDispatchRider?.(order)}
          className="py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          <span>🛵 Rider</span>
        </button>
      </div>
    </div>
  );
}
