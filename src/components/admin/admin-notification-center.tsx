"use client";

import { useState } from "react";
import { Send, BellRing, Users, Loader2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export function AdminNotificationCenter() {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        body: "",
        target: "ALL",
        type: "INFO"
    });

    const handleSend = async () => {
        if (!formData.title || !formData.body) {
            toast.error("Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/admin/notifications/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error("Failed to send");

            toast.success(`Broadcast sent to ${data.count} users`);
            setFormData({ ...formData, title: "", body: "" });
        } catch (error) {
            toast.error("Failed to broadcast message");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-background to-background">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-blue-400">
                    <BellRing className="h-5 w-5" />
                    Broadcast Center
                </CardTitle>
                <CardDescription>
                    Send system-wide notifications to user dashboards.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid gap-2">
                    <Label htmlFor="title">Notification Title</Label>
                    <Input
                        id="title"
                        placeholder="e.g. Scheduled Maintenance"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="bg-background/50"
                    />
                </div>

                <div className="grid gap-2">
                    <Label htmlFor="body">Message Body</Label>
                    <Textarea
                        id="body"
                        placeholder="Enter the full message content here..."
                        value={formData.body}
                        onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                        className="min-h-[100px] bg-background/50"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                        <Label>Target Audience</Label>
                        <Select
                            value={formData.target}
                            onValueChange={(val) => setFormData({ ...formData, target: val })}
                        >
                            <SelectTrigger className="bg-background/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">All Users</SelectItem>
                                <SelectItem value="PAID_MEMBERS">Paid Members Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label>Alert Type</Label>
                        <Select
                            value={formData.type}
                            onValueChange={(val) => setFormData({ ...formData, type: val })}
                        >
                            <SelectTrigger className="bg-background/50">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="INFO">Information (Blue)</SelectItem>
                                <SelectItem value="SUCCESS">Success (Green)</SelectItem>
                                <SelectItem value="WARNING">Warning (Orange)</SelectItem>
                                <SelectItem value="ERROR">Critical (Red)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="pt-2">
                    <Button
                        onClick={handleSend}
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                        {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="mr-2 h-4 w-4" />
                        )}
                        Broadcast Message
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
