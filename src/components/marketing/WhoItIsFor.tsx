"use client";

import { GraduationCap, Megaphone, Share2 } from "lucide-react";
import { motion } from "framer-motion";

import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";

const audiences = [
  {
    title: "Students & part-timers",
    description: "Fill tiny gaps between classes or shifts with high-paying drops.",
    icon: GraduationCap,
    pains: ["Daily cash target", "Flexible hours"],
  },
  {
    title: "Creators & influencers",
    description: "Turn your WhatsApp status, reels, and Twitter audience into consistent payouts.",
    icon: Megaphone,
    pains: ["No brand manager", "Need transparent payouts"],
  },
  {
    title: "App sharers & referrers",
    description: "If you already convince friends to install apps, it’s time you got paid for it.",
    icon: Share2,
    pains: ["Manual tracking", "Zero proof of installs"],
  },
];

export function WhoItIsFor() {
  return (
    <motion.section
      className="px-4 pb-20 md:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={stagger}
    >
      <div className="mx-auto max-w-6xl space-y-10">
        <motion.div className="space-y-3 text-center" variants={fadeInUp}>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Built for people who squeeze earnings between real life
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            Whether you’re studying, grinding a night shift, or juggling content calendars, Gainzio wraps around your day.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground"
          variants={fadeInUp}
        >
          {["No joining fee", "Transparent proofs", "Instant UPI", "Multi-app tracking", "24×7 support"].map((pill) => (
            <span key={pill} className="rounded-full border border-white/10 px-4 py-2">
              {pill}
            </span>
          ))}
        </motion.div>

        <motion.div className="grid gap-6 md:grid-cols-3" variants={stagger}>
          {audiences.map((audience) => (
            <motion.div
              key={audience.title}
              className="rounded-3xl border border-white/10 bg-muted/5 p-6 shadow-lg shadow-black/5"
              variants={fadeInUp}
            >
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                <audience.icon className="h-5 w-5" />
              </div>
              <div className="mt-4 space-y-3">
                <h3 className="text-xl font-semibold text-foreground">{audience.title}</h3>
                <p className="text-base text-muted-foreground">{audience.description}</p>
                <div className="flex flex-wrap gap-2">
                  {audience.pains.map((pain) => (
                    <span key={pain} className="rounded-full bg-background/80 px-3 py-1 text-xs text-muted-foreground">
                      {pain}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.section>
  );
}


