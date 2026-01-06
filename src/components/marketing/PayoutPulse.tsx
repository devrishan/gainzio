"use client";

import { motion } from "framer-motion";

import { fadeInUp, viewport } from "@/components/marketing/animations";

const payoutStats = [
  { label: "Avg. approval time", value: "3h 14m" },
  { label: "Fastest withdrawal", value: "41s" },
  { label: "Pending disputes", value: "12 (0.04%)" },
  { label: "Fraud blocked", value: "11,420+ installs" },
];

export function PayoutPulse() {
  return (
    <motion.section
      className="px-4 pb-20 md:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-[32px] border border-white/10 bg-gradient-to-br from-primary/5 via-background/90 to-background p-8 shadow-2xl shadow-primary/10">
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.3em] text-primary/80">Payout pulse</p>
              <p className="text-3xl font-semibold text-foreground">₹2.7L released this week</p>
              <p className="mt-1 text-sm text-muted-foreground">Live approvals, dispute queue, and withdrawal velocity.</p>
            </div>

            <div className="space-y-4 rounded-2xl border border-white/5 bg-background/80 p-5">
              {payoutStats.map((stat) => (
                <div key={stat.label} className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{stat.label}</span>
                  <span className="font-semibold text-foreground">{stat.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-5 text-sm text-muted-foreground">
              <p className="font-semibold text-foreground">Smart routing</p>
              <p>High-performing earners unlock surge payouts, higher task caps, and early settlement windows.</p>
            </div>
          </div>
        </div>

        <div className="rounded-[32px] border border-emerald-400/30 bg-emerald-400/10 p-8 text-emerald-50 shadow-2xl shadow-emerald-400/20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-100/80">Instant UPI</p>
          <p className="mt-3 text-3xl font-semibold text-white">₹82,400 released in the last 24h</p>
          <p className="mt-2 text-sm text-emerald-100">
            Every withdrawal is OTP-verified, GST-ready, and logged for your records. No hidden processing fee—ever.
          </p>
          <div className="mt-6 space-y-2 text-xs uppercase tracking-[0.3em] text-emerald-100/80">
            <p>UPI rails · RazorpayX · Axis Bank nodal account</p>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

