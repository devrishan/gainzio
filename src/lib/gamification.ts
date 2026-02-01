import { prisma } from '@/lib/prisma';
import { Rank } from '@prisma/client';
import { updateLeaderboardScore } from './leaderboards';

/**
 * XP thresholds for each rank
 */
const XP_THRESHOLDS: Record<Rank, number> = {
  NEWBIE: 0,
  PRO: 1000,
  ELITE: 5000,
  MASTER: 20000,
};

/**
 * XP rewards for different actions
 */
export const XP_REWARDS = {
  TASK_APPROVED: 100,
  REFERRAL_VERIFIED: 50,
  DAILY_LOGIN: 10,
  FIRST_TASK: 50, // Bonus for first task
  TASK_STREAK: 25, // Bonus for completing tasks on consecutive days
  PRODUCT_SUGGESTION_APPROVED: 30,
  PRODUCT_SUGGESTION_CONVERTED: 50,
};

/**
 * Calculate rank based on XP
 */
export function calculateRank(xp: number): Rank {
  if (xp >= XP_THRESHOLDS.MASTER) {
    return Rank.MASTER;
  } else if (xp >= XP_THRESHOLDS.ELITE) {
    return Rank.ELITE;
  } else if (xp >= XP_THRESHOLDS.PRO) {
    return Rank.PRO;
  }
  return Rank.NEWBIE;
}

/**
 * Add XP to user and update rank if needed
 */
export async function addXP(
  userId: string,
  amount: number,
  reason: string,
  metadata?: Record<string, any>,
): Promise<{ newXP: number; newRank: Rank; rankUpgraded: boolean }> {
  const gamification = await prisma.gamificationState.findUnique({
    where: { userId },
  });

  if (!gamification) {
    // Check for Double XP Boost
    const activeBoost = await prisma.userInventory.findFirst({
      where: {
        userId,
        shopItem: { name: "Double XP Boost" },
        expiresAt: { gt: new Date() }
      }
    });

    const finalAmount = activeBoost ? amount * 2 : amount;

    // Create gamification state if it doesn't exist
    const newGamification = await prisma.gamificationState.create({
      data: {
        userId,
        xp: finalAmount,
        rank: calculateRank(finalAmount),
      },
    });

    return {
      newXP: newGamification.xp,
      newRank: newGamification.rank,
      rankUpgraded: false,
    };
  }

  // Check for Double XP Boost (for existing users)
  const activeBoost = await prisma.userInventory.findFirst({
    where: {
      userId,
      shopItem: { name: "Double XP Boost" },
      expiresAt: { gt: new Date() }
    }
  });

  const finalAmount = activeBoost ? amount * 2 : amount;

  const oldRank = gamification.rank;
  const newXP = gamification.xp + finalAmount;
  const newRank = calculateRank(newXP);
  const rankUpgraded = oldRank !== newRank;

  await prisma.gamificationState.update({
    where: { userId },
    data: {
      xp: newXP,
      rank: newRank,
    },
  });

  // Create XP log with multiplier info
  if (finalAmount !== amount) {
    if (!metadata) metadata = {};
    metadata.originalAmount = amount;
    metadata.multiplier = 2;
    metadata.boostActive = true;
  }

  try {
    await updateLeaderboardScore(userId, 'xp', newXP);
  } catch (err) {
    console.error('Failed to update leaderboard score', err);
  }

  // Update Smart Score
  try {
    const smartScore = await calculateSmartScore(userId);
    await updateLeaderboardScore(userId, 'smart_score', smartScore);
  } catch (err) {
    console.warn('Failed to update smart score', err);
  }

  // Create XP event log if metadata provided
  if (metadata) {
    try {
      await prisma.activityLog.create({
        data: {
          userId,
          action: 'XP_EARNED',
          metadata: {
            amount,
            reason,
            oldXP: gamification.xp,
            newXP,
            oldRank,
            newRank,
            ...metadata,
          },
        },
      });
    } catch (err) {
      console.error('Failed to log activity for XP earned', err);
    }
  }

  return {
    newXP,
    newRank,
    rankUpgraded,
  };
}

/**
 * Award badge to user
 */
