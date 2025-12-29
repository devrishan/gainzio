import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const user = await getAuthUser();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const withdrawals = await prisma.withdrawal.findMany({
            where: {
                userId: user.id,
            },
            orderBy: {
                requestedAt: "desc",
            },
        });

        return NextResponse.json({ success: true, withdrawals });
    } catch (error) {
        console.error("Failed to fetch withdrawal history:", error);
        return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
    }
}
