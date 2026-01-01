"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Button } from "@/components/ui/button";
import { GainzioLogo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

const navLinks: { label: string; href: Route | `#${string}` }[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Dashboard", href: "/member/dashboard" },
  { label: "Support", href: "/support" },
  { label: "Download App", href: "/download" },
];

export function Navbar() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  return (
    <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
      <div className="rounded-full border border-white/10 bg-background/60 px-6 py-3 backdrop-blur-xl shadow-lg ring-1 ring-black/5 dark:bg-background/40">
        <nav className="flex items-center justify-between">
          <GainzioLogo href="/" size="lg" className="transition-transform hover:scale-105" />

          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            {navLinks.map((link) =>
              link.href.startsWith("#") ? (
                <a key={link.label} href={link.href} className="transition hover:text-primary">
                  {link.label}
                </a>
              ) : (
                <Link key={link.label} href={link.href as Route} className="transition hover:text-primary">
                  {link.label}
                </Link>
              ),
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="sm"
              variant={isLoginPage ? "default" : "ghost"}
              className={cn(
                "hidden md:inline-flex",
                isLoginPage
                  ? "rounded-full shadow-md hover:bg-primary/90"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Link href="/login">Log in</Link>
            </Button>

            <Button
              asChild
              size="sm"
              variant={isLoginPage ? "ghost" : "default"}
              className={cn(
                "rounded-full",
                isLoginPage
                  ? "text-muted-foreground hover:text-foreground hover:bg-transparent"
                  : "bg-primary px-6 shadow-md shadow-primary/20 hover:bg-primary/90"
              )}
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}
