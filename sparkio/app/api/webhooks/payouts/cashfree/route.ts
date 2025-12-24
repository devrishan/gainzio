import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { NotificationType } from '@prisma/client';
import crypto from 'crypto';

/**
 * Verify Cashfree webhook signature
 */
function verifyCashfreeSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-cashfree-signature');
    const secret = process.env.CASHFREE_WEBHOOK_SECRET;

    if (!secret || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing webhook secret or signature' },
        { status: 401 },
      );
    }

    // Verify signature
    if (!verifyCashfreeSignature(body, signature, secret)) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 },
      );
    }

    const event = JSON.parse(body);
    const { type, data } = event;

    // Handle payout events
    if (type === 'PAYOUT_SUCCESS' || type === 'PAYOUT_FAILED' || type === 'PAYOUT_PENDING') {
      const transferId = data?.transferId || data?.referenceId;
      const status = data?.status;
      const utr = data?.utr;

      if (!transferId) {
        return NextResponse.json({ success: false, error: 'Missing transfer ID' }, { status: 400 });
      }

      // Extract withdrawal ID from transferId (format: WITHDRAWAL_<id>_<timestamp>)
      const withdrawalIdMatch = transferId.match(/WITHDRAWAL_(.+?)_/);
      if (!withdrawalIdMatch) {
        return NextResponse.json({ success: false, error: 'Invalid transfer ID format' }, { status: 400 });
      }

      const withdrawalId = withdrawalIdMatch[1];

      // Find withdrawal
      const withdrawal = await prisma.withdrawal.findUnique({
        where: { id: withdrawalId },
        include: {
          user: {
            include: {
              wallet: true,
            },
          },
        },
      });

      if (!withdrawal) {
        return NextResponse.json({ success: false, error: 'Withdrawal not found' }, { status: 404 });
      }

      // Update withdrawal status based on payout status
      let newStatus: 'PROCESSING' | 'COMPLETED' | 'FAILED' = 'PROCESSING';
      if (status === 'SUCCESS' || type === 'PAYOUT_SUCCESS') {
        newStatus = 'COMPLETED';
      } else if (status === 'FAILED' || type === 'PAYOUT_FAILED') {
        newStatus = 'FAILED';
      }

      await prisma.$transaction(async (tx) => {
        await tx.withdrawal.update({
          where: { id: withdrawalId },
          data: {
            status: newStatus,
            txId: utr || transferId,
            processedAt: newStatus === 'COMPLETED' || newStatus === 'FAILED' ? new Date() : withdrawal.processedAt,
            notes: status === 'FAILED' ? data?.reason || 'Payout failed' : withdrawal.notes,
          },
        });

        if (newStatus === 'COMPLETED' && withdrawal.user.wallet) {
          // Deduct from pending
          await tx.wallet.update({
            where: { id: withdrawal.user.wallet.id },
            data: {
              pendingAmount: { decrement: Number(withdrawal.amount) },
            },
          });
        } else if (newStatus === 'FAILED' && withdrawal.user.wallet) {
          // Refund to wallet
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
                reason: data?.reason || 'Payout failed',
              },
            },
          });
        }

        // Create notification
        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            type: NotificationType.WITHDRAWAL_UPDATE,
            title: 'Withdrawal Update',
            body:
              newStatus === 'COMPLETED'
                ? `Your withdrawal of ₹${withdrawal.amount} has been processed successfully!`
                : `Your withdrawal request of ₹${withdrawal.amount} has failed. Amount refunded to your wallet.`,
            data: {
              withdrawalId: withdrawal.id,
              amount: Number(withdrawal.amount),
              status: newStatus,
              txId: utr || transferId,
            },
          },
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Cashfree webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 },
    );
  }
}

