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
        <div className="absolute top-0 left-1/4 h-96 w-96 rounded-full bg-primary/10 blur-[120px] mix-blend-screen opacity-50" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-accent/10 blur-[120px] mix-blend-screen opacity-50" />
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
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary shadow-sm">
                New Payouts Weekly
              </span>
            </motion.div>

            {/* Heading */}
            <motion.div className="space-y-4 max-w-2xl" variants={fadeInUp}>
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
                Earn smarter with <br className="hidden lg:block" />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
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
                    <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground mb-1">Wallet Snapshot</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl md:text-5xl font-bold tracking-tight">₹1,24,800</span>
                    </div>
                  </div>
                  <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-500 text-xs font-bold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +₹9,200 today
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40 border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Clock3 className="h-3.5 w-3.5 text-orange-400" />
                      AVG PAYOUT TIME
                    </div>
                    <p className="text-xl font-bold">58 min</p>
                  </div>
                  <div className="flex flex-col gap-1 p-3 rounded-xl bg-muted/40 border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Coins className="h-3.5 w-3.5 text-green-400" />
                      12L+ CLEARED
                    </div>
                    <p className="text-base font-semibold">UPI withdrawals</p>
                  </div>
                  <div className="col-span-1 sm:col-span-2 flex flex-col gap-1 p-3 rounded-xl bg-muted/40 border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Users className="h-3.5 w-3.5 text-blue-400" />
                      38K+ VERIFIED
                    </div>
                    <p className="text-base font-semibold">referral earners</p>
                  </div>
                </div>

                {/* Progress Bar (Task approvals) */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Task approvals</span>
                    <span>92% this week</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent to-primary"
                      initial={{ width: 0 }}
                      whileInView={{ width: "92%" }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                </div>

              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}


