import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = url.hostname;

  if (hostname.startsWith("www.")) {
    url.hostname = hostname.replace(/^www\./, "");
    return NextResponse.redirect(url, 301);
  }

  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  // Force no-cache on HTML pages so proxy never serves stale content
  const response = NextResponse.next();
  const { pathname } = request.nextUrl;
  if (
    !pathname.startsWith('/api') &&
    !pathname.startsWith('/_next')
  ) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo-favicon|bumblebee-favicon|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
