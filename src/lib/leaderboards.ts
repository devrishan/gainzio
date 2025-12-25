import { getRedis } from './redis';
import { prisma } from './prisma';

export type LeaderboardPeriod = 'daily' | 'weekly' | 'monthly' | 'alltime';
export type LeaderboardMetric = 'xp' | 'coins' | 'earnings' | 'referrals';

interface LeaderboardEntry {
  userId: string;
  score: number;
  rank: number;
  username?: string | null;
  phone?: string;
}

/**
 * Get Redis key for leaderboard
 */
function getLeaderboardKey(period: LeaderboardPeriod, metric: LeaderboardMetric): string {
  return `leaderboard:${period}:${metric}`;
}

/**
 * Update user's score in leaderboard
 */
export async function updateLeaderboardScore(
  userId: string,
  metric: LeaderboardMetric,
  score: number,
): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    console.warn('Redis not available, leaderboard update skipped');
    return;
  }

  const periods: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly', 'alltime'];

  for (const period of periods) {
    const key = getLeaderboardKey(period, metric);

    // Update score
    await redis.zadd(key, score, userId);

    // Set expiration based on period
    if (period === 'daily') {
      await redis.expire(key, 86400); // 24 hours
    } else if (period === 'weekly') {
      await redis.expire(key, 604800); // 7 days
    } else if (period === 'monthly') {
      await redis.expire(key, 2592000); // 30 days
    }
    // alltime has no expiration
  }
}

/**
 * Get leaderboard rankings
 */
export async function getLeaderboard(
  period: LeaderboardPeriod,
  metric: LeaderboardMetric,
  limit: number = 100,
): Promise<LeaderboardEntry[]> {
  const redis = getRedis();
  if (!redis) {
    // Fallback to database if Redis unavailable
    return getLeaderboardFromDB(period, metric, limit);
  }

  const key = getLeaderboardKey(period, metric);
  const rankings = await redis.zrevrange(key, 0, limit - 1, 'WITHSCORES');

  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < rankings.length; i += 2) {
    const userId = rankings[i];
    const score = parseFloat(rankings[i + 1]);

    // Get user info from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        phone: true,
      },
    });

    if (user) {
      entries.push({
        userId: user.id,
        score,
        rank: Math.floor(i / 2) + 1,
        username: user.username,
        phone: user.phone,
      });
    }
  }

  return entries;
}

/**
 * Get user's rank in leaderboard
 */
export async function getUserRank(
  userId: string,
  period: LeaderboardPeriod,
  metric: LeaderboardMetric,
): Promise<number | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  const key = getLeaderboardKey(period, metric);
  const rank = await redis.zrevrank(key, userId);

  return rank !== null ? rank + 1 : null;
}

/**
 * Get user's score in leaderboard
 */
export async function getUserScore(
  userId: string,
  period: LeaderboardPeriod,
  metric: LeaderboardMetric,
): Promise<number | null> {
  const redis = getRedis();
  if (!redis) {
    return null;
  }

  const key = getLeaderboardKey(period, metric);
  const score = await redis.zscore(key, userId);

  return score !== null ? parseFloat(score) : null;
}

/**
 * Fallback: Get leaderboard from database (slower but works without Redis)
 */
async function getLeaderboardFromDB(
  period: LeaderboardPeriod,
  metric: LeaderboardMetric,
  limit: number,
): Promise<LeaderboardEntry[]> {
  let orderBy: any = {};
  let where: any = {};

  // Apply time filter based on period
  if (period === 'daily') {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    where.createdAt = { gte: startOfDay };
  } else if (period === 'weekly') {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);
    where.createdAt = { gte: startOfWeek };
  } else if (period === 'monthly') {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    where.createdAt = { gte: startOfMonth };
  }
  // alltime has no time filter

  if (metric === 'xp') {
    const users = await prisma.user.findMany({
      where: {
        gamification: {
          isNot: null,
        },
      },
      include: {
        gamification: true,
      },
      orderBy: {
        gamification: {
          xp: 'desc',
        },
      },
      take: limit,
    });

    return users.map((user, index) => ({
      userId: user.id,
      score: user.gamification?.xp || 0,
      rank: index + 1,
      username: user.username,
      phone: user.phone,
    }));
  } else if (metric === 'coins') {
    const users = await prisma.user.findMany({
      where: {
        wallet: {
          isNot: null,
        },
      },
      include: {
        wallet: true,
      },
      orderBy: {
        wallet: {
          coins: 'desc',
        },
      },
      take: limit,
    });

    return users.map((user, index) => ({
      userId: user.id,
      score: user.wallet?.coins || 0,
      rank: index + 1,
      username: user.username,
      phone: user.phone,
    }));
  } else if (metric === 'earnings') {
    const users = await prisma.user.findMany({
      where: {
        wallet: {
          isNot: null,
        },
      },
      include: {
        wallet: true,
      },
      orderBy: {
        wallet: {
          totalEarned: 'desc',
        },
      },
      take: limit,
    });

    return users.map((user, index) => ({
      userId: user.id,
      score: Number(user.wallet?.totalEarned || 0),
      rank: index + 1,
      username: user.username,
      phone: user.phone,
    }));
  } else if (metric === 'referrals') {
    const users = await prisma.user.findMany({
      include: {
        referralEvents: {
          where: {
            status: 'verified',
            ...(period !== 'alltime' ? { createdAt: where.createdAt } : {}),
          },
        },
      },
      take: limit,
    });

    const sortedUsers = users
      .map((user) => ({
        user,
        count: user.referralEvents.length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedUsers.map((item, index) => ({
      userId: item.user.id,
      score: item.count,
      rank: index + 1,
      username: item.user.username,
      phone: item.user.phone,
    }));
  }

  return [];
}

/**
 * Sync leaderboards from database to Redis (run periodically)
 */
export async function syncLeaderboardsToRedis(): Promise<void> {
  const redis = getRedis();
  if (!redis) {
    return;
  }

  const metrics: LeaderboardMetric[] = ['xp', 'coins', 'earnings', 'referrals'];
  const periods: LeaderboardPeriod[] = ['daily', 'weekly', 'monthly', 'alltime'];

  for (const metric of metrics) {
    for (const period of periods) {
      const key = getLeaderboardKey(period, metric);
      const entries = await getLeaderboardFromDB(period, metric, 1000);

      // Clear existing leaderboard
      await redis.del(key);

      // Add all entries
      for (const entry of entries) {
        await redis.zadd(key, entry.score, entry.userId);
      }

      // Set expiration
      if (period === 'daily') {
        await redis.expire(key, 86400);
      } else if (period === 'weekly') {
        await redis.expire(key, 604800);
      } else if (period === 'monthly') {
        await redis.expire(key, 2592000);
      }
    }
  }
}
