"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BrainCircuit, TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AIIntelligence {
    growth: {
        newUsersLast7Days: number;
        trendPermission: number;
        status: "POSITIVE" | "NEGATIVE";
    };
    economy: {
        minted: number;
        burned: number;
        health: "STABLE" | "INFLATIONARY" | "DEFLATIONARY";
        message: string;
        recommendation: string;
    };
    engagement: {
        activeUsers: number;
        totalUsers: number;
        rate: number;
    };
    generatedAt: string;
}

export function AIInsightCard() {
    const { data: intelligence, isLoading } = useQuery({
        queryKey: ["admin-intelligence"],
        queryFn: async () => {
            const res = await fetch("/api/admin/analytics/insights");
            if (!res.ok) throw new Error("Failed to fetch intelligence");
            return (await res.json()).intelligence as AIIntelligence;
        }
    });

    if (isLoading) {
        return (
            <Card className="relative overflow-hidden border-purple-500/30 bg-black/40 backdrop-blur-xl h-[280px] animate-pulse">
                <CardHeader className="flex flex-row items-center gap-2 pb-2">
                    <BrainCircuit className="h-5 w-5 text-purple-400" />
                    <CardTitle className="text-sm font-mono tracking-widest text-purple-200 uppercase">
                        CORTEX INTELLIGENCE
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-full flex items-center justify-center text-purple-500/50 font-mono text-xs">
                    ANALYZING DATA STREAMS...
                </CardContent>
            </Card>
        );
    }

    if (!intelligence) return null;

    return (
        <Card className="relative overflow-hidden border-purple-500/30 bg-black/40 backdrop-blur-xl transition-all hover:border-purple-500/50">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-blue-500/5 pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-purple-500/10">
                <div className="flex items-center gap-2">
                    <BrainCircuit className="h-5 w-5 text-purple-400" />
                    <CardTitle className="text-sm font-mono tracking-widest text-purple-200 uppercase">
                        CORTEX AI REPORT
                    </CardTitle>
                </div>
                <Badge variant="outline" className="border-purple-500/30 text-purple-300 bg-purple-500/10 font-mono text-[10px]">
                    {new Date(intelligence.generatedAt).toLocaleTimeString()}
                </Badge>
            </CardHeader>

            <CardContent className="space-y-6 pt-6">
                {/* 1. Primary Insight: Economy Health */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Economy Status</span>
                        <Badge
                            variant="outline"
                            className={`
                                ${intelligence.economy.health === 'STABLE' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : ''}
                                ${intelligence.economy.health === 'INFLATIONARY' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : ''}
                                ${intelligence.economy.health === 'DEFLATIONARY' ? 'border-red-500/50 text-red-400 bg-red-500/10' : ''}
                            `}
                        >
                            {intelligence.economy.health}
                        </Badge>
                    </div>

                    <p className="text-sm text-foreground/90 font-medium leading-relaxed">
                        {intelligence.economy.message}
                    </p>

                    {intelligence.economy.health !== 'STABLE' && (
                        <div className="p-3 rounded-lg bg-white/5 border border-white/10 flex items-start gap-3">
                            <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                            <div className="space-y-1">
                                <span className="text-xs font-bold text-yellow-500 uppercase">Recommendation</span>
                                <p className="text-xs text-muted-foreground">{intelligence.economy.recommendation}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* 2. Secondary Metrics Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-purple-500/5 border border-purple-500/10">
                        <div className="flex items-center gap-2 mb-1">
                            {intelligence.growth.status === 'POSITIVE' ? (
                                <TrendingUp className="h-3 w-3 text-emerald-400" />
                            ) : (
                                <TrendingDown className="h-3 w-3 text-red-400" />
                            )}
                            <span className="text-[10px] font-bold text-purple-300 uppercase">Growth</span>
                        </div>
                        <div className="text-lg font-black text-white">
                            {intelligence.growth.newUsersLast7Days}
                            <span className="text-xs font-medium text-muted-foreground ml-1">new</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            {intelligence.growth.trendPermission > 0 ? '+' : ''}{intelligence.growth.trendPermission.toFixed(0)}% vs last wk
                        </div>
                    </div>

                    <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/10">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity className="h-3 w-3 text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-300 uppercase">Engagement</span>
                        </div>
                        <div className="text-lg font-black text-white">
                            {intelligence.engagement.rate.toFixed(1)}%
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                            {intelligence.engagement.activeUsers} active / {intelligence.engagement.totalUsers} total
                        </div>
                    </div>
                </div>

                <Button className="w-full bg-purple-600/20 hover:bg-purple-600/30 text-purple-200 border border-purple-500/20 h-8 text-xs uppercase tracking-widest font-bold">
                    Generate Full Report
                </Button>
            </CardContent>
        </Card>
    );
}

function Typewriter({ text, speed = 50, onComplete }: { text: string; speed?: number; onComplete?: () => void }) {
    // Legacy component kept if needed, but unused in new design
    return null;
}
