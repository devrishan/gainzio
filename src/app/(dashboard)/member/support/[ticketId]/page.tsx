
"use client";

import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Send, ArrowLeft, Loader2, User, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Reply {
    sender: "USER" | "ADMIN";
    name: string;
    message: string;
    at: string;
}

interface Ticket {
    id: string;
    createdAt: string;
    message: string;
    data: {
        subject: string;
        description: string;
        status: string;
        replies: Reply[];
    };
}

export default function TicketDetailPage({ params }: { params: { ticketId: string } }) {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [reply, setReply] = useState("");
    const [isSending, setIsSending] = useState(false);

    const { toast } = useToast();
    const bottomRef = useRef<HTMLDivElement>(null);

    const fetchTicket = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/member/support/${params.ticketId}`);
            const data = await res.json();
            if (data.ticket) {
                setTicket(data.ticket);
            } else if (data.error) {
                toast({ variant: "destructive", title: "Error", description: data.error });
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [params.ticketId, toast]);

    useEffect(() => {
        fetchTicket();
    }, [fetchTicket]);

    // Scroll to bottom on load/update
    useEffect(() => {
        if (ticket) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ticket?.data.replies, ticket]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim()) return;

        setIsSending(true);
        try {
            const res = await fetch(`/api/member/support/${params.ticketId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: reply }),
            });
            const data = await res.json();
            if (data.success) {
                setReply("");
                fetchTicket();
            } else {
                toast({ variant: "destructive", title: "Error", description: data.error });
            }
        } catch (error) {
            toast({ variant: "destructive", title: "Error", description: "Failed to send reply" });
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <h3 className="text-xl font-bold">Ticket Not Found</h3>
                <Link href="/member/support" className="mt-4 underline">Back to Support</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] max-h-[800px]">
            {/* Header */}
            <div className="flex items-center gap-4 border-b pb-4 mb-4">
                <Link href="/member/support">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-xl font-bold line-clamp-1">{ticket.data.subject}</h1>
                        <Badge variant={ticket.data.status === 'OPEN' ? 'secondary' : 'outline'}>
                            {ticket.data.status}
                        </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                        Ticket ID: {ticket.id} • Created {format(new Date(ticket.createdAt), "PPP")}
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                {/* Original Message */}
                <div className="flex gap-3">
                    <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">You</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(ticket.createdAt), "p")}</span>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg text-sm whitespace-pre-wrap">
                            {ticket.data.description || ticket.message}
                        </div>
                    </div>
                </div>

                {/* Replies */}
                {ticket.data.replies?.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.sender === "USER" ? "flex-row-reverse" : ""}`}>
                        <Avatar className="h-8 w-8 mt-1">
                            {msg.sender === "ADMIN" ? (
                                <>
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        <ShieldCheck className="h-4 w-4" />
                                    </AvatarFallback>
                                </>
                            ) : (
                                <AvatarFallback><User className="h-4 w-4" /></AvatarFallback>
                            )}
                        </Avatar>
                        <div className={`flex-1 space-y-1 ${msg.sender === "USER" ? "text-right" : ""}`}>
                            <div className={`flex items-center gap-2 ${msg.sender === "USER" ? "justify-end" : ""}`}>
                                <span className="font-semibold text-sm">{msg.name}</span>
                                <span className="text-xs text-muted-foreground">
                                    {msg.at ? format(new Date(msg.at), "p") : ""}
                                </span>
                            </div>
                            <div className={`inline-block p-3 rounded-lg text-sm whitespace-pre-wrap text-left ${msg.sender === "USER"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted"
                                }`}>
                                {msg.message}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            <div className="pt-2">
                <form onSubmit={handleSendReply} className="flex gap-2">
                    <Input
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply..."
                        disabled={isSending || ticket.data.status === 'CLOSED'}
                        className="flex-1"
                    />
                    <Button type="submit" disabled={isSending || !reply.trim() || ticket.data.status === 'CLOSED'}>
                        {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    </Button>
                </form>
                {ticket.data.status === 'CLOSED' && (
                    <p className="text-xs text-center text-muted-foreground mt-2">
                        This ticket is closed. You can no longer reply.
                    </p>
                )}
            </div>
        </div>
    );
}
