import { type NextRequest, NextResponse } from "next/server";

/**
 * Lightweight route guard. Phase 0 protects /dashboard-style routes by checking
 * for the presence of the Better Auth session cookie (full verification happens
 * server-side / in the API). Public routes and auth routes are always allowed.
 */

const PROTECTED_PREFIXES = ["/profile"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (!isProtected) return NextResponse.next();

  // Better Auth cookie is prefixed with "ott" (see auth.ts advanced.cookiePrefix).
  const hasSession =
    request.cookies.has("ott.session_token") ||
    request.cookies.has("ott.session_data") ||
    request.cookies.getAll().some((c) => c.name.startsWith("ott.session"));

  if (!hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/profile/:path*"],
};
