"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Award, Trophy } from "lucide-react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";

interface UserBadge {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string | null;
  earnedAt: string;
}

async function getUserBadges(): Promise<UserBadge[]> {
  const response = await fetch("/api/member/gamification/badges", {
    credentials: "include",
  });
  if (!response.ok) {
    throw new Error("Failed to fetch badges");
  }
  const data = await response.json();
  return data.badges;
}

export function BadgesList() {
  const { data: badges, isLoading, error } = useQuery<UserBadge[]>({
    queryKey: ["userBadges"],
    queryFn: getUserBadges,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-48" />
      </div>
    );
  }

  if (error || !badges) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            Failed to load badges. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Your Badges ({badges.length})
        </CardTitle>
        <CardDescription>All achievements and milestones you&apos;ve earned</CardDescription>
      </CardHeader>
      <CardContent>
        {badges.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                <div className="text-3xl flex-shrink-0">{badge.icon || "🏆"}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="font-semibold text-sm">{badge.name}</p>
                    <Badge variant="secondary" className="text-xs">
                      {badge.code}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2">{badge.description}</p>
                  <p className="text-xs text-muted-foreground">
                    <Award className="h-3 w-3 inline mr-1" />
                    Earned {new Date(badge.earnedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Award className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-sm font-medium mb-2">No badges yet</p>
            <p className="text-xs text-muted-foreground">
              Complete tasks, refer friends, and reach milestones to earn badges!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

