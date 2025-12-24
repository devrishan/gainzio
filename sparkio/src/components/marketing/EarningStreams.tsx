"use client";

import { Briefcase, Gift, MessagesSquare } from "lucide-react";
import { motion } from "framer-motion";

import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";

const earnings = [
  {
    title: "App referrals",
    description: "Earn per verified install or signup from your unique link. No shady APKs—only audited partner apps.",
    icon: Briefcase,
    rate: "₹42 - ₹160 / install",
    meta: "Auto-track duplicate installs & fraud filters.",
  },
  {
    title: "UPI & purchase rewards",
    description: "Get paid for completing UPI-first tasks or product purchases tracked through proof uploads.",
    icon: Gift,
    rate: "₹25 - ₹500 / task",
    meta: "Proof uploads + SMS capture keep brands confident.",
  },
  {
    title: "Social tasks & status",
    description: "Earn for WhatsApp status, follows, and engagement tasks with screenshot-backed approvals.",
    icon: MessagesSquare,
    rate: "₹8 - ₹60 / publish",
    meta: "Realtime screenshot checks and auto-approval timers.",
  },
];

export function EarningStreams() {
  return (
    <motion.section
      id="features"
      className="px-6 pb-20 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={stagger}
    >
      <div className="mx-auto max-w-6xl space-y-12">
        <motion.div className="space-y-3 text-center" variants={fadeInUp}>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Earning streams that keep money moving daily
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            Mix referrals, UPI-backed tasks, and social drops. Diversify your wallet without juggling shady apps.
          </p>
        </motion.div>

        <motion.div className="grid gap-6 md:grid-cols-3" variants={stagger}>
          {earnings.map((earning) => (
            <motion.div
              key={earning.title}
              className="flex h-full flex-col rounded-3xl border border-white/10 bg-background/80 p-6 shadow-lg shadow-black/5 ring-1 ring-white/5 transition hover:-translate-y-1 hover:border-primary/40"
              variants={fadeInUp}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10 text-secondary-foreground">
                <earning.icon className="h-5 w-5" />
              </div>
              <div className="mt-6 space-y-3">
                <h3 className="text-2xl font-semibold text-foreground">{earning.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{earning.description}</p>
                <div className="rounded-2xl border border-dashed border-white/10 bg-muted/5 p-4">
                  <p className="text-sm font-semibold text-primary">{earning.rate}</p>
                  <p className="text-xs text-muted-foreground">{earning.meta}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}


