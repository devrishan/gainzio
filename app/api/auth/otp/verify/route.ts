import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { Role } from '@prisma/client';

import { verifyOtp } from '@/lib/otp-provider';
import { prisma } from '@/lib/prisma';
import { signAccessToken, signRefreshToken } from '@/lib/jwt';

const verifySchema = z.object({
  phone: z.string(),
  code: z.string().length(6),
  referralCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone, code, referralCode } = verifySchema.parse(body);

    const isValid = await verifyOtp({ phone, code });
    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { phone } });

    if (!user) {
      let referredById: string | undefined;
      if (referralCode) {
        const referrer = await prisma.user.findUnique({ where: { referralCode } });
        if (referrer) {
          referredById = referrer.id;
        }
      }

      const generatedReferralCode = `EQ${Date.now().toString(36).toUpperCase()}`;

      user = await prisma.user.create({
        data: {
          phone,
          role: Role.USER,
          referralCode: generatedReferralCode,
          referredById,
          wallet: {
            create: {},
          },
          gamification: {
            create: {},
          },
        },
      });

      if (referredById) {
        const { createMultiLevelReferralEvents } = await import('@/lib/referrals');
        await createMultiLevelReferralEvents(user.id, 0);
      }
    }

    const { updateStreak } = await import('@/lib/gamification');
    await updateStreak(user.id);

    const session = await prisma.legacySession.create({
      data: {
        userId: user.id,
        refreshToken: `tmp-${Date.now()}-${Math.random()}`, // Temporary unique value
        expiresAt: new Date(Date.now() + Number(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30) * 1000),
      },
    });

    const accessToken = await signAccessToken({ sub: user.id, role: user.role });
    const refreshToken = await signRefreshToken({ sub: user.id, sid: session.id });

    await prisma.legacySession.update({
      where: { id: session.id },
      data: { refreshToken },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        role: user.role,
      },
    });

    const accessTtlSeconds = Number(process.env.JWT_ACCESS_TOKEN_TTL_SECONDS ?? 900);
    const refreshTtlSeconds = Number(process.env.JWT_REFRESH_TOKEN_TTL_SECONDS ?? 60 * 60 * 24 * 30);

    response.cookies.set('earniq_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: accessTtlSeconds,
      path: '/',
    });

    response.cookies.set('earniq_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: refreshTtlSeconds,
      path: '/',
    });

    return response;
  } catch (error: unknown) {
    console.error('OTP verify error', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.flatten() },
        { status: 400 },
      );
    }
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 });
  }
}


