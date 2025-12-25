import { prisma } from './prisma';

export interface ReferralLevel {
  level: number;
  userId: string;
  referralCode: string;
  username: string | null;
  phone: string;
}

export interface ReferralCommission {
  level: number;
  userId: string;
  amount: number;
  percentage: number;
}

/**
 * Get referral tree for a user (L1, L2, L3)
 */
export async function getReferralTree(userId: string): Promise<ReferralLevel[]> {
  // Get all referrals where this user is the referrer (L1)
  const l1Referrals = await prisma.referral.findMany({
    where: {
      referrerId: userId,
      level: 1,
    },
    include: {
      referredUser: {
        select: {
          id: true,
          referralCode: true,
          username: true,
          phone: true,
        },
      },
    },
  });

  const tree: ReferralLevel[] = [];

  // Level 1: Direct referrals
  for (const referral of l1Referrals) {
    tree.push({
      level: 1,
      userId: referral.referredUser.id,
      referralCode: referral.referredUser.referralCode,
      username: referral.referredUser.username,
      phone: referral.referredUser.phone,
    });

    // Level 2: Referrals of L1 users
    const l2Referrals = await prisma.referral.findMany({
      where: {
        referrerId: referral.referredUser.id,
        level: 1, // L2 users' direct referrals are L2 from original user's perspective
      },
      include: {
        referredUser: {
          select: {
            id: true,
            referralCode: true,
            username: true,
            phone: true,
          },
        },
      },
    });

    for (const l2Referral of l2Referrals) {
      tree.push({
        level: 2,
        userId: l2Referral.referredUser.id,
        referralCode: l2Referral.referredUser.referralCode,
        username: l2Referral.referredUser.username,
        phone: l2Referral.referredUser.phone,
      });

      // Level 3: Referrals of L2 users
      const l3Referrals = await prisma.referral.findMany({
        where: {
          referrerId: l2Referral.referredUser.id,
          level: 1, // L3 users' direct referrals are L3 from original user's perspective
        },
        include: {
          referredUser: {
            select: {
              id: true,
              referralCode: true,
              username: true,
              phone: true,
            },
          },
        },
      });

      for (const l3Referral of l3Referrals) {
        tree.push({
          level: 3,
          userId: l3Referral.referredUser.id,
          referralCode: l3Referral.referredUser.referralCode,
          username: l3Referral.referredUser.username,
          phone: l3Referral.referredUser.phone,
        });
      }
    }
  }

  return tree;
}

/**
 * Calculate multi-level commission distribution
 * Returns array of commissions to credit to each level
 */
export function calculateMultiLevelCommissions(
  baseAmount: number,
  l1Percentage: number = 50,
  l2Percentage: number = 30,
  l3Percentage: number = 20,
): ReferralCommission[] {
  const commissions: ReferralCommission[] = [];

  if (l1Percentage > 0) {
    commissions.push({
      level: 1,
      userId: '', // Will be set by caller
      amount: (baseAmount * l1Percentage) / 100,
      percentage: l1Percentage,
    });
  }

  if (l2Percentage > 0) {
    commissions.push({
      level: 2,
      userId: '', // Will be set by caller
      amount: (baseAmount * l2Percentage) / 100,
      percentage: l2Percentage,
    });
  }

  if (l3Percentage > 0) {
    commissions.push({
      level: 3,
      userId: '', // Will be set by caller
      amount: (baseAmount * l3Percentage) / 100,
      percentage: l3Percentage,
    });
  }

  return commissions;
}

/**
 * Get referral chain for a user (who referred them, and who they referred)
 */
