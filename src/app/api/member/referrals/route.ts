import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';
import { getReferralTree, getReferralChain } from '@/lib/referrals';
import { getAuthenticatedUser } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    const userId = authUser.userId;

    const searchParams = request.nextUrl.searchParams;
    const includeTree = searchParams.get('include_tree') === 'true';

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    // Get user's referrals (Paginated)
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
      skip,
      take: limit,
    });

    // Get total count for pagination metadata
    const totalReferrals = await prisma.referral.count({
      where: { referrerId: userId }
    });

    const verifiedCount = await prisma.referral.count({
      where: { referrerId: userId, status: 'verified' }
    });

    // Calculate commission (Aggregate instead of JS loop over partial set)
    const commissionResult = await prisma.referral.aggregate({
      where: { referrerId: userId, status: 'verified' },
      _sum: { commissionAmount: true }
    });
    const totalCommission = Number(commissionResult._sum.commissionAmount || 0);

    const pendingCount = totalReferrals - verifiedCount; // Approximation or separate query

    // Get referral chain (who referred me, who I referred)
    const chain = await getReferralChain(userId);

    // Get referral tree if requested
    let tree = null;
    if (includeTree) {
      tree = await getReferralTree(userId);
    }

    // Calculate stats
    // Stats are now calculated via optimized DB queries above

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
      pagination: {
        page,
        limit,
        total_pages: Math.ceil(totalReferrals / limit),
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

