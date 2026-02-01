"use client";

import { Button } from "@/components/ui/button";
import { Download, Smartphone, ShieldCheck, Zap } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Navbar } from "@/components/marketing/Navbar";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function DownloadPage() {
    return (
        <>
            <Navbar />
            <main className="flex min-h-screen flex-col pt-24">
                <div className="container mx-auto px-4 py-12">
                    <div className="mx-auto max-w-4xl text-center">

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="mb-12"
                        >
                            <div className="inline-flex items-center justify-center p-3 mb-6 rounded-2xl bg-primary/10 text-primary">
                                <Smartphone className="w-10 h-10" />
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight mb-4 md:text-5xl">
                                Get Gainzio on Android
                            </h1>
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                Experience the full power of Gainzio with our native Android app.
                                Earn rewards, track referrals, and withdraw funds seamlessly.
                            </p>
                        </motion.div>

                        {/* Download Card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="bg-card border border-border rounded-3xl p-8 shadow-2xl max-w-md mx-auto mb-16 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-bold">Direct APK Download</h3>
                                    <p className="text-sm text-muted-foreground">Version 1.0.0 • Verified Safe</p>
                                </div>

                                {/* TODO: Replace '#' with actual APK URL when available */}
                                <Button size="lg" className="w-full text-lg h-14 rounded-xl gap-2 shadow-lg shadow-primary/25" asChild>
                                    <Link href="#">
                                        <Download className="w-5 h-5" />
                                        Download APK
                                    </Link>
                                </Button>

                                <p className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                    ⚠️ <strong>Note:</strong> After downloading, tap the file to install.
                                    You may need to allow "Install from Unknown Sources" in your settings.
                                </p>
                            </div>
                        </motion.div>

                        {/* Features Grid */}
                        <div className="grid md:grid-cols-3 gap-8 text-left max-w-4xl mx-auto">
                            <div className="bg-muted/5 p-6 rounded-2xl border border-white/5">
                                <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Faster Performance</h3>
                                <p className="text-sm text-muted-foreground">The app is optimized for your device, ensuring smoother navigation and quicker task loading.</p>
                            </div>
                            <div className="bg-muted/5 p-6 rounded-2xl border border-white/5">
                                <Smartphone className="w-8 h-8 text-blue-500 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Better Experience</h3>
                                <p className="text-sm text-muted-foreground">Enjoy a full-screen immersive experience without browser bars or distractions.</p>
                            </div>
                            <div className="bg-muted/5 p-6 rounded-2xl border border-white/5">
                                <ShieldCheck className="w-8 h-8 text-green-500 mb-4" />
                                <h3 className="text-lg font-semibold mb-2">Secure Login</h3>
                                <p className="text-sm text-muted-foreground">Stay logged in securely with persistent sessions and biometric support (coming soon).</p>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
            <SiteFooter />
        </>
    );
}
