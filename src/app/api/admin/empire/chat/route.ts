import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

// Simple chat using SparkEvent as a store for messages
export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    const messages = await prisma.sparkEvent.findMany({
        where: { type: "ADMIN_CHAT" },
        orderBy: { createdAt: 'asc' }, // Oldest to newest
        take: 50
    });

    return NextResponse.json({
        success: true,
        messages: messages.map(m => ({
            ...m,
            user: { username: (m.data as any)?.username || "Admin" }
        }))
    });
}

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const { message } = await request.json();

        const chat = await prisma.sparkEvent.create({
            data: {
                type: "ADMIN_CHAT",
                message,
                data: { username: authUser.username, userId: authUser.id },
                createdAt: new Date()
            }
        });

        return NextResponse.json({ success: true, chat });

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
