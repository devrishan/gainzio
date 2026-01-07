"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageCircle, CheckCircle, XCircle, Send, User, Shield, Coins, Wallet, Award, Users, AlertTriangle } from "lucide-react";
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
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
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

    const activeTicket = tickets?.find((t: any) => t.id === selectedTicketId);

    // Mock User Data fallback if real fetch fails
    const user = activeTicket?.user || {};

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[700px]">
            {/* 1. Ticket List (Left) */}
            <Card className="bg-zinc-950/40 border-white/5 flex flex-col pt-4 col-span-1">
                <div className="px-4 pb-4 border-b border-white/5 flex justify-between items-center">
                    <h3 className="font-bold text-xs text-zinc-400 uppercase tracking-widest">Open Tickets</h3>
                    <Badge variant="outline" className="text-zinc-500">{tickets?.length || 0}</Badge>
                </div>
                <ScrollArea className="flex-1">
                    <div className="divide-y divide-white/5">
                        {tickets?.map((t: any) => (
                            <button
                                key={t.id}
                                onClick={() => setSelectedTicketId(t.id)}
                                className={`w-full text-left p-4 hover:bg-white/5 transition-colors ${selectedTicketId === t.id ? 'bg-white/10 border-l-2 border-indigo-500' : 'border-l-2 border-transparent'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <Badge variant={t.status === 'CLOSED' ? 'secondary' : 'default'} className="text-[10px] h-5 px-1.5">
                                        {t.status || 'OPEN'}
                                    </Badge>
                                    <span className="text-[10px] text-zinc-600">{formatDistanceToNow(new Date(t.createdAt), { addSuffix: true })}</span>
                                </div>
                                <h4 className="text-sm font-semibold text-white mb-1 truncate">{t.subject || "Support Request"}</h4>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[8px] text-white">
                                        {t.user?.username?.[0] || 'U'}
                                    </div>
                                    <span className="text-xs text-zinc-400 truncate">{t.user?.username || "User"}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </Card>

            {/* 2. Chat Layout (Center + Right) */}
            <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">

                {/* Chat Window (Center - Takes 2 cols) */}
                <Card className="lg:col-span-2 bg-zinc-950/40 border-white/5 flex flex-col overflow-hidden">
                    {activeTicket ? (
                        <>
                            <div className="p-4 border-b border-white/5 bg-white/5 flex justify-between items-center">
                                <div>
                                    <h2 className="font-bold text-lg text-white">{activeTicket.subject || "No Subject"}</h2>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <span>Ticket ID: {activeTicket.id.slice(0, 8)}</span>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {activeTicket.status !== 'CLOSED' && (
                                        <Button size="sm" variant="destructive" className="h-8" onClick={() => replyMutation.mutate({ id: activeTicket.id, status: 'CLOSED' })}>
                                            <CheckCircle className="w-3 h-3 mr-2" /> Close
                                        </Button>
                                    )}
                                </div>
                            </div>

                            <ScrollArea className="flex-1 p-4 bg-black/20">
                                <div className="space-y-6">
                                    {/* Original Message */}
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center border border-white/10 shrink-0">
                                            <User className="w-4 h-4 text-zinc-400" />
                                        </div>
                                        <div className="bg-zinc-900 border border-white/10 p-4 rounded-2xl rounded-tl-none max-w-[85%]">
                                            <p className="text-sm text-zinc-300 whitespace-pre-wrap">{activeTicket.message}</p>
                                        </div>
                                    </div>

                                    {/* Replies */}
                                    {activeTicket.replies?.map((r: any, i: number) => (
                                        <div key={i} className={`flex gap-3 ${r.sender === 'ADMIN' ? 'flex-row-reverse' : ''}`}>
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border border-white/10 shrink-0 ${r.sender === 'ADMIN' ? 'bg-indigo-600' : 'bg-zinc-800'}`}>
                                                <span className="text-xs font-bold text-white">{r.sender === 'ADMIN' ? 'A' : 'U'}</span>
                                            </div>
                                            <div className={`p-4 rounded-2xl max-w-[85%] ${r.sender === 'ADMIN' ? 'bg-indigo-600/20 border border-indigo-500/30 text-indigo-100 rounded-tr-none' : 'bg-zinc-900 border border-white/10 text-zinc-300 rounded-tl-none'}`}>
                                                <p className="text-sm">{r.message}</p>
                                                <div className="text-[10px] opacity-50 mt-1 text-right">{formatDistanceToNow(new Date(r.at), { addSuffix: true })}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>

                            <div className="p-4 border-t border-white/5 bg-zinc-900/50">
                                <div className="flex gap-2">
                                    <Input
                                        value={replyMsg}
                                        onChange={e => setReplyMsg(e.target.value)}
                                        placeholder="Type your reply..."
                                        className="bg-black/40 border-white/10 text-white"
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
                            <MessageCircle className="w-16 h-16 mb-4 opacity-20" />
                            <p>Select a ticket</p>
                        </div>
                    )}
                </Card>

                {/* 3. The Concierge (Right - CRM) */}
                <Card className="col-span-1 bg-zinc-950/40 border-white/5 p-0 flex flex-col h-full overflow-hidden">
                    <div className="p-4 border-b border-white/5 bg-white/5">
                        <h3 className="font-bold text-xs text-white uppercase tracking-widest flex items-center gap-2">
                            <Shield className="w-3 h-3 text-emerald-400" /> Concierge
                        </h3>
                    </div>
                    {activeTicket && user ? (
                        <div className="p-6 space-y-6">
                            {/* Profile */}
                            <div className="text-center">
                                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto mb-3 flex items-center justify-center text-xl font-bold text-white shadow-lg shadow-indigo-500/20">
                                    {user.username?.[0] || '?'}
                                </div>
                                <h3 className="font-bold text-white text-lg">{user.username || "Guest"}</h3>
                                <div className="text-xs text-zinc-500 mb-2">{user.email || "No Email"}</div>
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                    {user.gamification?.rank || "NEWBIE"}
                                </Badge>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
                                    <div className="flex items-center gap-2 text-zinc-400 text-[10px] mb-1">
                                        <Wallet className="w-3 h-3" /> Balance
                                    </div>
                                    <div className="font-mono text-zinc-100 font-bold">₹{user.wallet?.balance || "0.00"}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
                                    <div className="flex items-center gap-2 text-zinc-400 text-[10px] mb-1">
                                        <Coins className="w-3 h-3" /> Coins
                                    </div>
                                    <div className="font-mono text-amber-400 font-bold">{user.wallet?.coins || "0"}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
                                    <div className="flex items-center gap-2 text-zinc-400 text-[10px] mb-1">
                                        <Users className="w-3 h-3" /> Refs
                                    </div>
                                    <div className="font-mono text-zinc-100 font-bold">{user._count?.referrals || 0}</div>
                                </div>
                                <div className="p-3 rounded-lg bg-zinc-900/50 border border-white/5">
                                    <div className="flex items-center gap-2 text-zinc-400 text-[10px] mb-1">
                                        <AlertTriangle className="w-3 h-3" /> Risk
                                    </div>
                                    <div className="font-mono text-emerald-400 font-bold">LOW</div>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="space-y-3">
                                <div className="text-[10px] font-bold text-zinc-500 uppercase">Quick Actions</div>
                                <Button className="w-full justify-start text-xs bg-white/5 hover:bg-white/10" variant="ghost">
                                    <Coins className="w-3 h-3 mr-2 text-amber-400" /> Send 100 Coins Bonus
                                </Button>
                                <Button className="w-full justify-start text-xs bg-white/5 hover:bg-white/10" variant="ghost">
                                    <Award className="w-3 h-3 mr-2 text-purple-400" /> Grant 'Patient' Badge
                                </Button>
                                <Button className="w-full justify-start text-xs bg-red-500/10 hover:bg-red-500/20 text-red-500" variant="ghost">
                                    <AlertTriangle className="w-3 h-3 mr-2" /> Flag Account
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="p-6 text-center text-zinc-500 text-sm">
                            Select a ticket to view user profile.
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
