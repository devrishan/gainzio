"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Lock, Unlock, AlertTriangle, Power } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SystemLockdownClient() {
    const queryClient = useQueryClient();

    const { data } = useQuery({
        queryKey: ["system-lockdown"],
        queryFn: async () => {
            const res = await fetch("/api/admin/system/lockdown");
            return res.json();
        }
    });

    const isLocked = data?.isLocked || false;

    const mutation = useMutation({
        mutationFn: async (enabled: boolean) => {
            await fetch("/api/admin/system/lockdown", {
                method: "POST",
                body: JSON.stringify({ enabled })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["system-lockdown"] });
            toast.success("System status updated.");
        }
    });

    return (
        <Card className={cn(
            "bg-zinc-950/40 border backdrop-blur-md transition-colors duration-500",
            isLocked ? "border-red-500/30 bg-red-950/10" : "border-white/5"
        )}>
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "h-10 w-10 rounded-full flex items-center justify-center border",
                        isLocked ? "bg-red-500/20 border-red-500/50 text-red-500" : "bg-zinc-800 border-white/10 text-zinc-400"
                    )}>
                        {isLocked ? <Lock className="h-5 w-5" /> : <Power className="h-5 w-5" />}
                    </div>
                    <div>
                        <CardTitle className={cn(
                            "text-base font-black uppercase tracking-wide",
                            isLocked ? "text-red-500" : "text-white"
                        )}>
                            Emergency Lockdown
                        </CardTitle>
                        <CardDescription className="text-xs">Freeze all user activities instantly.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-white">Maintenance Mode</p>
                        <p className="text-xs text-zinc-500">
                            {isLocked ? "System is OFFLINE for users." : "System is operational."}
                        </p>
                    </div>
                    <Switch
                        checked={isLocked}
                        onCheckedChange={(val) => mutation.mutate(val)}
                        className="data-[state=checked]:bg-red-600"
                    />
                </div>
                {isLocked && (
                    <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded flex items-center gap-2 text-red-200 text-xs">
                        <AlertTriangle className="w-4 h-4" />
                        <span>Users cannot login or withdraw.</span>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
