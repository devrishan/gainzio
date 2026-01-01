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
    sm: 24, // Sidebar
    md: 28, // Mobile / Default
    lg: 32, // Web Header
    xl: 96  // Splash
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

