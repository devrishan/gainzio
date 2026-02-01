"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Check, Loader2, Save, ShieldAlert, Cpu } from "lucide-react";
import { toast } from "sonner";
import { SystemSettings } from "@/services/settings-service";

export default function AdminSettingsPage() {
    const [settings, setSettings] = useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/admin/settings");
            if (!res.ok) throw new Error("Failed to fetch settings");
            const data = await res.json();
            setSettings(data);
        } catch (error) {
            toast.error("Could not load settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            const res = await fetch("/api/admin/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(settings),
            });
            if (!res.ok) throw new Error("Failed to save");
            toast.success("System settings updated");
        } catch (error) {
            toast.error("Failed to save settings");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    if (!settings) return null;

    return (
        <div className="space-y-8 max-w-6xl mx-auto p-6 md:p-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        System Control Center
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Manage global logic, AI behavior, and safety limits.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="gap-2 shadow-xl hover:shadow-primary/25 bg-primary hover:bg-primary/90 transition-all active:scale-95"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Configuration
                </Button>
            </div>

            <Separator className="bg-gradient-to-r from-border to-transparent" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* AI System Controls */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative h-full bg-card/50 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl">
                        <CardHeader className="pb-4 border-b border-border/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/20 shadow-inner">
                                    <Cpu className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">AI Neural Network</CardTitle>
                                    <CardDescription>Configure the platform's brain and intelligence features.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex items-center justify-between p-5 bg-gradient-to-r from-purple-500/10 to-transparent rounded-xl border border-purple-500/20">
                                <div className="space-y-1">
                                    <Label className="text-lg font-semibold text-purple-700 dark:text-purple-300">Master AI System</Label>
                                    <p className="text-sm text-muted-foreground">Global kill-switch for all generative features.</p>
                                </div>
                                <Switch
                                    className="data-[state=checked]:bg-purple-600"
                                    checked={settings.ai.enabled}
                                    onCheckedChange={(c) => setSettings({ ...settings, ai: { ...settings.ai, enabled: c } })}
                                />
                            </div>

                            <div className="space-y-4 pl-2">
                                {/* AI Chat */}
                                <div className="flex items-center justify-between group/item hover:bg-muted/50 p-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${settings.ai.features.chat ? "bg-green-500 shadow-green-500/50 shadow-sm" : "bg-gray-500"}`} />
                                        <Label className={`text-base font-medium ${!settings.ai.enabled ? "opacity-50" : ""}`}>Chat Assistant</Label>
                                    </div>
                                    <Switch
                                        checked={settings.ai.features.chat}
                                        disabled={!settings.ai.enabled}
                                        onCheckedChange={(c) => setSettings({
                                            ...settings,
                                            ai: { ...settings.ai, features: { ...settings.ai.features, chat: c } }
                                        })}
                                    />
                                </div>

                                {/* Auto Suggestions */}
                                <div className="flex items-center justify-between group/item hover:bg-muted/50 p-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${settings.ai.features.autoSuggestions ? "bg-blue-500 shadow-blue-500/50 shadow-sm" : "bg-gray-500"}`} />
                                        <Label className={`text-base font-medium ${!settings.ai.enabled ? "opacity-50" : ""}`}>Smart Suggestions</Label>
                                    </div>
                                    <Switch
                                        checked={settings.ai.features.autoSuggestions}
                                        disabled={!settings.ai.enabled}
                                        onCheckedChange={(c) => setSettings({
                                            ...settings,
                                            ai: { ...settings.ai, features: { ...settings.ai.features, autoSuggestions: c } }
                                        })}
                                    />
                                </div>

                                {/* Help Tips */}
                                <div className="flex items-center justify-between group/item hover:bg-muted/50 p-2 rounded-lg transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full ${settings.ai.features.helpTips ? "bg-amber-500 shadow-amber-500/50 shadow-sm" : "bg-gray-500"}`} />
                                        <Label className={`text-base font-medium ${!settings.ai.enabled ? "opacity-50" : ""}`}>Contextual Hints</Label>
                                    </div>
                                    <Switch
                                        checked={settings.ai.features.helpTips}
                                        disabled={!settings.ai.enabled}
                                        onCheckedChange={(c) => setSettings({
                                            ...settings,
                                            ai: { ...settings.ai, features: { ...settings.ai.features, helpTips: c } }
                                        })}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Global Limits */}
                <div className="group relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-red-500 to-orange-600 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative h-full bg-card/50 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl">
                        <CardHeader className="pb-4 border-b border-border/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl border border-red-500/20 shadow-inner">
                                    <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Safety & Limits</CardTitle>
                                    <CardDescription>Enforce hard caps to prevent abuse and manage economy.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Daily Tasks Cap</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-12 text-lg font-mono bg-background/50 border-input/50 focus:border-red-500/50 transition-all"
                                            value={settings.limits.maxTasksPerDay}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                limits: { ...settings.limits, maxTasksPerDay: parseInt(e.target.value) || 0 }
                                            })}
                                        />
                                        <div className="absolute right-3 top-3 text-xs text-muted-foreground font-medium pointer-events-none">/ USER</div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Cooldown Period</Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            className="h-12 text-lg font-mono bg-background/50 border-input/50 focus:border-red-500/50 transition-all"
                                            value={settings.limits.cooldownDays}
                                            onChange={(e) => setSettings({
                                                ...settings,
                                                limits: { ...settings.limits, cooldownDays: parseInt(e.target.value) || 0 }
                                            })}
                                        />
                                        <div className="absolute right-3 top-3 text-xs text-muted-foreground font-medium pointer-events-none">DAYS</div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Weekly Withdrawal Allowance</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-12 text-lg font-mono bg-background/50 border-input/50 focus:border-red-500/50 transition-all"
                                        value={settings.limits.maxWithdrawalsPerWeek}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            limits: { ...settings.limits, maxWithdrawalsPerWeek: parseInt(e.target.value) || 0 }
                                        })}
                                    />
                                    <div className="absolute right-3 top-3 text-xs text-muted-foreground font-medium pointer-events-none">REQUESTS</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Daily AI Usage Cap</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-12 text-lg font-mono bg-background/50 border-input/50 focus:border-red-500/50 transition-all"
                                        value={settings.limits.maxAiRequestsPerDay}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            limits: { ...settings.limits, maxAiRequestsPerDay: parseInt(e.target.value) || 0 }
                                        })}
                                    />
                                    <div className="absolute right-3 top-3 text-xs text-muted-foreground font-medium pointer-events-none">PROMPTS</div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-muted-foreground text-xs uppercase tracking-wider font-bold">Minimum Payout Amount</Label>
                                <div className="relative">
                                    <Input
                                        type="number"
                                        className="h-12 text-lg font-mono bg-background/50 border-input/50 focus:border-red-500/50 transition-all pl-8"
                                        value={settings.limits.minPayoutAmount}
                                        onChange={(e) => setSettings({
                                            ...settings,
                                            limits: { ...settings.limits, minPayoutAmount: parseInt(e.target.value) || 0 }
                                        })}
                                    />
                                    <div className="absolute left-3 top-3 text-lg font-mono text-muted-foreground font-medium pointer-events-none">₹</div>
                                    <div className="absolute right-3 top-3 text-xs text-muted-foreground font-medium pointer-events-none">INR</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
