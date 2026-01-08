"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, List, Trophy, Coins, Star, Loader2, Save } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch"; // Assuming Switch exists in UI
import { toast } from "sonner";
import { useState } from "react";

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
        targeting: {
            minAge: 10,
            state: "",
            district: "",
            verifiedOnly: true
        }
    });

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
            toast.success("Task Published!");
            setMode("LIST");
            setFormData({ title: "", description: "", categoryId: "", rewardAmount: "5", rewardCoins: "100", difficulty: "EASY", priority: "0", isActive: true, taskType: "STANDARD", targeting: { minAge: 10, state: "", district: "", verifiedOnly: true } });
        }
    });

    if (mode === "LIST") {
        return (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white uppercase tracking-tight">Task Library</h2>
                    <Button onClick={() => setMode("CREATE")} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-4 h-4 mr-2" /> New Task
                    </Button>
                </div>

                <div className="grid gap-4">
                    {isLoading ? <Loader2 className="animate-spin text-zinc-500" /> : tasks?.map((task: any) => (
                        <Card key={task.id} className="bg-zinc-950/40 border-white/5 hover:border-white/10 transition px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-2 h-12 rounded-full ${task.isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                <div>
                                    <h3 className="font-bold text-white">{task.title}</h3>
                                    <p className="text-xs text-zinc-500 flex items-center gap-2">
                                        <span className="bg-white/5 px-2 py-0.5 rounded text-zinc-400">{task.category?.name}</span>
                                        <span>•</span>
                                        <span>₹{task.rewardAmount}</span>
                                    </p>
                                </div>
                            </div>
                            {/* Simple stats or actions later */}
                        </Card>
                    ))}
                    {tasks?.length === 0 && <p className="text-zinc-500 text-sm">No tasks found.</p>}
                </div>
            </div>
        );
    }

    return (
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <List className="h-5 w-5 text-indigo-400" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-black uppercase text-white tracking-wide">Task Wizard</CardTitle>
                            <CardDescription className="text-xs">Create a new earning opportunity.</CardDescription>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setMode("LIST")}>Cancel</Button>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

                <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-zinc-500">Title</Label>
                    <Input
                        placeholder="e.g. Subscribe to YouTube"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-zinc-900/50 border-white/10"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-zinc-500">Task Type</Label>
                        <Select onValueChange={(v) => setFormData({ ...formData, taskType: v })} value={formData.taskType}>
                            <SelectTrigger className="bg-zinc-900/50 border-white/10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="STANDARD">Standard</SelectItem>
                                <SelectItem value="SOCIAL_MEDIA">Social Media</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-zinc-500">Difficulty</Label>
                        <Select onValueChange={(v) => setFormData({ ...formData, difficulty: v })} value={formData.difficulty}>
                            <SelectTrigger className="bg-zinc-900/50 border-white/10"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EASY">Easy</SelectItem>
                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                <SelectItem value="HARD">Hard</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {formData.taskType === "SOCIAL_MEDIA" && (
                    <div className="space-y-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h4 className="text-sm font-bold text-blue-300 uppercase">Targeting & Eligibility</h4>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Target State</Label>
                                <Input
                                    placeholder="e.g. Kerala"
                                    value={formData.targeting.state}
                                    onChange={(e) => setFormData({ ...formData, targeting: { ...formData.targeting, state: e.target.value } })}
                                    className="bg-black/40 border-white/10"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Target District</Label>
                                <Input
                                    placeholder="e.g. Kochi"
                                    value={formData.targeting.district}
                                    onChange={(e) => setFormData({ ...formData, targeting: { ...formData.targeting, district: e.target.value } })}
                                    className="bg-black/40 border-white/10"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs text-zinc-400">Min Age</Label>
                                <Input
                                    type="number"
                                    value={formData.targeting.minAge}
                                    min={10}
                                    onChange={(e) => setFormData({ ...formData, targeting: { ...formData.targeting, minAge: parseInt(e.target.value) } })}
                                    className="bg-black/40 border-white/10"
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-6">
                                <Switch
                                    checked={formData.targeting.verifiedOnly}
                                    onCheckedChange={(c) => setFormData({ ...formData, targeting: { ...formData.targeting, verifiedOnly: c } })}
                                />
                                <Label className="text-xs text-zinc-400">Verified Users Only</Label>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-zinc-500">Category</Label>
                        <Select onValueChange={(v) => setFormData({ ...formData, categoryId: v })} value={formData.categoryId}>
                            <SelectTrigger className="bg-zinc-900/50 border-white/10"><SelectValue placeholder="Select..." /></SelectTrigger>
                            <SelectContent>
                                {categories?.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase text-zinc-500">Description / Instructions</Label>
                        <Textarea
                            placeholder="Steps to complete..."
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-zinc-900/50 border-white/10 min-h-[100px]"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 p-4 bg-white/5 rounded-lg border border-white/5">
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1"><Coins className="w-3 h-3" /> Cash Reward (₹)</Label>
                        <Input type="number" value={formData.rewardAmount} onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })} className="bg-black/50 border-white/10 text-emerald-400 font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-zinc-400 flex items-center gap-1"><Star className="w-3 h-3" /> XP Reward</Label>
                        <Input type="number" value={formData.rewardCoins} onChange={(e) => setFormData({ ...formData, rewardCoins: e.target.value })} className="bg-black/50 border-white/10 text-amber-400 font-bold" />
                    </div>
                    <div className="space-y-2">
                        <Label className="text-[10px] font-bold uppercase text-zinc-400">Priority</Label>
                        <Input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} className="bg-black/50 border-white/10" />
                    </div>
                </div>

                <Button
                    onClick={() => createMutation.mutate(formData)}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 font-bold h-12"
                    disabled={createMutation.isPending || !formData.title || !formData.categoryId}
                >
                    {createMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                    PUBLISH TASK
                </Button>

            </CardContent>
        </Card>
    );
}
