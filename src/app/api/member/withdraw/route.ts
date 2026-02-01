import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { settingsService } from '@/services/settings-service';

const withdrawSchema = z.object({
  amount: z.number().positive(),
  upiId: z.string().min(1, 'UPI ID is required').max(255),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Standardized Auth Check
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }
    const userId = authUser.userId;

    // Check Shadow Ban Status
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isShadowBanned: true }
    });

    if (user?.isShadowBanned) {
      return NextResponse.json(
        { success: false, error: 'Account restricted. Please contact support.' },
        { status: 403 }
      );
    }

    // --- CHECK SYSTEM LIMITS ---
    const settings = await settingsService.getEffectiveSettings(userId);
    const maxWithdrawals = settings.limits.maxWithdrawalsPerWeek;
    const minPayout = settings.limits.minPayoutAmount;

    // Count this week's withdrawals
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const weeklyWithdrawalsCount = await prisma.withdrawal.count({
      where: {
        userId: userId,
        requestedAt: { gte: oneWeekAgo },
        status: { notIn: ['REJECTED', 'CANCELLED', 'FAILED'] }
      }
    });

    if (weeklyWithdrawalsCount >= maxWithdrawals) {
      return NextResponse.json(
        { success: false, error: `Weekly withdrawal limit reached. You can only make ${maxWithdrawals} withdrawals per 7 days.` },
        { status: 429 }
      );
    }
    // ---------------------------

    const body = await request.json();
    const validation = withdrawSchema.parse(body);
    const { amount, upiId } = validation;

    // Dynamic Minimum Payout Check
    if (amount < minPayout) {
      return NextResponse.json(
        { success: false, error: `Minimum withdrawal amount is ₹${minPayout}` },
        { status: 400 }
      );
    }

    // 2. Atomic Transaction to Prevent Race Conditions
    const withdrawal = await prisma.$transaction(async (tx) => {
      // A. Attempt to deduct balance ATOMICALLY
      // This ensures that even if 2 requests come in parallel, only one will successfully find
      // a wallet with enough balance in this specific query snapshot.
      const updateResult = await tx.wallet.updateMany({
        where: {
          userId: userId,
          withdrawable: { gte: amount } // CRITICAL: Only update if balance is sufficient
        },
        data: {
          withdrawable: { decrement: amount },
          pendingAmount: { increment: amount },
        },
      });

      if (updateResult.count === 0) {
        throw new Error('Insufficient withdrawable balance or wallet not found');
      }

      // Re-fetch wallet to get ID for transaction record (since updateMany doesn't return it)
      const wallet = await tx.wallet.findUniqueOrThrow({ where: { userId } });

      // B. Check gamification rank for auto-approval
      const gamification = await tx.gamificationState.findUnique({
        where: { userId },
      });

      let status: 'PENDING' | 'APPROVED' = 'PENDING';
      let processedAt: Date | null = null;
      let notes: string | null = null;

      // Auto-approve for ELITE/MASTER if amount <= 500
      if (gamification && (gamification.rank === 'ELITE' || gamification.rank === 'MASTER') && amount <= 500) {
        status = 'APPROVED';
        processedAt = new Date();
        notes = 'Auto-approved via Gainzio Trust System (Rank Benefit)';
      }

      // C. Create withdrawal record
      const newWithdrawal = await tx.withdrawal.create({
        data: {
          userId,
          amount,
          status,
          upiId,
          processedAt,
          notes,
        },
      });

      // D. Create transaction record
      await tx.walletTransaction.create({
        data: {
          userId,
          walletId: wallet.id,
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

    // Handle specific insufficient funds error from our localized check
    if (error instanceof Error && error.message.includes('Insufficient')) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create withdrawal',
      },
      { status: 500 },
    );
  }
}
