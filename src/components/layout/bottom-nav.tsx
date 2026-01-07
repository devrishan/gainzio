"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    CheckSquare,
    Users,
    Wallet,
    Menu,
    Shield,
    FileText,
    Hammer,
    User,
    HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { NavigationItem } from "@/config/navigation";

interface BottomNavProps {
    items: NavigationItem[];
}

export function BottomNav({ items }: BottomNavProps) {
    const pathname = usePathname();

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case "dashboard":
                return LayoutDashboard;
            case "referrals":
                return Users;
            case "withdraw":
                return Wallet;
            case "ads":
                return FileText;
            case "admins":
                return Shield;
            case "members":
                return Users;
            case "security":
                return Shield;
            case "submissions":
                return CheckSquare;
            case "maintenance":
                return Hammer;
            case "profile":
                return User;
            case "support":
                return HelpCircle;
            default:
                return LayoutDashboard;
        }
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