export async function awardBadge(userId: string, badgeCode: string): Promise<boolean> {
  // Check if badge exists
  const badge = await prisma.badge.findUnique({
    where: { code: badgeCode },
  });

  if (!badge) {
    console.warn(`Badge with code ${badgeCode} not found`);
    return false;
  }

  const gamification = await prisma.gamificationState.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      xp: 0,
      rank: Rank.NEWBIE,
    },
  });

  // Check if user already has this badge
  const existing = await prisma.badgeOnUser.findFirst({
    where: {
      badgeId: badge.id,
      gamificationId: gamification.id,
    },
  });

  if (existing) {
    return false; // Already has badge
  }

  // Award badge
  await prisma.badgeOnUser.create({
    data: {
      badgeId: badge.id,
      gamificationId: gamification.id,
      earnedAt: new Date(),
    },
  });

  // Create notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'RANK_UPGRADE', // Reuse for badge notifications
      title: 'Badge Earned!',
      body: `You've earned the "${badge.name}" badge! ${badge.description}`,
      data: {
        badgeCode: badge.code,
        badgeName: badge.name,
      },
    },
  });

  return true;
}

/**
 * Update daily login streak
 */
export async function updateStreak(userId: string): Promise<{ streakDays: number; streakBonus: number }> {
  const gamification = await prisma.gamificationState.findUnique({
    where: { userId },
  });

  if (!gamification) {
    // Create gamification state
    const newGamification = await prisma.gamificationState.create({
      data: {
        userId,
        streakDays: 1,
        lastLoginAt: new Date(),
      },
    });
    return { streakDays: 1, streakBonus: 0 };
  }

  const now = new Date();
  const lastLogin = gamification.lastLoginAt;
  let newStreakDays = gamification.streakDays;
  let streakBonus = 0;

  if (!lastLogin) {
    // First login
    newStreakDays = 1;
  } else {
    const daysSinceLastLogin = Math.floor(
      (now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (daysSinceLastLogin === 0) {
      // Already logged in today
      newStreakDays = gamification.streakDays;
    } else if (daysSinceLastLogin === 1) {
      // Consecutive day
      newStreakDays = gamification.streakDays + 1;
      // Bonus XP for streaks
      if (newStreakDays % 7 === 0) {
        streakBonus = 50; // Weekly streak bonus
      } else if (newStreakDays % 30 === 0) {
        streakBonus = 200; // Monthly streak bonus
      }
    } else {
      // Streak broken
      newStreakDays = 1;
    }
  }

  await prisma.gamificationState.update({
    where: { userId },
    data: {
      streakDays: newStreakDays,
      lastLoginAt: now,
    },
  });

  // Award daily login XP
  if (streakBonus > 0) {
    await addXP(userId, XP_REWARDS.DAILY_LOGIN + streakBonus, 'Daily login with streak bonus', {
      streakDays: newStreakDays,
      streakBonus,
    });
  } else {
    await addXP(userId, XP_REWARDS.DAILY_LOGIN, 'Daily login', {
      streakDays: newStreakDays,
    });
  }

  return { streakDays: newStreakDays, streakBonus };
}

/**
 * Check and award badges based on user achievements
 */
export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const gamification = await prisma.gamificationState.findUnique({
    where: { userId },
    include: {
      badges: {
        include: {
          badge: true,
        },
      },
    },
  });

  if (!gamification) {
    return [];
  }

  const awardedBadges: string[] = [];

  // Get user stats
  const taskCount = await prisma.taskSubmission.count({
    where: {
      userId,
      status: 'APPROVED',
    },
  });

  const referralCount = await prisma.referral.count({
    where: {
      referrerId: userId,
      status: 'verified',
    },
  });

  // Check for first task badge
  if (taskCount >= 1) {
    const awarded = await awardBadge(userId, 'FIRST_TASK');
    if (awarded) awardedBadges.push('FIRST_TASK');
  }

  // Check for 10 tasks badge
  if (taskCount >= 10) {
    const awarded = await awardBadge(userId, 'TASK_MASTER_10');
    if (awarded) awardedBadges.push('TASK_MASTER_10');
  }

  // Check for 50 tasks badge
  if (taskCount >= 50) {
    const awarded = await awardBadge(userId, 'TASK_MASTER_50');
    if (awarded) awardedBadges.push('TASK_MASTER_50');
  }

  // Check for first referral badge
  if (referralCount >= 1) {
    const awarded = await awardBadge(userId, 'FIRST_REFERRAL');
    if (awarded) awardedBadges.push('FIRST_REFERRAL');
  }

  // Check for 10 referrals badge
  if (referralCount >= 10) {
    const awarded = await awardBadge(userId, 'REFERRAL_MASTER_10');
    if (awarded) awardedBadges.push('REFERRAL_MASTER_10');
  }

  // Check for rank badges
  if (gamification.rank === Rank.PRO) {
    const awarded = await awardBadge(userId, 'RANK_PRO');
    if (awarded) awardedBadges.push('RANK_PRO');
  }

  if (gamification.rank === Rank.ELITE) {
    const awarded = await awardBadge(userId, 'RANK_ELITE');
    if (awarded) awardedBadges.push('RANK_ELITE');
  }

  if (gamification.rank === Rank.MASTER) {
    const awarded = await awardBadge(userId, 'RANK_MASTER');
    if (awarded) awardedBadges.push('RANK_MASTER');
  }

  // Check for streak badges
  if (gamification.streakDays >= 7) {
    const awarded = await awardBadge(userId, 'STREAK_7_DAYS');
    if (awarded) awardedBadges.push('STREAK_7_DAYS');
  }

  if (gamification.streakDays >= 30) {
    const awarded = await awardBadge(userId, 'STREAK_30_DAYS');
    if (awarded) awardedBadges.push('STREAK_30_DAYS');
  }

  return awardedBadges;
}

/**
 * Handle task approval - award XP and check badges
 */
export async function handleTaskApproval(userId: string, taskId: string): Promise<void> {
  // Check if this is user's first task
  const previousTasks = await prisma.taskSubmission.count({
    where: {
      userId,
      status: 'APPROVED',
    },
  });

  let xpAmount = XP_REWARDS.TASK_APPROVED;
  if (previousTasks === 0) {
    xpAmount += XP_REWARDS.FIRST_TASK;
  }

  // Award XP
  const { rankUpgraded } = await addXP(userId, xpAmount, 'Task approved', {
    taskId,
    isFirstTask: previousTasks === 0,
  });

  // Check for rank upgrade notification
  if (rankUpgraded) {
    await prisma.notification.create({
      data: {
        userId,
        type: 'RANK_UPGRADE',
        title: 'Rank Upgraded!',
        body: `Congratulations! You've been promoted to ${calculateRank(await prisma.gamificationState.findUnique({ where: { userId } }).then(g => g?.xp || 0))} rank!`,
        data: {
          newRank: calculateRank(await prisma.gamificationState.findUnique({ where: { userId } }).then(g => g?.xp || 0)),
        },
      },
    });
  }

  // Check and award badges
  await checkAndAwardBadges(userId);
}

/**
 * Handle referral verification - award XP and Coins (Navi Model: 5000 Coins)
 */
export async function handleReferralVerification(userId: string, referralId: string): Promise<void> {
  const REFERRAL_COIN_REWARD = 5000;

  // Award XP
  await addXP(userId, XP_REWARDS.REFERRAL_VERIFIED, 'Referral verified', {
    referralId,
  });

  // Award Coins (Locked)
  try {
    const unlockTime = new Date();
    unlockTime.setHours(unlockTime.getHours() + 24);

    await prisma.$transaction(async (tx) => {
      let wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) {
        wallet = await tx.wallet.create({ data: { userId } });
      }

      await tx.wallet.update({
        where: { id: wallet.id },
        data: { lockedCoins: { increment: REFERRAL_COIN_REWARD } }
      });

      await tx.coinTransaction.create({
        data: {
          userId,
          amount: REFERRAL_COIN_REWARD,
          type: "EARN",
          status: "LOCKED",
          unlocksAt: unlockTime,
          description: `Referral Bonus (Verified)`,
          source: "REFERRAL_BONUS",
          metadata: { referralId }
        }
      });
    });
  } catch (err) {
    console.error("Failed to award Referral Coins", err);
  }

  // Check and award badges
  await checkAndAwardBadges(userId);
}

