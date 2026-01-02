"use client";

import { motion } from "framer-motion";

import { fadeInUp, viewport } from "@/components/marketing/animations";

const metrics = [
  { label: "Dispute resolution", value: "97% resolved within 12 hours" },
  { label: "Dashboard uptime", value: "99.98% monitored availability" },
  { label: "Fraud blocked", value: "11,420+ fake and duplicate installs prevented" },
];

const reviewers = [
  { label: "Reviewer pods", value: "6 active review teams" },
  { label: "Peak load SLA", value: "Under 5 minutes" },
];

export function ComplianceDashboard() {
  return (
    <motion.section
      className="px-6 pb-20 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
    >
      <div className="mx-auto max-w-6xl rounded-[32px] border border-white/10 bg-gradient-to-b from-primary/10 via-background to-background p-8 shadow-2xl shadow-primary/10">
        <div className="space-y-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Operational trust</p>
            <p className="text-3xl font-semibold text-foreground">Compliance-first dashboard</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Every payout on Gainzio is backed by proof, audit logs, GST-ready invoices, and OTP-secured access.
              All activity is logged, traceable, and reviewable—built for transparency from day one.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4 rounded-2xl border border-white/5 bg-background/70 p-5">
              {metrics.map((metric) => (
                <div key={metric.label} className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>{metric.label}</span>
                  <span className="font-semibold text-foreground">{metric.value}</span>
                </div>
              ))}
            </div>

            <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              {reviewers.map((reviewer) => (
                <div key={reviewer.label} className="flex items-center justify-between text-sm text-primary/90">
                  <span>{reviewer.label}</span>
                  <span className="font-semibold text-foreground">{reviewer.value}</span>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">
                Dedicated human reviewers work in shifts so dispute queues are actively monitored, including weekends and holidays.
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}

