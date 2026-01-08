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
        select: {
          dob: true,
          district: true,
          state: true,
          phone_verified: true,
          verificationLevel: true,
          is_locked: true,
          confidenceScore: true,
          // Assuming we might track used platforms in metadata or tags later, 
          // for now strictly relying on verificationLevel + profile.
        } as any
      });

      const profile = fullProfile as any;

      // ACCOUNT STATUS CHECK
      if (profile?.is_locked) {
        // Locked accounts see NO tasks or specific error, but spec says "If any rule fails, the task must not appear"
        return NextResponse.json({ success: true, tasks: [], pagination: { total: 0, limit, offset, hasMore: false } });
      }
      if (profile?.dob) {
        const today = new Date();
        const birthDate = new Date(profile.dob);
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
        take: limit,
        skip: offset,
        include: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          // Include submissions to check for duplicates
          submissions: {
            where: { userId: authUser.userId },
            select: { id: true, status: true }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' },
        ],
      }),
      prisma.task.count({ where }),
    ]);

    const RANK_VALUES = { NEWBIE: 0, PRO: 1, ELITE: 2, MASTER: 3 };
    const userRankValue = RANK_VALUES[userRank as keyof typeof RANK_VALUES] || 0;

    const filteredTasks = tasks.map((task) => {
      const t = task as any;
      // Derive minRank from difficulty
      let minRank = 'NEWBIE';
      if (t.difficulty === 'MEDIUM') minRank = 'PRO';
      if (t.difficulty === 'HARD') minRank = 'ELITE';
      if (t.difficulty === 'EXPERT') minRank = 'MASTER';

      const taskRankValue = RANK_VALUES[minRank as keyof typeof RANK_VALUES] || 0;
      const isLocked = taskRankValue > userRankValue;

      // Strict Targeting Check (Social Media Tasks)
      if (t.taskType === 'SOCIAL_MEDIA' && t.targeting) {
        const targeting = t.targeting as any;
        const profile = fullProfile as any;

        // 0. Duplicate Submission Check (One per campaign)
        // If user already submitted this task, DO NOT SHOW IT (or show as completed? Spec says "One submission per user", usually implies hide active or move to done)
        // Spec: "If any eligibility condition fails... Do NOT show the task"
        // But if they completed it, it's not "eligibility failure", it's "completion". 
        // Typically completed tasks are unrelated queries. FOR NOW, we hide if submitted.
        if (t.submissions && t.submissions.length > 0) return null;

        // 1. Min Age Check
        if (targeting.minAge && userAge < targeting.minAge) return null; // HIDDEN

        // 2. Location Check (District) - STRICT MATCH
        if (targeting.district && profile?.district?.toLowerCase() !== targeting.district.toLowerCase()) return null; // HIDDEN

        // 3. Location Check (State) - STRICT MATCH
        if (targeting.state && profile?.state?.toLowerCase() !== targeting.state.toLowerCase()) return null; // HIDDEN

        // 4. Verification Check
        // Spec: "Verification Level >= required minimum" & "Platform confidence score >= required minimum"
        if (targeting.verifiedOnly) {
          if (!profile?.phone_verified) return null;
          if ((profile?.verificationLevel || 0) < 1) return null;
          // Default confidence check if not specified in targeting, assumed 90+ for social tasks?
          // Spec says "Platform confidence score >= required minimum". 
          // Let's assume targeting might have it, or we enforce strict default.
          if ((profile?.confidenceScore || 0) < (targeting.minConfidence || 80)) return null;
        }
      }

      return {
        id: t.id,
        title: t.title,
        slug: t.slug,
        task_type: t.taskType, // Exposed for frontend logic
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
