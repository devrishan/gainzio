"use client";

import { motion } from "framer-motion";
import { OracleDashboard } from "@/components/admin/oracle-dashboard";
import { Sparkles } from "lucide-react";

export default function OraclePage() {
    return (
        <div className="max-w-6xl space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <h1 className="text-3xl font-black italic tracking-tight uppercase text-white">
                        The Oracle
                    </h1>
                </div>
                <p className="text-neutral-400">Deep intelligence, prediction, and visual forensics.</p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <OracleDashboard />
            </motion.div>
        </div>
    );
}
