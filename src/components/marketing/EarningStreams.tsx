"use client";

import { Briefcase, Gift, MessagesSquare, Zap } from "lucide-react";
import { motion } from "framer-motion";

import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";
import { cn } from "@/lib/utils";

const earnings = [
  {
    title: "App Installs",
    description: "Earn highest payouts per verified install. We partner with top brands like Dream11, Zupee, and more.",
    icon: Briefcase,
    rate: "₹42 - ₹160",
    color: "bg-blue-500/10 text-blue-500",
    size: "col-span-1 md:col-span-2",
  },
  {
    title: "Social Tasks",
    description: "Post WhatsApp status & Instagram stories. Get paid for engagement.",
    icon: MessagesSquare,
    rate: "₹8 - ₹60",
    color: "bg-purple-500/10 text-purple-500",
    size: "col-span-1",
  },
  {
    title: "Instant UPI Rewards",
    description: "Complete quick surveys and small tasks. No waiting, instant credit.",
    icon: Zap,
    rate: "₹25 - ₹500",
    color: "bg-amber-500/10 text-amber-500",
    size: "col-span-1",
  },
  {
    title: "Shop & Earn",
    description: "Get cashback on product purchases. Upload invoice & earn real cash back.",
    icon: Gift,
    rate: "Up to 15%",
    color: "bg-emerald-500/10 text-emerald-500",
    size: "col-span-1 md:col-span-2",
  },
];

export function EarningStreams() {
  return (
    <motion.section
      id="features"
      className="container mx-auto px-4 md:px-6 py-24"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={stagger}
    >
      <div className="mb-16 text-center">
        <motion.div variants={fadeInUp} className="inline-block mb-4 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
          Multiple Income Streams
        </motion.div>
        <motion.h2 variants={fadeInUp} className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          More ways to fill your wallet
        </motion.h2>
        <motion.p variants={fadeInUp} className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Don't rely on just one source. Mix referrals, tasks, and cashback to maximize your daily earnings.
        </motion.p>
      </div>

      <motion.div className="grid gap-6 md:grid-cols-3" variants={stagger}>
        {earnings.map((earning, i) => (
          <motion.div
            key={earning.title}
            className={cn(
              "group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-6 sm:p-8 transition-all hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/5",
              earning.size
            )}
            variants={fadeInUp}
          >
            <div className={cn("inline-flex h-12 w-12 items-center justify-center rounded-xl mb-6", earning.color)}>
              <earning.icon className="h-6 w-6" />
            </div>

            <h3 className="text-2xl font-bold mb-2">{earning.title}</h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">{earning.description}</p>

            <div className="absolute bottom-6 right-6">
              <span className="inline-flex items-center rounded-full border border-white/10 bg-background/50 backdrop-blur px-3 py-1 text-sm font-medium">
                <span className="mr-2 h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                {earning.rate}
              </span>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </motion.section>
  );
}


