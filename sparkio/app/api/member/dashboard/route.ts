import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET() {
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

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      // Create wallet if it doesn't exist
      await prisma.wallet.create({
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
      });
    }

    // Get referral stats
    const referralStats = await prisma.referral.groupBy({
      by: ['status'],
      where: {
        referrerId: userId,
      },
      _count: {
        id: true,
      },
    });

    const totalReferrals = referralStats.reduce((sum, stat) => sum + stat._count.id, 0);
    const verifiedCount = referralStats.find((s) => s.status === 'verified')?._count.id || 0;
    const pendingCount = referralStats.find((s) => s.status === 'pending')?._count.id || 0;
    const successRate = totalReferrals > 0 ? (verifiedCount / totalReferrals) * 100 : 0;

    // Get top referrers (all users, not just current user)
    const topReferrers = await prisma.user.findMany({
      where: {
        role: 'USER',
      },
      include: {
        referralEvents: {
          where: {
            status: 'verified',
          },
        },
        wallet: true,
      },
      take: 5,
    });

    const topReferrersData = topReferrers
      .map((user) => ({
        username: user.username || user.phone,
        referral_code: user.referralCode,
        verified_referrals: user.referralEvents.length,
        total_earned: user.wallet ? Number(user.wallet.totalEarned) : 0,
      }))
      .sort((a, b) => {
        if (b.verified_referrals !== a.verified_referrals) {
          return b.verified_referrals - a.verified_referrals;
        }
        return b.total_earned - a.total_earned;
      });

    const finalWallet = wallet || {
      balance: 0,
      pendingAmount: 0,
      withdrawable: 0,
      lockedAmount: 0,
      coins: 0,
      totalEarned: 0,
      currency: 'INR',
    };

    return NextResponse.json({
      success: true,
      wallet: {
        balance: Number(finalWallet.balance),
        total_earned: Number(finalWallet.totalEarned),
      },
      referrals: {
        total: totalReferrals,
        verified: verifiedCount,
        pending: pendingCount,
        success_rate: Number(successRate.toFixed(2)),
      },
      top_referrers: topReferrersData,
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard' },
      { status: 500 },
    );
  }
}

