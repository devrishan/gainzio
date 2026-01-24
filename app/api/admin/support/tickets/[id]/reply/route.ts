import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { message } = body;

        // Use params.id directly in server components/routes in Next 13/14+ 
        // Wait, params is usually awaited or just passed as is. Next.js 15 requires await params?
        // Let's assume params is available.
        const ticketId = params.id;

        if (!message) return new NextResponse("Message required", { status: 400 });

        // Transaction: Create message, update ticket status
        const result = await prisma.$transaction([
            prisma.supportMessage.create({
                data: {
                    ticketId,
                    senderId: user.id,
                    message
                }
            }),
            prisma.supportTicket.update({
                where: { id: ticketId },
                data: {
                    status: "ANSWERED",
                    updatedAt: new Date()
                }
            })
        ]);

        return NextResponse.json(result[0]);

    } catch (error) {
        console.error("Reply error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
