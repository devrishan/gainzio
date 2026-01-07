"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, History, BellRing, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/components/ui/sonner";
import { Badge } from "@/components/ui/badge";

interface Notification {
    id: string;
    userId: string;
    user: {
        username: string | null;
        email: string | null;
    };
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
}

export function AdminNotificationsClient() {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        userId: "",
        title: "",
        message: "",
    });

    const { data: notifications = [], isLoading } = useQuery<Notification[]>({
        queryKey: ["admin-notifications"],
        queryFn: async () => {
            const res = await fetch("/api/admin/notifications");
            const data = await res.json();
            return data.notifications || [];
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: typeof formData) => {
            const res = await fetch("/api/admin/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            const result = await res.json();
            if (!res.ok || !result.success) throw new Error(result.error || "Failed to send");
            return result;
        },
        onSuccess: () => {
            toast.success("Notification sent successfully");
            setFormData({ userId: "", title: "", message: "" });
            queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
        },
        onError: (err: Error) => {
            toast.error("Failed to send", { description: err.message });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <History className="h-5 w-5 text-zinc-400" />
                    <h2 className="text-lg font-semibold tracking-tight">Recent History</h2>
                </div>

                <Card className="border-white/5 bg-zinc-950/40 backdrop-blur-md overflow-hidden">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="hover:bg-transparent border-white/5">
                                <TableHead>Target User</TableHead>
                                <TableHead>Message</TableHead>
                                <TableHead className="text-right">Sent At</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                                    </TableCell>
                                </TableRow>
                            ) : notifications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                        No notifications sent recently.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                notifications.map((notif) => (
                                    <TableRow key={notif.id} className="border-white/5 hover:bg-white/5">
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-xs">{notif.user?.username || notif.userId}</span>
                                                <span className="text-[10px] text-muted-foreground">{notif.user?.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <span className="font-bold text-xs">{notif.title}</span>
                                                <span className="text-xs text-muted-foreground line-clamp-1">{notif.body}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-muted-foreground">
                                            {new Date(notif.createdAt).toLocaleDateString()}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <BellRing className="h-5 w-5 text-zinc-400" />
                    <h2 className="text-lg font-semibold tracking-tight">Compose Alert</h2>
                </div>

                <Card className="p-6 border-white/5 bg-zinc-950/40 backdrop-blur-md">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="userId">Target User ID</Label>
                            <Input
                                id="userId"
                                placeholder="e.g. clq3..."
                                value={formData.userId}
                                onChange={(e) => setFormData(p => ({ ...p, userId: e.target.value }))}
                                required
                                className="bg-zinc-900/50 border-white/10"
                            />
                            <p className="text-[10px] text-muted-foreground">Paste exact User ID. 'ALL' broadcast not supported yet.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="Important Update"
                                value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                required
                                className="bg-zinc-900/50 border-white/10"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="message">Message Body</Label>
                            <Textarea
                                id="message"
                                placeholder="Type your message here..."
                                rows={4}
                                value={formData.message}
                                onChange={(e) => setFormData(p => ({ ...p, message: e.target.value }))}
                                required
                                className="bg-zinc-900/50 border-white/10 resize-none"
                            />
                        </div>

                        <Button type="submit" className="w-full" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
                            Send Notification
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    );
}
