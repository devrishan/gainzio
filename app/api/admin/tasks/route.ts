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

        const [tasks, total] = await Promise.all([
            prisma.task.findMany({
                include: {
                    category: {
                        select: { name: true, slug: true }
                    },
                    _count: {
                        select: { submissions: true }
                    }
                },
                orderBy: {
                    createdAt: "desc"
                },
                take: perPage,
                skip: (page - 1) * perPage,
            }),
            prisma.task.count(),
        ]);

        return NextResponse.json({
            success: true,
            tasks: tasks.map(task => ({
                id: task.id,
                title: task.title,
                slug: task.slug,
                description: task.description,
                rewardAmount: Number(task.rewardAmount),
                rewardCoins: task.rewardCoins,
                difficulty: task.difficulty,
                isActive: task.isActive,
                category: task.category,
                submissionCount: task._count.submissions,
                createdAt: task.createdAt.toISOString()
            })),
            pagination: {
                page,
                per_page: perPage,
                total,
                total_pages: Math.ceil(total / perPage),
            },
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch tasks' },
            { status: 500 },
        );
    }
}
