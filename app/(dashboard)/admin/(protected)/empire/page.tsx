"use client";

import { motion } from "framer-motion";
import { Crown } from "lucide-react";
import { JackpotButton } from "@/components/admin/empire/jackpot-system";
import { BadgeDesigner } from "@/components/admin/empire/badge-designer";
import { AdminChatWidget } from "@/components/admin/empire/admin-chat-widget";

export default function EmpirePage() {
    return (
        <div className="max-w-6xl space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <Crown className="w-5 h-5 text-amber-500" />
                    <h1 className="text-3xl font-black italic tracking-tight uppercase text-white">
                        The Empire
                    </h1>
                </div>
                <p className="text-neutral-400">Growth engines, achievements, and command ops.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Col 1: Jackpot */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className="h-[300px]"
                >
                    <JackpotButton />
                </motion.div>

                {/* Col 2: Badge Designer */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="lg:col-span-2"
                >
                    <BadgeDesigner />
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chat taking full width on mobile, 1 col on desktop */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="lg:col-span-1"
                >
                    <AdminChatWidget />
                </motion.div>
            </div>

        </div>
    );
}
