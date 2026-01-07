
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        // Fetch user's tickets
        // Using Prisma's JSON filtering for Postgres
        const tickets = await prisma.sparkEvent.findMany({
            where: {
                type: "SUPPORT_TICKET",
                data: {
                    path: ['userId'],
                    equals: user.id
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ tickets });
    } catch (error) {
        console.error("Error fetching support tickets:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { subject, message, priority } = body;

        if (!subject || !message) {
            return NextResponse.json({ error: 'Subject and message are required' }, { status: 400 });
        }

        const ticket = await prisma.sparkEvent.create({
            data: {
                type: "SUPPORT_TICKET",
                message: subject, // Use subject as main message for identification
                isPublic: false,
                data: {
                    subject,
                    description: message,
                    userId: user.id,
                    username: user.username || "User",
                    email: user.email || "",
                    status: "OPEN",
                    priority: priority || "NORMAL",
                    replies: []
                }
            }
        });

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        console.error("Error creating support ticket:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
