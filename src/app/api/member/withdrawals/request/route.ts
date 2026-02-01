import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { WithdrawalStatus } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthenticated' },
                { status: 401 },
            );
        }

        const { amount, paymentMethod, upiId, bankDetails } = await request.json();

        if (!amount || amount <= 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid withdrawal amount' },
                { status: 400 },
            );
        }

        if (!paymentMethod) {
            return NextResponse.json(
                { success: false, error: 'Payment method is required' },
                { status: 400 },
            );
        }

        // 1. Get User Wallet
        const wallet = await prisma.wallet.findUnique({
            where: { userId: authUser.userId },
        });

        if (!wallet) {
            return NextResponse.json(
                { success: false, error: 'Wallet not found' },
                { status: 404 },
            );
        }

        // 2. Check Balance
        if (Number(wallet.withdrawable) < Number(amount)) {
            return NextResponse.json(
                { success: false, error: 'Insufficient withdrawable balance' },
                { status: 400 },
            );
        }

        // 3. Process Request in Transaction
        const result = await prisma.$transaction(async (tx) => {
            // Create Withdrawal Request
            const withdrawal = await tx.withdrawal.create({
                data: {
                    userId: authUser.userId,
                    amount: amount,
                    status: WithdrawalStatus.PENDING,
                    upiId: upiId || "N/A", // Fallback if bank transfer, or store in metadata
                    metadata: {
                        paymentMethod,
                        bankDetails
                    }
                }
            });

            // Deduct from Withdrawable, Add to Locked (or just deduct?)
            // Usually we move it to 'lockedAmount' until it is processed or rejected.
            await tx.wallet.update({
                where: { id: wallet.id },
                data: {
                    withdrawable: { decrement: amount },
                    lockedAmount: { increment: amount },
                }
            });

            // Log Transaction
            await tx.walletTransaction.create({
                data: {
                    userId: authUser.userId,
                    walletId: wallet.id,
                    amount: amount,
                    type: 'WITHDRAWAL_REQUEST',
                    metadata: {
                        withdrawalId: withdrawal.id,
                        paymentMethod
                    }
                }
            });

            // Notify Admins? (Optional - typically handled by admin polling/dashboard)

            return withdrawal;
        });

        return NextResponse.json({
            success: true,
            message: 'Withdrawal request submitted successfully',
            withdrawal: result,
        });

    } catch (error) {
        console.error('Error requesting withdrawal:', error);
        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Failed to process withdrawal',
            },
            { status: 500 },
        );
    }
}
