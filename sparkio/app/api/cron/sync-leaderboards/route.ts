import { NextRequest, NextResponse } from 'next/server';
import { syncLeaderboardsToRedis } from '@/lib/leaderboards';

/**
 * Cron job endpoint to sync leaderboards from database to Redis
 * Should be called periodically (e.g., every hour) via cron job or scheduled task
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret (optional, for security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 },
      );
    }

    await syncLeaderboardsToRedis();

    return NextResponse.json({
      success: true,
      message: 'Leaderboards synced successfully',
    });
  } catch (error) {
    console.error('Error syncing leaderboards:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync leaderboards',
      },
      { status: 500 },
    );
  }
}

