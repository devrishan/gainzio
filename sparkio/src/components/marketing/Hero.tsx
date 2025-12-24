"use client";

import Link from "next/link";
import { ArrowUpRight, Clock3, Coins, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";

const highlights = [
  { label: "Avg payout time", value: "58 min", icon: Clock3 },
  { label: "₹12L+ cleared", value: "UPI withdrawals", icon: Coins },
  { label: "38K+ verified", value: "referral earners", icon: Users },
];

const checklist = [
  "100% KYC compliant",
  "OTP-secured dashboard",
  "Live wallet + task tracker",
];

export function Hero() {
  return (
    <motion.section
      id="hero"
      className="relative isolate overflow-hidden px-6 pb-24 pt-28 sm:pb-32 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
      transition={{ duration: 0.6 }}
    >
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/25 to-transparent blur-3xl" />
        <div className="absolute left-[5%] top-40 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[10%] top-12 h-56 w-56 rounded-full bg-secondary/10 blur-2xl" />
      </div>

      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-14 lg:grid-cols-[1.05fr_minmax(0,1fr)]">
        <motion.div className="space-y-8 text-center lg:text-left" variants={stagger}>
          <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.28em] text-primary/80">
            New payouts weekly
          </span>

          <motion.div className="space-y-5" variants={fadeInUp}>
            <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
              Make every install, task, and share count toward real cash
            </h1>
            <p className="text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              Earniq turns referrals, UPI tasks, and micro-actions into a transparent wallet with no hidden fees, instant
              OTP login, and UPI cash-outs you can trust.
            </p>
          </motion.div>

          <motion.div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start" variants={fadeInUp}>
            <Button asChild size="lg" className="text-base">
              <Link href="/login">
                Launch dashboard
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-base">
              <Link href="/register">Create free account</Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-wrap items-center justify-center gap-4 text-left text-sm text-muted-foreground lg:justify-start"
            variants={fadeInUp}
          >
            {checklist.map((item) => (
              <span key={item} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-3 py-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                {item}
              </span>
            ))}
          </motion.div>
        </motion.div>

        <motion.div className="relative" variants={fadeInUp}>
          <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-tr from-primary/30 via-primary/5 to-transparent blur-3xl" />
          <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-background/80 shadow-2xl shadow-primary/10">
            <div className="space-y-6 px-8 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground/70">Wallet snapshot</p>
                  <p className="text-3xl font-semibold text-foreground">₹1,24,800</p>
                </div>
                <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
                  +₹9,200 today
                </span>
              </div>

              <div className="grid gap-4 rounded-2xl border border-white/5 bg-muted/5 p-4 sm:grid-cols-2">
                {highlights.map((highlight) => (
                  <div key={highlight.label} className="space-y-1 rounded-xl border border-white/5 bg-background/60 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground/70">
                      <highlight.icon className="h-4 w-4 text-primary" />
                      {highlight.label}
                    </div>
                    <p className="text-lg font-semibold text-foreground">{highlight.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-4 rounded-2xl border border-white/5 bg-background/80 p-4">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Task approvals</span>
                  <span>92% this week</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full w-[92%] rounded-full bg-primary" />
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Referral conversions</span>
                  <span>48 new installs</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div className="h-full w-2/3 rounded-full bg-secondary" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}


