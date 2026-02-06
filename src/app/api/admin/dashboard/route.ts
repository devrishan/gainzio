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

        const { searchParams } = new URL(request.url);
        const from = searchParams.get("from");
        const to = searchParams.get("to");

        let dateFilter: any = { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }; // Default 24h
        let revenueDateFilter: any = { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) };

        if (from && to) {
            dateFilter = {
                gte: new Date(from),
                lte: new Date(to)
            };
            revenueDateFilter = {
                gte: new Date(from),
                lte: new Date(to)
            }
        }

        // For total metrics (like total users), we might NOT want to filter by date range
        // unless we want "New Users in Range".
        // The UI requirement is usually "Total Users" (All time) vs "New Users" (In Range).
        // Let's adjust logic:
        // 1. Total Users -> Always All Time
        // 2. New Users -> filtered by date range (default 24h if not specified)
        // 3. Active Users -> filtered by last_login_at in date range
        // 4. Revenue -> filtered by processedAt in date range

        const [
            totalUsers,
            newUsersInPeriod,
            activeUsersInPeriod,
            pendingWithdrawals,
            totalEarningsPaid,
            revenueInPeriod
        ] = await Promise.all([
            // 1. Total Users (All Time)
            prisma.user.count({
                where: { role: Role.USER }
            }),
            // 2. New Users (In Period)
            prisma.user.count({
                where: {
                    role: Role.USER,
                    createdAt: dateFilter
                }
            }),
            // 3. Active Users (In Period)
            prisma.user.count({
                where: {
                    role: Role.USER,
                    last_login_at: dateFilter
                }
            }),
            // 4. Pending Withdrawals (Current State, not date dependent usually)
            prisma.withdrawal.aggregate({
                where: { status: WithdrawalStatus.PENDING },
                _count: true,
                _sum: { amount: true }
            }),
            // 5. Total Earnings Paid (All Time)
            prisma.withdrawal.aggregate({
                where: { status: WithdrawalStatus.COMPLETED },
                _sum: { amount: true }
            }),
            // 6. Revenue/Payouts (In Period)
            prisma.withdrawal.aggregate({
                where: {
                    status: WithdrawalStatus.COMPLETED,
                    processedAt: revenueDateFilter
                },
                _sum: { amount: true }
            })
        ]);

        return NextResponse.json({
            success: true,
            metrics: {
                total_users: totalUsers,
                new_users_24h: newUsersInPeriod, // Label says 24h but now it's "in period"
                active_users_24h: activeUsersInPeriod,
                pending_withdrawals: {
                    count: pendingWithdrawals._count,
                    amount: Number(pendingWithdrawals._sum.amount || 0)
                },
                total_earnings_paid: Number(totalEarningsPaid._sum.amount || 0),
                revenue_24h: Number(revenueInPeriod._sum.amount || 0)
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
