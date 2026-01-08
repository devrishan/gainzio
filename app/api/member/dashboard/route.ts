import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { calculateSmartScore } from '@/services/gamification';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    // Use the ID from the helper
    const userId = authUser.userId;

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

    // Recalculate Smart Score (1 INR = 100 Pts)
    const smartScore = await calculateSmartScore(userId);

    // Get gamification state
    let gamification = await prisma.gamificationState.findUnique({
      where: { userId },
      include: { badges: true },
    });

    if (!gamification) {
      gamification = await prisma.gamificationState.create({
        data: {
          userId,
          xp: 0,
          rank: 'NEWBIE',
          streakDays: 0,
        },
        include: { badges: true },
      });
    }

    // Calculate progression
    const RANKS = {
      NEWBIE: { min: 0, next: 'PRO', max: 1000 },
      PRO: { min: 1000, next: 'ELITE', max: 5000 },
      ELITE: { min: 5000, next: 'MASTER', max: 20000 },
      MASTER: { min: 20000, next: null, max: null },
    };

    const currentRankConfig = RANKS[gamification.rank as keyof typeof RANKS] || RANKS.NEWBIE;
    const nextRank = currentRankConfig.next;
    const xpToNext = currentRankConfig.max ? currentRankConfig.max - gamification.xp : 0;
    const progressPercent = currentRankConfig.max
      ? Math.min(100, Math.max(0, ((gamification.xp - currentRankConfig.min) / (currentRankConfig.max - currentRankConfig.min)) * 100))
      : 100;

    return NextResponse.json({
      success: true,
      wallet: {
        balance: Number(finalWallet.balance),
        total_earned: Number(finalWallet.totalEarned),
        coins: Number(finalWallet.coins),
      },
      referrals: {
        total: totalReferrals,
        verified: verifiedCount,
        pending: pendingCount,
        success_rate: Number(successRate.toFixed(2)),
      },
      top_referrers: topReferrersData,
      gamification: {
        xp: gamification.xp,
        rank: gamification.rank,
        streak: gamification.streakDays,
        smartScore: smartScore,
        next_rank: nextRank,
        xp_to_next: xpToNext,
        progress: progressPercent,
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard' },
      { status: 500 },
    );
  }
}

