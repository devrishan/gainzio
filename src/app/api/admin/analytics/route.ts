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

        const { searchParams } = new URL(request.url);
        const fromParam = searchParams.get("from");
        const toParam = searchParams.get("to");

        let fromDate: Date;
        let toDate: Date;

        if (fromParam && toParam) {
            fromDate = new Date(fromParam);
            toDate = new Date(toParam);
        } else {
            // Default Last 30 Days
            toDate = new Date();
            fromDate = new Date();
            fromDate.setDate(toDate.getDate() - 30);
        }

        // 1. User Signups Trend
        const users = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: fromDate,
                    lte: toDate
                },
                role: Role.USER
            },
            select: { createdAt: true }
        });

        // 2. Revenue (Completed Withdrawals) Trend
        const withdrawals = await prisma.withdrawal.findMany({
            where: {
                processedAt: {
                    gte: fromDate,
                    lte: toDate
                },
                status: 'COMPLETED'
            },
            select: { processedAt: true, amount: true }
        });

        // Group by Date for Recharts
        const chartData = [];
        const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const daysToRender = diffDays > 0 ? diffDays : 1;

        // Iterate from 'from' to 'to'
        for (let i = 0; i <= daysToRender; i++) {
            const d = new Date(fromDate);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

            const dailyUsers = users.filter(u => u.createdAt.toISOString().startsWith(dateStr)).length;
            const dailyRevenue = withdrawals
                .filter(w => w.processedAt && w.processedAt.toISOString().startsWith(dateStr))
                .reduce((sum, w) => sum + Number(w.amount), 0);

            chartData.push({
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
