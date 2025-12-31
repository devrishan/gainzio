import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { getUserGamificationStats } from '@/lib/gamification';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }
    const userId = authUser.userId;

    const stats = await getUserGamificationStats(userId);

    return NextResponse.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch gamification stats' },
      { status: 500 },
    );
  }
}

