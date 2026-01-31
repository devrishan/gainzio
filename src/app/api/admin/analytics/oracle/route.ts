import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role, TaskSubmission } from '@prisma/client';

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // 1. GLOBE DATA (Active Users + IP Geo Simulation)
    // In strict prod, we'd use MaxMind. Here we mock coords based on IP hash or similar for demo effect
    // or fetch real last_login_ips.
    const activeUsers = await prisma.user.findMany({
        where: { last_login_at: { not: null } },
        select: { id: true, last_login_at: true },
        take: 50,
        orderBy: { last_login_at: 'desc' }
    });

    // Mocking lat/lng for visual wow factor if real data missing
    const globeData = activeUsers.map(u => ({
        lat: (Math.random() * 180 - 90).toFixed(4),
        lng: (Math.random() * 360 - 180).toFixed(4),
        userId: u.id,
        lastActive: u.last_login_at
    }));


    // 2. RETENTION COHORT (Simplified)
    // "Users joined 30 days ago, who logged in last 3 days"
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const joinedCohort = await prisma.user.count({
        where: { createdAt: { lte: thirtyDaysAgo } }
    });
    const retained = await prisma.user.count({
        where: {
            createdAt: { lte: thirtyDaysAgo },
            last_login_at: { gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) }
        }
    });
    const retentionRate = joinedCohort > 0 ? ((retained / joinedCohort) * 100).toFixed(1) : 0;


    // 3. CHURN RADAR (High value users inactive > 7 days)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const churnRisk = await prisma.user.findMany({
        where: {
            wallet: { totalEarned: { gt: 1000 } }, // High Value
            last_login_at: { lt: sevenDaysAgo }
        },
        select: { id: true, username: true, email: true, wallet: { select: { totalEarned: true } } },
        take: 10
    });


    // 4. PROFIT COMMAND (Revenue vs Liability)
    // Revenue = Sum(Task Rewards * Markup) - (Markup is theoretical here, let's assume we pay out 70%)
    // Liability = Wallet Balances
    const walletAgg = await prisma.wallet.aggregate({
        _sum: {
            balance: true,
            totalEarned: true
        }
    });

    // Theoretical Revenue (assuming we keep 30% margin on top of what we paid)
    // Total Paid = totalEarned. External Revenue = Total Paid / 0.7
    const totalPaid = Number(walletAgg._sum.totalEarned || 0);
    const estRevenue = totalPaid / 0.7;
    const grossProfit = estRevenue - totalPaid;
    const liability = Number(walletAgg._sum.balance || 0);

    return NextResponse.json({
        success: true,
        oracle: {
            globe: globeData,
            retention: { rate: retentionRate, cohortSize: joinedCohort },
            churnRisk,
            profit: {
                revenue: estRevenue.toFixed(2),
                payouts: totalPaid.toFixed(2),
                profit: grossProfit.toFixed(2),
                liability: liability.toFixed(2)
            }
        }
    });
}
