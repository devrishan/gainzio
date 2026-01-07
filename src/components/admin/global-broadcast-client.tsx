"use client";

import { useState } from "react";
import { Megaphone, Send, CheckCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function GlobalBroadcastClient() {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleBroadcast = async () => {
        if (!title || !message) return;
        setLoading(true);
        try {
            const res = await fetch("/api/admin/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, message })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Broadcast sent to ${data.count} users!`);
                setTitle("");
                setMessage("");
            } else {
                toast.error("Broadcast failed.");
            }
        } catch (e) {
            toast.error("Error sending broadcast.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="bg-zinc-950/40 border-white/5 backdrop-blur-md">
            <CardHeader className="border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
                        <Megaphone className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-black uppercase text-white tracking-wide">Global Shout</CardTitle>
                        <CardDescription className="text-xs">Send a push notification to all active users.</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Alert Title</label>
                    <Input
                        placeholder="e.g. Double XP Weekend!"
                        className="bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-600"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-xs uppercase font-bold text-zinc-500 tracking-wider">Message Body</label>
                    <Textarea
                        placeholder="Detailed message..."
                        rows={3}
                        className="bg-zinc-900/50 border-white/5 text-white placeholder:text-zinc-600 resize-none"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>
                <Button
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold tracking-wide"
                    disabled={loading || !title || !message}
                    onClick={handleBroadcast}
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                    SEND BROADCAST
                </Button>
            </CardContent>
        </Card>
    );
}
