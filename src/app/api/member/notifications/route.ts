import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = auth.userId;
        const limit = 20;

        const notifications = await prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: limit,
        });

        const unreadCount = await prisma.notification.count({
            where: { userId, isRead: false },
        });

        return NextResponse.json({
            notifications,
            unreadCount,
        });
    } catch (error) {
        console.error("[Notifications API] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const auth = await getAuthenticatedUser(request);
        if (!auth) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const userId = auth.userId;
        const body = await request.json();
        const { notificationIds } = body;

        if (!notificationIds || !Array.isArray(notificationIds)) {
            // Mark ALL as read if no IDs provided (Mark all as read)
            await prisma.notification.updateMany({
                where: { userId, isRead: false },
                data: { isRead: true }
            });
        } else {
            // Mark specific as read
            await prisma.notification.updateMany({
                where: { userId, id: { in: notificationIds } },
                data: { isRead: true }
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[Notifications API] Error:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
