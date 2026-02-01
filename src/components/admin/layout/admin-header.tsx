"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AdminHeaderProps {
    onMenuClick: () => void;
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
    return (
        <header className="sticky top-0 z-40 w-full h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="lg:hidden text-white" onClick={onMenuClick}>
                    <Menu className="w-5 h-5" />
                </Button>

                {/* Search / Command Bar */}
                <div className="hidden md:flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5 border border-white/5 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all w-[300px]">
                    <Search className="w-4 h-4 text-neutral-500" />
                    <input
                        type="text"
                        placeholder="Search users, transactions, logs..."
                        className="bg-transparent border-none outline-none text-sm text-white placeholder:text-neutral-600 w-full"
                    />
                    <div className="flex items-center gap-1">
                        <span className="text-[10px] font-mono text-neutral-600 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">⌘K</span>
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" className="relative text-neutral-400 hover:text-white hover:bg-white/5">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-black shadow-lg" />
                </Button>

                <div className="h-8 w-[1px] bg-white/10 mx-1" />

                <div className="flex items-center gap-3 pl-2">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-white">Administrator</p>
                        <p className="text-[10px] text-neutral-500 uppercase tracking-wider font-bold">Level 99 Access</p>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 p-[1px] ring-2 ring-white/5 ring-offset-2 ring-offset-black">
                        <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                            <span className="font-bold text-white text-xs">AD</span>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
