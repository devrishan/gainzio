import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
    try {
        const admin = await getAuthenticatedUser(req);
        if (!admin || admin.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { title, body: messageBody, target, type } = body;

        if (!title || !messageBody) {
            return new NextResponse("Missing fields", { status: 400 });
        }

        // Determine target users
        let whereClause = {};
        if (target === "ALL") {
            whereClause = {};
        } else if (target === "PAID_MEMBERS") {
            whereClause = { rank: { not: "NEWBIE" } }; // Example logic
        }

        // We can't easily createMany with relations in a simple way if we need per-user logic, 
        // but for simple broadcasting we can fetch IDs then createMany Notifications
        const users = await prisma.user.findMany({
            where: whereClause,
            select: { id: true }
        });

        if (users.length === 0) {
            return NextResponse.json({ success: true, count: 0 });
        }

        const notifications = users.map(u => ({
            userId: u.id,
            type: type || "INFO", // INFO, SUCCESS, WARNING, ERROR
            title,
            body: messageBody,
            isRead: false
        }));

        // Batch create
        await prisma.notification.createMany({
            data: notifications
        });

        return NextResponse.json({ success: true, count: notifications.length });

    } catch (error) {
        console.error("Broadcast error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
