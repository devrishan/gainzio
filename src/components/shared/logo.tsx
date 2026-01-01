"use client";

import Image from "next/image";
import Link from "next/link";

export function GainzioLogo({ href = "/", className }: { href?: string; className?: string }) {
  return (
    <Link href={href} className={`flex items-center gap-2 font-semibold ${className || ""}`}>
      <div className="relative h-8 w-8 overflow-hidden rounded-lg">
        <Image
          src="/logo_new.png"
          alt="Gainzio"
          fill
          className="object-cover"
        />
      </div>
      <span className="text-lg">Gainzio</span>
    </Link>
  );
}

