import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        // 1. Activate Scheduled Tasks
        const now = new Date();

        const activated = await prisma.task.updateMany({
            where: {
                status: "SCHEDULED",
                startTime: {
                    lte: now
                }
            },
            data: {
                status: "ACTIVE"
            }
        });

        // 2. Expire Old Tasks
        // If they are Active but expired
        const expired = await prisma.task.updateMany({
            where: {
                status: "ACTIVE",
                expiresAt: {
                    lte: now
                }
            },
            data: {
                status: "COMPLETED"
            }
        });

        return NextResponse.json({
            success: true,
            activated: activated.count,
            expired: expired.count,
            timestamp: now.toISOString()
        });
    } catch (error) {
        console.error("[CRON_TASK_ACTIVATION_ERROR]", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
