"use client";

import { useMutation } from "@tanstack/react-query";
import { Send, Zap, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";

export function StoryPublisher() {
    const [message, setMessage] = useState("");
    const [color, setColor] = useState("blue");

    const mutation = useMutation({
        mutationFn: async () => {
            const res = await fetch("/api/admin/content/stories", {
                method: "POST",
                body: JSON.stringify({ message, color, duration: 24 })
            });
            if (!res.ok) throw new Error("Failed");
        },
        onSuccess: () => {
            toast.success("Story Posted!");
            setMessage("");
        }
    });

    return (
        <Card className="bg-gradient-to-br from-orange-500/5 to-transparent border-orange-500/20 backdrop-blur-md h-full">
            <CardHeader className="border-b border-orange-500/10 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center border border-orange-500/20">
                        <Zap className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black uppercase text-white tracking-wide">Story Publisher</CardTitle>
                        <CardDescription className="text-xs text-orange-200/50">24h Status Updates.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
                <Textarea
                    placeholder="What's happening? (e.g. 'Bonus weekend starts now!')"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="bg-black/20 border-white/10 min-h-[100px] resize-none focus:border-orange-500/50 transition"
                    maxLength={100}
                />

                <div className="flex gap-2">
                    <Select value={color} onValueChange={setColor}>
                        <SelectTrigger className="w-[120px] bg-black/20 border-white/10"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="blue">Blue</SelectItem>
                            <SelectItem value="red">Red</SelectItem>
                            <SelectItem value="green">Green</SelectItem>
                            <SelectItem value="purple">Purple</SelectItem>
                        </SelectContent>
                    </Select>

                    <Button
                        onClick={() => mutation.mutate()}
                        disabled={!message || mutation.isPending}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 font-bold"
                    >
                        {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>POST STORY <Clock className="w-4 h-4 ml-2 opacity-50" /></>}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
