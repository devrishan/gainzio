"use client";

import { BadgeCheck, IndianRupee, Share2, WalletMinimal } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { fadeInUp, stagger, viewport } from "@/components/marketing/animations";

const steps = [
  {
    title: "Sign Up",
    description: "Create free account using Google. No complex forms.",
    icon: BadgeCheck,
    color: "bg-blue-500",
  },
  {
    title: "Complete Tasks",
    description: "Choose from 50+ daily tasks offering verified payouts.",
    icon: Share2,
    color: "bg-amber-500",
  },
  {
    title: "Get Paid",
    description: "Withdraw instantly to UPI once you reach ₹50.",
    icon: IndianRupee,
    color: "bg-green-500",
  },
];

export function HowItWorks() {
  return (
    <motion.section
      id="how-it-works"
      className="relative container mx-auto px-6 py-24"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={stagger}
    >
      <div className="mb-20 text-center max-w-2xl mx-auto">
        <motion.p variants={fadeInUp} className="text-sm font-bold uppercase tracking-widest text-primary mb-3">Simple Process</motion.p>
        <motion.h2 variants={fadeInUp} className="text-3xl font-bold text-foreground md:text-5xl mb-6">Start Earning in Minutes</motion.h2>
        <motion.p variants={fadeInUp} className="text-lg text-muted-foreground">
          No experience needed. Just follow these 3 simple steps to get your first payout today.
        </motion.p>
      </div>

      <div className="relative grid gap-8 md:grid-cols-3 mb-16">
        {/* Connecting Line (Desktop) */}
        <div className="absolute top-12 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary/20 to-transparent hidden md:block" />

        {steps.map((step, index) => (
          <motion.div
            key={step.title}
            className="relative flex flex-col items-center text-center z-10"
            variants={fadeInUp}
          >
            <div className={`flex h-24 w-24 items-center justify-center rounded-3xl ${step.color} shadow-lg shadow-${step.color}/20 text-white mb-8 transition-transform hover:scale-110 hover:rotate-3`}>
              <step.icon className="h-10 w-10" />
            </div>

            <div className="absolute top-8 right-0 text-9xl font-bold text-foreground/5 -z-10 select-none hidden md:block">
              {index + 1}
            </div>

            <h3 className="text-xl font-bold mb-3">{step.title}</h3>
            <p className="text-muted-foreground leading-relaxed max-w-xs mx-auto">{step.description}</p>
          </motion.div>
        ))}
      </div>

      <motion.div className="text-center" variants={fadeInUp}>
        <Button asChild size="lg" className="rounded-full px-8 h-12 text-base">
          <Link href="/register">Create Account Now</Link>
        </Button>
      </motion.div>
    </motion.section>
  );
}


