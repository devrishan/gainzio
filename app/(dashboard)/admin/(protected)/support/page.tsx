"use client";

import { motion } from "framer-motion";
import { LifeBuoy } from "lucide-react";
import { SupportDesk } from "@/components/admin/support/support-desk";

export default function SupportPage() {
    return (
        <div className="max-w-6xl space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <LifeBuoy className="w-5 h-5 text-indigo-400" />
                    <h1 className="text-3xl font-black italic tracking-tight uppercase text-white">
                        Support
                    </h1>
                </div>
                <p className="text-neutral-400">Help desk and user ticket management.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <SupportDesk />
            </motion.div>
        </div>
    );
}
