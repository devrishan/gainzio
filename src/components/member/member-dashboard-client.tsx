"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Percent, Target, Trophy, Users, Zap, Crown, Star, ChevronRight, TrendingUp } from "lucide-react";

import { StatsCard } from "@/components/StatsCard";
import { ReferralList } from "@/components/ReferralList";
import { WalletCard } from "@/components/WalletCard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { MemberDashboardPayload, MemberReferral, SquadData } from "@/services/member";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { SquadHUD } from "@/components/member/squad-hud";
import { CoinShopCard } from "@/components/member/coin-shop-card";

interface MemberDashboardClientProps {
  dashboard: MemberDashboardPayload;
  referrals: MemberReferral[];
  squad: SquadData | null;
}

const chartConfig = {
  verified: {
    label: "Verified",
    color: "hsl(var(--success))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--primary))",
  },
};

export function MemberDashboardClient({ dashboard, referrals, squad }: MemberDashboardClientProps) {
  const router = useRouter();

  const referralSummary = useMemo(
    () => [
      { label: "Total Referrals", value: dashboard.referrals.total, icon: Users, subtitle: "All time" },
      {
        label: "Verified",
        value: dashboard.referrals.verified,
        icon: CheckCircle2,
        subtitle: "Successful activations",
        trend: "up" as const,
      },
      {
        label: "Pending",
        value: dashboard.referrals.pending,
        icon: Clock,
        subtitle: "Awaiting verification",
        trend: "neutral" as const,
      },
      {
        label: "Success Rate",
        value: `${dashboard.referrals.success_rate}%`,
        icon: Percent,
        subtitle: "Verified / total",
        trend: "up" as const,
      },
    ],
    [dashboard],
  );

  const chartData = [
    {
      name: "Referrals",
      verified: dashboard.referrals.verified,
      pending: dashboard.referrals.pending,
    },
  ];

  const topReferrers = dashboard.top_referrers.slice(0, 5);
  const { gamification } = dashboard;

  const rankColors: Record<string, string> = {
    NEWBIE: "from-blue-500 to-cyan-400",
    PRO: "from-amber-400 to-orange-500",
    ELITE: "from-purple-500 to-indigo-600",
    MASTER: "from-rose-500 to-pink-600",
  };

  const rankColor = rankColors[gamification?.rank] || rankColors.NEWBIE;

  return (
    <div className="space-y-6">
      {/* Hero Section: Gamification & Wallet */}
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <Card className="relative overflow-hidden border-none text-white shadow-xl">
          <div className={`absolute inset-0 bg-gradient-to-br ${rankColor} opacity-90`} />
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />
          <CardContent className="relative flex h-full flex-col justify-between p-6 sm:p-8">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md">
                    <Crown className="mr-1 h-3.5 w-3.5" />
                    {gamification?.rank} RANK
                  </Badge>
                  <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-md">
                    <Zap className="mr-1 h-3.5 w-3.5 text-yellow-300" />
                    {gamification?.streak} Day Streak
                  </Badge>
                </div>
                <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
                  Hello, {dashboard.top_referrers.find(u => u.total_earned === dashboard.wallet.total_earned)?.username || "Earner"}!
                </h2>
                <p className="mt-2 text-blue-50">
                  {gamification?.next_rank
                    ? `You are ${gamification.xp_to_next} XP away from ${gamification.next_rank} status.`
                    : "You are at the top of the food chain!"}
                </p>
              </div>
              <div className="rounded-full bg-white/20 p-3 backdrop-blur-md">
                <Trophy className="h-8 w-8 text-yellow-200" />
              </div>
            </div>

            <div className="mt-8 space-y-2">
              <div className="flex justify-between text-sm font-medium">
                <span>{gamification?.xp} XP</span>
                <span>{gamification?.next_rank ? "Next: " + gamification.next_rank : "Max Level"}</span>
              </div>
              <Progress value={gamification?.progress} className="h-3 bg-white/20" />
              <p className="text-xs text-blue-100">
                Tip: Reach {gamification?.next_rank || "ELITE"} to unlock{" "}
                <span className="font-bold underline">Instant Withdrawals</span>.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <WalletCard
            balance={dashboard.wallet.balance}
            totalEarned={dashboard.wallet.total_earned}
            onWithdraw={() => router.push("/member/withdraw")}
          />
          <CoinShopCard coins={dashboard.wallet.coins || 0} />
        </div>
      </div>

      {/* Squad Wars HUD */}
      <SquadHUD squad={squad} />

      {/* Daily Missions */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Daily Missions</h3>
          <p className="text-sm text-muted-foreground">Complete these to earn bonus XP</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="cursor-pointer border-l-4 border-l-blue-500 transition-all hover:bg-accent/50" onClick={() => router.push('/member/tasks')}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">Watch 3 Ads</div>
                <div className="text-xs text-muted-foreground">Earn 50 XP + ₹15</div>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer border-l-4 border-l-green-500 transition-all hover:bg-accent/50" onClick={() => router.push('/member/referrals')}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-green-100 p-2 text-green-600 dark:bg-green-900/40 dark:text-green-400">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">Refer 1 Friend</div>
                <div className="text-xs text-muted-foreground">Earn 100 XP + ₹50</div>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
          <Card className="cursor-pointer border-l-4 border-l-purple-500 transition-all hover:bg-accent/50" onClick={() => router.push('/member/gamification')}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <div className="font-medium">Check Leaderboard</div>
                <div className="text-xs text-muted-foreground">See your standing</div>
              </div>
              <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground" />
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {referralSummary.map((item) => (
          <StatsCard
            key={item.label}
            title={item.label}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon}
            trend={item.trend}
          />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Referral Performance</CardTitle>
                <p className="text-sm text-muted-foreground">Verification momentum</p>
              </div>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ChartContainer config={chartConfig}>
                <BarChart data={chartData} barCategoryGap={32}>
                  <CartesianGrid vertical={false} strokeOpacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
                  <ChartTooltip cursor={{ fill: "hsl(var(--muted)/0.4)" }} content={<ChartTooltipContent />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar dataKey="verified" stackId="a" radius={[12, 12, 0, 0]} fill="var(--color-verified)" />
                  <Bar dataKey="pending" stackId="a" radius={[0, 0, 12, 12]} fill="var(--color-pending)" />
                </BarChart>
              </ChartContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Top Referrers</CardTitle>
                <p className="text-sm text-muted-foreground">Weekly Leaderboard</p>
              </div>
              <Trophy className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead className="hidden text-right sm:table-cell">Verified</TableHead>
                  <TableHead className="text-right">Earned</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topReferrers.length === 0 ? (
                  <TableRow>
                    <TableCell className="text-sm text-muted-foreground" colSpan={3}>
                      No leaderboard entries yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  topReferrers.map((referrer) => (
                    <TableRow key={referrer.referral_code}>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-foreground">{referrer.username}</span>
                          <span className="text-xs text-muted-foreground">{referrer.referral_code}</span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden text-right sm:table-cell">{referrer.verified_referrals}</TableCell>
                      <TableCell className="text-right">{referrer.total_earned.toFixed(0)} Pts</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <ReferralList
        referrals={referrals.slice(0, 6).map((r) => ({
          id: r.id,
          username: r.referred_user.username || "Unknown",
          email: r.referred_user.email || "",
          commission_amount: r.commission_amount,
          status: r.status as "verified" | "pending" | "rejected",
          created_at: r.created_at,
        }))}
      />
    </div>
  );
}

