import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

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

        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const perPage = parseInt(searchParams.get('per_page') || '20');
        const search = searchParams.get('search') || '';

        const where: Record<string, any> = {};

        if (search) {
            where.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { phone: { contains: search, mode: 'insensitive' } },
            ];
        }

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    phone: true,
                    role: true,
                    status: true,
                    walletBalance: true,
                    createdAt: true,
                    lastLoginAt: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: perPage,
                skip: (page - 1) * perPage,
            }),
            prisma.user.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            users: users.map(user => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
                lastLoginAt: user.lastLoginAt?.toISOString() || null,
                walletBalance: Number(user.walletBalance)
            })),
            pagination: {
                page,
                per_page: perPage,
                total,
                total_pages: Math.ceil(total / perPage),
            },
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch members' },
            { status: 500 },
        );
    }
}
