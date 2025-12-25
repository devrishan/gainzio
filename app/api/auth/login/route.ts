import { NextRequest, NextResponse } from "next/server";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setAuthCookies } from "@/lib/auth-cookies";
import { getMaintenanceState } from "@/lib/maintenance";

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

  try {
    // Find user
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: body.email },
          { phone: body.email }, // Allow login with phone as well
        ],
      },
      include: {
        wallet: true, // Include wallet for session data if needed
      }
    });

    if (!user || !user.hashedPassword) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Verify password
    const isValid = await compare(body.password, user.hashedPassword);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        gamification: {
          upsert: {
            create: { lastLoginAt: new Date() },
            update: { lastLoginAt: new Date() },
          }
        }
      }
    });

    // Generate tokens
    const accessTokenPayload = {
      sub: user.id,
      role: user.role,
      username: user.username,
      email: user.email,
    };

    const accessToken = await signAccessToken(accessTokenPayload);
    const refreshToken = await signRefreshToken({
      sub: user.id,
      sid: crypto.randomUUID(), // Session ID
    });

    const keepSignedIn = body.keep_me_signed_in === true;
    const accessTokenTTL = Number(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ?? 900);
    const refreshTokenTTL = Number(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS ?? 2592000);

    const userForResponse = {
      id: user.id,
      email: user.email!, // Email is required in schema but potentially null in type
      username: user.username || `user_${user.id.substring(0, 8)}`,
      role: user.role,
      phone: user.phone,
    };

    const res = NextResponse.json({
      success: true,
      user: userForResponse,
    });

    setAuthCookies(res, {
      accessToken,
      refreshToken,
      user: userForResponse,
      keepSignedIn,
      accessTokenTTL,
      refreshTokenTTL: keepSignedIn ? refreshTokenTTL : 86400,
    });

    return res;

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error." },
      { status: 500 }
    );
  }
}
