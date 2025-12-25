import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { verifyRefreshToken } from "@/lib/jwt";

export async function POST() {
  try {
    const cookieStore = cookies();
    const refreshToken = cookieStore.get("earniq_refresh_token")?.value;

    // Revoke session if refresh token exists
    if (refreshToken) {
      try {
        const payload = await verifyRefreshToken(refreshToken);
        await prisma.session.update({
          where: { id: payload.sid },
          data: {
            revokedAt: new Date(),
            revokedReason: "User logout",
          },
        });
      } catch {
        // Token invalid, ignore
      }
    }

    const response = NextResponse.json({ success: true });

    // Clear all auth cookies
    response.cookies.set("earniq_access_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    response.cookies.set("earniq_refresh_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    });

    // Clear legacy cookies for backward compatibility
    response.cookies.set("sparkio_token", "", {
      maxAge: 0,
      path: "/",
    });
    response.cookies.set("sparkio_user", "", {
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Logout error", error);
    return NextResponse.json({ success: false, error: "Failed to logout" }, { status: 500 });
  }
}

