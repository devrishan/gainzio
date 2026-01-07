import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { code, value, maxUses, expiresAt } = body;

        if (!code || !value) return NextResponse.json({ error: 'Missing code or value' }, { status: 400 });

        const promo = await prisma.promoCode.create({
            data: {
                code: code.toUpperCase(),
                value: Number(value),
                maxUses: Number(maxUses) || 1,
                expiresAt: expiresAt ? new Date(expiresAt) : null,
                createdBy: authUser.id
            }
        });

        return NextResponse.json({ success: true, promo });

    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Code already exists' }, { status: 400 });
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const promos = await prisma.promoCode.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return NextResponse.json({ success: true, promos });
}
