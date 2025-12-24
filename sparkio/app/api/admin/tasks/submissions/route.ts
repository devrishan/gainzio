import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Role, SubmissionStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    let userRole: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userRole = payload.role;

      // Only admins and verifiers can access
      if (userRole !== Role.ADMIN && userRole !== Role.VERIFIER) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const taskId = searchParams.get('task_id');
    const userId = searchParams.get('user_id');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '30');

    const where: any = {
      status: {
        not: 'DELETED',
      },
    };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (taskId) {
      where.taskId = taskId;
    }

    if (userId) {
      where.userId = userId;
    }

    const [submissions, total] = await Promise.all([
      prisma.taskSubmission.findMany({
        where,
        include: {
          task: {
            select: {
              id: true,
              title: true,
              slug: true,
              rewardAmount: true,
              rewardCoins: true,
            },
          },
          user: {
            select: {
              id: true,
              phone: true,
              username: true,
              email: true,
            },
          },
          reviewedBy: {
            select: {
              id: true,
              username: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
        take: perPage,
        skip: (page - 1) * perPage,
      }),
      prisma.taskSubmission.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: submissions.map((submission) => ({
        id: submission.id,
        task: {
          id: submission.task.id,
          title: submission.task.title,
          slug: submission.task.slug,
          reward_amount: Number(submission.task.rewardAmount),
          reward_coins: submission.task.rewardCoins,
        },
        user: {
          id: submission.user.id,
          username: submission.user.username,
          email: submission.user.email,
          phone: submission.user.phone,
        },
        status: submission.status,
        proof_url: submission.proofUrl,
        proof_type: submission.proofType,
        notes: submission.notes,
        submitted_at: submission.submittedAt.toISOString(),
        reviewed_at: submission.reviewedAt?.toISOString() || null,
        reviewer: submission.reviewedBy
          ? {
            id: submission.reviewedBy.id,
            username: submission.reviewedBy.username,
          }
          : null,
      })),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch submissions' },
      { status: 500 },
    );
  }
}

