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

        <Card className="relative overflow-hidden border-0 bg-transparent shadow-none">
            {/* Background Decor */}
            <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-50" />

            <div className="glass-morphism spark-border relative z-10 rounded-xl p-1">
                <CardHeader className="border-b border-white/5 pb-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 shadow-lg shadow-blue-500/10">
                            <div className="absolute inset-0 rounded-xl bg-blue-400/20 blur opacity-50" />
                            <TrendingUp className="relative h-6 w-6 text-blue-400" />
                        </div>
                        <div>
                            <CardTitle className="bg-gradient-to-r from-white via-blue-100 to-blue-200 bg-clip-text text-xl font-black uppercase tracking-wide text-transparent drop-shadow-sm">
                                Economy Tuner
                            </CardTitle>
                            <CardDescription className="text-xs font-medium text-blue-200/60">
                                GLOBAL GAMIFICATION & VALUE CONTROLS
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-8 pt-8">

                    {/* XP RATE */}
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">XP Yield (per ₹1)</Label>
                            <div className="flex items-baseline gap-1">
                                <span className="font-mono text-2xl font-bold text-white text-shadow-glow-sm">{localSettings.xpPerRupee}</span>
                                <span className="text-xs font-bold text-blue-400">XP</span>
                            </div>
                        </div>
                        <div className="relative py-2">
                            <Slider
                                defaultValue={[localSettings.xpPerRupee]}
                                max={100}
                                step={1}
                                onValueChange={(val) => setLocalSettings({ ...localSettings, xpPerRupee: val[0] })}
                                className="relative z-10 cursor-pointer [&>.relative>.bg-primary]:bg-blue-500 [&>.relative>.bg-primary]:shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                            />
                        </div>
                    </div>

                    {/* REFERRAL COMMISISON */}
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Ref Commission</Label>
                            <div className="flex items-baseline gap-1">
                                <span className="font-mono text-2xl font-bold text-emerald-400 text-shadow-glow-sm">{localSettings.referralCommissionPercent}</span>
                                <span className="text-xs font-bold text-emerald-600">%</span>
                            </div>
                        </div>
                        <div className="relative py-2">
                            <Slider
                                defaultValue={[localSettings.referralCommissionPercent]}
                                max={50}
                                step={1}
                                onValueChange={(val) => setLocalSettings({ ...localSettings, referralCommissionPercent: val[0] })}
                                className="relative z-10 cursor-pointer [&>.relative>.bg-primary]:bg-emerald-500 [&>.relative>.bg-primary]:shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                            />
                        </div>
                    </div>

                    {/* AUTO PAYOUT LIMIT */}
                    <div className="space-y-4">
                        <div className="flex items-end justify-between">
                            <div className="space-y-1">
                                <Label className="text-xs font-bold uppercase tracking-wider text-zinc-400">Auto-Approve Limit</Label>
                                <p className="text-[10px] text-zinc-500">Max amount for instant processing</p>
                            </div>
                            <div className="flex items-baseline gap-1">
                                <span className="text-xs font-bold text-orange-600">₹</span>
                                <span className="font-mono text-2xl font-bold text-orange-400 text-shadow-glow-sm">{localSettings.maxWithdrawalAutoApprove}</span>
                            </div>
                        </div>
                        <div className="relative py-2">
                            <Slider
                                defaultValue={[localSettings.maxWithdrawalAutoApprove]}
                                max={5000}
                                step={100}
                                onValueChange={(val) => setLocalSettings({ ...localSettings, maxWithdrawalAutoApprove: val[0] })}
                                className="relative z-10 cursor-pointer [&>.relative>.bg-primary]:bg-orange-500 [&>.relative>.bg-primary]:shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                            />
                        </div>
                    </div>

                    <div className="pt-6 border-t border-white/5">
                        <Button
                            onClick={handleSave}
                            className="group relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 font-bold tracking-wide transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-blue-500/25"
                            disabled={mutation.isPending}
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full transition-transform group-hover:translate-y-0" />
                            {mutation.isPending ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Zap className="mr-2 h-4 w-4 fill-current" />
                            )}
                            UPDATE ECONOMY
                        </Button>
                    </div>

                </CardContent>
            </div>
        </Card>
    );
}
