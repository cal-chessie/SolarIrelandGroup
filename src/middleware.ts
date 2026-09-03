/* ═══════════════════════════════════════════════════════════════
   MIDDLEWARE - Canonical URL Redirects
   ═══════════════════════════════════════════════════════════════
   Runs on the Edge before every request.
   Only handles redirects that next.config headers() cannot.
   Security headers are set in next.config.ts.
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
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

  return NextResponse.next();
}

/* ═══════════════════════════════════════════════════════════════
   MATCHER - Skip static files
   ═══════════════════════════════════════════════════════════════ */
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-favicon|bumblebee-favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
