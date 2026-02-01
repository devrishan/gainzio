import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const convertSchema = z.object({
    coins: z.number().int().min(100, 'Minimum conversion is 100 coins'),
});

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser) {
            return NextResponse.json({ success: false, error: 'Unauthenticated' }, { status: 401 });
        }

        const body = await request.json();
        const validation = convertSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ success: false, error: validation.error.message }, { status: 400 });
        }

        const { coins } = validation.data;
        const conversionRate = 100; // 100 Coins = 1 INR
        const amountINR = coins / conversionRate;

        // Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Check and Deduct Coins
            const wallet = await tx.wallet.findUnique({ where: { userId: authUser.userId } });

            if (!wallet || wallet.coins < coins) {
                throw new Error("Insufficient coins");
            }

            const updatedWallet = await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    coins: { decrement: coins },
                    balance: { increment: amountINR },
                    withdrawable: { increment: amountINR },
                    // Note: Converted money is immediately withdrawable based on "Coins first... withdrawable only after rules"
                    // The "Rules" (Locking) happened BEFORE valid coins became available.
                    // So once they are coins, they are safe to convert and withdraw.
                }
            });

            // 2. Log Coin Spend
            await tx.coinTransaction.create({
                data: {
                    userId: authUser.userId,
                    amount: -coins,
                    type: "SPEND",
                    status: "COMPLETED",
                    description: `Converted to ₹${amountINR}`,
                    source: "CONVERSION",
                    metadata: { amountINR, rate: conversionRate }
                }
            });

            // 3. Log Wallet Credit
            await tx.walletTransaction.create({
                data: {
                    userId: authUser.userId,
                    walletId: wallet.id,
                    amount: amountINR,
                    type: "CONVERSION",
                    metadata: { coinsConverted: coins }
                }
            });

            return updatedWallet;
        });

        return NextResponse.json({
            success: true,
            message: `Successfully converted ${coins} coins to ₹${amountINR}`,
            new_balance: result.balance,
            new_coins: result.coins
        });

    } catch (error) {
        console.error("Conversion Error:", error);
        return NextResponse.json(
            { success: false, error: error instanceof Error ? error.message : "Conversion failed" },
            { status: 400 }
        );
    }
}
