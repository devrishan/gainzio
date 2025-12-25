import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { verifyAccessToken } from "@/lib/jwt";

type LegacyUserCookie = {
  role?: string;
};

function parseLegacyUserCookie(cookie?: string): LegacyUserCookie | null {
  if (!cookie) {
    return null;
  }

  try {
    return JSON.parse(cookie);
  } catch {
    return null;
  }
}

/**
 * Check if a token looks valid (has JWT structure: 3 parts separated by dots)
 * This is a lightweight check before attempting full verification
 */
function isTokenStructureValid(token: string): boolean {
  const parts = token.split(".");
  return parts.length === 3 && parts.every((part) => part.length > 0);
}

/**
 * Try to extract role from token payload without full verification
 * This helps handle PHP-generated tokens that may not verify with Next.js JWT library
 */

function tryExtractRoleFromToken(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Decode the payload (second part)
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);

    // Check if token is expired
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload.role?.toUpperCase() ?? null;
  } catch {
    return null;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
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
      httpOnly: true, // Secure, not accessible by JS
      sameSite: "lax",
    });
  }

  // ---------------------------------------------------------
  // 2. Auth Protection Logic
  // ---------------------------------------------------------

  // Check for Legacy Tokens
  const accessToken = request.cookies.get("earniq_access_token")?.value;
  const legacyToken = request.cookies.get("sparkio_token")?.value;

  // Check for NextAuth Tokens (Standard & Secure)
  const nextAuthToken = request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  const hasAnyToken = !!(accessToken || legacyToken || nextAuthToken);

  const isAuthRoute = pathname.startsWith("/login") || pathname.startsWith("/register");
  const isMemberRoute = pathname.startsWith("/member");
  const isAdminRoute = pathname.startsWith("/admin");
  const isPublicRoute = !isMemberRoute && !isAdminRoute;

  // Determining Role (Simplified for NextAuth migration - assuming USER for now if NextAuth)
  // For legacy, we try to parse cookies. For NextAuth, we'd typically use `getToken` but
  // standard middleware cannot easily decode JWT without SECRET in Edge Runtime sometimes.
  // We will assume if nextAuthToken exists, they are at least a USER.
  // Refined RBAC should happen in layout or page if needed.

  const legacyUser = parseLegacyUserCookie(request.cookies.get("sparkio_user")?.value);
  const earniqUser = parseLegacyUserCookie(request.cookies.get("earniq_user")?.value);

  let userRole = "USER";
  if (earniqUser?.role) userRole = earniqUser.role;
  // TODO: Decode NextAuth token for role if strict Admin protection is needed at middleware level

  if (isMemberRoute || isAdminRoute) {
    if (!hasAnyToken) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = "/login";
      redirectUrl.searchParams.set("redirect", `${pathname}${request.nextUrl.search}`);
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isAuthRoute && hasAnyToken) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/member/dashboard";
    return NextResponse.redirect(redirectUrl);
  }

  // Preserve the referral cookie if we set it
  if (referralCode) {
    return response;
  }

  return NextResponse.next();
}

