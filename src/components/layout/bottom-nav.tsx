"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    ClipboardCheck,
    Users2,
    Wallet,
    Megaphone,
    UserCog,
    ShieldCheck,
    Wrench,
    User,
    HelpCircle,
    FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/config/navigation";

interface BottomNavProps {
    items: NavigationItem[];
}

const iconMap: Record<string, any> = {
    dashboard: LayoutDashboard,
    referrals: Users2,
    withdraw: Wallet,
    ads: Megaphone,
    admins: UserCog,
    members: Users2,
    security: ShieldCheck,
    submissions: ClipboardCheck,
    maintenance: Wrench,
    profile: User,
    support: HelpCircle,
    // Add missing mappings if any
    tasks: FileText,
};

export function BottomNav({ items }: BottomNavProps) {
    const pathname = usePathname();

    // Helper to get icon safely
    const getIcon = (iconName: string) => {
        return iconMap[iconName] || LayoutDashboard;
    };

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 lg:hidden">
            <nav className="flex items-center justify-around p-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                {items.slice(0, 5).map((item) => {
                    const Icon = getIcon(item.icon);
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "relative flex flex-col items-center justify-center gap-1 rounded-xl w-full py-2 transition-all duration-300",
                                isActive
                                    ? "text-white"
                                    : "text-white/40 hover:text-white/70"
                            )}
                        >
                            {/* Active Indicator Background */}
                            {isActive && (
                                <div className="absolute inset-0 bg-white/10 rounded-xl -z-10 animate-in fade-in zoom-in duration-200" />
                            )}

                            <Icon className={cn("h-5 w-5 transition-transform duration-300", isActive && "scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]")} />
                            <span className={cn(
                                "text-[10px] font-medium transition-all duration-300",
                                isActive ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 hidden"
                            )}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
