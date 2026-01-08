"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Star, TrendingUp, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion } from "framer-motion";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface LeaderboardEntry {
    userId: string;
    score: number;
    rank: number;
    username?: string;
}

interface LeaderboardData {
    leaderboard: LeaderboardEntry[];
    userStats: {
        rank: number | string;
        score: number;
    };
}

export default function LeaderboardPage() {
    const [period, setPeriod] = useState("alltime");

    const { data, isLoading } = useQuery<LeaderboardData>({
        queryKey: ["leaderboard", period],
        queryFn: async () => {
            const res = await fetch(`/api/member/leaderboard?type=smart_score&period=${period}`);
            if (!res.ok) throw new Error("Failed to fetch leaderboard");
            return res.json();
        }
    });

    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1: return {
                icon: <Crown className="h-6 w-6 text-yellow-500 fill-yellow-500/20" />,
                bg: "bg-yellow-500/10 border-yellow-500/20",
                text: "text-yellow-500"
            };
            case 2: return {
                icon: <Medal className="h-6 w-6 text-slate-300 fill-slate-300/20" />,
                bg: "bg-slate-500/10 border-slate-500/20",
                text: "text-slate-400"
            };
            case 3: return {
                icon: <Medal className="h-6 w-6 text-orange-500 fill-orange-500/20" />,
                bg: "bg-orange-500/10 border-orange-500/20",
                text: "text-orange-600"
            };
            default: return {
                icon: <span className="text-muted-foreground w-6 text-center font-bold font-mono text-lg">#{rank}</span>,
                bg: "hover:bg-muted/50 border-transparent",
                text: "text-foreground"
            };
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                        Leaderboard
                    </h1>
                    <p className="text-muted-foreground">Compete for the top spot and earn bonus rewards.</p>
                </div>

                <div className="flex gap-2 bg-muted/10 p-1 rounded-lg border border-white/5 backdrop-blur-sm self-start">
                    {['daily', 'weekly', 'monthly', 'alltime'].map((p) => (
                        <Button
                            key={p}
                            variant={period === p ? "default" : "ghost"}
                            onClick={() => setPeriod(p)}
                            className="capitalize h-8 px-4 text-xs font-medium rounded-md"
                        >
                            {p}
                        </Button>
                    ))}
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
                {/* Main Leaderboard List */}
                <Card className="glass-morphism border-white/5 order-2 lg:order-1">
                    <CardHeader className="bg-muted/5 border-b border-white/5">
                        <CardTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-primary" />
                            Top Earners
                        </CardTitle>
                        <CardDescription>Ranked by Smart Score (Earnings + Consistency)</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        {isLoading ? (
                            <div className="p-4 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => <LoadingSkeleton key={i} className="h-16 w-full rounded-lg" />)}
                            </div>
                        ) : data?.leaderboard.length === 0 ? (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center">
                                <Trophy className="h-12 w-12 mb-3 text-muted-foreground/30" />
                                No data for this period yet.
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <div className="divide-y divide-white/5 min-w-[500px]">
                                    {data?.leaderboard.map((entry, idx) => {
                                        const styles = getRankStyles(entry.rank);
                                        return (
                                            <motion.div
                                                key={entry.userId}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className={cn(
                                                    "flex items-center justify-between p-4 transition-all duration-200",
                                                    styles.bg,
                                                    entry.userId === (data?.userStats as any)?.userId && "bg-primary/5 ring-1 ring-primary/20 sticky top-0 backdrop-blur-md z-10"
                                                )}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-shrink-0 w-8 flex justify-center">
                                                        {styles.icon}
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <div className="relative">
                                                            <Avatar className="h-10 w-10 border-2 border-background shadow-sm">
                                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`} />
                                                                <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                                                    {entry.username?.substring(0, 2).toUpperCase() || "??"}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            {entry.rank <= 3 && (
                                                                <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-0.5 shadow-sm">
                                                                    <Star className={cn("h-3 w-3 fill-current", styles.text)} />
                                                                </div>
                                                            )}
                                                        </div>

                                                        <div className="flex flex-col">
                                                            <span className={cn("font-semibold", entry.userId === (data?.userStats as any)?.userId ? "text-primary" : "text-foreground")}>
                                                                {entry.username || "Anonymous"}
                                                            </span>
                                                            {entry.rank <= 3 && (
                                                                <span className={cn("text-[10px] font-medium flex items-center gap-1 uppercase tracking-wider", styles.text)}>
                                                                    <TrendingUp className="h-3 w-3" /> Top Earner
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-mono font-bold text-lg text-foreground">
                                                        {Math.floor(entry.score).toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-muted-foreground">Score</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* User Stats Sidebar */}
                <div className="order-1 lg:order-2 space-y-4">
                    {!isLoading && data?.userStats && (
                        <Card className="glass-morphism border-primary/20 bg-gradient-to-br from-primary/10 to-transparent overflow-hidden relative">
                            <div className="absolute top-0 right-0 p-8 bg-primary/20 blur-[60px] rounded-full pointer-events-none" />
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Star className="h-5 w-5 text-primary fill-primary/20" />
                                    Your Rank
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-4xl font-black tracking-tighter text-foreground">#{data.userStats.rank}</div>
                                            <div className="text-sm font-medium text-muted-foreground mt-1">Current Position</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-bold text-primary">{Math.floor(data.userStats.score).toLocaleString()}</div>
                                            <div className="text-xs text-muted-foreground">pts</div>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-lg bg-background/40 backdrop-blur-sm border border-white/5 text-xs text-muted-foreground">
                                        Keep completing tasks to improve your Smart Score and climb the ranks!
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="glass-morphism border-white/5">
                        <CardHeader>
                            <CardTitle className="text-sm">Rewards Info</CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-muted-foreground space-y-2">
                            <p>🏆 Top 3 earners get a <span className="text-foreground font-medium">2x Multiplier</span> on their next withdrawal.</p>
                            <p>📅 Leaderboard resets every Sunday at midnight.</p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
