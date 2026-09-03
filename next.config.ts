import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Turbopack from tree-shaking lucide-react into hundreds of
  // individual icon files that corrupt during HMR updates.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  reactStrictMode: true,

  /* ═══════════════════════════════════════════════════════════════
     IMAGE OPTIMIZATION
     ═══════════════════════════════════════════════════════════════ */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "solarirelandgroup.ie",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },

  /* ═══════════════════════════════════════════════════════════════
     SEO — Remove X-Powered-By header
     ═══════════════════════════════════════════════════════════════ */
  poweredByHeader: false,

  trailingSlash: false,

  /* ═══════════════════════════════════════════════════════════════
     HTTP SECURITY HEADERS — Hardened for 2026
     ═══════════════════════════════════════════════════════════════ */
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Full Content-Security-Policy is issued per-request in
            // src/middleware.ts (it needs a fresh nonce). This is the
            // legacy clickjacking fallback for pre-CSP browsers.
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value:
              "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Permitted-Cross-Domain-Policies",
            value: "none",
          },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
        ],
      },
      {
        // HTML pages — never cache so updates always show immediately
        source: "/((?!api|_next|favicon|robots|sitemap|manifest).*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        // Next.js Image optimizer — never cache so new images show immediately
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "no-store, no-cache, must-revalidate, proxy-revalidate",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
        ],
      },
      {
        source: "/_next/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, must-revalidate",
          },
        ],
      },
      {
        source: "/sitemap.xml",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
      {
        source: "/robots.txt",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=3600, s-maxage=3600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
