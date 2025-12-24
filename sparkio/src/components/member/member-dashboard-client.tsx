"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Percent, Target, Trophy, Users } from "lucide-react";

import { StatsCard } from "@/components/StatsCard";
import { ReferralList } from "@/components/ReferralList";
import { WalletCard } from "@/components/WalletCard";
import { Card } from "@/components/ui/card";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

import type { MemberDashboardPayload, MemberReferral } from "@/services/member";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

interface MemberDashboardClientProps {
  dashboard: MemberDashboardPayload;
  referrals: MemberReferral[];
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

export function MemberDashboardClient({ dashboard, referrals }: MemberDashboardClientProps) {
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

  return (
    <div className="space-y-6">
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

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <Card className="border-border bg-card p-4 lg:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Referral Performance</h3>
              <p className="text-sm text-muted-foreground">Track verification momentum for your invitations.</p>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Target className="h-3.5 w-3.5" />
              {dashboard.referrals.success_rate}% success
            </Badge>
          </div>
          <div className="mt-6 h-64">
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
        </Card>

        <WalletCard
          balance={dashboard.wallet.balance}
          totalEarned={dashboard.wallet.total_earned}
          onWithdraw={() => router.push("/member/withdraw")}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReferralList referrals={referrals.slice(0, 6)} />

        <Card className="border-border bg-card p-4 sm:p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Top Referrers</h3>
              <p className="text-sm text-muted-foreground">See who is climbing the weekly leaderboard.</p>
            </div>
            <Trophy className="h-5 w-5 text-primary" />
          </div>

          <Table className="mt-4">
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
                    <TableCell className="text-right">₹{referrer.total_earned.toFixed(2)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

