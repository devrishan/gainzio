import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const navLinks: { label: string; href: Route | `#${string}` }[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Dashboard", href: "/member/dashboard" },
  { label: "Support", href: "/support" },
  { label: "Download App", href: "/download" },
];

export function Navbar() {
  return (
    <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-7xl px-4">
      <div className="rounded-full border border-white/10 bg-background/60 px-6 py-3 backdrop-blur-xl shadow-lg ring-1 ring-black/5 dark:bg-background/40">
        <nav className="flex items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-2" aria-label="Gainzio home">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 transition-transform group-hover:scale-105">
              <Sparkles className="h-5 w-5 fill-current" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground/90">Gainzio</span>
          </Link>

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
            <Button asChild size="sm" variant="ghost" className="hidden md:inline-flex text-muted-foreground hover:text-foreground">
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild size="sm" className="rounded-full bg-primary px-6 shadow-md shadow-primary/20 hover:bg-primary/90">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

