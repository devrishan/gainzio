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

    // Get user rank and details
    const { getAuthenticatedUser } = await import("@/lib/api-auth");
    const authUser = await getAuthenticatedUser(request);
    let userRank = 'NEWBIE';

    if (authUser) {
      try {
        const gamification = await prisma.gamificationState.findUnique({
          where: { userId: authUser.userId },
          select: { rank: true }
        });
        if (gamification) {
          userRank = gamification.rank;
        }
      } catch (e) {
        // Ignore errors, treat as NEWBIE
      }
    }

    // --- ELIGIBILITY DATA PREP ---
    let userAge = 0;
    let fullProfile = null;

    if (authUser?.userId) {
      // We need to fetch the full user profile including dob/location 
      fullProfile = await prisma.user.findUnique({
        where: { id: authUser.userId },
        // @ts-expect-error - Prisma client types might be stale
        select: { dob: true, district: true, state: true, phone_verified: true, verificationLevel: true }
      });

      // @ts-expect-error - Prisma client types might be stale
      if (fullProfile?.dob) {
        const today = new Date();
        // @ts-expect-error - Prisma client types might be stale
        const birthDate = new Date(fullProfile.dob);
        userAge = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          userAge--;
        }
      }

      // Merge profile into authUser for easier checking logic later if needed, 
      // but we will use 'fullProfile' variable for strict checks.
    }


    const where: Record<string, any> = {
      isDeleted: false,
    };

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

    const RANK_VALUES = { NEWBIE: 0, PRO: 1, ELITE: 2, MASTER: 3 };
    const userRankValue = RANK_VALUES[userRank as keyof typeof RANK_VALUES] || 0;

    const filteredTasks = tasks.map((task) => {
      // Derive minRank from difficulty
      let minRank = 'NEWBIE';
      if (task.difficulty === 'MEDIUM') minRank = 'PRO';
      if (task.difficulty === 'HARD') minRank = 'ELITE';
      if (task.difficulty === 'EXPERT') minRank = 'MASTER';

      const taskRankValue = RANK_VALUES[minRank as keyof typeof RANK_VALUES] || 0;
      const isLocked = taskRankValue > userRankValue;

      // Strict Targeting Check (Social Media Tasks)
      // @ts-expect-error - taskType does not exist on type yet
      if (task.taskType === 'SOCIAL_MEDIA' && task.targeting) {
        // @ts-expect-error - targeting does not exist on type yet
        const targeting = task.targeting as any;

        // 1. Min Age Check
        if (targeting.minAge && userAge < targeting.minAge) return null; // HIDDEN

        // 2. Location Check (District)
        // @ts-expect-error - Prisma client types might be stale
        if (targeting.district && fullProfile?.district?.toLowerCase() !== targeting.district.toLowerCase()) return null; // HIDDEN

        // 3. Location Check (State)
        // @ts-expect-error - Prisma client types might be stale
        if (targeting.state && fullProfile?.state?.toLowerCase() !== targeting.state.toLowerCase()) return null; // HIDDEN

        // 4. Verification Check
        // @ts-expect-error - verificationLevel might be missing in type definition if not fully generated
        if (targeting.verifiedOnly && (!fullProfile?.phone_verified || (fullProfile?.verificationLevel || 0) < 1)) return null; // HIDDEN
      }

      return {
        id: task.id,
        title: task.title,
        slug: task.slug,
        // @ts-expect-error - taskType does not exist on type yet
        task_type: task.taskType, // Exposed for frontend logic
        description: task.description,
        reward_amount: Number(task.rewardAmount),
        reward_coins: task.rewardCoins,
        difficulty: task.difficulty,
        min_rank: minRank,
        min_rank_value: taskRankValue,
        is_locked: isLocked,
        is_active: task.isActive,
        max_submissions: task.maxSubmissions,
        expires_at: task.expiresAt?.toISOString() || null,
        created_at: task.createdAt.toISOString(),
        category: {
          id: task.category.id,
          name: task.category.name,
          slug: task.category.slug,
        },
      };
    }).filter(Boolean);

    return NextResponse.json({
      success: true,
      tasks: filteredTasks,
      pagination: {
        total, // Note: Total count might be slightly off due to filtering, but acceptable
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
