import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { startOfDay, subDays, format } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(req);
        if (!authUser || authUser.role !== 'ADMIN') {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        const days = 30; // Default to 30 days
        const startDate = startOfDay(subDays(new Date(), days));

        // 1. User Growth & Retention (DAU)
        // using ActivityLog as a proxy for 'Active'
        const dailyActiveRaw = await prisma.activityLog.groupBy({
            by: ['createdAt', 'userId'],
            where: {
                createdAt: { gte: startDate },
                userId: { not: null }
            },
        });

        // Group by day manually since Prisma doesn't support date truncation in groupBy easily across DBs without raw query
        // Optimizing: Fetch counts via raw query is better for performace, but for now map in JS
        // Actually, let's use a cleaner approach: Get New Users per day
        const newUsersRaw = await prisma.user.groupBy({
            by: ['createdAt'],
            where: { createdAt: { gte: startDate } },
            _count: { id: true },
        });

        // 2. Economy Health (Mint vs Burn)
        const coinStatsRaw = await prisma.coinTransaction.findMany({
            where: { createdAt: { gte: startDate } },
            select: {
                createdAt: true,
                type: true, // 'EARN' or 'SPEND'
                amount: true,
            }
        });

        // 3. Task Stats
        const taskSubmissionsRaw = await prisma.taskSubmission.groupBy({
            by: ['submittedAt', 'status'],
            where: { submittedAt: { gte: startDate } },
            _count: { id: true },
        });

        // --- AGGREGATION LOGIC ---
        const dateMap = new Map<string, {
            date: string;
            newUsers: number;
            dau: number; // Placeholder until we have better tracking
            coinsMinted: number;
            coinsBurned: number;
            submissions: number;
            approvals: number;
        }>();

        // Initialize map
        for (let i = 0; i <= days; i++) {
            const d = subDays(new Date(), days - i);
            const key = format(d, 'yyyy-MM-dd');
            dateMap.set(key, {
                date: key,
                newUsers: 0,
                dau: 0,
                coinsMinted: 0,
                coinsBurned: 0,
                submissions: 0,
                approvals: 0
            });
        }

        // Process New Users
        newUsersRaw.forEach(item => {
            const key = format(item.createdAt, 'yyyy-MM-dd');
            if (dateMap.has(key)) {
                dateMap.get(key)!.newUsers += item._count.id;
            }
        });

        // Process Economy
        coinStatsRaw.forEach(tx => {
            const key = format(tx.createdAt, 'yyyy-MM-dd');
            if (dateMap.has(key)) {
                if (tx.type === 'EARN') dateMap.get(key)!.coinsMinted += Math.abs(tx.amount);
                if (tx.type === 'SPEND') dateMap.get(key)!.coinsBurned += Math.abs(tx.amount);
            }
        });

        // Process Tasks
        taskSubmissionsRaw.forEach(item => {
            const key = format(item.submittedAt, 'yyyy-MM-dd');
            if (dateMap.has(key)) {
                dateMap.get(key)!.submissions += item._count.id;
                if (item.status === 'APPROVED') {
                    dateMap.get(key)!.approvals += item._count.id;
                }
            }
        });

        const chartData = Array.from(dateMap.values());

        return NextResponse.json({ success: true, analytics: chartData });
    } catch (error) {
        console.error('Analytics error:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
