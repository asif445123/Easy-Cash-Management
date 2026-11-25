import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

const AUTH_COOKIE_NAME = "easycash_token";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const token = req.cookies.get(AUTH_COOKIE_NAME)?.value;
  const payload = token ? await verifyToken(token) : null;

  const isApproved = !!payload && payload.status === "approved";
  const isAdmin = isApproved && payload?.role === "admin";

  if (pathname.startsWith("/dashboard") && !isApproved) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // Only /admin itself (the User approvals screen) is admin-only — every
  // other /admin/* path (account types, accounts, cash book, journal
  // vouchers, reports) just needs an approved account, since regular
  // approved users use those screens too.
  const isAdminOnlyPath = pathname === "/admin";

  if (isAdminOnlyPath && !isAdmin) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  if (pathname.startsWith("/admin") && !isAdminOnlyPath && !isApproved) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
