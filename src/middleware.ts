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

  // Route Definitions
  // "Admin Login" page is at /admin
  const isAdminRoot = pathname === "/admin";
  // "Admin Dashboard" and other pages are at /admin/*
  const isAdminSubRoute = pathname.startsWith("/admin/") && pathname.length > 7;

  const isMemberRoute = pathname.startsWith("/member");
  const isApiMemberRoute = pathname.startsWith("/api/member");
  const isApiAdminRoute = pathname.startsWith("/api/admin");

  // Public Auth Pages (User Login)
  const isUserAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");

  // -----------------------------------------------------------------------------
  // RULE 1: USER AUTH PAGES (/login, /register)
  // -----------------------------------------------------------------------------
  if (isUserAuthRoute) {
    if (isAuth) {
      if (token.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      }
      return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }
    return response;
  }

  // -----------------------------------------------------------------------------
  // RULE 2: ADMIN LOGIN PAGE (/admin)
  // -----------------------------------------------------------------------------
  if (isAdminRoot) {
    if (isAuth) {
      if (token.role === "ADMIN") {
        // Already logged in as Admin -> Go to Dashboard
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else {
        // Logged in as User -> strict block, redirect to user dashboard
        // Users should NOT see the admin login page
        return NextResponse.redirect(new URL("/member/dashboard", request.url));
      }
    }
    // Not logged in -> Allow access to /admin (Login Form)
    return NextResponse.next();
  }

  // -----------------------------------------------------------------------------
  // RULE 3: PROTECTED ADMIN ROUTES (/admin/*, /api/admin/*)
  // -----------------------------------------------------------------------------
  if (isAdminSubRoute || isApiAdminRoute) {
    if (!isAuth) {
      if (isApiAdminRoute) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      // Redirect to Admin Login
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    if (token.role !== "ADMIN") {
      if (isApiAdminRoute) {
        return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
      }
      // Authenticated but not Admin -> Kick them out to member dashboard
      return NextResponse.redirect(new URL("/member/dashboard", request.url));
    }

    // Auth + Admin -> Allow
    return NextResponse.next();
  }

  // -----------------------------------------------------------------------------
  // RULE 4: PROTECTED MEMBER ROUTES (/member/*, /api/member/*)
  // -----------------------------------------------------------------------------
  if (isMemberRoute || isApiMemberRoute) {
    if (!isAuth) {
      if (isApiMemberRoute) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(redirectUrl);
    }

    // Optional: Prevent Admins from seeing user dashboard? 
    // Usually Admins can access everything, but if we want strict separation:
    // if (token.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
    // For now, allowing Admins to view member dashboard might be useful for support.
  }

  // Preserve the referral cookie if we set it
  if (referralCode) {
    return response;
  }

  return NextResponse.next();
}

