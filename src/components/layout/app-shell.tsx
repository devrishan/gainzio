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
    <div className="grid h-screen w-full grid-cols-1 lg:grid-cols-[280px_1fr] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-background via-background to-secondary/20 overflow-hidden">
      <aside className={`hidden border-r p-6 lg:block transition-all duration-300 h-full overflow-y-auto no-scrollbar ${role === "admin"
        ? "bg-zinc-950 border-white/10"
        : "glass-morphism border-white/5"
        }`}>
        <div className="flex flex-col gap-8 min-h-full">
          <GainzioLogo href={role === "admin" ? "/admin/dashboard" : "/member/dashboard"} size="sm" />
          <Sidebar items={sidebarItems} role={role} />
        </div>
      </aside>

      <div className="flex flex-col h-full relative overflow-hidden">
        {/* Ambient background glow for members */}
        {role !== "admin" && (
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[100px]" />
          </div>
        )}

        <header className={`flex-none z-40 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl transition-colors duration-300 lg:px-8 ${role === "admin"
          ? "bg-black/95 border-white/5"
          : "bg-background/40 border-white/5 shadow-sm"
          }`}>
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

        <main className={`flex-1 overflow-y-auto p-4 pb-20 lg:p-8 lg:pb-8 relative z-10 scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent transition-colors duration-500 ${role === "admin" ? "bg-black text-white" : "bg-transparent"}`}>
          {children}
        </main>

        <BottomNav items={sidebarItems} />
      </div>
    </div>
  );
}

