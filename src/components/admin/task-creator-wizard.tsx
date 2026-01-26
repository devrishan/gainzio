"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, List, Trophy, Coins, Star, Loader2, Save, MapPin, Target, ShieldCheck, Zap, LayoutDashboard, Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";

// Strict Location Data
const INDIA_LOCATIONS: Record<string, string[]> = {
    "Kerala": ["Kochi", "Thiruvananthapuram", "Kozhikode", "Thrissur", "Malappuram"],
    "Karnataka": ["Bangalore", "Mysore", "Mangalore", "Hubli"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Salem"],
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Nashik"],
    "Delhi": ["New Delhi", "North Delhi", "South Delhi"],
};

const WHATSAPP_TEMPLATE = `Post the given content as your WhatsApp status and keep it live for the required time. Upload proof screenshots to complete the task.

1. Download the image/text provided.
2. Post it on your WhatsApp Status.
3. Take a screenshot IMMEDIATELY (Proof 1).
4. Keep it live for 24 hours.
5. Take a screenshot AFTER 24 hours (Proof 2).

Reward unlocks only after admin verification.`;

export function TaskCreatorWizard() {
    const queryClient = useQueryClient();
    const [mode, setMode] = useState<"LIST" | "CREATE">("LIST");

    // Form State
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        categoryId: "",
        rewardAmount: "5",
        rewardCoins: "100",
        difficulty: "EASY",
        priority: "0",
        isActive: true,
        taskType: "STANDARD",
        minRank: "NEWBIE",
        maxSubmissions: "",
        expiresAt: "",
        targeting: {
            minAge: 10,
            state: "",
            district: "",
            verifiedOnly: true,
            startScreenshot: true,
            endScreenshot: true,
        }
    });

    // Auto-populate for Social Media
    useEffect(() => {
        if (formData.taskType === "SOCIAL_MEDIA") {
            setFormData(prev => ({
                ...prev,
                title: prev.title || "WhatsApp Status Task",
                description: WHATSAPP_TEMPLATE,
                targeting: {
                    ...prev.targeting,
                    minAge: 18,
                    verifiedOnly: true
                }
            }));
        }
    }, [formData.taskType]);

    // Fetch Categories
    const { data: categories } = useQuery({
        queryKey: ["task-categories"],
        queryFn: async () => (await fetch("/api/admin/tasks/categories")).json().then(r => r.categories)
    });

    // Fetch Tasks
    const { data: tasks, isLoading } = useQuery({
        queryKey: ["admin-tasks"],
        queryFn: async () => (await fetch("/api/admin/tasks")).json().then(r => r.tasks)
    });

    const createMutation = useMutation({
        mutationFn: async (data: any) => {
            const res = await fetch("/api/admin/tasks", {
                method: "POST",
                body: JSON.stringify(data)
            });
            if (!res.ok) throw new Error("Failed");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-tasks"] });
            toast.success("Mission Deployed Successfully!");
            setMode("LIST");
            setFormData({
                title: "",
                description: "",
                categoryId: "",
                rewardAmount: "5",
                rewardCoins: "100",
                difficulty: "EASY",
                priority: "0",
                isActive: true,
                taskType: "STANDARD",
                minRank: "NEWBIE",
                maxSubmissions: "",
                expiresAt: "",
                targeting: { minAge: 10, state: "", district: "", verifiedOnly: true, startScreenshot: true, endScreenshot: true }
            });
        }
    });

    if (mode === "LIST") {
        return (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex justify-between items-end border-b border-white/5 pb-6">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50 uppercase tracking-tighter">
                            Mission Control
                        </h2>
                        <p className="text-sm text-zinc-500 font-mono uppercase tracking-widest">
                            Manage & Deploy Earning Operations
                        </p>
                    </div>
                    <Button
                        onClick={() => setMode("CREATE")}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white border-0 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] transition-all hover:scale-105"
                    >
                        <Plus className="w-4 h-4 mr-2" /> CREATE MISSION
                    </Button>
                </div>

                <div className="grid gap-4">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-600">
                            <Loader2 className="animate-spin w-8 h-8 text-indigo-500" />
                            <p className="text-xs font-mono uppercase tracking-widest">Loading Intel...</p>
                        </div>
                    ) : tasks?.map((task: any) => (
                        <div
                            key={task.id}
                            className="group relative overflow-hidden rounded-xl border border-white/5 bg-zinc-950/40 p-1 transition-all hover:border-indigo-500/30"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/0 via-indigo-500/5 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                            <div className="relative flex items-center justify-between gap-6 rounded-lg bg-black/40 p-4 backdrop-blur-sm">
                                <div className="flex items-center gap-5">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-lg border border-white/5 ${task.isActive ? 'bg-emerald-500/10 text-emerald-500 shadow-[0_0_15px_-5px_rgba(16,185,129,0.3)]' : 'bg-red-500/10 text-red-500'}`}>
                                        <Trophy className="h-6 w-6" />
                                    </div>

                                    <div className="space-y-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-bold text-white text-lg tracking-tight">{task.title}</h3>
                                            <Badge variant="outline" className="bg-white/5 border-white/10 text-[10px] text-zinc-400 uppercase tracking-wider">
                                                {task.category?.name}
                                            </Badge>
                                            {task.task_type === "SOCIAL_MEDIA" && (
                                                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-[10px] text-blue-400 uppercase tracking-wider">
                                                    Social Partner
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                                            <span className="flex items-center gap-1.5 text-emerald-400">
                                                <Coins className="w-3.5 h-3.5" /> ₹{task.rewardAmount}
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span className="flex items-center gap-1.5 text-amber-400">
                                                <Star className="w-3.5 h-3.5" /> {task.rewardCoins} XP
                                            </span>
                                            <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                            <span className="uppercase tracking-widest">{task.difficulty}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                    <div className={`px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-widest border ${task.isActive ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-500' : 'border-red-500/20 bg-red-500/5 text-red-500'}`}>
                                        {task.isActive ? 'Active' : 'Offline'}
                                    </div>
                                    <div className="text-[10px] text-zinc-600 font-mono">
                                        Priority: {task.priority}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    {tasks?.length === 0 && <p className="text-zinc-500 text-sm text-center py-10">No missions deployed.</p>}
                </div>
            </div>
        );
    }

    // CREATE MODE
    return (
        <div className="max-w-5xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 shadow-[0_0_20px_-5px_rgba(99,102,241,0.3)]">
                        <Zap className="h-6 w-6 text-indigo-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">Mission Wizard</h2>
                        <p className="text-xs text-indigo-300/60 font-mono uppercase tracking-widest">
                            Configure & Launch New Operation
                        </p>
                    </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setMode("LIST")} className="text-zinc-400 hover:text-white hover:bg-white/5">
                    Cancel Operation
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Configuration */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Basic Info Card */}
                    <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                                <LayoutDashboard className="w-4 h-4" /> Mission Intel
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-500 uppercase font-bold">Mission Title</Label>
                                <Input
                                    placeholder="e.g. Subscribe to Official Channel"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="bg-black/20 border-white/10 focus:border-indigo-500/50 h-12 text-lg font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-xs text-zinc-500 uppercase font-bold">Category</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, categoryId: v })} value={formData.categoryId}>
                                        <SelectTrigger className="bg-black/20 border-white/10 h-10"><SelectValue placeholder="Select Sector" /></SelectTrigger>
                                        <SelectContent>
                                            {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs text-zinc-500 uppercase font-bold">Operation Type</Label>
                                    <Select onValueChange={(v) => setFormData({ ...formData, taskType: v })} value={formData.taskType}>
                                        <SelectTrigger className="bg-black/20 border-white/10 h-10"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="STANDARD">Standard Protocol</SelectItem>
                                            <SelectItem value="SOCIAL_MEDIA">Social Partner Protocol</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-500 uppercase font-bold">Briefing / Instructions</Label>
                                <Textarea
                                    placeholder="Detailed steps for the agent..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="bg-black/20 border-white/10 min-h-[150px] font-mono text-sm leading-relaxed resize-none focus:border-indigo-500/50"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Social Media Targeting Module */}
                    {formData.taskType === "SOCIAL_MEDIA" && (
                        <Card className="bg-blue-500/5 border-blue-500/20 backdrop-blur-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3 opacity-20"><Globe className="w-24 h-24 text-blue-500" /></div>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-blue-400">
                                    <Target className="w-4 h-4" /> Geo-Targeting Matrix
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6 relative z-10">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs text-blue-300/70">Target State</Label>
                                        <Select
                                            value={formData.targeting.state}
                                            onValueChange={(v) => setFormData({ ...formData, targeting: { ...formData.targeting, state: v, district: "" } })}
                                        >
                                            <SelectTrigger className="bg-black/20 border-blue-500/20 text-blue-100"><SelectValue placeholder="All Regions" /></SelectTrigger>
                                            <SelectContent>{Object.keys(INDIA_LOCATIONS).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-blue-300/70">Target District</Label>
                                        <Select
                                            value={formData.targeting.district}
                                            disabled={!formData.targeting.state}
                                            onValueChange={(v) => setFormData({ ...formData, targeting: { ...formData.targeting, district: v } })}
                                        >
                                            <SelectTrigger className="bg-black/20 border-blue-500/20 text-blue-100"><SelectValue placeholder={formData.targeting.state ? "Select District" : "State Required"} /></SelectTrigger>
                                            <SelectContent>{formData.targeting.state && INDIA_LOCATIONS[formData.targeting.state]?.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                                    <div className="flex-1">
                                        <h4 className="text-sm font-bold text-blue-300">Verified Agents Only</h4>
                                        <p className="text-[10px] text-blue-300/60">Strict enforcement: KYC + Location + Phone verified users only.</p>
                                    </div>
                                    <Switch checked={formData.targeting.verifiedOnly} disabled />
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar Configuration */}
                <div className="space-y-6">

                    {/* Rewards Card */}
                    <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                                <Coins className="w-4 h-4" /> Bounty Config
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-zinc-500">Cash Reward (INR)</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">₹</div>
                                    <Input
                                        type="number"
                                        value={formData.rewardAmount}
                                        onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                                        className="bg-black/20 border-white/10 pl-8 text-emerald-400 font-bold font-mono text-lg"
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-zinc-500">XP Reward</Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500"><Star className="w-3 h-3 fill-amber-500" /></div>
                                    <Input
                                        type="number"
                                        value={formData.rewardCoins}
                                        onChange={(e) => setFormData({ ...formData, rewardCoins: e.target.value })}
                                        className="bg-black/20 border-white/10 pl-8 text-amber-400 font-bold font-mono"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meta Data Card */}
                    <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-xl">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-zinc-400">
                                <List className="w-4 h-4" /> Parameters
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-zinc-500">Difficulty Class</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, difficulty: v })} value={formData.difficulty}>
                                    <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EASY">Class: Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Class: Medium</SelectItem>
                                        <SelectItem value="HARD">Class: Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-zinc-500">Clearance Level</Label>
                                <Select onValueChange={(v) => setFormData({ ...formData, minRank: v })} value={formData.minRank}>
                                    <SelectTrigger className="bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ALL">All Ranks</SelectItem>
                                        <SelectItem value="NEWBIE">Newbie</SelectItem>
                                        <SelectItem value="PRO">Pro</SelectItem>
                                        <SelectItem value="ELITE">Elite</SelectItem>
                                        <SelectItem value="MASTER">Master</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-zinc-500">Priority Index</Label>
                                <Input
                                    type="number"
                                    value={formData.priority}
                                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-bold uppercase text-zinc-500">Submission Cap</Label>
                                <Input
                                    type="number"
                                    placeholder="∞ Unlimited"
                                    value={formData.maxSubmissions}
                                    onChange={(e) => setFormData({ ...formData, maxSubmissions: e.target.value })}
                                    className="bg-black/20 border-white/10"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Button
                        onClick={() => createMutation.mutate(formData)}
                        className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-black tracking-widest h-14 shadow-[0_0_20px_-5px_rgba(79,70,229,0.5)] border border-white/10"
                        disabled={createMutation.isPending || !formData.title || !formData.categoryId}
                    >
                        {createMutation.isPending ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                        {createMutation.isPending ? "INITIALIZING..." : "LAUNCH MISSION"}
                    </Button>

                </div>
            </div>
        </div>
    );
}
