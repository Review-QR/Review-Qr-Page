"use client";

import React from "react";

interface DongleSliderSwitchProps {
  isOn: boolean;
  onToggle: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}

/**
 * Premium iOS/Android hardware-style sliding toggle switch (dongle).
 * Replaces bulky text buttons with a sleek, tactile sliding circle knob.
 */
export default function DongleSliderSwitch({
  isOn,
  onToggle,
  disabled = false,
  size = "md",
}: DongleSliderSwitchProps) {
  const isSm = size === "sm";

  return (
    <div
      role="switch"
      aria-checked={isOn}
      tabIndex={0}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onToggle();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          if (!disabled) onToggle();
        }
      }}
      className={`inline-flex items-center gap-1.5 cursor-pointer select-none transition-opacity focus:outline-hidden ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-95 active:scale-95"
      }`}
      title={isOn ? "Dukaan ONLINE hai (Orders Active) - Tap to pause" : "Dukaan OFFLINE hai (Orders Paused) - Tap to go online"}
    >
      {/* Sliding Track */}
      <div
        className={`relative flex items-center rounded-full transition-colors duration-300 shadow-inner ${
          isSm ? "w-9 h-5 p-0.5" : "w-11 h-6 p-0.5"
        } ${isOn ? "bg-emerald-500 shadow-emerald-600/30" : "bg-rose-500 shadow-rose-600/30"}`}
      >
        {/* Sliding Circular Knob */}
        <div
          className={`bg-white rounded-full shadow-md transform transition-transform duration-300 ease-out flex items-center justify-center shrink-0 ${
            isSm ? "w-4 h-4" : "w-5 h-5"
          } ${
            isOn
              ? isSm
                ? "translate-x-4"
                : "translate-x-5"
              : "translate-x-0"
          }`}
        >
          {/* Subtle inner status indicator dot */}
          <span
            className={`rounded-full transition-colors ${
              isSm ? "w-1 h-1" : "w-1.5 h-1.5"
            } ${isOn ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
          />
        </div>
      </div>

      {/* Sleek Minimal Label */}
      <span
        className={`font-black tracking-wider uppercase font-mono ${
          isSm ? "text-[8px]" : "text-[9px]"
        } ${isOn ? "text-emerald-700" : "text-rose-700"}`}
      >
        {isOn ? "ONLINE" : "OFFLINE"}
      </span>
    </div>
  );
}
