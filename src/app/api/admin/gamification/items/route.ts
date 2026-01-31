import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET: List all items
export async function GET(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const items = await prisma.shopItem.findMany({
            orderBy: { cost: 'asc' }
        });

        return NextResponse.json(items);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// POST: Create new item
export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, description, cost, type, icon } = body;

        const newItem = await prisma.shopItem.create({
            data: {
                name,
                description,
                cost: Number(cost),
                type, // PERK, CONSUMABLE, COSMETIC
                icon: icon || 'Gift',
                isActive: true
            }
        });

        return NextResponse.json(newItem);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

// PUT: Update item
export async function PUT(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user || user.role !== "ADMIN") {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { id, ...updates } = body;

        const updatedItem = await prisma.shopItem.update({
            where: { id },
            data: {
                ...updates,
                cost: updates.cost ? Number(updates.cost) : undefined
            }
        });

        return NextResponse.json(updatedItem);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
