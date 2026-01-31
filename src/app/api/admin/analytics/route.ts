import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        // Calculate date range for "Last 30 Days"
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        // 1. User Signups Trend
        const users = await prisma.user.findMany({
            where: { createdAt: { gte: thirtyDaysAgo }, role: Role.USER },
            select: { createdAt: true }
        });

        // 2. Revenue (Completed Withdrawals) Trend
        const withdrawals = await prisma.withdrawal.findMany({
            where: {
                processedAt: { gte: thirtyDaysAgo },
                status: 'COMPLETED'
            },
            select: { processedAt: true, amount: true }
        });

        // Group by Date for Recharts
        const chartData = [];
        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

            const dailyUsers = users.filter(u => u.createdAt.toISOString().startsWith(dateStr)).length;
            const dailyRevenue = withdrawals
                .filter(w => w.processedAt && w.processedAt.toISOString().startsWith(dateStr))
                .reduce((sum, w) => sum + Number(w.amount), 0);

            chartData.unshift({
                date: dateStr,
                users: dailyUsers,
                revenue: dailyRevenue
            });
        }

        return NextResponse.json({ success: true, analytics: chartData });

    } catch (error) {
        console.error('Error fetching analytics:', error);
        return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
    }
}
