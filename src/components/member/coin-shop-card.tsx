"use client";

import { useState, useEffect } from "react";
import { Coins, Zap, Loader2, Snowflake, Eye, Gift } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CoinShopCardProps {
    coins: number;
}

interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    icon: string;
    type: string;
    isActive: boolean;
}

const ITEM_STYLES: Record<string, { color: string; bg: string; icon: any }> = {
    "Streak Freeze": { color: "text-cyan-500", bg: "bg-cyan-500/10", icon: Snowflake },
    "Task Peek": { color: "text-purple-500", bg: "bg-purple-500/10", icon: Eye },
    "Double XP Boost": { color: "text-yellow-500", bg: "bg-yellow-500/10", icon: Zap },
    "Default": { color: "text-orange-500", bg: "bg-orange-500/10", icon: Gift }
};

export function CoinShopCard({ coins }: CoinShopCardProps) {
    const [loadingItem, setLoadingItem] = useState<string | null>(null);
    const [items, setItems] = useState<ShopItem[]>([]);
    const [fetching, setFetching] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const res = await fetch("/api/gamification/shop");
                if (res.ok) {
                    const data = await res.json();
                    setItems(data);
                }
            } finally {
                setFetching(false);
            }
        };
        fetchItems();
    }, []);

    const handlePurchase = async (itemId: string, name: string, cost: number) => {
        if (coins < cost) {
            toast.error("Not enough coins!");
            return;
        }

        setLoadingItem(itemId);
        try {
            const res = await fetch("/api/gamification/shop", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ itemId }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Purchase failed");
            }

            toast.success(`${name} activated!`, {
                description: `Spent ${cost} coins.`,
            });
            router.refresh(); // Refresh to update coin balance
        } catch (error: any) {
            toast.error("Purchase failed", {
                description: error.message,
            });
        } finally {
            setLoadingItem(null);
        }
    };

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
                {fetching ? (
                    <div className="flex justify-center p-4">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                        {items.map((item) => {
                            const style = ITEM_STYLES[item.name] || ITEM_STYLES["Default"];
                            const Icon = style.icon;

                            return (
                                <div
                                    key={item.id}
                                    className={`flex flex-col justify-between rounded-lg border p-3 transition-all hover:bg-white/50 dark:hover:bg-white/5 hover:shadow-sm`}
                                >
                                    <div className="mb-3 flex items-start justify-between">
                                        <div className={`rounded-md p-2 ${style.bg} ${style.color}`}>
                                            <Icon className="h-5 w-5" />
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
                                        variant="outline"
                                        disabled={coins < item.cost || !!loadingItem}
                                        onClick={() => handlePurchase(item.id, item.name, item.cost)}
                                    >
                                        {loadingItem === item.id ? (
                                            <Loader2 className="h-3 w-3 animate-spin" />
                                        ) : (
                                            "Buy"
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
