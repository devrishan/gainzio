"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MessageSquare, CheckCircle2, Clock, User, Send, Loader2, Search, Filter,
    Mail, MailOpen, Archive, AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface Ticket {
    id: string;
    subject: string;
    status: string; // OPEN, ANSWERED, CLOSED
    priority: string;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        username: string | null;
        image: string | null;
    };
    messages: {
        id: string;
        message: string;
        createdAt: string;
    }[];
}

export function AdminSupportDesk() {
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>("ALL");
    const [replyText, setReplyText] = useState("");

    const queryClient = useQueryClient();

    const { data: tickets = [], isLoading } = useQuery({
        queryKey: ["admin-tickets", filterStatus],
        queryFn: async () => {
            const res = await fetch(`/api/admin/support/tickets?status=${filterStatus}`);
            if (!res.ok) throw new Error("Failed to fetch tickets");
            return await res.json() as Ticket[];
        }
    });

    const replyMutation = useMutation({
        mutationFn: async ({ ticketId, message }: { ticketId: string; message: string }) => {
            const res = await fetch(`/api/admin/support/tickets/${ticketId}/reply`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message })
            });
            if (!res.ok) throw new Error("Failed to send reply");
            return await res.json();
        },
        onSuccess: () => {
            toast.success("Reply sent successfully");
            setReplyText("");
            queryClient.invalidateQueries({ queryKey: ["admin-tickets"] });
        },
        onError: () => toast.error("Failed to send reply")
    });

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'OPEN': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'CLOSED': return 'text-zinc-500 bg-zinc-500/10 border-zinc-500/20';
            case 'ANSWERED': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            default: return 'text-zinc-400 bg-zinc-500/10';
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[75vh]">
            {/* Ticket List Sidebar */}
            <div className="lg:col-span-4 flex flex-col gap-4">
                {/* Filter Bar */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/5 p-4 rounded-xl flex flex-col gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                        <Input
                            placeholder="Search tickets..."
                            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-neutral-500 focus-visible:ring-emerald-500/50"
                        />
                    </div>
                    <div className="flex gap-2 w-full">
                        {['ALL', 'OPEN', 'ANSWERED'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={cn(
                                    "flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all border",
                                    filterStatus === status
                                        ? "bg-emerald-500 text-black border-emerald-500"
                                        : "bg-white/5 text-neutral-400 border-white/5 hover:bg-white/10 hover:text-white"
                                )}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tickets List */}
                <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden flex flex-col">
                    <div className="p-3 border-b border-white/5 bg-white/5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-neutral-500 flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            Incoming Transmissions
                        </h3>
                    </div>
                    <ScrollArea className="flex-1">
                        <div className="p-2 space-y-2">
                            {isLoading ? (
                                <div className="p-10 flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-emerald-500" /></div>
                            ) : tickets.length === 0 ? (
                                <div className="p-10 text-center text-neutral-500 text-xs font-mono">No active comms found.</div>
                            ) : (
                                tickets.map(ticket => (
                                    <motion.button
                                        key={ticket.id}
                                        onClick={() => setSelectedTicketId(ticket.id)}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className={cn(
                                            "w-full text-left p-4 rounded-xl transition-all border relative overflow-hidden group",
                                            selectedTicketId === ticket.id
                                                ? "bg-emerald-500/10 border-emerald-500/30 shadow-[0_0_20px_-10px_rgba(16,185,129,0.3)]"
                                                : "bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2 relative z-10">
                                            <div className="flex items-center gap-2">
                                                {ticket.status === 'OPEN' && <span className="absolute -left-1 top-4 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />}
                                                <h4 className={cn("font-bold text-sm truncate max-w-[180px]", selectedTicketId === ticket.id ? "text-white" : "text-neutral-300 group-hover:text-white")}>
                                                    {ticket.subject}
                                                </h4>
                                            </div>
                                            <span className="text-[10px] font-mono text-neutral-500">{format(new Date(ticket.updatedAt), 'MMM d')}</span>
                                        </div>

                                        <div className="flex items-center justify-between relative z-10">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-5 w-5 border border-white/10">
                                                    <AvatarFallback className="text-[8px] bg-black text-neutral-400">{ticket.user.username?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-neutral-500 font-medium group-hover:text-neutral-400">{ticket.user.username || 'Unknown Operator'}</span>
                                            </div>
                                            <Badge variant="outline" className={cn("text-[9px] h-5 border-0", getStatusColor(ticket.status))}>
                                                {ticket.status}
                                            </Badge>
                                        </div>
                                    </motion.button>
                                ))
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>

            {/* Conversation View */}
            <div className="lg:col-span-8 bg-black/40 backdrop-blur-xl border border-white/5 rounded-xl overflow-hidden flex flex-col relative">
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

                {selectedTicket ? (
                    <>
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02] relative z-10">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="font-black text-xl text-white tracking-tight">{selectedTicket.subject}</h2>
                                    <Badge variant="outline" className={cn("border px-2 py-0.5 text-[10px]", getStatusColor(selectedTicket.status))}>
                                        {selectedTicket.status}
                                    </Badge>
                                </div>
                                <p className="text-xs font-mono text-neutral-500 uppercase tracking-widest">ID: {selectedTicket.id}</p>
                            </div>

                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" className="h-8 text-xs border-white/10 bg-black hover:bg-white/5 hover:text-white">
                                    <Archive className="w-3.5 h-3.5 mr-2" />
                                    Archive
                                </Button>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6 relative z-10">
                            <div className="space-y-8 max-w-3xl mx-auto">
                                <div className="flex gap-4 group">
                                    <Avatar className="h-10 w-10 border-2 border-white/10 group-hover:border-emerald-500/50 transition-colors">
                                        <AvatarImage src={selectedTicket.user.image || ""} />
                                        <AvatarFallback className="bg-neutral-900 text-neutral-400 font-bold">{selectedTicket.user.username?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-baseline justify-between">
                                            <span className="font-bold text-sm text-emerald-400">{selectedTicket.user.username}</span>
                                            <span className="text-[10px] text-neutral-600 font-mono">{format(new Date(selectedTicket.createdAt), 'PP p')}</span>
                                        </div>
                                        <div className="p-4 rounded-2xl rounded-tl-sm bg-white/5 border border-white/5 text-sm text-neutral-300 leading-relaxed shadow-lg backdrop-blur-sm">
                                            {selectedTicket.messages[0]?.message || <span className="italic text-neutral-600">No content transmission...</span>}
                                        </div>
                                    </div>
                                </div>

                                {selectedTicket.messages.length > 1 && (
                                    <div className="relative py-4">
                                        <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                                        <span className="relative z-10 block w-fit mx-auto px-3 py-1 bg-black/50 backdrop-blur text-[10px] font-mono text-neutral-500 rounded-full border border-white/5">
                                            History Truncated
                                        </span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-6 bg-black/60 border-t border-white/5 backdrop-blur-xl relative z-20">
                            <div className="max-w-3xl mx-auto space-y-4">
                                <Textarea
                                    placeholder="Type your response transmission..."
                                    className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-neutral-600 focus-visible:ring-emerald-500/50 focus-visible:border-emerald-500/50 resize-none rounded-xl"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <div className="flex justify-end">
                                    <Button
                                        className="bg-emerald-500 text-black hover:bg-emerald-400 font-bold tracking-wide"
                                        onClick={() => replyMutation.mutate({ ticketId: selectedTicket.id, message: replyText })}
                                        disabled={replyMutation.isPending || !replyText.trim()}
                                    >
                                        {replyMutation.isPending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Transmission
                                                <Send className="w-4 h-4 ml-2" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-600 space-y-6">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                            <MessageSquare className="h-10 w-10 opacity-20" />
                        </div>
                        <div className="text-center space-y-1">
                            <h3 className="text-lg font-bold text-neutral-400">Comms Offline</h3>
                            <p className="text-xs uppercase tracking-widest opacity-50">Select a frequency to begin transmission</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

