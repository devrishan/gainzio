import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role, SubmissionStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthenticated' },
                { status: 401 },
            );
        }

        // Authorization Check: Admins and Verifiers can usually see submissions
        const userRole = authUser.role;
        if (userRole !== Role.ADMIN && userRole !== Role.VERIFIER) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 },
            );
        }

        const searchParams = request.nextUrl.searchParams;
        const status = searchParams.get('status') as SubmissionStatus | null;
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '20');

        const where: Record<string, any> = {};
        if (status) {
            where.status = status;
        } else {
            // Default: Show PENDING/SUBMITTED or REVIEWING
            where.status = {
                in: [SubmissionStatus.SUBMITTED, SubmissionStatus.REVIEWING]
            };
        }

        const [submissions, total] = await Promise.all([
            prisma.taskSubmission.findMany({
                where,
                include: {
                    task: {
                        select: {
                            title: true,
                            rewardAmount: true,
                            rewardCoins: true,
                        }
                    },
                    user: {
                        select: {
                            username: true,
                            email: true,
                            phone: true
                        }
                    }
                },
                orderBy: {
                    submittedAt: 'desc',
                },
                take: perPage,
                skip: (page - 1) * perPage,
            }),
            prisma.taskSubmission.count({ where }),
        ]);

        // Map to match the existing frontend expectations if possible, or define new
        // The previous PHP interface was complex (AdminSubmission).
        // Let's stick to a clean new structure and map in service if needed, 
        // or just return clean data.

        return NextResponse.json({
            success: true,
            submissions: submissions.map(sub => ({
                id: sub.id,
                status: sub.status,
                task_title: sub.task.title,
                task_reward_money: Number(sub.task.rewardAmount),
                task_reward_coins: sub.task.rewardCoins,
                user_username: sub.user.username,
                user_email: sub.user.email,
                proof_link: sub.proofUrl,
                proof_type: sub.proofType,
                proof_notes: sub.notes,
                created_at: sub.submittedAt.toISOString()
            })),
            pagination: {
                page,
                per_page: perPage,
                total,
                total_pages: Math.ceil(total / perPage),
            },
        });

    } catch (error) {
        console.error('Error fetching submissions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch submissions' },
            { status: 500 },
        );
    }
}
