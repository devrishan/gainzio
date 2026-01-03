import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    // Use the ID from the helper
    const userId = authUser.userId;

    // Get user's gamification state with badges
    const gamification = await prisma.gamificationState.findUnique({
      where: { userId },
      include: {
        badges: {
          include: {
            badge: true,
          },
          orderBy: {
            earnedAt: 'desc',
          },
        },
      },
    });

    if (!gamification) {
      return NextResponse.json({
        success: true,
        badges: [],
      });
    }

    const badges = gamification.badges.map((b) => ({
      id: b.badge.id,
      code: b.badge.code,
      name: b.badge.name,
      description: b.badge.description,
      icon: b.badge.icon,
      earnedAt: b.earnedAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      badges,
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch badges' },
      { status: 500 },
    );
  }
}

