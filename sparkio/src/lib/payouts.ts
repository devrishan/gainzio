import Razorpay from 'razorpay';
import { Cashfree } from 'cashfree-sdk';

export interface PayoutOptions {
  amount: number; // in rupees
  upiId: string;
  userId: string;
  withdrawalId: string;
  name?: string;
  phone?: string;
}

export interface PayoutResult {
  success: boolean;
  payoutId?: string;
  status?: 'PENDING' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  failureReason?: string;
  txId?: string;
  receiptUrl?: string;
}

/**
 * Initialize Razorpay client
 */
function getRazorpayClient(): Razorpay | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.warn('Razorpay credentials not configured');
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

/**
 * Initialize Cashfree client (using REST API)
 */
function getCashfreeHeaders(): { 'x-client-id': string; 'x-client-secret': string; 'x-api-version': string } | null {
  const appId = process.env.CASHFREE_APP_ID;
  const secretKey = process.env.CASHFREE_SECRET_KEY;

  if (!appId || !secretKey) {
    console.warn('Cashfree credentials not configured');
    return null;
  }

  return {
    'x-client-id': appId,
    'x-client-secret': secretKey,
    'x-api-version': '2023-08-01',
  };
}

/**
 * Process payout via Razorpay
 */
async function processRazorpayPayout(options: PayoutOptions): Promise<PayoutResult> {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return {
      success: false,
      failureReason: 'Razorpay not configured',
    };
  }

  try {
    // Razorpay Payouts API
    const payout = await (razorpay as any).payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || '', // Fund account number
      fund_account: {
        account_type: 'vpa', // Virtual Payment Address (UPI)
        vpa: {
          address: options.upiId,
        },
        contact: {
          name: options.name || 'User',
          email: `user${options.userId}@earniq.app`,
          contact: options.phone || '',
          type: 'customer',
        },
      },
      amount: Math.round(options.amount * 100), // Convert to paise
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: `WITHDRAWAL_${options.withdrawalId}`,
      narration: `Earniq withdrawal for ${options.userId}`,
    });

    return {
      success: true,
      payoutId: payout.id,
      status: payout.status === 'queued' ? 'PENDING' : payout.status === 'processing' ? 'PROCESSING' : 'SUCCESS',
      txId: payout.id,
    };
  } catch (error: any) {
    console.error('Razorpay payout error:', error);
    return {
      success: false,
      failureReason: error.error?.description || error.message || 'Razorpay payout failed',
    };
  }
}

/**
 * Process payout via Cashfree (using REST API)
 */
async function processCashfreePayout(options: PayoutOptions): Promise<PayoutResult> {
  const headers = getCashfreeHeaders();
  if (!headers) {
    return {
      success: false,
      failureReason: 'Cashfree not configured',
    };
  }

  const environment = process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION';
  const baseUrl = environment === 'PRODUCTION' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';

  try {
    const transferId = `WITHDRAWAL_${options.withdrawalId}_${Date.now()}`;

    // Cashfree Payouts API - Instant Settlement
    const response = await fetch(`${baseUrl}/payout/v1/instantSettlement`, {
      method: 'POST',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        beneId: `BENE_${options.userId}_${Date.now()}`,
        amount: options.amount.toString(),
        transferId: transferId,
        transferMode: 'upi',
        remarks: `Earniq withdrawal for ${options.userId}`,
        beneDetails: {
          name: options.name || 'User',
          email: `user${options.userId}@earniq.app`,
          phone: options.phone || '',
          address: '',
          bankAccount: '',
          ifsc: '',
          vpa: options.upiId,
          upi: options.upiId,
        },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        failureReason: data.message || data.error || 'Cashfree payout failed',
      };
    }

    return {
      success: true,
      payoutId: data.transferId || data.referenceId,
      status: data.status === 'SUCCESS' ? 'SUCCESS' : 'PROCESSING',
      txId: data.utr || data.transferId,
    };
  } catch (error: any) {
    console.error('Cashfree payout error:', error);
    return {
      success: false,
      failureReason: error.message || 'Cashfree payout failed',
    };
  }
}

/**
 * Main payout function - tries Razorpay first, falls back to Cashfree
 */
export async function processPayout(options: PayoutOptions): Promise<PayoutResult> {
  const provider = process.env.PAYOUT_PROVIDER || 'razorpay';

  if (provider === 'razorpay') {
    const result = await processRazorpayPayout(options);
    if (result.success) {
      return result;
    }
    // Fallback to Cashfree if Razorpay fails
    console.warn('Razorpay payout failed, trying Cashfree...');
    return await processCashfreePayout(options);
  } else if (provider === 'cashfree') {
    const result = await processCashfreePayout(options);
    if (result.success) {
      return result;
    }
    // Fallback to Razorpay if Cashfree fails
    console.warn('Cashfree payout failed, trying Razorpay...');
    return await processRazorpayPayout(options);
  }

  return {
    success: false,
    failureReason: 'No payout provider configured',
  };
}

/**
 * Verify payout status from Razorpay
 */
export async function verifyRazorpayPayout(payoutId: string): Promise<PayoutResult> {
  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return {
      success: false,
      failureReason: 'Razorpay not configured',
    };
  }

  try {
    const payout = await (razorpay as any).payouts.fetch(payoutId);
    return {
      success: true,
      payoutId: payout.id,
      status: payout.status === 'queued' ? 'PENDING' : payout.status === 'processing' ? 'PROCESSING' : payout.status === 'processed' ? 'SUCCESS' : 'FAILED',
      txId: payout.id,
      failureReason: payout.status === 'reversed' || payout.status === 'failed' ? payout.failure_reason : undefined,
    };
  } catch (error: any) {
    console.error('Razorpay payout verification error:', error);
    return {
      success: false,
      failureReason: error.error?.description || error.message || 'Failed to verify payout',
    };
  }
}

/**
 * Verify payout status from Cashfree (using REST API)
 */
export async function verifyCashfreePayout(transferId: string): Promise<PayoutResult> {
  const headers = getCashfreeHeaders();
  if (!headers) {
    return {
      success: false,
      failureReason: 'Cashfree not configured',
    };
  }

  const environment = process.env.CASHFREE_ENVIRONMENT || 'PRODUCTION';
  const baseUrl = environment === 'PRODUCTION' ? 'https://api.cashfree.com' : 'https://sandbox.cashfree.com';

  try {
    const response = await fetch(`${baseUrl}/payout/v1/transferStatus?transferId=${transferId}`, {
      method: 'GET',
      headers: {
        ...headers,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        failureReason: data.message || data.error || 'Failed to verify payout',
      };
    }

    return {
      success: true,
      payoutId: data.transferId,
      status: data.status === 'SUCCESS' ? 'SUCCESS' : data.status === 'FAILED' ? 'FAILED' : 'PROCESSING',
      txId: data.utr || data.transferId,
      failureReason: data.status === 'FAILED' ? data.reason : undefined,
    };
  } catch (error: any) {
    console.error('Cashfree payout verification error:', error);
    return {
      success: false,
      failureReason: error.message || 'Failed to verify payout',
    };
  }
}

