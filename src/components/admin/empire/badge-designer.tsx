"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Award, Plus, Save, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export function BadgeDesigner() {
    const queryClient = useQueryClient();
    const [form, setForm] = useState({ name: "", description: "", reqType: "REFERRALS", reqValue: "10", xpBonus: "500" });

    const { data: badges } = useQuery({
        queryKey: ["admin-badges"],
        queryFn: async () => (await fetch("/api/admin/empire/badges")).json().then(r => r.badges || [])
    });

    const mutation = useMutation({
        mutationFn: async () => {
            await fetch("/api/admin/empire/badges", {
                method: "POST",
                body: JSON.stringify(form)
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-badges"] });
            toast.success("Badge Created!");
            setForm({ name: "", description: "", reqType: "REFERRALS", reqValue: "10", xpBonus: "500" });
        }
    });

    return (
        <Card className="bg-zinc-950/40 border-white/5 h-full">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-indigo-400" />
                    <CardTitle className="text-sm font-black uppercase text-indigo-100">Badge Designer</CardTitle>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
                <div className="space-y-4">
                    <div className="space-y-1">
                        <Label>Badge Name</Label>
                        <Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10" placeholder="e.g. Traffic Master" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label>Requirement Type</Label>
                            <Select value={form.reqType} onValueChange={v => setForm({ ...form, reqType: v })}>
                                <SelectTrigger className="bg-white/5 border-white/10"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="REFERRALS">Referrals</SelectItem>
                                    <SelectItem value="TASKS">Task Count</SelectItem>
                                    <SelectItem value="EARNINGS">Total Earned</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1">
                            <Label>Threshold Value</Label>
                            <Input type="number" value={form.reqValue} onChange={e => setForm({ ...form, reqValue: e.target.value })} className="bg-white/5 border-white/10" />
                        </div>
                    </div>

                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={!form.name || mutation.isPending}
                        className="w-full bg-indigo-600 hover:bg-indigo-700"
                    >
                        {mutation.isPending ? <Loader2 className="animate-spin w-4 h-4" /> : <Plus className="w-4 h-4 mr-2" />}
                        CREATE BADGE
                    </Button>
                </div>

                <div className="space-y-2 mt-6">
                    <h4 className="text-xs font-bold text-zinc-500 uppercase">Existing Badges</h4>
                    <div className="flex flex-wrap gap-2">
                        {badges?.map((b: any) => (
                            <div key={b.id} className="px-3 py-1 bg-white/5 rounded border border-white/10 text-xs text-zinc-300 flex items-center gap-2">
                                <Award className="w-3 h-3 text-indigo-400" />
                                {b.name}
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
