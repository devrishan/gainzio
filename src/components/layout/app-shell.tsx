"use client";

import { Menu } from "lucide-react";
import * as React from "react";

import { GainzioLogo } from "@/components/shared/logo";
import { NotificationBell } from "@/components/shared/NotificationBell";
import { useSession } from "@/components/providers/session-provider";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import { NavigationItem } from "@/config/navigation";
import { Sidebar } from "../navigation/sidebar";
import { UserMenu } from "../navigation/user-menu";

import { BottomNav } from "./bottom-nav";

interface AppShellProps {
  sidebarItems: NavigationItem[];
  children: React.ReactNode;
  fallbackRole?: "member" | "admin";
}

export function AppShell({ sidebarItems, children, fallbackRole = "member" }: AppShellProps) {
  const { user, signOut } = useSession();
  const role = user?.role ?? fallbackRole;
  const username = user?.username ?? (role === "admin" ? "Admin" : "Member");
  const [open, setOpen] = React.useState(false);

  return (
    <div className="grid min-h-screen w-full grid-cols-1 lg:grid-cols-[280px_1fr]">
      <aside className={`hidden border-r border-border p-6 lg:block ${role === "admin" ? "bg-zinc-950" : "bg-muted/20"}`}>
        <div className="flex flex-col gap-8">
          <GainzioLogo href={role === "admin" ? "/admin/dashboard" : "/member/dashboard"} size="sm" />
          <Sidebar items={sidebarItems} role={role} />
        </div>
      </aside>

      <div className="flex flex-col">
        <header className={`sticky top-0 z-40 flex h-16 items-center justify-between border-b px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-8 ${role === "admin" ? "bg-black/95 border-white/5" : "border-border bg-background/95"}`}>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className={`w-72 p-6 ${role === "admin" ? "bg-zinc-950 border-white/5 text-white" : ""}`}>
              <div className="flex flex-col gap-8">
                <GainzioLogo href={role === "admin" ? "/admin/dashboard" : "/member/dashboard"} size="sm" />
                <Sidebar items={sidebarItems} role={role} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <NotificationBell />
            <UserMenu role={role} username={username} onLogout={signOut} />
          </div>
        </header>

        <main className={`flex-1 p-4 pb-20 lg:p-8 lg:pb-8 transition-colors duration-500 ${role === "admin" ? "bg-black text-white" : "bg-muted/30"}`}>
          {children}
        </main>

        <BottomNav items={sidebarItems} />
      </div>
    </div>
  );
}

