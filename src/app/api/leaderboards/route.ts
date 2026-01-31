import { NextRequest, NextResponse } from 'next/server';
import { getLeaderboard, getUserRank, getUserScore } from '@/lib/leaderboards';
import { Cache, CacheKeys } from '@/lib/cache';
import { measurePerformance } from '@/lib/performance';
import { z } from 'zod';

const leaderboardQuerySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'alltime']).default('alltime'),
  metric: z.enum(['xp', 'coins', 'earnings', 'referrals']).default('xp'),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 100)),
});

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = leaderboardQuerySchema.parse(Object.fromEntries(searchParams));

    // Cache leaderboards for 5 minutes (frequently accessed)
    const cacheKey = CacheKeys.leaderboard(query.metric, query.period);
    const leaderboard = await measurePerformance(
      'getLeaderboard',
      () =>
        Cache.getOrSet(
          cacheKey,
          () => getLeaderboard(query.period, query.metric, query.limit),
          300, // 5 minutes
        ),
      { period: query.period, metric: query.metric },
    );

    return NextResponse.json({
      success: true,
      period: query.period,
      metric: query.metric,
      entries: leaderboard,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leaderboard' },
      { status: 500 },
    );
  }
}

/**
 * Get user's rank and score
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, period = 'alltime', metric = 'xp' } = body;

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'userId is required' },
        { status: 400 },
      );
    }

    const [rank, score] = await Promise.all([
      getUserRank(userId, period, metric),
      getUserScore(userId, period, metric),
    ]);

    return NextResponse.json({
      success: true,
      userId,
      period,
      metric,
      rank,
      score,
    });
  } catch (error) {
    console.error('Error fetching user leaderboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user stats' },
      { status: 500 },
    );
  }
}
