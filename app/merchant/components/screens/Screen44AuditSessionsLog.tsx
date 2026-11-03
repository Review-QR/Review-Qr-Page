"use client";

import React, { useState } from "react";

interface Screen44Props {
  onBack?: () => void;
}

export default function Screen44AuditSessionsLog({ onBack }: Screen44Props) {
  const [loggedOutNotice, setLoggedOutNotice] = useState(false);

  const sessions = [
    { device: "Chrome on Windows 11 (This Machine)", ip: "103.21.14.88", location: "Bahraich, UP", time: "Active Now", current: true },
    { device: "Samsung Galaxy Tab A9 (Counter POS)", ip: "103.21.14.92", location: "Civil Lines Hub", time: "Active 10 mins ago", current: false },
    { device: "OnePlus 11 (Owner Phone)", ip: "49.36.18.210", location: "Bahraich, UP", time: "Active 2 hours ago", current: false },
  ];

  const handleLogoutAll = () => {
    setLoggedOutNotice(true);
    setTimeout(() => setLoggedOutNotice(false), 1800);
  };

  return (
    <div className="w-full h-full bg-[#F8FAFC] flex flex-col justify-between p-3.5 sm:p-4 text-[#0F172A] font-sans overflow-y-auto">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between pb-2.5 border-b border-slate-200">
          <div>
            <span className="text-[10px] font-black uppercase text-blue-700 tracking-wider">
              DEVICE SECURITY
            </span>
            <h1 className="text-xs font-black text-slate-900 leading-tight">
              Active Sessions &amp; Audit Log
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

        {/* Sessions List */}
        <div className="mt-3 space-y-2">
          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">
            Authorized Hardware Devices (3 Logged In)
          </span>

          {sessions.map((sess, i) => (
            <div
              key={i}
              className="bg-white border border-slate-200 rounded-2xl p-3 shadow-2xs space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{sess.device}</h4>
                  <p className="text-[10px] text-slate-500">{sess.location} • {sess.ip}</p>
                </div>
                {sess.current ? (
                  <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                    ● Current Session
                  </span>
                ) : (
                  <span className="text-[9px] font-mono text-slate-400">
                    {sess.time}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-2">
        {loggedOutNotice ? (
          <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs text-center shadow-xs">
            ✓ Logged out from all other counter tablets!
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogoutAll}
            className="w-full py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition"
          >
            Log Out All Other Hardware Sessions ✕
          </button>
        )}
      </div>
    </div>
  );
}
