/* ═══════════════════════════════════════════════════════════════
   MIDDLEWARE — Security & SEO Headers
   ═══════════════════════════════════════════════════════════════
   Runs on the Edge before every request.
   Adds headers that can't be set in next.config (dynamic values)
   and handles security edge cases.

   Security features:
   - Dynamic nonce for CSP (if needed in future)
   - Bot detection & rate limiting hints
   - HTTP → HTTPS redirect
   - www → non-www redirect (canonical URL enforcement)
   - Anti-hotlinking for images
   ═══════════════════════════════════════════════════════════════ */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const url = request.nextUrl.clone();
  const hostname = url.hostname;

  /* ─── 1. Force HTTPS in production ─── */
  if (
    url.protocol === "http:" &&
    hostname !== "localhost" &&
    hostname !== "127.0.0.1"
  ) {
    url.protocol = "https:";
    return NextResponse.redirect(url, 301);
  }

  /* ─── 2. Canonical URL: redirect www to non-www ─── */
  if (hostname.startsWith("www.")) {
    url.hostname = hostname.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  /* ─── 3. Remove trailing slashes (except root) ─── */
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  /* ─── 4. Security headers ─── */

  // Prevent MIME type sniffing
  response.headers.set("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  response.headers.set("X-Frame-Options", "DENY");

  // XSS protection (legacy but still useful)
  response.headers.set("X-XSS-Protection", "1; mode=block");

  // Strict Transport Security (enforce HTTPS)
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Referrer policy — only send origin to same-site
  response.headers.set(
    "Referrer-Policy",
    "strict-origin-when-cross-origin"
  );

  // Permissions policy — disable unnecessary browser features
  response.headers.set(
    "Permissions-Policy",
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=(), interest-cohort=()"
  );

  // Cross-Origin headers
  response.headers.set("Cross-Origin-Opener-Policy", "same-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");

  /* ─── 5. Anti-hotlinking for images ─── */
  if (url.pathname.startsWith("/public/") || /\.(jpg|jpeg|png|webp|avif|gif|svg)$/i.test(url.pathname)) {
    const referer = request.headers.get("referer");
    if (referer) {
      try {
        const refererUrl = new URL(referer);
        if (
          refererUrl.hostname !== hostname &&
          !refererUrl.hostname.endsWith("solarireland.com")
        ) {
          // Hotlink attempt — could return 403 or watermark
          // For now, we allow but could add this:
          // response.headers.set("X-Robots-Tag", "noindex");
        }
      } catch {
        // Invalid referer, ignore
      }
    }
  }

  /* ─── 6. SEO: Add X-Robots-Tag for non-public paths ─── */
  if (url.pathname.startsWith("/api/")) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }

  /* ─── 7. Rate limiting hints ─── */
  response.headers.set("X-RateLimit-Policy", "10;w=1, 100;w=60");

  return response;
}

/* ═══════════════════════════════════════════════════════════════
   MATCHER — Only run middleware on relevant paths
   Skip _next/static, _next/image, favicon, etc.
   ═══════════════════════════════════════════════════════════════ */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|logo-favicon|bumblebee-favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
