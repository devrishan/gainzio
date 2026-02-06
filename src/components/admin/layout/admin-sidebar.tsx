"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Users,
    Target,
    Wallet,
    Settings,
    ShieldAlert,
    Gift,
    MessageSquare,
    LogOut,
    Hexagon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const navItems = [
    {
        title: "Overview",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
        variant: "default",
    },
    {
        title: "User Management",
        href: "/admin/members",
        icon: Users,
        variant: "ghost",
    },
    {
        title: "Task Center",
        href: "/admin/tasks",
        icon: Target,
        variant: "ghost",
    },
    {
        title: "Finance & Payouts",
        href: "/admin/withdrawals",
        icon: Wallet,
        variant: "ghost",
    },
    {
        title: "Gamification",
        href: "/admin/gamification",
        icon: Gift,
        variant: "ghost",
    },
    {
        title: "Communication",
        href: "/admin/communications",
        icon: MessageSquare,
        variant: "ghost",
    },
    {
        title: "System & Config",
        href: "/admin/maintenance",
        icon: Settings,
        variant: "ghost",
    },
    {
        title: "Security & Audits",
        href: "/admin/security",
        icon: ShieldAlert,
        variant: "ghost",
    },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <div className="relative flex flex-col h-full w-[280px] bg-black/40 backdrop-blur-xl border-r border-white/5">
            {/* Logo / Header area */}
            <div className="p-6">
                <div className="flex items-center gap-3 px-2">
                    <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/20">
                        <Hexagon className="w-6 h-6 text-white fill-white/20" />
                    </div>
                    <div>
                        <h1 className="text-lg font-black tracking-tighter text-white uppercase italic">
                            Gainz<span className="text-emerald-500">IO</span>
                        </h1>
                        <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                            Command Center
                        </p>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
                <p className="px-4 text-[10px] font-bold text-neutral-600 uppercase tracking-widest mb-3">
                    Main Menu
                </p>
                {navItems.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 overflow-hidden",
                                    isActive
                                        ? "bg-white/5 text-emerald-400 shadow-[0_0_20px_-10px_rgba(16,185,129,0.5)] border border-white/5"
                                        : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500 rounded-r-full" />
                                )}
                                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-emerald-400" : "text-neutral-500 group-hover:text-white")} />
                                <span className="text-sm font-semibold tracking-wide">{item.title}</span>
                            </div>
                        </Link>
                    )
                })}
            </div>

            {/* Footer / User */}
            <div className="p-4 border-t border-white/5">
                <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                        <span className="text-xs font-medium text-emerald-400">System Operational</span>
                    </div>
                </div>

                <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-neutral-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={() => signOut({ callbackUrl: '/admin' })}
                >
                    <LogOut className="w-4 h-4" />
                    <span className="font-semibold">Sign Out</span>
                </Button>
            </div>
        </div>
    );
}
