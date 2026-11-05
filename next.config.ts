import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=*, microphone=*, geolocation=*, display-capture=*",
  },
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

    const corsHeaders = [
      { key: "Access-Control-Allow-Origin", value: "*" },
      { key: "Access-Control-Allow-Methods", value: "GET, POST, PUT, DELETE, OPTIONS, PATCH" },
      { key: "Access-Control-Allow-Headers", value: "X-Requested-With, Content-Type, Authorization, Accept, Origin" },
      { key: "Access-Control-Max-Age", value: "86400" },
    ];

    // CSP is intentionally omitted: Next.js runtime scripts and the dynamically
    // loaded Cashfree Web Checkout SDK need a nonce-aware policy to avoid breakage.
    return [
      { source: "/api/:path*", headers: [...headers, ...corsHeaders] },
      { source: "/:path*", headers }
    ];
  },
};

export default nextConfig;
