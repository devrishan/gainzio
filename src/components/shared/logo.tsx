"use client";

import Image from "next/image";
import Link from "next/link";

export function GainzioLogo({
  href = "/",
  className,
  showText = true,
  size = "md"
}: {
  href?: string;
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeMap = {
    sm: 20,
    md: 28,
    lg: 48,
    xl: 96
  };

  const dimension = sizeMap[size];

  return (
    <Link href={href} className={`flex items-center gap-2 font-semibold ${className || ""}`}>
      <Image
        src="/brand/gainzio-symbol.svg"
        alt="Gainzio"
        width={dimension}
        height={dimension}
        className="shrink-0 object-contain"
        priority
      />
      {showText && <span className="text-lg tracking-tight">Gainzio</span>}
    </Link>
  );
}

