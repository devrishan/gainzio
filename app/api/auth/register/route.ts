import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body?.username || !body?.email || !body?.password) {
    return NextResponse.json({ success: false, error: "Missing registration fields." }, { status: 400 });
  }

  const registerResponse = await fetch(`${env.API_BASE_URL}/api/auth/register.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username: body.username,
      email: body.email,
      password: body.password,
      referral_code: body.referral_code,
    }),
  });

  const registerResult = await registerResponse.json().catch(() => null);

  if (!registerResponse.ok || !registerResult?.success) {
    return NextResponse.json(
      { success: false, error: registerResult?.error ?? "Failed to register." },
      { status: registerResponse.status || 500 },
    );
  }

  // Auto-login after successful registration
  // Pass keep_me_signed_in if provided (though typically false for new registrations)
  const keepSignedIn = body.keep_me_signed_in === true;
  const loginResponse = await fetch(`${env.API_BASE_URL}/api/auth/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      keep_me_signed_in: keepSignedIn,
    }),
  });

  const loginResult = await loginResponse.json().catch(() => null);

  if (!loginResponse.ok || !loginResult?.success || !loginResult?.token) {
    return NextResponse.json(
      { success: false, error: loginResult?.error ?? "Registration succeeded but login failed." },
      { status: loginResponse.status || 500 },
    );
  }

  const expiresIn = typeof loginResult.expires_in === "number" ? loginResult.expires_in : 3600;

  const res = NextResponse.json({
    success: true,
    user: loginResult.user,
  });

  // Use the new cookie helper to set both access and refresh tokens
  // The refresh token is the same as access token from PHP API (we treat it as access token)
  setAuthCookies(res, {
    accessToken: loginResult.token,
    refreshToken: loginResult.token, // PHP API returns single token, we use it for both
    user: loginResult.user,
    keepSignedIn,
    accessTokenTTL: expiresIn,
    refreshTokenTTL: keepSignedIn ? 2592000 : 86400, // 30 days if keepSignedIn, else 1 day
  });

  return res;
}
