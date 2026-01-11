"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Award, Save, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface BadgeItem {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    createdAt: string;
}

export function AdminBadgeManager() {
    const [badges, setBadges] = useState<BadgeItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [editingBadge, setEditingBadge] = useState<BadgeItem | null>(null);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        description: "",
        icon: "Award"
    });

    const fetchBadges = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/gamification/badges");
            if (res.ok) {
                const data = await res.json();
                setBadges(data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchBadges();
    }, []);

    const resetForm = () => {
        setEditingBadge(null);
        setFormData({
            code: "",
            name: "",
            description: "",
            icon: "Award"
        });
    };

    const handleSave = async () => {
        const isEdit = !!editingBadge;
        const endpoint = "/api/admin/gamification/badges";
        const method = isEdit ? "PUT" : "POST";
        const body = isEdit ? { id: editingBadge.id, ...formData } : formData;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || "Failed to save");
            }

            toast.success(isEdit ? "Badge updated" : "Badge created");
            setIsDialogOpen(false);
            fetchBadges();
            resetForm();
        } catch (error: any) {
            toast.error(error.message || "Error saving badge");
        }
    };

    const openEdit = (badge: BadgeItem) => {
        setEditingBadge(badge);
        setFormData({
            code: badge.code,
            name: badge.name,
            description: badge.description,
            icon: badge.icon || 'Award'
        });
        setIsDialogOpen(true);
    };

    return (
        <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 via-background to-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Award className="h-6 w-6 text-purple-500" />
                        Badge Registry
                    </CardTitle>
                    <CardDescription>Manage achievements and profile badges</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> New Badge
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingBadge ? "Edit Badge" : "Create New Badge"}</DialogTitle>
                            <DialogDescription>
                                Defines a global achievement badge. Code must be unique.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {!editingBadge && (
                                <div className="grid gap-2">
                                    <Label htmlFor="code">Badge Code (Unique ID)</Label>
                                    <Input
                                        id="code"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="e.g. EARLY_ADOPTER"
                                        className="uppercase font-mono"
                                    />
                                </div>
                            )}
                            <div className="grid gap-2">
                                <Label htmlFor="name">Display Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Early Adopter"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input
                                    id="desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="How to earn this..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="icon">Icon Name (Lucide)</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g. Award, Star, Zap"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
                                {editingBadge ? "Update Badge" : "Create Badge"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10">
                    <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-white/10 bg-muted/20">
                        <div className="col-span-2">Code</div>
                        <div className="col-span-4">Name / Desc</div>
                        <div className="col-span-3 text-center">Icon</div>
                        <div className="col-span-3 text-right">Actions</div>
                    </div>
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading badges...</div>
                    ) : badges.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No badges defined.</div>
                    ) : (
                        badges.map((badge) => (
                            <div key={badge.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                <div className="col-span-2 font-mono text-xs text-purple-400">
                                    {badge.code}
                                </div>
                                <div className="col-span-4">
                                    <div className="font-semibold text-foreground">{badge.name}</div>
                                    <div className="text-xs text-muted-foreground truncate">{badge.description}</div>
                                </div>
                                <div className="col-span-3 flex justify-center text-xs text-muted-foreground">
                                    {badge.icon}
                                </div>
                                <div className="col-span-3 flex justify-end gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(badge)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
