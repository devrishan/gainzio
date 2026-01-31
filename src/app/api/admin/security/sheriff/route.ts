import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
        }

        // 1. Find Duplicate IPs (Multi-accounting)
        // We look at LegacySession or ActivityLog for IP addresses.
        // Group users by IP address, having count > 1
        const duplicateIps = await prisma.legacySession.groupBy({
            by: ['ipAddress'],
            having: {
                ipAddress: {
                    _count: { gt: 1 }
                }
            },
            _count: {
                userId: true // distinct user IDs per IP ideally, but group by IP first
            }
        });

        // The above prisma query implies finding IPs used by multiple *sessions*. 
        // We need to refine to find IPs used by multiple *different users*.
        // Prisma `groupBy` doesn't support `distinct` inside `_count` perfectly in all dialects for this specific query efficiently in one go without raw query.
        // Let's use a raw query for "Sheriff" level power.

        const ipClusters = await prisma.$queryRaw`
            SELECT "ipAddress", COUNT(DISTINCT "userId") as "userCount", array_agg(DISTINCT "userId") as "userIds"
            FROM "LegacySession"
            WHERE "ipAddress" IS NOT NULL
            GROUP BY "ipAddress"
            HAVING COUNT(DISTINCT "userId") > 1
            ORDER BY "userCount" DESC
            LIMIT 20;
        `;

        // 2. High Velocity Users (Bot behavior?)
        // Users who completed > 50 tasks in last 24 hours
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const velocityUsers = await prisma.taskSubmission.groupBy({
            by: ['userId'],
            where: {
                submittedAt: { gte: oneDayAgo }
            },
            _count: {
                id: true
            },
            having: {
                id: { _count: { gt: 20 } } // threshold
            },
            orderBy: {
                _count: { id: 'desc' }
            },
            take: 20
        });

        // Hydrate user details for velocity
        const velocityUserIds = velocityUsers.map(v => v.userId);
        const velocityUserDetails = await prisma.user.findMany({
            where: { id: { in: velocityUserIds } },
            select: { id: true, username: true, email: true, role: true }
        });

        const formattedVelocity = velocityUsers.map(v => {
            const u = velocityUserDetails.find(ud => ud.id === v.userId);
            return {
                user: u,
                count: v._count.id
            };
        });

        return NextResponse.json({
            success: true,
            sheriff: {
                ipClusters, // Returns { ipAddress, userCount, userIds }
                velocityUsers: formattedVelocity
            }
        });

    } catch (error) {
        console.error('Sheriff Error:', error);
        return NextResponse.json({ success: false, error: 'Sheriff investigation failed' }, { status: 500 });
    }
}
