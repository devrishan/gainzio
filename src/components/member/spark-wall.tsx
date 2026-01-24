"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Zap, Trophy, Coins, UserPlus, ArrowUpRight } from "lucide-react";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { motion, AnimatePresence } from "framer-motion";

interface SparkEvent {
    id: string;
    type: string;
    message: string;
    createdAt: string;
    data: any;
}

async function fetchSparkEvents() {
    const res = await fetch("/api/member/spark-wall");
    if (!res.ok) throw new Error("Failed to fetch events");
    return (await res.json()).events as SparkEvent[];
}

function getEventIcon(type: string) {
    switch (type) {
        case 'TASK_APPROVED':
            return <Coins className="h-4 w-4 text-yellow-500" />;
        case 'RANK_UPGRADE':
            return <Trophy className="h-4 w-4 text-purple-500" />;
        case 'REFERRAL_VERIFIED':
            return <UserPlus className="h-4 w-4 text-green-500" />;
        case 'WITHDRAWAL_COMPLETED':
            return <ArrowUpRight className="h-4 w-4 text-blue-500" />;
        case 'REWARD':
            return <Zap className="h-4 w-4 text-amber-500" />;
        default:
            return <Zap className="h-4 w-4 text-gray-400" />;
    }
}

export function SparkWall() {
    const { data: events, isLoading } = useQuery({
        queryKey: ["spark-wall"],
        queryFn: fetchSparkEvents,
        refetchInterval: 30000, // Refresh every 30s
    });

    if (isLoading) {
        return <LoadingSkeleton className="h-[300px]" />;
    }

    return (
        <Card className="h-full flex flex-col border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="h-5 w-5 text-amber-500 fill-amber-500" />
                    Spark Wall
                    <span className="text-xs font-normal text-muted-foreground ml-auto flex items-center gap-1">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 p-0">
                <ScrollArea className="h-[350px]">
                    <div className="p-4 space-y-4">
                        {events && events.length > 0 ? (
                            <AnimatePresence initial={false}>
                                {events.map((event, index) => (
                                    <motion.div
                                        key={event.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="flex items-start gap-3 text-sm pb-3 border-b border-border/50 last:border-0 last:pb-0"
                                    >
                                        <div className="mt-0.5 p-1.5 rounded-full bg-accent/50 shrink-0">
                                            {getEventIcon(event.type)}
                                        </div>
                                        <div className="flex-1 space-y-1">
                                            <p className="leading-snug text-foreground/90 font-medium">
                                                {event.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        ) : (
                            <div className="text-center py-10 text-muted-foreground text-sm">
                                No active sparks yet. Be the first!
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
