import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { startOfWeek, endOfWeek } from 'date-fns';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const cookieStore = cookies();
        const accessToken = cookieStore.get('earniq_access_token')?.value;

        if (!accessToken) {
            return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
        }

        let userId: string;
        try {
            const payload = await verifyAccessToken(accessToken);
            userId = payload.sub;
        } catch {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });
        }

        // 1. Get System Config for Squad Settings
        const squadConfig = await prisma.systemConfig.findUnique({
            where: { key: 'squad_config' },
        });

        // Default config if not set
        const goalAmount = (squadConfig?.value as any)?.weeklyGoal || 5000;
        const isEnabled = (squadConfig?.value as any)?.enabled ?? true;

        if (!isEnabled) {
            return NextResponse.json({ success: false, error: 'Squad Wars disabled' }, { status: 503 });
        }

        // 2. Identify Squad Members (User + Direct Referrals)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                referrals: {
                    select: { id: true, username: true } // Direct referrals only
                }
            }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
        }

        const squadMemberIds = [user.id, ...user.referrals.map(r => r.id)];

        // 3. Define Time Window (Current Week)
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Monday start
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });

        // 4. Aggregate Earnings (Wallet Transactions)
        // We count 'TASK_REWARD', 'REFERRAL_COMMISSION' (if any), 'BONUS'
        const transactions = await prisma.walletTransaction.findMany({
            where: {
                userId: { in: squadMemberIds },
                createdAt: {
                    gte: weekStart,
                    lte: weekEnd
                },
                amount: { gt: 0 } // positive earning only
                // optional: type: { in: ['TASK_REWARD', 'REFERRAL_BONUS'] }
            },
            select: {
                userId: true,
                amount: true,
                user: {
                    select: { username: true }
                }
            }
        });

        // 5. Process Stats
        const totalEarnings = transactions.reduce((sum, t) => sum + Number(t.amount), 0);
        const contributions: Record<string, number> = {};
        const memberMap: Record<string, string> = {};

        // Initialize logic to ensure even 0 earners show up if they are in squad? 
        // Maybe just show active ones + self.
        squadMemberIds.forEach(id => {
            contributions[id] = 0;
            if (id === user.id) memberMap[id] = user.username || 'You';
            else {
                const ref = user.referrals.find(r => r.id === id);
                memberMap[id] = ref?.username || 'Member';
            }
        });

        transactions.forEach(t => {
            contributions[t.userId] = (contributions[t.userId] || 0) + Number(t.amount);
        });

        // Helper: Top Contributors List
        const topContributors = Object.entries(contributions)
            .map(([uid, amount]) => ({
                userId: uid,
                username: uid === userId ? 'You' : (memberMap[uid] || 'Squad Member'),
                amount: amount,
                isSelf: uid === userId
            }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5); // Top 5

        return NextResponse.json({
            success: true,
            squad: {
                membersCount: squadMemberIds.length,
                weeklyGoal: goalAmount,
                currentTotal: totalEarnings,
                remaining: Math.max(0, goalAmount - totalEarnings),
                progressPercent: Math.min(100, (totalEarnings / goalAmount) * 100),
                isGoalMet: totalEarnings >= goalAmount,
                topContributors,
                weekEndsAt: weekEnd.toISOString()
            }
        });

    } catch (error) {
        console.error('Error fetching squad:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch squad' }, { status: 500 });
    }
}
