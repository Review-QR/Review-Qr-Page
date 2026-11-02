"use client";

import React, { useEffect, useRef, useState } from "react";
import "./trustit-standee.css";

export type StandeeTheme = {
  id: string;
  number: number;
  label: string; // "Template 01", etc.
  name: string;
  pillColor: string;
  pillBg: string;
  pillBorder: string;
  primary: string;
  secondary?: string;
  tagline: string;
  templateType: 1 | 2 | 3 | 4 | 5;
};

export const STANDEE_THEMES: StandeeTheme[] = [
  {
    id: "template_1",
    number: 1,
    label: "Template 01",
    name: "Sunset Waves",
    pillColor: "#b8330c",
    pillBg: "#fde4cf",
    pillBorder: "#fde4cf",
    primary: "#EA580C",
    tagline: "Scan to Review on Trustit",
    templateType: 1,
  },
  {
    id: "template_2",
    number: 2,
    label: "Template 02",
    name: "Cobalt Blue Frame",
    pillColor: "#12295e",
    pillBg: "#d6e8ff",
    pillBorder: "#d6e8ff",
    primary: "#0d63de",
    tagline: "Review & Support Local Business",
    templateType: 2,
  },
  {
    id: "template_3",
    number: 3,
    label: "Template 03",
    name: "Rainbow Prism",
    pillColor: "#13351f",
    pillBg: "#d8f1d8",
    pillBorder: "#d8f1d8",
    primary: "#1fa24a",
    tagline: "Scan to Review on Trustit",
    templateType: 3,
  },
  {
    id: "template_4",
    number: 4,
    label: "Template 04",
    name: "Corner Arcs",
    pillColor: "#2a1747",
    pillBg: "#e6dcfb",
    pillBorder: "#e6dcfb",
    primary: "#1561dc",
    tagline: "Scan to Review on Trustit",
    templateType: 4,
  },
  {
    id: "template_5",
    number: 5,
    label: "Template 05",
    name: "Warm Amber",
    pillColor: "#1a1a1a",
    pillBg: "#fde4cf",
    pillBorder: "#fde4cf",
    primary: "#e8530a",
    tagline: "Delicious Food, Happy People",
    templateType: 5,
  },
];

export type ModernStandeeProps = {
  standeeIndex?: number;
  businessName: string;
  businessType?: string | null;
  qrUrl: string;
  usable: boolean;
  tagline?: string;
  categoryConfig?: unknown;
  compact?: boolean;
};

