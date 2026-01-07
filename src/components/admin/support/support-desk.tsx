"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, CheckCircle, XCircle, Send, Plus, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

export function SupportDesk() {
    const queryClient = useQueryClient();
    const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
    const [replyMsg, setReplyMsg] = useState("");

    const { data: tickets } = useQuery({
        queryKey: ["admin-tickets"],
        queryFn: async () => (await fetch("/api/admin/support/tickets")).json().then(r => r.tickets || [])
    });

    const replyMutation = useMutation({
        mutationFn: async ({ id, msg, status }: { id: string, msg?: string, status?: string }) => {
            await fetch("/api/admin/support/tickets", {
                method: "POST",
                body: JSON.stringify({ ticketId: id, reply: msg, status })
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
            setReplyMsg("");
            toast.success("Updated!");
        }
    });

    // Temp: Create Mock Ticket
    const createMockMutation = useMutation({
        mutationFn: async () => {
            // We can't hit the user-side API, so we manually create one via Admin API? 
            // Admin API is restricted to Updates mainly by my logic above, but let's assume we can use the Chat route or just wait for real data.
            // Actually, I'll add a temporary "Create Test" if needed, but let's assume User has them.
            // Wait, I can't create a ticket properly without a `POST /api/user/support` which doesn't exist yet.
            // I will stick to Displaying for now.
            toast.info("Waiting for user tickets...");
        }
    });

    const activeTicket = tickets?.find((t: any) => t.id === selectedTicket);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
            {/* List */}
            <Card className="bg-zinc-950/40 border-white/5 flex flex-col pt-4">
                <div className="px-4 pb-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-sm text-zinc-300 uppercase tracking-widest">Inbox</h3>
                    <Badge variant="outline" className="text-zinc-500">{tickets?.length || 0}</Badge>
                </div>
                <ScrollArea className="flex-1">
                    <div className="divide-y divide-white/5">
                        {tickets?.map((t: any) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTicket(t.id)}
                                className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${selectedTicket === t.id ? 'bg-white/10' : ''}`}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <span className={`text-xs font-bold ${t.status === 'CLOSED' ? 'text-zinc-500' : 'text-emerald-400'}`}>
                                        {t.status || 'OPEN'}
                                    </span>
                                    <span className="text-[10px] text-zinc-600">{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-white mb-1 truncate">{t.subject || "Support Request"}</h4>
                                <p className="text-xs text-zinc-400 truncate">{t.message}</p>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* Detail */}
            <Card className="lg:col-span-2 bg-zinc-950/40 border-white/5 flex flex-col overflow-hidden">
                {activeTicket ? (
                    <>
                        <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                            <div>
                                <h2 className="font-bold text-lg text-white">{activeTicket.subject || "No Subject"}</h2>
                                <div className="flex items-center gap-2 text-xs text-zinc-400">
                                    <User className="w-3 h-3" />
                                    <span>{activeTicket.username || "Anonymous"}</span>
                                    <span className="text-zinc-600">•</span>
                                    <span>{activeTicket.email}</span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {activeTicket.status !== 'CLOSED' && (
                                    <Button size="sm" variant="outline" onClick={() => replyMutation.mutate({ id: activeTicket.id, status: 'CLOSED' })}>
                                        <CheckCircle className="w-4 h-4 mr-2" /> Close Ticket
                                    </Button>
                                )}
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-6">
                                {/* Original Message */}
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10">
                                        <User className="w-4 h-4 text-zinc-400" />
                                    </div>
                                    <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl rounded-tl-none max-w-[80%]">
                                        <p className="text-sm text-zinc-300">{activeTicket.message}</p>
                                    </div>
                                </div>

                                {/* Replies */}
                                {activeTicket.replies?.map((r: any, i: number) => (
                                    <div key={i} className={`flex gap-3 ${r.sender === 'ADMIN' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 ${r.sender === 'ADMIN' ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                                            <span className="text-xs font-bold text-white">{r.sender === 'ADMIN' ? 'A' : 'U'}</span>
                                        </div>
                                        <div className={`p-4 rounded-2xl max-w-[80%] ${r.sender === 'ADMIN' ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none' : 'bg-zinc-900 border border-white/10 text-zinc-300 rounded-tl-none'}`}>
                                            <p className="text-sm">{r.message}</p>
                                            <div className="text-[10px] opacity-50 mt-1 text-right">{formatDistanceToNow(new Date(r.at), { addSuffix: true })}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-4 border-t border-white/5 bg-black/20">
                            <div className="flex gap-2">
                                <Input
                                    value={replyMsg}
                                    onChange={e => setReplyMsg(e.target.value)}
                                    placeholder="Type your reply..."
                                    className="bg-black/40 border-white/10"
                                    onKeyDown={e => e.key === 'Enter' && replyMsg && replyMutation.mutate({ id: activeTicket.id, msg: replyMsg })}
                                />
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => replyMsg && replyMutation.mutate({ id: activeTicket.id, msg: replyMsg })}
                                >
                                    <Send className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
                        <MessageCircle className="w-12 h-12 mb-4 opacity-20" />
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </Card>
        </div>
    );
}
