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
        const { type, value, reason } = body;
        // type: IP, EMAIL, WALLET

        if (!type || !value) return NextResponse.json({ error: 'Missing type or value' }, { status: 400 });

        const entry = await prisma.blacklist.create({
            data: {
                type,
                value,
                reason,
                createdBy: authUser.id
            }
        });

        // Optional: If banning User/IP, we could actively lock related users here.
        // For now, just adding to DB.

        return NextResponse.json({ success: true, entry });

    } catch (e: any) {
        if (e.code === 'P2002') return NextResponse.json({ error: 'Already blacklisted' }, { status: 400 });
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const blacklist = await prisma.blacklist.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return NextResponse.json({ success: true, blacklist });
}
