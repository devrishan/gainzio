import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/api-auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // Fetch recent public spark events
        // Limit to last 20 events
        const events = await prisma.sparkEvent.findMany({
            where: {
                isPublic: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20,
        });

        return NextResponse.json({ success: true, events });
    } catch (error) {
        console.error('Error fetching spark wall:', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}
