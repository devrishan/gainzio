import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getGamificationProfile, calculateSmartScore } from "@/services/gamification";
import { prisma as db } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Ensure profile exists and get it
    const profile = await getGamificationProfile(user.id);

    // Recalculate Smart Score on load (or could be a background job)
    const smartScore = await calculateSmartScore(user.id);

    // Get Wallet for coins display
    const wallet = await db.wallet.findUnique({
      where: { userId: user.id },
      select: { coins: true }
    });

    return NextResponse.json({
      ...profile,
      smartScore, // Return the fresh calc
      coins: wallet?.coins || 0
    });

  } catch (error) {
    console.error("[GAMIFICATION_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
