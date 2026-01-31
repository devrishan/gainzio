import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { z } from "zod";

const updateUsernameSchema = z.object({
    username: z
        .string()
        .min(4, "Username must be at least 4 characters.")
        .max(20, "Username must be at most 20 characters.")
        .trim()
        .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores."),
});

export async function POST(request: NextRequest) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const parsed = updateUsernameSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid username format." }, { status: 400 });
    }

    const newUsername = parsed.data.username;

    try {
        // 1. Check 30-day limit
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentChange = await prisma.activityLog.findFirst({
            where: {
                userId: user.userId,
                action: "USERNAME_CHANGE",
                createdAt: {
                    gt: thirtyDaysAgo,
                },
            },
        });

        if (recentChange) {
            // Calculate days remaining
            const nextChangeDate = new Date(recentChange.createdAt);
            nextChangeDate.setDate(nextChangeDate.getDate() + 30);
            const daysRemaining = Math.ceil((nextChangeDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

            return NextResponse.json({
                error: `Unable to update username. Try again in ${daysRemaining} days.`
            }, { status: 400 });
        }

        // 2. Check Uniqueness
        const existing = await prisma.user.findUnique({
            where: { username: newUsername },
        });

        if (existing) {
            return NextResponse.json({ error: "Unable to update username. Try another." }, { status: 400 });
        }

        // 3. Update
        await prisma.$transaction([
            prisma.user.update({
                where: { id: user.userId },
                data: { username: newUsername },
            }),
            prisma.activityLog.create({
                data: {
                    userId: user.userId,
                    action: "USERNAME_CHANGE",
                    metadata: { old_username: "unknown", new_username: newUsername }, // We don't fetch old one to save a query, or we could if needed.
                },
            }),
        ]);

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Username update error:", error);
        return NextResponse.json({ error: "Unable to update username." }, { status: 500 });
    }
}
