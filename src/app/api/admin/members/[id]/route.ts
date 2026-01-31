
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthenticated' },
                { status: 401 },
            );
        }

        // Authorization Check
        const userRole = authUser.role;
        if (userRole !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 },
            );
        }

        const userId = params.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                role: true,
                is_locked: true,
                isDeleted: true,
                wallet: {
                    select: {
                        balance: true,
                        totalEarned: true,
                    }
                },
                createdAt: true,
                last_login_at: true,
                referralCode: true,
                referredBy: {
                    select: {
                        id: true,
                        username: true,
                    }
                },
                _count: {
                    select: {
                        referrals: true,
                        submissions: true,
                        withdrawals: true,
                    }
                }
            },
        });

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 },
            );
        }

        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone,
                role: user.role,
                status: user.isDeleted ? 'Deleted' : (user.is_locked ? 'Locked' : 'Active'),
                walletBalance: user.wallet ? Number(user.wallet.balance) : 0,
                totalEarnings: user.wallet ? Number(user.wallet.totalEarned) : 0,
                createdAt: user.createdAt.toISOString(),
                lastLoginAt: user.last_login_at?.toISOString() || null,
                referralCode: user.referralCode,
                referredBy: user.referredBy,
                stats: {
                    referrals: user._count.referrals,
                    tasks: user._count.submissions,
                    withdrawals: user._count.withdrawals,
                }
            },
        });
    } catch (error) {
        console.error('Error fetching member details:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch member details' },
            { status: 500 },
        );
    }
}
