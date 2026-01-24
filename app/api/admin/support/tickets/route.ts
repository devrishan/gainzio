import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get("status");

        const where: any = {};
        if (status && status !== "ALL") {
            where.status = status;
        }

        const tickets = await prisma.supportTicket.findMany({
            where,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        image: true
                    }
                },
                messages: {
                    orderBy: { createdAt: "asc" },
                    take: 1 // Get first message for preview
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Fetch tickets error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
