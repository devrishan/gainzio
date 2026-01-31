"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { ServerHealthMonitor } from "@/components/admin/fortress/server-health-monitor";
import { StaffAuditFeed } from "@/components/admin/fortress/staff-audit-feed";
import { VerificationQueue } from "@/components/admin/fortress/verification-queue";

export default function FortressPage() {
    return (
        <div className="max-w-6xl space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div className="flex items-center gap-2 mb-1">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <h1 className="text-3xl font-black italic tracking-tight uppercase text-white">
                        The Fortress
                    </h1>
                </div>
                <p className="text-neutral-400">Security operations, audit trails, and system vitals.</p>
            </motion.div>

            {/* 1. Health Monitor (Row) */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <ServerHealthMonitor />
            </motion.div>

            {/* 2. Ops Grid (Columns) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <StaffAuditFeed />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <VerificationQueue />
                </motion.div>
            </div>

        </div>
    );
}