/**
 * Get user gamification stats including rank, xp, and badges
 */
export async function getUserGamificationStats(userId: string) {
  const gamification = await prisma.gamificationState.findUnique({
    where: { userId },
    include: {
      badges: {
        include: {
          badge: true,
        },
      },
    },
  });

  if (!gamification) {
    return {
      xp: 0,
      rank: Rank.NEWBIE,
      streakDays: 0,
      badges: [],
      nextRankXP: XP_THRESHOLDS.PRO,
      progress: 0,
    };
  }

  // Calculate progress to next rank
  let nextRankXP = XP_THRESHOLDS.PRO;
  let prevRankXP = 0;

  if (gamification.rank === Rank.PRO) {
    nextRankXP = XP_THRESHOLDS.ELITE;
    prevRankXP = XP_THRESHOLDS.PRO;
  } else if (gamification.rank === Rank.ELITE) {
    nextRankXP = XP_THRESHOLDS.MASTER;
    prevRankXP = XP_THRESHOLDS.ELITE;
  } else if (gamification.rank === Rank.MASTER) {
    nextRankXP = XP_THRESHOLDS.MASTER; // Cap at master
    prevRankXP = XP_THRESHOLDS.MASTER;
  }

  const progress =
    gamification.rank === Rank.MASTER
      ? 100
      : Math.min(
        100,
        Math.max(
          0,
          ((gamification.xp - prevRankXP) / (nextRankXP - prevRankXP)) * 100
        )
      );

  return {
    ...gamification,
    nextRankXP,
    progress,
  };
}

