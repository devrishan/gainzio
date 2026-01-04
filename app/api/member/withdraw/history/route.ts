import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from '@/lib/api-auth';
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthenticatedUser(request);

        if (!authUser) {
            return NextResponse.json(
                { success: false, error: 'Unauthenticated' },
                { status: 401 },
            );
        }

        const withdrawals = await prisma.withdrawal.findMany({
            where: {
                userId: authUser.userId,
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
