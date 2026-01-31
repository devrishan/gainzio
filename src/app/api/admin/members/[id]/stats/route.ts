import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const userId = params.id;

        // 1. Wallet History (Graph)
        // Taking last 20 transactions for a mini-sparkline
        const walletTx = await prisma.walletTransaction.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { amount: true, type: true, createdAt: true }
        });

        // 2. Recent Logs (Login, Security)
        // We'll use LegacySession for login logs if available, or just mocking "Activity" from various sources if logs table is sparse.
        // Actually schema has `ActivityLog`! Let's use that.
        const activityLogs = await prisma.activityLog.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        // 3. Referral Tree (Direct only for now)
        const referrals = await prisma.user.findMany({
            where: { referredById: userId },
            select: { id: true, username: true, createdAt: true, email: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        return NextResponse.json({
            success: true,
            crm: {
                walletHistory: walletTx.reverse().map(t => ({
                    date: t.createdAt.toISOString(),
                    amount: Number(t.amount),
                    type: t.type
                })),
                activityLogs,
                referrals
            }
        });

    } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed' }, { status: 500 });
    }
}
