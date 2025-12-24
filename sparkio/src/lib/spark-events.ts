import { prisma } from './prisma';
import { isFeatureEnabled } from './feature-flags';

export type SparkEventType =
  | 'TASK_APPROVED'
  | 'REFERRAL_VERIFIED'
  | 'WITHDRAWAL_COMPLETED'
  | 'RANK_UPGRADE'
  | 'STREAK_MILESTONE'
  | 'BADGE_EARNED';

export interface SparkEventData {
  userId?: string;
  taskId?: string;
  submissionId?: string;
  withdrawalId?: string;
  rank?: string;
  badge?: string;
  streakDays?: number;
  amount?: number;
  [key: string]: any;
}

/**
 * Publish a Spark event to the feed
 */
export async function publishSparkEvent(
  type: SparkEventType,
  message: string,
  data: SparkEventData = {},
  isPublic: boolean = true,
): Promise<void> {
  // Check if Spark Wall is enabled
  const sparkWallEnabled = await isFeatureEnabled('SPARK_WALL_ENABLED', data.userId);
  if (!sparkWallEnabled) {
    return; // Skip event publishing if feature is disabled
  }

  try {
    await prisma.sparkEvent.create({
      data: {
        type,
        message,
        data: data as any,
        isPublic,
      },
    });
  } catch (error) {
    console.error('Error publishing Spark event:', error);
    // Don't throw - event publishing should not break main flow
  }
}

/**
 * Get recent Spark events
 */
export async function getRecentSparkEvents(limit: number = 50, publicOnly: boolean = true): Promise<Array<{
  id: string;
  type: string;
  message: string;
  data: any;
  createdAt: Date;
}>> {
  const events = await prisma.sparkEvent.findMany({
    where: publicOnly ? { isPublic: true } : undefined,
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return events.map((event) => ({
    id: event.id,
    type: event.type,
    message: event.message,
    data: event.data,
    createdAt: event.createdAt,
  }));
}
