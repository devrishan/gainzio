"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  LayoutDashboard,
  Megaphone,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users2,
  Wallet,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import type { NavigationItem, NavigationIcon } from "@/config/navigation";
import { cn } from "@/lib/utils";

const iconMap: Record<NavigationIcon, LucideIcon> = {
  dashboard: LayoutDashboard,
  referrals: UserCheck,
  withdraw: Wallet,
  ads: Megaphone,
  admins: UserCog,
  members: Users2,
  security: ShieldCheck,
  submissions: ClipboardCheck,
  maintenance: Wrench,
};

export function Sidebar({ items }: { items: NavigationItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {items.map(({ href, label, icon }) => {
        const Icon = iconMap[icon];
        const isActive = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href as Route}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/60",
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}


