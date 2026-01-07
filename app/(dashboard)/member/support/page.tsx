
"use client";

import { useEffect, useState } from "react";
import { Plus, MessageSquare, Loader2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface Ticket {
    id: string;
    createdAt: string;
    message: string;
    data: {
        subject: string;
        status: string;
        priority: string;
        replies: any[];
    };
}

export default function SupportDashboard() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Form state
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const { toast } = useToast();
    const router = useRouter();

    const fetchTickets = async () => {
        try {
            const res = await fetch("/api/member/support");
            const data = await res.json();
            if (data.tickets) {
                setTickets(data.tickets);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!subject || !message) return;

        setIsCreating(true);
        try {
            const res = await fetch("/api/member/support", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ subject, message }),
            });
            const data = await res.json();

            if (data.success) {
                toast({
                    title: "Ticket Created",
                    description: "We have received your support request.",
                });
                setIsOpen(false);
                setSubject("");
                setMessage("");
                fetchTickets(); // Refresh list
            } else {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: data.error || "Failed to create ticket",
                });
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Something went wrong",
            });
        } finally {
            setIsCreating(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case "OPEN": return "secondary"; // Blue-ish or default
            case "CLOSED": return "outline"; // Grey
            case "RESOLVED": return "default"; // Green usually (if default is primary)
            case "PENDING": return "secondary"; // Yellow-ish?
            default: return "secondary";
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Support Desk</h1>
                    <p className="text-muted-foreground">
                        View your support tickets or start a new conversation.
                    </p>
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            New Ticket
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <form onSubmit={handleCreateTicket}>
                            <DialogHeader>
                                <DialogTitle>Create Support Ticket</DialogTitle>
                                <DialogDescription>
                                    Describe your issue in detail so we can help you faster.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="subject">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="e.g., Withdrawal Issue"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea
                                        id="message"
                                        placeholder="Describe what happened..."
                                        className="min-h-[100px]"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isCreating}>
                                    {isCreating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Submit Ticket
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : tickets.length === 0 ? (
                <Card className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-4 opacity-50" />
                    <h3 className="text-lg font-medium">No tickets yet</h3>
                    <p className="mb-4">You haven't created any support tickets.</p>
                    <Button variant="outline" onClick={() => setIsOpen(true)}>Create your first ticket</Button>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {tickets.map((ticket) => (
                        <Link href={`/member/support/${ticket.id}`} key={ticket.id}>
                            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                                <CardHeader className="p-4 sm:p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <CardTitle className="text-base sm:text-lg">
                                                    {ticket.data?.subject || "No Subject"}
                                                </CardTitle>
                                                <Badge variant={getStatusColor(ticket.data?.status) as any}>
                                                    {ticket.data?.status || "OPEN"}
                                                </Badge>
                                            </div>
                                            <CardDescription className="line-clamp-1">
                                                {ticket.message || "No preview available"}
                                            </CardDescription>
                                        </div>
                                        <div className="text-xs text-muted-foreground whitespace-nowrap">
                                            {formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </CardHeader>
                            </Card>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
