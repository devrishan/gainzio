
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const verifySchema = z.object({
    identifiers: z.array(z.object({
        type: z.enum(["email", "username", "phone"]),
        value: z.string()
    })).min(2).max(2)
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { identifiers } = verifySchema.parse(body);

        const [id1, id2] = identifiers;

        // Find users for both identifiers
        const user1 = await findUserBy(id1.type, id1.value);
        const user2 = await findUserBy(id2.type, id2.value);

        // Check if both exist and are the SAME user
        if (!user1 || !user2 || user1.id !== user2.id) {
            // Generic error
            return NextResponse.json(
                { error: "Provided details do not match our records." },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            userId: user1.id // In production, consider signing this or using a temp token instead of raw ID
        });

    } catch (error) {
        return NextResponse.json(
            { error: "Invalid request" },
            { status: 400 }
        );
    }
}

async function findUserBy(type: string, value: string) {
    if (type === "email") return prisma.user.findUnique({ where: { email: value } });
    if (type === "username") return prisma.user.findUnique({ where: { username: value } });
    if (type === "phone") return prisma.user.findUnique({ where: { phone: value } });
    return null;
}
