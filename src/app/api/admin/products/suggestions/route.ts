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


    const userRole = authUser.role;
    if (userRole !== Role.ADMIN) {
      return NextResponse.json(
        { success: false, error: 'Forbidden' },
        { status: 403 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '30');

    const where: Record<string, any> = {};

    if (status) {
      where.status = status;
    }

    if (platform) {
      where.platform = platform;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        where.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate);
      }
    }

    const [suggestions, total] = await Promise.all([
      prisma.productSuggestion.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              phone: true,
              username: true,
              email: true,
            },
          },
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
      data: suggestions.map((suggestion) => ({
        id: suggestion.id,
        productName: suggestion.productName,
        platform: suggestion.platform,
        category: suggestion.category,
        amount: suggestion.amount ? Number(suggestion.amount) : null,
        orderId: suggestion.orderId,
        files: suggestion.files,
        status: suggestion.status,
        user: {
          id: suggestion.user.id,
          phone: suggestion.user.phone,
          username: suggestion.user.username,
          email: suggestion.user.email,
        },
        created_at: suggestion.createdAt.toISOString(),
        updated_at: suggestion.updatedAt.toISOString(),
      })),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching product suggestions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product suggestions' },
      { status: 500 },
    );
  }
}

