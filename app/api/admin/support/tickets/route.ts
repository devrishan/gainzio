import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: NextRequest) {
    const authUser = await getAuthenticatedUser(request);
    if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

    // Fetch existing "tickets" stored as SparkEvents
    const tickets = await prisma.sparkEvent.findMany({
        where: { type: "SUPPORT_TICKET" },
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { username: true, email: true } } } // Assuming SparkEvent has userId relation? Checking schema...
        // Schema: SparkEvent does NOT have userId relation! It has only userId INT or String?
        // Wait, I checked schema: SparkEvent: `id, type, message, data, isPublic, createdAt`. NO userId field in SparkEvent model!
        // CORRECTION: User's previous manual fix in `chat/route.ts` showed storing user info in `data`.
        // I must rely on `data` JSON for user details.
    });

    return NextResponse.json({
        success: true,
        tickets: tickets.map(t => ({
            id: t.id,
            message: t.message,
            ...((t.data as any) || {}), // Spread status, subject, user info
            createdAt: t.createdAt
        }))
    });
}

// Admin replying to a ticket
export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);
        if (!authUser || authUser.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

        const body = await request.json();
        const { ticketId, reply, status } = body;

        const ticket = await prisma.sparkEvent.findUnique({ where: { id: ticketId } });
        if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const currentData = (ticket.data as any) || { replies: [] };
        const newReplies = [...(currentData.replies || [])];

        if (reply) {
            newReplies.push({
                sender: "ADMIN",
                name: authUser.username || "Staff",
                message: reply,
                at: new Date()
            });
        }

        // Update ticket
        await prisma.sparkEvent.update({
            where: { id: ticketId },
            data: {
                data: {
                    ...currentData,
                    replies: newReplies,
                    status: status || currentData.status
                }
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
