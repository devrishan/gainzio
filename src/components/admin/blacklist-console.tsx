"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Ban, Trash2, ShieldOff } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

export function BlacklistConsole() {
    const queryClient = useQueryClient();
    const [value, setValue] = useState("");
    const [type, setType] = useState("IP");
    const [reason, setReason] = useState("");

    const { data: blacklist } = useQuery({
        queryKey: ["admin-blacklist"],
        queryFn: async () => (await fetch("/api/admin/blacklist")).json().then(r => r.blacklist)
    });

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/blacklist", {
                method: "POST",
                body: JSON.stringify({ type, value, reason })
            });
            if (!res.ok) throw new Error("Failed");
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-blacklist"] });
            toast.success("Added to blacklist.");
            setValue(""); setReason("");
        }
    });

    return (
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md h-full">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center border border-red-500/20">
                        <Ban className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black uppercase text-white tracking-wide">The Blacklist</CardTitle>
                        <CardDescription className="text-xs">Global ban enforcement.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                    <div className="flex gap-2">
                        <Select value={type} onValueChange={setType}>
                            <SelectTrigger className="w-[100px] bg-zinc-900/50 border-white/10">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IP">IP</SelectItem>
                                <SelectItem value="EMAIL">Email</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Value to ban..."
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            className="bg-zinc-900/50 border-white/10"
                        />
                    </div>
                    <Input
                        placeholder="Reason for ban..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="bg-zinc-900/50 border-white/10"
                    />
                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={mutation.isPending || !value}
                        className="w-full bg-red-600 hover:bg-red-700"
                    >
                        <ShieldOff className="w-4 h-4 mr-2" />
                        BAN PERMANENTLY
                    </Button>
                </div>

                <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                    {blacklist?.map((item: any) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white/5 rounded w-full">
                            <div className="overflow-hidden">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] bg-zinc-800 px-1 rounded text-zinc-400">{item.type}</span>
                                    <span className="font-mono text-xs text-white truncate">{item.value}</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 truncate">{item.reason}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
