import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role, WithdrawalStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
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

        const [
            totalUsers,
            pendingWithdrawals,
            totalEarningsPaid
        ] = await Promise.all([
            prisma.user.count({
                where: { role: Role.USER }
            }),
            prisma.withdrawal.aggregate({
                where: { status: WithdrawalStatus.PENDING },
                _count: true,
                _sum: { amount: true }
            }),
            prisma.withdrawal.aggregate({
                where: { status: WithdrawalStatus.COMPLETED },
                _sum: { amount: true }
            })
        ]);

        return NextResponse.json({
            success: true,
            metrics: {
                total_users: totalUsers,
                pending_withdrawals: {
                    count: pendingWithdrawals._count,
                    amount: Number(pendingWithdrawals._sum.amount || 0)
                },
                total_earnings_paid: Number(totalEarningsPaid._sum.amount || 0)
            }
        });

    } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch dashboard metrics' },
            { status: 500 },
        );
    }
}
