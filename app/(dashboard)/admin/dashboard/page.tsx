"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, DollarSign, Users, Activity, CreditCard } from "lucide-react";

export default function AdminDashboardPage() {

  const stats = [
    { title: "Total Users", value: "24,592", change: "+12%", icon: Users, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    { title: "Revenue", value: "$12,450", change: "+8.2%", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: "Pending Payouts", value: "148", change: "-2%", icon: CreditCard, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { title: "System Load", value: "98%", change: "+1.2%", icon: Activity, color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Command Center</h1>
        <p className="text-neutral-500 mt-1">Real-time system overview and metrics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-6 rounded-xl border ${stat.border} ${stat.bg} backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2 rounded-lg bg-neutral-950/50 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full bg-neutral-950/30 ${stat.color}`}>
                {stat.change}
              </span>
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-medium text-neutral-400">{stat.title}</h3>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Placeholder for future widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-96">
        <div className="lg:col-span-2 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col items-center justify-center text-neutral-600 border-dashed">
          <Activity className="h-12 w-12 mb-4 opacity-50" />
          <span>Live Traffic Analytics (Coming Soon)</span>
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 flex flex-col items-center justify-center text-neutral-600 border-dashed">
          <ShieldAlert className="h-12 w-12 mb-4 opacity-50" />
          <span>Security Logs (Empty)</span>
        </div>
      </div>
    </div>
  );
}
