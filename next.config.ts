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
     COUNTY SLUGS AT THE ROOT
     Google found /limerick and /kildare as 404s (Search Console, 10 Nov
     2026). Every Irish county slug at the root now 308s to its county page
     where one exists, otherwise to the /counties directory.
     ═══════════════════════════════════════════════════════════════ */
  async redirects() {
    const countyPages = new Set(["roscommon"]);
    const counties = [
      "antrim", "armagh", "carlow", "cavan", "clare", "cork", "derry",
      "donegal", "down", "dublin", "fermanagh", "galway", "kerry", "kildare",
      "kilkenny", "laois", "leitrim", "limerick", "longford", "louth", "mayo",
      "meath", "monaghan", "offaly", "roscommon", "sligo", "tipperary",
      "tyrone", "waterford", "westmeath", "wexford", "wicklow",
    ];
    return [
      ...counties.map((county) => ({
        source: `/${county}`,
        destination: countyPages.has(county) ? `/counties/${county}` : "/counties",
        permanent: true,
      })),
      // Search Console also found https://solarirelandgroup.ie/$ as a 404. No
      // link of ours makes it: React's inline Suspense streaming script (the
      // $RC helper Next.js puts in every streamed page) contains the string
      // "/$" (it compares comment markers, `"/$"===d`), and Googlebot reads
      // quoted "/..." strings in inline scripts as URLs. The script is React's,
      // so the URL is answered instead: a permanent redirect home.
      { source: "/$", destination: "/", permanent: true },
      { source: "/%24", destination: "/", permanent: true },
    ];
  },

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
            value: "0",
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
            // same-origin-allow-popups isolates the browsing context while still
            // letting wa.me / external popups opened by the site function.
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          {
            key: "Cross-Origin-Resource-Policy",
            value: "cross-origin",
          },
        ],
      },
      {
        // /portal is an honest "your link is in your emails" page, never indexed
        // (it used to open a sample customer for any reference).
        source: "/portal",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/portal/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
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
        // Next.js Image optimizer: cache but always revalidate, so unchanged
        // images serve from cache (304) while any replacement shows at once.
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, must-revalidate",
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
        // Content-hashed build assets are immutable; cache for a year.
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
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
