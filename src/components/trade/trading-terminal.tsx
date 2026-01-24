"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TrendingUp, TrendingDown, RefreshCw, Loader2, ArrowUpRight, ArrowDownRight, Wallet, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";

const COINS = ["BTC", "ETH", "SOL"];

export function TradingTerminal() {
    const [selectedCoin, setSelectedCoin] = useState("BTC");
    const [leverage, setLeverage] = useState([10]); // Default 10x
    const [margin, setMargin] = useState(100);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const queryClient = useQueryClient();

    // -- 1. Market Data Polling --
    const { data: marketData } = useQuery({
        queryKey: ["market-prices"],
        queryFn: async () => {
            const res = await fetch("/api/trade/market");
            return await res.json();
        },
        refetchInterval: 3000 // Poll every 3s
    });

    const currentPrice = marketData?.[selectedCoin]?.price || 0;
    const priceChange = marketData?.[selectedCoin]?.change24h || 0;

    // -- 2. Chart Drawing (Simple Simulated) --
    // We just draw a random line that ends at current price for visual flair
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        ctx.strokeStyle = priceChange >= 0 ? '#10b981' : '#ef4444'; // Green or Red
        ctx.lineWidth = 2;
        ctx.beginPath();
        let y = h / 2;
        ctx.moveTo(0, y);

        // Draw 50 points
        for (let x = 0; x <= w; x += w / 50) {
            y += (Math.random() - 0.5) * 20;
            // Clamp
            y = Math.min(Math.max(y, 10), h - 10);
            ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Gradient below
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, priceChange >= 0 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.fill();

    }, [currentPrice, priceChange]); // Re-draw on price update

    // -- 3. Order Execution --
    const placeOrderMutation = useMutation({
        mutationFn: async (type: "LONG" | "SHORT") => {
            const res = await fetch("/api/trade/order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    symbol: selectedCoin,
                    type,
                    leverage: leverage[0],
                    margin: Number(margin)
                })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Order failed");
            return data;
        },
        onSuccess: () => {
            toast.success("Position Opened!");
            queryClient.invalidateQueries({ queryKey: ["my-positions"] });
            // Should also invalidate user balance/xp
        },
        onError: () => toast.error("Insufficient Balance or Error")
    });

    // -- 4. My Positions --
    // We need an endpoint for this, or just filter from all positions/orders?
    // Let's assume we can add a simple GET to /api/trade/order for "my open positions" 
    // Wait, I didn't create a GET for /api/trade/order. I should probably do that or use a server action or include it in market data?
    // Let's create a quick valid query using Prisma directly in a server component usually, but this is a client component.
    // I will mock the list or I need to add GET to order route.
    // Plan: I will add GET to /api/trade/order now quickly via another tool call OR simply assume the user will ask for it. 
    // Better: I will Update the /api/trade/order file to include GET.
    // BUT first let's finish the UI structure.

    // Placeholder positions for UI structure until API is ready
    const { data: positions } = useQuery({
        queryKey: ["my-positions"],
        queryFn: async () => {
            // This will fail 405 Method Not Allowed until I add GET. 
            // I'll add GET in next step.
            const res = await fetch("/api/trade/order");
            if (!res.ok) return [];
            return await res.json();
        }
    });

    const closePositionMutation = useMutation({
        mutationFn: async (positionId: string) => {
            const res = await fetch("/api/trade/order", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ positionId })
            });
            if (!res.ok) throw new Error("Failed close");
            return await res.json();
        },
        onSuccess: (data) => {
            toast.success(`Closed! PnL: ${data.pnl} XP`);
            queryClient.invalidateQueries({ queryKey: ["my-positions"] });
        }
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart & Market Info */}
            <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between p-4 bg-zinc-900/50 rounded-xl border border-white/5 backdrop-blur-md">
                    <div className="flex gap-4">
                        {COINS.map(c => (
                            <button
                                key={c}
                                onClick={() => setSelectedCoin(c)}
                                className={`px-4 py-2 rounded-lg font-bold transition-all ${selectedCoin === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:bg-white/5'}`}
                            >
                                {c}
                            </button>
                        ))}
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-black font-mono tracking-tight text-white">
                            ${currentPrice ? Number(currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2 }) : "---"}
                        </div>
                        <div className={`flex items-center justify-end text-sm font-bold ${Number(priceChange) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {Number(priceChange) >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                            {priceChange}%
                        </div>
                    </div>
                </div>

                <div className="relative h-[400px] w-full bg-zinc-950 rounded-xl border border-white/5 overflow-hidden group">
                    <canvas ref={canvasRef} width={800} height={400} className="w-full h-full object-cover opacity-80" />
                    <div className="absolute top-4 left-4 text-xs text-zinc-500 font-mono">
                        LIVE MARKET FEED • SIMULATED
                    </div>
                </div>

                {/* Open Positions List */}
                <Card className="bg-zinc-900/50 border-white/5">
                    <div className="p-4 border-b border-white/5 flex items-center gap-2">
                        <History className="h-4 w-4 text-zinc-400" />
                        <h3 className="font-bold text-zinc-300">Open Positions</h3>
                    </div>
                    <div className="p-2 space-y-2">
                        {/* We will map positions here */}
                        {positions?.length > 0 ? positions.map((pos: any) => (
                            <div key={pos.id} className="flex items-center justify-between p-3 bg-black/20 rounded border border-white/5">
                                <div className="flex items-center gap-3">
                                    <Badge variant="outline" className={pos.type === 'LONG' ? 'border-emerald-500 text-emerald-500' : 'border-rose-500 text-rose-500'}>
                                        {pos.type} {pos.leverage}x
                                    </Badge>
                                    <div>
                                        <div className="font-bold text-sm text-zinc-300">{pos.symbol}</div>
                                        <div className="text-xs text-zinc-500">Entry: ${pos.entryPrice}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* Fake PnL calc for UI update speed, normally handled by server or robust polling */}
                                    {/* <div className="font-mono text-emerald-400">+500 XP</div> */}
                                    <Button size="sm" variant="destructive" className="h-7 text-xs" onClick={() => closePositionMutation.mutate(pos.id)}>
                                        Close
                                    </Button>
                                </div>
                            </div>
                        )) : <div className="text-center py-8 text-zinc-500 text-sm">No active positions</div>}
                    </div>
                </Card>
            </div>

            {/* Order Form */}
            <div className="lg:col-span-1">
                <Card className="h-full bg-gradient-to-b from-zinc-900 to-zinc-950 border-white/10 p-6 space-y-8 sticky top-6">
                    <div>
                        <h2 className="text-xl font-black text-white mb-1">Place Order</h2>
                        <p className="text-zinc-500 text-sm">Trade {selectedCoin} Perpetual Futures</p>
                    </div>

                    <div className="space-y-4">
                        <div className="flex justify-between text-sm text-zinc-400">
                            <span>Leverage</span>
                            <span className="text-white font-bold">{leverage[0]}x</span>
                        </div>
                        <Slider
                            value={leverage}
                            onValueChange={setLeverage}
                            max={50}
                            step={1}
                            min={1}
                            className="py-4"
                        />
                        <div className="flex justify-between text-xs text-zinc-600 font-mono">
                            <span>1x</span>
                            <span>25x</span>
                            <span>50x</span>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm text-zinc-400">Margin (XP)</label>
                        <div className="relative">
                            <Wallet className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
                            <Input
                                type="number"
                                className="pl-9 bg-black/40 border-white/10 font-mono"
                                value={margin}
                                onChange={(e) => setMargin(Number(e.target.value))}
                            />
                        </div>
                        <div className="text-xs text-right text-zinc-500">
                            Available: <span className="text-zinc-300">Loading...</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-500 text-white h-12 font-bold text-lg"
                            onClick={() => placeOrderMutation.mutate("LONG")}
                            disabled={placeOrderMutation.isPending}
                        >
                            {placeOrderMutation.isPending ? <Loader2 className="animate-spin" /> : <div className="flex items-center gap-2"><ArrowUpRight /> Long</div>}
                        </Button>
                        <Button
                            className="bg-rose-600 hover:bg-rose-500 text-white h-12 font-bold text-lg"
                            onClick={() => placeOrderMutation.mutate("SHORT")}
                            disabled={placeOrderMutation.isPending}
                        >
                            {placeOrderMutation.isPending ? <Loader2 className="animate-spin" /> : <div className="flex items-center gap-2"><ArrowDownRight /> Short</div>}
                        </Button>
                    </div>

                    <div className="pt-6 border-t border-white/5 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Position Size</span>
                            <span className="text-zinc-300 font-mono">~$ {(margin * leverage[0]).toLocaleString()} XP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-zinc-500">Est. Liquidation</span>
                            <span className="text-zinc-300 font-mono">
                                {Number(currentPrice) > 0 ?
                                    // Rough Est: Entry +/- (Entry / Leverage)
                                    (Number(currentPrice) * (1 - (1 / leverage[0]))).toFixed(2)
                                    : "---"}
                            </span>
                        </div>
                        <div className="bg-blue-500/10 p-3 rounded text-xs text-blue-400 mt-2">
                            Simulated Trading Environment. No real assets involved.
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
