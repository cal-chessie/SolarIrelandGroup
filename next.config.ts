import type { NextConfig } from "next";

/* ═══════════════════════════════════════════════════════════════
   CONTENT-SECURITY-POLICY (static, 12 Nov 2026)
   Was a per-request nonce minted in middleware. Reading that nonce in the
   root layout made every page dynamic: no CDN cache, ~2 s real-user TTFB.
   A static policy lets pages prerender. Next's own inline bootstrap scripts
   differ per page and build, so they cannot be hashed; script-src therefore
   allows 'unsafe-inline' with an explicit host allowlist (Next's documented
   no-nonce setup). JSON-LD is data (type="application/ld+json"), never run.
   Violations still post to /api/csp-report.
   ═══════════════════════════════════════════════════════════════ */
const CSP_REPORT_PATH = "/api/csp-report";
function buildCsp(): string {
  // PostHog's host is deployment-specific (env-driven, inlined at build).
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  const ph = posthogHost && /^https:\/\/[^ '";]+$/.test(posthogHost) ? [posthogHost] : [];
  // posthog-js lazy-loads its recorder/extensions from *-assets.i.posthog.com.
  const phAssets = ph.length ? ["https://*.posthog.com"] : [];
  const gtm = "https://www.googletagmanager.com";
  return [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    `script-src 'self' 'unsafe-inline' ${gtm} ${phAssets.join(" ")}`.trim(),
    "style-src 'self' 'unsafe-inline'",
    // blob: is the on-page preview of a bill photo the visitor has just picked.
    `img-src 'self' data: blob: ${gtm} https://www.google-analytics.com https://*.google-analytics.com`,
    "font-src 'self'",
    [
      "connect-src 'self'",
      "https://www.google-analytics.com",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      gtm,
      ...ph,
      ...phAssets,
    ].join(" "),
    // PostHog session replay spins up workers from blob: URLs.
    "worker-src 'self' blob:",
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "media-src 'self'",
    "report-to csp-endpoint",
    `report-uri ${CSP_REPORT_PATH}`,
    "upgrade-insecure-requests",
  ].join("; ");
}
// Development keeps report-only: Fast Refresh needs 'unsafe-eval'.
const CSP_HEADER =
  process.env.NODE_ENV === "development"
    ? "Content-Security-Policy-Report-Only"
    : "Content-Security-Policy";

const nextConfig: NextConfig = {
  // Prevent Turbopack from tree-shaking lucide-react into hundreds of
  // individual icon files that corrupt during HMR updates.
  experimental: {
    optimizePackageImports: ['lucide-react'],
    // Inline the CSS into the HTML (production only). PageSpeed mobile flagged
    // three render-blocking CSS chunks (~640 ms) that held the hero image's
    // paint (LCP render delay). Inlined, first paint needs only the HTML.
    inlineCss: true,
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
    // Next 16 only serves listed qualities. The hero is 50 on phones and 65
    // from 640 up (PageSpeed mobile: a lighter LCP image), 75 is the default
    // for everything else.
    qualities: [50, 65, 75],
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
          { key: CSP_HEADER, value: buildCsp() },
          { key: "Reporting-Endpoints", value: `csp-endpoint="${CSP_REPORT_PATH}"` },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            // Legacy clickjacking fallback for pre-CSP browsers
            // (frame-ancestors in the CSP above is the real control).
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
      // HTML pages: no Cache-Control override (12 Nov 2026). The old
      // no-store here defeated the CDN. Next/Vercel now send their defaults:
      // prerendered pages are edge-cached and purged on every deploy, while
      // browsers revalidate (max-age=0), so updates still show at once.
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
