import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { amount, message } = body;
        const rewardAmount = Number(amount) || 100;

        // "Rain" on active users (e.g. active in last 24h)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        // 1. Find active users
        const activeUsers = await prisma.user.findMany({
            where: { last_login_at: { gte: oneDayAgo } },
            select: { id: true }
        });

        if (activeUsers.length === 0) return NextResponse.json({ success: true, count: 0 });

        // 2. Batch update wallets
        // Prisma doesn't support multi-table update with different values easily, but here it's same value.
        // updateMany on Wallet where userId in activeUserIds
        const activeUserIds = activeUsers.map(u => u.id);

        await prisma.$transaction([
            prisma.wallet.updateMany({
                where: { userId: { in: activeUserIds } },
                data: { coins: { increment: rewardAmount } }
            }),
            // Create specific notifications
            prisma.notification.createMany({
                data: activeUserIds.map(id => ({
                    userId: id,
                    type: "RANK_UPGRADE", // Using RANK_UPGRADE as proxy for 'Reward' since schema restricts types
                    title: "JACKPOT! 🎰",
                    body: message || `You received ${rewardAmount} coins from the Admin Jackpot!`,
                    isRead: false
                }))
            })
        ]);

        // Log it
        await prisma.auditLog.create({
            data: {
                actorId: authUser.id,
                action: "JACKPOT_TRIGGERED",
                metadata: {
                    amount: rewardAmount,
                    count: activeUsers.length,
                    details: `Dropped ${rewardAmount} coins to ${activeUsers.length} users.`,
                    ip: "127.0.0.1"
                }
            }
        });

        return NextResponse.json({ success: true, count: activeUsers.length });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
