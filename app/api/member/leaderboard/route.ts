import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getLeaderboard, getUserRank, getUserScore } from "@/lib/leaderboards";

export async function GET(request: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = auth.userId;
        const searchParams = request.nextUrl.searchParams;
        const type = searchParams.get("type") || "smart_score"; // Default to smart score
        const period = searchParams.get("period") || "alltime";

        // Validate params
        if (!['xp', 'coins', 'earnings', 'referrals', 'smart_score'].includes(type as string)) {
            return NextResponse.json({ error: "Invalid type" }, { status: 400 });
        }
        if (!['daily', 'weekly', 'monthly', 'alltime'].includes(period as string)) {
            return NextResponse.json({ error: "Invalid period" }, { status: 400 });
        }

        const [topUsers, userRank, userScore] = await Promise.all([
            getLeaderboard(period as any, type as any, 100),
            getUserRank(userId, period as any, type as any),
            getUserScore(userId, period as any, type as any)
        ]);

        return NextResponse.json({
            leaderboard: topUsers,
            userStats: {
                rank: userRank || "-",
                score: userScore || 0,
                userId: userId
            }
        });

    } catch (error) {
        console.error("[Leaderboard API] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
