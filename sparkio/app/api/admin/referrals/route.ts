import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    let userRole: string;
    try {
      const payload = verifyAccessToken(accessToken);
      userRole = payload.role;

      // Only admins can access
      if (userRole !== Role.ADMIN) {
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

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '30');

    const where: any = {};

    if (status) {
      where.status = status;
    }

    const [referrals, total] = await Promise.all([
      prisma.referral.findMany({
        where,
        include: {
          referrer: {
            select: {
              id: true,
              username: true,
              email: true,
              phone: true,
            },
          },
          referredUser: {
            select: {
              id: true,
              username: true,
              email: true,
              phone: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: perPage,
        skip: (page - 1) * perPage,
      }),
      prisma.referral.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: referrals.map((referral) => ({
        id: referral.id,
        referrer: {
          username: referral.referrer.username,
          email: referral.referrer.email,
          phone: referral.referrer.phone,
        },
        referred: {
          username: referral.referredUser.username,
          email: referral.referredUser.email,
          phone: referral.referredUser.phone,
        },
        level: referral.level,
        status: referral.status,
        commission_amount: Number(referral.commissionAmount),
        created_at: referral.createdAt.toISOString(),
        updated_at: referral.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 },
    );
  }
}

