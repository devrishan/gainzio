import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { getReferralTree, getReferralChain } from '@/lib/referrals';

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

    let userId: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userId = payload.sub;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const includeTree = searchParams.get('include_tree') === 'true';

    // Get user's referrals
    const referrals = await prisma.referral.findMany({
      where: {
        referrerId: userId,
      },
      include: {
        referredUser: {
          select: {
            id: true,
            phone: true,
            username: true,
            email: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Get referral chain (who referred me, who I referred)
    const chain = await getReferralChain(userId);

    // Get referral tree if requested
    let tree = null;
    if (includeTree) {
      tree = await getReferralTree(userId);
    }

    // Calculate stats
    const totalReferrals = referrals.length;
    const verifiedCount = referrals.filter((r) => r.status === 'verified').length;
    const pendingCount = referrals.filter((r) => r.status === 'pending').length;
    const totalCommission = referrals
      .filter((r) => r.status === 'verified')
      .reduce((sum, r) => sum + Number(r.commissionAmount), 0);

    return NextResponse.json({
      success: true,
      referrals: referrals.map((referral) => ({
        id: referral.id,
        referred_user: {
          id: referral.referredUser.id,
          username: referral.referredUser.username,
          email: referral.referredUser.email,
          phone: referral.referredUser.phone,
          created_at: referral.referredUser.createdAt.toISOString(),
        },
        level: referral.level,
        status: referral.status,
        commission_amount: Number(referral.commissionAmount),
        created_at: referral.createdAt.toISOString(),
        updated_at: referral.updatedAt.toISOString(),
      })),
      stats: {
        total: totalReferrals,
        verified: verifiedCount,
        pending: pendingCount,
        total_commission: totalCommission,
      },
      chain: {
        referrer: chain.referrer,
        direct_referrals: chain.directReferrals,
      },
      tree: tree,
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch referrals' },
      { status: 500 },
    );
  }
}

