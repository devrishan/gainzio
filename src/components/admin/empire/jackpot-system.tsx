"use client";

import { useMutation } from "@tanstack/react-query";
import { Coins, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";

export function JackpotButton() {
    const [amount, setAmount] = useState("100");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/empire/jackpot", {
                method: "POST",
                body: JSON.stringify({ amount, message: "Jackpot!" })
            });
            const data = await res.json();
            if (!data.success) throw new Error("Failed");
            return data.count;
        },
        onSuccess: (count) => {
            toast.success(`Jackpot sent to ${count} active users!`);
        }
    });

    return (
        <Card className="bg-gradient-to-br from-amber-500/20 to-black border-amber-500/20 p-6 flex flex-col items-center justify-center text-center h-full relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10" />

            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative z-10"
            >
                <div className="bg-amber-500/20 p-6 rounded-full border-4 border-amber-500/50 mb-4 shadow-[0_0_50px_rgba(245,158,11,0.3)]">
                    <Coins className="w-12 h-12 text-amber-400" />
                </div>
            </motion.div>

            <h3 className="text-2xl font-black uppercase text-amber-500 tracking-widest mb-2">Jackpot</h3>
            <p className="text-xs text-amber-200/60 mb-6">Distribute coins to all 24h active users.</p>

            <div className="flex gap-2 w-full max-w-[200px]">
                <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="bg-black/50 border-amber-500/30 text-center font-bold text-amber-400"
                />
                <Button
                    onClick={() => mutation.mutate()}
                    disabled={mutation.isPending}
                    className="bg-amber-500 hover:bg-amber-600 text-black font-bold"
                >
                    {mutation.isPending ? <Loader2 className="animate-spin" /> : "DROP"}
                </Button>
            </div>
        </Card>
    );
}
