"use client";

import { useRouter } from "next/navigation";
import {
  Banknote,
  HandCoins,
  Users,
  Zap,
  ShieldCheck,
  ArrowUpRight,
  TrendingUp,
  CreditCard,
  Activity,
  ChevronRight
} from "lucide-react";
import { motion } from "framer-motion";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  const latestWithdrawals = pendingWithdrawals.slice(0, 5);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Welcome Section */}
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-white uppercase italic">Dashboard Overview</h2>
          <p className="text-neutral-400 font-medium">Real-time system insights and performance metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-emerald-400 uppercase tracking-widest">Live Updates</span>
        </div>
      </motion.div>

      {/* Key Metrics - Bento Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <motion.div variants={item} className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-6 hover:border-emerald-500/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Users className="w-24 h-24 text-emerald-500 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-emerald-400">
              <Users className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Members</span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight mb-1">{metrics.total_users.toLocaleString()}</div>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-medium bg-emerald-500/10 w-fit px-2 py-0.5 rounded-full border border-emerald-500/20">
              <ArrowUpRight className="w-3 h-3" />
              <span>+{metrics.new_users_24h} today</span>
            </div>
          </div>
        </motion.div>

        {/* Revenue/Volume */}
        <motion.div variants={item} className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-6 hover:border-violet-500/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Banknote className="w-24 h-24 text-violet-500 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-violet-400">
              <CreditCard className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Total Volume</span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight mb-1">₹{(metrics.total_earnings_paid / 1000).toFixed(1)}K</div>
            <div className="flex items-center gap-1 text-violet-400 text-xs font-medium bg-violet-500/10 w-fit px-2 py-0.5 rounded-full border border-violet-500/20">
              <Activity className="w-3 h-3" />
              <span>Lifetime Paid</span>
            </div>
          </div>
        </motion.div>

        {/* Pending Payouts */}
        <motion.div variants={item} className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-6 hover:border-amber-500/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <HandCoins className="w-24 h-24 text-amber-500 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-amber-400">
              <HandCoins className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight mb-1">{metrics.pending_withdrawals.count}</div>
            <div className="flex items-center gap-1 text-amber-400 text-xs font-medium bg-amber-500/10 w-fit px-2 py-0.5 rounded-full border border-amber-500/20">
              <span className="font-bold">₹{metrics.pending_withdrawals.amount.toLocaleString()}</span>
              <span className="opacity-70">waiting</span>
            </div>
          </div>
        </motion.div>

        {/* System Health */}
        <motion.div variants={item} className="group relative overflow-hidden rounded-2xl bg-neutral-900 border border-white/5 p-6 hover:border-cyan-500/30 transition-all duration-500">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Zap className="w-24 h-24 text-cyan-500 transform rotate-12 translate-x-4 -translate-y-4" />
          </div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2 text-cyan-400">
              <ShieldCheck className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">System Status</span>
            </div>
            <div className="text-3xl font-black text-white tracking-tight mb-1">99.9%</div>
            <div className="flex items-center gap-1 text-cyan-400 text-xs font-medium bg-cyan-500/10 w-fit px-2 py-0.5 rounded-full border border-cyan-500/20">
              <Zap className="w-3 h-3" />
              <span>All Systems Go</span>
            </div>
          </div>
        </motion.div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <TabsList className="bg-transparent border border-white/5 p-1 h-auto">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black text-neutral-400 px-4 py-2 font-bold uppercase text-xs tracking-widest transition-all"
            >
              Console
            </TabsTrigger>
            <TabsTrigger
              value="analytics"
              className="data-[state=active]:bg-emerald-500 data-[state=active]:text-black text-neutral-400 px-4 py-2 font-bold uppercase text-xs tracking-widest transition-all"
            >
              Intelligence
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="space-y-6 focus-visible:outline-none">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Quick Actions / Command Deck */}
            <motion.div variants={item} className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { label: "Tasks", desc: "Manage Campaigns", path: "/admin/tasks", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
                { label: "Users", desc: "View Database", path: "/admin/members", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
                { label: "Payouts", desc: "Process Funds", path: "/admin/withdrawals", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
                { label: "Products", desc: "Store Items", path: "/admin/products", color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
                { label: "Comms", desc: "Broadcasts", path: "/admin/communications", color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
                { label: "Config", desc: "System Settings", path: "/admin/maintenance", color: "text-neutral-400", bg: "bg-white/5", border: "border-white/10" }
              ].map((action, i) => (
                <div
                  key={i}
                  onClick={() => router.push(action.path)}
                  className={`cursor-pointer group relative overflow-hidden rounded-xl border ${action.border} ${action.bg} p-5 hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className="relative z-10 flex flex-col h-full justify-between">
                    <h3 className={`font-black text-lg uppercase tracking-tight ${action.color}`}>{action.label}</h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider group-hover:text-white transition-colors">{action.desc}</span>
                      <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0 ${action.color}`} />
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>

            {/* Live Payout Feed */}
            <motion.div variants={item} className="lg:col-span-1 rounded-xl bg-black/40 border border-white/5 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                <h3 className="font-bold text-white uppercase tracking-wider text-xs flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                  Pending Requests
                </h3>
                <Button variant="link" onClick={() => router.push('/admin/withdrawals')} className="text-[10px] h-auto p-0 text-neutral-500 hover:text-white uppercase tracking-widest font-bold">
                  View All
                </Button>
              </div>
              <div className="flex-1 overflow-auto max-h-[300px] lg:max-h-full p-2 space-y-2 custom-scrollbar">
                {latestWithdrawals.length === 0 ? (
                  <div className="h-40 flex flex-col items-center justify-center text-neutral-600 gap-2">
                    <ShieldCheck className="w-8 h-8 opacity-20" />
                    <span className="text-xs uppercase font-bold tracking-widest">Pipeline Clear</span>
                  </div>
                ) : (
                  latestWithdrawals.map((w) => (
                    <div key={w.id} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-colors group">
                      <div>
                        <div className="font-bold text-neutral-200 text-xs mb-0.5">{w.user.username}</div>
                        <div className="text-[10px] font-mono text-neutral-600">{w.upi_id}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-black text-amber-500 text-sm">₹{w.amount}</div>
                        <div className="text-[10px] text-neutral-600">{new Date(w.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 focus-visible:outline-none">
          <AnalyticsWrapper />
        </TabsContent>
      </Tabs>
    </motion.div>
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

  if (isLoading) return (
    <div className="h-[400px] w-full rounded-2xl border border-white/5 bg-white/[0.02] flex items-center justify-center gap-3">
      <Zap className="w-6 h-6 text-emerald-500 animate-pulse" />
      <span className="text-xs font-bold uppercase tracking-widest text-emerald-500">Decrypting Data Streams...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <AIInsightCard />
      <AnalyticsCharts data={data || []} />
    </div>
  );
}



