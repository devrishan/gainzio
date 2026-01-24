"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { fadeInUp, viewport } from "@/components/marketing/animations";
import { GainzioLogo } from "../shared/logo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const columns = [
  {
    title: "Product",
    links: [
      { label: "Dashboard", href: "/member/dashboard" },
      { label: "Tasks", href: "/member/tasks" },
      { label: "Referrals", href: "/member/referrals" },
      { label: "Wallet", href: "/member/wallet" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Support", href: "/support" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Payout & Dispute Policy", href: "/payout-policy" },
      { label: "Content Guidelines", href: "/guidelines" },
      { label: "Grievance Officer", href: "/grievance" },
    ],
  },
];

export function SiteFooter() {
  return (
    <motion.footer
      className="border-t border-white/5 bg-black relative overflow-hidden"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            <div className="flex items-center gap-2">
              <GainzioLogo size="sm" />
              <span className="text-xs font-mono text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-0.5 rounded">v2.0.4</span>
            </div>

            <p className="text-sm leading-relaxed text-zinc-400 max-w-sm">
              Next-generation earning infrastructure. Verified tasks, instant UPI payouts, and a fraud-proof ecosystem built for the modern internet.
            </p>

            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-500/80">
                All Systems Operational
              </span>
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col items-start space-y-4">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">
                  {column.title}
                </h4>
                <ul className="flex flex-col space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-zinc-400 transition-all hover:text-primary hover:pl-1 duration-300"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-600">
          <p>© {new Date().getFullYear()} Gainzio Network. Engineered in India 🇮🇳.</p>
          <div className="flex gap-6 font-mono opacity-50">
            <span>Server Time: {new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })} UTC</span>
            <span>Latency: 24ms</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
