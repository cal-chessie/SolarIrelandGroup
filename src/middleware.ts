/* ═══════════════════════════════════════════════════════════════
   MIDDLEWARE - Canonical redirects + blog 404
   ═══════════════════════════════════════════════════════════════
   The Content-Security-Policy used to be minted here with a per-request
   nonce. That forced the root layout to read headers(), which made every
   page dynamic (no CDN cache, ~2 s real-user TTFB). Since 12 Nov 2026 the
   CSP is static and lives in next.config.ts with the other security headers.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import { BLOG_SLUGS } from "@/lib/blog-slugs";
import type { NextRequest } from "next/server";

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

  /* ─── 3. Unknown /blog/<slug> is a real 404, not a soft one ─── */
  const blogMatch = url.pathname.match(/^\/blog\/([^/]+)$/);
  if (blogMatch && !BLOG_SLUGS.has(blogMatch[1])) {
    return new NextResponse(null, {
      status: 404,
      headers: { "x-robots-tag": "noindex, nofollow" },
    });
  }

  return NextResponse.next();
}

/* Run on document requests only; skip static assets and router prefetches. */
export const config = {
  matcher: [
    {
      source:
        "/((?!_next/static|_next/image|favicon.ico|logo-favicon|bumblebee-favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|SVG|PNG|JPG|JPEG|GIF|WEBP|ICO)$).*)",
      missing: [
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};
