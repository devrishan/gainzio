import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const admin = await getAuthenticatedUser(req);
        if (!admin || admin.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = params.id;
        const body = await req.json();
        const { action } = body;

        if (!action) {
            return new NextResponse("Missing action", { status: 400 });
        }

        let updateData = {};
        let logAction = "";

        switch (action) {
            case "VERIFY":
                updateData = { verificationLevel: 3 };
                logAction = "USER_VERIFIED";
                break;
            case "SUSPEND":
                updateData = { is_locked: true, lock_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }; // 7 days lock
                logAction = "USER_SUSPENDED";
                break;
            case "UNSUSPEND":
                updateData = { is_locked: false, lock_until: null };
                logAction = "USER_UNSUSPENDED";
                break;
            case "BAN":
                updateData = { isDeleted: true, deletedAt: new Date() };
                logAction = "USER_BANNED";
                break;
            default:
                return new NextResponse("Invalid action", { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: updateData,
        });

        // Log the action (Audit Log)
        await prisma.activityLog.create({
            data: {
                action: logAction,
                userId: admin.id, // Admin performed the action
                entityType: "USER",
                entityId: userId,
                metadata: { targetUser: userId, action }
            }
        });

        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error("Error performing member action:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
