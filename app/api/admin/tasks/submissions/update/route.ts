import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Role, SubmissionStatus } from '@prisma/client';

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    let reviewerId: string;
    let userRole: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      reviewerId = payload.sub;
      userRole = payload.role;

      // Only admins and verifiers can approve/reject
      if (userRole !== Role.ADMIN && userRole !== Role.VERIFIER) {
        return NextResponse.json(
          { success: false, error: 'Forbidden' },
          { status: 403 },
        );
      }
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { submission_id, new_status, review_notes } = body;

    if (!submission_id || !new_status) {
      return NextResponse.json(
        { success: false, error: 'submission_id and new_status are required' },
        { status: 400 },
      );
    }

    const validStatuses: SubmissionStatus[] = ['APPROVED', 'REJECTED', 'REVIEWING'];
    if (!validStatuses.includes(new_status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 },
      );
    }

    // Get submission with related data
    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submission_id },
      include: {
        task: true,
        user: {
          include: {
            wallet: true,
            gamification: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json(
        { success: false, error: 'Submission not found' },
        { status: 404 },
      );
    }

    // Update submission status
    const updatedSubmission = await prisma.taskSubmission.update({
      where: { id: submission_id },
      data: {
        status: new_status,
        reviewedById: reviewerId,
        reviewedAt: new Date(),
        notes: review_notes || submission.notes,
      },
    });

    // If approved, credit wallet and update gamification
    if (new_status === 'APPROVED' && submission.status !== 'APPROVED') {
      await prisma.$transaction(async (tx) => {
        // Credit wallet
        if (submission.user.wallet) {
          const rewardAmount = Number(submission.task.rewardAmount);
          const rewardCoins = submission.task.rewardCoins;

          // Update wallet
          await tx.wallet.update({
            where: { id: submission.user.wallet.id },
            data: {
              balance: { increment: rewardAmount },
              withdrawable: { increment: rewardAmount },
              totalEarned: { increment: rewardAmount },
              coins: { increment: rewardCoins },
            },
          });

          // Create transaction record
          await tx.walletTransaction.create({
            data: {
              userId: submission.userId,
              walletId: submission.user.wallet.id,
              amount: rewardAmount,
              type: 'TASK_REWARD',
              metadata: {
                taskId: submission.taskId,
                taskTitle: submission.task.title,
                submissionId: submission.id,
                coins: rewardCoins,
              },
            },
          });
        }

        // Update gamification (XP, badges, etc.)
        if (submission.user.gamification) {
          const xpReward = 100; // Base XP for task completion
          const newXp = submission.user.gamification.xp + xpReward;

          // Determine new rank based on XP
          let newRank = submission.user.gamification.rank;
          if (newXp >= 20000) {
            newRank = 'MASTER';
          } else if (newXp >= 5000) {
            newRank = 'ELITE';
          } else if (newXp >= 1000) {
            newRank = 'PRO';
          }

          await tx.gamificationState.update({
            where: { id: submission.user.gamification.id },
            data: {
              xp: newXp,
              rank: newRank,
            },
          });

          // Check for badge awards (first task, 10 tasks, etc.)
          const taskCount = await tx.taskSubmission.count({
            where: {
              userId: submission.userId,
              status: 'APPROVED',
            },
          });

          // Award first task badge
          if (taskCount === 1) {
            const firstTaskBadge = await tx.badge.findUnique({
              where: { code: 'FIRST_TASK' },
            });

            if (firstTaskBadge) {
              await tx.badgeOnUser.create({
                data: {
                  badgeId: firstTaskBadge.id,
                  gamificationId: submission.user.gamification.id,
                },
              });
            }
          }

          // Award 10 tasks badge
          if (taskCount === 10) {
            const tenTasksBadge = await tx.badge.findUnique({
              where: { code: 'TEN_TASKS' },
            });

            if (tenTasksBadge) {
              await tx.badgeOnUser.create({
                data: {
                  badgeId: tenTasksBadge.id,
                  gamificationId: submission.user.gamification.id,
                },
              });
            }
          }
        }

        // Create notification
        await tx.notification.create({
          data: {
            userId: submission.userId,
            type: 'TASK_APPROVED',
            title: 'Task Approved!',
            body: `Your submission for "${submission.task.title}" has been approved. You've earned â‚¹${submission.task.rewardAmount} and ${submission.task.rewardCoins} coins!`,
            data: {
              taskId: submission.taskId,
              submissionId: submission.id,
              rewardAmount: Number(submission.task.rewardAmount),
              rewardCoins: submission.task.rewardCoins,
            },
          },
        });
      });
    } else if (new_status === 'REJECTED' && submission.status !== 'REJECTED') {
      // Create rejection notification
      await prisma.notification.create({
        data: {
          userId: submission.userId,
          type: 'TASK_REJECTED',
          title: 'Task Rejected',
          body: `Your submission for "${submission.task.title}" has been rejected.${review_notes ? ` Reason: ${review_notes}` : ''}`,
          data: {
            taskId: submission.taskId,
            submissionId: submission.id,
            reviewNotes: review_notes,
          },
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Submission updated successfully',
      submission_id: submission_id,
      status: new_status,
      reviewed_at: updatedSubmission.reviewedAt?.toISOString() || new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update submission',
      },
      { status: 500 },
    );
  }
}
