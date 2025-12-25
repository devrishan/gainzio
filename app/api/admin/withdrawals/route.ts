import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Role, WithdrawalStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    let userRole: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userRole = payload.role;

      // Only admins and payout managers can access
      if (userRole !== Role.ADMIN && userRole !== Role.PAYOUT_MANAGER) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
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

