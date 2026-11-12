import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(self)",
  },
];

const trustedApiOrigins = [
  "https://trustitreview.com",
  "https://www.trustitreview.com",
  "capacitor://localhost",
  "http://localhost",
  "https://localhost",
];

const nextConfig: NextConfig = {
  // Allow Cloudflare tunnel and local LAN IP access on mobile devices without blocking Next.js dev scripts
  allowedDevOrigins: [
    "*.trycloudflare.com",
    "choices-crm-appropriations-reserve.trycloudflare.com",
    "192.168.1.5",
    "192.168.*",
    "localhost",
    "127.0.0.1",
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  async redirects() {
    return [
      {
        source: "/downloads/Trustit-Merchant-Partner.apk",
        destination: "https://raw.githubusercontent.com/Review-QR/Review-Qr-Page/main/public/downloads/Trustit-Merchant-Partner.apk",
        permanent: false,
      },
      {
        source: "/downloads/Trustit-Customer.apk",
        destination: "https://raw.githubusercontent.com/Review-QR/Review-Qr-Page/main/public/downloads/Trustit-Customer.apk",
        permanent: false,
      },
      {
        source: "/downloads/Trustit-Rider-Partner.apk",
        destination: "https://raw.githubusercontent.com/Review-QR/Review-Qr-Page/main/public/downloads/Trustit-Rider-Partner.apk",
        permanent: false,
      },
      {
        source: "/trustit-partner.apk",
        destination: "https://raw.githubusercontent.com/Review-QR/Review-Qr-Page/main/public/downloads/Trustit-Merchant-Partner.apk",
        permanent: false,
      },
      {
        source: "/trustit-customer.apk",
        destination: "https://raw.githubusercontent.com/Review-QR/Review-Qr-Page/main/public/downloads/Trustit-Customer.apk",
        permanent: false,
      },
      {
        source: "/trustit-rider.apk",
        destination: "https://raw.githubusercontent.com/Review-QR/Review-Qr-Page/main/public/downloads/Trustit-Rider-Partner.apk",
        permanent: false,
      },
    ];
  },
  async headers() {
    const headers = [...securityHeaders];
    if (process.env.NODE_ENV === "production") {
      headers.push({
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains",
      });
    }

    const corsBaseHeaders = [
      { key: "Vary", value: "Origin" },
      { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS, PATCH" },
      { key: "Access-Control-Allow-Headers", value: "X-Requested-With, Content-Type, Authorization, Accept, Origin" },
      { key: "Access-Control-Max-Age", value: "86400" },
    ];

    const corsOriginRules = trustedApiOrigins.map((origin) => ({
      source: "/api/:path*",
      has: [{ type: "header" as const, key: "origin", value: origin }],
      headers: [
        { key: "Access-Control-Allow-Origin", value: origin },
        { key: "Access-Control-Allow-Credentials", value: "true" },
      ],
    }));

    if (process.env.NODE_ENV !== "production") {
      corsOriginRules.push({
        source: "/api/:path*",
        has: [
          {
            type: "header" as const,
            key: "origin",
            value: "(?<devOrigin>https?://(?:localhost|127\\.0\\.0\\.1)(?::\\d+)?|https://[^.]+\\.trycloudflare\\.com)",
          },
        ],
        headers: [
          { key: "Access-Control-Allow-Origin", value: ":devOrigin" },
          { key: "Access-Control-Allow-Credentials", value: "true" },
        ],
      });
    }

    // Nonce-aware Content-Security-Policy-Report-Only is emitted dynamically in proxy.ts.
    return [
      { source: "/api/:path*", headers: [...headers, ...corsBaseHeaders] },
      ...corsOriginRules,
      { source: "/:path*", headers },
      {
        source: "/rider/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self), display-capture=()",
          },
        ],
      },
      {
        source: "/merchant/:path*",
        headers: [
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(self), display-capture=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
