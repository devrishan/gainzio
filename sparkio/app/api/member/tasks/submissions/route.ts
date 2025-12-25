import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  status: z.enum(['SUBMITTED', 'REVIEWING', 'APPROVED', 'REJECTED', 'DELETED']).optional(),
  page: z.string().optional().transform(Number).default('1'),
  perPage: z.string().optional().transform(Number).default('10'),
});

export async function GET(req: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = querySchema.parse(Object.fromEntries(searchParams));

    const skip = (query.page - 1) * query.perPage;
    const take = query.perPage;

    const where: Record<string, any> = { userId: user.id };
    if (query.status) {
      where.status = query.status;
    }

    const [submissions, total] = await prisma.$transaction([
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
        },
        orderBy: { submittedAt: 'desc' },
        skip,
        take,
      }),
      prisma.taskSubmission.count({ where }),
    ]);

    const formattedSubmissions = submissions.map((sub) => ({
      id: sub.id,
      task: {
        id: sub.task.id,
        title: sub.task.title,
        slug: sub.task.slug,
        reward_amount: sub.task.rewardAmount.toNumber(),
        reward_coins: sub.task.rewardCoins,
      },
      status: sub.status,
      proof_url: sub.proofUrl,
      proof_type: sub.proofType,
      notes: sub.notes,
      submitted_at: sub.submittedAt.toISOString(),
      reviewed_at: sub.reviewedAt?.toISOString() || null,
    }));

    return NextResponse.json({
      success: true,
      data: formattedSubmissions,
      pagination: {
        page: query.page,
        per_page: query.perPage,
        total,
        total_pages: Math.ceil(total / query.perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 },
    );
  }
}

