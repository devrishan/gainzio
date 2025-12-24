import { NextResponse } from "next/server";

export interface AuthCookiesOptions {
  accessToken: string;
  refreshToken?: string;
  user?: { id: string | number; username: string; email: string; role: string; referral_code?: string };
  keepSignedIn?: boolean;
  accessTokenTTL?: number; // seconds
  refreshTokenTTL?: number; // seconds
}

const DEFAULT_ACCESS_TTL = 900; // 15 minutes
const DEFAULT_REFRESH_TTL_SHORT = 86400; // 1 day
const DEFAULT_REFRESH_TTL_LONG = 2592000; // 30 days

export function setAuthCookies(response: NextResponse, options: AuthCookiesOptions): NextResponse {
  const {
    accessToken,
    refreshToken,
    user,
    keepSignedIn = false,
    accessTokenTTL = DEFAULT_ACCESS_TTL,
    refreshTokenTTL = keepSignedIn ? DEFAULT_REFRESH_TTL_LONG : DEFAULT_REFRESH_TTL_SHORT,
  } = options;

  const isProduction = process.env.NODE_ENV === "production";

  // Set access token cookie
  response.cookies.set({
    name: "earniq_access_token",
    value: accessToken,
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    maxAge: accessTokenTTL,
    path: "/",
  });

  // Set refresh token cookie if provided
  if (refreshToken) {
    response.cookies.set({
      name: "earniq_refresh_token",
      value: refreshToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      maxAge: refreshTokenTTL,
      path: "/",
    });
  }

  // Set user cookie (non-httpOnly for client-side access)
  if (user) {
    response.cookies.set({
      name: "earniq_user",
      value: JSON.stringify(user),
      httpOnly: false,
      secure: isProduction,
      sameSite: "lax",
      maxAge: refreshTokenTTL,
      path: "/",
    });
  }

  // Also set legacy cookies for backward compatibility
  response.cookies.set({
    name: "sparkio_token",
    value: accessToken,
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    maxAge: accessTokenTTL,
    path: "/",
  });

  if (user) {
    response.cookies.set({
      name: "sparkio_user",
      value: JSON.stringify(user),
      httpOnly: false,
      sameSite: "lax",
      secure: isProduction,
      maxAge: accessTokenTTL,
      path: "/",
    });
  }

  return response;
}

