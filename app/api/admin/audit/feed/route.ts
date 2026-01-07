import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const logs = await prisma.auditLog.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            actor: { select: { username: true, email: true } }
        }
    });

    return NextResponse.json({ success: true, logs });
}
