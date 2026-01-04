import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { Role, WithdrawalStatus, NotificationType } from '@prisma/client';
import { processPayout } from '@/lib/payouts';

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }


    const userRole = authUser.role;
    if (userRole !== Role.ADMIN && userRole !== Role.PAYOUT_MANAGER) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const body = await request.json();
    const { withdrawal_id, new_status: requestedStatus, tx_id: initialTxId, receipt_url: receiptUrl, notes: initialNotes } = body;
    let newStatus: WithdrawalStatus | undefined = requestedStatus;
    let notes = initialNotes as string | undefined;
    let txId = initialTxId as string | undefined;

    if (!withdrawal_id || !newStatus) {
      return NextResponse.json(
        { success: false, error: 'withdrawal_id and new_status are required' },
        { status: 400 },
      );
    }

    const validStatuses: WithdrawalStatus[] = ['APPROVED', 'REJECTED', 'PROCESSING', 'COMPLETED', 'FAILED'];
    if (!validStatuses.includes(newStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 },
      );
    }

    // Get withdrawal with user and wallet
    const withdrawal = await prisma.withdrawal.findUnique({
      where: { id: withdrawal_id },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!withdrawal) {
      return NextResponse.json(
        { success: false, error: 'Withdrawal not found' },
        { status: 404 },
      );
    }

    if (withdrawal.status !== 'PENDING' && withdrawal.status !== 'APPROVED') {
      return NextResponse.json(
        { success: false, error: 'Only pending or approved withdrawals can be updated' },
        { status: 400 },
      );
    }

    // Process payout if approved (outside transaction to avoid long-running external calls)
    if (newStatus === 'APPROVED') {
      const payoutResult = await processPayout({
        amount: Number(withdrawal.amount),
        upiId: withdrawal.upiId,
        userId: withdrawal.userId,
        withdrawalId: withdrawal.id,
        name: withdrawal.user.username || undefined,
        phone: withdrawal.user.phone || undefined,
      });

      if (payoutResult.success && payoutResult.payoutId) {
        newStatus = payoutResult.status === 'SUCCESS' ? 'COMPLETED' : 'PROCESSING';
        txId = payoutResult.txId || payoutResult.payoutId;
      } else {
        newStatus = 'FAILED';
        notes = payoutResult.failureReason || 'Payout initiation failed';
      }
    }

    // Process withdrawal
    const updatedWithdrawal = await prisma.$transaction(async (tx) => {
      // Update withdrawal status
      const updated = await tx.withdrawal.update({
        where: { id: withdrawal_id },
        data: {
          status: newStatus,
          processedAt: newStatus === 'COMPLETED' || newStatus === 'FAILED' ? new Date() : withdrawal.processedAt,
          txId: txId || withdrawal.txId,
          receiptUrl: receiptUrl || withdrawal.receiptUrl,
          notes: notes || withdrawal.notes,
        },
      });

      // Handle wallet updates based on status
      if (withdrawal.user.wallet) {
        if (newStatus === 'COMPLETED') {
          // Withdrawal completed - already deducted from withdrawable, just update pending
          await tx.wallet.update({
            where: { id: withdrawal.user.wallet.id },
            data: {
              pendingAmount: { decrement: Number(withdrawal.amount) },
            },
          });
        } else if (newStatus === 'FAILED' || newStatus === 'REJECTED') {
          // Withdrawal failed - refund to withdrawable
          await tx.wallet.update({
            where: { id: withdrawal.user.wallet.id },
            data: {
              pendingAmount: { decrement: Number(withdrawal.amount) },
              withdrawable: { increment: Number(withdrawal.amount) },
            },
          });

          // Create refund transaction
          await tx.walletTransaction.create({
            data: {
              userId: withdrawal.userId,
              walletId: withdrawal.user.wallet.id,
              amount: Number(withdrawal.amount),
              type: 'WITHDRAWAL_REFUND',
              metadata: {
                withdrawalId: withdrawal.id,
                reason: newStatus === 'FAILED' ? 'Payout failed' : 'Withdrawal rejected',
              },
            },
          });
        }
      }

      // Create notification
      const notificationTitle = 'Withdrawal Update';
      let notificationBody = `Your withdrawal request of â‚¹${withdrawal.amount} has been ${newStatus.toLowerCase()}.`;

      if (newStatus === 'COMPLETED') {
        notificationBody = `Your withdrawal of â‚¹${withdrawal.amount} has been processed successfully!`;
      } else if (newStatus === 'FAILED' || newStatus === 'REJECTED') {
        notificationBody = `Your withdrawal request of â‚¹${withdrawal.amount} has been ${newStatus.toLowerCase()}.${notes ? ` Reason: ${notes}` : ''}`;
      }

      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          type: NotificationType.WITHDRAWAL_UPDATE,
          title: notificationTitle,
          body: notificationBody,
          data: {
            withdrawalId: withdrawal.id,
            amount: Number(withdrawal.amount),
            status: newStatus,
            txId: txId,
          },
        },
      });

      return updated;
    });

    return NextResponse.json({
      success: true,
      message: 'Withdrawal updated successfully',
      withdrawal_id: withdrawal_id,
      status: newStatus,
      processed_at: updatedWithdrawal.processedAt?.toISOString() || null,
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process withdrawal',
      },
      { status: 500 },
    );
  }
}
