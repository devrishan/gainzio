"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trophy, Medal, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState } from "react";

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

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1: return <Trophy className="h-6 w-6 text-yellow-500" />;
            case 2: return <Medal className="h-6 w-6 text-gray-400" />;
            case 3: return <Medal className="h-6 w-6 text-amber-600" />;
            default: return <span className="text-muted-foreground w-6 text-center font-bold">{rank}</span>;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Leaderboard</h1>
                <p className="text-muted-foreground">Compare your Smart Score with other earners.</p>
            </div>

            <div className="flex gap-2">
                {['daily', 'weekly', 'monthly', 'alltime'].map((p) => (
                    <Button
                        key={p}
                        variant={period === p ? "default" : "outline"}
                        onClick={() => setPeriod(p)}
                        className="capitalize"
                    >
                        {p}
                    </Button>
                ))}
            </div>

            {!isLoading && data?.userStats && (
                <Card className="bg-primary/5 border-primary/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Star className="h-5 w-5 text-primary" />
                            Your Ranking
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-2xl font-bold">#{data.userStats.rank}</div>
                                <div className="text-sm text-muted-foreground">Current Rank</div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-primary">{Math.floor(data.userStats.score).toLocaleString()}</div>
                                <div className="text-sm text-muted-foreground">Smart Score</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Top Earners</CardTitle>
                    <CardDescription>Based on Smart Score (Earnings + Consistency)</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading rankings...</div>
                    ) : data?.leaderboard.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No data for this period yet.</div>
                    ) : (
                        <div className="divide-y">
                            {data?.leaderboard.map((entry) => (
                                <div key={entry.userId} className={cn(
                                    "flex items-center justify-between p-4 hover:bg-muted/50 transition-colors",
                                    entry.userId === (data?.userStats as any)?.userId && "bg-muted"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-shrink-0 w-8 flex justify-center">
                                            {getRankIcon(entry.rank)}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.username}`} />
                                                <AvatarFallback>{entry.username?.substring(0, 2).toUpperCase() || "??"}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-semibold">{entry.username || "Anonymous"}</span>
                                                {entry.rank <= 3 && (
                                                    <span className="text-xs text-green-600 flex items-center gap-1">
                                                        <TrendingUp className="h-3 w-3" /> Top Earner
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="font-mono font-bold text-primary">
                                        {Math.floor(entry.score).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
