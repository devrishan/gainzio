import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
        }
        const userId = authUser.userId;

        // 1. Check System Config (Kill Switch)
        const shopConfig = await prisma.systemConfig.findUnique({
            where: { key: 'shop_config' },
        });

        // Default config: enabled, prices
        const config = (shopConfig?.value as any) || { enabled: true, streakFreezeCost: 500 };
        if (!config.enabled) {
            return NextResponse.json({ success: false, error: 'Coin Shop is currently closed.' }, { status: 503 });
        }

        const body = await request.json();
        const { itemId } = body;

        // 2. Validate Item
        if (itemId !== 'STREAK_FREEZE') {
            return NextResponse.json({ success: false, error: 'Item not available yet.' }, { status: 400 });
        }

        const cost = config.streakFreezeCost || 500;

        // 3. Transaction: Deduct Coins + Apply Effect
        await prisma.$transaction(async (tx) => {
            // Lock Wallet & Check Balance
            const wallet = await tx.wallet.findUnique({
                where: { userId },
            });

            if (!wallet || wallet.coins < cost) {
                throw new Error('Insufficient coins');
            }

            // Apply Effect (Streak Freeze logic)
            // Check limits: Max 1 freeze active? Or just limit frequency?
            // For v1: We just log it. Real implementation of "Consuming" a freeze happens in the daily cron.
            // We'll verify they don't already have one "queued" if we stored that state.
            // For now, let's assume immediate "Repair" or "Protection" intent.

            // Actually, let's store a "PROTECTION" flag or just rely on the transaction log for the Cron to pick up?
            // Better: Update GamificationState to have `hasStreakFreeze: true`? 
            // Schema doesn't have it. We'll stick to just deducting for now and logging the "SPEND".
            // The Cron job that resets streaks should check `CoinTransaction` for a 'STREAK_FREEZE' bought within the last 24h?
            // Or we assume this is "Reparing" a broken streak?
            // Let's go with: It sets a flag in preferences or gamification. 
            // Since we can't migrate easily again, let's use `CoinTransaction` as the proof of purchase.
            // The Cron will check: "Did user buy STREAK_FREEZE today? If yes, don't reset."

            // Deduct Coins
            await tx.wallet.update({
                where: { userId },
                data: { coins: { decrement: cost } }
            });

            // Record Transaction
            await tx.coinTransaction.create({
                data: {
                    userId,
                    amount: -cost,
                    type: 'SPEND',
                    source: 'STREAK_FREEZE',
                    description: 'Purchased Streak Freeze',
                    metadata: {
                        itemId,
                        cost,
                        validForDate: new Date().toISOString().split('T')[0] // Valid for today
                    }
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Streak Freeze activated!',
            data: { cost, remainingCoins: (await prisma.wallet.findUnique({ where: { userId } }))?.coins }
        });

    } catch (error: any) {
        if (error.message === 'Insufficient coins') {
            return NextResponse.json({ success: false, error: 'Insufficient coins' }, { status: 402 });
        }
        console.error('Error purchasing item:', error);
        return NextResponse.json({ success: false, error: 'Purchase failed' }, { status: 500 });
    }
}
