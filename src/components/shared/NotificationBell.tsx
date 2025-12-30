"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface Notification {
    id: string;
    title: string;
    body: string;
    isRead: boolean;
    createdAt: string;
    type: string;
}

export function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const queryClient = useQueryClient();

    // Fetch notifications
    const { data, isLoading } = useQuery({
        queryKey: ["notifications"],
        queryFn: async () => {
            const res = await fetch("/api/member/notifications");
            if (!res.ok) throw new Error("Failed to fetch notifications");
            return res.json() as Promise<{ notifications: Notification[]; unreadCount: number }>;
        },
        refetchInterval: 30000, // Poll every 30s
    });

    // Mark as read mutation
    const markAsRead = useMutation({
        mutationFn: async (notificationIds?: string[]) => {
            await fetch("/api/member/notifications", {
                method: "PUT",
                body: JSON.stringify({ notificationIds }),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    // Mark all read when dropdown opens
    useEffect(() => {
        if (isOpen && data?.unreadCount && data.unreadCount > 0) {
            // Small delay to ensure user sees "unread" state briefly or just mark all
            markAsRead.mutate();
        }
    }, [isOpen, data?.unreadCount, markAsRead]);

    const unreadCount = data?.unreadCount || 0;
    const notifications = data?.notifications || [];

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-600 ring-2 ring-background" />
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Notifications</span>
                    {unreadCount > 0 && <span className="text-xs text-muted-foreground">{unreadCount} unread</span>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                className={cn(
                                    "flex flex-col items-start gap-1 p-3 cursor-pointer",
                                    !notification.isRead && "bg-muted/50"
                                )}
                            >
                                <div className="flex w-full justify-between items-start">
                                    <span className="font-semibold text-sm">{notification.title}</span>
                                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                                        {new Date(notification.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                    {notification.body}
                                </p>
                            </DropdownMenuItem>
                        ))
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
