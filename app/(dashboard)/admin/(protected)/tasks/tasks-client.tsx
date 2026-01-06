"use client";

import { useState } from "react";
import { AdminTask } from "@/services/admin";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger
} from "@/components/ui/sheet";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { format } from "date-fns";
import {
    Plus, Search, Edit2, Trash2, CheckCircle2, XCircle, Coins, DollarSign, Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Switch } from "@/components/ui/switch";

interface TasksClientProps {
    initialTasks: AdminTask[];
    categories: { id: string; name: string; slug: string }[];
}

export default function TasksClient({ initialTasks, categories }: TasksClientProps) {
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks);
    const [search, setSearch] = useState("");
    const [isSheetOpen, setIsSheetOpen] = useState(false);
    const [currentTask, setCurrentTask] = useState<Partial<AdminTask> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Filter tasks
    const filteredTasks = tasks.filter(task =>
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.category.name.toLowerCase().includes(search.toLowerCase())
    );

    const handleEdit = (task: AdminTask) => {
        setCurrentTask(task);
        setIsSheetOpen(true);
    };

    const handleCreate = () => {
        setCurrentTask({});
        setIsSheetOpen(true);
    };

    const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);

        const data = {
            title: formData.get("title"),
            description: formData.get("description"),
            categoryId: formData.get("categoryId"),
            rewardAmount: formData.get("rewardAmount"),
            rewardCoins: formData.get("rewardCoins"),
            difficulty: formData.get("difficulty"),
            minRank: formData.get("minRank"),
            isActive: formData.get("isActive") === "on",
            priority: formData.get("priority"),
            maxSubmissions: formData.get("maxSubmissions"),
        };

        try {
            const isEdit = !!currentTask?.id;
            const url = isEdit ? `/api/admin/tasks/${currentTask.id}` : "/api/admin/tasks";
            const method = isEdit ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!res.ok) throw new Error("Failed to save task");

            toast.success(isEdit ? "Task updated" : "Task created");
            router.refresh();
            setIsSheetOpen(false);
            // In a real app we might update local state optimistically or re-fetch
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        try {
            const res = await fetch(`/api/admin/tasks/${id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Failed to delete");

            toast.success("Task deleted");
            router.refresh();
            setTasks(prev => prev.filter(t => t.id !== id));
        } catch (error) {
            toast.error("Failed to delete task");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                    <Input
                        placeholder="Search tasks..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-black/20 border-white/10"
                    />
                </div>
                <Button onClick={handleCreate} className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold">
                    <Plus className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {filteredTasks.map((task) => (
                    <Card key={task.id} className="p-6 bg-zinc-950/40 border-white/5 backdrop-blur-sm hover:bg-zinc-900/40 transition-all group">
                        <div className="flex items-start justify-between">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <h3 className="font-bold text-white text-lg">{task.title}</h3>
                                    <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider border-0 ${task.isActive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                        }`}>
                                        {task.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                    <Badge variant="outline" className="border-white/10 text-neutral-400">
                                        {task.category.name}
                                    </Badge>
                                    <Badge variant="outline" className={`border-white/10 ${task.difficulty === 'EASY' ? 'text-emerald-400' :
                                        task.difficulty === 'MEDIUM' ? 'text-amber-400' :
                                            'text-red-400'
                                        }`}>
                                        {task.difficulty}
                                    </Badge>
                                </div>

                                <p className="text-sm text-neutral-400 line-clamp-1 max-w-2xl">
                                    {task.description}
                                </p>

                                <div className="flex items-center gap-4 text-xs font-mono mt-2">
                                    <div className="flex items-center gap-1.5 text-emerald-400">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <span>₹{task.rewardAmount}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-amber-400">
                                        <Coins className="w-3.5 h-3.5" />
                                        <span>{task.rewardCoins} Coins</span>
                                    </div>
                                    <span className="text-neutral-600">|</span>
                                    <span className="text-neutral-500">{task.submissionCount} Submissions</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(task)} className="h-8 w-8 hover:bg-white/10">
                                    <Edit2 className="w-4 h-4 text-neutral-400" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(task.id)} className="h-8 w-8 hover:bg-red-500/10 hover:text-red-500">
                                    <Trash2 className="w-4 h-4 text-neutral-400" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent className="w-[400px] sm:w-[540px] border-l-white/10 bg-zinc-950 text-white overflow-y-auto">
                    <SheetHeader>
                        <SheetTitle className="text-white">{currentTask?.id ? "Edit Task" : "Create New Task"}</SheetTitle>
                        <SheetDescription>Configure task details, rewards, and constraints.</SheetDescription>
                    </SheetHeader>

                    <form onSubmit={handleSave} className="space-y-6 mt-6">
                        <div className="space-y-2">
                            <Label>Task Title</Label>
                            <Input name="title" defaultValue={currentTask?.title} required className="bg-white/5 border-white/10" />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea name="description" defaultValue={currentTask?.description} required className="bg-white/5 border-white/10 min-h-[100px]" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Category</Label>
                                <Select name="categoryId" defaultValue={currentTask?.category?.slug ? categories.find(c => c.name === currentTask.category.name)?.id : undefined}>
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Difficulty</Label>
                                <Select name="difficulty" defaultValue={currentTask?.difficulty || "EASY"}>
                                    <SelectTrigger className="bg-white/5 border-white/10">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="EASY">Easy</SelectItem>
                                        <SelectItem value="MEDIUM">Medium</SelectItem>
                                        <SelectItem value="HARD">Hard</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Reward Amount (₹)</Label>
                                <Input type="number" name="rewardAmount" defaultValue={currentTask?.rewardAmount} required className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Reward Coins</Label>
                                <Input type="number" name="rewardCoins" defaultValue={currentTask?.rewardCoins} required className="bg-white/5 border-white/10" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Max Submissions</Label>
                                <Input type="number" name="maxSubmissions" placeholder="Unlimited" defaultValue={currentTask?.submissionCount} className="bg-white/5 border-white/10" />
                            </div>
                            <div className="space-y-2">
                                <Label>Priority</Label>
                                <Input type="number" name="priority" defaultValue={0} className="bg-white/5 border-white/10" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10">
                            <div className="space-y-0.5">
                                <Label>Active Status</Label>
                                <p className="text-xs text-neutral-400">Task will be visible to users</p>
                            </div>
                            <Switch name="isActive" defaultChecked={currentTask?.isActive ?? true} />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={() => setIsSheetOpen(false)}>Cancel</Button>
                            <Button type="submit" disabled={isSaving} className="bg-white text-black hover:bg-neutral-200">
                                {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </SheetContent>
            </Sheet>
        </div>
    );
}
