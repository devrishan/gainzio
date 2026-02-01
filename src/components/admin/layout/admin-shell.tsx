"use client";

import { useState } from "react";
import { AdminSidebar } from "./admin-sidebar";
import { AdminHeader } from "./admin-header";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="flex h-screen w-full bg-neutral-950 overflow-hidden font-sans text-neutral-200">
            {/* Sidebar for Desktop */}
            <div className="hidden lg:block h-full">
                <AdminSidebar />
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                >
                    <div
                        className="h-full w-[280px] bg-neutral-950 border-r border-white/10 shadow-2xl animate-in slide-in-from-left duration-200"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <AdminSidebar />
                    </div>
                </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* Background ambient effects */}
                <div className="absolute top-0 left-0 w-full h-[500px] bg-emerald-500/5 blur-[120px] pointer-events-none" />

                <AdminHeader onMenuClick={() => setSidebarOpen(true)} />

                <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 relative z-10">
                    <div className="max-w-7xl mx-auto space-y-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
