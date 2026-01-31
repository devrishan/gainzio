import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthenticatedUser(request);

    if (!authUser) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    // Use the ID from the helper
    const userId = authUser.userId;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    const where: Record<string, any> = {
      userId: userId,
    };

    if (status) {
      where.status = status;
    }

    if (platform) {
      where.platform = platform;
    }

    const suggestions = await prisma.productSuggestion.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      success: true,
      products: suggestions.map((suggestion) => ({
        id: suggestion.id,
        productName: suggestion.productName,
        platform: suggestion.platform,
        category: suggestion.category,
        amount: suggestion.amount ? Number(suggestion.amount) : null,
        orderId: suggestion.orderId,
        files: suggestion.files,
        status: suggestion.status,
        created_at: suggestion.createdAt.toISOString(),
        updated_at: suggestion.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 },
    );
  }
}

