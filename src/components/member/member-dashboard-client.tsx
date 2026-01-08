"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    CheckCircle2, Clock, Percent, Target, Trophy, Users, Zap, Crown, Star,
    ChevronRight, TrendingUp, Sparkles, Wallet, ArrowUpRight, Gift
} from "lucide-react";
import { motion } from "framer-motion";

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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { SquadHUD } from "@/components/member/squad-hud";
import { CoinShopCard } from "@/components/member/coin-shop-card";
import { UnifiedProgress } from "@/components/member/unified-progress";

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Bento Grid Hero Layout */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* 1. Main Progress / Hero (Large Block) */}
                <div className="md:col-span-8 space-y-6">
                    <div className="glass-morphism rounded-2xl p-1 shadow-lg dark:shadow-blue-900/10">
                        <UnifiedProgress />
                    </div>

                    {/* Squad HUD */}
                    <SquadHUD squad={squad} />
                </div>

                {/* 2. Wallet & Shop (Side Column) */}
                <div className="md:col-span-4 flex flex-col gap-6">
                    <div className="relative group perspective-1000">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-600/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                        <WalletCard
                            balance={dashboard.wallet.balance}
                            totalEarned={dashboard.wallet.total_earned}
                            onWithdraw={() => router.push("/member/withdraw")}
                        />
                    </div>

                    <div className="animate-float">
                        <CoinShopCard coins={dashboard.wallet.coins || 0} />
                    </div>
                </div>
            </div>

            {/* 3. Daily Missions (Interactive Grid) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" /> Daily Quests
                    </h3>
                    <Badge variant="outline" className="glass-morphism border-primary/20 text-primary animate-pulse">
                        3 Active
                    </Badge>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    {/* Watch Ads Mission */}
                    <div
                        onClick={() => router.push('/member/tasks')}
                        className="group relative cursor-pointer spark-border rounded-xl overflow-hidden glass-morphism hover:bg-accent/5 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-5 h-5 text-blue-400" />
                        </div>
                        <CardContent className="flex items-start gap-4 p-6">
                            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform duration-300">
                                <Zap className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg group-hover:text-blue-500 transition-colors">Watch Ads</h4>
                                <p className="text-sm text-muted-foreground mt-1">Complete 3 videos</p>
                                <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Sparkles className="w-3 h-3" /> +50 XP & ₹15
                                </div>
                            </div>
                        </CardContent>
                    </div>

                    {/* Referrals Mission */}
                    <div
                        onClick={() => router.push('/member/referrals')}
                        className="group relative cursor-pointer spark-border rounded-xl overflow-hidden glass-morphism hover:bg-accent/5 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-5 h-5 text-green-400" />
                        </div>
                        <CardContent className="flex items-start gap-4 p-6">
                            <div className="p-3 rounded-xl bg-green-500/10 text-green-500 group-hover:scale-110 transition-transform duration-300">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg group-hover:text-green-500 transition-colors">Invite Friends</h4>
                                <p className="text-sm text-muted-foreground mt-1">Bring 1 new member</p>
                                <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
                                    <Gift className="w-3 h-3" /> +100 XP & ₹50
                                </div>
                            </div>
                        </CardContent>
                    </div>

                    {/* Leaderboard Mission */}
                    <div
                        onClick={() => router.push('/member/leaderboard')}
                        className="group relative cursor-pointer spark-border rounded-xl overflow-hidden glass-morphism hover:bg-accent/5 transition-all duration-300"
                    >
                        <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-5 h-5 text-purple-400" />
                        </div>
                        <CardContent className="flex items-start gap-4 p-6">
                            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500 group-hover:scale-110 transition-transform duration-300">
                                <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="font-semibold text-lg group-hover:text-purple-500 transition-colors">Check Rank</h4>
                                <p className="text-sm text-muted-foreground mt-1">See where you stand</p>
                                <div className="mt-3 inline-flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                                    <Star className="w-3 h-3" /> Competition
                                </div>
                            </div>
                        </CardContent>
                    </div>
                </div>
            </div>

            {/* 4. Stats Grid */}
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                {referralSummary.map((item, i) => (
                    <motion.div
                        key={item.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="h-full"
                    >
                        <div className="h-full glass-morphism rounded-xl border border-white/5 shadow-sm hover:shadow-md transition-shadow">
                            <StatsCard
                                title={item.label}
                                value={item.value}
                                subtitle={item.subtitle}
                                icon={item.icon}
                                trend={item.trend}
                            />
                        </div>
                    </motion.div>
                ))}
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

            {/* NEW: Leaderboard Section (Mobile-First) */}
            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass-morphism border-white/5 order-2 lg:order-1">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" />
                                    Referral Momentum
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Verification success rate over time</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full mt-4">
                            <ChartContainer config={chartConfig}>
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid vertical={false} strokeOpacity={0.1} strokeDasharray="4 4" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                                    />
                                    <ChartTooltip
                                        cursor={{ fill: "hsl(var(--muted)/0.2)", radius: 8 }}
                                        content={<ChartTooltipContent className="glass-morphism border-white/10" />}
                                    />
                                    <ChartLegend content={<ChartLegendContent />} />
                                    <Bar
                                        dataKey="verified"
                                        stackId="a"
                                        radius={[0, 0, 4, 4]}
                                        fill="var(--color-verified)"
                                        animationDuration={1500}
                                    />
                                    <Bar
                                        dataKey="pending"
                                        stackId="a"
                                        radius={[4, 4, 0, 0]}
                                        fill="var(--color-pending)"
                                        animationDuration={1500}
                                    />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="glass-morphism border-white/5 order-1 lg:order-2">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold flex items-center gap-2">
                                    <Crown className="h-5 w-5 text-amber-500" />
                                    Top Performers
                                </CardTitle>
                                <p className="text-sm text-muted-foreground mt-1">Weekly champions</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {/* Mobile List View */}
                        <div className="block sm:hidden">
                            {topReferrers.length === 0 ? (
                                <div className="p-8 text-center text-sm text-muted-foreground">
                                    No leaderboard entries yet. Be the first!
                                </div>
                            ) : (
                                <div className="divide-y divide-white/5">
                                    {topReferrers.map((referrer, idx) => (
                                        <div key={referrer.referral_code} className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                                    ${idx === 0 ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500/20' : ''}
                                                    ${idx === 1 ? 'bg-slate-200 text-slate-600' : ''}
                                                    ${idx === 2 ? 'bg-orange-100 text-orange-600' : ''}
                                                    ${idx > 2 ? 'bg-muted text-muted-foreground' : ''}
                                                `}>
                                                    #{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm text-foreground">{referrer.username}</div>
                                                    <div className="text-xs text-muted-foreground">{referrer.verified_referrals} verified</div>
                                                </div>
                                            </div>
                                            <div className="font-bold text-primary text-sm">
                                                {referrer.total_earned.toFixed(0)} <span className="text-[10px] font-normal text-muted-foreground">Pts</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden sm:block overflow-x-auto">
                            <Table className="min-w-[400px]">
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-white/10">
                                        <TableHead>User</TableHead>
                                        <TableHead className="text-right">Verified</TableHead>
                                        <TableHead className="text-right">Earned</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {topReferrers.length === 0 ? (
                                        <TableRow className="hover:bg-transparent border-white/5">
                                            <TableCell className="text-sm text-muted-foreground h-24 text-center" colSpan={3}>
                                                No leaderboard entries yet. Be the first!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        topReferrers.map((referrer, idx) => (
                                            <TableRow key={referrer.referral_code} className="hover:bg-muted/50 border-white/5 transition-colors">
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`
                                                            w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold
                                                            ${idx === 0 ? 'bg-amber-100 text-amber-600 ring-2 ring-amber-500/20' : ''}
                                                            ${idx === 1 ? 'bg-slate-200 text-slate-600' : ''}
                                                            ${idx === 2 ? 'bg-orange-100 text-orange-600' : ''}
                                                            ${idx > 2 ? 'bg-muted text-muted-foreground' : ''}
                                                        `}>
                                                            #{idx + 1}
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <span className="font-medium text-foreground">{referrer.username}</span>
                                                            <span className="text-xs text-muted-foreground">{referrer.referral_code}</span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right font-mono">
                                                    {referrer.verified_referrals}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-primary">
                                                    {referrer.total_earned.toFixed(0)} <span className="text-xs font-normal text-muted-foreground">Pts</span>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div >
    );
}
