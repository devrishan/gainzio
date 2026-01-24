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
    <>
      {/* Mobile Header (Full Width) */}
      <header className="fixed top-0 left-0 right-0 z-50 md:hidden border-b border-white/5 bg-black/60 backdrop-blur-2xl">
        <div className="flex items-center justify-between px-4 h-16">
          <GainzioLogo href="/" size="md" />

          {/* Mobile Menu Trigger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white hover:bg-white/5">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[350px] flex flex-col gap-8 pt-10 border-l border-white/10 bg-black/90 backdrop-blur-3xl">
              <div className="flex justify-center relative">
                <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-50" />
                <GainzioLogo href="/" size="xl" className="relative z-10" />
              </div>

              <div className="flex flex-col gap-4 text-base font-medium text-zinc-400">
                {navLinks.map((link) =>
                  link.href.startsWith("#") ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="py-3 hover:text-white hover:pl-2 transition-all border-b border-white/5"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      href={link.href as Route}
                      className="py-3 hover:text-white hover:pl-2 transition-all border-b border-white/5"
                    >
                      {link.label}
                    </Link>
                  ),
                )}
              </div>

              <div className="flex flex-col gap-3 mt-auto mb-8">
                <Button asChild variant="outline" className="w-full rounded-full border-white/10 bg-white/5 hover:bg-white/10 hover:text-white hover:border-white/20">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="w-full rounded-full shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)]">
                  <Link href="/register">Get Started</Link>
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* Desktop Header (Floating Pill) */}
      <header className="hidden md:block fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
        <div className="rounded-full border border-white/5 bg-black/40 px-6 py-3 backdrop-blur-2xl shadow-[0_0_30px_-10px_rgba(0,0,0,0.5)] ring-1 ring-white/10 transition-all duration-300 hover:bg-black/50 hover:shadow-primary/5">
          <nav className="flex items-center justify-between">
            <div className="group relative">
              <div className="absolute -inset-2 bg-primary/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
              <GainzioLogo href="/" size="lg" className="relative transition-transform duration-300 group-hover:scale-105" />
            </div>

            <div className="hidden items-center gap-8 text-sm font-medium text-zinc-400 md:flex">
              {navLinks.map((link) =>
                link.href.startsWith("#") ? (
                  <a key={link.label} href={link.href} className="relative py-1 group transition-colors hover:text-white">
                    {link.label}
                    <span className="absolute inset-x-0 -bottom-1 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </a>
                ) : (
                  <Link key={link.label} href={link.href as Route} className="relative py-1 group transition-colors hover:text-white">
                    {link.label}
                    <span className="absolute inset-x-0 -bottom-1 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
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
                  "hidden md:inline-flex rounded-full transition-all duration-300",
                  isLoginPage
                    ? "rounded-full shadow-[0_0_15px_hsl(var(--primary)/0.3)] hover:bg-primary/90"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Link href="/login">Log in</Link>
              </Button>

              <Button
                asChild
                size="sm"
                variant={isLoginPage ? "ghost" : "default"}
                className={cn(
                  "hidden md:inline-flex rounded-full transition-all duration-300",
                  isLoginPage
                    ? "text-zinc-400 hover:text-white hover:bg-white/5"
                    : "bg-primary px-6 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.5)] hover:bg-primary/90 hover:shadow-primary/40 hover:scale-105"
                )}
              >
                <Link href="/register">Get Started</Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
