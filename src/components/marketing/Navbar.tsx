"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

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
                "hidden md:inline-flex rounded-full",
                isLoginPage
                  ? "text-muted-foreground hover:text-foreground hover:bg-transparent"
                  : "bg-primary px-6 shadow-md shadow-primary/20 hover:bg-primary/90"
              )}
            >
              <Link href="/register">Get Started</Link>
            </Button>

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground hover:text-foreground">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[350px] flex flex-col gap-8 pt-10">
                <div className="flex justify-center">
                  <GainzioLogo href="/" size="xl" />
                </div>

                <div className="flex flex-col gap-4 text-base font-medium text-muted-foreground">
                  {navLinks.map((link) =>
                    link.href.startsWith("#") ? (
                      <a
                        key={link.label}
                        href={link.href}
                        className="py-2 hover:text-primary transition-colors border-b border-border/40"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        key={link.label}
                        href={link.href as Route}
                        className="py-2 hover:text-primary transition-colors border-b border-border/40"
                      >
                        {link.label}
                      </Link>
                    ),
                  )}
                </div>

                <div className="flex flex-col gap-3 mt-auto">
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href="/login">Log in</Link>
                  </Button>
                  <Button asChild className="w-full rounded-full shadow-lg shadow-primary/20">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </div>
    </header>
  );
}
