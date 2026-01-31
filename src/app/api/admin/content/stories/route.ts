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
        const { message, color, duration } = body; // color: "blue", "red", etc.

        const story = await prisma.sparkEvent.create({
            data: {
                type: "STORY",
                message,
                data: { color, duration: Number(duration) || 24 }, // duration in hours
                isPublic: true,
                createdAt: new Date()
            }
        });

        return NextResponse.json({ success: true, story });

    } catch (error) {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    // Get active stories (last 24h)
    const yesterday = new Date();
    yesterday.setHours(yesterday.getHours() - 24);

    const stories = await prisma.sparkEvent.findMany({
        where: {
            type: "STORY",
            createdAt: { gte: yesterday }
        },
        orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ success: true, stories });
}
