"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, X, ExternalLink, Loader2, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { toast } from "sonner";

export function VerificationQueue() {
    const queryClient = useQueryClient();
    const [swiped, setSwiped] = useState<string | null>(null);

    const { data: submissions, isLoading } = useQuery({
        queryKey: ["admin-queue"],
        queryFn: async () => (await fetch("/api/admin/submissions/queue")).json().then(r => r.submissions || [])
    });

    const mutation = useMutation({
        mutationFn: async ({ id, action }: { id: string, action: "APPROVE" | "REJECT" }) => {
            await fetch("/api/admin/submissions/queue", {
                method: "POST",
                body: JSON.stringify({ submissionId: id, action, reason: action === "REJECT" ? "No valid proof" : "Good job" })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-queue"] });
            setSwiped(null);
        }
    });

    if (isLoading) return <div className="h-[300px] center"><Loader2 className="animate-spin" /></div>;

    const current = submissions?.[0]; // Top card

    const handleSwipe = (action: "APPROVE" | "REJECT") => {
        if (!current) return;
        setSwiped(action);
        setTimeout(() => mutation.mutate({ id: current.id, action }), 300); // Wait for anim
    };

    return (
        <Card className="bg-black/40 border-white/5 h-[500px] relative overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/5 flex justify-between">
                <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-widest">Verification Queue</h3>
                <span className="text-xs text-zinc-500">{submissions?.length} Pending</span>
            </div>

            <div className="flex-1 relative flex items-center justify-center p-6">
                <AnimatePresence>
                    {current ? (
                        <motion.div
                            key={current.id}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                x: swiped === "APPROVE" ? 200 : swiped === "REJECT" ? -200 : 0,
                                rotate: swiped === "APPROVE" ? 10 : swiped === "REJECT" ? -10 : 0
                            }}
                            exit={{ opacity: 0 }}
                            className="bg-zinc-900 border border-white/10 w-full max-w-sm rounded-xl p-6 shadow-2xl absolute z-10"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h4 className="font-bold text-lg text-white">{current.task.title}</h4>
                                    <p className="text-zinc-500 text-sm">@{current.user.username}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-emerald-400 font-bold font-mono">₹{current.task.rewardAmount}</div>
                                    <div className="text-amber-400 text-xs">{current.task.rewardCoins} XP</div>
                                </div>
                            </div>

                            <div className="bg-black/30 rounded p-4 mb-6 border border-white/5 min-h-[100px] flex items-center justify-center text-zinc-500 text-xs">
                                {current.submissionData ? (
                                    <div className="w-full break-all font-mono">{JSON.stringify(current.submissionData)}</div>
                                ) : (
                                    <div className="flex flex-col items-center gap-2">
                                        <FileText className="w-8 h-8 opacity-50" />
                                        <span>No attachment data (Link/Image)</span>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Button
                                    variant="destructive"
                                    onClick={() => handleSwipe("REJECT")}
                                    className="h-12 text-lg font-bold"
                                >
                                    <X className="mr-2" /> REJECT
                                </Button>
                                <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 h-12 text-lg font-bold"
                                    onClick={() => handleSwipe("APPROVE")}
                                >
                                    <Check className="mr-2" /> APPROVE
                                </Button>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="text-center text-zinc-600">
                            <Check className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>Queue Empty</p>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </Card>
    );
}
