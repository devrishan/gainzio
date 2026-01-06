"use client";

import { motion } from "framer-motion";

import { fadeInUp, viewport } from "@/components/marketing/animations";

const badges = [
  "₹0 Joining Fee",
  "100% Verified Payouts",
  "24h Processing",
  "₹50 First Payout",
  "GST-ready invoices",
  "Fraud protected",
];

export function TrustStrip() {
  return (
    <motion.section
      className="border-t border-white/5 bg-muted/10 px-4 py-8 text-xs text-muted-foreground sm:text-sm md:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-4">
        <p className="text-center text-[0.7rem] uppercase tracking-[0.4em] text-muted-foreground/70 sm:text-xs">
          Trusted rails powering every payout
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          {badges.map((badge) => (
            <div key={badge} className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2">
              <span role="img" aria-hidden="true">
                {badge.split(" ")[0]}
              </span>
              <span className="text-muted-foreground">{badge.substring(badge.indexOf(" ") + 1)}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}