export async function getReferralChain(userId: string): Promise<{
  referrer: { id: string; referralCode: string; username: string | null } | null;
  directReferrals: Array<{ id: string; referralCode: string; username: string | null }>;
}> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      referredBy: {
        select: {
          id: true,
          referralCode: true,
          username: true,
        },
      },
      referralEvents: {
        where: {
          level: 1, // Only direct referrals (L1)
        },
        include: {
          referredUser: {
            select: {
              id: true,
              referralCode: true,
              username: true,
            },
          },
        },
      },
    },
  });

  if (!user) {
    return {
      referrer: null,
      directReferrals: [],
    };
  }

  return {
    referrer: user.referredBy
      ? {
          id: user.referredBy.id,
          referralCode: user.referredBy.referralCode,
          username: user.referredBy.username,
        }
      : null,
    directReferrals: user.referralEvents.map((r) => ({
      id: r.referredUser.id,
      referralCode: r.referredUser.referralCode,
      username: r.referredUser.username,
    })),
  };
}

/**
 * Create referral events for all levels when a new user registers
 */
export async function createMultiLevelReferralEvents(
  newUserId: string,
  baseCommissionAmount: number = 0,
): Promise<void> {
  const newUser = await prisma.user.findUnique({
    where: { id: newUserId },
    include: {
      referredBy: true,
    },
  });

  if (!newUser || !newUser.referredById) {
    return; // No referrer, no events to create
  }

  // Get commission percentages from env (defaults: L1=50%, L2=30%, L3=20%)
  const l1Percent = Number(process.env.REFERRAL_L1_PERCENTAGE || 50);
  const l2Percent = Number(process.env.REFERRAL_L2_PERCENTAGE || 30);
  const l3Percent = Number(process.env.REFERRAL_L3_PERCENTAGE || 20);

  // Level 1: Direct referrer
  await prisma.referral.create({
    data: {
      referrerId: newUser.referredById,
      referredUserId: newUserId,
      level: 1,
      commissionAmount: (baseCommissionAmount * l1Percent) / 100,
      status: 'pending',
    },
  });

  // Level 2: Referrer's referrer
  const l1User = await prisma.user.findUnique({
    where: { id: newUser.referredById },
    include: {
      referredBy: true,
    },
  });

  if (l1User?.referredById) {
    await prisma.referral.create({
      data: {
        referrerId: l1User.referredById,
        referredUserId: newUserId,
        level: 2,
        commissionAmount: (baseCommissionAmount * l2Percent) / 100,
        status: 'pending',
      },
    });

    // Level 3: L2's referrer
    const l2User = await prisma.user.findUnique({
      where: { id: l1User.referredById },
      include: {
        referredBy: true,
      },
    });

    if (l2User?.referredById) {
      await prisma.referral.create({
        data: {
          referrerId: l2User.referredById,
          referredUserId: newUserId,
          level: 3,
          commissionAmount: (baseCommissionAmount * l3Percent) / 100,
          status: 'pending',
        },
      });
    }
  }
}

/**
 * Credit multi-level commissions when a referral is approved
 */
export async function creditMultiLevelCommissions(referralId: string): Promise<void> {
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

  if (!referral || referral.status !== 'pending') {
    return;
  }

  // Get all referral events for this referred user at this level
  const allReferrals = await prisma.referral.findMany({
    where: {
      referredUserId: referral.referredUserId,
      level: referral.level,
      status: 'pending',
    },
    include: {
      referrer: {
        include: {
          wallet: true,
        },
      },
    },
  });

  // Credit all pending referrals at this level
  await prisma.$transaction(async (tx) => {
    for (const ref of allReferrals) {
      if (ref.referrer.wallet) {
        // Update wallet
        await tx.wallet.update({
          where: { id: ref.referrer.wallet.id },
          data: {
            balance: { increment: Number(ref.commissionAmount) },
            withdrawable: { increment: Number(ref.commissionAmount) },
            totalEarned: { increment: Number(ref.commissionAmount) },
          },
        });

        // Create transaction record
        await tx.walletTransaction.create({
          data: {
            userId: ref.referrerId,
            walletId: ref.referrer.wallet.id,
            amount: Number(ref.commissionAmount),
            type: 'REFERRAL_COMMISSION',
            metadata: {
              referralId: ref.id,
              level: ref.level,
              referredUserId: ref.referredUserId,
            },
          },
        });

        // Update referral status
        await tx.referral.update({
          where: { id: ref.id },
          data: {
            status: 'verified',
          },
        });
      }
    }
  });
}

