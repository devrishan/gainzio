
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

        if (authUser.role !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 },
            );
        }

        const suggestions = await prisma.productSuggestion.findMany({
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    }
                }
            },
            orderBy: {
                createdAt: 'desc',
            }
        });

        return NextResponse.json({
            success: true,
            suggestions
        });

    } catch (error) {
        console.error('Error fetching suggestions:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch suggestions' },
            { status: 500 },
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'Forbidden' },
                { status: 403 },
            );
        }

        const body = await request.json();
        const { id, status, notes } = body;

        if (!id || !status) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 },
            );
        }

        const updatedSuggestion = await prisma.productSuggestion.update({
            where: { id },
            data: {
                status,
                metadata: notes ? { notes } : undefined, // Simple metadata update for now
            }
        });

        return NextResponse.json({
            success: true,
            suggestion: updatedSuggestion
        });

    } catch (error) {
        console.error('Error updating suggestion:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to update suggestion' },
            { status: 500 },
        );
    }
}
