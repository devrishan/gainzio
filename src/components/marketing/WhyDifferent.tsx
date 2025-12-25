"use client";

import { BadgeCheck, MessageCircle, ReceiptText, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";

const differentiators = [
  {
    title: "No joining fee",
    description: "Start earning with zero upfront charges or hidden fees.",
    icon: BadgeCheck,
  },
  {
    title: "Verified tasks only",
    description: "We list trusted apps and brands—no fake or shady offers.",
    icon: ShieldCheck,
  },
  {
    title: "Transparent wallet history",
    description: "See every credit, debit, and withdrawal with downloadable receipts.",
    icon: ReceiptText,
  },
  {
    title: "Support that actually replies",
    description: "In-app help desk and chatbot with real people reviewing behind the scenes.",
    icon: MessageCircle,
  },
];

export function WhyDifferent() {
  return (
    <motion.section
      className="px-6 pb-20 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={stagger}
    >
      <div className="mx-auto max-w-6xl space-y-12">
        <motion.div className="space-y-3 text-center" variants={fadeInUp}>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">Why Gainzio is different</h2>
          <p className="text-base text-muted-foreground md:text-lg">
            Built for trust, speed, and transparency—because every rupee deserves a clean record.
          </p>
        </motion.div>

        <motion.div className="grid gap-6 sm:grid-cols-2" variants={stagger}>
          {differentiators.map((item) => (
            <motion.div
              key={item.title}
              className="h-full rounded-3xl border border-white/10 bg-background/80 p-6 shadow-lg shadow-black/5"
              variants={fadeInUp}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 space-y-2">
                <h3 className="text-2xl font-semibold text-foreground">{item.title}</h3>
                <p className="text-base leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}


