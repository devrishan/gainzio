"use client";

import { Menu } from "lucide-react";
import * as React from "react";

import { GainzioLogo } from "@/components/shared/logo";
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
      <aside className="hidden border-r border-border bg-muted/20 p-6 lg:block">
        <div className="flex flex-col gap-8">
          <GainzioLogo href={role === "admin" ? "/admin/dashboard" : "/member/dashboard"} />
          <Sidebar items={sidebarItems} />
        </div>
      </aside>

      <div className="flex flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-8">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <div className="flex flex-col gap-8">
                <GainzioLogo href={role === "admin" ? "/admin/dashboard" : "/member/dashboard"} />
                <Sidebar items={sidebarItems} />
              </div>
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-3">
            <UserMenu role={role} username={username} onLogout={signOut} />
          </div>
        </header>

        <main className="flex-1 bg-muted/30 p-4 pb-20 lg:p-8 lg:pb-8">{children}</main>

        <BottomNav items={sidebarItems} />
      </div>
    </div>
  );
}

