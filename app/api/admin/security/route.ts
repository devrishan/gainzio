import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthenticated' },
                { status: 401 },
            );
        }

        // Authorization Check
        const userRole = authUser.role;
        if (userRole !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 },
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '20');

        const [logs, total] = await Promise.all([
            prisma.auditLog.findMany({
                include: {
                    actor: {
                        select: {
                            username: true,
                            email: true,
                            role: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: perPage,
                skip: (page - 1) * perPage,
            }),
            prisma.auditLog.count(),
        ]);

        return NextResponse.json({
            success: true,
            logs: logs.map(log => ({
                id: log.id,
                action: log.action,
                actor: log.actor ? {
                    username: log.actor.username,
                    role: log.actor.role
                } : null,
                entityType: log.entityType,
                entityId: log.entityId,
                metadata: log.metadata,
                createdAt: log.createdAt.toISOString()
            })),
            pagination: {
                page,
                per_page: perPage,
                total,
                total_pages: Math.ceil(total / perPage),
            },
        });

    } catch (error) {
        console.error('Error fetching security logs:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch security logs' },
            { status: 500 },
        );
    }
}
