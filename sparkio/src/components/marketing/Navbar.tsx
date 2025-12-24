import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const navLinks: { label: string; href: Route | `#${string}` }[] = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how-it-works" },
  { label: "Dashboard", href: "/member/dashboard" },
  { label: "Support", href: "#support" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 lg:px-12">
        <Link href="/" className="group inline-flex items-center gap-2" aria-label="Gainzio home">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 text-lg font-semibold text-primary transition group-hover:bg-primary/30">
            ✦
          </span>
          <span className="text-lg font-semibold tracking-tight">Gainzio</span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {navLinks.map((link) =>
            link.href.startsWith("#") ? (
              <a key={link.label} href={link.href} className="transition hover:text-foreground">
                {link.label}
              </a>
            ) : (
              <Link key={link.label} href={link.href as Route} className="transition hover:text-foreground">
                {link.label}
              </Link>
            ),
          )}
        </div>

        <Button asChild size="sm" className="hidden md:inline-flex">
          <Link href="/login">Open Member Dashboard</Link>
        </Button>

        <Button asChild size="sm" variant="outline" className="md:hidden">
          <Link href="/login">Dashboard</Link>
        </Button>
      </nav>
    </header>
  );
}

