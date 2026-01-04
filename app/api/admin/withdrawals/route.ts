import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role, WithdrawalStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    // Authorization Check

    const userRole = authUser.role;
    if (userRole !== Role.ADMIN && userRole !== Role.PAYOUT_MANAGER) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as WithdrawalStatus | null;

    const where: Record<string, any> = {};

    if (status) {
      where.status = status;
    } else {
      // Default to pending if no status specified
      where.status = 'PENDING';
    }

    const withdrawals = await prisma.withdrawal.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            username: true,
            email: true,
          },
        },
      },
      orderBy: {
        requestedAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      withdrawals: withdrawals.map((withdrawal) => ({
        id: withdrawal.id,
        amount: Number(withdrawal.amount),
        status: withdrawal.status,
        upi_id: withdrawal.upiId,
        upi_qr_url: withdrawal.upiQrUrl,
        created_at: withdrawal.requestedAt.toISOString(),
        processed_at: withdrawal.processedAt?.toISOString() || null,
        tx_id: withdrawal.txId,
        receipt_url: withdrawal.receiptUrl,
        notes: withdrawal.notes,
        user: {
          username: withdrawal.user.username,
          email: withdrawal.user.email,
          phone: withdrawal.user.phone,
        },
      })),
    });
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch withdrawals' },
      { status: 500 },
    );
  }
}

