import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Inter } from "next/font/google";
import "./globals.css";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "@/components/ui/sonner";
import { ReferralTracker } from "@/components/auth/referral-tracker";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Gainzio – Smart Earning & Referral Platform",
  description:
    "Gainzio helps you earn rewards by completing tasks and referring friends. Transparent earnings, fast UPI withdrawals, and a trusted platform.",

  keywords: [
    "Gainzio",
    "earn money online",
    "referral platform",
    "task earning app",
    "UPI withdrawal",
    "passive income India"
  ],

  openGraph: {
    title: "Gainzio – Smart Earning & Referral Platform",
    description:
      "Complete tasks, invite friends, and earn real rewards with Gainzio.",
    url: "https://gainzio.com",
    siteName: "Gainzio",
    type: "website"
  },

  twitter: {
    card: "summary_large_image",
    title: "Gainzio",
    description:
      "Earn smarter with tasks and referrals on Gainzio."
  },

  robots: {
    index: true,
    follow: true
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <SessionProvider>
              <ReferralTracker />
              {children}
              <Toaster position="top-right" />
            </SessionProvider>
          </QueryProvider>
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html >
  );
}

