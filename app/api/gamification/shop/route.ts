import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { getShopItems, purchaseItem } from "@/services/gamification";

export async function GET(req: NextRequest) {
    try {
        const items = await getShopItems();
        return NextResponse.json(items);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const user = await getAuthenticatedUser(req);
        if (!user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const { itemId } = await req.json();
        if (!itemId) {
            return new NextResponse("Item ID required", { status: 400 });
        }

        const result = await purchaseItem(user.id, itemId);
        return NextResponse.json(result);

    } catch (error: any) {
        return new NextResponse(error.message || "Internal Error", { status: 400 });
    }
}
