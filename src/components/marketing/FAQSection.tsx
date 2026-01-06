"use client";

import React from "react";
import type { Route } from "next";
import Link from "next/link";
import { motion } from "framer-motion";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { fadeInUp, viewport } from "@/components/marketing/animations";

interface FAQ {
  question: string;
  answer: string;
}

const faqs: readonly FAQ[] = [
  {
    question: "Is this safe and legal?",
    answer:
      "Yes. Gainzio works only with verified apps and brands and processes payouts via compliant UPI transfers. All transactions are logged with audit trails and follow Indian digital payment and GST-aligned standards.",
  },
  {
    question: "Do I need to invest money to start?",
    answer: "No. Gainzio does not require any upfront payment, deposits, or joining fees. You earn only by completing verified tasks or referrals.",
  },
  {
    question: "How do withdrawals work?",
    answer: "Once your confirmed wallet balance reaches ₹50 (for your first withdrawal) or ₹150 (for subsequent withdrawals), you can request a payout directly to your personal UPI ID. Funds are transferred after OTP verification. Most withdrawals are processed within the stated SLA.",
  },
  {
    question: "What if my task gets rejected?",
    answer:
      "If a task is rejected, the exact reason is shown in your dashboard. You can raise a dispute for manual review, and our human review team re-checks the submission within the defined SLA.",
  },
] as const;

const SUPPORT_SIDEBAR = {
  heading: "Need a human?",
  title: "Support team replies in under 15 minutes",
  description: "Chat with us directly inside the dashboard or raise a support ticket if a task requires manual review.",
  buttonText: "Open support (login required)",
  buttonHref: "/login" as Route,
  emailText: "Prefer email? Write to hello@gainzio.com",
} as const;

interface FAQItemProps {
  question: string;
  answer: string;
  value: string;
}

const FAQItem = React.memo<FAQItemProps>(({ question, answer, value }) => {
  return (
    <article>
      <AccordionItem
        value={value}
        className="rounded-2xl border border-white/10 bg-muted/5 px-4"
      >
        <AccordionTrigger className="text-left text-lg font-medium text-foreground">
          {question}
        </AccordionTrigger>
        <AccordionContent className="text-base text-muted-foreground">
          {answer}
        </AccordionContent>
      </AccordionItem>
    </article>
  );
});

FAQItem.displayName = "FAQItem";

interface SupportSidebarProps {
  heading: string;
  title: string;
  description: string;
  buttonText: string;
  buttonHref: Route;
  emailText: string;
}

const SupportSidebar = React.memo<SupportSidebarProps>(
  ({ heading, title, description, buttonText, buttonHref, emailText }) => {
    return (
      <aside
        className="rounded-3xl border border-primary/20 bg-primary/5 p-6 text-center lg:text-left"
        aria-label="Support information"
      >
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">
          {heading}
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-foreground">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>

        <div className="mt-6 space-y-3">
          <Button asChild className="w-full" aria-label="Navigate to login page to access support">
            <Link href={buttonHref}>{buttonText}</Link>
          </Button>
          <p className="text-xs text-muted-foreground">{emailText}</p>
        </div>
      </aside>
    );
  }
);

SupportSidebar.displayName = "SupportSidebar";

export const FAQSection = React.memo(() => {
  const sectionId = "faq-section";
  const headingId = "faq-heading";

  return (
    <motion.section
      id={sectionId}
      className="px-4 pb-24 md:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={viewport}
      variants={fadeInUp}
      aria-label="Frequently asked questions"
    >
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="space-y-3 text-center">
          <h2 id={headingId} className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Frequently asked questions
          </h2>
          <p className="text-base text-muted-foreground md:text-lg">
            Still curious? These quick answers cover the most common Gainzio questions.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Accordion
            type="single"
            collapsible
            className="space-y-4"
            aria-labelledby={headingId}
          >
            {faqs.map((faq) => (
              <FAQItem
                key={faq.question}
                question={faq.question}
                answer={faq.answer}
                value={faq.question}
              />
            ))}
          </Accordion>

          <SupportSidebar {...SUPPORT_SIDEBAR} />
        </div>
      </div>
    </motion.section>
  );
});

FAQSection.displayName = "FAQSection";
