"use client";

import { useMemo } from "react";
import { Users, Trophy, Timer, Share2, Crown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SquadData } from "@/services/member";

interface SquadHUDProps {
    squad: SquadData | null;
}

export function SquadHUD({ squad }: SquadHUDProps) {
    const timeLeft = useMemo(() => {
        if (!squad) return "";
        const end = new Date(squad.weekEndsAt);
        const now = new Date();
        const diff = end.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        return days > 0 ? `${days} days left` : "Ending soon";
    }, [squad]);

    if (!squad) return null;

    const handleShare = () => {
        const text = `Hey! Join my Gainzio Squad. We need to hit our goal of ₹${squad.weeklyGoal} to unlock bonuses!`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    };

    return (
        <Card className="border-l-4 border-l-indigo-500 bg-gradient-to-br from-card to-indigo-500/5 shadow-md">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-indigo-500" />
                        <CardTitle className="text-lg font-bold">Squad Weekly Goal</CardTitle>
                    </div>
                    <div className="flex items-center gap-1.5 rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                        <Timer className="h-3 w-3" />
                        {timeLeft}
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Progress Section */}
                    <div>
                        <div className="mb-2 flex items-end justify-between">
                            <div>
                                <span className="text-2xl font-bold text-foreground">₹{squad.currentTotal.toFixed(0)}</span>
                                <span className="text-sm text-muted-foreground mr-1"> / ₹{squad.weeklyGoal}</span>
                                {squad.isGoalMet && <span className="ml-2 inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">Goal Met! 🎉</span>}
                            </div>
                            <span className="text-xs font-medium text-muted-foreground">{squad.progressPercent.toFixed(0)}%</span>
                        </div>
                        <Progress value={squad.progressPercent} className="h-2.5" indicatorClassName={squad.isGoalMet ? "bg-green-500" : "bg-indigo-500"} />
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            {squad.isGoalMet
                                ? "Bonus rewards unlocking soon!"
                                : `Earn ₹${squad.remaining.toFixed(0)} more as a team to unlock bonuses.`
                            }
                        </p>
                    </div>

                    {/* Contributors & CTA */}
                    <div className="flex items-center justify-between gap-4">
                        {/* Mini Avatars / Top Contributor */}
                        <div className="flex -space-x-2 overflow-hidden">
                            {squad.topContributors.slice(0, 3).map((member, i) => (
                                <div key={member.userId} className={cn("inline-flex h-8 w-8 items-center justify-center rounded-full ring-2 ring-background text-[10px] font-bold text-white",
                                    i === 0 ? "bg-yellow-500 z-30" : i === 1 ? "bg-slate-400 z-20" : "bg-orange-400 z-10")} title={`${member.username}: ₹${member.amount}`}>
                                    {member.username.charAt(0).toUpperCase()}
                                </div>
                            ))}
                            {squad.membersCount > 3 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-2 ring-background text-[10px] z-0">
                                    +{squad.membersCount - 3}
                                </div>
                            )}
                        </div>

                        <Button size="sm" variant="outline" className="ml-auto gap-2 border-indigo-200 hover:bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:hover:bg-indigo-950 dark:text-indigo-400" onClick={handleShare}>
                            <Share2 className="h-3.5 w-3.5" />
                            Valid
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
