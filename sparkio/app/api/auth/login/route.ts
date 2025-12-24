import { NextRequest, NextResponse } from "next/server";

import { env } from "@/lib/env";
import { getMaintenanceState } from "@/lib/maintenance";
import { setAuthCookies } from "@/lib/auth-cookies";

export async function POST(request: NextRequest) {
  const maintenanceState = await getMaintenanceState();
  if (maintenanceState.enabled) {
    return NextResponse.json(
      {
        success: false,
        error: maintenanceState.message ?? "Login is temporarily disabled for maintenance. Please try again later.",
      },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => null);

  if (!body?.email || !body?.password) {
    return NextResponse.json({ success: false, error: "Missing credentials." }, { status: 400 });
  }

  const response = await fetch(`${env.API_BASE_URL}/api/auth/login.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: body.email,
      password: body.password,
      keep_me_signed_in: body.keep_me_signed_in ?? false,
    }),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || !result?.success || !result?.token) {
    return NextResponse.json(
      { success: false, error: result?.error ?? "Failed to login." },
      { status: response.status || 500 },
    );
  }

  const expiresIn = typeof result.expires_in === "number" ? result.expires_in : 3600;
  const keepSignedIn = body.keep_me_signed_in === true;

  const res = NextResponse.json({
    success: true,
    user: result.user,
  });

  // Use the new cookie helper with "keep me signed in" option
  setAuthCookies(res, {
    accessToken: result.token,
    refreshToken: result.token, // PHP API returns single token, we use it for both
    user: result.user,
    keepSignedIn,
    accessTokenTTL: expiresIn,
    refreshTokenTTL: keepSignedIn ? 2592000 : 86400, // 30 days if keepSignedIn, else 1 day
  });

  return res;
}
