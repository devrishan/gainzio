import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import { creditMultiLevelCommissions } from '@/lib/referrals';
import { z } from 'zod';

const updateSchema = z.object({
  new_status: z.enum(['verified', 'rejected']),
  commission_amount: z.number().positive().optional(),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }


    const userRole = authUser.role;
    if (userRole !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const referralId = params.id;
    const body = await request.json();
    const validation = updateSchema.parse(body);
    const { new_status, commission_amount } = validation;

    // Get referral
    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
      include: {
        referrer: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!referral) {
      return NextResponse.json(
        { success: false, error: 'Referral not found' },
        { status: 404 },
      );
    }

    if (referral.status === 'verified' && new_status === 'verified') {
      return NextResponse.json(
        { success: false, error: 'Referral already verified' },
        { status: 400 },
      );
    }

    if (new_status === 'verified') {
      // Update commission amount if provided
      const finalCommissionAmount = commission_amount || Number(referral.commissionAmount);

      if (finalCommissionAmount <= 0) {
        return NextResponse.json(
          { success: false, error: 'Commission amount must be greater than zero' },
          { status: 400 },
        );
      }

      // Update referral and credit wallet
      await prisma.$transaction(async (tx) => {
        // Update referral
        await tx.referral.update({
          where: { id: referralId },
          data: {
            status: 'verified',
            commissionAmount: finalCommissionAmount,
          },
        });

        // Credit wallet if not already credited
        if (referral.referrer.wallet && referral.status !== 'verified') {
          await tx.wallet.update({
            where: { id: referral.referrer.wallet.id },
            data: {
              balance: { increment: finalCommissionAmount },
              withdrawable: { increment: finalCommissionAmount },
              totalEarned: { increment: finalCommissionAmount },
            },
          });

          // Create transaction record
          await tx.walletTransaction.create({
            data: {
              userId: referral.referrerId,
              walletId: referral.referrer.wallet.id,
              amount: finalCommissionAmount,
              type: 'REFERRAL_COMMISSION',
              metadata: {
                referralId: referral.id,
                level: referral.level,
                referredUserId: referral.referredUserId,
              },
            },
          });
        }
      });

      // Credit multi-level commissions for all levels
      await creditMultiLevelCommissions(referralId);

      // Award XP for referral verification
      const { handleReferralVerification } = await import('@/lib/gamification');
      await handleReferralVerification(referral.referrerId, referralId);
    } else if (new_status === 'rejected') {
      if (referral.status === 'verified') {
        return NextResponse.json(
          { success: false, error: 'Verified referrals cannot be rejected' },
          { status: 400 },
        );
      }

      await prisma.referral.update({
        where: { id: referralId },
        data: {
          status: 'rejected',
        },
      });
    }

    const updatedReferral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    return NextResponse.json({
      success: true,
      message: 'Referral updated successfully',
      referral_id: referralId,
      status: updatedReferral?.status,
      commission_amount: updatedReferral ? Number(updatedReferral.commissionAmount) : 0,
    });
  } catch (error) {
    console.error('Error updating referral:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update referral',
      },
      { status: 500 },
    );
  }
}