export function ModernStandee({
  standeeIndex = 0,
  businessName,
  qrUrl,
  usable,
  tagline,
}: ModernStandeeProps) {
  const safeIndex = Math.abs(standeeIndex) % STANDEE_THEMES.length;
  const theme = STANDEE_THEMES[safeIndex];
  const templateClass = `t${theme.templateType}` as "t1" | "t2" | "t3" | "t4" | "t5";

  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const nameRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<number>(1);

  // Auto-fit scale on mobile devices (< 370px width) so standee never overflows
  useEffect(() => {
    function computeScale() {
      if (!containerRef.current) return;
      const parent = containerRef.current.parentElement;
      const available = parent ? parent.clientWidth : window.innerWidth;
      if (available > 0 && available < 370) {
        const s = Math.min(1, Math.max(0.65, (available - 16) / 350));
        setScale(s);
      } else {
        setScale(1);
      }
    }
    computeScale();
    window.addEventListener("resize", computeScale);
    return () => window.removeEventListener("resize", computeScale);
  }, []);

  // Generate QR code data URL at 2x resolution (424px) for 212px crisp display
  useEffect(() => {
    if (!usable || !qrUrl) return;
    let active = true;
    const target = qrUrl.includes("data=")
      ? decodeURIComponent(qrUrl.split("data=")[1].split("&")[0] || "")
      : qrUrl;

    import("qrcode")
      .then((mod) =>
        mod.default.toDataURL(target || qrUrl, {
          errorCorrectionLevel: "H",
          margin: 1,
          width: 424,
          color: { dark: "#0b1230", light: "#ffffff" },
        })
      )
      .then((url) => {
        if (active) setQrDataUrl(url);
      })
      .catch(() => {});

    return () => {
      active = false;
    };
  }, [qrUrl, usable]);

  // Dynamic font auto-fitting so long merchant names never overflow the 350px card
  useEffect(() => {
    const el = nameRef.current;
    if (!el) return;
    el.style.fontSize = "";
    let s = parseFloat(window.getComputedStyle(el).fontSize) || 29;
    while (el.scrollWidth > el.clientWidth && s > 14) {
      s -= 1;
      el.style.fontSize = `${s}px`;
    }
  }, [businessName, safeIndex]);

  return (
    <div
      ref={containerRef}
      className="trustit-standee-scope"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
        width: "100%",
        padding: "8px 0 16px",
        overflow: "visible",
        ...(scale < 1
          ? {
              width: `${Math.round(350 * scale)}px`,
              height: `${Math.ceil(676 * scale + 16)}px`,
              margin: "0 auto",
            }
          : undefined),
      }}
    >
      <div
        style={
          scale < 1
            ? {
                transform: `scale(${scale})`,
                transformOrigin: "top center",
                width: "350px",
                height: "676px",
                flexShrink: 0,
              }
            : undefined
        }
      >
        {/* Self-contained SVG Symbols for #shield and #gl so domToPng / print cloning always preserves them */}
      <svg width="0" height="0" style={{ position: "absolute", pointerEvents: "none" }} aria-hidden="true">
        <symbol id="shield" viewBox="0 0 64 70">
          <path style={{ fill: "var(--b1)" }} d="M32 5 6 15v18c0 17 11 29 26 35z" />
          <path style={{ fill: "var(--b2)" }} d="M32 5l26 10v18c0 17-11 29-26 35z" />
          <path
            d="M19 35l9.5 9.5L46 25"
            fill="none"
            style={{ stroke: "var(--chk,#fff)" }}
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            style={{ fill: "var(--b2)" }}
            d="M55 0l2.2 6.3L63.5 8.5l-6.3 2.2L55 17l-2.2-6.3L46.5 8.5l6.3-2.2z"
          />
        </symbol>
        <symbol id="gl" viewBox="0 0 48 48">
          <path
            fill="#EA4335"
            d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
          />
          <path
            fill="#4285F4"
            d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
          />
          <path
            fill="#FBBC05"
            d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
          />
          <path
            fill="#34A853"
            d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
          />
        </symbol>
      </svg>

      {/* Main Card with exact template classes (t1, t2, t3, t4, t5) */}
      <div className={`card ${templateClass}`} data-standee-theme={theme.id}>
        {/* Template 03 and 04 have a subtle 6px top spacing adjustment */}
        {(theme.templateType === 3 || theme.templateType === 4) && <div style={{ height: "6px" }} />}

        {/* 1. Header Logo Block */}
        <div className="logo">
          <svg>
            <use href="#shield" />
          </svg>
          <b>Trustit</b>
        </div>

        {/* 2. Subtitle & Divider Rules */}
        {theme.templateType === 2 && (
          <>
            <div className="sub">Review &amp; Support Local Business</div>
            <div className="rule" />
          </>
        )}

        {theme.templateType === 5 && <div className="rule" />}

        {/* 3. Business Name Heading */}
        <div className="name" ref={nameRef} title={businessName}>
          {businessName}
        </div>

        {/* 4. Tagline (Template 05) or Dot Divider (Templates 01, 03, 04) */}
        {theme.templateType === 5 && (
          <div className="tag" title={tagline || "Delicious Food, Happy People"}>
            {tagline || "Delicious Food, Happy People"}
          </div>
        )}

        {(theme.templateType === 1 || theme.templateType === 3 || theme.templateType === 4) && (
          <div className="div" />
        )}

        {/* 5. QR Code Box with Center Shield Badge */}
        <div className="qrbox">
          <div className="qr">
            {usable && qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`Trustit QR Code for ${businessName}`}
                width={212}
                height={212}
                style={{ width: "212px", height: "212px", display: "block" }}
              />
            ) : (
              <div
                style={{
                  width: "212px",
                  height: "212px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  fontSize: "13px",
                  color: "#64748b",
                  padding: "12px",
                }}
              >
                QR Inactive
              </div>
            )}
          </div>
          <div className="qrlogo" aria-hidden="true">
            <svg>
              <use href="#shield" />
            </svg>
          </div>
        </div>

        {/* 6. Scan Text or Orange CTA Button */}
        {(theme.templateType === 1 || theme.templateType === 3 || theme.templateType === 4) && (
          <div className="scan">Scan to Review on Trustit</div>
        )}

        {(theme.templateType === 2 || theme.templateType === 5) && (
          <div className="btn">
            <i>
              <svg viewBox="0 0 24 24">
                <path
                  d="M5 12.5l4.5 4.5L19 7"
                  fill="none"
                  stroke="#ee5a0c"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </i>
            Scan to Review on Trustit
          </div>
        )}

        {/* 7. Also Review on Google Pill Button */}
        <div className="g">
          <svg>
            <use href="#gl" />
          </svg>
          <span>
            Also Review on <b>Google</b>
          </span>
        </div>

        {/* 8. Powered by Trustit Footer */}
        <div className="pow">
          Powered by{" "}
          <svg>
            <use href="#shield" />
          </svg>
          <b>Trustit</b>
        </div>
      </div>
      </div>
    </div>
  );
}
