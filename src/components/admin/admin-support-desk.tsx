"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    MessageSquare, CheckCircle2, Clock, User, Send, Loader2, Search, Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
            // In a real app we would also fetch the specific ticket's new messages or update cache
        },
        onError: () => toast.error("Failed to send reply")
    });

    const selectedTicket = tickets.find(t => t.id === selectedTicketId);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* Ticket List */}
            <div className="md:col-span-1 rounded-xl border border-white/5 bg-zinc-950/40 backdrop-blur-md flex flex-col overflow-hidden">
                <div className="p-4 border-b border-white/5 space-y-3">
                    <h3 className="font-bold text-zinc-400 uppercase tracking-wider text-xs">Inbox</h3>
                    <div className="flex gap-2">
                        <Button
                            variant={filterStatus === 'ALL' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterStatus('ALL')}
                            className="text-xs"
                        >
                            All
                        </Button>
                        <Button
                            variant={filterStatus === 'OPEN' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterStatus('OPEN')}
                            className="text-xs"
                        >
                            Open
                        </Button>
                        <Button
                            variant={filterStatus === 'ANSWERED' ? 'secondary' : 'ghost'}
                            size="sm"
                            onClick={() => setFilterStatus('ANSWERED')}
                            className="text-xs"
                        >
                            Answered
                        </Button>
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="flex flex-col p-2 gap-2">
                        {isLoading ? (
                            <div className="p-8 text-center"><Loader2 className="animate-spin h-6 w-6 mx-auto text-zinc-600" /></div>
                        ) : tickets.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500 text-sm">No tickets found.</div>
                        ) : (
                            tickets.map(ticket => (
                                <button
                                    key={ticket.id}
                                    onClick={() => setSelectedTicketId(ticket.id)}
                                    className={`text-left p-3 rounded-lg transition-all border ${selectedTicketId === ticket.id
                                            ? "bg-blue-500/10 border-blue-500/30 ring-1 ring-blue-500/20"
                                            : "bg-white/5 border-transparent hover:bg-white/10"
                                        }`}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="flex items-center gap-2">
                                            {ticket.status === 'OPEN' && <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />}
                                            <span className="font-semibold text-sm text-zinc-200 truncate max-w-[120px]">
                                                {ticket.subject}
                                            </span>
                                        </div>
                                        <span className="text-[10px] text-zinc-500">{format(new Date(ticket.updatedAt), 'MMM d')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                                        <Avatar className="h-4 w-4">
                                            <AvatarFallback className="text-[8px]">{ticket.user.username?.[0] || 'U'}</AvatarFallback>
                                        </Avatar>
                                        <span>{ticket.user.username || 'User'}</span>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Conversation View */}
            <div className="md:col-span-2 rounded-xl border border-white/5 bg-zinc-950/40 backdrop-blur-md flex flex-col overflow-hidden relative">
                {selectedTicket ? (
                    <>
                        <div className="p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
                            <div>
                                <h2 className="font-bold text-lg text-white">{selectedTicket.subject}</h2>
                                <div className="flex items-center gap-2 text-xs text-zinc-400 mt-1">
                                    <Badge variant="outline" className={
                                        selectedTicket.status === 'OPEN' ? 'border-emerald-500/30 text-emerald-400' :
                                            selectedTicket.status === 'CLOSED' ? 'border-zinc-700 text-zinc-500' : 'border-blue-500/30 text-blue-400'
                                    }>
                                        {selectedTicket.status}
                                    </Badge>
                                    <span>Ticket #{selectedTicket.id.slice(-4)}</span>
                                </div>
                            </div>
                        </div>

                        <ScrollArea className="flex-1 p-6">
                            <div className="space-y-6">
                                {/* Initial request as the first message */}
                                <div className="flex gap-3">
                                    <Avatar>
                                        <AvatarImage src={selectedTicket.user.image || ""} />
                                        <AvatarFallback>{selectedTicket.user.username?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-sm text-zinc-200">{selectedTicket.user.username}</span>
                                            <span className="text-xs text-zinc-500">{format(new Date(selectedTicket.createdAt), 'PP p')}</span>
                                        </div>
                                        <div className="p-3 rounded-r-xl rounded-bl-xl bg-zinc-800/50 text-sm text-zinc-300 leading-relaxed max-w-lg">
                                            {/* We fetch messages separately effectively, but for now showing the initial message if stored or from messages array */}
                                            {selectedTicket.messages[0]?.message || "(No content)"}
                                        </div>
                                    </div>
                                </div>

                                {/* Placeholder for conversation history (would require a messages sub-query in a real complete implementation) */}
                                {selectedTicket.messages.length > 1 && (
                                    <div className="text-center text-xs text-zinc-600 my-4 italic">
                                        Load more messages... (Demo limitation: showing simplified history)
                                    </div>
                                )}
                            </div>
                        </ScrollArea>

                        <div className="p-4 bg-zinc-900/50 border-t border-white/5">
                            <div className="flex gap-2">
                                <Textarea
                                    placeholder="Type your reply..."
                                    className="min-h-[80px] bg-zinc-950 border-zinc-800 focus-visible:ring-blue-500/50 resize-none"
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                />
                                <Button
                                    className="h-[80px] w-[80px] bg-blue-600 hover:bg-blue-700"
                                    onClick={() => replyMutation.mutate({ ticketId: selectedTicket.id, message: replyText })}
                                    disabled={replyMutation.isPending || !replyText.trim()}
                                >
                                    {replyMutation.isPending ? <Loader2 className="animate-spin" /> : <Send className="h-5 w-5" />}
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-4">
                        <MessageSquare className="h-12 w-12 opacity-20" />
                        <p>Select a ticket to view conversation</p>
                    </div>
                )}
            </div>
        </div>
    );
}
