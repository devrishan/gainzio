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

        // Get all staff members (Admins, Verifiers, Payout Managers)
        const staff = await prisma.user.findMany({
            where: {
                role: {
                    in: [Role.ADMIN, Role.VERIFIER, Role.PAYOUT_MANAGER]
                }
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                last_login_at: true,
                createdAt: true,
            },
            orderBy: {
                role: 'asc', // Group by role roughly
            }
        });

        return NextResponse.json({
            success: true,
            staff: staff.map(user => ({
                ...user,
                createdAt: user.createdAt.toISOString(),
                lastLoginAt: user.last_login_at?.toISOString() || null,
            }))
        });

    } catch (error) {
        console.error('Error fetching staff:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch staff' },
            { status: 500 },
        );
    }
}
