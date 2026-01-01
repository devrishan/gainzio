"use client";

import Link from "next/link";
import { motion } from "framer-motion";

import { fadeInUp, viewport } from "@/components/marketing/animations";
import { GainzioLogo } from "../shared/logo";

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
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:gap-8 lg:flex-row lg:justify-between">
        {/* Brand Section */}
        <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left lg:max-w-sm">
          <GainzioLogo size="sm" />
          <div className="flex flex-col gap-4">
            <p className="text-sm leading-relaxed text-muted-foreground md:pr-4">
              Earn rewards by completing tasks and referring friends. Fast payouts, transparent tracking, and a trusted earning experience.
            </p>
            <p className="text-xs font-medium text-muted-foreground/60">
              UPI-based payouts • Secure verification • Fraud-protected
            </p>
          </div>
        </div>

        {/* Links Section */}
        <div className="grid flex-1 grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          {columns.map((column) => (
            <div key={column.title} className="flex flex-col items-center space-y-4 md:items-start md:space-y-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-foreground md:text-muted-foreground">
                {column.title}
              </p>
              <ul className="flex w-full flex-col items-center space-y-1 md:items-start md:space-y-2">
                {column.links.map((link) => (
                  <li key={link.label} className="w-full text-center md:text-left">
                    <Link
                      href={link.href}
                      className="block w-full py-3 text-base text-muted-foreground transition-colors hover:text-foreground focus:text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 md:py-0 md:text-sm"
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

      <p className="mx-auto mt-12 max-w-6xl text-center text-xs text-muted-foreground md:mt-10 md:text-left">
        © {new Date().getFullYear()} Gainzio. All rights reserved.
      </p>
    </motion.footer>
  );
}
