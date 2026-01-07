"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, DollarSign, Users, Activity, CreditCard, ShieldAlert } from "lucide-react";

import { getAdminDashboard } from "@/services/admin";
import { DashboardCharts } from "@/components/admin/dashboard-charts";

export default async function AdminDashboardPage() {
  const { metrics } = await getAdminDashboard();

  const stats = [
    { title: "Total Users", value: metrics.total_users.toLocaleString(), change: "+12%", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { title: "Revenue", value: `₹${metrics.total_earnings_paid.toLocaleString()}`, change: "+8.2%", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: "Pending Payouts", value: metrics.pending_withdrawals.count.toString(), change: "-2%", icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { title: "System Load", value: "Normal", change: "+1.2%", icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Command Center</h1>
          <p className="text-neutral-500 mt-1 font-mono text-xs uppercase tracking-widest">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white text-black font-bold rounded-lg hover:bg-neutral-200 transition-colors text-sm">
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`group relative p-6 rounded-xl border border-white/5 bg-neutral-900/40 backdrop-blur-sm overflow-hidden hover:bg-neutral-900/60 transition-all duration-300`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

            <div className="relative z-10 flex flex-col justify-between h-full">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-2.5 rounded-lg bg-neutral-950/50 border border-white/5 ${stat.color} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full bg-neutral-950/30 border border-white/5 ${stat.color} flex items-center gap-1`}>
                  {stat.change} <ArrowUpRight className="w-3 h-3" />
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-neutral-500 uppercase tracking-widest mb-1">{stat.title}</h3>
                <p className="text-3xl font-black text-white tracking-tight">{stat.value}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-4 h-4" /> Quick Actions
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-white/5 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 hover:from-purple-900/20 hover:to-neutral-900/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:border-purple-500/50 transition-colors">
                  <Users className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors">Review New Members</h4>
                  <p className="text-xs text-neutral-500 mt-1">12 accounts pending verification</p>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-xl border border-white/5 bg-gradient-to-br from-neutral-900/50 to-neutral-950/50 hover:from-amber-900/20 hover:to-neutral-900/50 transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 group-hover:border-amber-500/50 transition-colors">
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h4 className="font-bold text-white group-hover:text-amber-300 transition-colors">Process Payouts</h4>
                  <p className="text-xs text-neutral-500 mt-1">₹45,200 waiting to be released</p>
                </div>
              </div>
            </div>
          </div>

          {/* Real Analytics Chart */}
          <DashboardCharts />

        </motion.div>

        {/* Live Feed */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/5 bg-neutral-950/30 backdrop-blur-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-black text-neutral-400 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="w-4 h-4" /> Global Logs
            </h3>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </div>

          <div className="space-y-6 relative before:absolute before:inset-0 before:h-full before:w-[1px] before:bg-gradient-to-b before:from-transparent before:via-neutral-800 before:to-transparent before:left-[19px]">
            {[
              { time: "Just now", msg: "New withdrawal request: ₹500", type: "warn" },
              { time: "2 min ago", msg: "User registered: 'crypto_king'", type: "success" },
              { time: "15 min ago", msg: "System backup completed", type: "info" },
              { time: "1 hr ago", msg: "Failed login attempt (IP: 192.168...)", type: "error" },
              { time: "2 hrs ago", msg: "Weekly payout processing started", type: "info" },
            ].map((log, i) => (
              <div key={i} className="flex gap-4 relative">
                <div className={`mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-neutral-950 shrink-0 z-10 ${log.type === 'error' ? 'bg-red-500' :
                  log.type === 'warn' ? 'bg-amber-500' :
                    log.type === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`} />
                <div>
                  <p className="text-xs text-neutral-500 font-mono mb-0.5">{log.time}</p>
                  <p className="text-sm font-medium text-neutral-300">{log.msg}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-2 text-xs font-bold text-neutral-500 uppercase tracking-widest hover:text-white transition-colors border-t border-white/5">
            View All System Logs
          </button>
        </motion.div>

      </div>
    </div>
  );
}
