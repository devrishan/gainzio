
import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from '@/lib/prisma';
import { SparkEvent } from '@prisma/client';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { ticketId: string } }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { ticketId } = params;

        const ticket = await prisma.sparkEvent.findUnique({
            where: { id: ticketId }
        });

        if (!ticket) return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });

        // Security check: ensure this ticket belongs to the user
        const ticketData = ticket.data as any;
        if (ticketData?.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        return NextResponse.json({ ticket });
    } catch (error) {
        console.error("Error fetching ticket:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: { ticketId: string } }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { ticketId } = params;
        const body = await request.json();
        const { message } = body;

        if (!message) return NextResponse.json({ error: 'Message is required' }, { status: 400 });

        const ticket = await prisma.sparkEvent.findUnique({ where: { id: ticketId } });
        if (!ticket) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        // Security check
        const currentData = (ticket.data as any) || {};
        if (currentData.userId !== user.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const newReplies = [...(currentData.replies || [])];
        newReplies.push({
            sender: "USER",
            name: user.username || "You",
            message: message,
            at: new Date()
        });

        const updatedTicket = await prisma.sparkEvent.update({
            where: { id: ticketId },
            data: {
                data: {
                    ...currentData,
                    replies: newReplies,
                    // If user replies, maybe set status to OPEN if it was closed? 
                    // Or "PENDING_ADMIN_ACTION"? Let's just keep it simple.
                    status: currentData.status === 'CLOSED' ? 'OPEN' : currentData.status
                }
            }
        });

        return NextResponse.json({ success: true, ticket: updatedTicket });

    } catch (error) {
        console.error("Error replying to ticket:", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
