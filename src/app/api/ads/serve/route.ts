import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const zoneSlug = searchParams.get("zoneSlug");

        if (!zoneSlug) {
            return NextResponse.json({ error: "Missing zoneSlug" }, { status: 400 });
        }

        // Find active campaigns for this zone
        // That are within date range
        // That have budget remaining
        const campaigns = await prisma.adCampaign.findMany({
            where: {
                isActive: true,
                zones: {
                    some: {
                        slug: zoneSlug,
                        isActive: true
                    }
                },
                startDate: {
                    lte: new Date(),
                },
                OR: [
                    { endDate: null },
                    { endDate: { gte: new Date() } }
                ]
            },
            include: {
                zones: true
            }
        });

        // Filter by budget (in-memory to handle complicated budget logic if needed, 
        // or we can optimize query later)
        const eligibleCampaigns = campaigns.filter(c => {
            if (c.totalBudget && c.views >= c.totalBudget) return false;
            // Daily budget logic could be added here (needs daily view count, usually stored separately or aggregated)
            // For mvp, we skip strict daily budget check or assume simplistic total budget check
            return true;
        });

        if (eligibleCampaigns.length === 0) {
            return NextResponse.json({ ad: null });
        }

        // Random selection (can be weighted later)
        const selectedFactor = Math.floor(Math.random() * eligibleCampaigns.length);
        const selectedAd = eligibleCampaigns[selectedFactor];

        return NextResponse.json({
            ad: {
                id: selectedAd.id,
                imageUrl: selectedAd.imageUrl,
                targetUrl: selectedAd.targetUrl,
                name: selectedAd.name
            }
        });

    } catch (error) {
        console.error("[ADS_SERVE]", error);
        return NextResponse.json({ error: "Internal error" }, { status: 500 });
    }
}
