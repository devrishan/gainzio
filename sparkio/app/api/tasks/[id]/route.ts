import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const taskId = params.id;
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    let userId: string | null = null;
    if (accessToken) {
      try {
        const payload = verifyAccessToken(accessToken);
        userId = payload.sub;
      } catch {
        // Token invalid, continue without user context
      }
    }

    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!task || task.isDeleted) {
      return NextResponse.json(
        { success: false, error: 'Task not found' },
        { status: 404 },
      );
    }

    // Check if task is expired
    const isExpired = task.expiresAt ? task.expiresAt < new Date() : false;

    // Get user's submission count for this task
    let userSubmissionCount = 0;
    let canSubmit = true;

    if (userId) {
      const submissionCount = await prisma.taskSubmission.count({
        where: {
          taskId: task.id,
          userId: userId,
          status: {
            not: 'DELETED',
          },
        },
      });

      userSubmissionCount = submissionCount;

      // Check if user can submit
      if (task.maxSubmissions && submissionCount >= task.maxSubmissions) {
        canSubmit = false;
      }

      // Check if user has pending submission
      const pendingSubmission = await prisma.taskSubmission.findFirst({
        where: {
          taskId: task.id,
          userId: userId,
          status: {
            in: ['SUBMITTED', 'REVIEWING'],
          },
        },
      });

      if (pendingSubmission) {
        canSubmit = false;
      }
    }

    return NextResponse.json({
      success: true,
      task: {
        id: task.id,
        title: task.title,
        slug: task.slug,
        description: task.description,
        reward_amount: Number(task.rewardAmount),
        reward_coins: task.rewardCoins,
        difficulty: task.difficulty,
        is_active: task.isActive && !isExpired,
        max_submissions: task.maxSubmissions,
        expires_at: task.expiresAt?.toISOString() || null,
        created_at: task.createdAt.toISOString(),
        category: {
          id: task.category.id,
          name: task.category.name,
          slug: task.category.slug,
        },
        user_submission_count: userSubmissionCount,
        can_submit: canSubmit && !isExpired,
        is_expired: isExpired,
      },
    });
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch task' },
      { status: 500 },
    );
  }
}

