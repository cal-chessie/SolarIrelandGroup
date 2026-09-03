/* ═══════════════════════════════════════════════════════════════
   MIDDLEWARE - Canonical redirects + per-request CSP nonce
   ═══════════════════════════════════════════════════════════════
   Runs on the Edge before every document request.

   Content-Security-Policy is issued HERE, not in next.config, because a
   strict CSP needs a fresh per-request nonce. Executable scripts are gated
   by 'nonce-<n>' + 'strict-dynamic': the framework bootstrap and the GA
   loader carry the nonce (Next.js applies it automatically), and any script
   they inject is trusted by propagation - so we never have to allowlist
   googletagmanager/posthog by origin for script-src (origin allowlists are
   JSONP-bypassable). JSON-LD blocks are type="application/ld+json" data and
   are never executed, so script-src does not touch them.

   Currently in the REPORT-ONLY rollout phase: the policy is emitted as
   Content-Security-Policy-Report-Only, violations are posted to
   /api/csp-report, and nothing is blocked. Flip ENFORCE_IN_PRODUCTION to true
   once the reports are clean.

   Other security headers (HSTS, nosniff, Referrer-Policy, Permissions-Policy,
   COOP/CORP, X-Frame-Options) stay in next.config.ts.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// ── ROLLOUT SWITCH ──────────────────────────────────────────────
// false = Content-Security-Policy-Report-Only in production (violations are
//         reported to /api/csp-report and logged, nothing is blocked). This is
//         the monitoring phase: browsers do not blank the nonce, so there is no
//         hydration re-render either.
// true  = enforce in production.
// Development is always report-only (Fast Refresh needs 'unsafe-eval').
const ENFORCE_IN_PRODUCTION = false;

/** Path that collects CSP violation reports during the rollout. */
const CSP_REPORT_PATH = "/api/csp-report";

/** Build the CSP string for one request, embedding the per-request nonce. */
function buildCsp(nonce: string, enforce: boolean): string {
  // PostHog's ingestion host is deployment-specific (env-driven), so add it
  // to connect-src only when configured. strict-dynamic already covers the
  // PostHog SCRIPT load; this is for its fetch/beacon traffic.
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST?.trim();
  const connectSrc = [
    "'self'",
    "https://www.google-analytics.com",
    "https://*.google-analytics.com",
    "https://*.analytics.google.com",
    "https://www.googletagmanager.com",
  ];
  if (posthogHost && /^https:\/\/[^ '";]+$/.test(posthogHost)) {
    connectSrc.push(posthogHost);
  }

  const directives = [
    "default-src 'self'",
    "base-uri 'none'",
    "object-src 'none'",
    // Executable-script gate. The trailing `https:` and `'unsafe-inline'`
    // are IGNORED by any browser that understands nonces/strict-dynamic;
    // they exist only so pre-CSP3 browsers still load the page.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https: 'unsafe-inline'`,
    // Tailwind + next/font inject inline <style>, and React writes inline
    // style attributes. Inline-style injection is low risk, so allow it.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.googletagmanager.com https://www.google-analytics.com https://*.google-analytics.com",
    "font-src 'self'",
    `connect-src ${connectSrc.join(" ")}`,
    // PostHog session replay spins up workers from blob: URLs.
    "worker-src 'self' blob:",
    "frame-src 'self'",
    "frame-ancestors 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
    "media-src 'self'",
    // Reporting: report-to is the modern channel (group defined by the
    // Reporting-Endpoints response header); report-uri is the legacy fallback
    // that Safari and older Chrome still honour.
    "report-to csp-endpoint",
    `report-uri ${CSP_REPORT_PATH}`,
  ];
  // upgrade-insecure-requests is ignored (and warns) in a report-only policy,
  // so only add it when the policy is actually enforced.
  if (enforce) directives.push("upgrade-insecure-requests");
  return directives.join("; ");
}

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = url.hostname;

  /* ─── 1. Canonical URL: redirect www to non-www ─── */
  if (hostname.startsWith("www.")) {
    url.hostname = hostname.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  /* ─── 2. Remove trailing slashes (except root) ─── */
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  /* ─── 3. Per-request CSP nonce ─── */
  // Enforce only in production and only once the rollout switch is flipped.
  // Development stays report-only because Fast Refresh needs 'unsafe-eval',
  // which a strict policy does not grant.
  const enforce =
    ENFORCE_IN_PRODUCTION && process.env.NODE_ENV !== "development";
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce, enforce);

  // Next.js reads the nonce from the CSP on the REQUEST headers and applies
  // it to its own <script> tags and to next/script (e.g. the GA loader).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Defines the "csp-endpoint" group that the CSP's `report-to` points at.
  response.headers.set(
    "Reporting-Endpoints",
    `csp-endpoint="${CSP_REPORT_PATH}"`
  );
  response.headers.set(
    enforce ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
    csp
  );
  return response;
}

/* ═══════════════════════════════════════════════════════════════
   MATCHER - run on document requests; skip static assets and
   router prefetches (a prefetch must not mint a nonce the real
   document render will not share).
   ═══════════════════════════════════════════════════════════════ */
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|logo-favicon|bumblebee-favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
