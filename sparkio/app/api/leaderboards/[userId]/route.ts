import { NextRequest, NextResponse } from 'next/server';
import { getUserRank } from '@/lib/leaderboards';
import { z } from 'zod';

const querySchema = z.object({
  period: z.enum(['daily', 'weekly', 'monthly', 'alltime']).default('alltime'),
  metric: z.enum(['xp', 'coins', 'earnings']).default('xp'),
});

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } },
) {
  try {
    const { searchParams } = new URL(request.url);
    const { period, metric } = querySchema.parse(Object.fromEntries(searchParams));

    const rank = await getUserRank(params.userId, period, metric);

    return NextResponse.json({
      success: true,
      userId: params.userId,
      period,
      metric,
      rank,
    });
  } catch (error) {
    console.error('Error fetching user rank:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid query parameters', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user rank' },
      { status: 500 },
    );
  }
}

