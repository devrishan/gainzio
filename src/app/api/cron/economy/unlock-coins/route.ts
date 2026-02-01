import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const now = new Date();

        // 1. Find all LOCKED transactions that are ready to unlock
        const transactions = await prisma.coinTransaction.findMany({
            where: {
                status: "LOCKED",
                unlocksAt: {
                    lte: now
                }
            },
            take: 100 // Process in batches to avoid timeouts
        });

        if (transactions.length === 0) {
            return NextResponse.json({ success: true, count: 0, message: "No coins to unlock" });
        }

        let unlockedCount = 0;

        // 2. Process each transaction
        // Use transaction to ensure safety
        for (const tx of transactions) {
            try {
                await prisma.$transaction(async (prismaTx) => {
                    // A. Mark transaction as COMPLETED
                    await prismaTx.coinTransaction.update({
                        where: { id: tx.id },
                        data: { status: "COMPLETED" }
                    });

                    // B. Move coins from lockedCoins to coins (available)
                    await prismaTx.wallet.update({
                        where: { userId: tx.userId },
                        data: {
                            lockedCoins: { decrement: tx.amount },
                            coins: { increment: tx.amount }
                        }
                    });
                });
                unlockedCount++;
            } catch (err) {
                console.error(`Failed to unlock transaction ${tx.id}`, err);
            }
        }

        return NextResponse.json({
            success: true,
            processed: unlockedCount,
            timestamp: now.toISOString()
        });
    } catch (error) {
        console.error("[CRON_COIN_UNLOCK_ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
