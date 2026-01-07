import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role, SubmissionStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Get pending submissions
    const submissions = await prisma.taskSubmission.findMany({
        where: { status: SubmissionStatus.SUBMITTED },
        include: {
            user: { select: { username: true, id: true } },
            task: { select: { title: true, rewardAmount: true, rewardCoins: true } }
        },
        orderBy: { submittedAt: 'asc' }, // Oldest first
        take: 20
    });

    return NextResponse.json({ success: true, submissions });
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { submissionId, action, reason } = body; // action: APPROVE | REJECT

        if (!submissionId || !action) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

        const status = action === 'APPROVE' ? SubmissionStatus.APPROVED : SubmissionStatus.REJECTED;

        // Transaction to update submission and potentially pay user
        await prisma.$transaction(async (tx) => {
            const sub = await tx.taskSubmission.update({
                where: { id: submissionId },
                data: {
                    status,
                    notes: reason, // Mapped to notes as adminComment doesn't exist on schema
                    reviewedBy: { connect: { id: authUser.id } },
                    reviewedAt: new Date()
                },
                include: { task: true }
            });

            if (status === SubmissionStatus.APPROVED) {
                // Credit User
                await tx.wallet.update({
                    where: { userId: sub.userId },
                    data: {
                        balance: { increment: sub.task.rewardAmount },
                        totalEarned: { increment: sub.task.rewardAmount },
                        coins: { increment: sub.task.rewardCoins }
                    }
                });

                // Get Wallet ID first
                const userWallet = await tx.wallet.findUnique({ where: { userId: sub.userId } });

                if (userWallet) {
                    // Log Transaction
                    await tx.walletTransaction.create({
                        data: {
                            walletId: userWallet.id,
                            userId: sub.userId, // Added missing userId
                            amount: sub.task.rewardAmount,
                            type: "TASK_REWARD",
                            metadata: { description: `Task Approved: ${sub.task.title}` } // Mapped description to metadata or remove if description exists on schema? Schema checked: WalletTransaction has metadata, type, but NO status or description directly? Re-checking schema: WalletTransaction has `type`, `metadata`. No `description` or `status`.
                        }
                    });
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
