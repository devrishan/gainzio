"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Lock, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const result = await signIn("credentials", {
                redirect: false,
                email,
                password,
            });

            if (result?.error) {
                toast.error("Access Denied", {
                    description: "Invalid credentials or unauthorized access."
                });
                setIsLoading(false);
            } else {
                toast.success("Welcome, Administrator", {
                    description: "Redirecting to command center..."
                });
                router.push("/admin/dashboard");
            }
        } catch (error) {
            toast.error("System Error", {
                description: "Please try again later."
            });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-sm"
            >
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden relative">

                    {/* Top colored accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-cyan-500" />

                    <div className="p-8">
                        <div className="flex flex-col items-center mb-8 space-y-2">
                            <div className="h-12 w-12 rounded-full bg-neutral-800 flex items-center justify-center border border-neutral-700 mb-2">
                                <ShieldCheck className="h-6 w-6 text-emerald-500" />
                            </div>
                            <h1 className="text-xl font-semibold text-white tracking-tight">System Access</h1>
                            <p className="text-xs text-neutral-500 uppercase tracking-widest font-medium">Restricted Area</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 ml-1">Administrator Email</label>
                                <div className="relative">
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-700"
                                        placeholder="admin@gainzio.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-neutral-400 ml-1">Passkey</label>
                                <div className="relative">
                                    <input
                                        type="password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-neutral-700"
                                        placeholder="••••••••"
                                    />
                                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-neutral-700" />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-white text-black font-medium text-sm py-2.5 rounded-lg hover:bg-neutral-200 focus:ring-2 focus:ring-white/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Verifying...</span>
                                    </div>
                                ) : (
                                    "Authenticate"
                                )}
                            </button>
                        </form>
                    </div>

                    <div className="bg-neutral-950 py-3 px-8 text-center border-t border-neutral-800">
                        <p className="text-[10px] text-neutral-600">
                            Authorized Personnel Only • IP Logged
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
