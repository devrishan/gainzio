"use client";

import { useState } from "react";
import { Coins, Zap, Loader2, Snowflake, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CoinShopCardProps {
    coins: number;
}

export function CoinShopCard({ coins }: CoinShopCardProps) {
    const [loadingItem, setLoadingItem] = useState<string | null>(null);
    const router = useRouter();

    const handlePurchase = async (itemId: string, name: string) => {
        setLoadingItem(itemId);
        try {
            const res = await fetch("/api/member/shop/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Purchase failed");
            }

            toast.success(`${name} activated!`, {
                description: data.message || "Coins deducted.",
            });
            router.refresh();
        } catch (error: any) {
            toast.error("Purchase failed", {
                description: error.message,
            });
        } finally {
            setLoadingItem(null);
        }
    };

    const ITEMS = [
        {
            id: "STREAK_FREEZE",
            name: "Streak Freeze",
            description: "Miss a day without losing your streak.",
            cost: 500,
            icon: Snowflake,
            color: "text-cyan-500",
            bg: "bg-cyan-500/10",
        },
        {
            id: "TASK_PEEK",
            name: "Task Peek (Coming Soon)",
            description: "See tomorrow's high-value tasks.",
            cost: 100,
            icon: Eye,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            disabled: true,
        },
    ];

    return (
        <Card className="overflow-hidden border-orange-200 bg-gradient-to-br from-orange-50/50 to-white dark:from-orange-950/10 dark:to-background">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="rounded-full bg-orange-100 p-2 dark:bg-orange-900/20">
                            <Coins className="h-5 w-5 text-orange-500" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Coin Shop</CardTitle>
                            <CardDescription>Spend coins on power-ups</CardDescription>
                        </div>
                    </div>
                    <Badge variant="outline" className="gap-1.5 border-orange-200 bg-orange-50 px-3 py-1 text-sm font-bold text-orange-700 dark:border-orange-800 dark:bg-orange-950/30 dark:text-orange-400">
                        <Coins className="h-3.5 w-3.5" />
                        {coins.toLocaleString()}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                    {ITEMS.map((item) => (
                        <div
                            key={item.id}
                            className={`flex flex-col justify-between rounded-lg border p-3 transition-all hover:bg-white/50 dark:hover:bg-white/5 ${item.disabled ? 'opacity-60 grayscale' : 'hover:shadow-sm'}`}
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <div className={`rounded-md p-2 ${item.bg} ${item.color}`}>
                                    <item.icon className="h-5 w-5" />
                                </div>
                                <Badge variant="secondary" className="font-mono text-xs font-bold">
                                    {item.cost} 🟡
                                </Badge>
                            </div>

                            <div className="space-y-1">
                                <h4 className="font-semibold leading-none text-foreground">{item.name}</h4>
                                <p className="text-xs text-muted-foreground">{item.description}</p>
                            </div>

                            <Button
                                size="sm"
                                className="mt-3 w-full"
                                variant={item.disabled ? "ghost" : "outline"}
                                disabled={item.disabled || coins < item.cost || !!loadingItem}
                                onClick={() => handlePurchase(item.id, item.name)}
                            >
                                {loadingItem === item.id ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                    item.disabled ? "Locked" : "Buy"
                                )}
                            </Button>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
