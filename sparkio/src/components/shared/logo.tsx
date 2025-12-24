"use client";

import Link from "next/link";

export function SparkioLogo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-2 font-semibold">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        S
      </span>
      <span className="text-lg">Sparkio</span>
    </Link>
  );
}

