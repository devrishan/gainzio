"use client";

import Link from "next/link";
import { ArrowUpRight, CheckCircle2, Clock3, Coins, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";
import { cn } from "@/lib/utils";

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
  return (
    <section className="relative w-full overflow-hidden bg-background pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-40 lg:pb-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/20 blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03]" />
      </div>

      <div className="container px-4 mx-auto md:px-6">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-8 items-center">

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
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-[0_0_15px_-3px_rgba(var(--primary),0.3)]">
                New Payouts Weekly
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div className="space-y-4 max-w-2xl" variants={fadeInUp}>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
                Earn smarter with <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-400">
                  tasks & referrals
                </span>
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl leading-relaxed max-w-[600px] mx-auto lg:mx-0">
                Gainzio helps you earn rewards by completing tasks and referring friends. Transparent earnings, fast UPI withdrawals, and a trusted platform.
              </p>
            </motion.div>

            {/* Buttons */}
            <motion.div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto" variants={fadeInUp}>
              <Button asChild size="xl" className="rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                <Link href="/member/dashboard">
                  Launch dashboard
                  <ArrowUpRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="xl" className="rounded-full border-2 hover:bg-muted/50 transition-all">
                <Link href="/register">
                  Create free account
                </Link>
              </Button>
            </motion.div>

            {/* Checklist */}
            <motion.div className="flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-3 pt-4" variants={fadeInUp}>
              {checklist.map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right Column: Visual/Dashboard Preview */}
          <motion.div
            className="relative mx-auto w-full max-w-[500px] lg:max-w-none"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={viewport}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            {/* Glassmorphism Card Container */}
            <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-2 backdrop-blur-xl shadow-2xl ring-1 ring-black/5 dark:ring-white/10">
              <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/30 blur-3xl" />
              <div className="absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-blue-500/30 blur-3xl" />

              <div className="relative rounded-[24px] overflow-hidden border border-white/5 bg-background/50 p-6 md:p-8 space-y-8">

                {/* Header Section of Card */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-sm font-medium uppercase tracking-widest text-muted-foreground mb-1">Total Earnings</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-5xl font-bold tracking-tight">₹12,450</span>
                      <span className="text-xs text-muted-foreground font-medium">.00</span>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +12%
                  </div>
                </div>

                {/* Graph Placeholder (Abstract) */}
                <div className="h-32 w-full flex items-end justify-between gap-1 px-2">
                  {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                    <motion.div
                      key={i}
                      className="w-full bg-primary/20 hover:bg-primary/40 rounded-t-sm transition-colors cursor-pointer"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${h}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  ))}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {highlights.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 border border-white/5 hover:bg-muted/60 transition-colors">
                      <div className={cn("p-2 rounded-lg bg-background shadow-sm", item.color)}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
                        <p className="text-base font-semibold">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Notification */}
                <motion.div
                  className="absolute -right-4 top-1/2 bg-background/90 backdrop-blur-md border border-white/10 p-3 rounded-xl shadow-xl flex items-center gap-3 max-w-[200px]"
                  initial={{ x: 20, opacity: 0 }}
                  whileInView={{ x: 0, opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Coins className="h-4 w-4" />
                  </div>
                  <div className="text-xs">
                    <p className="font-semibold">Payment Received</p>
                    <p className="text-muted-foreground">Just now via UPI</p>
                  </div>
                </motion.div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}


