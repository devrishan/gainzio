import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const withdrawSchema = z.object({
  amount: z.number().positive().min(100, 'Minimum withdrawal amount is â‚¹100'),
  upiId: z.string().min(1, 'UPI ID is required').max(255),
});

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    let userId: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userId = payload.sub;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const validation = withdrawSchema.parse(body);
    const { amount, upiId } = validation;

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 },
      );
    }

    // Check if user has enough withdrawable balance
    if (Number(wallet.withdrawable) < amount) {
      return NextResponse.json(
        { success: false, error: 'Insufficient withdrawable balance' },
        { status: 400 },
      );
    }

    // Check minimum withdrawal amount
    if (amount < 100) {
      return NextResponse.json(
        { success: false, error: 'Minimum withdrawal amount is â‚¹100' },
        { status: 400 },
      );
    }

    // Create withdrawal request
    const withdrawal = await prisma.$transaction(async (tx) => {
      // Lock wallet for update
      const lockedWallet = await tx.wallet.findUnique({
        where: { userId },
      });

      if (!lockedWallet || Number(lockedWallet.withdrawable) < amount) {
        throw new Error('Insufficient balance');
      }

      // Create withdrawal
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount,
          status: 'PENDING',
          upiId,
        },
      });

      // Update wallet (move from withdrawable to pending)
      await tx.wallet.update({
        where: { userId },
        data: {
          withdrawable: { decrement: amount },
          pendingAmount: { increment: amount },
        },
      });

      // Create transaction record
      await tx.walletTransaction.create({
        data: {
          userId,
          walletId: lockedWallet.id,
          amount: -amount, // Negative for withdrawal
          type: 'WITHDRAWAL_REQUEST',
          metadata: {
            withdrawalId: newWithdrawal.id,
            upiId,
          },
        },
      });

      return newWithdrawal;
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal.id,
        amount: Number(withdrawal.amount),
        status: withdrawal.status,
        upi_id: withdrawal.upiId,
        requested_at: withdrawal.requestedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creating withdrawal:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create withdrawal',
      },
      { status: 500 },
    );
  }
}
