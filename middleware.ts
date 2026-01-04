import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const response = NextResponse.next();

  // ---------------------------------------------------------
  // 1. Referral Logic (Capture ?ref=CODE)
  // ---------------------------------------------------------
  const referralCode = request.nextUrl.searchParams.get("ref");
  if (referralCode) {
    // Store referral code in cookie for 30 days
    response.cookies.set("referral_code", referralCode, {
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      httpOnly: true,
      sameSite: "lax",
    });
  }

  // ---------------------------------------------------------
  // 2. Auth Protection Logic
  // ---------------------------------------------------------

  // Decrypt the session token
  const token = await getToken({ req: request });
  const isAuth = !!token;

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isMemberRoute = pathname.startsWith("/member");
  const isAdminRoute = pathname.startsWith("/admin");
  const isApiMemberRoute = pathname.startsWith("/api/member");
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  // Redirect authenticated users away from auth pages
  if (isAuthRoute) {
    if (isAuth) {
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }
    return response;
  }

  // Define protected paths
  if (isMemberRoute || isAdminRoute || isApiMemberRoute || isApiAdminRoute) {

    // 1. Unauthenticated Check
    if (!isAuth) {
      if (isApiMemberRoute || isApiAdminRoute) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(redirectUrl);
    }

    // 2. Role-Based Access Control (RBAC)
    // Only ADMIN can access /admin and /api/admin
    if (isAdminRoute || isApiAdminRoute) {
      if (token.role !== "ADMIN") {
        if (isApiAdminRoute) {
          return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
        }
        // Redirect unauthorized access to member dashboard
        return NextResponse.redirect(new URL("/member/dashboard", request.url));
      }
    }
  }

  // Preserve the referral cookie if we set it
  if (referralCode) {
    return response;
  }

  return NextResponse.next();
}

