import { prisma } from '@/lib/prisma';
import { User, FraudLog } from '@prisma/client';

export const TRUST_SCORE_MAX = 100;
export const TRUST_SCORE_MIN = 0;
export const TRUST_THRESHOLD_LOW = 40; // Users below this are scrutinized heavily
export const TRUST_THRESHOLD_SHADOW_BAN = 20; // Users below this are shadow banned

/**
 * Log a potential fraud event and update trust score
 */
export async function logFraudEvent(
    userId: string,
    type: string,
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    details?: string,
    metadata?: any
) {
    let scoreImpact = 0;

    // Determine impact based on severity
    switch (severity) {
        case 'LOW': scoreImpact = -5; break;
        case 'MEDIUM': scoreImpact = -15; break;
        case 'HIGH': scoreImpact = -30; break;
        case 'CRITICAL': scoreImpact = -50; break;
    }

    // Create log
    await prisma.fraudLog.create({
        data: {
            userId,
            type,
            severity,
            scoreImpact,
            details,
            metadata
        }
    });

    // Update User Trust Score
    await modifyTrustScore(userId, scoreImpact);
}

/**
 * Update user trust score and check for shadow ban
 */
export async function modifyTrustScore(userId: string, change: number) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return;

    let newScore = (user.trustScore || 100) + change;
    newScore = Math.max(TRUST_SCORE_MIN, Math.min(TRUST_SCORE_MAX, newScore));

    const shouldShadowBan = newScore <= TRUST_THRESHOLD_SHADOW_BAN;

    await prisma.user.update({
        where: { id: userId },
        data: {
            trustScore: newScore,
            isShadowBanned: shouldShadowBan,
            shadowBannedAt: shouldShadowBan && !user.isShadowBanned ? new Date() : user.shadowBannedAt
        }
    });
}

/**
 * Check if a user is allowed to perform sensitive actions
 */
export async function checkTrustLevel(userId: string): Promise<{ allowed: boolean; reason?: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { allowed: false, reason: 'User not found' };

    if (user.isShadowBanned) {
        return { allowed: false, reason: 'Account restricted' };
    }

    return { allowed: true };
}
