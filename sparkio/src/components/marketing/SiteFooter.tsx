"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { fadeInUp, viewport } from "@/components/marketing/animations";

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
    ],
  },
];

export function SiteFooter() {
  return (
    <motion.footer
      className="border-t border-white/5 bg-background px-6 py-12 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-10 lg:flex-row lg:justify-between">
        <div className="space-y-4 lg:max-w-sm">
          <div className="inline-flex items-center gap-3">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-lg font-semibold text-primary">
              ✦
            </span>
            <span className="text-xl font-semibold tracking-tight">Gainzio</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Earn rewards by completing tasks and referring friends. Fast payouts, transparent tracking, and a trusted earning experience.
          </p>
        </div>

        <div className="grid flex-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{column.title}</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="transition hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <p className="mx-auto mt-10 max-w-6xl text-xs text-muted-foreground">© {new Date().getFullYear()} Gainzio. All rights reserved.</p>
    </motion.footer>
  );
}

