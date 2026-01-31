import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        const body = await request.json();
        const { userId, type, amount, reason, description } = body;
        // type: "CREDIT" or "DEBIT"

        if (!userId || !amount || !reason) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const numericAmount = Number(amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        let transactionType = type === 'CREDIT' ? 'ADMIN_CREDIT' : 'ADMIN_DEBIT';
        let finalAmount = type === 'CREDIT' ? numericAmount : -numericAmount;

        // Perform Transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Get Wallet
            const wallet = await tx.wallet.findUnique({ where: { userId } });
            if (!wallet) throw new Error("Wallet not found");

            // 2. Create Transaction Record
            const transaction = await tx.walletTransaction.create({
                data: {
                    userId,
                    walletId: wallet.id,
                    amount: finalAmount,
                    type: transactionType,
                    metadata: {
                        reason,
                        description,
                        adminId: authUser.id
                    }
                }
            });

            // 3. Update Wallet Balance
            // For simplicity, we just increment balance and 'totalEarned' if it's a credit.
            // If debit, we just decrease balance.
            const updateData: any = {
                balance: { increment: finalAmount }
            };

            if (type === 'CREDIT') {
                updateData.totalEarned = { increment: finalAmount };
            }

            await tx.wallet.update({
                where: { id: wallet.id },
                data: updateData
            });

            // 4. Audit Log
            await tx.auditLog.create({
                data: {
                    actorId: authUser.id,
                    action: `WALLET_${type}`,
                    entityType: 'User',
                    entityId: userId,
                    metadata: { amount: numericAmount, reason }
                }
            });

            return transaction;
        });

        return NextResponse.json({ success: true, transactionId: result.id });

    } catch (error) {
        console.error('Wallet Doctor Error:', error);
        return NextResponse.json({ success: false, error: 'Adjustment failed' }, { status: 500 });
    }
}
