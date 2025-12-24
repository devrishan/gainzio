"use client";

import React from "react";
import { Check } from "lucide-react";
import { motion } from "framer-motion";

import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";

interface AuthLayoutProps {
  children: React.ReactNode;
  showMarketing?: boolean;
}

const benefits = [
  "Instant UPI payouts",
  "Live wallet tracking",
  "OTP-secured dashboard",
];

export function AuthLayout({ children, showMarketing = false }: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Background gradient matching homepage */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-x-0 top-0 h-96 bg-gradient-to-b from-primary/25 to-transparent blur-3xl" />
        <div className="absolute left-[10%] top-20 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute right-[10%] bottom-20 h-80 w-80 rounded-full bg-secondary/10 blur-3xl" />
      </div>

      {showMarketing ? (
        <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-12 lg:grid-cols-2 lg:items-center">
          {/* Marketing panel */}
          <motion.div
            className="hidden space-y-6 text-center lg:block lg:text-left"
            initial="hidden"
            animate="visible"
            viewport={viewport}
            variants={stagger}
          >
            <motion.div className="space-y-4" variants={fadeInUp}>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Join thousands earning with Gainzio
              </h2>
              <p className="text-base leading-relaxed text-muted-foreground sm:text-lg">
                Track tasks, referrals, and withdrawals in one transparent dashboard with instant UPI cash-outs.
              </p>
            </motion.div>
            <motion.ul className="space-y-3 pt-4" variants={fadeInUp}>
              {benefits.map((benefit, index) => (
                <motion.li
                  key={benefit}
                  className="flex items-center gap-3 text-sm text-muted-foreground"
                  variants={fadeInUp}
                  transition={{ delay: index * 0.1 }}
                >
                  <Check className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <span>{benefit}</span>
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Form card */}
          <motion.div
            className="w-full lg:max-w-md"
            initial="hidden"
            animate="visible"
            viewport={viewport}
            variants={fadeInUp}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="relative"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              {/* Soft glow behind card */}
              <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-tr from-primary/30 via-primary/5 to-transparent blur-3xl" />
              <motion.div
                className="relative rounded-[32px] border border-white/10 bg-background/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur sm:p-10"
                whileHover={{ boxShadow: "0 25px 50px -12px rgba(255, 107, 53, 0.25)" }}
                transition={{ duration: 0.2 }}
              >
                {children}
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      ) : (
        /* Centered single card layout */
        <motion.div
          className="w-full max-w-md"
          initial="hidden"
          animate="visible"
          viewport={viewport}
          variants={fadeInUp}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="relative"
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* Soft glow behind card */}
            <div className="absolute inset-0 -z-10 rounded-[32px] bg-gradient-to-tr from-primary/30 via-primary/5 to-transparent blur-3xl" />
            <motion.div
              className="relative rounded-[32px] border border-white/10 bg-background/80 p-8 shadow-2xl shadow-primary/10 backdrop-blur sm:p-10"
              whileHover={{ boxShadow: "0 25px 50px -12px rgba(255, 107, 53, 0.25)" }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
