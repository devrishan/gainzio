"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Image as ImageIcon, Plus, Trash2, Loader2, Link as LinkIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

export function BillboardManager() {
    const queryClient = useQueryClient();
    const [newUrl, setNewUrl] = useState("");
    const [newLink, setNewLink] = useState("");

    const { data: banners } = useQuery({
        queryKey: ["admin-banners"],
        queryFn: async () => (await fetch("/api/admin/content/banners")).json().then(r => r.banners || [])
    });

    const mutation = useMutation({
        mutationFn: async (newBanners: any[]) => {
            await fetch("/api/admin/content/banners", {
                method: "POST",
                body: JSON.stringify({ banners: newBanners })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-banners"] });
            toast.success("Billboard updated.");
            setNewUrl(""); setNewLink("");
        }
    });

    const addBanner = () => {
        if (!newUrl) return;
        const current = banners ? [...banners] : [];
        current.push({ id: Date.now().toString(), imageUrl: newUrl, link: newLink, isActive: true });
        mutation.mutate(current);
    };

    const removeBanner = (id: string) => {
        const current = banners.filter((b: any) => b.id !== id);
        mutation.mutate(current);
    };

    return (
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md h-full">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <ImageIcon className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black uppercase text-white tracking-wide">The Billboard</CardTitle>
                        <CardDescription className="text-xs">Home page slider manager.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">

                <div className="flex gap-2">
                    <div className="grid gap-2 flex-1">
                        <Input
                            placeholder="Image URL (e.g. https://...)"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            className="bg-zinc-900/50 border-white/10 text-xs"
                        />
                        <Input
                            placeholder="Target Link (Optional)"
                            value={newLink}
                            onChange={(e) => setNewLink(e.target.value)}
                            className="bg-zinc-900/50 border-white/10 text-xs"
                        />
                    </div>
                    <Button onClick={addBanner} disabled={!newUrl || mutation.isPending} className="h-auto bg-purple-600 hover:bg-purple-700">
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {banners?.map((b: any) => (
                        <div key={b.id} className="group relative aspect-video rounded-lg overflow-hidden border border-white/10 bg-black">
                            <img src={b.imageUrl} alt="Banner" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition" />
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition">
                                <Button size="icon" variant="destructive" className="h-6 w-6" onClick={() => removeBanner(b.id)}>
                                    <Trash2 className="w-3 h-3" />
                                </Button>
                            </div>
                            {b.link && (
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded text-[10px] text-white flex items-center gap-1 backdrop-blur-sm">
                                    <LinkIcon className="w-3 h-3" /> {b.link}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

            </CardContent>
        </Card>
    );
}
