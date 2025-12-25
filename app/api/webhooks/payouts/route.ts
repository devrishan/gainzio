import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

/**
 * Webhook handler for Razorpay payout status updates
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 401 },
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 },
      );
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 },
      );
    }

    const event = JSON.parse(body);

    // Handle payout status updates
    if (event.event === 'payout.processed' || event.event === 'payout.failed') {
      const payoutId = event.payload.payout?.entity?.id;
      const status = event.payload.payout?.entity?.status;
      const failureReason = event.payload.payout?.entity?.failure_reason;

      if (!payoutId) {
        return NextResponse.json(
          { success: false, error: 'Missing payout ID' },
          { status: 400 },
        );
      }

      // Find withdrawal by payout ID (stored in txId)
      const withdrawal = await prisma.withdrawal.findFirst({
        where: {
          txId: payoutId,
        },
        include: {
          user: {
            include: {
              wallet: true,
            },
          },
        },
      });

      if (!withdrawal) {
        console.warn(`Withdrawal not found for payout ID: ${payoutId}`);
        return NextResponse.json({ success: true, message: 'Withdrawal not found' });
      }

      // Update withdrawal status
      await prisma.$transaction(async (tx) => {
        const newStatus = status === 'processed' ? 'COMPLETED' : 'FAILED';

        await tx.withdrawal.update({
          where: { id: withdrawal.id },
          data: {
            status: newStatus,
            processedAt: new Date(),
            notes: failureReason || withdrawal.notes,
          },
        });

        // If failed, refund to wallet
        if (newStatus === 'FAILED' && withdrawal.user.wallet) {
          await tx.wallet.update({
            where: { id: withdrawal.user.wallet.id },
            data: {
              pendingAmount: { decrement: Number(withdrawal.amount) },
              withdrawable: { increment: Number(withdrawal.amount) },
            },
          });

          await tx.walletTransaction.create({
            data: {
              userId: withdrawal.userId,
              walletId: withdrawal.user.wallet.id,
              amount: Number(withdrawal.amount),
              type: 'WITHDRAWAL_REFUND',
              metadata: {
                withdrawalId: withdrawal.id,
                payoutId,
                reason: failureReason || 'Payout failed',
              },
            },
          });
        } else if (newStatus === 'COMPLETED' && withdrawal.user.wallet) {
          // Mark pending amount as processed
          await tx.wallet.update({
            where: { id: withdrawal.user.wallet.id },
            data: {
              pendingAmount: { decrement: Number(withdrawal.amount) },
            },
          });
        }

        // Create notification
        await tx.notification.create({
          data: {
            userId: withdrawal.userId,
            type: 'WITHDRAWAL_UPDATE',
            title: newStatus === 'COMPLETED' ? 'Withdrawal Completed' : 'Withdrawal Failed',
            body:
              newStatus === 'COMPLETED'
                ? `Your withdrawal of ₹${withdrawal.amount} has been processed successfully!`
                : `Your withdrawal of ₹${withdrawal.amount} failed. ${failureReason ? `Reason: ${failureReason}` : ''}`,
            data: {
              withdrawalId: withdrawal.id,
              amount: Number(withdrawal.amount),
              status: newStatus,
              payoutId,
            },
          },
        });
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 },
    );
  }
}

/**
 * Webhook handler for Cashfree payout status updates
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const signature = request.headers.get('x-cashfree-signature');

    if (!signature) {
      return NextResponse.json(
        { success: false, error: 'Missing signature' },
        { status: 401 },
      );
    }

    // Verify webhook signature
    const webhookSecret = process.env.CASHFREE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('CASHFREE_WEBHOOK_SECRET not configured');
      return NextResponse.json(
        { success: false, error: 'Webhook secret not configured' },
        { status: 500 },
      );
    }

    const payload = JSON.stringify(body);
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(payload)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 },
      );
    }

    // Handle payout status updates
    const transferId = body.data?.transferId || body.transferId;
    const status = body.data?.transferStatus || body.status;
    const failureReason = body.data?.failureReason || body.failureReason;

    if (!transferId) {
      return NextResponse.json(
        { success: false, error: 'Missing transfer ID' },
        { status: 400 },
      );
    }

    // Find withdrawal by transfer ID (stored in txId)
    const withdrawal = await prisma.withdrawal.findFirst({
      where: {
        txId: transferId,
      },
      include: {
        user: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (!withdrawal) {
      console.warn(`Withdrawal not found for transfer ID: ${transferId}`);
      return NextResponse.json({ success: true, message: 'Withdrawal not found' });
    }

    // Update withdrawal status
    const newStatus =
      status === 'SUCCESS' ? 'COMPLETED' : status === 'FAILED' ? 'FAILED' : 'PROCESSING';

    await prisma.$transaction(async (tx) => {
      await tx.withdrawal.update({
        where: { id: withdrawal.id },
        data: {
          status: newStatus,
          processedAt: newStatus === 'COMPLETED' || newStatus === 'FAILED' ? new Date() : withdrawal.processedAt,
          notes: failureReason || withdrawal.notes,
        },
      });

      // Handle wallet updates (same as Razorpay)
      if (newStatus === 'FAILED' && withdrawal.user.wallet) {
        await tx.wallet.update({
          where: { id: withdrawal.user.wallet.id },
          data: {
            pendingAmount: { decrement: Number(withdrawal.amount) },
            withdrawable: { increment: Number(withdrawal.amount) },
          },
        });

        await tx.walletTransaction.create({
          data: {
            userId: withdrawal.userId,
            walletId: withdrawal.user.wallet.id,
            amount: Number(withdrawal.amount),
            type: 'WITHDRAWAL_REFUND',
            metadata: {
              withdrawalId: withdrawal.id,
              transferId,
              reason: failureReason || 'Payout failed',
            },
          },
        });
      } else if (newStatus === 'COMPLETED' && withdrawal.user.wallet) {
        await tx.wallet.update({
          where: { id: withdrawal.user.wallet.id },
          data: {
            pendingAmount: { decrement: Number(withdrawal.amount) },
          },
        });
      }

      // Create notification
      await tx.notification.create({
        data: {
          userId: withdrawal.userId,
          type: 'WITHDRAWAL_UPDATE',
          title: newStatus === 'COMPLETED' ? 'Withdrawal Completed' : 'Withdrawal Failed',
          body:
            newStatus === 'COMPLETED'
              ? `Your withdrawal of ₹${withdrawal.amount} has been processed successfully!`
              : `Your withdrawal of ₹${withdrawal.amount} failed. ${failureReason ? `Reason: ${failureReason}` : ''}`,
          data: {
            withdrawalId: withdrawal.id,
            amount: Number(withdrawal.amount),
            status: newStatus,
            transferId,
          },
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Webhook processing failed',
      },
      { status: 500 },
    );
  }
}

