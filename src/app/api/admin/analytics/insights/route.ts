import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { subDays, startOfDay, endOfDay } from "date-fns";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // 1. Growth Trend (Last 7 days vs Previous 7 days)
        const today = new Date();
        const sevenDaysAgo = subDays(today, 7);
        const fourteenDaysAgo = subDays(today, 14);

        const newUsersLast7Days = await prisma.user.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });

        const newUsersPrev7Days = await prisma.user.count({
            where: {
                createdAt: {
                    gte: fourteenDaysAgo,
                    lt: sevenDaysAgo,
                },
            },
        });

        let growthTrend = 0;
        if (newUsersPrev7Days > 0) {
            growthTrend = ((newUsersLast7Days - newUsersPrev7Days) / newUsersPrev7Days) * 100;
        } else if (newUsersLast7Days > 0) {
            growthTrend = 100; // infinite growth from 0
        }

        // 2. Economy Health (Mint vs Burn Ratio in last 30 days)
        const thirtyDaysAgo = subDays(today, 30);

        // Sum of all "EARN" transactions (Minted)
        const mintedResult = await prisma.coinTransaction.aggregate({
            where: {
                type: "EARN",
                createdAt: { gte: thirtyDaysAgo },
            },
            _sum: { amount: true },
        });
        const totalMinted = mintedResult._sum.amount || 0;

        // Sum of all "SPEND" transactions (Burned)
        const burnedResult = await prisma.coinTransaction.aggregate({
            where: {
                type: "SPEND",
                createdAt: { gte: thirtyDaysAgo },
            },
            _sum: { amount: true },
        });
        const totalBurned = burnedResult._sum.amount || 0;

        let economyHealth = "STABLE";
        let economyMessage = "Economy is performing within expected parameters.";
        let recommendation = "No immediate action required.";

        if (totalMinted > totalBurned * 3) {
            economyHealth = "INFLATIONARY";
            economyMessage = "High minting rate detected. Users are accumulating coins faster than they spend.";
            recommendation = "Consider adding high-ticket Shop items or limited-time sinks.";
        } else if (totalBurned > totalMinted) {
            economyHealth = "DEFLATIONARY";
            economyMessage = "Users are spending faster than they earn. Liquidity crunch possible.";
            recommendation = "Boost task rewards or introduce a login bonus event.";
        }

        // 3. Engagement Score (Active Users / Total Users)
        // "Active" defined as logged in within last 3 days
        const threeDaysAgo = subDays(today, 3);
        const activeUsers = await prisma.user.count({
            where: { last_login_at: { gte: threeDaysAgo } }
        });
        const totalUsers = await prisma.user.count();

        const engagementRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;

        // 4. Construct Intelligence Object
        const intelligence = {
            growth: {
                newUsersLast7Days,
                trendPermission: growthTrend, // % change
                status: growthTrend >= 0 ? "POSITIVE" : "NEGATIVE",
            },
            economy: {
                minted: totalMinted,
                burned: totalBurned,
                health: economyHealth,
                message: economyMessage,
                recommendation,
            },
            engagement: {
                activeUsers,
                totalUsers,
                rate: engagementRate,
            },
            generatedAt: new Date().toISOString(),
        };

        return NextResponse.json({ success: true, intelligence });
    } catch (error) {
        console.error("Error generating insights:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
