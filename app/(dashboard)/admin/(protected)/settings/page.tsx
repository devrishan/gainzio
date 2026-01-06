"use client";

import { motion } from "framer-motion";
import { Settings, Shield, Globe, Lock, Bell, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Configuration</h1>
                    <p className="text-neutral-500 mt-1">Manage global platform settings and protocols.</p>
                </div>
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* General Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                        <Globe className="h-5 w-5 text-blue-400" />
                        <h3 className="font-semibold text-white">Platform Control</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-neutral-300">Maintenance Mode</label>
                                <p className="text-xs text-neutral-500">Suspend all user access temporarily</p>
                            </div>
                            <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-neutral-300">New Registrations</label>
                                <p className="text-xs text-neutral-500">Allow new users to sign up</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </motion.div>

                {/* Security Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                        <Shield className="h-5 w-5 text-emerald-400" />
                        <h3 className="font-semibold text-white">Security Protocols</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-neutral-300">Force 2FA for Admins</label>
                                <p className="text-xs text-neutral-500">Require OTP for all admin actions</p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-neutral-300">Strict IP Locking</label>
                                <p className="text-xs text-neutral-500">Bind sessions to IP address</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </motion.div>

                {/* Notification Settings */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                        <Bell className="h-5 w-5 text-amber-400" />
                        <h3 className="font-semibold text-white">System Alerts</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <label className="text-sm font-medium text-neutral-300">Payout Notifications</label>
                                <p className="text-xs text-neutral-500">Notify admins on large withdrawals</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </motion.div>

                {/* Database */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-xl border border-neutral-800 bg-neutral-900/50 backdrop-blur-sm space-y-6"
                >
                    <div className="flex items-center gap-3 border-b border-neutral-800 pb-4">
                        <Database className="h-5 w-5 text-purple-400" />
                        <h3 className="font-semibold text-white">Data Retention</h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-400">Total Records</span>
                            <Badge variant="outline" className="text-white border-neutral-700">24.5k</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-neutral-400">Database Size</span>
                            <Badge variant="outline" className="text-white border-neutral-700">48 MB</Badge>
                        </div>
                        <Button variant="outline" size="sm" className="w-full mt-2 border-red-900/30 text-red-500 hover:bg-red-950/20 hover:text-red-400">
                            Purge Logs
                        </Button>
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
