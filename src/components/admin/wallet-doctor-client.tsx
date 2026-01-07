"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Stethoscope, PlusCircle, MinusCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

export function WalletDoctorClient() {
    const [userId, setUserId] = useState("");
    const [amount, setAmount] = useState("");
    const [type, setType] = useState("CREDIT");
    const [reason, setReason] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/wallet/adjust", {
                method: "POST",
                body: JSON.stringify({ userId, type, amount, reason })
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.error);
            return data;
        },
        onSuccess: () => {
            toast.success("Transaction executed successfully.");
            setUserId(""); setAmount(""); setReason("");
        },
        onError: (err) => {
            toast.error(err.message);
        }
    });

    return (
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                        <Stethoscope className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black uppercase text-white tracking-wide">Wallet Doctor</CardTitle>
                        <CardDescription className="text-xs">Manual credit/debit adjustments.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <Input
                    placeholder="User ID (e.g. clq...)"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    className="bg-zinc-900/50 border-white/10"
                />
                <div className="flex gap-2">
                    <Select value={type} onValueChange={setType}>
                        <SelectTrigger className="w-[120px] bg-zinc-900/50 border-white/10">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="CREDIT">Credit (+)</SelectItem>
                            <SelectItem value="DEBIT">Debit (-)</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input
                        placeholder="Amount"
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="bg-zinc-900/50 border-white/10"
                    />
                </div>
                <Input
                    placeholder="Audit Reason (Required)"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="bg-zinc-900/50 border-white/10"
                />
                <Button
                    onClick={() => mutation.mutate()}
                    className="w-full bg-blue-600 hover:bg-blue-700 font-bold"
                    disabled={mutation.isPending || !userId || !amount || !reason}
                >
                    {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "EXECUTE"}
                </Button>
            </CardContent>
        </Card>
    );
}
