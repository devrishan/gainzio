"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ticket, Plus, Copy, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useState } from "react";
import { format } from "date-fns";

export function PromoCodeManager() {
    const queryClient = useQueryClient();
    const [code, setCode] = useState("");
    const [value, setValue] = useState("");

    const { data: promos } = useQuery({
        queryKey: ["admin-promos"],
        queryFn: async () => (await fetch("/api/admin/promo")).json().then(r => r.promos)
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/promo", {
                method: "POST",
                body: JSON.stringify({ code, value, maxUses: 100 })
            });
            if (!res.ok) throw new Error("Failed");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-promos"] });
            setCode(""); setValue("");
            toast.success("Promo code created.");
        }
    });

    return (
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md h-full">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-pink-500/10 flex items-center justify-center border border-pink-500/20">
                        <Ticket className="h-5 w-5 text-pink-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black uppercase text-white tracking-wide">Promo Codes</CardTitle>
                        <CardDescription className="text-xs">Manage active coupons.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="flex gap-2">
                    <Input
                        placeholder="Code (e.g. SAVE20)"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="bg-zinc-900/50 border-white/10 font-mono"
                    />
                    <Input
                        placeholder="Value (₹)"
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        className="bg-zinc-900/50 border-white/10 w-24"
                    />
                    <Button
                        size="icon"
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !code || !value}
                        className="bg-pink-600 hover:bg-pink-700"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>

                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2">
                    {promos?.map((p: any) => (
                        <div key={p.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-mono font-bold text-white">{p.code}</span>
                                    <Badge variant="outline" className="text-[10px] text-pink-400 border-pink-500/20">₹{p.value}</Badge>
                                </div>
                                <p className="text-[10px] text-zinc-500">Created {format(new Date(p.createdAt), "MMM d")}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-mono text-zinc-400">{p.currentUses} / {p.maxUses}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
