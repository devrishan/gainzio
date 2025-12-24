import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';
import { verifyAccessToken } from '@/lib/jwt';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies();
    const accessToken = cookieStore.get('earniq_access_token')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Unauthenticated' },
        { status: 401 },
      );
    }

    let userId: string;
    try {
      const payload = await verifyAccessToken(accessToken);
      userId = payload.sub;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Invalid token' },
        { status: 401 },
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const platform = searchParams.get('platform');

    const where: any = {
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

