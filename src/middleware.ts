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

   Other security headers (HSTS, nosniff, Referrer-Policy, Permissions-Policy,
   COOP/CORP, X-Frame-Options) stay in next.config.ts.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/** Build the CSP string for one request, embedding the per-request nonce. */
function buildCsp(nonce: string): string {
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
    "upgrade-insecure-requests",
  ];
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
  const nonce = btoa(crypto.randomUUID());
  const csp = buildCsp(nonce);

  // Next.js reads the nonce from the CSP on the REQUEST headers and applies
  // it to its own <script> tags and to next/script (e.g. the GA loader).
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.set("Content-Security-Policy", csp);
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