/**
 * Calculate "Smart Score" for leaderboard
 * Score = TotalEarned + (StreakDays * 10) + (ReferralCount * 50) + (Tasks * 5)
 */
export async function calculateSmartScore(userId: string): Promise<number> {
  const [wallet, gamification, referralCount, taskCount] = await Promise.all([
    prisma.wallet.findUnique({
      where: { userId },
      select: { totalEarned: true },
    }),
    prisma.gamificationState.findUnique({
      where: { userId },
      select: { streakDays: true },
    }),
    prisma.referral.count({
      where: { referrerId: userId, status: 'verified' },
    }),
    prisma.taskSubmission.count({
      where: { userId, status: 'APPROVED' }
    })
  ]);

  const totalEarned = Number(wallet?.totalEarned || 0);
  const streakDays = gamification?.streakDays || 0;

  // New Weighted Formula
  const score = Math.floor(
    totalEarned +
    (streakDays * 10) +
    (referralCount * 50) +
    (taskCount * 5)
  );

  // Update DB State
  await prisma.gamificationState.upsert({
    where: { userId },
    update: {
      smartScore: score,
      lastScoreUpdate: new Date()
    },
    create: {
      userId,
      smartScore: score,
      lastScoreUpdate: new Date(),
      xp: 0,
      rank: 'NEWBIE', // Default rank
      streakDays: 0
    }
  });

  return score;
}

/**
 * Get full gamification profile for Dashboard
 */
export const getGamificationProfile = async (userId: string) => {
  const profile = await prisma.gamificationState.findUnique({
    where: { userId },
    include: {
      inventory: {
        include: {
          shopItem: true
        }
      },
      badges: {
        include: {
          badge: true
        }
      }
    }
  });

  if (!profile) {
    // Auto-create if missing
    return await prisma.gamificationState.create({
      data: { userId }
    });
  }

  return profile;
};

/**
 * Get active shop items
 */
export const getShopItems = async () => {
  return await prisma.shopItem.findMany({
    where: { isActive: true },
    orderBy: { cost: 'asc' }
  });
};

/**
 * Purchase an item from the shop
 */
export const purchaseItem = async (userId: string, itemId: string) => {
  // Transaction to ensure atomic coin deduction + item add
  return await prisma.$transaction(async (tx) => {
    const item = await tx.shopItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error("Item not found");

    const wallet = await tx.wallet.findUnique({ where: { userId } });
    if (!wallet || wallet.coins < item.cost) {
      throw new Error("Insufficient coins");
    }

    // Deduct coins
    await tx.wallet.update({
      where: { userId },
      data: { coins: { decrement: item.cost } }
    });

    // Add to Inventory
    const existing = await tx.userInventory.findUnique({
      where: {
        gamificationId_shopItemId: {
          gamificationId: (await tx.gamificationState.findUniqueOrThrow({ where: { userId } })).id,
          shopItemId: itemId
        }
      }
    });

    if (existing) {
      await tx.userInventory.update({
        where: { id: existing.id },
        data: { quantity: { increment: 1 } }
      });
    } else {
      const gamification = await tx.gamificationState.findUniqueOrThrow({ where: { userId } });
      await tx.userInventory.create({
        data: {
          userId,
          gamificationId: gamification.id,
          shopItemId: itemId,
          quantity: 1,
          remainingUses: item.type === 'CONSUMABLE' ? 1 : null
        }
      });
    }

    // Log Transaction
    await tx.coinTransaction.create({
      data: {
        userId,
        amount: -item.cost,
        type: 'SPEND',
        description: `Purchased ${item.name}`,
        source: 'SHOP'
      }
    });

    return { success: true, newBalance: wallet.coins - item.cost };
  });
};
