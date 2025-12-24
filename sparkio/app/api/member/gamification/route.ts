import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { getUserGamificationStats } from '@/lib/gamification';

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

    let userId: string;
    try {
      const payload = verifyAccessToken(accessToken);
      userId = payload.sub;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
      );
    }

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

