"use client";

import { useRouter } from "next/navigation";
import { Banknote, HandCoins, Users, Zap, ShieldCheck } from "lucide-react";

import { StatsCard } from "@/components/StatsCard";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalyticsCharts } from "@/components/admin/analytics-charts";
import { AIInsightCard } from "@/components/admin/ai-insight-card";
import { useQuery } from "@tanstack/react-query";

import type { AdminDashboardMetrics, AdminWithdrawal } from "@/services/admin";

interface AdminDashboardClientProps {
  metrics: AdminDashboardMetrics["metrics"];
  pendingWithdrawals: AdminWithdrawal[];
}

export function AdminDashboardClient({ metrics, pendingWithdrawals }: AdminDashboardClientProps) {
  const router = useRouter();

  const summary = [
    {
      title: "Total Members",
      value: metrics.total_users,
      subtitle: "Verified Network",
      icon: Users,
    },
    {
      title: "Pending Payouts",
      value: metrics.pending_withdrawals.count,
      subtitle: `₹${metrics.pending_withdrawals.amount.toFixed(0)} Volume`,
      icon: HandCoins,
      trend: "up" as const,
    },
    {
      title: "Total Paid Out",
      value: `₹${(metrics.total_earnings_paid / 1000).toFixed(1)}K`,
      subtitle: "Lifetime Volume",
      icon: Banknote,
    },
  ];

  const latestWithdrawals = pendingWithdrawals.slice(0, 5);

  return (
    <div className="space-y-10 relative">
      {/* Background Decor */}
      <div className="absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-60 -left-40 h-[400px] w-[400px] rounded-full bg-accent/5 blur-[100px] pointer-events-none" />

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-3 relative z-10">
        {summary.map((item) => (
          <StatsCard
            key={item.title}
            title={item.title}
            value={item.value}
            subtitle={item.subtitle}
            icon={item.icon}
            trend={item.trend}
          />
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Deep Dive Analytics</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-10">
          {/* Command Control Grid */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-6 w-1.5 bg-primary rounded-full" />
              <h2 className="text-xl font-black italic tracking-tight uppercase text-white/90">Command Center</h2>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
              {[
                { label: "Tasks", desc: "Missions & Levels", path: "/admin/tasks", color: "from-primary/20", border: "border-primary/20" },
                { label: "Users", desc: "Ranks & Accounts", path: "/admin/members", color: "from-primary/10", border: "border-primary/10" },
                { label: "Config", desc: "Engine Tuning", path: "/admin/maintenance", color: "from-primary/5", border: "border-primary/5" },
                { label: "Payouts", desc: `${metrics.pending_withdrawals.count} Pending`, path: "/admin/withdrawals", color: "from-primary/20", border: "border-primary/20" },
                { label: "Shop", desc: "Gamification Items", path: "/admin/gamification", color: "from-primary/10", border: "border-primary/10" },
                { label: "Comms", desc: "Broadcast Center", path: "/admin/communications", color: "from-primary/5", border: "border-primary/5" }
              ].map((action) => (
                <Card
                  key={action.label}
                  className={`relative overflow-hidden bg-gradient-to-br ${action.color} to-transparent backdrop-blur-md border ${action.border} transition-all duration-500 hover:scale-[1.02] hover:shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] group cursor-pointer`}
                  onClick={() => router.push(action.path)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-r ${action.color.replace('/20', '/10')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  <div className="p-6 relative z-10">
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-2 group-hover:translate-x-0">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-black text-white uppercase tracking-tighter text-lg mb-1 drop-shadow-md group-hover:text-primary transition-colors">
                      {action.label}
                    </h3>
                    <p className="text-xs font-bold text-white/50 uppercase tracking-widest group-hover:text-primary/70 transition-colors">{action.desc}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Live Feed: Pending Withdrawals */}
          <Card className="relative z-10 border-white/5 bg-black/40 backdrop-blur-xl p-6 overflow-hidden hover:border-emerald-500/20 transition-colors duration-500 group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="absolute -left-10 bottom-0 h-40 w-40 bg-emerald-500/5 blur-[80px] pointer-events-none" />

            <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
              <div>
                <h3 className="text-lg font-black italic uppercase tracking-tight text-white/90 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Payout Pipeline
                </h3>
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-[0.2em] ml-4">
                  Real-time transaction stream
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-[10px] font-black uppercase tracking-widest text-emerald-400 transition-all"
                onClick={() => router.push("/admin/withdrawals")}
              >
                Open Console
              </Button>
            </div>

            <div className="rounded-xl border border-white/5 overflow-hidden bg-white/5 backdrop-blur-sm">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-4">Operator</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-zinc-500 tracking-widest">Gateway ID</TableHead>
                    <TableHead className="text-right text-[10px] font-black uppercase text-zinc-500 tracking-widest">Volume</TableHead>

                    <TableHead className="text-right text-[10px] font-black uppercase text-zinc-500 tracking-widest hidden sm:table-cell">Timestamp</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {latestWithdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <ShieldCheck className="h-8 w-8 text-emerald-500/20" />
                          <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Clear Pipeline: No Pending Work</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    latestWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id} className="hover:bg-white/5 border-white/5 transition-colors group">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-white text-sm">{withdrawal.user.username}</span>
                            <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-tighter">{withdrawal.user.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-zinc-500 text-xs font-mono">{withdrawal.upi_id}</TableCell>
                        <TableCell className="text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs tracking-tight italic">
                            ₹{withdrawal.amount.toFixed(0)}
                          </span>
                        </TableCell>
                        <TableCell className="text-right text-[10px] font-bold text-zinc-600 uppercase hidden sm:table-cell group-hover:text-zinc-400 transition-colors">
                          {new Date(withdrawal.created_at).toLocaleTimeString()}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsWrapper />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AnalyticsWrapper() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const res = await fetch('/api/admin/analytics/advanced');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      return (await res.json()).analytics;
    }
  });

  if (isLoading) return <div className="p-10 text-center animate-pulse text-zinc-500">Loading Intelligence...</div>;

  return (
    <div className="space-y-6">
      <AIInsightCard />
      <AnalyticsCharts data={data || []} />
    </div>
  );
}


