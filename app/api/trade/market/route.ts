import { NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

// Initial baseline prices
const BASE_PRICES = {
    BTC: 65000,
    ETH: 3500,
    SOL: 140
};

// Simulate volatility
const VOLATILITY = {
    BTC: 0.002, // 0.2% variance
    ETH: 0.003,
    SOL: 0.005
};

// Simple pseudo-random walk
// In a real app, you might persist this to DB so all users see the same price
// For this demo, we'll generate it on the fly or maybe use a global variable if Next.js allows (it doesn't persist across lambdas)
// Ideally we'd fetch from DB 'AssetPrice', update it, and return it.

import { prisma } from "@/lib/prisma";

export async function GET() {
    try {
        // Fetch current prices from DB, or seed if missing
        let assets = await prisma.assetPrice.findMany();

        if (assets.length === 0) {
            // Seed initial
            const seed = Object.entries(BASE_PRICES).map(([symbol, price]) => ({
                symbol,
                price: price
            }));

            await prisma.assetPrice.createMany({ data: seed });
            assets = await prisma.assetPrice.findMany();
        }

        // Update prices with random walk
        const updates = assets.map(asset => {
            const sym = asset.symbol as keyof typeof VOLATILITY;
            const current = Number(asset.price);
            const change = current * VOLATILITY[sym] * (Math.random() - 0.5);
            const newPrice = current + change;

            return prisma.assetPrice.update({
                where: { id: asset.id },
                data: {
                    price: newPrice,
                    lastUpdated: new Date()
                }
            });
        });

        const newPrices = await prisma.$transaction(updates);

        // Format for frontend
        const response = newPrices.reduce((acc, asset) => {
            acc[asset.symbol] = {
                price: Number(asset.price).toFixed(2),
                change24h: ((Math.random() * 5) - 2).toFixed(2) // Fake 24h change for UI
            };
            return acc;
        }, {} as Record<string, any>);

        return NextResponse.json(response);
    } catch (error) {
        console.error("Market data error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
