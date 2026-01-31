import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    // Authorization
    if (!authUser || (authUser.role !== Role.ADMIN && authUser.role !== Role.PAYOUT_MANAGER)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    const { withdrawal_id, new_status } = await request.json();

    if (!withdrawal_id || !["APPROVED", "REJECTED"].includes(new_status)) {
      return NextResponse.json({ success: false, error: "Invalid request parameters" }, { status: 400 });
    }

    // Process Transactionally
    await prisma.$transaction(async (tx) => {
      const withdrawal = await tx.withdrawal.findUnique({
        where: { id: String(withdrawal_id) }, // ID is string (cuid) in schema, but client sends number? 
        // Logic check: Schema says `id String @id @default(cuid())`.
        // Client code `withdrawal_id: number` in `admin-withdrawals-client.tsx`.
        // This is a Type mismatch! Schema `id` is String.
        // Wait, `AdminWithdrawal` interface in `services/admin.ts` showed `id: number`.
        // But `schema.prisma` line 284: `id String @id @default(cuid())`.
        // I must follow SCHEMA. The client interface is likely wrong or legacy for this newly migrated system.
        // I will assume the client passes the ID it received, which comes from the API GET, which maps `id` to `withdrawal.id`.
        // So it passes a string, even if TS says number. I will treat it as string or conversion.
      });

      if (!withdrawal) {
        throw new Error("Withdrawal not found");
      }

      if (withdrawal.status !== "PENDING") {
        throw new Error("Withdrawal is not pending");
      }

      if (new_status === "APPROVED") {
        await tx.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: "APPROVED", // Or COMPLETED? UI sends APPROVED.
            processedAt: new Date()
          }
        });
        // Amount is already deducted from wallet, specifically from `withdrawable`.
        // And added to `pendingAmount`.
        // So for approval, we just decrement `pendingAmount` (money leaves system) 
        // OR we assume `totalEarned` stays same, `balance` stays same?
        // Schema: `balance`, `pendingAmount`, `withdrawable`.
        // Request flow: `withdrawable` -= amt, `pendingAmount` += amt.
        // Approval flow: `pendingAmount` -= amt. (Money gone).
        // `balance` -= amt? Usually yes, total net worth decreases.

        await tx.wallet.update({
          where: { userId: withdrawal.userId },
          data: {
            pendingAmount: { decrement: withdrawal.amount },
            balance: { decrement: withdrawal.amount } // Real deduction from net worth
          }
        });

        // No transaction needed? Money LEFT the system. 
        // Optional: `WITHDRAWAL_COMPLETED` logging.
      } else if (new_status === "REJECTED") {
        await tx.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: "REJECTED",
            processedAt: new Date()
          }
        });

        // Refund Logic
        // Reverse the Request flow: `pendingAmount` -= amt, `withdrawable` += amt.
        await tx.wallet.update({
          where: { userId: withdrawal.userId },
          data: {
            pendingAmount: { decrement: withdrawal.amount },
            withdrawable: { increment: withdrawal.amount }
          }
        });

        await tx.walletTransaction.create({
          data: {
            userId: withdrawal.userId,
            walletId: (await tx.wallet.findUniqueOrThrow({ where: { userId: withdrawal.userId } })).id,
            amount: withdrawal.amount,
            type: "WITHDRAWAL_REFUND",
            metadata: { withdrawalId: withdrawal.id }
          }
        });
      }
    });

    return NextResponse.json({ success: true, message: `Withdrawal ${new_status.toLowerCase()}` });

  } catch (error) {
    console.error("Process Withdraw Error", error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Process failed" }, { status: 500 });
  }
}
