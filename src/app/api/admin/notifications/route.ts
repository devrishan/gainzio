import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/api-auth';
export const dynamic = 'force-dynamic';
import { prisma } from '@/lib/prisma';
import { Role, NotificationType } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const body = await request.json();
        const { userId, title, message } = body;

        if (!userId || !title || !message) {
            return NextResponse.json(
                { success: false, error: 'Missing required fields' },
                { status: 400 }
            );
        }

        if (userId === "ALL") {
            return NextResponse.json(
                { success: false, error: 'Broadcast not yet supported via this endpoint' },
                { status: 501 }
            );
        }

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) {
            return NextResponse.json(
                { success: false, error: 'User not found' },
                { status: 404 }
            );
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                type: NotificationType.STREAK_WARNING, // Using as generic for now
                title,
                body: message,
                isRead: false,
                data: { from: 'admin_dashboard' }
            }
        });

        return NextResponse.json({ success: true, notification });

    } catch (error) {
        console.error('Error sending notification:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send notification' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser || authUser.role !== Role.ADMIN) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 403 }
            );
        }

        const notifications = await prisma.notification.findMany({
            take: 50,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: { username: true, email: true }
                }
            }
        });

        return NextResponse.json({ success: true, notifications });

    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch notifications' },
            { status: 500 }
        );
    }
}
