"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings2, Coins, TrendingUp, Zap, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export function EconomyTunerClient() {
    const queryClient = useQueryClient();
    const [localSettings, setLocalSettings] = useState<any>(null);

    const { data: serverSettings, isLoading } = useQuery({
        queryKey: ["economy-settings"],
        queryFn: async () => {
            const res = await fetch("/api/admin/economy/config");
            return (await res.json()).settings;
        }
    });

    useEffect(() => {
        if (serverSettings) setLocalSettings(serverSettings);
    }, [serverSettings]);

    const mutation = useMutation({
        mutationFn: async (newSettings: any) => {
            await fetch("/api/admin/economy/config", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newSettings)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["economy-settings"] });
            toast.success("Economy parameters updated.");
        }
    });

    if (isLoading || !localSettings) return <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-zinc-500" /></div>;

    const handleSave = () => {
        mutation.mutate(localSettings);
    };

    return (
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <TrendingUp className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black uppercase text-white tracking-wide">Economy Tuner</CardTitle>
                        <CardDescription className="text-xs">Adjust global gamification & value variables.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

                {/* XP RATE */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-zinc-500">XP Yield (per ₹1)</Label>
                        <span className="font-mono text-xl font-bold text-white">{localSettings.xpPerRupee} XP</span>
                    </div>
                    <Slider
                        defaultValue={[localSettings.xpPerRupee]}
                        max={100}
                        step={1}
                        onValueChange={(val) => setLocalSettings({ ...localSettings, xpPerRupee: val[0] })}
                        className="py-2"
                    />
                </div>

                {/* REFERRAL COMMISISON */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-zinc-500">Ref Commission</Label>
                        <span className="font-mono text-xl font-bold text-emerald-400">{localSettings.referralCommissionPercent}%</span>
                    </div>
                    <Slider
                        defaultValue={[localSettings.referralCommissionPercent]}
                        max={50}
                        step={1}
                        onValueChange={(val) => setLocalSettings({ ...localSettings, referralCommissionPercent: val[0] })}
                        className="py-2"
                    />
                </div>

                {/* AUTO PAYOUT LIMIT */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs font-black uppercase text-zinc-500">Auto-Approve Limit</Label>
                        <span className="font-mono text-xl font-bold text-orange-400">₹{localSettings.maxWithdrawalAutoApprove}</span>
                    </div>
                    <Slider
                        defaultValue={[localSettings.maxWithdrawalAutoApprove]}
                        max={5000}
                        step={100}
                        onValueChange={(val) => setLocalSettings({ ...localSettings, maxWithdrawalAutoApprove: val[0] })}
                        className="py-2"
                    />
                    <p className="text-[10px] text-zinc-600">Withdrawals under this amount can be auto-processed.</p>
                </div>

                <div className="pt-4 border-t border-white/5">
                    <Button
                        onClick={handleSave}
                        className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                        UPDATE ECONOMY
                    </Button>
                </div>

            </CardContent>
        </Card>
    );
}
