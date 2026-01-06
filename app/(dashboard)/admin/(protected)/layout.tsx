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
  Command
} from "lucide-react";
import { useState } from "react";
import { signOut } from "next-auth/react";
import { motion } from "framer-motion";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();

  const navItems = [
    { name: "Command Center", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Membership", href: "/admin/members", icon: Users },
    { name: "Withdrawals", href: "/admin/withdrawals", icon: Wallet },
    { name: "Task Matrix", href: "/admin/tasks", icon: CheckSquare },
    { name: "Security Protocols", href: "/admin/security", icon: ShieldAlert },
    { name: "System Config", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-emerald-500/30">

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 h-screen transition-transform transform ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } lg:translate-x-0 w-64 border-r border-neutral-800 bg-neutral-950/80 backdrop-blur-xl`}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center px-6 border-b border-neutral-800">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <Command className="h-4 w-4 text-emerald-500" />
              </div>
              <span className="font-bold tracking-tight text-white">GAINZIO <span className="text-emerald-500 font-mono text-xs ml-1">OS</span></span>
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  <item.icon className={`mr-3 h-4 w-4 ${isActive ? "text-emerald-400" : "text-neutral-500 group-hover:text-white"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-neutral-800">
            <button
              onClick={() => signOut({ callbackUrl: "/admin" })}
              className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-neutral-400 rounded-lg hover:text-red-400 hover:bg-red-950/20 transition-colors"
            >
              <LogOut className="mr-3 h-4 w-4" />
              Terminate Session
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`lg:ml-64 min-h-screen flex flex-col transition-all duration-300`}>
        {/* Topbar */}
        <header className="h-16 sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-xl flex items-center justify-between px-6">
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="lg:hidden p-2 rounded-md text-neutral-400 hover:text-white hover:bg-white/10"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-4 ml-auto">
            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-mono text-emerald-400 font-medium">SYSTEM ACTIVE</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
