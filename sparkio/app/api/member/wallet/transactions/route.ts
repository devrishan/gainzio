import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '20');
    const type = searchParams.get('type');

    const where: any = {
      userId,
    };

    if (type) {
      where.type = type;
    }

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        take: perPage,
        skip: (page - 1) * perPage,
      }),
      prisma.walletTransaction.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      transactions: transactions.map((tx) => ({
        id: tx.id,
        amount: Number(tx.amount),
        type: tx.type,
        metadata: tx.metadata,
        created_at: tx.createdAt.toISOString(),
      })),
      pagination: {
        page,
        per_page: perPage,
        total,
        total_pages: Math.ceil(total / perPage),
      },
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 },
    );
  }
}

