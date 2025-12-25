"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CircleUserRound, LogOut, Settings, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserMenuProps {
  username?: string;
  role?: "member" | "admin";
  onLogout?: () => void;
}

export function UserMenu({ username = "Member", role = "member", onLogout }: UserMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
      return;
    }

    router.push("/login?redirect=" + encodeURIComponent(pathname ?? "/"));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 px-2">
          <CircleUserRound className="h-5 w-5" />
          <span className="hidden text-sm font-medium md:inline">{username}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="font-semibold">{username}</span>
            <span className="text-xs capitalize text-muted-foreground">{role}</span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Link>
        </DropdownMenuItem>
        {role === "admin" ? (
          <DropdownMenuItem asChild>
            <Link href="/admin/security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Center
            </Link>
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-destructive focus:text-destructive">
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

