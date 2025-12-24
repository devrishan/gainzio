import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { sendOtp } from '@/lib/otp-provider';
import { getClientIp } from '@/lib/rate-limit';

const requestSchema = z.object({
  phone: z.string().min(10).max(15),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = requestSchema.parse(body);
    const ipAddress = getClientIp(req);

    await sendOtp({ phone, ipAddress });

    return NextResponse.json({ success: true, message: 'OTP sent successfully' });
  } catch (error: unknown) {
    console.error('OTP request error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.flatten() },
        { status: 400 },
      );
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to send OTP';
    const statusCode = errorMessage.includes('Rate limit') ? 429 : 500;
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}


