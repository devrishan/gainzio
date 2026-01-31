import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET: List all badges
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const badges = await prisma.badge.findMany({
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(badges);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Create new badge
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { code, name, description, icon } = body;

        // Check if code exists
        const existing = await prisma.badge.findUnique({
            where: { code }
        });

        if (existing) {
            return NextResponse.json({ error: "Badge code already exists" }, { status: 400 });
        }

        const newBadge = await prisma.badge.create({
            data: {
                code: code.toUpperCase().replace(/\s+/g, '_'),
                name,
                description,
                icon: icon || 'Award'
            }
        });

        return NextResponse.json(newBadge);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PUT: Update badge
export async function PUT(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { id, name, description, icon } = body;

        const updatedBadge = await prisma.badge.update({
            where: { id },
            data: {
                name,
                description,
                icon
            }
        });

        return NextResponse.json(updatedBadge);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
