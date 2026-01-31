"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Wallet,
  CheckSquare,
  ShieldAlert,
  Settings,
  Menu,
  LogOut,
  Command,
  MessageSquare,
  Layers,
  Eye,
  ShieldCheck,
  Crown,
  LifeBuoy,
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false); // Default to false (closed on mobile)
  const pathname = usePathname();

  const navItems = [
    { name: "Command Center", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Members", href: "/admin/members", icon: Users },
    { name: "Task Matrix", href: "/admin/tasks", icon: CheckSquare },
    { name: "The Studio", href: "/admin/content", icon: Layers },
    { name: "The Oracle", href: "/admin/oracle", icon: Eye },
    { name: "The Fortress", href: "/admin/fortress", icon: ShieldCheck },
    { name: "The Empire", href: "/admin/empire", icon: Crown },
    { name: "Support Desk", href: "/admin/support", icon: LifeBuoy },
    { name: "System Console", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30">

      {/* Fixed Background Mesh */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[150px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[150px]" />
      </div>

      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 w-64 border-r border-white/5 bg-neutral-950/80 backdrop-blur-xl shadow-2xl lg:shadow-none`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-white/5 justify-between lg:justify-start">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-[0_0_15px_-3px_rgba(16,185,129,0.3)]">
                <Command className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="font-bold tracking-tight text-white">GAINZIO <span className="text-emerald-500 font-mono text-xs ml-1">OS</span></span>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-neutral-400 hover:text-white"
            >
              <LogOut className="h-5 w-5 rotate-180" /> {/* Reusing logout icon rotated as close for now, or just rely on backdrop */}
            </button>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)} // Close sidebar on mobile nav click
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isActive
                    ? "bg-gradient-to-r from-emerald-500/10 to-transparent text-emerald-400 border-l-2 border-emerald-500"
                    : "text-neutral-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                    }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 transition-colors ${isActive ? "text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "text-neutral-500 group-hover:text-white"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <button
              onClick={() => signOut({ callbackUrl: "/admin" })}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-neutral-400 rounded-lg hover:text-red-400 hover:bg-red-950/20 transition-colors group"
            >
              <LogOut className="mr-3 h-4 w-4 group-hover:text-red-400 transition-colors" />
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:ml-64 min-h-screen flex flex-col transition-all duration-300 relative z-10`}>
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-20 border-b border-white/5 bg-neutral-950/70 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-md text-emerald-500 hover:bg-white/10"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Search/Command Input Mock */}
          <div className="hidden md:flex items-center px-4 py-1.5 rounded-lg bg-white/5 border border-white/5 text-sm text-neutral-500 w-64 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
            <Command className="h-3 w-3 mr-2 opacity-50" />
            <span>Type / to search...</span>
          </div>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/5 border border-emerald-500/20 shadow-[0_0_10px_-4px_rgba(16,185,129,0.3)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-medium tracking-wider hidden sm:inline-block">SYSTEM ACTIVE</span>
              <span className="text-xs font-mono text-emerald-400 font-medium tracking-wider sm:hidden">ON</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
