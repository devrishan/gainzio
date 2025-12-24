import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

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

    // Get wallet with user
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            phone: true,
            username: true,
          },
        },
      },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      const newWallet = await prisma.wallet.create({
        data: {
          userId,
          balance: 0,
          pendingAmount: 0,
          withdrawable: 0,
          lockedAmount: 0,
          coins: 0,
          totalEarned: 0,
          currency: 'INR',
        },
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              username: true,
            },
          },
        },
      });

      return NextResponse.json({
        success: true,
        wallet: {
          balance: Number(newWallet.balance),
          pending_amount: Number(newWallet.pendingAmount),
          withdrawable: Number(newWallet.withdrawable),
          locked_amount: Number(newWallet.lockedAmount),
          coins: newWallet.coins,
          total_earned: Number(newWallet.totalEarned),
          currency: newWallet.currency,
        },
      });
    }

    return NextResponse.json({
      success: true,
      wallet: {
        balance: Number(wallet.balance),
        pending_amount: Number(wallet.pendingAmount),
        withdrawable: Number(wallet.withdrawable),
        locked_amount: Number(wallet.lockedAmount),
        coins: wallet.coins,
        total_earned: Number(wallet.totalEarned),
        currency: wallet.currency,
      },
    });
  } catch (error) {
    console.error('Error fetching wallet:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch wallet' },
      { status: 500 },
    );
  }
}

