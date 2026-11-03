"use client";

import React, { useState } from "react";

interface Screen47Props {
  onBack?: () => void;
}

export default function Screen47TicketDeskDisputes({ onBack }: Screen47Props) {
  const [ticketSubject, setTicketSubject] = useState("");
  const [category, setCategory] = useState("rider_delay");
  const [submitted, setSubmitted] = useState(false);

  const handleTicket = () => {
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setTicketSubject("");
    }, 2000);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              FORMAL ESCALATION DESK
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Create Support Ticket
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

        {/* Existing Open Tickets */}
        <div className="mt-2.5 bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase">
              Recent Ticket #TCK-4819
            </span>
            <span className="text-[9px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
              In Review by Ops
            </span>
          </div>
          <h4 className="font-bold text-slate-900">Rider arrived 8 mins late for Order #ORD-7740</h4>
          <p className="text-[10px] text-slate-500">Submitted today 11:20 AM • Priority: Normal</p>
        </div>

        {/* Create Ticket Form */}
        <div className="mt-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
          <h3 className="text-xs font-black text-slate-900">Raise New Dispute / Inquiry</h3>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Issue Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:outline-hidden"
            >
              <option value="rider_delay">Rider Delay / Missing Fleet Pickup</option>
              <option value="payment_settlement">Bank Payout / Settlement Query</option>
              <option value="standee_damage">Physical Standee Damage / Reprint</option>
              <option value="customer_dispute">Customer Refund / Review Dispute</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Brief Description &amp; Order ID
            </label>
            <textarea
              rows={3}
              placeholder="Explain what happened so our team can investigate..."
              value={ticketSubject}
              onChange={(e) => setTicketSubject(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 bg-slate-50 focus:outline-hidden"
            ></textarea>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {submitted ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Ticket #TCK-4820 Created! Ops team will call you within 15 mins.
          </div>
        ) : (
          <button
            type="button"
            onClick={handleTicket}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition"
          >
            Submit Dispute Ticket →
          </button>
        )}
      </div>
    </div>
  );
}
