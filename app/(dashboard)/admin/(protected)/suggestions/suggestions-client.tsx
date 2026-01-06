"use client";

import { useState } from "react";
import { AdminProductSuggestion } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import {
    ShoppingBag, CheckCircle, XCircle, Filter, Search, Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SuggestionsFeedProps {
    initialData: AdminProductSuggestion[];
}

export default function SuggestionsFeed({ initialData }: SuggestionsFeedProps) {
    const router = useRouter();
    const [filter, setFilter] = useState("all"); // all, pending, approved, rejected
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const filteredData = initialData.filter(item => {
        if (filter === "all") return true;
        return item.status === filter;
    }).sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
    });

    const handleStatusUpdate = async (id: string, newStatus: string) => {
        setIsUpdating(id);
        try {
            const res = await fetch("/api/admin/suggestions", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id, status: newStatus }),
            });

            if (!res.ok) throw new Error("Failed to update");

            toast.success(`Suggestion marked as ${newStatus}`);
            router.refresh(); // Refresh server data
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsUpdating(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Options Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-1 rounded-xl bg-neutral-900/50 border border-white/5 backdrop-blur-sm">
                <div className="flex p-1 bg-black/20 rounded-lg w-full sm:w-auto overflow-x-auto">
                    {["all", "pending", "approved", "rejected"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all capitalize whitespace-nowrap ${filter === tab
                                ? "bg-neutral-800 text-white shadow-sm"
                                : "text-neutral-500 hover:text-neutral-300"
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <button
                    onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-400 hover:text-white transition-colors"
                >
                    <Filter className="w-4 h-4" />
                    <span>{sortOrder === "desc" ? "Newest First" : "Oldest First"}</span>
                </button>
            </div>

            {/* Feed */}
            <div className="grid grid-cols-1 gap-4">
                {filteredData.length === 0 ? (
                    <div className="p-12 border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center text-neutral-500 animate-in fade-in zoom-in duration-300">
                        <ShoppingBag className="w-12 h-12 mb-4 opacity-20" />
                        <p>No suggestions found for this filter.</p>
                    </div>
                ) : (
                    <AnimatePresence mode="popLayout">
                        {filteredData.map((item) => (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                layout
                            >
                                <Card className="p-6 bg-zinc-950/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/40 transition-colors group">
                                    <div className="flex items-start justify-between">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="font-bold text-white text-lg group-hover:text-emerald-400 transition-colors">{item.productName}</h3>
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-white/10 text-neutral-400">
                                                    {item.platform}
                                                </Badge>
                                                <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider border-0 ${item.status === 'pending' ? 'bg-amber-500/10 text-amber-500' :
                                                    item.status === 'approved' ? 'bg-emerald-500/10 text-emerald-500' :
                                                        'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {item.status}
                                                </Badge>
                                            </div>
                                            <p className="text-sm text-zinc-500 flex items-center gap-2">
                                                <span>Suggested by <span className="text-zinc-300 font-medium">{item.user.username}</span></span>
                                                <span className="text-zinc-700">•</span>
                                                <span>{format(new Date(item.createdAt), "PPP")}</span>
                                            </p>
                                            {item.amount && (
                                                <p className="text-sm font-mono text-emerald-400/80 font-bold mt-2 bg-emerald-950/30 inline-block px-2 py-1 rounded border border-emerald-500/10">
                                                    ₹{item.amount.toLocaleString()}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {item.status === 'pending' && (
                                                <>
                                                    <button
                                                        onClick={() => handleStatusUpdate(item.id, "approved")}
                                                        disabled={!!isUpdating}
                                                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                                                        title="Approve"
                                                    >
                                                        {isUpdating === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleStatusUpdate(item.id, "rejected")}
                                                        disabled={!!isUpdating}
                                                        className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                                        title="Reject"
                                                    >
                                                        {isUpdating === item.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
