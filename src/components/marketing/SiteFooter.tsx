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
      className="border-t border-white/5 bg-background px-6 py-12 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12">
          {/* Brand Section */}
          <div className="flex flex-col items-center gap-6 text-center md:items-start md:text-left lg:max-w-sm">
            <GainzioLogo size="sm" />
            <div className="flex flex-col gap-4">
              <p className="text-sm leading-relaxed text-muted-foreground md:pr-4">
                Gainzio<br />
                Earn rewards by completing verified tasks and referring friends.
                Fast payouts, transparent tracking, and a compliance-first earning experience.
              </p>
              <p className="text-xs font-medium text-muted-foreground/60">
                UPI-based payouts • Secure verification • Fraud-protected
              </p>
            </div>
          </div>

          {/* Desktop Links (Hidden on Mobile) */}
          <div className="hidden md:grid flex-1 grid-cols-3 gap-8">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col items-start space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  {column.title}
                </p>
                <ul className="flex flex-col space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile Links (Accordion) */}
          <div className="md:hidden w-full">
            <Accordion type="single" collapsible className="w-full">
              {columns.map((column) => (
                <AccordionItem key={column.title} value={column.title} className="border-white/5">
                  <AccordionTrigger className="text-sm font-semibold uppercase tracking-wide text-foreground">
                    {column.title}
                  </AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col space-y-3 pt-2 pb-4">
                      {column.links.map((link) => (
                        <li key={link.label}>
                          <Link
                            href={link.href}
                            className="block text-base text-muted-foreground transition-colors hover:text-foreground"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>

        <p className="mt-12 text-center text-xs text-muted-foreground md:mt-10 md:text-left border-t border-white/5 pt-8 md:border-none md:pt-0">
          © {new Date().getFullYear()} Gainzio. All rights reserved. Made for India 🇮🇳.
        </p>
      </div>
    </motion.footer>
  );
}
