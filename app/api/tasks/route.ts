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

