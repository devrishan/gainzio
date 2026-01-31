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

        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            newUsers24h,
            activeUsers24h,
            pendingWithdrawals,
            totalEarningsPaid,
            revenue24h
        ] = await Promise.all([
            // 1. Total Users
            prisma.user.count({
                where: { role: Role.USER }
            }),
            // 2. New Users (24h)
            prisma.user.count({
                where: {
                    role: Role.USER,
                    createdAt: { gte: oneDayAgo }
                }
            }),
            // 3. Active Users (24h) - based on last_login_at
            prisma.user.count({
                where: {
                    role: Role.USER,
                    last_login_at: { gte: oneDayAgo }
                }
            }),
            // 4. Pending Withdrawals
            prisma.withdrawal.aggregate({
                where: { status: WithdrawalStatus.PENDING },
                _count: true,
                _sum: { amount: true }
            }),
            // 5. Total Earnings Paid
            prisma.withdrawal.aggregate({
                where: { status: WithdrawalStatus.COMPLETED },
                _sum: { amount: true }
            }),
            // 6. Revenue/Payouts (24h)
            prisma.withdrawal.aggregate({
                where: {
                    status: WithdrawalStatus.COMPLETED,
                    processedAt: { gte: oneDayAgo }
                },
                _sum: { amount: true }
            })
        ]);

        return NextResponse.json({
            success: true,
            metrics: {
                total_users: totalUsers,
                new_users_24h: newUsers24h,
                active_users_24h: activeUsers24h,
                pending_withdrawals: {
                    count: pendingWithdrawals._count,
                    amount: Number(pendingWithdrawals._sum.amount || 0)
                },
                total_earnings_paid: Number(totalEarningsPaid._sum.amount || 0),
                revenue_24h: Number(revenue24h._sum.amount || 0)
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
