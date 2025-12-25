"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Zap, Flame, Award } from "lucide-react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface GamificationStats {
  xp: number;
  rank: string;
  streakDays: number;
  nextRankXP: number;
  currentRankXP: number;
  badges: Array<{
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string | null;
    earnedAt: string;
  }>;
}

async function getGamificationStats(): Promise<GamificationStats> {
  const response = await fetch("/api/member/gamification", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch gamification stats");
  }
  const data = await response.json();
  return data.stats;
}

const RANK_INFO = {
  NEWBIE: { name: "Newbie", color: "bg-gray-500", xpRequired: 0, nextXP: 1000 },
  PRO: { name: "Pro", color: "bg-blue-500", xpRequired: 1000, nextXP: 5000 },
  ELITE: { name: "Elite", color: "bg-purple-500", xpRequired: 5000, nextXP: 20000 },
  MASTER: { name: "Master", color: "bg-yellow-500", xpRequired: 20000, nextXP: null },
};

export function GamificationDashboard() {
  const { data: stats, isLoading, error } = useQuery<GamificationStats>({
    queryKey: ["gamificationStats"],
    queryFn: getGamificationStats,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-48" />
        <LoadingSkeleton className="h-64" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load gamification stats. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  const rankInfo = RANK_INFO[stats.rank as keyof typeof RANK_INFO] || RANK_INFO.NEWBIE;
  const xpProgress = rankInfo.nextXP
    ? Math.max(0, Math.min(100, ((stats.xp - stats.currentRankXP) / (rankInfo.nextXP - stats.currentRankXP)) * 100))
    : 100;
  const xpToNext = rankInfo.nextXP ? Math.max(0, rankInfo.nextXP - stats.xp) : 0;

  return (
    <div className="space-y-6">
      {/* XP and Rank Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-500" />
              Experience Points
            </CardTitle>
            <CardDescription>Your current XP and progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold">{stats.xp.toLocaleString()}</span>
                <Badge className={rankInfo.color}>{rankInfo.name}</Badge>
              </div>
              {rankInfo.nextXP && (
                <>
                  <Progress value={xpProgress} className="h-2" />
                  <p className="text-sm text-muted-foreground mt-2">
                    {xpToNext.toLocaleString()} XP until{' '}
                    {rankInfo.nextXP === 1000
                      ? RANK_INFO.PRO.name
                      : rankInfo.nextXP === 5000
                        ? RANK_INFO.ELITE.name
                        : RANK_INFO.MASTER.name}
                  </p>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              Streak
            </CardTitle>
            <CardDescription>Daily login streak</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="text-4xl font-bold">{stats.streakDays}</div>
              <div>
                <p className="text-sm font-medium">Days</p>
                <p className="text-xs text-muted-foreground">
                  {stats.streakDays >= 7 ? "🔥 On fire!" : "Keep it up!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rank Badge */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Current Rank
          </CardTitle>
          <CardDescription>Your achievement level</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full ${rankInfo.color} flex items-center justify-center text-white text-2xl font-bold`}>
              {rankInfo.name.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-xl font-semibold">{rankInfo.name}</p>
              <p className="text-sm text-muted-foreground">
                {stats.xp.toLocaleString()} / {rankInfo.nextXP ? rankInfo.nextXP.toLocaleString() : "∞"} XP
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Badges ({stats.badges.length})
          </CardTitle>
          <CardDescription>Your achievements and milestones</CardDescription>
        </CardHeader>
        <CardContent>
          {stats.badges.length > 0 ? (
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {stats.badges.map((badge) => (
                <div
                  key={badge.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card"
                >
                  <div className="text-2xl">{badge.icon || "🏆"}</div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{badge.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Earned {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                No badges yet. Complete tasks and refer friends to earn badges!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

