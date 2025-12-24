"use client";

import Link from "next/link";

interface EarniqLogoProps {
  href?: string;
  className?: string;
}

export function EarniqLogo({ href = "/", className }: EarniqLogoProps) {
  return (
    <Link href={href} className={`inline-flex items-center gap-2 ${className || ""}`} aria-label="Earniq home">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20 text-lg font-semibold text-primary transition hover:bg-primary/30">
        ✦
      </span>
      <span className="text-xl font-semibold tracking-tight">Earniq</span>
    </Link>
  );
}

