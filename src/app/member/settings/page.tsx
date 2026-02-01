"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2, Save, Sparkles, Bell, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { SystemSettings, UserAiPreferences } from "@/services/settings-service";

interface MemberSettingsResponse {
    ai: {
        enabled: boolean;
        chat: boolean; // Effective state
        autoSuggestions: boolean;
        helpTips: boolean;
    };
}

export default function MemberSettingsPage() {
    // We need both effective settings (to know what's disabled by admin)
    // and raw user preferences (to know what the user *wants*).
    // For simplicity in this demo, we'll fetch effective settings and allow toggling.
    // If Admin disabled it, the toggle will be forced OFF and disabled.

    // In a real robust app, we'd fetch effective settings AND effective disabled state separately,
    // or the API would return { value: boolean, disabled: boolean, reason: string }.
    // Here we'll infer: if fetch returns false but we try to set true and it stays false, it's admin locked.
    // Better yet, let's just fetch the full config structure if possible, but our API returns "Effective".

    const [settings, setSettings] = useState<MemberSettingsResponse | null>(null);
    const [userPrefs, setUserPrefs] = useState<UserAiPreferences>({ chat: true, autoSuggestions: true, helpTips: true });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch("/api/member/settings");
            if (!res.ok) throw new Error("Failed");
            const data = await res.json();
            setSettings(data);

            // infer user prefs from effective for initial state, 
            // though strictly we should fetch raw prefs to show "true but disabled" if we wanted deeply complex UI.
            // For now, if effective is false, we show false.
            setUserPrefs({
                chat: data.ai.chat,
                autoSuggestions: data.ai.autoSuggestions,
                helpTips: data.ai.helpTips
            });
        } catch (error) {
            toast.error("Could not load settings");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch("/api/member/settings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ aiPreferences: userPrefs }),
            });
            if (!res.ok) throw new Error("Failed");

            const effective = await res.json();
            setSettings(effective);

            // Update local state to match effective (e.g. if admin forced it off)
            setUserPrefs({
                chat: effective.ai.chat,
                autoSuggestions: effective.ai.autoSuggestions,
                helpTips: effective.ai.helpTips
            });

            toast.success("Preferences saved");
        } catch (error) {
            toast.error("Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;
    if (!settings) return null;

    const isGlobalAiDisabled = !settings.ai.enabled;

    return (
        <div className="space-y-8 max-w-4xl mx-auto p-6 md:p-8 bg-gradient-to-br from-background via-background to-muted/20 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        My Preferences
                    </h1>
                    <p className="text-muted-foreground mt-2 text-lg">
                        Customize your Gainzio experience and AI interactions.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="gap-2 shadow-xl hover:shadow-primary/25 bg-primary hover:bg-primary/90 transition-all active:scale-95"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Save Preferences
                </Button>
            </div>

            <Separator className="bg-gradient-to-r from-border to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* AI Preferences */}
                <div className="group relative md:col-span-2 lg:col-span-1">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative h-full bg-card/50 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl">
                        <CardHeader className="pb-4 border-b border-border/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-xl border border-purple-500/20 shadow-inner">
                                    <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">AI Assistant</CardTitle>
                                    <CardDescription>
                                        Configure how our AI helps you earn.
                                        {isGlobalAiDisabled && <span className="block mt-1 text-red-500 font-semibold text-xs uppercase tracking-wide">⚠ Temporarily Disabled by Admin</span>}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            {/* Chat */}
                            <div className="flex items-center justify-between group/item hover:bg-muted/50 p-3 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${userPrefs.chat ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
                                        <Lightbulb className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-base font-semibold">AI Chat Assistant</Label>
                                        <p className="text-sm text-muted-foreground">Enable the floating AI helper to guide you.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={userPrefs.chat}
                                    disabled={isGlobalAiDisabled}
                                    onCheckedChange={(c) => setUserPrefs({ ...userPrefs, chat: c })}
                                />
                            </div>

                            {/* Auto Suggestions */}
                            <div className="flex items-center justify-between group/item hover:bg-muted/50 p-3 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${userPrefs.autoSuggestions ? "bg-blue-500/10 text-blue-600" : "bg-muted text-muted-foreground"}`}>
                                        <Sparkles className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-base font-semibold">Task Suggestions</Label>
                                        <p className="text-sm text-muted-foreground">Get smart recommendations for high-value tasks.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={userPrefs.autoSuggestions}
                                    disabled={isGlobalAiDisabled}
                                    onCheckedChange={(c) => setUserPrefs({ ...userPrefs, autoSuggestions: c })}
                                />
                            </div>

                            {/* Help Tips */}
                            <div className="flex items-center justify-between group/item hover:bg-muted/50 p-3 rounded-xl transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-full ${userPrefs.helpTips ? "bg-amber-500/10 text-amber-600" : "bg-muted text-muted-foreground"}`}>
                                        <Lightbulb className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-base font-semibold">Pro Tips</Label>
                                        <p className="text-sm text-muted-foreground">Show contextual hints to maximize earnings.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={userPrefs.helpTips}
                                    disabled={isGlobalAiDisabled}
                                    onCheckedChange={(c) => setUserPrefs({ ...userPrefs, helpTips: c })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Notifications (Simple Card for now) */}
                <div className="group relative md:col-span-2 lg:col-span-1">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                    <Card className="relative h-full bg-card/50 backdrop-blur-xl border-white/10 dark:border-white/5 shadow-2xl">
                        <CardHeader className="pb-4 border-b border-border/10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/20 shadow-inner">
                                    <Bell className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <CardTitle className="text-xl">Notifications</CardTitle>
                                    <CardDescription>Stay updated on key events.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="flex items-center justify-between group/item hover:bg-muted/50 p-3 rounded-xl transition-colors opactiy-75">
                                <div className="flex items-center gap-4">
                                    <div className="p-2 rounded-full bg-muted text-muted-foreground">
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-base font-semibold">Email Alerts</Label>
                                        <p className="text-sm text-muted-foreground">Get notified about payouts and huge updates.</p>
                                    </div>
                                </div>
                                <Switch disabled checked={true} />
                            </div>
                            <div className="rounded-lg bg-blue-500/10 p-4 border border-blue-500/20 text-sm text-blue-600 dark:text-blue-400">
                                <strong>Note:</strong> More granular notification controls are coming soon!
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
