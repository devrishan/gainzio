import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import { handleTaskApproval } from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { submission_id, action, rejection_reason, rejection_notes } = await request.json();

    if (!submission_id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
    }

    const submission = await prisma.taskSubmission.findUnique({
      where: { id: submission_id },
      include: {
        task: true,
        user: { include: { wallet: true, gamification: true } }
      }
    });

    if (!submission) {
      return NextResponse.json({ success: false, error: "Submission not found" }, { status: 404 });
    }

    if (submission.status === "APPROVED") {
      return NextResponse.json({ success: false, error: "Already approved" }, { status: 400 });
    }

    if (action === "reject") {
      await prisma.taskSubmission.update({
        where: { id: submission_id },
        data: {
          status: "REJECTED",
          notes: rejection_notes ? rejection_notes : submission.notes,
          // Let's check schema for `rejectionReason` column.
          // Wait, 'TaskSubmission' model in schema lines 348-371 does NOT show `rejectionReason`.
          // It has `notes`, `metadata`, `status`, `reviewedBy`.
          // I should store rejection info in `metadata` if column is missing.
          reviewedById: authUser.userId,
          reviewedAt: new Date(),
          metadata: {
            ...(submission.metadata as object || {}),
            rejectionReason: rejection_reason,
            rejectionNotes: rejection_notes
          }
        }
      });
      return NextResponse.json({ success: true, message: "Submission rejected" });
    }

    // APPROVE LOGIC
    if (action === "approve") {
      // 1. Transaction (Credit Wallet)
      const rewardAmount = Number(submission.task.rewardAmount);
      const rewardCoins = submission.task.rewardCoins;

      await prisma.$transaction(async (tx) => {
        // Update Submission
        await tx.taskSubmission.update({
          where: { id: submission_id },
          data: {
            status: "APPROVED",
            reviewedById: authUser.userId,
            reviewedAt: new Date()
          }
        });

        // Update Wallet
        if (rewardAmount > 0) {
          let wallet = await tx.wallet.findUnique({ where: { userId: submission.userId } });
          if (!wallet) {
            wallet = await tx.wallet.create({ data: { userId: submission.userId } });
          }

          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              balance: { increment: rewardAmount },
              totalEarned: { increment: rewardAmount },
              withdrawable: { increment: rewardAmount }
            }
          });

          await tx.walletTransaction.create({
            data: {
              userId: submission.userId,
              walletId: wallet.id,
              amount: rewardAmount,
              type: "TASK_REWARD",
              metadata: { taskId: submission.taskId, submissionId: submission.id }
            }
          });
        }

        // Update Gamification (Coins/XP)
        if (rewardCoins > 0) {
          // Update Coins in Wallet -> LOCKED STATE
          let wallet = await tx.wallet.findUnique({ where: { userId: submission.userId } });
          if (!wallet) {
            wallet = await tx.wallet.create({ data: { userId: submission.userId } });
          }

          await tx.wallet.update({
            where: { id: wallet.id },
            data: { lockedCoins: { increment: rewardCoins } }
          });

          // Lock period logic (Default 24h)
          // TODO: Dynamic based on Trust Score
          const unlockTime = new Date();
          unlockTime.setHours(unlockTime.getHours() + 24);

          await tx.coinTransaction.create({
            data: {
              userId: submission.userId,
              amount: rewardCoins,
              type: "EARN",
              status: "LOCKED",
              unlocksAt: unlockTime,
              description: `Reward for task: ${submission.task.title}`,
              source: "TASK_REWARD",
              metadata: { taskId: submission.taskId }
            }
          });
        }
      });

      // Award XP and Check Badges
      try {
        await handleTaskApproval(submission.userId, submission.taskId);
      } catch (err) {
        console.error("Failed to award XP for task approval", err);
        // Don't fail the response, just log it. The money is transferred.
      }

      return NextResponse.json({ success: true, message: "Submission approved and user credited." });
    }

  } catch (error) {
    console.error("Review Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
