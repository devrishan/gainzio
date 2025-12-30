import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getUserGamificationStats, calculateSmartScore } from "@/lib/gamification";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = auth.userId;

        const [stats, smartScore, wallet] = await Promise.all([
            getUserGamificationStats(userId),
            calculateSmartScore(userId),
            prisma.wallet.findUnique({ where: { userId } })
        ]);

        return NextResponse.json({
            role: auth.role, // "USER" or "ADMIN" - helpful for frontend
            rank: stats.rank,
            xp: stats.xp,
            nextRankXP: stats.nextRankXP,
            progress: stats.progress, // 0-100 percentage
            streakDays: stats.streakDays,
            smartScore: smartScore,
            badges: stats.badges,
            totalEarned: wallet?.totalEarned || 0,
            coins: wallet?.coins || 0
        });

    } catch (error) {
        console.error("[Progress API] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
