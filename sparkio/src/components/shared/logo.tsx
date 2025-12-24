"use client";

import Link from "next/link";

export function GainzioLogo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 font-semibold ${className || ""}`}>
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        G
      </span>
      <span className="text-lg">Gainzio</span>
    </Link>
  );
}

