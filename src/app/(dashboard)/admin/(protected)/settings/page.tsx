"use client";

import { motion } from "framer-motion";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { GlobalBroadcastClient } from "@/components/admin/global-broadcast-client";
import { SystemLockdownClient } from "@/components/admin/system-lockdown-client";
import { EconomyTunerClient } from "@/components/admin/economy-tuner-client";
import { AutoProcessClient } from "@/components/admin/auto-process-client";
import { WalletDoctorClient } from "@/components/admin/wallet-doctor-client";
import { PromoCodeManager } from "@/components/admin/promo-code-manager";
import { BlacklistConsole } from "@/components/admin/blacklist-console";

export default function SettingsPage() {
    return (
        <div className="max-w-7xl space-y-8">
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                <div>
                    <h1 className="text-3xl font-black italic tracking-tight uppercase text-white">
                        System Console
                    </h1>
                    <p className="text-neutral-400">Global configurations and emergency controls.</p>
                </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

                {/* --- ECONOMY & FINANCE --- */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                        <EconomyTunerClient />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
                        <WalletDoctorClient />
                    </motion.div>
                </div>

                {/* --- OPERATIONS & GROWTH --- */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }}>
                        <AutoProcessClient />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }}>
                        <PromoCodeManager />
                    </motion.div>
                </div>

                {/* --- SECURITY & SYSTEM --- */}
                <div className="space-y-6">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}>
                        <SystemLockdownClient />
                    </motion.div>
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                        <BlacklistConsole />
                    </motion.div>
                </div>

                {/* --- BROADCAST (Full Width) --- */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="md:col-span-2 xl:col-span-3"
                >
                    <GlobalBroadcastClient />
                </motion.div>
            </div>
        </div>
    );
}
