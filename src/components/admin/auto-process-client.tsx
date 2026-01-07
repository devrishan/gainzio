"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Zap, Play, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

export function AutoProcessClient() {
    const queryClient = useQueryClient();
    const [result, setResult] = useState<any>(null);

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/payouts/auto-process", { method: "POST" });
            return res.json();
        },
        onSuccess: (data) => {
            setResult(data);
            if (data.success) {
                toast.success(`Processed ${data.processedCount} payouts!`);
                queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
            } else {
                toast.error("Process failed.");
            }
        }
    });

    return (
        <Card className="bg-gradient-to-br from-emerald-900/10 to-transparent border-emerald-500/20 backdrop-blur-md">
            <CardHeader className="border-b border-emerald-500/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                        <Zap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black uppercase text-white tracking-wide">Auto-Payout Engine</CardTitle>
                        <CardDescription className="text-xs text-emerald-200/50">Smart batch processing agent.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <p className="text-sm text-zinc-400">
                    Automatically scans and approves pending withdrawals under the configured safe limit (currently active).
                </p>

                {result && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded text-xs text-emerald-200">
                        Processed: <span className="font-bold text-white">{result.processedCount}</span> <br />
                        Errors: {result.errorsCount}
                    </div>
                )}

                <Button
                    onClick={() => mutation.mutate()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 font-bold border-t border-emerald-400/20"
                    disabled={mutation.isPending}
                >
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    RUN BOT NOW
                </Button>
            </CardContent>
        </Card>
    );
}
