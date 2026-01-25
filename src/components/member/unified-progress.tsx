"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Flame, Zap } from "lucide-react";
import type { MemberDashboardPayload } from "@/services/member";

interface UnifiedProgressProps {
    gamification: MemberDashboardPayload['gamification'];
}

export function UnifiedProgress({ gamification }: UnifiedProgressProps) {
    if (!gamification) return null;

    // Calculate target XP (current XP + remaining XP)
    const nextRankXP = gamification.xp + gamification.xp_to_next;

    return (
        <Card className="border-2 border-primary/10 overflow-hidden relative">
            {/* Background decoration */}
            <div className="absolute top-0 right-0 p-16 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <CardHeader className="pb-2">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div className="flex flex-col">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Rank</CardTitle>
                        <div className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                            {gamification.rank}
                            <Award className="h-5 w-5 text-primary" />
                        </div>
                    </div>
                    <div className="flex items-center gap-1 text-orange-500 font-bold self-start sm:self-auto">
                        <Flame className="h-4 w-4 sm:h-5 sm:w-5 fill-orange-500" />
                        {gamification.streak} Day Streak
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium">
                        <span>{gamification.xp.toLocaleString()} XP</span>
                        <span className="text-muted-foreground">Next: {nextRankXP.toLocaleString()} XP</span>
                    </div>
                    <Progress value={gamification.progress} className="h-3 bg-muted" indicatorClassName="bg-gradient-to-r from-primary to-primary/80" />
                    <div className="pt-2 flex justify-between items-center">
                        <div className="text-xs text-muted-foreground">
                            Keep going! You are {Math.round(100 - gamification.progress)}% away from leveling up.
                        </div>
                    </div>
                </div>

                {/* Smart Score Mini-Display */}
                <div className="mt-4 pt-4 border-t flex items-center gap-2 justify-center bg-muted/20 -mx-6 -mb-6 p-3">
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Smart Score: {gamification.smartScore.toLocaleString()}</span>
                </div>
            </CardContent>
        </Card>
    );
}
