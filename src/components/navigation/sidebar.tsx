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
  Shield,
  User,
  HelpCircle,
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
  profile: User,
  support: HelpCircle,
};

export function Sidebar({ items, role = "member" }: { items: NavigationItem[], role?: "member" | "admin" }) {
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
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-300 relative overflow-hidden group",
              isActive
                ? (role === "admin"
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-gradient-to-r from-primary/15 to-transparent text-primary font-semibold")
                : (role === "admin"
                  ? "text-zinc-500 hover:text-white hover:bg-white/5"
                  : "text-muted-foreground hover:text-foreground hover:bg-primary/5 hover:pl-4")
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


