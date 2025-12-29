import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('category_id');
    const isActive = searchParams.get('is_active');
    const difficulty = searchParams.get('difficulty');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Get user rank (optional but recommended for personalized tasks)
    const accessToken = request.cookies.get("earniq_access_token")?.value;
    let userRank = 'NEWBIE';

    if (accessToken) {
      try {
        // We can decode without verifying for speed, or verify. Let's do a quick DB check.
        // Actually, for tasks listing, strictly verifying every time might be slow.
        // But let's assume secure context.
        const { verifyAccessToken } = await import("@/lib/jwt");
        const payload = await verifyAccessToken(accessToken);
        const gamification = await prisma.gamificationState.findUnique({
          where: { userId: payload.sub },
          select: { rank: true }
        });
        if (gamification) {
          userRank = gamification.rank;
        }
      } catch (e) {
        // Ignore token errors, treat as NEWBIE
      }
    }

    const where: Record<string, any> = {
      isDeleted: false,
    };

    // Filter by Rank (Tasks Become Levels)
    const RANK_VALUES = { NEWBIE: 0, PRO: 1, ELITE: 2, MASTER: 3 };
    const userRankValue = RANK_VALUES[userRank as keyof typeof RANK_VALUES] || 0;

    // We only show tasks that are at or below the user's rank level
    // Prisma enum filtering is a bit strict, so we'll use an array of allowed ranks
    const allowedRanks = Object.keys(RANK_VALUES).filter(r => RANK_VALUES[r as keyof typeof RANK_VALUES] <= userRankValue);

    where.minRank = { in: allowedRanks };

    if (categoryId) {
      where.categoryId = categoryId;
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true' || isActive === '1';
    }

    if (difficulty) {
      where.difficulty = difficulty;
    }

    // Don't show expired tasks
    where.OR = [
      { expiresAt: null },
      { expiresAt: { gt: new Date() } },
    ];

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
        take: limit,
        skip: offset,
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      tasks: tasks.map((task) => ({
        id: task.id,
        title: task.title,
        slug: task.slug,
        description: task.description,
        reward_amount: Number(task.rewardAmount),
        reward_coins: task.rewardCoins,
        difficulty: task.difficulty,
        min_rank: task.minRank,
        is_active: task.isActive,
        max_submissions: task.maxSubmissions,
        expires_at: task.expiresAt?.toISOString() || null,
        created_at: task.createdAt.toISOString(),
        category: {
          id: task.category.id,
          name: task.category.name,
          slug: task.category.slug,
        },
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tasks' },
      { status: 500 },
    );
  }
}

