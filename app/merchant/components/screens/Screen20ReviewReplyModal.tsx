"use client";

import React, { useState } from "react";

interface Screen20Props {
  customerName?: string;
  onBack?: () => void;
  onSendReply?: () => void;
}

export default function Screen20ReviewReplyModal({
  customerName = "Dr. Ananya Mishra",
  onBack,
  onSendReply,
}: Screen20Props) {
  const [replyText, setReplyText] = useState(
    `Thank you so much ${customerName}! We take great pride in maintaining spotless hygiene and quick service. Looking forward to your next visit!`
  );
  const [attachCoupon, setAttachCoupon] = useState<boolean>(true);
  const [sentNotice, setSentNotice] = useState<boolean>(false);

  const handlePost = () => {
    setSentNotice(true);
    setTimeout(() => {
      setSentNotice(false);
      onSendReply?.();
    }, 1200);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              PUBLIC ENGAGEMENT
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Reply to {customerName}
            </h1>
          </div>
          <button
            type="button"
            onClick={onBack}
            className="text-xs text-slate-500 hover:text-slate-900 px-2 py-1 rounded-lg bg-white border border-slate-200"
          >
            ✕ Close
          </button>
        </div>

        {/* Customer Review Summary */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-extrabold text-slate-900">{customerName}</span>
            <span className="text-amber-500 font-bold">★★★★★</span>
          </div>
          <p className="text-[11px] text-slate-600 italic">
            "Clean tables, hygienic preparation, and quick order fulfillment."
          </p>
        </div>

        {/* Reply Composer */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-2">
          <label className="text-[10px] font-bold uppercase text-slate-500 block">
            Owner Response (Publicly Visible on Trustit Profile)
          </label>
          <textarea
            rows={4}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-slate-50 focus:outline-hidden focus:border-blue-600"
          ></textarea>

          {/* Attach Coupon Switch */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">🎁</span>
              <div>
                <span className="text-xs font-bold text-slate-900 block">Attach Thank-You Coupon</span>
                <span className="text-[9px] text-slate-500">10% Off next visit (Code: THANKS10)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAttachCoupon(!attachCoupon)}
              className={`w-9 h-5 rounded-full transition relative p-0.5 ${
                attachCoupon ? "bg-emerald-600" : "bg-slate-300"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition shadow-xs ${
                  attachCoupon ? "translate-x-4" : "translate-x-0"
                }`}
              ></div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="pt-2">
        {sentNotice ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Public Response Published &amp; Customer Notified!
          </div>
        ) : (
          <button
            type="button"
            onClick={handlePost}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
          >
            Publish Response Publicly →
          </button>
        )}
      </div>
    </div>
  );
}
