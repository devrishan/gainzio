import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN" && user.role !== "PAYOUT_MANAGER") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { ids, action } = body; // action: APPROVED, REJECTED, PROCESSING

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return new NextResponse("No IDs provided", { status: 400 });
        }

        // Map string action to enum if needed, or assume frontend sends correct enum string
        // Enum values are: PENDING, APPROVED, REJECTED, PROCESSING, COMPLETED, FAILED, CANCELLED

        const result = await prisma.withdrawal.updateMany({
            where: {
                id: { in: ids }
            },
            data: {
                status: action,
                updatedAt: new Date()
            }
        });

        // We should also log this batch action
        await prisma.activityLog.create({
            data: {
                userId: user.id,
                action: "BATCH_WITHDRAWAL_UPDATE",
                entityType: "WITHDRAWAL",
                metadata: { count: result.count, targetIds: ids, newStatus: action }
            }
        });

        return NextResponse.json({ success: true, count: result.count });

    } catch (error) {
        console.error("Batch payout error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
