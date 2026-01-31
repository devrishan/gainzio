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
        <div className="fixed bottom-0 left-0 right-0 z-50 block border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:hidden">
            <nav className="flex h-16 items-center justify-around px-2">
                {items.slice(0, 5).map((item) => {
                    const Icon = getIcon(item.icon);
                    const isActive = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 rounded-lg p-2 transition-colors duration-200",
                                isActive
                                    ? "text-primary hover:text-primary/80"
                                    : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Icon className={cn("h-5 w-5", isActive && "fill-current")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
