"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, Coins, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

const highlights = [
  { label: "Avg payout time", value: "58 min", icon: Clock3, color: "text-blue-400" },
  { label: "Total Paid Out", value: "₹12L+", icon: Coins, color: "text-amber-400" },
  { label: "Active Earners", value: "38K+", icon: Users, color: "text-emerald-400" },
];

const checklist = [
  "Instant UPI Withdrawals",
  "No Joining Fees",
  "100% Legal & Verified",
];

export function Hero() {
  const { data: session } = useSession();

  return (
    <section className="relative w-full overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50 animate-pulse" />
        <div className="absolute bottom-0 right-1/4 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      <div className="container px-4 mx-auto md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">

          {/* Left Column: Text Content */}
          <motion.div
            className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-8"
            initial="hidden"
            whileInView="visible"
            viewport={viewport}
            variants={stagger}
          >
            {/* Badge */}
            <motion.div variants={fadeInUp}>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] text-primary shadow-lg shadow-primary/5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                India's Most Trusted Network
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div className="space-y-6 max-w-2xl" variants={fadeInUp}>
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[1.05]">
                India's Premier <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-accent animate-gradient">
                  Rewards Platform
                </span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground md:text-xl leading-relaxed max-w-[600px] mx-auto lg:mx-0">
                Unlock daily income by completing verified tasks and building a powerful referral network.
                Experience instant UPI withdrawals with Gainzio&apos;s compliance-first ecosystem.
              </p>

              <div className="flex items-center gap-2 justify-center lg:justify-start">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-zinc-800 flex items-center justify-center overflow-hidden">
                      <div className="h-full w-full bg-gradient-to-br from-zinc-700 to-zinc-900" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium">
                  <span className="text-primary font-bold">10k+</span> members earning today
                </p>
              </div>
            </motion.div>

            {/* Buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-6" variants={fadeInUp}>
              <Button asChild size="xl" className="rounded-full shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:scale-[1.02] active:scale-95 text-base px-8 h-14">
                <Link href={session ? "/member/dashboard" : "/register"}>
                  {session ? "Enter Dashboard" : "Start Earning Now"}
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <div className="flex items-center justify-center">
                <Button asChild variant="ghost" size="xl" className="rounded-full text-base h-14 px-8 hover:bg-primary/5 transition-colors">
                  <Link href="/login">
                    Already a member? Login
                  </Link>
                </Button>
              </div>
            </motion.div>

            {/* Trust Markers */}
            <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 w-full" variants={fadeInUp}>
              {[
                { label: "Withdrawals", value: "Instant UPI", icon: ShieldCheck },
                { label: "Active Members", value: "38,000+", icon: Users },
                { label: "Joining Fees", value: "₹0 Free", icon: CheckCircle2 }
              ].map((item) => (
                <div key={item.label} className="flex flex-col items-center lg:items-start gap-1 p-4 rounded-2xl bg-muted/30 border border-white/5">
                  <item.icon className="h-5 w-5 text-primary mb-1" />
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</span>
                  <span className="text-sm font-semibold">{item.value}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Visual Dashboard */}
          <motion.div
            className="relative mx-auto w-full max-w-[550px] lg:max-w-none"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            whileInView={{ opacity: 1, scale: 1, y: 0 }}
            viewport={viewport}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            {/* Premium Glow Effect */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-primary/20 via-transparent to-accent/20 blur-3xl opacity-30 animate-pulse" />

            {/* Dashboard Mockup */}
            <div className="relative rounded-[32px] border border-white/10 bg-zinc-950/40 p-3 backdrop-blur-2xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)]">
              <div className="relative rounded-[24px] overflow-hidden border border-white/5 bg-zinc-900/50 p-6 md:p-8 space-y-8">

                {/* Header Section */}
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">Live Balance</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-black tracking-tight text-white italic">₹1,24,800.00</span>
                    </div>
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-wide flex items-center gap-2">
                    <TrendingUp className="h-3.5 w-3.5" />
                    +₹9,204.00
                  </div>
                </div>

                {/* Sub-Stats Grid */}
                <div className="grid grid-cols-2 gap-4 text-white">
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Task Income</p>
                    <p className="text-xl font-bold">₹42,350</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">Referral Rewards</p>
                    <p className="text-xl font-bold">₹82,450</p>
                  </div>
                </div>

                {/* Growth Visualization */}
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Network Growth</p>
                      <p className="text-sm font-semibold">Tier 1 Elite Partner</p>
                    </div>
                    <span className="text-xs font-black text-primary">Top 1%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-zinc-800 shadow-inner overflow-hidden flex">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-600 to-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: "85%" }}
                      transition={{ duration: 1.5, ease: "circOut" }}
                    />
                    <motion.div
                      className="h-full bg-primary/40 border-l border-white/20"
                      initial={{ width: 0 }}
                      whileInView={{ width: "15%" }}
                      transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] font-bold text-zinc-600 uppercase">
                    <span>Recent Payout: 12m ago</span>
                    <span>Next Goal: ₹1.5L</span>
                  </div>
                </div>

                {/* Instant Action Proof */}
                <div className="pt-2">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/10 border border-primary/20">
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Security Protocol</p>
                      <p className="text-xs font-semibold text-zinc-300">Google-Auth Protected & UPI Verified</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 text-center space-y-1">
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">
                Analytics & Predictions based on active usage
              </p>
              <p className="text-[10px] text-zinc-500 italic">
                Example dashboard shown for illustrative purposes
              </p>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}



