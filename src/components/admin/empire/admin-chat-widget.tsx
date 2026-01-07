"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState, useRef, useEffect } from "react";

export function AdminChatWidget() {
    const queryClient = useQueryClient();
    const [msg, setMsg] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const { data: messages } = useQuery({
        queryKey: ["admin-chat"],
        queryFn: async () => (await fetch("/api/admin/empire/chat")).json().then(r => r.messages || []),
        refetchInterval: 3000
    });

    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [messages]);

    const mutation = useMutation({
        mutationFn: async (text: string) => {
            await fetch("/api/admin/empire/chat", {
                method: "POST",
                body: JSON.stringify({ message: text })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-chat"] });
            setMsg("");
        }
    });

    return (
        <Card className="bg-zinc-950/40 border-white/5 h-[400px] flex flex-col">
            <div className="p-3 border-b border-white/5 bg-white/5 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold uppercase text-zinc-300">Admin Secure Chat</span>
            </div>

            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-3">
                    {messages?.map((m: any) => (
                        <div key={m.id} className="flex flex-col">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xs font-bold text-blue-400">{m.user?.username || "Admin"}</span>
                                <span className="text-[10px] text-zinc-600">{new Date(m.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="bg-white/10 p-2 rounded-tr-lg rounded-bl-lg rounded-br-lg text-xs text-zinc-200 w-fit max-w-[80%]">
                                {m.message}
                            </div>
                        </div>
                    ))}
                </div>
            </ScrollArea>

            <div className="p-2 border-t border-white/5 flex gap-2">
                <Input
                    value={msg}
                    onChange={e => setMsg(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && msg && mutation.mutate(msg)}
                    placeholder="Type message..."
                    className="h-8 text-xs bg-black/20 border-white/10"
                />
                <Button size="icon" className="h-8 w-8" onClick={() => msg && mutation.mutate(msg)}>
                    <Send className="w-3 h-3" />
                </Button>
            </div>
        </Card>
    );
}
