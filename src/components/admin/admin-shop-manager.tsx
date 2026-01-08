"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash, Store, Save, X, Power, PowerOff } from "lucide-react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

interface ShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    type: string;
    isActive: boolean;
    icon: string;
}

export function AdminShopManager() {
    const [items, setItems] = useState<ShopItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // Form State
    const [editingItem, setEditingItem] = useState<ShopItem | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        cost: "100",
        type: "PERK",
        icon: "Gift"
    });

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/gamification/items");
            if (res.ok) {
                const data = await res.json();
                setItems(data);
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, []);

    const resetForm = () => {
        setEditingItem(null);
        setFormData({
            name: "",
            description: "",
            cost: "100",
            type: "PERK",
            icon: "Gift"
        });
    };

    const handleSave = async () => {
        const isEdit = !!editingItem;
        const endpoint = "/api/admin/gamification/items";
        const method = isEdit ? "PUT" : "POST";
        const body = isEdit ? { id: editingItem.id, ...formData } : formData;

        try {
            const res = await fetch(endpoint, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body)
            });

            if (!res.ok) throw new Error("Failed to save");

            toast.success(isEdit ? "Item updated" : "Item created");
            setIsDialogOpen(false);
            fetchItems();
            resetForm();
        } catch (error) {
            toast.error("Error saving item");
        }
    };

    const handleToggleActive = async (item: ShopItem) => {
        try {
            await fetch("/api/admin/gamification/items", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: item.id, isActive: !item.isActive })
            });
            fetchItems();
            toast.success(`Item ${item.isActive ? "deactivated" : "activated"}`);
        } catch (error) {
            toast.error("Update failed");
        }
    };

    const openEdit = (item: ShopItem) => {
        setEditingItem(item);
        setFormData({
            name: item.name,
            description: item.description,
            cost: String(item.cost),
            type: item.type,
            icon: item.icon
        });
        setIsDialogOpen(true);
    };

    return (
        <Card className="border-orange-500/20 bg-gradient-to-br from-orange-500/5 via-background to-background">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-2xl flex items-center gap-2">
                        <Store className="h-6 w-6 text-orange-500" />
                        Shop Inventory
                    </CardTitle>
                    <CardDescription>Manage items available in the coin shop</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                    setIsDialogOpen(open);
                    if (!open) resetForm();
                }}>
                    <DialogTrigger asChild>
                        <Button className="bg-orange-600 hover:bg-orange-700 text-white">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{editingItem ? "Edit Item" : "Create New Item"}</DialogTitle>
                            <DialogDescription>
                                Configure the item details for the shop.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Item Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. Streak Freeze"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="desc">Description</Label>
                                <Input
                                    id="desc"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Brief description of effect"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="cost">Cost (Coins)</Label>
                                    <Input
                                        id="cost"
                                        type="number"
                                        value={formData.cost}
                                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="type">Type</Label>
                                    <Select
                                        value={formData.type}
                                        onValueChange={(val) => setFormData({ ...formData, type: val })}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="PERK">Perk (Effect)</SelectItem>
                                            <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                                            <SelectItem value="COSMETIC">Cosmetic</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="icon">Icon Name (Lucide)</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="e.g. Zap, Snowflake"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700">Save Item</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border border-white/10">
                    <div className="grid grid-cols-12 gap-4 p-4 text-sm font-medium text-muted-foreground border-b border-white/10 bg-muted/20">
                        <div className="col-span-4">Item Details</div>
                        <div className="col-span-2 text-center">Type</div>
                        <div className="col-span-2 text-right">Cost</div>
                        <div className="col-span-2 text-center">Status</div>
                        <div className="col-span-2 text-right">Actions</div>
                    </div>
                    {isLoading ? (
                        <div className="p-8 text-center text-muted-foreground">Loading inventory...</div>
                    ) : items.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">No items in shop.</div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 p-4 items-center border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                                <div className="col-span-4">
                                    <div className="font-semibold text-foreground">{item.name}</div>
                                    <div className="text-xs text-muted-foreground">{item.description}</div>
                                </div>
                                <div className="col-span-2 text-center">
                                    <Badge variant="secondary" className="text-[10px]">{item.type}</Badge>
                                </div>
                                <div className="col-span-2 text-right font-mono text-orange-500 font-bold">
                                    {item.cost.toLocaleString()}
                                </div>
                                <div className="col-span-2 flex justify-center">
                                    <div className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold border ${item.isActive ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"}`}>
                                        {item.isActive ? "ACTIVE" : "INACTIVE"}
                                    </div>
                                </div>
                                <div className="col-span-2 flex justify-end gap-2">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => openEdit(item)}>
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className={`h-8 w-8 ${item.isActive ? "text-red-400 hover:text-red-300 hover:bg-red-900/20" : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20"}`}
                                        onClick={() => handleToggleActive(item)}
                                    >
                                        {item.isActive ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
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
