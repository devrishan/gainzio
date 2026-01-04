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
        const status = searchParams.get('status');

        const where: Record<string, any> = {};
        if (status) {
            where.status = status;
        }

        const [suggestions, total] = await Promise.all([
            prisma.productSuggestion.findMany({
                where,
                include: {
                    user: {
                        select: {
                            username: true,
                            email: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc',
                },
                take: perPage,
                skip: (page - 1) * perPage,
            }),
            prisma.productSuggestion.count({ where }),
        ]);

        return NextResponse.json({
            success: true,
            products: suggestions.map(product => ({
                id: product.id,
                productName: product.productName,
                platform: product.platform,
                category: product.category,
                amount: Number(product.amount || 0),
                status: product.status,
                user: {
                    username: product.user.username,
                    email: product.user.email
                },
                createdAt: product.createdAt.toISOString()
            })),
            pagination: {
                page,
                per_page: perPage,
                total,
                total_pages: Math.ceil(total / perPage),
            },
        });

    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch products' },
            { status: 500 },
        );
    }
}
